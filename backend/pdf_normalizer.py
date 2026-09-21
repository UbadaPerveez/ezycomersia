import io
import json
import os
from typing import Optional, List, Dict, Any

from dotenv import load_dotenv
from fastapi import APIRouter, File, UploadFile, HTTPException, Header
from pydantic import BaseModel
from pypdf import PdfReader
from google import genai
from jose import jwt, JWTError

from auth import get_db, SECRET_KEY, ALGORITHM

load_dotenv()

router = APIRouter(prefix="/api/pdf", tags=["PDF Normalizer"])

# ---------------------------------------------------------
# AI Client Configuration
# ---------------------------------------------------------
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise RuntimeError("GEMINI_API_KEY is not configured in backend/.env")

gemini_client = genai.Client(api_key=GEMINI_API_KEY)
AI_MODEL = "gemini-2.5-flash"


def get_current_user_id(authorization: Optional[str]) -> Optional[int]:
    if not authorization or not authorization.startswith("Bearer "):
        return None
    token = authorization.split(" ", 1)[1]
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        return int(user_id) if user_id else None
    except (JWTError, ValueError):
        return None


# ---------------------------------------------------------
# POST /api/pdf/normalize
# ---------------------------------------------------------
@router.post("/normalize")
async def normalize_pdf_catalog(
    file: UploadFile = File(...),
    authorization: Optional[str] = Header(default=None)
):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    # 1. Read PDF and extract text
    try:
        file_bytes = await file.read()
        pdf_reader = PdfReader(io.BytesIO(file_bytes))

        extracted_text = ""
        # Process up to first 15 pages to keep processing swift
        max_pages = min(len(pdf_reader.pages), 15)
        for page_num in range(max_pages):
            page_text = pdf_reader.pages[page_num].extract_text() or ""
            extracted_text += f"\n--- PAGE {page_num + 1} ---\n" + page_text

        if not extracted_text.strip():
            raise HTTPException(
                status_code=400,
                detail="Could not extract readable text from this PDF. It may be a scanned image or protected."
            )

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to read PDF file: {str(e)}")

    # 2. Instruct ezycomersia AI to extract & normalize all products
    prompt = f"""
You are the proprietary ezycomersia Enterprise Catalog Ingestion Engine.
The text below has been extracted from a messy supplier PDF (catalog, quote, invoice, or spec sheet).

TASK:
1. Identify all distinct products mentioned in the document.
2. For each product, extract and normalize its technical attributes.
3. If specs like part_number, material, or dimensions are NOT provided, return null (do not invent).
4. Preserve the full real product name verbatim.

Return ONLY a valid JSON object matching this exact schema:
{{
    "total_products": 0,
    "products": [
        {{
            "product_name": "Full product title",
            "brand": "Brand name or null",
            "model": "Model name or null",
            "manufacturer": "Manufacturer or null",
            "category": "Normalized high-level category",
            "part_number": "SKU / MPN or null",
            "material": "Material or null",
            "dimensions": "Sizing / measurements or null"
        }}
    ]
}}

DOCUMENT TEXT:
{extracted_text[:12000]}
"""

    try:
        response = gemini_client.models.generate_content(
            model=AI_MODEL,
            contents=prompt,
            config={"response_mime_type": "application/json"}
        )

        response_text = response.text.strip()
        if response_text.startswith("```"):
            response_text = response_text.replace("```json", "").replace("```", "").strip()

        result = json.loads(response_text)
        products = result.get("products", [])

        # Assign fallback SKUs if none were found
        for idx, prod in enumerate(products, 1):
            if not prod.get("part_number"):
                prod["part_number"] = f"SKU-{idx:04d}"

        return {
            "success": True,
            "filename": file.filename,
            "total_products": len(products),
            "products": products
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Normalization failed: {str(e)}")


# ---------------------------------------------------------
# Optional: Bulk Save Extracted Products to Database
# ---------------------------------------------------------
class BulkSaveRequest(BaseModel):
    products: List[Dict[str, Any]]
    source_filename: str


@router.post("/bulk-save")
async def bulk_save_products(
    req: BulkSaveRequest,
    authorization: Optional[str] = Header(default=None)
):
    user_id = get_current_user_id(authorization)
    if not user_id:
        raise HTTPException(status_code=401, detail="Authentication required.")

    conn = get_db()
    saved_count = 0

    for prod in req.products:
        p_name = prod.get("product_name") or "Normalized Product"
        sku = prod.get("part_number") or f"SKU-{saved_count + 1:04d}"
        cat = prod.get("category")
        mat = prod.get("material")
        dim = prod.get("dimensions")
        raw = f"Imported from PDF: {req.source_filename}"

        conn.execute(
            """
            INSERT INTO products (user_id, product_name, part_number, category, material, dimensions, raw_input)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (user_id, p_name, sku, cat, mat, dim, raw)
        )
        saved_count += 1

    conn.commit()
    conn.close()

    return {"success": True, "saved_count": saved_count}
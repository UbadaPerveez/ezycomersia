import os
import shutil
import json
from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
from google import genai
from dotenv import load_dotenv

# Import feature routers natively
from auth import router as auth_router
from inventory import router as inventory_router
from audit import router as audit_router
from pdf_normalizer import process_pdf_catalog

# Initialize system environment configurations
load_dotenv()

app = FastAPI(title="ezycomersia World-Class Agentic Engine")

# Fully open CORS configuration to guarantee cross-port communication passes cleanly
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://ezycomersia.vercel.app",
    ],
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include administrative routing structures
app.include_router(auth_router)
app.include_router(inventory_router)
app.include_router(audit_router)

@app.get("/")
async def root():
    return {"status": "ok", "message": "ezycomersia backend is running"}

class AgentRequest(BaseModel):
    prompt: str

# Initialize Gemini AI
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
gemini_client = genai.Client(api_key=GEMINI_API_KEY) if GEMINI_API_KEY else None

@app.post("/api/agent")
async def execute_agent_loop(request: AgentRequest):
    user_prompt = request.prompt.strip()
    user_prompt_lower = user_prompt.lower()

    if not user_prompt:
        raise HTTPException(status_code=400, detail="Prompt input empty.")
    if not gemini_client:
        raise HTTPException(status_code=500, detail="AI engine offline — GEMINI_API_KEY not configured.")

    # 🌐 DYNAMIC ROUTE 1: Dynamic Data Grid Table Generator
    if "audit" in user_prompt_lower or "queue" in user_prompt_lower or "list" in user_prompt_lower:
        system_instruction = (
            "You are an enterprise system database manager. The user wants to see an inventory audit queue table "
            "for a specific product type or category. Generate a valid JSON object matching this structure:\n"
            "{\n"
            "  \"columns\": [\"Item Reference\", \"Primary Classification\", \"Material/Build specs\", \"Dimension/Attribute\", \"Status\"],\n"
            "  \"rows\": [\n"
            "    {\"part_number\": \"Generated SKU\", \"category\": \"Subcategory name\", \"material\": \"Material used\", \"dimensions\": \"Sizing metrics\", \"status\": \"PENDING_REVIEW\"},\n"
            "    {\"part_number\": \"Generated SKU 2\", \"category\": \"Subcategory name\", \"material\": \"Material used\", \"dimensions\": \"Sizing metrics\", \"status\": \"APPROVED\"}\n"
            "  ]\n"
            "}\n"
            "Create exactly 2 realistic item entries based on the user's input category. If they didn't specify one, generate mixed items.\n"
            "Return ONLY a JSON object."
        )
        
        try:
            response = gemini_client.models.generate_content(
                model="gemini-2.5-flash",
                contents=f"{system_instruction}\n\nUser input: {user_prompt}",
                config={"response_mime_type": "application/json"}
            )
            raw_text = response.text.strip()
            if raw_text.startswith("```"):
                raw_text = raw_text.replace("```json", "").replace("```", "").strip()
                
            parsed_table_data = json.loads(raw_text)
            
            return {
                "agent_message": "Successfully initialized real-time database schema modeling for your request. Rendering active data grid widget:",
                "widget_type": "AUDIT_GRID",
                "widget_data": parsed_table_data
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"AI Schema mapping failed: {str(e)}")

    # 🌐 DYNAMIC ROUTE 2: Advanced Universal Normalization Card
    else:
        system_instruction = (
            "You are an enterprise catalog data extractor. Your job is to extract factual product attributes into a JSON object.\n\n"
            "Extraction Guidelines:\n"
            "1. 'product_name': Preserve the full product name/title from the input verbatim.\n"
            "2. 'category': High-level category (e.g., 'Automotive', 'Electronics', 'Industrial', 'Apparel').\n"
            "3. 'manufacturer': The manufacturer or company if identifiable. If unknown, return null.\n"
            "4. 'brand': The brand name if identifiable. If unknown, return null.\n"
            "5. 'model': The specific model or line if mentioned. If unknown, return null.\n"
            "6. 'part_number': Extract ONLY if explicitly given in the input. If not stated, return null.\n"
            "7. 'material': Extract ONLY if explicitly stated in the input. If not stated, return null.\n"
            "8. 'dimensions': Extract ONLY if explicitly stated in the input. If not stated, return null.\n\n"
            "STRICT RULE:\n"
            "NEVER guess, deduce, or invent part_number, material, or dimensions if not present in the user text.\n\n"
            "Return ONLY a valid JSON object with exactly these 8 keys: "
            "'product_name', 'category', 'manufacturer', 'brand', 'model', 'part_number', 'material', 'dimensions'."
        )
        
        try:
            response = gemini_client.models.generate_content(
                model="gemini-2.5-flash",
                contents=f"{system_instruction}\n\nUser input: {user_prompt}",
                config={"response_mime_type": "application/json"}
            )
            raw_text = response.text.strip()
            if raw_text.startswith("```"):
                raw_text = raw_text.replace("```json", "").replace("```", "").strip()

            parsed_card_data = json.loads(raw_text)
            if not parsed_card_data.get("product_name"):
                parsed_card_data["product_name"] = user_prompt
            
            return {
                "agent_message": "Universal catalog parsing engine has structured the raw input details instantly:",
                "widget_type": "NORMALIZATION_CARD",
                "widget_data": parsed_card_data
            }
        except Exception as e:
            return {
                "agent_message": f"Parsing failure: {str(e)[:40]}",
                "widget_type": "TEXT_MESSAGE",
                "widget_data": {
                    "product_name": user_prompt,
                    "category": None,
                    "manufacturer": None,
                    "brand": None,
                    "model": None,
                    "part_number": None,
                    "material": None,
                    "dimensions": None
                }
            }

# 🌌 MULTIMODAL INGESTION PROTOCOL ROUTE FOR THE GEMINI PDF CONVERTER
@app.post("/api/pdf/normalize")
async def upload_and_normalize_pdf(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Invalid extension. System handles .pdf files only.")
    
    temp_path = f"temp_{file.filename}"
    with open(temp_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    try:
        normalized_rows = await process_pdf_catalog(temp_path)
        return {"products": normalized_rows}
    except Exception as err:
        raise HTTPException(status_code=500, detail=f"Gemini PDF processing exception: {str(err)}")
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="localhost", port=8000, reload=True)
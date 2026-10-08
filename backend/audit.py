import os
import json
from typing import Optional, Dict, Any

from dotenv import load_dotenv
from fastapi import APIRouter, Header, HTTPException
from pydantic import BaseModel
from google import genai
from jose import jwt, JWTError

from auth import get_db, SECRET_KEY, ALGORITHM

load_dotenv()

router = APIRouter(prefix="/api/audit", tags=["Audit"])

# ---------------------------------------------------------
# Internal AI Configuration
# ---------------------------------------------------------
GEMINI_API_KEY = os.getenv("AIzaSyBkICjZMPyFLy02wiLuKXKuQNiWyks1JZg")

if not GEMINI_API_KEY:
    raise RuntimeError("GEMINI_API_KEY is not configured in backend/.env")

gemini_client = genai.Client(api_key=GEMINI_API_KEY)
AUDIT_MODEL = "gemini-2.5-flash"


# ---------------------------------------------------------
# Authentication
# ---------------------------------------------------------
def get_current_user_id(authorization: Optional[str]) -> int:
    if not authorization:
        raise HTTPException(status_code=401, detail="Authentication required.")

    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header.")

    token = authorization.split(" ", 1)[1]

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid authentication token.")
        return int(user_id)
    except (JWTError, ValueError):
        raise HTTPException(status_code=401, detail="Invalid or expired authentication token.")


# ---------------------------------------------------------
# Get User Inventory
# ---------------------------------------------------------
def get_user_inventory(user_id: int):
    conn = get_db()
    rows = conn.execute(
        """
        SELECT
            id,
            product_name,
            part_number,
            category,
            material,
            dimensions,
            raw_input,
            created_at
        FROM products
        WHERE user_id = ?
        ORDER BY id DESC
        """,
        (user_id,)
    ).fetchall()
    conn.close()

    return [dict(row) for row in rows]


# ---------------------------------------------------------
# ezycomersia AI Audit Engine with Weighted Scoring
# ---------------------------------------------------------
def run_ezycomersia_audit(products):
    if not products:
        return {
            "audit_status": "NO_DATA",
            "summary": "No products are currently available in your catalog for auditing.",
            "catalog_health": 0,
            "products_checked": 0,
            "issues_found": 0,
            "validated": 0,
            "needs_review": 0,
            "issues": []
        }

    inventory_json = json.dumps(products, indent=2, default=str)

    prompt = f"""
You are the proprietary catalog quality auditor for ezycomersia.

Audit ONLY the real inventory records provided below.

IMPORTANT RULES:
- Never create or invent a product.
- Never create or invent a product ID or part number.
- Use the EXACT product_id and part_number from the inventory.
- If information is missing, report it as missing.
- Every issue must belong to an actual product in the inventory.

Check:
- product_name
- part_number
- category
- material
- dimensions
- raw_input

Return ONLY valid JSON with this structure:
{{
    "summary": "short factual summary",
    "issues": [
        {{
            "product_id": 0,
            "part_number": "EXACT part number from inventory",
            "product_name": "EXACT product name from inventory",
            "issue_type": "Missing Information",
            "field": "dimensions",
            "severity": "WARNING",
            "description": "Actual issue found in the product.",
            "recommendation": "Recommended action without inventing values.",
            "status": "PENDING_REVIEW"
        }}
    ]
}}

Allowed severity: INFO, WARNING, CRITICAL
Allowed status: PENDING_REVIEW, VALIDATED

REAL INVENTORY:
{inventory_json}
"""

    try:
        response = gemini_client.models.generate_content(
            model=AUDIT_MODEL,
            contents=prompt,
            config={"response_mime_type": "application/json"}
        )

        response_text = response.text.strip()
        if response_text.startswith("```"):
            response_text = response_text.replace("```json", "").replace("```", "").strip()

        result = json.loads(response_text)

        # -------------------------------------------------
        # VERIFY AI RESULTS AGAINST REAL INVENTORY
        # -------------------------------------------------
        real_products = {int(p["id"]): p for p in products}
        validated_issues = []

        # Track product health scores (starts at 100 points each)
        product_scores = {int(p["id"]): 100 for p in products}

        for issue in result.get("issues", []):
            try:
                product_id = int(issue.get("product_id"))
            except (TypeError, ValueError):
                continue

            if product_id not in real_products:
                continue

            real_product = real_products[product_id]
            real_part_number = str(real_product.get("part_number", "")).strip()

            issue["product_id"] = product_id
            issue["part_number"] = real_part_number
            issue["product_name"] = str(real_product.get("product_name") or "Unnamed Product").strip()

            validated_issues.append(issue)

            # Deduct points based on severity
            sev = str(issue.get("severity", "WARNING")).upper()
            if sev == "CRITICAL":
                product_scores[product_id] -= 25
            elif sev == "WARNING":
                product_scores[product_id] -= 8
            else:  # INFO
                product_scores[product_id] -= 3

        # Clamp scores between 0 and 100
        for pid in product_scores:
            product_scores[pid] = max(0, min(100, product_scores[pid]))

        # -------------------------------------------------
        # CALCULATE WEIGHTED ENTERPRISE METRICS
        # -------------------------------------------------
        products_checked = len(products)
        issues_found = len(validated_issues)

        # Products with score >= 80 are considered Validated; < 80 Needs Review
        validated = sum(1 for pid, score in product_scores.items() if score >= 80)
        needs_review = products_checked - validated

        if products_checked > 0:
            catalog_health = round(sum(product_scores.values()) / products_checked)
        else:
            catalog_health = 0

        result["products_checked"] = products_checked
        result["issues_found"] = issues_found
        result["validated"] = validated
        result["needs_review"] = needs_review
        result["catalog_health"] = catalog_health
        result["issues"] = validated_issues

        if issues_found == 0:
            result["summary"] = (
                f"Audit completed. All {products_checked} product(s) in your catalog "
                f"passed quality validation with no issues found."
            )

        return result

    except Exception as e:
        print(f"ezycomersia audit engine error: {e}")
        raise HTTPException(
            status_code=502,
            detail="ezycomersia AI audit service is currently unavailable."
        )


# ---------------------------------------------------------
# POST /api/audit
# ---------------------------------------------------------
@router.post("")
async def audit_inventory(
    authorization: Optional[str] = Header(default=None)
):
    user_id = get_current_user_id(authorization)
    products = get_user_inventory(user_id)
    audit_result = run_ezycomersia_audit(products)

    return {
        "audit_status": "COMPLETED",
        "ai_engine": "ezycomersia Intelligence Engine",
        "products": products,
        "audit": audit_result
    }


# ---------------------------------------------------------
# NEW: POST /api/audit/fix (One-Click AI Auto-Fix Endpoint)
# ---------------------------------------------------------
class FixIssueRequest(BaseModel):
    product_id: int
    field: str
    recommendation: Optional[str] = None
    issue_type: Optional[str] = None


@router.post("/fix")
async def auto_fix_issue(
    req: FixIssueRequest,
    authorization: Optional[str] = Header(default=None)
):
    user_id = get_current_user_id(authorization)
    conn = get_db()

    # 1. Fetch the exact product
    row = conn.execute(
        "SELECT * FROM products WHERE id = ? AND user_id = ?",
        (req.product_id, user_id)
    ).fetchone()

    if not row:
        conn.close()
        raise HTTPException(status_code=404, detail="Product not found.")

    product = dict(row)
    target_field = req.field.lower().strip()

    # Allowed editable fields
    allowed_fields = ["product_name", "category", "material", "dimensions", "part_number"]
    if target_field not in allowed_fields:
        conn.close()
        raise HTTPException(status_code=400, detail=f"Cannot automatically fix field '{target_field}'.")

    # 2. Use AI to generate the standardized fix
    prompt = f"""
You are the ezycomersia AI Catalog Repair Engine.
Your task is to fix a data quality issue in a product catalog record.

PRODUCT INFORMATION:
- Product Name: {product.get('product_name')}
- Part Number: {product.get('part_number')}
- Category: {product.get('category')}
- Material: {product.get('material')}
- Dimensions: {product.get('dimensions')}
- Raw Supplier Input: {product.get('raw_input')}

DEFECT IDENTIFIED:
- Field to fix: {target_field}
- Issue: {req.issue_type}
- Audit Recommendation: {req.recommendation}

TASK:
Determine the best corrected, standardized string value for the field: "{target_field}".
- If the value can be derived or normalized from the raw input or product name, extract it cleanly.
- For category: normalize to a clean standard high-level category (e.g. 'Stationery', 'Automotive', 'Electronics').
- For dimensions: format into a clean standard format (e.g. '4755 x 1850 x 1795 mm').
- For material: if not specified anywhere, return 'Standard / Not specified'.
- Return ONLY a JSON object with this exact key: {{"fixed_value": "your corrected string"}}.
"""

    try:
        response = gemini_client.models.generate_content(
            model=AUDIT_MODEL,
            contents=prompt,
            config={"response_mime_type": "application/json"}
        )
        res_data = json.loads(response.text.strip())
        fixed_value = res_data.get("fixed_value", "").strip()

        if not fixed_value:
            fixed_value = "Standard / Verified"

        # 3. Update database
        conn.execute(
            f"UPDATE products SET {target_field} = ? WHERE id = ? AND user_id = ?",
            (fixed_value, req.product_id, user_id)
        )
        conn.commit()
        conn.close()

        return {
            "success": True,
            "product_id": req.product_id,
            "field": target_field,
            "new_value": fixed_value,
            "message": f"Field '{target_field}' was successfully updated to '{fixed_value}'."
        }

    except Exception as e:
        conn.close()
        print(f"Auto-fix error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to auto-fix issue: {str(e)}")
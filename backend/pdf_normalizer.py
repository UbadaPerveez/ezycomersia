import os
import json
from typing import Optional, List
from pydantic import BaseModel, Field
from google import genai
from google.genai import types

# 1. Define the structural row data blueprint matching your frontend
class ProductSpec(BaseModel):
    product_name: str = Field(description="Full product item designation name as written")
    brand: Optional[str] = Field(None, description="Brand name if explicitly stated, otherwise null")
    model: Optional[str] = Field(None, description="Model number, version, or version string, otherwise null")
    manufacturer: Optional[str] = Field(None, description="Manufacturing company name if stated, otherwise null")
    category: Optional[str] = Field(None, description="Primary catalog taxonomy or category division, otherwise null")
    part_number: Optional[str] = Field(None, description="SKU identification code or part number, otherwise null")
    material: Optional[str] = Field(None, description="Material build composition details, otherwise null")
    dimensions: Optional[str] = Field(None, description="Sizing, length metrics, or dimensions, otherwise null")

# 2. 👇 FIXED LAYER: Wrap the list inside a parent Pydantic class structure
class CatalogContainer(BaseModel):
    products: List[ProductSpec] = Field(description="A comprehensive array list of all extracted catalog products")

async def process_pdf_catalog(file_path: str) -> list:
    """Passes the complete PDF file binary straight to Gemini and enforces structural array returns."""
    
    # Securely retrieve your API key from the local computer's environment flags
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("System Environment Variable 'GEMINI_API_KEY' is missing. Configure it in terminal first.")
    
    # Initialize the modern, official Google GenAI system client instance
    client = genai.Client(api_key=api_key)
    
    # Read the raw file bytes directly from storage to stream the whole binary across the wire
    with open(file_path, "rb") as f:
        pdf_bytes = f.read()

    prompt_instruction = (
        "Analyze this catalog document carefully. Extract every individual product listing "
        "and map their technical attributes into the requested structural schema array layout. "
        "Use null if an attribute is omitted. Never invent, guess, or synthesize parameter entries."
    )

    try:
        # Fire a native multi-modal content request straight into Gemini's high-speed pipelines
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=[
                types.Part.from_bytes(data=pdf_bytes, mime_type="application/pdf"),
                prompt_instruction
            ],
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                # 👇 TARGET THE WRAPPER CONTAINER INSTEAD OF THE RAW LIST TYPING LAYER
                response_schema=CatalogContainer,
                temperature=0.0  # Lock creativity to absolute zero for crisp engineering matches
            )
        )
        
        # Correctly load the structured text payload via universal json validation channels
        raw_text = response.text
        if not raw_text:
            return []
            
        parsed_json = json.loads(raw_text)
        
        # If the model wraps it under the schema's container key, unpack the array cleanly for your frontend
        if isinstance(parsed_json, dict) and "products" in parsed_json:
            return parsed_json["products"]
            
        return parsed_json
        
    except Exception as e:
        print(f"Gemini Catalog Extraction Error Core: {str(e)}")
        raise e

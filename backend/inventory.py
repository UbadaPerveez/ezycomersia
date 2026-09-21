import sqlite3
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel
from jose import jwt, JWTError

from auth import get_db, SECRET_KEY, ALGORITHM


# ============================================================
# Router
# ============================================================

router = APIRouter(
    prefix="/api/inventory",
    tags=["Inventory"]
)


# ============================================================
# Database initialization
# ============================================================

def initialize_inventory_database():
    conn = get_db()

    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            product_name TEXT,
            part_number TEXT,
            category TEXT,
            material TEXT,
            dimensions TEXT,
            raw_input TEXT,
            created_at TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
        """
    )

    conn.commit()
    conn.close()


initialize_inventory_database()


# ============================================================
# Schemas
# ============================================================

class ProductCreate(BaseModel):
    product_name: Optional[str] = None
    part_number: str
    category: Optional[str] = None
    material: Optional[str] = None
    dimensions: Optional[str] = None
    raw_input: Optional[str] = None


# ============================================================
# Authentication helper
# ============================================================

def get_current_user_id(authorization: Optional[str]) -> int:

    if not authorization:
        raise HTTPException(
            status_code=401,
            detail="Authentication required."
        )

    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=401,
            detail="Invalid authorization header."
        )

    token = authorization.split(" ", 1)[1]

    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        user_id = payload.get("sub")

        if not user_id:
            raise HTTPException(
                status_code=401,
                detail="Invalid authentication token."
            )

        return int(user_id)

    except (JWTError, ValueError):
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired authentication token."
        )


# ============================================================
# Create Product
# ============================================================

@router.post("")
async def create_product(
    product: ProductCreate,
    authorization: Optional[str] = Header(default=None)
):

    user_id = get_current_user_id(authorization)

    conn = get_db()

    cursor = conn.execute(
        """
        INSERT INTO products
        (
            user_id,
            product_name,
            part_number,
            category,
            material,
            dimensions,
            raw_input,
            created_at
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            user_id,
            product.product_name,
            product.part_number,
            product.category,
            product.material,
            product.dimensions,
            product.raw_input,
            datetime.now(timezone.utc).isoformat()
        )
    )

    conn.commit()

    product_id = cursor.lastrowid

    conn.close()

    return {
        "message": "Product saved to inventory.",
        "product": {
            "id": product_id,
            "user_id": user_id,
            "product_name": product.product_name,
            "part_number": product.part_number,
            "category": product.category,
            "material": product.material,
            "dimensions": product.dimensions,
            "raw_input": product.raw_input
        }
    }


# ============================================================
# Get User Inventory
# ============================================================

@router.get("")
async def get_inventory(
    authorization: Optional[str] = Header(default=None)
):

    user_id = get_current_user_id(authorization)

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

    products = [dict(row) for row in rows]

    return {
        "count": len(products),
        "products": products
    }


# ============================================================
# Get Single Product
# ============================================================

@router.get("/{product_id}")
async def get_product(
    product_id: int,
    authorization: Optional[str] = Header(default=None)
):

    user_id = get_current_user_id(authorization)

    conn = get_db()

    row = conn.execute(
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
        WHERE id = ? AND user_id = ?
        """,
        (product_id, user_id)
    ).fetchone()

    conn.close()

    if not row:
        raise HTTPException(
            status_code=404,
            detail="Product not found."
        )

    return {
        "product": dict(row)
    }


# ============================================================
# Delete Product
# ============================================================

@router.delete("/{product_id}")
async def delete_product(
    product_id: int,
    authorization: Optional[str] = Header(default=None)
):

    user_id = get_current_user_id(authorization)

    conn = get_db()

    cursor = conn.execute(
        """
        DELETE FROM products
        WHERE id = ? AND user_id = ?
        """,
        (product_id, user_id)
    )

    conn.commit()

    deleted = cursor.rowcount

    conn.close()

    if deleted == 0:
        raise HTTPException(
            status_code=404,
            detail="Product not found."
        )

    return {
        "message": "Product deleted successfully."
    }
import os
import sqlite3
from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
import bcrypt
from jose import jwt

# ============================================================
# Configuration
# ============================================================

DATABASE = "ezycomersia.db"

SECRET_KEY = os.getenv("SECRET_KEY", "CHANGE_THIS_TO_A_LONG_RANDOM_SECRET_KEY")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication"]
)

# ============================================================
# Database
# ============================================================

def get_db():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn


def initialize_database():
    conn = get_db()

    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            full_name TEXT NOT NULL,
            company TEXT,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
        """
    )

    conn.commit()
    conn.close()


initialize_database()

# ============================================================
# Schemas
# ============================================================

class RegisterRequest(BaseModel):
    full_name: str
    company: Optional[str] = None
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


# ============================================================
# Password helpers (Direct bcrypt — fixes the 72-byte passlib bug!)
# ============================================================

def hash_password(password: str) -> str:
    # Truncate to 72 bytes to satisfy bcrypt specification
    pwd_bytes = password.encode("utf-8")[:72]
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pwd_bytes, salt).decode("utf-8")


def verify_password(password: str, password_hash: str) -> bool:
    pwd_bytes = password.encode("utf-8")[:72]
    hash_bytes = password_hash.encode("utf-8")
    return bcrypt.checkpw(pwd_bytes, hash_bytes)


# ============================================================
# JWT helper
# ============================================================

def create_access_token(user_id: int, email: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )

    payload = {
        "sub": str(user_id),
        "email": email,
        "exp": expire
    }

    return jwt.encode(
        payload,
        SECRET_KEY,
        algorithm=ALGORITHM
    )


# ============================================================
# Register
# ============================================================

@router.post("/register")
async def register_user(request: RegisterRequest):

    if len(request.password) < 8:
        raise HTTPException(
            status_code=400,
            detail="Password must contain at least 8 characters."
        )

    conn = get_db()

    existing_user = conn.execute(
        "SELECT id FROM users WHERE email = ?",
        (request.email.lower(),)
    ).fetchone()

    if existing_user:
        conn.close()

        raise HTTPException(
            status_code=409,
            detail="An account with this email already exists."
        )

    password_hash = hash_password(request.password)

    cursor = conn.execute(
        """
        INSERT INTO users
        (full_name, company, email, password_hash, created_at)
        VALUES (?, ?, ?, ?, ?)
        """,
        (
            request.full_name.strip(),
            request.company.strip() if request.company else None,
            request.email.lower(),
            password_hash,
            datetime.now(timezone.utc).isoformat()
        )
    )

    conn.commit()

    user_id = cursor.lastrowid

    conn.close()

    token = create_access_token(
        user_id=user_id,
        email=request.email.lower()
    )

    return {
        "message": "Account created successfully.",
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user_id,
            "full_name": request.full_name.strip(),
            "company": request.company,
            "email": request.email.lower()
        }
    }


# ============================================================
# Login
# ============================================================

@router.post("/login")
async def login_user(request: LoginRequest):

    conn = get_db()

    user = conn.execute(
        """
        SELECT id, full_name, company, email, password_hash
        FROM users
        WHERE email = ?
        """,
        (request.email.lower(),)
    ).fetchone()

    conn.close()

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password."
        )

    if not verify_password(
        request.password,
        user["password_hash"]
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password."
        )

    token = create_access_token(
        user_id=user["id"],
        email=user["email"]
    )

    return {
        "message": "Login successful.",
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user["id"],
            "full_name": user["full_name"],
            "company": user["company"],
            "email": user["email"]
        }
    }
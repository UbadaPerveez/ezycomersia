# ezycomersia // Advanced B2B Catalog Normalization Framework

An enterprise-grade, privacy-first AI platform built to ingest unstructured vendor product descriptions, supply-chain logistics datasheets, and messy raw text files, automatically normalising them into schema-compliant, search-optimized e-commerce inventory databases.

---

## 🎯 The Problem Statement
Industrial and commercial operations are bottlenecked by chaotic, unformatted supplier inventory listings, mismatched component sizing standards, and text-heavy PDF datasheets. Manual conversion of this raw manufacturer data into schema-compliant, search-optimized e-commerce inventory rows is slow, introduces high data-entry risk, and scales poorly.

## 💡 The Solution Architecture
`ezycomersia` provides an automated, high-throughput pipeline that ingests raw, unstructured technical data and standardizes it into structured catalog records instantly—running entirely on local hardware with **0% cloud runtime dependency** and **0% external API token fees**.

---

## 🛠️ The 100% Free Local Tech Stack

*   **Frontend Engine:** Next.js 15 Canvas with Tailwind CSS, Lucide React Icons, and an advanced State-Machine Onboarding funnel layout.
*   **Backend Core:** FastAPI (Python 3.10 context) managed by a high-velocity Uvicorn ASGI server process.
*   **AI Brain:** Ollama hosting Meta's **Llama 3.2 (3B)** model executing deterministic local JSON extraction structures completely offline.
*   **Cryptographic Layer:** JSON Web Tokens (JWT) powered by `python-jose` and secured via `bcrypt` hashing algorithms.
*   **Database Storage:** Native SQLite (`ezycomersia.db`) relational data grids.

---

## 🚀 Local Boot & Execution Sequence

Follow these direct steps to spin up the entire multi-tier system on your local machine:

### 🧠 Step 1: Initialize the Local AI Server
Ensure the official Ollama background service is running on your machine, then open a standalone Windows Command Prompt (`cmd`) and pull down the model parameter weights:
```cmd
# Set system environment cross-origin security permissions for the browser tab
setx OLLAMA_ORIGINS "http://localhost:3000,http://127.0.0.1:3000"

# Fire up the private local offline AI model core
ollama run llama3.2:3b
```
*(Leave this standalone window open in the background to serve as your private processing hardware unit).*

### 🐍 Step 2: Spin Up the FastAPI Backend Engine
Open a new terminal panel inside the `backend/` directory and run Uvicorn out of the stable Python 3.10 context environment:
```cmd
cd backend
py -3.10 -m uvicorn main:app --host localhost --port 8000 --reload
```
*(Verify the console displays `INFO: Application startup complete.`)*

### 🎨 Step 3: Boot the Next.js Workspace UI Canvas
Open a separate terminal window inside the `frontend/` directory and initialize your hot-reloading development UI server:
```cmd
cd frontend
npm run dev
```

---

## 🌐 Navigating the Universal Interface
1. Launch your browser window and navigate directly to: **`http://localhost:3000`**
2. Click **Enter Enterprise Dashboard** to slide past the glass-morphism product landing overview.
3. Select your designated role tier (**Supplier Portal** vs. **Data Admin**) inside the cryptographic secure login gate, enter your registration/login credentials, and authenticate.
4. Input universal industrial query requests (e.g., `"list high-end stationery items for architects"`) directly into the prompt bar to trigger dynamic local AI schema generation tables live!

---
*Developed by UbadaPerveez as a private local data engineering platform.*

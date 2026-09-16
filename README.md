# Terra Trace — Official Forensic Audit Enclave & Decision-Support System

> **Offline, explainable forensic-audit and decision-support platform for high-stakes examinations.**  
> Built for the Smart India Hackathon (SIH). Conforms to Section 65B of the Indian Evidence Act (Section 63 BSA 2023) and statutory non-punitive triage principles.

---

## ??? Executive Summary

National competitive examinations in India (NEET, JEE, SSC, State PSCs) suffer from severe public trust crises following allegations of localized question paper leaks, seating ring collusion, and backend database tampering.

**Terra Trace** replaces opaque post-scandal panic with **immediate mathematical proof**:
- **Offline & Air-Gapped**: Runs entirely on on-premise government hardware without cloud/third-party API dependencies.
- **Explainable Tri-Layer Forensic Pipeline**:
  1. **Layer 1 (Score Reconciliation, 45%)**: Zero-tolerance $\Delta \neq 0$ check between raw optical bubble scans and central server records.
  2. **Layer 2 (Centre Macro Anomaly, 35%)**: Two-sample Kolmogorov-Smirnov continuous test comparing centre score distributions against national cohorts.
  3. **Layer 3 (Seating Collusion, 20%)**: Wollack $\omega$ (1997) and Holland $-index (1996) psychometric collusion models between physically adjacent desks.
- **Statutory Decision Support**: Fully automated disqualifications are constitutionally barred under Natural Justice; authorized magistrates adjudicate cases with mandatory written justification logs.
- **Court-Admissible Dossiers**: One-click PDF generation with SHA-256 hash chains, investigator digital signatures, and Section 65B legal certification ready for High Court submission.

---

## ?? Live Cloud Deployment Guide

### Part 1: Deploy Backend on Render

1. Go to [render.com](https://render.com) and create a **New Web Service**.
2. Connect your GitHub repository: https://github.com/krushil6091/TERRA-TRACE-.
3. Configure the service:
   - **Name**: 	erra-trace-api
   - **Environment**: Python 3
   - **Root Directory**: ackend (or leave blank if using ender.yaml)
   - **Build Command**: pip install -r requirements.txt
   - **Start Command**: uvicorn app.main:app --host 0.0.0.0 --port 
4. Click **Deploy Web Service**.
5. Once deployed, copy your backend URL: e.g. https://terra-trace-api.onrender.com.

---

### Part 2: Deploy Frontend on Vercel

1. Go to [vercel.com](https://vercel.com) and click **Add New Project**.
2. Import your GitHub repository: https://github.com/krushil6091/TERRA-TRACE-.
3. Configure the project:
   - **Framework Preset**: Vite
   - **Root Directory**: Click *Edit* and select rontend.
   - **Build Command**: 
pm run build
   - **Output Directory**: dist
4. Under **Environment Variables**, add:
   - **Key**: VITE_API_URL
   - **Value**: Your Render backend URL (e.g. https://terra-trace-api.onrender.com)
5. Click **Deploy**.
6. Your live dashboard is now accessible to your entire team from any browser!

---

## ?? Local Development Setup

### 1. Backend (FastAPI + Polars)
`ash
cd backend
python -m venv .venv
# On Windows:
.venv\Scripts\activate
# On Linux/macOS:
source .venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
`

### 2. Frontend (React 19 + Tailwind CSS + Vite)
`ash
cd frontend
npm install
npm run dev
`
Visit http://localhost:5173 to explore the enclave.

---

## ?? Automated Test Suite

`ash
cd backend
pytest -v
`
All 39 core benchmark and layer integrity tests execute in offline mode in under 25 seconds.

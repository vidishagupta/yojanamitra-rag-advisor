# 🚀 How to Push to GitHub & Deploy YojanaMitra Live

This guide gives you step-by-step instructions to push this project to GitHub and deploy it live with a public URL so anyone (professors, evaluators, recruiters, and citizens) can test it.

---

## 1. Push to GitHub

### Step 1: Open PowerShell or Terminal in this folder
Make sure you are in the project root:
```powershell
cd "c:\Users\Asus\New folder (3)"
```

### Step 2: Initialize Git Repository
```powershell
git init
git add .
git commit -m "feat: complete Eligibility-Aware Multilingual RAG Advisor (YojanaMitra)"
```

### Step 3: Create a New Repository on GitHub
1. Go to [github.com/new](https://github.com/new).
2. Enter Repository name: `yojanamitra-rag-advisor` (or `eligibility-aware-rag-advisor`).
3. Description: *"Eligibility-Aware Retrieval-Augmented Advisor for Indian Government Schemes in Hindi and Hinglish - B.Tech Final Year Capstone Project."*
4. Keep it **Public**.
5. Do **not** check "Initialize with README" (we already have a complete one).
6. Click **Create repository**.

### Step 4: Link and Push
Copy your repository URL from GitHub and run:
```powershell
git branch -M main
git remote add origin https://github.com/<YOUR_GITHUB_USERNAME>/yojanamitra-rag-advisor.git
git push -u origin main
```

---

## 2. Deploy Live (Zero-Cost / Free)

### Option A: Frontend Deployment on Vercel (Recommended - Takes 1 Minute)
The React client has an automatic fallback engine with 14+ schemes and full multilingual RAG evaluation built-in, so it works completely standalone out of the box!

1. Go to [vercel.com](https://vercel.com) and log in with GitHub.
2. Click **Add New...** -> **Project**.
3. Select your `yojanamitra-rag-advisor` repository.
4. Set **Root Directory** to: `client`.
5. Framework Preset will automatically detect: **Vite**.
6. Click **Deploy**.
7. In ~30 seconds, you will receive a live URL: `https://yojanamitra-rag-advisor.vercel.app`!

### Option B: Backend Deployment on Render (Optional)
If you want the Python FastAPI backend live on the cloud:
1. Go to [render.com](https://render.com) and sign up with GitHub.
2. Click **New +** -> **Web Service**.
3. Connect your `yojanamitra-rag-advisor` repo.
4. Set:
   - **Root Directory**: `backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port 10000`
5. (Optional) Add Environment Variable:
   - `GEMINI_API_KEY`: Your Google Gemini API key (from Google AI Studio).
6. Click **Create Web Service**.

---

## 3. How to Run Locally

You can run both Frontend and Backend with **1 click**:
- Simply double-click **`start.bat`** in the project folder!

Or via terminal:
```powershell
# Terminal 1: Backend
cd backend
python main.py

# Terminal 2: Frontend
cd client
npm run dev
```
Open **`http://localhost:5173`** in your browser.

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
import os
from dotenv import load_dotenv

from rag_engine import (
    load_schemes,
    detect_language,
    extract_profile_from_text,
    evaluate_scheme_eligibility,
    rank_schemes,
    generate_advisor_response
)

load_dotenv()

app = FastAPI(
    title="Eligibility-Aware Multilingual RAG Advisor API",
    description="Backend for YojanaMitra - Indian Government Schemes AI Advisor in Hindi & Hinglish",
    version="1.0.0"
)

# Enable CORS for Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SCHEMES = load_schemes()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

class UserProfile(BaseModel):
    age: Optional[int] = None
    gender: Optional[str] = "All"
    annual_income: Optional[float] = None
    occupation: Optional[str] = "All"
    caste: Optional[str] = "All"
    state: Optional[str] = "All"
    land_ownership: Optional[bool] = None
    residence: Optional[str] = "All"

class ChatRequest(BaseModel):
    query: str
    user_profile: Optional[UserProfile] = None
    language: Optional[str] = None # 'hindi', 'hinglish', 'english', or auto

class EvaluateRequest(BaseModel):
    user_profile: UserProfile

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "schemes_count": len(SCHEMES),
        "supported_languages": ["Hindi", "Hinglish", "English"],
        "gemini_enabled": bool(GEMINI_API_KEY)
    }

@app.get("/api/schemes")
def get_all_schemes(category: Optional[str] = None, state: Optional[str] = None, q: Optional[str] = None):
    results = SCHEMES
    if category and category != "All":
        results = [s for s in results if s.get("category") == category]
    if state and state != "All":
        results = [s for s in results if "All" in s.get("eligibility", {}).get("states", []) or state in s.get("eligibility", {}).get("states", [])]
    if q:
        q_lower = q.lower()
        results = [
            s for s in results
            if q_lower in s.get("name_en", "").lower()
            or q_lower in s.get("name_hi", "")
            or any(q_lower in kw.lower() for kw in s.get("keywords", []))
        ]
    return {"count": len(results), "schemes": results}

@app.post("/api/evaluate")
def evaluate_profile(req: EvaluateRequest):
    """
    Evaluates all schemes against the structured user profile.
    Returns schemes categorized into ELIGIBLE, CONDITIONALLY_ELIGIBLE, and INELIGIBLE.
    """
    profile_dict = req.user_profile.model_dump()
    evaluated = []
    
    for s in SCHEMES:
        res = evaluate_scheme_eligibility(s, profile_dict)
        s_copy = dict(s)
        s_copy["eligibility_result"] = res
        evaluated.append(s_copy)

    # Sort so 100% eligible are at the top
    evaluated.sort(key=lambda s: s["eligibility_result"]["match_score"], reverse=True)
    
    eligible = [s for s in evaluated if s["eligibility_result"]["status"] == "ELIGIBLE"]
    conditional = [s for s in evaluated if s["eligibility_result"]["status"] == "CONDITIONALLY_ELIGIBLE"]
    ineligible = [s for s in evaluated if s["eligibility_result"]["status"] == "INELIGIBLE"]

    return {
        "total_evaluated": len(evaluated),
        "eligible_count": len(eligible),
        "conditional_count": len(conditional),
        "ineligible_count": len(ineligible),
        "eligible_schemes": eligible,
        "conditional_schemes": conditional,
        "ineligible_schemes": ineligible,
        "all_ranked": evaluated
    }

@app.post("/api/chat")
def chat_advisor(req: ChatRequest):
    """
    Conversational RAG Endpoint:
    Combines hybrid retrieval, eligibility validation, and multilingual natural language generation.
    """
    query = req.query.strip()
    if not query:
        raise HTTPException(status_code=400, detail="Query cannot be empty.")

    # 1. Detect or respect specified language
    detected_lang = req.language if req.language and req.language != "auto" else detect_language(query)

    # 2. Extract or merge profile
    profile_dict = req.user_profile.model_dump() if req.user_profile else {}
    implicit_profile = extract_profile_from_text(query)
    # Merge implicit into profile if explicit wasn't specified
    for k, v in implicit_profile.items():
        if profile_dict.get(k) is None or profile_dict.get(k) == "All":
            profile_dict[k] = v

    # 3. Hybrid Retrieval + Eligibility Ranking
    ranked_schemes = rank_schemes(query, profile_dict, SCHEMES)
    top_schemes = ranked_schemes[:5]

    # 4. Synthesize Response via RAG
    advisor_output = generate_advisor_response(
        query=query,
        user_profile=profile_dict,
        top_schemes=top_schemes,
        lang=detected_lang,
        gemini_api_key=GEMINI_API_KEY
    )

    return {
        "reply": advisor_output["text"],
        "model_used": advisor_output["model_used"],
        "detected_language": detected_lang,
        "extracted_profile": profile_dict,
        "top_schemes": top_schemes
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)

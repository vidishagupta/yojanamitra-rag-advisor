import json
import os
import re
from typing import List, Dict, Any, Optional

# Load schemes dataset
DATA_PATH = os.path.join(os.path.dirname(__file__), "schemes_data.json")

def load_schemes() -> List[Dict[str, Any]]:
    with open(DATA_PATH, "r", encoding="utf-8") as f:
        return json.load(f)

# Vocabulary dictionaries for Hindi and Hinglish token normalization
HINGLISH_INTENTS = {
    "agriculture": ["kisan", "kisaan", "kheti", "fasal", "khet", "zameen", "farmer", "agriculture", "crop", "seeds", "tractor", "6000"],
    "healthcare": ["swasthya", "ilaj", "bimar", "bimari", "doctor", "aspataal", "hospital", "dawa", "dawai", "ayushman", "5 lakh", "health", "treatment", "card"],
    "housing": ["ghar", "makan", "chhat", "awas", "housing", "pucca", "kutcha", "building", "home", "gramin", "colony"],
    "business": ["business", "vyapar", "dukaan", "karobar", "startup", "mudra", "loan", "karz", "paisa", "rupaye", "thela", "vendor", "artisan", "karigar"],
    "women": ["mahila", "aurat", "ladli", "kanya", "beti", "ladki", "girl", "daughter", "women", "female", "sister", "bahin", "behna", "chulha", "gas", "cylinder"],
    "education": ["padhai", "scholarship", "chhatravritti", "college", "school", "btech", "fees", "student", "degree", "diploma", "training", "internship", "stipend"],
    "pension": ["pension", "budhapa", "60 saal", "old age", "senior citizen", "retire", "suraksha", "bima", "insurance"]
}

HINDI_INTENTS = {
    "agriculture": ["किसान", "खेती", "फसल", "खेत", "जमीन", "खाद", "बीज", "कृषि", "सम्मान निधि"],
    "healthcare": ["स्वास्थ्य", "इलाज", "बीमारी", "अस्पताल", "दवा", "आयुष्मान", "कैशलेस"],
    "housing": ["मकान", "घर", "आवास", "पक्का मकान", "छत"],
    "business": ["व्यापार", "दुकान", "कारोबार", "लोन", "कर्ज", "मुद्रा", "कारीगर", "विश्वकर्मा", "रेहड़ी"],
    "women": ["महिला", "बेटी", "लाड़ली", "कन्या", "उज्ज्वला", "गैस", "चूल्हा"],
    "education": ["छात्रवृत्ति", "पढ़ाई", "स्कॉलरशिप", "कॉलेज", "छात्र", "छात्रा", "ट्रेनिंग", "स्टाइपेंड"],
    "pension": ["पेंशन", "बुढ़ापा", "वृद्धावस्था", "बीमा", "सुरक्षा"]
}

def detect_language(query: str) -> str:
    """Detect if query is primarily Hindi (Devanagari), Hinglish (Roman Hindi), or English."""
    devanagari_chars = len(re.findall(r'[\u0900-\u097F]', query))
    total_letters = len(re.findall(r'[a-zA-Z\u0900-\u097F]', query))
    
    if total_letters == 0:
        return "hinglish"
    
    if devanagari_chars / max(total_letters, 1) > 0.35:
        return "hindi"
    
    # Check for common Hinglish words
    hinglish_markers = ["kya", "hai", "mujhe", "mera", "meri", "hum", "kaunsi", "yojana", "milegi", "chahiye", "saal", "paise", "kaise", "karen", "nahi", "hoga", "batao", "karna"]
    query_lower = query.lower()
    matches = sum(1 for marker in hinglish_markers if re.search(r'\b' + marker + r'\b', query_lower))
    if matches >= 1:
        return "hinglish"
        
    return "english"

def extract_profile_from_text(query: str) -> Dict[str, Any]:
    """Extract profile clues like age, income, state, gender from free-form text."""
    profile: Dict[str, Any] = {}
    query_lower = query.lower()
    
    # Age extraction (e.g., '22 saal', 'age 25', '25 years old', '२५ वर्ष')
    age_match = re.search(r'(\d{1,2})\s*(?:saal|sal|years?|yr|वर्ष|ki umar|umar)', query_lower)
    if age_match:
        profile["age"] = int(age_match.group(1))
    else:
        num_match = re.search(r'(?:age|umar|उम्र)\s*(?:is|hai|:)?\s*(\d{1,2})', query_lower)
        if num_match:
            profile["age"] = int(num_match.group(1))

    # Income extraction (e.g., '1.5 lakh', 'income 200000', '2 lakh saal')
    income_lakh_match = re.search(r'(\d+(?:\.\d+)?)\s*(?:lakh|lac|लाख)', query_lower)
    if income_lakh_match:
        profile["annual_income"] = float(income_lakh_match.group(1)) * 100000
    else:
        income_direct = re.search(r'(?:income|aay|कमाई|वेतन)\s*(?:is|hai|:)?\s*(\d{5,7})', query_lower)
        if income_direct:
            profile["annual_income"] = float(income_direct.group(1))

    # Gender extraction
    if any(w in query_lower for w in ["female", "mahila", "aurat", "ladki", "girl", "woman", "महिला", "औरत", "लड़की"]):
        profile["gender"] = "Female"
    elif any(w in query_lower for w in ["male", "purush", "ladka", "man", "पुरुष", "लड़का"]):
        profile["gender"] = "Male"

    # Occupation extraction
    if any(w in query_lower for w in ["farmer", "kisan", "kheti", "किसान", "खेतिहर"]):
        profile["occupation"] = "Farmer"
    elif any(w in query_lower for w in ["student", "padhai", "college", "btech", "छात्र", "छात्रा", "विद्यार्थी"]):
        profile["occupation"] = "Student"
    elif any(w in query_lower for w in ["business", "dukan", "vyapar", "shopkeeper", "दुकानदार", "व्यापारी"]):
        profile["occupation"] = "Small Business Owner"
    elif any(w in query_lower for w in ["artisan", "karigar", "darzi", "badhai", "लोहार", "बढ़ई", "दर्जी", "शिल्पकार"]):
        profile["occupation"] = "Artisan"
    elif any(w in query_lower for w in ["thela", "vendor", "hawker", "रेहड़ी", "ठेलेवाला"]):
        profile["occupation"] = "Street Vendor"
    elif any(w in query_lower for w in ["unemployed", "berozgar", "बेरोजगार"]):
        profile["occupation"] = "Unemployed"

    # State extraction
    states = ["Uttar Pradesh", "Madhya Pradesh", "Bihar", "Rajasthan", "Maharashtra", "Gujarat", "Haryana", "Punjab", "Delhi"]
    for st in states:
        if st.lower() in query_lower or (st == "Uttar Pradesh" and ("up" in query_lower.split() or "यूपी" in query or "उत्तर प्रदेश" in query)):
            profile["state"] = "Uttar Pradesh"
            break
        if st == "Madhya Pradesh" and ("mp" in query_lower.split() or "एमपी" in query or "मध्य प्रदेश" in query):
            profile["state"] = "Madhya Pradesh"
            break
        if st.lower() in query_lower:
            profile["state"] = st
            break

    # Land ownership
    if any(w in query_lower for w in ["apni zameen hai", "khet hai", "land owner", "zameen hai", "अपनी जमीन"]):
        profile["land_ownership"] = True
    elif any(w in query_lower for w in ["zameen nahi hai", "bhoomiheen", "no land", "जमीन नहीं"]):
        profile["land_ownership"] = False

    return profile

def evaluate_scheme_eligibility(scheme: Dict[str, Any], user_profile: Dict[str, Any]) -> Dict[str, Any]:
    """
    Core Eligibility-Aware Evaluation Module.
    Validates user constraints against scheme rule book.
    Returns: status ('ELIGIBLE', 'CONDITIONALLY_ELIGIBLE', 'INELIGIBLE'), match_score (0-100), reasons, and action steps.
    """
    elig = scheme.get("eligibility", {})
    reasons_en = []
    reasons_hi = []
    reasons_hinglish = []
    is_ineligible = False
    penalties = 0

    user_age = user_profile.get("age")
    user_gender = user_profile.get("gender")
    user_income = user_profile.get("annual_income")
    user_occ = user_profile.get("occupation")
    user_caste = user_profile.get("caste")
    user_state = user_profile.get("state")
    user_land = user_profile.get("land_ownership")

    # 1. Age Verification
    min_age = elig.get("min_age")
    max_age = elig.get("max_age")
    if user_age is not None:
        if min_age is not None and user_age < min_age:
            is_ineligible = True
            reasons_en.append(f"Age {user_age} is below minimum requirement ({min_age} years).")
            reasons_hi.append(f"आयु {user_age} वर्ष न्यूनतम आवश्यकता ({min_age} वर्ष) से कम है।")
            reasons_hinglish.append(f"Aapki umar ({user_age} saal) is yojana ki minimum age ({min_age} saal) se kam hai.")
        elif max_age is not None and user_age > max_age:
            is_ineligible = True
            reasons_en.append(f"Age {user_age} exceeds maximum allowed limit ({max_age} years).")
            reasons_hi.append(f"आयु {user_age} वर्ष अधिकतम अनुमत सीमा ({max_age} वर्ष) से अधिक है।")
            reasons_hinglish.append(f"Aapki age ({user_age} saal) maximum limit ({max_age} saal) se zyada hai.")
        else:
            reasons_en.append(f"Age criterion satisfied ({user_age} years).")
            reasons_hi.append(f"आयु पात्रता पूरी होती है ({user_age} वर्ष)।")
            reasons_hinglish.append(f"Age limit meet hoti hai ({user_age} saal).")

    # 2. Gender Verification
    scheme_gender = elig.get("gender", "All")
    if scheme_gender != "All" and user_gender:
        if user_gender.lower() != scheme_gender.lower():
            is_ineligible = True
            reasons_en.append(f"Scheme is restricted to {scheme_gender} applicants.")
            reasons_hi.append(f"यह योजना केवल { 'महिला' if scheme_gender == 'Female' else 'पुरुष' } आवेदकों के लिए है।")
            reasons_hinglish.append(f"Ye scheme sirf {scheme_gender} candidates ke liye hai.")
        else:
            reasons_en.append(f"Gender requirement matched ({scheme_gender}).")
            reasons_hi.append(f"लिंग पात्रता पूरी है ({scheme_gender})।")
            reasons_hinglish.append(f"Gender requirement ({scheme_gender}) match ho gayi.")

    # 3. Income Limit Verification
    max_income = elig.get("max_annual_income")
    if max_income is not None and user_income is not None:
        if user_income > max_income:
            is_ineligible = True
            reasons_en.append(f"Annual income ₹{user_income:,.0f} exceeds scheme ceiling ₹{max_income:,.0f}.")
            reasons_hi.append(f"वार्षिक आय ₹{user_income:,.0f} योजना की अधिकतम सीमा ₹{max_income:,.0f} से अधिक है।")
            reasons_hinglish.append(f"Aapki income (₹{user_income:,.0f}) scheme ki maximum limit (₹{max_income:,.0f}) se zyada hai.")
        else:
            reasons_en.append(f"Income within threshold (₹{user_income:,.0f} <= ₹{max_income:,.0f}).")
            reasons_hi.append(f"पारिवारिक आय सीमा के भीतर है (₹{user_income:,.0f} <= ₹{max_income:,.0f})।")
            reasons_hinglish.append(f"Aapki annual income limit ke andar hai.")

    # 4. State Verification
    allowed_states = elig.get("states", ["All"])
    if "All" not in allowed_states and user_state:
        if user_state not in allowed_states:
            is_ineligible = True
            states_str = ", ".join(allowed_states)
            reasons_en.append(f"Scheme is only valid in {states_str}. Selected state is {user_state}.")
            reasons_hi.append(f"यह योजना केवल {states_str} में लागू है।")
            reasons_hinglish.append(f"Ye yojana keval {states_str} ke residents ke liye hai.")
        else:
            reasons_en.append(f"State residency verified ({user_state}).")
            reasons_hi.append(f"राज्य निवास सत्यापित ({user_state})।")
            reasons_hinglish.append(f"Aapke state ({user_state}) me ye scheme active hai.")

    # 5. Landholding requirement
    req_land = elig.get("land_ownership")
    if req_land is True:
        if user_land is False:
            is_ineligible = True
            reasons_en.append("Requires cultivable agricultural land registered in the applicant's name.")
            reasons_hi.append("आवेदक के नाम पर कृषि योग्य भूमि होना अनिवार्य है।")
            reasons_hinglish.append("Is yojana ke liye aapke naam par kheti ki zameen hona zaroori hai.")
        elif user_land is True:
            reasons_en.append("Landownership criterion verified.")
            reasons_hi.append("भूमि स्वामित्व पात्रता सत्यापित।")
            reasons_hinglish.append("Zameen ka ownership criteria satisfied hai.")

    # 6. Occupation matching
    allowed_occs = elig.get("occupation", ["All"])
    if "All" not in allowed_occs and user_occ:
        if user_occ not in allowed_occs:
            penalties += 25
            occs_str = ", ".join(allowed_occs)
            reasons_en.append(f"Targeted primarily at: {occs_str} (Current: {user_occ}).")
            reasons_hi.append(f"यह मुख्य रूप से {occs_str} के लिए लक्षित है।")
            reasons_hinglish.append(f"Ye scheme mukhya roop se {occs_str} ke liye targeted hai.")
        else:
            reasons_en.append(f"Occupation perfectly matched ({user_occ}).")
            reasons_hi.append(f"पेशा पूरी तरह मेल खाता है ({user_occ})।")
            reasons_hinglish.append(f"Aapka profession ({user_occ}) is yojana se directly match karta hai.")

    # Determine final eligibility status and calculated score
    if is_ineligible:
        status = "INELIGIBLE"
        match_score = max(10, 40 - penalties)
    elif penalties > 0:
        status = "CONDITIONALLY_ELIGIBLE"
        match_score = max(55, 80 - penalties)
    else:
        status = "ELIGIBLE"
        match_score = 100

    return {
        "status": status,
        "match_score": match_score,
        "reasons_en": reasons_en,
        "reasons_hi": reasons_hi,
        "reasons_hinglish": reasons_hinglish
    }

def rank_schemes(query: str, user_profile: Dict[str, Any], schemes: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Hybrid Retrieval:
    Combines text query relevance (BM25-style keyword matching + category intent)
    with rule-based eligibility evaluation score.
    """
    query_lower = query.lower()
    q_tokens = set(re.findall(r'\w+', query_lower))
    
    scored_schemes = []
    
    for scheme in schemes:
        elig_result = evaluate_scheme_eligibility(scheme, user_profile)
        
        # Keyword & text match score
        text_score = 0
        keywords = scheme.get("keywords", [])
        for kw in keywords:
            if kw.lower() in query_lower:
                text_score += 15
        
        # Check scheme name & description
        name_en = scheme.get("name_en", "").lower()
        name_hi = scheme.get("name_hi", "")
        desc_en = scheme.get("description_en", "").lower()
        desc_hi = scheme.get("description_hi", "")
        
        for token in q_tokens:
            if len(token) > 2:
                if token in name_en:
                    text_score += 10
                if token in desc_en:
                    text_score += 5
        
        # Check devanagari tokens
        for token in re.findall(r'[\u0900-\u097F]+', query):
            if token in name_hi:
                text_score += 15
            if token in desc_hi:
                text_score += 8
                
        # Category intent boost
        cat = scheme.get("category", "")
        for cat_key, words in HINGLISH_INTENTS.items():
            if any(w in query_lower for w in words):
                if (cat_key == "agriculture" and cat == "Agriculture") or \
                   (cat_key == "healthcare" and cat == "Healthcare") or \
                   (cat_key == "housing" and cat == "Housing") or \
                   (cat_key == "business" and cat == "Business & MSME") or \
                   (cat_key == "women" and cat == "Women Empowerment") or \
                   (cat_key == "education" and cat == "Education & Skilling") or \
                   (cat_key == "pension" and cat == "Social Welfare"):
                    text_score += 30

        # Composite Ranking Score:
        # Eligibility is prioritized so ineligible schemes don't falsely dominate recommendations!
        if elig_result["status"] == "ELIGIBLE":
            composite_score = elig_result["match_score"] * 0.55 + text_score * 0.45 + 50
        elif elig_result["status"] == "CONDITIONALLY_ELIGIBLE":
            composite_score = elig_result["match_score"] * 0.50 + text_score * 0.40 + 20
        else: # INELIGIBLE
            composite_score = text_score * 0.25 # heavy penalty

        scheme_copy = dict(scheme)
        scheme_copy["eligibility_result"] = elig_result
        scheme_copy["retrieval_score"] = composite_score
        scored_schemes.append(scheme_copy)

    # Sort descending by composite score
    scored_schemes.sort(key=lambda s: s["retrieval_score"], reverse=True)
    return scored_schemes

def generate_advisor_response(
    query: str,
    user_profile: Dict[str, Any],
    top_schemes: List[Dict[str, Any]],
    lang: str = "hinglish",
    gemini_api_key: Optional[str] = None
) -> Dict[str, Any]:
    """
    RAG Generation:
    Synthesizes ground-truth scheme information and eligibility evaluations
    into a personalized, empathetic advisory response in Hindi or Hinglish.
    Falls back reliably to high-fidelity template engine if Gemini API key is unset.
    """
    # 1. Try Gemini generation if API key is provided
    if gemini_api_key:
        try:
            from google import genai
            client = genai.Client(api_key=gemini_api_key)
            
            prompt = f"""You are 'YojanaMitra (योजनामित्र)', an empathetic, official AI Government Scheme Eligibility Advisor for Indian citizens.
User Query: "{query}"
Language requested: {lang.upper()} (Produce responses strictly in natural {lang})
User Extracted Profile: {json.dumps(user_profile, ensure_ascii=False)}

Here are the retrieved top verified government schemes and their exact rule-based eligibility evaluation:
{json.dumps([{
    'name': s['name_en'],
    'name_hi': s['name_hi'],
    'status': s['eligibility_result']['status'],
    'match_score': s['eligibility_result']['match_score'],
    'reasons': s['eligibility_result']['reasons_hinglish'] if lang == 'hinglish' else s['eligibility_result']['reasons_hi'],
    'benefits': s['benefits_hi'] if lang == 'hindi' else s['benefits_en'],
    'documents': s['documents_required'],
    'portal': s['official_portal'],
    'process': s['application_process_hi'] if lang == 'hindi' else s['application_process_en']
} for s in top_schemes[:3]], ensure_ascii=False, indent=2)}

INSTRUCTIONS:
1. Address the citizen respectfully (Namaste / नमस्ते).
2. Clearly declare whether they are ELIGIBLE, CONDITIONALLY ELIGIBLE, or INELIGIBLE for the top schemes and explain EXACTLY WHY with their profile attributes (income, age, land, etc.).
3. State the financial/practical benefits clearly in ₹ INR.
4. Give a checklist of required documents and official portal link to apply.
5. Tone: Respectful, direct, supportive, and completely free of hallucination. Do NOT invent fake schemes.
"""
            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt
            )
            if response.text:
                return {
                    "text": response.text,
                    "model_used": "gemini-2.5-flash",
                    "language": lang
                }
        except Exception as e:
            # Fall through to built-in deterministic NLG engine
            print(f"[RAG Engine] Gemini API call bypassed/failed ({e}), using built-in generator.")

    # 2. Built-in High-Fidelity Deterministic Multilingual Generator
    # Guarantees flawless, instant results with zero API cost and 100% offline reliability.
    primary_scheme = top_schemes[0] if top_schemes else None
    
    if not primary_scheme:
        if lang == "hindi":
            text = "नमस्ते! आपकी जानकारी के अनुसार फिलहाल कोई उपयुक्त योजना नहीं मिली। कृपया अपनी सही उम्र, आय और राज्य पुनः बताएं।"
        elif lang == "hinglish":
            text = "Namaste! Aapke profile ke mutabiq filhal koi matching scheme nahi mili. Kripya apni exact age, annual income aur state batayein."
        else:
            text = "Hello! Based on the provided details, no matching government scheme was found. Please specify your age, annual income, and state."
        return {"text": text, "model_used": "built-in-rag-generator", "language": lang}

    elig = primary_scheme["eligibility_result"]
    status = elig["status"]
    score = elig["match_score"]
    
    # Constructing rich Hinglish response
    if lang == "hinglish":
        greeting = "🙏 **Namaste! Main hoon YojanaMitra (योजनामित्र) - Aapka Sarkari Scheme Advisor.**\n\n"
        
        if status == "ELIGIBLE":
            summary = f"🎉 **Achi khabar!** Aap **{primary_scheme['name_en']}** ke liye **100% Eligible** hain.\n\n"
        elif status == "CONDITIONALLY_ELIGIBLE":
            summary = f"⚠️ **Dhayan dein:** Aap **{primary_scheme['name_en']}** ke liye **Conditionally Eligible ({score}% Match)** hain.\n\n"
        else:
            summary = f"ℹ️ **Patrata Check:** Aapke vartaman profile ke anusaar aap **{primary_scheme['name_en']}** ke liye abhi eligible nahi hain ({score}% Match).\n\n"

        reasons_bullet = "\n".join([f"- {r}" for r in elig["reasons_hinglish"]])
        
        benefits_section = f"### 💰 **Yojana Ka Labh (Benefits):**\n{primary_scheme['benefits_en']}\n\n"
        
        eligibility_section = f"### 🔍 **Aapki Eligibility Ka Karan (Why you qualify):**\n{reasons_bullet}\n\n"
        
        docs_list = "\n".join([f"  ✅ {doc}" for doc in primary_scheme['documents_required']])
        docs_section = f"### 📄 **Zaroori Dastavez (Documents Checklist):**\n{docs_list}\n\n"
        
        apply_section = (
            f"### 🚀 **Aavedan Kaise Karein (Application Steps):**\n"
            f"{primary_scheme['application_process_en']}\n\n"
            f"🌐 **Official Portal Link:** [{primary_scheme['official_portal']}]({primary_scheme['official_portal']})\n"
        )
        
        # Other top matching schemes
        other_schemes = [s for s in top_schemes[1:3] if s['retrieval_score'] > 30]
        other_section = ""
        if other_schemes:
            other_section = "\n### 📌 **Aapke Liye Anya Mahatvapurna Yojanaayein (Other Schemes):**\n"
            for s in other_schemes:
                other_section += f"- **{s['name_en']}**: {s['eligibility_result']['status']} ({s['eligibility_result']['match_score']}% Match) - *{s['category']}*\n"

        full_text = greeting + summary + eligibility_section + benefits_section + docs_section + apply_section + other_section

    # Constructing rich Pure Hindi (देवनागरी) response
    elif lang == "hindi":
        greeting = "🙏 **नमस्ते! मैं हूँ योजनामित्र - आपका सरकारी योजना सलाहकार।**\n\n"
        
        if status == "ELIGIBLE":
            summary = f"🎉 **शुभ समाचार!** आप **{primary_scheme['name_hi']}** के लिए **पूर्णतः पात्र (100% Eligible)** हैं।\n\n"
        elif status == "CONDITIONALLY_ELIGIBLE":
            summary = f"⚠️ **कृपया ध्यान दें:** आप **{primary_scheme['name_hi']}** के लिए **सशर्त पात्र ({score}% Match)** हैं।\n\n"
        else:
            summary = f"ℹ️ **पात्रता समीक्षा:** आपकी वर्तमान जानकारी के अनुसार आप **{primary_scheme['name_hi']}** के लिए पात्र नहीं हैं।\n\n"

        reasons_bullet = "\n".join([f"- {r}" for r in elig["reasons_hi"]])
        
        benefits_section = f"### 💰 **योजना के मुख्य लाभ:**\n{primary_scheme['benefits_hi']}\n\n"
        
        eligibility_section = f"### 🔍 **पात्रता का आधार (Eligibility Reasons):**\n{reasons_bullet}\n\n"
        
        docs_list = "\n".join([f"  ✅ {doc}" for doc in primary_scheme['documents_required']])
        docs_section = f"### 📄 **आवश्यक दस्तावेज (Documents Required):**\n{docs_list}\n\n"
        
        apply_section = (
            f"### 🚀 **आवेदन कैसे करें (Application Process):**\n"
            f"{primary_scheme['application_process_hi']}\n\n"
            f"🌐 **आधिकारिक पोर्टल:** [{primary_scheme['official_portal']}]({primary_scheme['official_portal']})\n"
        )
        
        other_schemes = [s for s in top_schemes[1:3] if s['retrieval_score'] > 30]
        other_section = ""
        if other_schemes:
            other_section = "\n### 📌 **आपके लिए अन्य अनुशंसित योजनाएं:**\n"
            for s in other_schemes:
                other_section += f"- **{s['name_hi']}**: {s['eligibility_result']['status']} ({s['eligibility_result']['match_score']}% मेल) - *{s['category']}*\n"

        full_text = greeting + summary + eligibility_section + benefits_section + docs_section + apply_section + other_section

    # English fallback
    else:
        greeting = "🙏 **Greetings! I am YojanaMitra - Your Eligibility-Aware Government Scheme Advisor.**\n\n"
        summary = f"**Status for {primary_scheme['name_en']}:** {status} ({score}% Match)\n\n"
        reasons_bullet = "\n".join([f"- {r}" for r in elig["reasons_en"]])
        docs_list = "\n".join([f"  ✅ {doc}" for doc in primary_scheme['documents_required']])
        full_text = (
            f"{greeting}{summary}"
            f"### 🔍 **Eligibility Breakdown:**\n{reasons_bullet}\n\n"
            f"### 💰 **Key Benefits:**\n{primary_scheme['benefits_en']}\n\n"
            f"### 📄 **Required Documents:**\n{docs_list}\n\n"
            f"### 🚀 **How to Apply:**\n{primary_scheme['application_process_en']}\n\n"
            f"🌐 **Official Portal:** [{primary_scheme['official_portal']}]({primary_scheme['official_portal']})\n"
        )

    return {
        "text": full_text,
        "model_used": "built-in-rag-generator",
        "language": lang
    }

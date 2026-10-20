import localSchemes from '../data/schemes.json';

const API_BASE = 'http://127.0.0.1:8000/api';

// Check if Python FastAPI server is active
export async function checkBackendHealth() {
  try {
    const res = await fetch(`${API_BASE}/health`, { method: 'GET', signal: AbortSignal.timeout(2000) });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    // Backend offline
  }
  return { status: 'offline', schemes_count: localSchemes.length, supported_languages: ['Hindi', 'Hinglish', 'English'], client_mode: true };
}

// Client-side rule evaluation fallback
export function evaluateSchemeLocally(scheme, userProfile) {
  const elig = scheme.eligibility || {};
  const reasons_en = [];
  const reasons_hi = [];
  const reasons_hinglish = [];
  let is_ineligible = false;
  let penalties = 0;

  const { age, gender, annual_income, occupation, state, land_ownership } = userProfile;

  // Age
  if (age !== undefined && age !== null && age !== '') {
    const numAge = Number(age);
    if (elig.min_age !== null && numAge < elig.min_age) {
      is_ineligible = true;
      reasons_en.push(`Age ${numAge} is below minimum requirement (${elig.min_age} years).`);
      reasons_hi.push(`आयु ${numAge} वर्ष न्यूनतम आवश्यकता (${elig.min_age} वर्ष) से कम है।`);
      reasons_hinglish.push(`Aapki umar (${numAge} saal) minimum age (${elig.min_age} saal) se kam hai.`);
    } else if (elig.max_age !== null && numAge > elig.max_age) {
      is_ineligible = true;
      reasons_en.push(`Age ${numAge} exceeds maximum allowed limit (${elig.max_age} years).`);
      reasons_hi.push(`आयु ${numAge} वर्ष अधिकतम अनुमत सीमा (${elig.max_age} वर्ष) से अधिक है।`);
      reasons_hinglish.push(`Aapki umar (${numAge} saal) maximum limit (${elig.max_age} saal) se zyada hai.`);
    } else {
      reasons_en.push(`Age verified (${numAge} yrs).`);
      reasons_hi.push(`आयु पात्रता पूरी होती है (${numAge} वर्ष)।`);
      reasons_hinglish.push(`Age limit satisfy hoti hai (${numAge} saal).`);
    }
  }

  // Gender
  if (elig.gender && elig.gender !== 'All' && gender && gender !== 'All') {
    if (gender.toLowerCase() !== elig.gender.toLowerCase()) {
      is_ineligible = true;
      reasons_en.push(`Restricted to ${elig.gender} applicants.`);
      reasons_hi.push(`यह योजना केवल ${elig.gender === 'Female' ? 'महिला' : 'पुरुष'} आवेदकों के लिए है।`);
      reasons_hinglish.push(`Ye scheme sirf ${elig.gender} candidates ke liye hai.`);
    } else {
      reasons_en.push(`Gender requirement matched (${elig.gender}).`);
      reasons_hi.push(`लिंग पात्रता पूरी है (${elig.gender})।`);
      reasons_hinglish.push(`Gender requirement (${elig.gender}) match ho gayi.`);
    }
  }

  // Income
  if (elig.max_annual_income !== null && annual_income !== undefined && annual_income !== null && annual_income !== '') {
    const numIncome = Number(annual_income);
    if (numIncome > elig.max_annual_income) {
      is_ineligible = true;
      reasons_en.push(`Annual income ₹${numIncome.toLocaleString('en-IN')} exceeds limit of ₹${elig.max_annual_income.toLocaleString('en-IN')}.`);
      reasons_hi.push(`वार्षिक आय ₹${numIncome.toLocaleString('en-IN')} योजना की सीमा ₹${elig.max_annual_income.toLocaleString('en-IN')} से अधिक है।`);
      reasons_hinglish.push(`Aapki income (₹${numIncome.toLocaleString('en-IN')}) limit (₹${elig.max_annual_income.toLocaleString('en-IN')}) se zyada hai.`);
    } else {
      reasons_en.push(`Income within ceiling (₹${numIncome.toLocaleString('en-IN')} <= ₹${elig.max_annual_income.toLocaleString('en-IN')}).`);
      reasons_hi.push(`पारिवारिक आय सीमा के भीतर है।`);
      reasons_hinglish.push(`Aapki income threshold ke andar hai.`);
    }
  }

  // State
  if (elig.states && !elig.states.includes('All') && state && state !== 'All') {
    if (!elig.states.includes(state)) {
      is_ineligible = true;
      reasons_en.push(`Applicable in ${elig.states.join(', ')}. Selected: ${state}.`);
      reasons_hi.push(`यह केवल ${elig.states.join(', ')} के निवासियों के लिए है।`);
      reasons_hinglish.push(`Ye yojana keval ${elig.states.join(', ')} ke liye valid hai.`);
    } else {
      reasons_en.push(`State residency verified (${state}).`);
      reasons_hi.push(`राज्य पात्रता पूरी है (${state})।`);
      reasons_hinglish.push(`State eligibility matched (${state}).`);
    }
  }

  // Land
  if (elig.land_ownership === true) {
    if (land_ownership === false) {
      is_ineligible = true;
      reasons_en.push(`Requires agricultural land registered in applicant's name.`);
      reasons_hi.push(`आवेदक के नाम पर कृषि भूमि होना अनिवार्य है।`);
      reasons_hinglish.push(`Aapke naam par kheti ki zameen hona zaroori hai.`);
    } else if (land_ownership === true) {
      reasons_en.push(`Land ownership confirmed.`);
      reasons_hi.push(`भूमि स्वामित्व सत्यापित।`);
      reasons_hinglish.push(`Zameen ka ownership verified hai.`);
    }
  }

  // Occupation
  if (elig.occupation && !elig.occupation.includes('All') && occupation && occupation !== 'All') {
    if (!elig.occupation.includes(occupation)) {
      penalties += 25;
      reasons_en.push(`Targeted primarily at: ${elig.occupation.join(', ')} (Selected: ${occupation}).`);
      reasons_hi.push(`यह मुख्य रूप से ${elig.occupation.join(', ')} के लिए है।`);
      reasons_hinglish.push(`Ye scheme mukhya roop se ${elig.occupation.join(', ')} ke liye hai.`);
    } else {
      reasons_en.push(`Occupation perfectly matched (${occupation}).`);
      reasons_hi.push(`पेशा पूरी तरह मेल खाता है (${occupation})।`);
      reasons_hinglish.push(`Profession (${occupation}) exactly match karta hai.`);
    }
  }

  let status = 'ELIGIBLE';
  let match_score = 100;

  if (is_ineligible) {
    status = 'INELIGIBLE';
    match_score = Math.max(15, 45 - penalties);
  } else if (penalties > 0) {
    status = 'CONDITIONALLY_ELIGIBLE';
    match_score = Math.max(60, 85 - penalties);
  }

  return {
    status,
    match_score,
    reasons_en,
    reasons_hi,
    reasons_hinglish
  };
}

// Evaluate Profile API
export async function evaluateProfile(userProfile) {
  try {
    const res = await fetch(`${API_BASE}/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_profile: userProfile }),
      signal: AbortSignal.timeout(3000)
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('[YojanaMitra] Backend offline, computing eligibility locally in browser engine.');
  }

  // Local fallback
  const evaluated = localSchemes.map(s => {
    const result = evaluateSchemeLocally(s, userProfile);
    return { ...s, eligibility_result: result };
  });

  evaluated.sort((a, b) => b.eligibility_result.match_score - a.eligibility_result.match_score);

  const eligible = evaluated.filter(s => s.eligibility_result.status === 'ELIGIBLE');
  const conditional = evaluated.filter(s => s.eligibility_result.status === 'CONDITIONALLY_ELIGIBLE');
  const ineligible = evaluated.filter(s => s.eligibility_result.status === 'INELIGIBLE');

  return {
    total_evaluated: evaluated.length,
    eligible_count: eligible.length,
    conditional_count: conditional.length,
    ineligible_count: ineligible.length,
    eligible_schemes: eligible,
    conditional_schemes: conditional,
    ineligible_schemes: ineligible,
    all_ranked: evaluated
  };
}

// Conversational RAG Chat API
export async function sendChatMessage(query, userProfile = {}, language = 'hinglish') {
  try {
    const res = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, user_profile: userProfile, language }),
      signal: AbortSignal.timeout(5000)
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('[YojanaMitra] Backend offline, generating RAG response client-side.');
  }

  // Client-side instant RAG Generator
  const qLower = query.toLowerCase();
  const scored = localSchemes.map(s => {
    const elig = evaluateSchemeLocally(s, userProfile);
    let textScore = 0;
    (s.keywords || []).forEach(kw => {
      if (qLower.includes(kw.toLowerCase())) textScore += 20;
    });
    if (s.name_en.toLowerCase().includes(qLower)) textScore += 30;
    if (s.name_hi && query.includes(s.name_hi)) textScore += 30;

    let composite = textScore;
    if (elig.status === 'ELIGIBLE') composite += 60;
    else if (elig.status === 'CONDITIONALLY_ELIGIBLE') composite += 30;

    return { ...s, eligibility_result: elig, retrieval_score: composite };
  });

  scored.sort((a, b) => b.retrieval_score - a.retrieval_score);
  const top = scored[0] || localSchemes[0];

  let replyText = '';
  if (language === 'hindi') {
    replyText = `🙏 **नमस्ते! मैं हूँ योजनामित्र - आपका सरकारी योजना सलाहकार।**\n\n` +
      `🎉 **आपके लिए शीर्ष योजना:** **${top.name_hi || top.name_en}** (${top.eligibility_result.status === 'ELIGIBLE' ? '100% पात्र' : 'समीक्षाधीन'})\n\n` +
      `### 💰 **योजना के लाभ:**\n${top.benefits_hi || top.benefits_en}\n\n` +
      `### 🔍 **पात्रता का कारण:**\n` +
      (top.eligibility_result.reasons_hi.length ? top.eligibility_result.reasons_hi.map(r => `- ${r}`).join('\n') : '- आपकी सामान्य प्रोफाइल इस योजना से मेल खाती है।') + '\n\n' +
      `### 📄 **आवश्यक दस्तावेज:**\n` +
      (top.documents_required || []).map(d => `  ✅ ${d}`).join('\n') + '\n\n' +
      `🌐 **आधिकारिक पोर्टल:** [${top.official_portal}](${top.official_portal})\n\n` +
      `🚀 **आवेदन प्रक्रिया:** ${top.application_process_hi || top.application_process_en}`;
  } else {
    // Hinglish / English default
    replyText = `🙏 **Namaste! Main hoon YojanaMitra - Aapka Sarkari Scheme Advisor.**\n\n` +
      `🎉 **Aapke liye Top Scheme:** **${top.name_en}** (${top.eligibility_result.status === 'ELIGIBLE' ? '100% Eligible' : 'Check Eligibility'})\n\n` +
      `### 💰 **Yojana Ka Fayda (Benefits):**\n${top.benefits_en}\n\n` +
      `### 🔍 **Aapki Eligibility Ka Reason:**\n` +
      (top.eligibility_result.reasons_hinglish.length ? top.eligibility_result.reasons_hinglish.map(r => `- ${r}`).join('\n') : '- Aapke basic profile parameters criteria ko satisfy karte hain.') + '\n\n' +
      `### 📄 **Zaroori Documents:**\n` +
      (top.documents_required || []).map(d => `  ✅ ${d}`).join('\n') + '\n\n' +
      `🌐 **Official Portal Link:** [${top.official_portal}](${top.official_portal})\n\n` +
      `🚀 **Aavedan Kaise Karein:** ${top.application_process_en}`;
  }

  return {
    reply: replyText,
    model_used: 'client-offline-rag-engine',
    detected_language: language,
    extracted_profile: userProfile,
    top_schemes: scored.slice(0, 3)
  };
}

export { localSchemes };

import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Sparkles, 
  Download, 
  ExternalLink, 
  Filter, 
  IndianRupee,
  Layers,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { evaluateProfile } from '../services/api';

export default function EligibilityWizard({ 
  userProfile, 
  setUserProfile, 
  language, 
  onSelectScheme 
}) {
  const [evaluation, setEvaluation] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [filterTab, setFilterTab] = useState('ALL'); // 'ALL', 'ELIGIBLE', 'CONDITIONAL', 'INELIGIBLE'

  // Trigger evaluation on mount or when profile changes
  const runEvaluation = async () => {
    setIsCalculating(true);
    try {
      const data = await evaluateProfile(userProfile);
      setEvaluation(data);

      if (data.eligible_count > 0) {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 }
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsCalculating(false);
    }
  };

  useEffect(() => {
    runEvaluation();
  }, []);

  const handleProfileChange = (field, value) => {
    setUserProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Filter schemes based on active tab
  const getFilteredSchemes = () => {
    if (!evaluation) return [];
    if (filterTab === 'ELIGIBLE') return evaluation.eligible_schemes;
    if (filterTab === 'CONDITIONAL') return evaluation.conditional_schemes;
    if (filterTab === 'INELIGIBLE') return evaluation.ineligible_schemes;
    return evaluation.all_ranked;
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="wizard-container animate-fade-in">
      {/* Profile Form Card */}
      <div className="glass-panel profile-card-panel">
        <div className="panel-header-row">
          <div>
            <h2 className="panel-title">
              <Sparkles size={20} className="text-saffron" /> 
              {language === 'hindi' ? "नागरिक प्रोफाइल एवं पात्रता कैलकुलेटर" : "Citizen Profile & Eligibility Evaluator"}
            </h2>
            <p className="panel-desc">
              {language === 'hindi' 
                ? "अपनी जानकारी दर्ज करें, सिस्टम सभी 14+ केंद्रीय एवं राज्य योजनाओं के नियमों का मिलान करेगा।" 
                : "Fill in your criteria to simulate rule-based constraint evaluation across all Central & State schemes."}
            </p>
          </div>
          <button 
            type="button" 
            className="btn btn-primary"
            onClick={runEvaluation}
            disabled={isCalculating}
            id="wizard-evaluate-btn"
          >
            {isCalculating ? "Evaluating..." : "Check Eligibility"}
          </button>
        </div>

        {/* Form Grid */}
        <div className="profile-grid">
          {/* Age */}
          <div className="form-group">
            <label className="form-label">
              {language === 'hindi' ? "आयु (वर्ष में):" : "Age (Years):"} <strong>{userProfile.age || 25}</strong>
            </label>
            <input 
              type="range" 
              min="1" 
              max="80" 
              value={userProfile.age || 25}
              onChange={(e) => handleProfileChange('age', parseInt(e.target.value))}
              className="range-slider"
            />
          </div>

          {/* Gender */}
          <div className="form-group">
            <label className="form-label">{language === 'hindi' ? "लिंग (Gender):" : "Gender:"}</label>
            <select 
              value={userProfile.gender || 'All'}
              onChange={(e) => handleProfileChange('gender', e.target.value)}
              className="form-select"
            >
              <option value="All">All / कोई भी</option>
              <option value="Female">Female / महिला</option>
              <option value="Male">Male / पुरुष</option>
            </select>
          </div>

          {/* Annual Income */}
          <div className="form-group">
            <label className="form-label">
              {language === 'hindi' ? "वार्षिक पारिवारिक आय (₹):" : "Annual Household Income (₹):"}
            </label>
            <input 
              type="number" 
              value={userProfile.annual_income || ''}
              onChange={(e) => handleProfileChange('annual_income', e.target.value ? parseFloat(e.target.value) : null)}
              placeholder="e.g. 150000"
              className="form-input"
            />
            {/* Quick Income Chips */}
            <div className="income-chips">
              <button 
                type="button" 
                className="income-chip" 
                onClick={() => handleProfileChange('annual_income', 120000)}
              >
                ₹1.2L (BPL)
              </button>
              <button 
                type="button" 
                className="income-chip" 
                onClick={() => handleProfileChange('annual_income', 250000)}
              >
                ₹2.5L (Ayushman Cap)
              </button>
              <button 
                type="button" 
                className="income-chip" 
                onClick={() => handleProfileChange('annual_income', 500000)}
              >
                ₹5.0L
              </button>
            </div>
          </div>

          {/* Occupation */}
          <div className="form-group">
            <label className="form-label">{language === 'hindi' ? "पेशा / व्यवसाय:" : "Occupation:"}</label>
            <select 
              value={userProfile.occupation || 'Farmer'}
              onChange={(e) => handleProfileChange('occupation', e.target.value)}
              className="form-select"
            >
              <option value="Farmer">Farmer (किसान)</option>
              <option value="Student">Student (छात्र/छात्रा)</option>
              <option value="Small Business Owner">Small Business / Shopkeeper (व्यापारी/दुकानदार)</option>
              <option value="Artisan">Artisan / Craftsperson (विश्वकर्मा कारीगर)</option>
              <option value="Street Vendor">Street Vendor (रेहड़ी-पटरी ठेलेवाला)</option>
              <option value="Laborer">Daily Wage Laborer (मजदूर)</option>
              <option value="Homemaker">Homemaker (गृहणी)</option>
              <option value="Unemployed">Unemployed Youth (बेरोजगार युवा)</option>
              <option value="All">Other / All</option>
            </select>
          </div>

          {/* State */}
          <div className="form-group">
            <label className="form-label">{language === 'hindi' ? "गृह राज्य (State):" : "Residing State:"}</label>
            <select 
              value={userProfile.state || 'Uttar Pradesh'}
              onChange={(e) => handleProfileChange('state', e.target.value)}
              className="form-select"
            >
              <option value="All">All-India (समस्त भारत)</option>
              <option value="Uttar Pradesh">Uttar Pradesh (उत्तर प्रदेश)</option>
              <option value="Madhya Pradesh">Madhya Pradesh (मध्य प्रदेश)</option>
              <option value="Bihar">Bihar (बिहार)</option>
              <option value="Rajasthan">Rajasthan (राजस्थान)</option>
              <option value="Maharashtra">Maharashtra (महाराष्ट्र)</option>
              <option value="Gujarat">Gujarat (गुजरात)</option>
              <option value="Haryana">Haryana (हरियाणा)</option>
              <option value="Punjab">Punjab (पंजाब)</option>
              <option value="Delhi">Delhi (दिल्ली)</option>
            </select>
          </div>

          {/* Land Ownership */}
          <div className="form-group">
            <label className="form-label">
              {language === 'hindi' ? "कृषि भूमि (Land Ownership):" : "Agricultural Land Ownership:"}
            </label>
            <select 
              value={userProfile.land_ownership === true ? "true" : userProfile.land_ownership === false ? "false" : "null"}
              onChange={(e) => {
                const val = e.target.value === "true" ? true : e.target.value === "false" ? false : null;
                handleProfileChange('land_ownership', val);
              }}
              className="form-select"
            >
              <option value="true">Yes - Own cultivable land (अपनी जमीन है)</option>
              <option value="false">No - Landless / Non-farmer (जमीन नहीं है)</option>
              <option value="null">Not specified (उल्लेख नहीं)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Dashboard Header */}
      {evaluation && (
        <div className="results-summary-section">
          {/* Metrics Row */}
          <div className="summary-cards-grid">
            <div 
              className={`metric-card ${filterTab === 'ELIGIBLE' ? 'selected' : ''}`}
              onClick={() => setFilterTab('ELIGIBLE')}
            >
              <div className="metric-icon-wrap emerald">
                <CheckCircle2 size={24} />
              </div>
              <div className="metric-info">
                <span className="metric-val">{evaluation.eligible_count}</span>
                <span className="metric-name">
                  {language === 'hindi' ? "पूर्णतः पात्र योजनाएं" : "100% Eligible Schemes"}
                </span>
              </div>
            </div>

            <div 
              className={`metric-card ${filterTab === 'CONDITIONAL' ? 'selected' : ''}`}
              onClick={() => setFilterTab('CONDITIONAL')}
            >
              <div className="metric-icon-wrap gold">
                <AlertTriangle size={24} />
              </div>
              <div className="metric-info">
                <span className="metric-val">{evaluation.conditional_count}</span>
                <span className="metric-name">
                  {language === 'hindi' ? "सशर्त पात्र योजनाएं" : "Conditionally Eligible"}
                </span>
              </div>
            </div>

            <div 
              className={`metric-card ${filterTab === 'INELIGIBLE' ? 'selected' : ''}`}
              onClick={() => setFilterTab('INELIGIBLE')}
            >
              <div className="metric-icon-wrap rose">
                <XCircle size={24} />
              </div>
              <div className="metric-info">
                <span className="metric-val">{evaluation.ineligible_count}</span>
                <span className="metric-name">
                  {language === 'hindi' ? "अपात्र योजनाएं" : "Ineligible / Excluded"}
                </span>
              </div>
            </div>

            <div className="metric-card export-card" onClick={handlePrint}>
              <div className="metric-icon-wrap navy">
                <Download size={24} />
              </div>
              <div className="metric-info">
                <span className="metric-val">Print/PDF</span>
                <span className="metric-name">Download Citizen Report</span>
              </div>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="filter-pills-row">
            <button 
              className={`pill-btn ${filterTab === 'ALL' ? 'active' : ''}`}
              onClick={() => setFilterTab('ALL')}
            >
              All Analyzed ({evaluation.total_evaluated})
            </button>
            <button 
              className={`pill-btn ${filterTab === 'ELIGIBLE' ? 'active' : ''}`}
              onClick={() => setFilterTab('ELIGIBLE')}
            >
              🟢 Eligible Only ({evaluation.eligible_count})
            </button>
            <button 
              className={`pill-btn ${filterTab === 'CONDITIONAL' ? 'active' : ''}`}
              onClick={() => setFilterTab('CONDITIONAL')}
            >
              🟡 Conditional ({evaluation.conditional_count})
            </button>
            <button 
              className={`pill-btn ${filterTab === 'INELIGIBLE' ? 'active' : ''}`}
              onClick={() => setFilterTab('INELIGIBLE')}
            >
              🔴 Ineligible ({evaluation.ineligible_count})
            </button>
          </div>

          {/* Evaluated Scheme Cards List */}
          <div className="evaluated-schemes-list">
            {getFilteredSchemes().map((scheme) => {
              const res = scheme.eligibility_result || {};
              const isEligible = res.status === 'ELIGIBLE';
              const isConditional = res.status === 'CONDITIONALLY_ELIGIBLE';

              return (
                <div key={scheme.id} className="scheme-evaluated-card glass-panel">
                  {/* Status Banner */}
                  <div className="card-top-row">
                    <div className="card-heading-group">
                      <span className="scheme-ministry">{scheme.ministry} • {scheme.level}</span>
                      <h3 className="scheme-title">
                        {language === 'hindi' && scheme.name_hi ? scheme.name_hi : scheme.name_en}
                      </h3>
                    </div>

                    <div className="card-score-badge">
                      <span className={`badge ${isEligible ? 'badge-eligible' : isConditional ? 'badge-conditional' : 'badge-ineligible'}`}>
                        {isEligible ? 'Eligible (100%)' : isConditional ? `${res.match_score}% Conditional` : 'Ineligible'}
                      </span>
                    </div>
                  </div>

                  {/* Why eligible / ineligible breakdown */}
                  <div className="reasons-box">
                    <span className="reasons-title">
                      {isEligible ? "✅ Eligibility Verification:" : isConditional ? "⚠️ Points to Complete:" : "❌ Reasons for Ineligibility:"}
                    </span>
                    <ul className="reasons-list">
                      {(language === 'hindi' ? res.reasons_hi : res.reasons_hinglish || res.reasons_en || []).map((reason, rIdx) => (
                        <li key={rIdx}>{reason}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Benefit and Action Footer */}
                  <div className="card-footer-row">
                    <div className="benefit-teaser">
                      <span className="teaser-label">Key Benefit:</span>
                      <p className="teaser-text">
                        {language === 'hindi' ? scheme.benefits_hi : scheme.benefits_en}
                      </p>
                    </div>

                    <div className="card-cta-group">
                      <button 
                        className="btn btn-secondary btn-sm"
                        onClick={() => onSelectScheme(scheme)}
                      >
                        Details & Checklist
                      </button>
                      <a 
                        href={scheme.official_portal} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="btn btn-primary btn-sm"
                      >
                        Apply <ExternalLink size={13} />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

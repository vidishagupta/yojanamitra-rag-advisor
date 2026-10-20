import React, { useState } from 'react';
import { 
  X, 
  ExternalLink, 
  CheckSquare, 
  Square, 
  Building2, 
  IndianRupee, 
  FileCheck2, 
  ShieldCheck, 
  CheckCircle2,
  Calendar,
  User,
  MapPin
} from 'lucide-react';

export default function SchemeModal({ scheme, onClose, language }) {
  if (!scheme) return null;

  const [checkedDocs, setCheckedDocs] = useState({});
  const [modalLang, setModalLang] = useState(language === 'hindi' ? 'hi' : 'en');

  const toggleDoc = (doc) => {
    setCheckedDocs(prev => ({
      ...prev,
      [doc]: !prev[doc]
    }));
  };

  const totalDocs = (scheme.documents_required || []).length;
  const readyDocs = Object.values(checkedDocs).filter(Boolean).length;
  const readinessPercent = totalDocs > 0 ? Math.round((readyDocs / totalDocs) * 100) : 0;

  const elig = scheme.eligibility || {};

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container glass-panel" onClick={(e) => e.stopPropagation()}>
        {/* Modal Top Bar */}
        <div className="modal-header">
          <div className="modal-header-info">
            <span className="badge badge-tag">{scheme.level} Scheme • {scheme.category}</span>
            <h2 className="modal-title">
              {modalLang === 'hi' && scheme.name_hi ? scheme.name_hi : scheme.name_en}
            </h2>
            <p className="modal-ministry">{scheme.ministry}</p>
          </div>

          <div className="modal-header-actions">
            {/* Lang toggle inside modal */}
            <div className="modal-lang-toggle">
              <button 
                className={`toggle-sm-btn ${modalLang === 'en' ? 'active' : ''}`}
                onClick={() => setModalLang('en')}
              >
                EN
              </button>
              <button 
                className={`toggle-sm-btn ${modalLang === 'hi' ? 'active' : ''}`}
                onClick={() => setModalLang('hi')}
              >
                हिन्दी
              </button>
            </div>

            <button className="btn-close-modal" onClick={onClose}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="modal-body-scroll">
          {/* Summary */}
          <div className="modal-section">
            <h3 className="section-title">Overview</h3>
            <p className="overview-text">
              {modalLang === 'hi' && scheme.description_hi ? scheme.description_hi : scheme.description_en}
            </p>
          </div>

          {/* Benefits Box */}
          <div className="modal-benefit-box">
            <span className="benefit-badge">
              <IndianRupee size={16} /> Scheme Benefits
            </span>
            <p className="benefit-highlight">
              {modalLang === 'hi' && scheme.benefits_hi ? scheme.benefits_hi : scheme.benefits_en}
            </p>
          </div>

          {/* Eligibility Criteria Matrix */}
          <div className="modal-section">
            <h3 className="section-title">Eligibility Criteria (पात्रता मानदंड)</h3>
            <div className="criteria-matrix-grid">
              <div className="criteria-cell">
                <span className="cell-label"><Calendar size={14} /> Age Limit</span>
                <span className="cell-val">
                  {elig.min_age !== null ? `${elig.min_age} yrs` : '0 yrs'} - {elig.max_age !== null ? `${elig.max_age} yrs` : 'No upper limit'}
                </span>
              </div>

              <div className="criteria-cell">
                <span className="cell-label"><User size={14} /> Gender</span>
                <span className="cell-val">{elig.gender || 'All'}</span>
              </div>

              <div className="criteria-cell">
                <span className="cell-label"><IndianRupee size={14} /> Max Income</span>
                <span className="cell-val">
                  {elig.max_annual_income !== null ? `₹${elig.max_annual_income.toLocaleString('en-IN')}/year` : 'No Income Ceiling'}
                </span>
              </div>

              <div className="criteria-cell">
                <span className="cell-label"><MapPin size={14} /> Target States</span>
                <span className="cell-val">{elig.states ? elig.states.join(', ') : 'All India'}</span>
              </div>

              <div className="criteria-cell full-width">
                <span className="cell-label"><ShieldCheck size={14} /> Special Criteria</span>
                <span className="cell-val">
                  {modalLang === 'hi' && elig.special_conditions_hi ? elig.special_conditions_hi : elig.special_conditions_en}
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Document Readiness Tracker */}
          <div className="modal-section">
            <div className="docs-tracker-header">
              <h3 className="section-title">
                <FileCheck2 size={18} className="text-emerald" /> Required Documents Readiness
              </h3>
              <span className="tracker-score">
                {readyDocs}/{totalDocs} Ready ({readinessPercent}%)
              </span>
            </div>

            {/* Progress bar */}
            <div className="progress-bar-bg">
              <div 
                className="progress-bar-fill" 
                style={{ width: `${readinessPercent}%` }} 
              />
            </div>

            <p className="tracker-hint">
              Check the boxes below to verify if you have all papers before applying:
            </p>

            <div className="docs-checklist">
              {(scheme.documents_required || []).map((doc, idx) => {
                const isChecked = !!checkedDocs[doc];
                return (
                  <div 
                    key={idx} 
                    className={`doc-check-item ${isChecked ? 'ready' : ''}`}
                    onClick={() => toggleDoc(doc)}
                  >
                    {isChecked ? (
                      <CheckSquare size={18} className="text-emerald" />
                    ) : (
                      <Square size={18} className="text-muted" />
                    )}
                    <span className="doc-name">{doc}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Application Walkthrough */}
          <div className="modal-section">
            <h3 className="section-title">How to Apply (आवेदन प्रक्रिया)</h3>
            <div className="application-steps-box">
              <p className="app-steps-text">
                {modalLang === 'hi' && scheme.application_process_hi ? scheme.application_process_hi : scheme.application_process_en}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Close
          </button>
          <a 
            href={scheme.official_portal} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="btn btn-primary"
          >
            Apply on Official Government Portal <ExternalLink size={16} />
          </a>
        </div>
      </div>
    </div>
  );
}

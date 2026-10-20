import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  ExternalLink, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight,
  Landmark,
  IndianRupee
} from 'lucide-react';
import { localSchemes } from '../services/api';

export default function SchemesExplorer({ onSelectScheme, language }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLevel, setSelectedLevel] = useState('All');

  const categories = [
    'All',
    'Agriculture',
    'Healthcare',
    'Housing',
    'Women Empowerment',
    'Business & MSME',
    'Education & Skilling',
    'Social Welfare'
  ];

  const filteredSchemes = localSchemes.filter(s => {
    // Category match
    if (selectedCategory !== 'All' && s.category !== selectedCategory) return false;
    
    // Level match
    if (selectedLevel !== 'All' && s.level !== selectedLevel) return false;

    // Search query match
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const inEn = s.name_en.toLowerCase().includes(q) || s.description_en.toLowerCase().includes(q);
      const inHi = (s.name_hi && s.name_hi.includes(q)) || (s.description_hi && s.description_hi.includes(q));
      const inKw = (s.keywords || []).some(k => k.toLowerCase().includes(q));
      return inEn || inHi || inKw;
    }

    return true;
  });

  return (
    <div className="explorer-container animate-fade-in">
      {/* Search & Filter Header Bar */}
      <div className="explorer-controls-panel glass-panel">
        <div className="search-bar-row">
          <div className="search-input-wrapper">
            <Search size={18} className="search-icon text-muted" />
            <input 
              type="text" 
              placeholder={
                language === 'hindi' 
                  ? "योजना का नाम, कीवर्ड या मंत्रालय खोजें (जैसे: किसान, 5 लाख, छात्रवृत्ति, लोन)..." 
                  : "Search schemes by keyword, benefit, or ministry (e.g. kisan, loan, scholarship, ayushman)..."
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
              id="schemes-search-bar"
            />
          </div>

          <div className="level-select-wrapper">
            <select 
              value={selectedLevel} 
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="form-select select-compact"
            >
              <option value="All">Central & State</option>
              <option value="Central">Central Only</option>
              <option value="State">State Specific</option>
            </select>
          </div>
        </div>

        {/* Category Pills */}
        <div className="category-chips-scroll">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`cat-chip ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Schemes Grid */}
      <div className="schemes-directory-header">
        <h2 className="directory-count-title">
          Showing {filteredSchemes.length} Verified Schemes
        </h2>
        <span className="directory-meta text-muted">
          Updated with Direct Benefit Transfer (DBT) Guidelines 2026
        </span>
      </div>

      <div className="schemes-cards-grid">
        {filteredSchemes.map((scheme) => (
          <div 
            key={scheme.id} 
            className="scheme-card glass-panel"
            onClick={() => onSelectScheme(scheme)}
          >
            <div className="card-header-line">
              <span className="badge badge-tag">{scheme.category}</span>
              <span className="scheme-level-tag">{scheme.level}</span>
            </div>

            <h3 className="card-scheme-title">
              {language === 'hindi' && scheme.name_hi ? scheme.name_hi : scheme.name_en}
            </h3>

            <p className="card-ministry-text">
              <Landmark size={13} className="text-muted" /> {scheme.ministry}
            </p>

            <p className="card-desc-snippet">
              {language === 'hindi' && scheme.description_hi 
                ? scheme.description_hi 
                : scheme.description_en}
            </p>

            {/* Benefit Preview */}
            <div className="card-benefit-pill">
              <IndianRupee size={14} className="text-emerald" />
              <span>{language === 'hindi' ? scheme.benefits_hi : scheme.benefits_en}</span>
            </div>

            <div className="card-actions-row">
              <span className="docs-count-text">
                {scheme.documents_required?.length || 0} Docs Required
              </span>
              <button className="btn btn-outline btn-sm">
                View & Apply <ArrowRight size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

import React from 'react';
import { 
  Bot, 
  Sparkles, 
  CheckCircle2, 
  Compass, 
  FileText, 
  Languages, 
  HelpCircle 
} from 'lucide-react';

export default function Header({ 
  activeTab, 
  setActiveTab, 
  language, 
  setLanguage, 
  backendStatus 
}) {
  return (
    <header className="header-wrapper">
      <div className="container header-container">
        {/* Brand & Emblem */}
        <div className="brand-section">
          <div className="brand-logo-glow">
            <span className="brand-icon">🇮🇳</span>
          </div>
          <div className="brand-text">
            <div className="brand-title-row">
              <h1 className="brand-title">
                योजना<span className="text-saffron">मित्र</span>
                <span className="brand-en"> (YojanaMitra)</span>
              </h1>
              <span className="badge badge-tag brand-badge">B.Tech Capstone</span>
            </div>
            <p className="brand-subtitle">
              Eligibility-Aware Multilingual RAG Advisor • Central & State Government Schemes
            </p>
          </div>
        </div>

        {/* Center / Navigation Tabs */}
        <nav className="nav-tabs" aria-label="Main Navigation">
          <button 
            className={`nav-tab-btn ${activeTab === 'chat' ? 'active' : ''}`}
            onClick={() => setActiveTab('chat')}
            id="tab-chat-btn"
          >
            <Bot size={18} />
            <span>AI Advisor</span>
          </button>

          <button 
            className={`nav-tab-btn ${activeTab === 'wizard' ? 'active' : ''}`}
            onClick={() => setActiveTab('wizard')}
            id="tab-wizard-btn"
          >
            <CheckCircle2 size={18} />
            <span>Eligibility Wizard</span>
          </button>

          <button 
            className={`nav-tab-btn ${activeTab === 'schemes' ? 'active' : ''}`}
            onClick={() => setActiveTab('schemes')}
            id="tab-schemes-btn"
          >
            <Compass size={18} />
            <span>All Schemes</span>
          </button>

          <button 
            className={`nav-tab-btn ${activeTab === 'research' ? 'active' : ''}`}
            onClick={() => setActiveTab('research')}
            id="tab-research-btn"
          >
            <FileText size={18} />
            <span>Project Specs & Viva</span>
          </button>
        </nav>

        {/* Right Controls: Language Selector & Status */}
        <div className="header-controls">
          {/* Language Selector */}
          <div className="lang-switcher">
            <Languages size={16} className="text-muted" />
            <select 
              value={language} 
              onChange={(e) => setLanguage(e.target.value)}
              className="lang-select"
              aria-label="Select Interface Language"
            >
              <option value="hinglish">Hinglish (मिक्स)</option>
              <option value="hindi">हिन्दी (Hindi)</option>
              <option value="english">English</option>
            </select>
          </div>

          {/* Engine Status Pill */}
          <div 
            className="status-pill" 
            title={backendStatus.status === 'healthy' ? 'FastAPI Backend Connected' : 'Running on Client Offline Engine'}
          >
            <span className={`status-dot ${backendStatus.status === 'healthy' ? 'online' : 'offline'}`} />
            <span className="status-label">
              {backendStatus.status === 'healthy' ? 'FastAPI RAG' : 'Local Engine'}
            </span>
          </div>

          {/* GitHub Link */}
          <a 
            href="https://github.com" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="btn btn-secondary btn-icon"
            title="View GitHub Repository"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
            </svg>
          </a>
        </div>
      </div>
    </header>
  );
}

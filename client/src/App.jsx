import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ChatAdvisor from './components/ChatAdvisor';
import EligibilityWizard from './components/EligibilityWizard';
import SchemesExplorer from './components/SchemesExplorer';
import ResearchSpecs from './components/ResearchSpecs';
import SchemeModal from './components/SchemeModal';
import { checkBackendHealth } from './services/api';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('chat'); // 'chat' | 'wizard' | 'schemes' | 'research'
  const [language, setLanguage] = useState('hinglish'); // 'hinglish' | 'hindi' | 'english'
  const [selectedScheme, setSelectedScheme] = useState(null);
  const [backendStatus, setBackendStatus] = useState({ status: 'checking', schemes_count: 14 });

  // Shared synchronized profile state
  const [userProfile, setUserProfile] = useState({
    age: 24,
    gender: 'All',
    annual_income: 180000,
    occupation: 'Farmer',
    state: 'Uttar Pradesh',
    caste: 'All',
    land_ownership: true
  });

  useEffect(() => {
    async function initHealth() {
      const status = await checkBackendHealth();
      setBackendStatus(status);
    }
    initHealth();
  }, []);

  return (
    <div className="app-container">
      {/* Top Navbar */}
      <Header 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        language={language} 
        setLanguage={setLanguage}
        backendStatus={backendStatus}
      />

      {/* Main View Container */}
      <main className="main-content">
        <div className="container">
          {activeTab === 'chat' && (
            <ChatAdvisor 
              language={language} 
              onSelectScheme={(scheme) => setSelectedScheme(scheme)}
              userProfile={userProfile}
            />
          )}

          {activeTab === 'wizard' && (
            <EligibilityWizard 
              userProfile={userProfile}
              setUserProfile={setUserProfile}
              language={language}
              onSelectScheme={(scheme) => setSelectedScheme(scheme)}
            />
          )}

          {activeTab === 'schemes' && (
            <SchemesExplorer 
              onSelectScheme={(scheme) => setSelectedScheme(scheme)}
              language={language}
            />
          )}

          {activeTab === 'research' && (
            <ResearchSpecs />
          )}
        </div>
      </main>

      {/* Detail Scheme Modal */}
      {selectedScheme && (
        <SchemeModal 
          scheme={selectedScheme}
          onClose={() => setSelectedScheme(null)}
          language={language}
        />
      )}

      {/* Footer */}
      <footer className="footer-bar">
        <div className="container footer-container">
          <div className="footer-left">
            <span className="footer-emblem">🇮🇳</span>
            <span>
              <strong>YojanaMitra AI</strong> • Eligibility-Aware Multilingual Retrieval-Augmented Advisor for Indian Government Schemes
            </span>
          </div>
          <div className="footer-right">
            <span>Digital India • Citizen Welfare AI Portal</span>
            <span>•</span>
            <span className="text-muted">MIT Open Source License</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;

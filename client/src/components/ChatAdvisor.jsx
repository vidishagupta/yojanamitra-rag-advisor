import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  AlertCircle, 
  CheckCircle, 
  ExternalLink, 
  RefreshCw,
  FileCheck,
  UserCheck
} from 'lucide-react';
import { sendChatMessage } from '../services/api';

export default function ChatAdvisor({ language, onSelectScheme, userProfile }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: language === 'hindi'
        ? `🙏 **नमस्ते! मैं हूँ योजनामित्र - आपका सरकारी योजना पात्रता सलाहकार।**\n\nआप अपनी आवश्यकता, उम्र, पेशा, या पारिवारिक स्थिति के बारे में हिंदी या हिंग्लिश में पूछ सकते हैं।\n\nउदाहरण के लिए: *"मेरी उम्र 22 साल है, मैं यूपी से बीटेक छात्र हूँ, मुझे कौन सी स्कॉलरशिप मिल सकती है?"*`
        : `🙏 **Namaste! Main hoon YojanaMitra - Aapka Government Scheme Advisor.**\n\nMain aapki profile aur eligibility ke hisaab se sahi sarkari yojana dhoondhne me madad karunga.\n\nAap mujhse Hindi, Hinglish ya English me pooch sakte hain.\n\n*Neeche diye gaye kisi bhi sawaal par click karein ya apna sawaal type karein:*`,
      top_schemes: [],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [speakingId, setSpeakingId] = useState(null);

  const messagesEndRef = useRef(null);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Sample prompt suggestions
  const samplePrompts = [
    {
      label: "🌾 Kisan Samman Nidhi",
      query: language === 'hindi' 
        ? "मैं उत्तर प्रदेश से किसान हूँ, मेरी अपनी 2 एकड़ जमीन है, मुझे सरकारी आर्थिक मदद चाहिए"
        : "Main UP se kisan hoon, meri apni 2 acre kheti ki zameen hai, kya mujhe koi financial help milegi?"
    },
    {
      label: "🏥 Ayushman Bharat Card",
      query: language === 'hindi'
        ? "मुफ्त इलाज के लिए ₹5 लाख वाला आयुष्मान कार्ड कैसे बनेगा? मेरी आय 1.5 लाख है"
        : "Free ilaj ke liye 5 lakh wala Ayushman card kaise banega? Family income 1.5 lakh hai"
    },
    {
      label: "🎓 Student Scholarship",
      query: language === 'hindi'
        ? "मैं 21 साल का कॉलेज छात्र हूँ, कॉलेज फीस और पढ़ाई के लिए सरकारी स्कॉलरशिप बताओ"
        : "Main 21 saal ka college student hoon, padhai ke liye scholarship ya stipend milega?"
    },
    {
      label: "💼 Business / Mudra Loan",
      query: language === 'hindi'
        ? "मुझे नई दुकान खोलने के लिए बिना गारंटी का सरकारी लोन चाहिए"
        : "Mujhe naya business shuru karne ke liye bina guarantee ka loan chahiye"
    },
    {
      label: "🌸 Ladli Behna / Kanya Sumangala",
      query: language === 'hindi'
        ? "मेरी 5 साल की बेटी है, उसकी पढ़ाई और भविष्य के लिए कौन सी सरकारी योजना है?"
        : "Meri 5 saal ki beti hai, uske future aur padhai ke liye sarkari scheme batao"
    }
  ];

  const handleSendMessage = async (queryText = inputText) => {
    const textToSend = queryText.trim();
    if (!textToSend || isLoading) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await sendChatMessage(textToSend, userProfile, language);
      const botMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: response.reply,
        model_used: response.model_used,
        detected_language: response.detected_language,
        top_schemes: response.top_schemes || [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'bot',
          text: "Kripya koshish karein, network ya server response me deri ho rahi hai.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Web Speech API Voice Recognition (Speech-to-Text)
  const toggleVoiceRecording = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice input is not supported in this browser. Please use Google Chrome or Microsoft Edge.");
      return;
    }

    if (isRecording) {
      setIsRecording(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = language === 'hindi' ? 'hi-IN' : 'en-IN';
      recognition.interimResults = false;
      recognition.continuous = false;

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputText(transcript);
        setIsRecording(false);
        handleSendMessage(transcript);
      };

      recognition.onerror = () => {
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.start();
    } catch (err) {
      setIsRecording(false);
    }
  };

  // Text-to-Speech (Audio Voice output)
  const speakText = (msgId, text) => {
    if (!('speechSynthesis' in window)) return;

    if (speakingId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    
    // Clean markdown symbols for natural reading
    const cleanText = text
      .replace(/[*#_~`\[\]()]/g, '')
      .replace(/https?:\/\/\S+/g, '')
      .replace(/✅|🙏|💰|🔍|📄|🚀|🌐|🎉|⚠️|ℹ️/g, '');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = language === 'hindi' ? 'hi-IN' : 'en-IN';
    utterance.rate = 0.95;

    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);

    setSpeakingId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="chat-interface-container animate-fade-in">
      {/* Suggestions Bar */}
      <div className="prompts-bar">
        <span className="prompts-title">
          <Sparkles size={14} className="text-saffron" /> Popular Questions:
        </span>
        <div className="prompts-scroll">
          {samplePrompts.map((p, idx) => (
            <button
              key={idx}
              className="prompt-chip"
              onClick={() => handleSendMessage(p.query)}
              disabled={isLoading}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Messages Window */}
      <div className="messages-window" id="messages-scroll-area">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`message-row ${msg.sender === 'user' ? 'message-user' : 'message-bot'}`}
          >
            {msg.sender === 'bot' && (
              <div className="bot-avatar">
                <span className="avatar-emblem">🏛️</span>
              </div>
            )}

            <div className={`message-bubble ${msg.sender === 'user' ? 'bubble-user' : 'bubble-bot'}`}>
              <div className="message-header-row">
                <span className="sender-name">
                  {msg.sender === 'user' ? 'You (नागरिक)' : 'YojanaMitra AI (योजनामित्र)'}
                </span>
                <div className="message-actions">
                  <span className="message-time">{msg.timestamp}</span>
                  {msg.sender === 'bot' && (
                    <button 
                      className="btn-speak" 
                      onClick={() => speakText(msg.id, msg.text)}
                      title={speakingId === msg.id ? "Stop Listening" : "Listen in Voice"}
                    >
                      {speakingId === msg.id ? <VolumeX size={15} className="text-saffron" /> : <Volume2 size={15} />}
                    </button>
                  )}
                </div>
              </div>

              {/* Message Content formatted */}
              <div className="message-content">
                {msg.text.split('\n\n').map((block, bIdx) => {
                  if (block.startsWith('###')) {
                    return <h4 key={bIdx} className="content-h4">{block.replace('###', '').trim()}</h4>;
                  }
                  if (block.startsWith('- ')) {
                    const items = block.split('\n');
                    return (
                      <ul key={bIdx} className="content-ul">
                        {items.map((it, iIdx) => (
                          <li key={iIdx}>{it.replace(/^-\s*/, '')}</li>
                        ))}
                      </ul>
                    );
                  }
                  return <p key={bIdx} className="content-p">{block}</p>;
                })}
              </div>

              {/* Embedded Matched Scheme Cards in Chat */}
              {msg.top_schemes && msg.top_schemes.length > 0 && (
                <div className="matched-schemes-preview">
                  <span className="preview-label">
                    <FileCheck size={14} className="text-emerald" /> Evaluated Matching Schemes:
                  </span>
                  <div className="preview-cards-grid">
                    {msg.top_schemes.slice(0, 2).map((scheme) => {
                      const res = scheme.eligibility_result || {};
                      const isEligible = res.status === 'ELIGIBLE';
                      const isConditional = res.status === 'CONDITIONALLY_ELIGIBLE';

                      return (
                        <div 
                          key={scheme.id} 
                          className="preview-card"
                          onClick={() => onSelectScheme(scheme)}
                        >
                          <div className="preview-card-header">
                            <span className="preview-scheme-name">
                              {language === 'hindi' && scheme.name_hi ? scheme.name_hi : scheme.name_en}
                            </span>
                            <span className={`badge ${isEligible ? 'badge-eligible' : isConditional ? 'badge-conditional' : 'badge-ineligible'}`}>
                              {res.match_score || 85}% Match
                            </span>
                          </div>
                          <p className="preview-category">{scheme.category} • {scheme.level}</p>
                          <button className="preview-btn">
                            View Details <ExternalLink size={12} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {msg.model_used && (
                <div className="message-footer-meta">
                  <span>Engine: {msg.model_used}</span>
                  {msg.detected_language && <span>Lang: {msg.detected_language}</span>}
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="message-row message-bot">
            <div className="bot-avatar">
              <span className="avatar-emblem">🏛️</span>
            </div>
            <div className="message-bubble bubble-bot loading-bubble">
              <div className="loading-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <span className="loading-text">
                Analyzing criteria & eligibility rules in Hindi/Hinglish...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Box Bar */}
      <form 
        className="chat-input-bar glass-panel"
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
      >
        <button
          type="button"
          className={`btn-icon-round ${isRecording ? 'recording' : ''}`}
          onClick={toggleVoiceRecording}
          title={isRecording ? "Listening... Click to stop" : "Speak in Hindi or Hinglish"}
        >
          {isRecording ? <MicOff size={18} className="text-rose" /> : <Mic size={18} />}
        </button>

        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={
            isRecording 
              ? "Listening... bolna shuru karein..."
              : language === 'hindi'
                ? "अपनी उम्र, आय, राज्य या योजना के बारे में पूछें..."
                : "Type in Hindi, Hinglish, or English (e.g. 'Main UP se kisan hoon...')"
          }
          className="chat-input-field"
          disabled={isLoading}
          autoFocus
          id="advisor-chat-input"
        />

        <button 
          type="submit" 
          className="btn btn-primary btn-send" 
          disabled={!inputText.trim() || isLoading}
          id="advisor-send-btn"
        >
          <Send size={16} />
          <span>Send</span>
        </button>
      </form>
    </div>
  );
}

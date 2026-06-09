'use client';

import { useState, useEffect } from 'react';
import { Search, Bell, Sparkles, ChevronDown, X, Send, TrendingUp, AlertCircle, FileText, RefreshCw, CheckCircle2 } from 'lucide-react';
import { LOGGED_IN_DOCTOR, MOCK_NOTIFICATIONS } from '@/data/mockData';
import { useRouter } from 'next/navigation';

export function Header() {
  const router = useRouter();
  const unreadCount = MOCK_NOTIFICATIONS.filter(n => !n.read).length;

  // AI Assist Panel States
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userStr = sessionStorage.getItem('mc_user');
      if (userStr) {
        try {
          setCurrentUser(JSON.parse(userStr));
        } catch (e) {}
      }
    }
  }, []);

  const userDetails = currentUser || LOGGED_IN_DOCTOR;
  const initials = userDetails.name ? userDetails.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() : 'DR';

  const [isAiOpen, setIsAiOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'insights' | 'ask'>('insights');
  const [messages, setMessages] = useState<Array<{ sender: 'ai' | 'user'; text: string; time: string }>>([
    {
      sender: 'ai',
      text: 'Hello Dr. Kofi. I am your MediChain Clinical Copilot. Ask me anything about your active patients, on-chain records, or draft a referral letter.',
      time: 'Just now'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || inputValue;
    if (!text.trim()) return;

    // Add user message
    const newMsg = { sender: 'user' as const, text, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setMessages(prev => [...prev, newMsg]);
    if (!textToSend) setInputValue('');

    // Trigger typing response
    setIsTyping(true);
    setTimeout(() => {
      let aiResponse = "I am processing your query against the MediChain ledger databases. Currently, no anomalies were detected in the patient record matching that request.";
      const query = text.toLowerCase();
      
      if (query.includes('alex') || query.includes('johnson')) {
        aiResponse = `**Clinical Summary for Alex Johnson**:\n\n* **Primary Diagnosis**: Hypertension & General Checkup.\n* **Blood Type**: O+\n* **Allergies**: Penicillin (Moderate severity).\n* **Medications**: Lisinopril 10mg once daily.\n* **Blockchain Verification**: All 3 records verified against the channel peers. Consensus verified.`;
      } else if (query.includes('referral') || query.includes('draft')) {
        aiResponse = `Here is a cardiology referral draft for patient **Alex Johnson**:\n\n*Dear Colleague,*\n\n*I am referring Mr. Alex Johnson (28yo, Male) for a cardiology assessment due to persistent stage-1 hypertension. Current blood pressure averages 142/90 mmHg despite Lisinopril 10mg daily therapy. Kindly evaluate.* \n\n*Sincerely,*\n*Dr. Amara Kofi*`;
      } else if (query.includes('interaction') || query.includes('drug')) {
        aiResponse = `**Drug Interaction Alert**:\n\nNo contraindicated interactions found for Lisinopril 10mg. If adding NSAIDs (e.g. Ibuprofen), monitor kidney function and blood pressure as they may attenuate ACE inhibitor efficacy.`;
      }

      setMessages(prev => [...prev, {
        sender: 'ai',
        text: aiResponse,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
      setIsTyping(false);
    }, 1200);
  };

  return (
    <header className="flex items-center justify-between gap-2 sm:gap-4 py-3 sm:py-4">
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C91A8]" />
          <input
            type="text"
            placeholder="Search patients, records..."
            className="w-full bg-white border border-[#D8DCE8] rounded-xl pl-10 pr-14 py-2 sm:py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-1 text-xs text-[#8C91A8] bg-[#EAEEF2] px-1.5 py-0.5 rounded">
            <span>⌘</span>
            <span>S</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Sparkles AI Button */}
        <button 
          onClick={() => setIsAiOpen(true)}
          className="flex items-center gap-2 bg-brand text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-brand-dark transition-colors shadow-sm"
        >
          <Sparkles className="w-4 h-4" />
          <span>AI Assist</span>
        </button>

        <button
          className="relative p-2 sm:p-2.5 hover:bg-brand-light rounded-xl transition-colors"
          onClick={() => router.push('/notifications')}
        >
          <Bell className="w-5 h-5 text-[#5D6582]" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-[#E53E3E] rounded-full" />
          )}
        </button>

        <div className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-3 border-l border-[#D8DCE8]">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-brand flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">{initials}</span>
          </div>
          <div className="hidden md:block text-left">
            <div className="text-sm font-semibold text-[#101326]">{userDetails.name}</div>
            <div className="text-xs text-[#8C91A8]">{userDetails.email}</div>
          </div>
          <ChevronDown className="w-4 h-4 text-[#8C91A8] hidden md:block" />
        </div>
      </div>

      {/* Sliding AI Panel Drawer */}
      {isAiOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm transition-opacity duration-300">
          {/* Backdrop Closer */}
          <div className="flex-1" onClick={() => setIsAiOpen(false)} />
          
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 text-left border-l border-slate-200">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 bg-brand-light text-brand rounded-lg flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">MediChain AI Copilot</h3>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Clinical Decision Support</p>
                </div>
              </div>
              <button 
                onClick={() => setIsAiOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-200 rounded-full transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-slate-100 px-4 py-2 bg-white gap-2">
              <button
                onClick={() => setActiveTab('insights')}
                className={`flex-1 py-2 text-center text-xs font-semibold rounded-lg transition ${
                  activeTab === 'insights' 
                    ? 'bg-brand-light text-brand' 
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Ledger Insights
              </button>
              <button
                onClick={() => setActiveTab('ask')}
                className={`flex-1 py-2 text-center text-xs font-semibold rounded-lg transition ${
                  activeTab === 'ask' 
                    ? 'bg-brand-light text-brand' 
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Clinical Chat
              </button>
            </div>

            {/* Content Drawer */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-slate-50/50">
              {activeTab === 'insights' ? (
                <>
                  {/* Insight Stats */}
                  <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-4">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4 text-brand" /> Clinic Cohort Metrics
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <span className="text-[10px] text-slate-400 font-semibold block uppercase">Patient Volume</span>
                        <span className="text-lg font-extrabold text-slate-800">4 Active</span>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <span className="text-[10px] text-slate-400 font-semibold block uppercase">Adherence Rate</span>
                        <span className="text-lg font-extrabold text-emerald-600">88%</span>
                      </div>
                    </div>
                  </div>

                  {/* On-Chain Interactions Check */}
                  <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 text-amber-500" /> Active Safety Flags
                    </h4>
                    <div className="space-y-2 text-xs">
                      <div className="flex items-start gap-2 bg-amber-50 border border-amber-100 p-2.5 rounded-lg text-amber-900">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                        <div>
                          <strong>Penicillin Allergy Detected:</strong> System auto-flagged for patient Alex Johnson. Avoid prescribing beta-lactam antibiotics.
                        </div>
                      </div>
                      <div className="flex items-start gap-2 bg-slate-50 border border-slate-100 p-2.5 rounded-lg text-slate-600">
                        <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                        <div>
                          <strong>Ledger Integrity:</strong> All blocks successfully replicated. Blockchain consensus verified.
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* AI Quick Prompts */}
                  <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-violet-500" /> Quick Task Drafting
                    </h4>
                    <div className="space-y-2">
                      <button 
                        onClick={() => { setActiveTab('ask'); handleSendMessage('Summarize Alex Johnson clinical records'); }}
                        className="w-full text-left text-xs bg-slate-50 hover:bg-slate-100 border border-slate-200 p-2.5 rounded-lg text-slate-700 font-semibold transition flex items-center justify-between"
                      >
                        <span>Summarize Alex Johnson profile</span>
                        <ChevronDown className="w-3.5 h-3.5 -rotate-90 text-slate-400" />
                      </button>
                      <button 
                        onClick={() => { setActiveTab('ask'); handleSendMessage('Draft a cardiology referral letter for Alex Johnson'); }}
                        className="w-full text-left text-xs bg-slate-50 hover:bg-slate-100 border border-slate-200 p-2.5 rounded-lg text-slate-700 font-semibold transition flex items-center justify-between"
                      >
                        <span>Draft referral letter (Cardiology)</span>
                        <ChevronDown className="w-3.5 h-3.5 -rotate-90 text-slate-400" />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                /* Clinical Chat Tab */
                <div className="h-full flex flex-col justify-between">
                  <div className="space-y-4 flex-1 overflow-y-auto mb-4 pr-1">
                    {messages.map((m, idx) => (
                      <div 
                        key={idx} 
                        className={`flex flex-col max-w-[85%] ${m.sender === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'}`}
                      >
                        <div 
                          className={`p-3 rounded-2xl text-xs leading-relaxed whitespace-pre-line shadow-sm border ${
                            m.sender === 'user' 
                              ? 'bg-brand text-white border-brand-dark rounded-tr-none' 
                              : 'bg-white text-slate-800 border-slate-200 rounded-tl-none'
                          }`}
                        >
                          {m.text}
                        </div>
                        <span className="text-[9px] text-slate-400 mt-1 px-1 font-semibold">{m.time}</span>
                      </div>
                    ))}
                    {isTyping && (
                      <div className="mr-auto items-start flex flex-col">
                        <div className="bg-white border border-slate-200 p-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-1.5">
                          <RefreshCw className="h-3.5 w-3.5 animate-spin text-brand" />
                          <span className="text-xs text-slate-400 font-semibold">Consulting database...</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Input area */}
                  <div className="border-t border-slate-200 pt-3 bg-white flex gap-2">
                    <input
                      type="text"
                      value={inputValue}
                      onChange={e => setInputValue(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') handleSendMessage(); }}
                      placeholder="Ask about patient interactions, symptoms..."
                      className="flex-1 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand"
                    />
                    <button
                      onClick={() => handleSendMessage()}
                      className="h-9 w-9 bg-brand hover:bg-brand-dark text-white rounded-xl flex items-center justify-center shrink-0 shadow transition-colors"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

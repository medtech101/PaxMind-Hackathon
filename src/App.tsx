import React, { useState, useEffect, useRef } from 'react';
import { PatientContext, ChatMessage, TriageResult, StandardizedCode, TerminologyItem } from './types';
import IntakePanel from './components/IntakePanel';
import { 
  Shield, 
  Activity, 
  Send, 
  FileText, 
  CheckCircle2, 
  Clock, 
  AlertOctagon, 
  AlertTriangle, 
  Info, 
  User, 
  ChevronRight, 
  Plus, 
  Search, 
  Code,
  BookOpen,
  Printer,
  Sparkles,
  ArrowRight,
  ClipboardList
} from 'lucide-react';

const INITIAL_PATIENT_CONTEXT: PatientContext = {
  age: '64',
  biologicalSex: 'female',
  isPregnant: false,
  conditions: ['Hypertension', 'Diabetes'],
  medications: ['Lisinopril', 'Metformin'],
  allergies: []
};

const INITIAL_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: 'welcome-msg',
    sender: 'assistant',
    text: "Hello, I am PaxMind, your clinical-decision support triage assistant. I can help interpret your general symptoms and guide you to the safest level of medical care.\n\nPlease describe what symptoms you are experiencing, how long they have been present, and any details that might help me understand your situation.",
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
];

export default function App() {
  const [patientContext, setPatientContext] = useState<PatientContext>(INITIAL_PATIENT_CONTEXT);
  const [lastAnalyzedContext, setLastAnalyzedContext] = useState<PatientContext | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_CHAT_MESSAGES);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'terminology'>('profile');
  
  // Terminology search state
  const [termQuery, setTermQuery] = useState('');
  const [termResults, setTermResults] = useState<TerminologyItem[]>([]);
  const [isSearchingTerms, setIsSearchingTerms] = useState(false);

  // Active clinical triage state (reflects the latest model evaluation)
  const [activeTriage, setActiveTriage] = useState<TriageResult | null>(null);
  
  // UI states
  const [showHandoffPreview, setShowHandoffPreview] = useState(false);
  const [viewingReasoning, setViewingReasoning] = useState(false);
  const [confirmedPlan, setConfirmedPlan] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isProfileChanged = () => {
    if (!lastAnalyzedContext) return false;
    return (
      patientContext.age !== lastAnalyzedContext.age ||
      patientContext.biologicalSex !== lastAnalyzedContext.biologicalSex ||
      patientContext.isPregnant !== lastAnalyzedContext.isPregnant ||
      JSON.stringify(patientContext.conditions) !== JSON.stringify(lastAnalyzedContext.conditions) ||
      JSON.stringify(patientContext.medications) !== JSON.stringify(lastAnalyzedContext.medications) ||
      JSON.stringify(patientContext.allergies) !== JSON.stringify(lastAnalyzedContext.allergies)
    );
  };

  // Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Handle default search of terminology
  useEffect(() => {
    searchTerminology("");
  }, []);

  const searchTerminology = async (q: string) => {
    setIsSearchingTerms(true);
    try {
      const res = await fetch(`/api/terminology/search?q=${encodeURIComponent(q)}`);
      if (res.ok) {
        const data = await res.json();
        setTermResults(data);
      }
    } catch (e) {
      console.error("Failed terminology search:", e);
    } finally {
      setIsSearchingTerms(false);
    }
  };

  const handleReAnalyze = async () => {
    if (messages.length <= 1 || isLoading) return;
    
    setIsLoading(true);
    setConfirmedPlan(false);
    
    try {
      const response = await fetch('/api/triage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messages.map(m => ({ sender: m.sender, text: m.text })),
          patientContext
        })
      });

      if (!response.ok) {
        throw new Error('API triage request failed.');
      }

      const rawData = await response.json();
      
      setMessages(prev => {
        const lastIdx = prev.map(m => m.sender).lastIndexOf('assistant');
        if (lastIdx !== -1) {
          const updated = [...prev];
          updated[lastIdx] = {
            ...updated[lastIdx],
            text: rawData.acknowledgment,
            triageDetails: {
              tier: rawData.tier,
              reason: rawData.reason,
              explanations: rawData.explanations || [],
              precautions: rawData.precautions || [],
              handoffPacket: rawData.handoffPacket || '',
              mappedCodes: rawData.mappedCodes || []
            }
          };
          return updated;
        }
        return prev;
      });

      setActiveTriage({
        tier: rawData.tier,
        reason: rawData.reason,
        explanations: rawData.explanations || [],
        precautions: rawData.precautions || [],
        handoffPacket: rawData.handoffPacket || '',
        mappedCodes: rawData.mappedCodes || []
      });
      setLastAnalyzedContext(patientContext);
    } catch (err) {
      console.error("Error re-evaluating symptoms with updated context:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const generatePlaintextSummary = () => {
    if (!activeTriage) return '';
    return `PAXMIND CLINICAL DECISION SUPPORT - TRIAGE PATIENT CARE SUMMARY
Generated: ${new Date().toLocaleString()}
--------------------------------------------------
PATIENT METADATA:
Age: ${patientContext.age || 'Unspecified'}
Biological Sex: ${patientContext.biologicalSex || 'Unspecified'}
Pregnancy Status: ${patientContext.isPregnant ? 'Active' : 'Negative'}
Medical Conditions: ${patientContext.conditions.join(', ') || 'None reported'}
Daily Medications: ${patientContext.medications.join(', ') || 'None reported'}
Allergies: ${patientContext.allergies.join(', ') || 'None reported'}

--------------------------------------------------
TRIAGE ASSESSMENT:
Care Tier: TIER ${activeTriage.tier} - ${
      activeTriage.tier === 0 ? 'EMERGENCY PROTOCOL' :
      activeTriage.tier === 1 ? 'URGENT CLINICAL CARE' :
      activeTriage.tier === 2 ? 'ROUTINE EVALUATION' :
      'SELF-CARE & MONITORING'
    }
Reasoning: ${activeTriage.reason}

Active Safety Precautions & Red Flags:
${activeTriage.precautions.map(p => `• ${p}`).join('\n')}

Clinical Guidance Factoids:
${activeTriage.explanations.map(e => `• ${e}`).join('\n')}

--------------------------------------------------
CLINICAL TERMINOLOGY MAPPINGS (UMLS Grounded):
${activeTriage.mappedCodes && activeTriage.mappedCodes.length > 0
  ? activeTriage.mappedCodes.map(c => `• [${c.vocabulary}] Code: ${c.code} | CUI: ${c.cui} | ${c.concept} (${c.confidence})`).join('\n')
  : 'No dictionary codes mapped.'
}

--------------------------------------------------
PHYSICIAN HANDOFF REPORT:
${activeTriage.handoffPacket || 'N/A'}
`;
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(generatePlaintextSummary());
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleDownloadFile = () => {
    const text = generatePlaintextSummary();
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `paxmind_triage_clinical_summary_${patientContext.age}_${patientContext.biologicalSex || 'unknown'}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSendMessage = async (customText?: string, customContext?: PatientContext) => {
    const textToSend = customText || inputMessage;
    if (!textToSend.trim() || isLoading) return;

    const contextToUse = customContext || patientContext;

    const userMsgId = `user-${Date.now()}`;
    const userMessageObj: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newMessages = [...messages, userMessageObj];
    setMessages(newMessages);
    if (!customText) setInputMessage('');
    setIsLoading(true);
    setConfirmedPlan(false);

    try {
      const response = await fetch('/api/triage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ sender: m.sender, text: m.text })),
          patientContext: contextToUse
        })
      });

      if (!response.ok) {
        throw new Error('API triage request failed.');
      }

      const rawData = await response.json();
      setLastAnalyzedContext(contextToUse);
      
      const assistantMsgId = `assistant-${Date.now()}`;
      const assistantMessageObj: ChatMessage = {
        id: assistantMsgId,
        sender: 'assistant',
        text: rawData.acknowledgment,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        triageDetails: {
          tier: rawData.tier,
          reason: rawData.reason,
          explanations: rawData.explanations || [],
          precautions: rawData.precautions || [],
          handoffPacket: rawData.handoffPacket || '',
          mappedCodes: rawData.mappedCodes || []
        }
      };

      setMessages(prev => [...prev, assistantMessageObj]);
      setActiveTriage(assistantMessageObj.triageDetails || null);
    } catch (err) {
      console.error("Error evaluating symptoms:", err);
      // Local recovery
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: "I experienced a connection issue while analyzing your safety profile. Please hold on while I construct a direct clinical triage recommendation for your parameters.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const insertTermToChat = (term: string) => {
    setInputMessage(prev => prev ? `${prev} ${term}` : `Symptoms related to: ${term}`);
    setActiveTab('profile');
  };

  // Pre-configured simulation scenarios
  const sendSimulatorTrigger = (query: string, ctx: PatientContext) => {
    setPatientContext(ctx);
    handleSendMessage(query, ctx);
  };

  const getTierDetails = (tier: number) => {
    switch(tier) {
      case 0:
        return {
          bg: 'bg-[#0A0A0A]',
          text: 'text-white',
          badge: 'bg-red-500/20 text-red-400 border border-red-500/30',
          title: 'TIER 0 - EMERGENCY PROTOCOL',
          actionText: 'Call 911 or visit the nearest Emergency Department immediately.',
          accentColor: 'border-red-500',
          pulse: 'text-red-500 bg-red-500/20'
        };
      case 1:
        return {
          bg: 'bg-amber-50/70 border border-amber-200/80',
          text: 'text-slate-800',
          badge: 'bg-amber-100 text-amber-800 border border-amber-200',
          title: 'TIER 1 - URGENT CLINICAL CARE',
          actionText: 'Contact your physician today or visit an Urgent Care Center same-day.',
          accentColor: 'border-amber-500',
          pulse: 'text-amber-600 bg-amber-500/10'
        };
      case 2:
        return {
          bg: 'bg-blue-50/50 border border-blue-200/60',
          text: 'text-slate-800',
          badge: 'bg-blue-100 text-blue-800 border border-blue-200',
          title: 'TIER 2 - ROUTINE CLINIC VISIT',
          actionText: 'Schedule a routine visit with your primary clinician.',
          accentColor: 'border-blue-500',
          pulse: 'text-blue-600 bg-blue-500/10'
        };
      default:
        return {
          bg: 'bg-slate-50 border border-slate-200/80',
          text: 'text-slate-800',
          badge: 'bg-slate-100 text-slate-700 border border-slate-200',
          title: 'TIER 3 - SELF-CARE & MONITORING',
          actionText: 'Utilize primary care home measures & symptom tracking.',
          accentColor: 'border-teal-500',
          pulse: 'text-teal-600 bg-teal-500/10'
        };
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex h-screen w-screen bg-[#F8F9FA] text-[#1A1A1A] font-sans overflow-hidden" id="paxmind-app-root">
      
      {/* LEFT SIDEBAR: PROFILE INTAKE / TERMINOLOGY LOOKUP */}
      <aside className="w-85 bg-white border-r border-[#E5E7EB] flex flex-col h-full shrink-0" id="sidebar-panel">
        
        {/* Sidebar Header */}
        <div className="p-5 border-b border-[#E5E7EB] shrink-0">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-3 h-3 bg-teal-500 rounded-full animate-pulse"></div>
            <h1 className="text-base font-bold tracking-tight text-slate-900 flex items-center gap-1.5 uppercase">
              PaxMind <span className="text-[10px] py-0.5 px-1.5 bg-slate-100 text-slate-500 font-mono tracking-normal rounded border border-slate-200">CDS v4.2</span>
            </h1>
          </div>
          <p className="text-xs text-gray-500 font-medium leading-normal">
            Triage & Patient Clinical Decision Support Layer
          </p>
        </div>

        {/* Sidebar Tabs */}
        <div className="flex border-b border-slate-100 shrink-0 bg-slate-50/50 p-1 gap-1">
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 text-[11px] font-semibold py-2 px-3 rounded-md transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'profile' 
                ? 'bg-white text-slate-800 shadow-xs border border-slate-200/50' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
            id="tab-profile-trigger"
          >
            <User className="h-3 w-3" />
            Patient Profile
          </button>
          <button
            onClick={() => setActiveTab('terminology')}
            className={`flex-1 text-[11px] font-semibold py-2 px-3 rounded-md transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'terminology' 
                ? 'bg-white text-slate-800 shadow-xs border border-slate-200/50' 
                : 'text-slate-500 hover:text-slate-800'
            }`}
            id="tab-terminology-trigger"
          >
            <Search className="h-3 w-3" />
            Standards Lexicon
          </button>
        </div>

        {/* Tab Content Viewport */}
        <div className="flex-1 overflow-hidden">
          {activeTab === 'profile' ? (
            <IntakePanel 
              context={patientContext} 
              onChange={setPatientContext} 
              isModified={isProfileChanged()}
              onReAnalyze={handleReAnalyze}
              isLoading={isLoading}
              hasActiveTriage={activeTriage !== null}
            />
          ) : (
            <div className="p-4 flex flex-col gap-4 h-full overflow-y-auto" id="terminology-tab-content">
              <div>
                <h3 className="text-xs font-semibold text-slate-700 flex items-center gap-1.5 mb-1">
                  <BookOpen className="h-4 w-4 text-teal-600" /> Standardized Registries
                </h3>
                <p className="text-[11px] text-slate-500">
                  Search mapped reference terminology spanning SNOMED CT, ICD-10-CM, and RxNorm used for clinician handoff auditing.
                </p>
              </div>

              {/* Term Search Box */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search symptom, drug or code..."
                  value={termQuery}
                  onChange={(e) => {
                    setTermQuery(e.target.value);
                    searchTerminology(e.target.value);
                  }}
                  className="w-full text-xs pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-teal-500 focus:bg-white transition-all"
                  id="terminology-search-input"
                />
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
              </div>

              {/* Glossary Results */}
              <div className="flex-grow space-y-2 overflow-y-auto pr-1" id="glossary-results-list">
                {isSearchingTerms ? (
                  <div className="py-4 text-center text-xs text-slate-400">Searching reference registry...</div>
                ) : termResults.length > 0 ? (
                  termResults.map((item) => (
                    <div 
                      key={item.id} 
                      className="p-2.5 bg-slate-50 rounded-lg border border-slate-200/60 hover:border-slate-300 transition-all flex flex-col gap-1 text-[11px]"
                    >
                      <div className="flex justify-between items-center bg-white p-1 rounded border border-slate-100">
                        <span className="font-semibold text-slate-800">{item.term}</span>
                        <span className="text-[9px] px-1.5 py-0.5 bg-slate-100 font-mono text-slate-600 uppercase rounded tracking-wide font-semibold">
                          {item.vocabulary}
                        </span>
                      </div>
                      <p className="text-slate-500 leading-normal text-[10px]">{item.description}</p>
                      
                      <div className="flex items-center gap-2 mt-1 pt-1 border-t border-slate-100/50 text-[10px] text-slate-400 font-mono">
                        <span>Code: <strong className="text-slate-600">{item.code}</strong></span>
                        <span>•</span>
                        <span>CUI: <strong className="text-indigo-600">{item.cui}</strong></span>
                      </div>

                      <button
                        onClick={() => insertTermToChat(item.term)}
                        className="mt-2 w-full py-1 bg-white text-slate-700 font-medium hover:bg-slate-100 border border-slate-200 rounded flex items-center justify-center gap-1 cursor-pointer transition-all text-[10px]"
                      >
                        <Plus className="h-3 w-3" /> Insert term into chat
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="py-4 text-center text-xs text-slate-400">No matching clinical entries found. Try "Oxybutynin", "chest pain", or "cough".</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Diagnostic Handoff Drawer Trigger (If Tier 0/1 active) */}
        {activeTriage && (activeTriage.tier === 0 || activeTriage.tier === 1) && (
          <div className="p-4 bg-teal-950 border-t border-teal-900 text-white flex flex-col gap-2 shrink-0">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono tracking-widest text-[#9EE5D4] uppercase font-bold flex items-center gap-1.5">
                <Code className="h-3.5 w-3.5" /> Mapped Standards
              </span>
              <span className="text-[10px] bg-red-500 text-white px-1.5 py-0.5 rounded font-bold uppercase tracking-wider scale-90">
                ACTIVE AUDIT
              </span>
            </div>
            <p className="text-[11px] text-slate-200 font-medium leading-relaxed">
              Standardized clinician medical handoff has been processed.
            </p>
            <button
              onClick={() => setShowHandoffPreview(true)}
              className="mt-1.5 w-full py-2 bg-gradient-to-r from-teal-400 to-emerald-500 hover:from-teal-500 hover:to-emerald-600 text-teal-950 font-bold rounded text-xs tracking-wider uppercase shadow-md active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-1.5"
            >
              <FileText className="h-3.5 w-3.5" /> View Clinician Handoff
            </button>
          </div>
        )}

      </aside>

      {/* CENTER & MAIN ROW: CLINICAL CHAT AREA */}
      <main className="flex-1 flex flex-col bg-white overflow-hidden relative h-full" id="workspace-main">
        
        {/* Dynamic Patient Info Header Bar */}
        <header className="h-16 flex items-center justify-between px-6 border-b border-[#E5E7EB] shrink-0 bg-white shadow-xs z-10" id="main-app-header">
          <div className="flex items-center gap-3">
            {activeTriage ? (
              <span className={`px-2.5 py-1 text-[11px] font-bold rounded-full uppercase tracking-wider border ${
                activeTriage.tier === 0 ? 'bg-red-50 text-red-700 border-red-200' :
                activeTriage.tier === 1 ? 'bg-amber-50 text-amber-800 border-amber-200' :
                activeTriage.tier === 2 ? 'bg-blue-50 text-blue-700 border-blue-200' :
                'bg-slate-50 text-slate-700 border-slate-200'
              }`}>
                TIER {activeTriage.tier} - {
                  activeTriage.tier === 0 ? 'EMERGENCY' :
                  activeTriage.tier === 1 ? 'URGENT' :
                  activeTriage.tier === 2 ? 'ROUTINE EVAL' :
                  'SELF-CARE'
                }
              </span>
            ) : (
              <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-slate-100 text-slate-500 border border-slate-200 tracking-wider">
                TIER UNASSIGNED
              </span>
            )}
            <span className="text-gray-300">|</span>
            <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 uppercase font-mono">
              <Activity className="h-3.5 w-3.5 text-teal-600" />
              Patient Age/Sex: {patientContext.age || "?"} / {patientContext.biologicalSex || "?"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewingReasoning(!viewingReasoning)}
              className={`text-xs px-3 py-1.5 border hover:bg-slate-50 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                viewingReasoning ? 'bg-teal-50 border-teal-300 text-teal-800 font-semibold' : 'border-slate-200 text-slate-600'
              }`}
            >
              <Info className="h-3.5 w-3.5" />
              {viewingReasoning ? 'Hide Guidelines' : 'View Safety Rules'}
            </button>
          </div>
        </header>

        {/* Layout split for safety rules / guidelines or standard flow */}
        <div className="flex-1 flex overflow-hidden relative">
          
          {/* Main stream viewport */}
          <div className="flex-1 flex flex-col justify-between h-full bg-[#fcfdfe]/60 overflow-hidden relative">
            
            {/* Split reasoning box if viewing safety posture */}
            {viewingReasoning && (
              <div className="absolute inset-x-0 top-0 bg-slate-900 text-white p-5 border-b border-slate-800 overflow-y-auto max-h-50 z-20 shadow-xl transition-all" id="regulatory-guardrails-overlay">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-1.5 text-xs uppercase font-mono tracking-wider font-bold text-teal-400">
                    <Shield className="h-4 w-4" /> PaxMind Core Safety Posture (Cures Act CDS compliant)
                  </div>
                  <button 
                    onClick={() => setViewingReasoning(false)} 
                    className="text-slate-400 hover:text-white font-bold text-sm bg-slate-800 hover:bg-slate-700 px-2 py-0.5 rounded"
                  >
                    Close
                  </button>
                </div>
                <ul className="text-xs space-y-1.5 text-slate-300 leading-relaxed list-disc list-inside">
                  <li><strong>Non-device CDS Criteria:</strong> Recommendations act as explanatory reference tools, enabling clinicians to review the source logic.</li>
                  <li><strong>Prime Safety Directive:</strong> Under-escalation is a system failure. Safety margins and emergency recommendations remain absolute regardless of patient dispute.</li>
                  <li><strong>Polypharmacy and Cascade Analysis:</strong> Evaluates ongoing medicine (Beers Criteria anticholinergics, kidney risks) as symptom sources before suggesting auxiliary remedies.</li>
                </ul>
              </div>
            )}

            {/* Chat Messages and Feed Viewport */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6" id="chat-messages-container">
              
              {/* Patient context header card */}
              <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-xs border border-slate-200/60 p-4 shrink-0 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between text-xs text-slate-600">
                <div className="space-y-1 w-full md:w-auto">
                  <p className="font-semibold text-slate-800 flex items-center gap-1.5 text-xs">
                    <ClipboardList className="h-4 w-4 text-teal-600" /> Active Triage Target
                  </p>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-slate-500 mt-1">
                    <p>Age: <strong className="text-slate-800">{patientContext.age || "?"} yrs</strong></p>
                    <p>Biological Sex: <strong className="text-slate-800 capitalize">{patientContext.biologicalSex || "?"}</strong></p>
                    <p>Comorbidities: <strong className="text-slate-700">{patientContext.conditions.join(', ') || 'None listed'}</strong></p>
                    <p>Medications: <strong className="text-slate-700">{patientContext.medications.join(', ') || 'No active drug lists'}</strong></p>
                    {patientContext.allergies.length > 0 && (
                      <p className="col-span-2">Allergies: <strong className="text-amber-800 font-medium">{patientContext.allergies.join(', ')}</strong></p>
                    )}
                  </div>
                </div>

                <div className="shrink-0 flex flex-col items-end gap-2 w-full md:w-auto">
                  {isProfileChanged() ? (
                    <div className="flex flex-col items-end gap-1.5 w-full md:w-auto">
                      <span className="text-[10px] bg-amber-50 text-amber-800 border border-amber-200/80 px-2.5 py-1 rounded font-semibold tracking-wide animate-pulse">
                        ⚠️ PROFILE MODIFIED
                      </span>
                      <button
                        onClick={handleReAnalyze}
                        disabled={isLoading}
                        className="text-[11px] bg-teal-600 hover:bg-teal-700 text-white font-bold py-1.5 px-3 rounded shadow-xs cursor-pointer transition-all flex items-center justify-center gap-1 w-full md:w-auto shrink-0"
                      >
                        🔄 Update & Re-Analyze
                      </button>
                    </div>
                  ) : (
                    <div className="bg-slate-50 px-2.5 py-1.5 rounded border border-slate-200 font-mono text-[10px] text-slate-500">
                      Sync Status: Consistent
                    </div>
                  )}
                </div>
              </div>

              {/* Message loop */}
              {messages.map((msg) => {
                const isUser = msg.sender === 'user';
                return (
                  <div 
                    key={msg.id} 
                    className={`flex gap-3 max-w-3xl mx-auto ${isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isUser && (
                      <div className="h-8 w-8 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-xs shrink-0 select-none shadow-sm">
                        PX
                      </div>
                    )}
                    
                    <div className="flex flex-col gap-1.5 max-w-[85%]">
                      
                      {/* Message Bubble */}
                      <div className={`p-4 rounded-2xl ${
                        isUser 
                          ? 'bg-slate-100 text-slate-800 rounded-tr-xs border border-slate-200' 
                          : 'bg-white text-slate-800 rounded-tl-xs border border-slate-100 shadow-sm leading-relaxed'
                      }`}>
                        <div className="text-sm whitespace-pre-line leading-relaxed">{msg.text}</div>
                        
                        {/* If this is an assistant package with internal annotations */}
                        {msg.triageDetails && (
                          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                            <span className="flex items-center gap-1 font-mono uppercase tracking-wider text-[10px] text-slate-400 font-bold">
                              <Shield className="h-3.5 w-3.5 text-teal-600" /> Clinical Safety Scanned
                            </span>
                            <span className="font-mono text-[10.5px]">{msg.timestamp}</span>
                          </div>
                        )}
                      </div>

                      {/* If the message had an inline clinical care recommendation, show it! */}
                      {msg.triageDetails && (
                        <div className="mt-3" id={`recommendation-container-${msg.id}`}>
                          {(() => {
                            const details = getTierDetails(msg.triageDetails.tier);
                            return (
                              <div className={`${details.bg} ${details.text} p-6 rounded-2xl shadow-md space-y-4`}>
                                
                                <div className="flex items-start md:items-center justify-between gap-3">
                                  <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${msg.triageDetails.tier === 0 ? 'animate-pulse' : ''} ${details.badge}`}>
                                      {msg.triageDetails.tier === 0 ? <AlertOctagon className="w-5 h-5" /> : <AlertTriangle className="w-4 h-4" />}
                                    </div>
                                    <span className="text-[11px] font-bold tracking-widest uppercase">
                                      {details.title}
                                    </span>
                                  </div>
                                </div>

                                <p className="text-lg md:text-xl font-light mb-4 leading-tight">
                                  {msg.triageDetails.tier === 0 ? (
                                    <>
                                      Please <span className="font-bold underline decoration-red-500 underline-offset-4">call 911 or your local emergency number immediately</span>.
                                    </>
                                  ) : (
                                    <span>{details.actionText}</span>
                                  )}
                                </p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-200/40">
                                  <div>
                                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                                      Triage Reason
                                    </h4>
                                    <p className="text-xs text-slate-600 font-medium leading-relaxed">
                                      {msg.triageDetails.reason}
                                    </p>
                                  </div>
                                  <div>
                                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                                      Active Safety Precautions
                                    </h4>
                                    <ul className="text-xs text-slate-600 space-y-1">
                                      {msg.triageDetails.precautions.map((pre, idx) => (
                                        <li key={idx} className="flex gap-1.5">
                                          <span className="font-bold text-red-500">•</span> {pre}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                </div>

                                {/* Medication adverse cascade notification, if present in explanations */}
                                {msg.triageDetails.explanations && msg.triageDetails.explanations.length > 0 && (
                                  <div className="bg-white/80 p-3 rounded-lg border border-slate-200/50 text-[11px] space-y-1.5">
                                    <p className="font-semibold text-teal-800 flex items-center gap-1 uppercase tracking-wider text-[10px]">
                                      <Info className="h-3.5 w-3.5 text-teal-600" /> Dynamic Risks & Clinical Guidance
                                    </p>
                                    <ul className="space-y-1 list-disc list-inside text-slate-600 leading-relaxed">
                                      {msg.triageDetails.explanations.map((ex, i) => (
                                        <li key={i}>{ex}</li>
                                      ))}
                                    </ul>
                                  </div>
                                )}

                                {/* Grounded Coding standards list */}
                                {msg.triageDetails.mappedCodes && msg.triageDetails.mappedCodes.length > 0 && (
                                  <div className="flex flex-wrap gap-1.5 pt-3 border-t border-slate-200/30">
                                    {msg.triageDetails.mappedCodes.map((codeObj, cIdx) => (
                                      <span 
                                        key={cIdx} 
                                        className="text-[9.5px] font-mono tracking-tight bg-white border border-slate-200/80 text-slate-600 py-1 px-1.5 rounded flex items-center gap-1 shadow-2xs"
                                        title={`${codeObj.concept} (${codeObj.vocabulary}) - UMLS CUI: ${codeObj.cui}`}
                                      >
                                        <Code className="h-2.5 w-2.5 text-slate-400" />
                                        {codeObj.vocabulary}: <strong>{codeObj.code}</strong> 
                                        <span className="text-slate-400">|</span> 
                                        <span className="text-[8.5px] shrink-0 text-slate-500 truncate max-w-40 md:max-w-none">{codeObj.concept}</span>
                                      </span>
                                    ))}
                                  </div>
                                )}

                              </div>
                            );
                          })()}
                        </div>
                      )}

                    </div>

                    {isUser && (
                      <div className="h-8 w-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0 select-none border border-slate-300">
                        P
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Typing simulation */}
              {isLoading && (
                <div className="flex gap-3 max-w-3xl mx-auto justify-start">
                  <div className="h-8 w-8 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-xs shrink-0 select-none shadow-sm">
                    PX
                  </div>
                  <div className="bg-white border border-slate-200/50 py-3 px-4 rounded-2xl rounded-tl-xs shadow-xs text-xs text-slate-500 flex items-center gap-2">
                    <div className="flex space-x-1">
                      <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                      <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                      <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
                    </div>
                    PaxMind is auditing client risk factors...
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* QUICK PROTOCOL SIMULATORS */}
            {messages.length === 1 && !isLoading && (
              <div className="px-6 md:px-8 py-3 bg-slate-50 border-t border-slate-200 flex flex-col gap-2 shrink-0">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="h-3 w-3 text-teal-600 animate-spin" /> Click to test common diagnostic scenarios:
                </span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <button
                    onClick={() => sendSimulatorTrigger(
                      "I have retrosternal chest pain radiating to my shoulder muscle and high nausea",
                      {
                        age: "61",
                        biologicalSex: "male",
                        isPregnant: false,
                        conditions: ["Heart Failure", "Diabetes"],
                        medications: ["Atorvastatin", "Metformin"],
                        allergies: []
                      }
                    )}
                    className="text-left text-xs bg-white hover:bg-slate-100 p-2 border border-slate-200 rounded-lg cursor-pointer transition-all"
                  >
                    <span className="font-semibold text-red-700 block">🛑 Cardiac (Tier 0 Emergency)</span>
                    <span className="text-[10px] text-slate-500">61yo Male with sudden retrosternal tightness.</span>
                  </button>
                  <button
                    onClick={() => sendSimulatorTrigger(
                      "My mom started a new bladder pill a couple weeks back and is suddenly unsteady on her feet and quite confused",
                      {
                        age: "78",
                        biologicalSex: "female",
                        isPregnant: false,
                        conditions: ["Urinary urgency", "High Blood Pressure"],
                        medications: ["Oxybutynin (Ditropan)"],
                        allergies: []
                      }
                    )}
                    className="text-left text-xs bg-white hover:bg-slate-100 p-2 border border-slate-200 rounded-lg cursor-pointer transition-all"
                  >
                    <span className="font-semibold text-amber-700 block">⚠️ Anticholinergic (Tier 1 Cascade)</span>
                    <span className="text-[10px] text-slate-500">78yo Mother with sudden confusion & unsteady gait.</span>
                  </button>
                  <button
                    onClick={() => sendSimulatorTrigger(
                      "I have a runny nose, scratchy sore throat, and a normal temperature.",
                      {
                        age: "24",
                        biologicalSex: "female",
                        isPregnant: false,
                        conditions: [],
                        medications: [],
                        allergies: []
                      }
                    )}
                    className="text-left text-xs bg-white hover:bg-slate-100 p-2 border border-slate-200 rounded-lg cursor-pointer transition-all"
                  >
                    <span className="font-semibold text-teal-700 block">✅ common Cold (Tier 3 Monitoring)</span>
                    <span className="text-[10px] text-slate-500">24yo Female with common congestive signs.</span>
                  </button>
                </div>
              </div>
            )}

            {/* CHAT INPUT FORM */}
            <div className="bg-white border-t border-[#E5E7EB] p-4 shrink-0" id="chat-composer">
              <div className="max-w-3xl mx-auto flex gap-2">
                <input
                  type="text"
                  placeholder="Describe your active health concern or medication questions here..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSendMessage();
                  }}
                  disabled={isLoading}
                  className="flex-grow text-sm border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/20 disabled:bg-slate-50 disabled:text-slate-400"
                  id="chat-user-textbox"
                />
                <button
                  type="button"
                  onClick={() => handleSendMessage()}
                  disabled={!inputMessage.trim() || isLoading}
                  className="bg-slate-900 text-white rounded-xl px-5 py-3 font-semibold hover:bg-slate-800 focus:outline-none transition-all cursor-pointer disabled:bg-slate-100 disabled:text-slate-400 flex items-center gap-1 shrink-0"
                  id="chat-send-action"
                >
                  <Send className="h-4 w-4" /> Send
                </button>
              </div>
            </div>

          </div>

          {/* RIGHT SIDEBAR PANEL: THE DETAILED CLINICAL HARDOFF DRAWER (Only when selected or triggered) */}
          {showHandoffPreview && activeTriage && (
            <div className="w-96 bg-slate-50 border-l border-[#E5E7EB] flex flex-col h-full z-15 shrink-0" id="handoff-sidepanel">
              
              {/* Header */}
              <div className="p-4 bg-slate-900 text-white flex justify-between items-center shrink-0">
                <div className="flex items-center gap-2">
                  <ClipboardList className="h-4 w-4 text-teal-400" />
                  <span className="text-xs font-bold uppercase tracking-wider">Physician Handoff Packet</span>
                </div>
                <button 
                  onClick={() => setShowHandoffPreview(false)}
                  className="text-slate-400 hover:text-white font-bold text-sm cursor-pointer"
                >
                  Close ×
                </button>
              </div>

              {/* Packet Body */}
              <div className="flex-grow overflow-y-auto p-5 space-y-5" id="handoff-scroll-body">
                
                {/* Visual Checklist for Triage Audit */}
                <div className="bg-amber-100/50 p-4 rounded-xl border border-amber-200 text-xs space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-amber-900">
                    <Activity className="h-4 w-4" /> CLINICAL EXPLANATORY AUDIT
                  </div>
                  <p className="text-slate-700 leading-normal">
                    This automated summary is designed to meet non-device Clinical Decision Support software guidelines. It references exact mappings and patient indicators to make rationale completely transparent to the evaluating physician.
                  </p>
                </div>

                {/* Patient Context Summary */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 tracking-tight">
                  <h4 className="text-[10px] text-slate-400 uppercase font-mono mb-2 font-bold tracking-wider">Active Patient Metadata</h4>
                  <div className="text-xs space-y-1.5 text-slate-700">
                    <div className="flex justify-between border-b border-slate-100 pb-1">
                      <span>Age:</span> <strong className="text-slate-800">{patientContext.age}</strong>
                    </div>
                    <div className="flex justify-between border-b border-slate-100 pb-1">
                      <span>Biological Sex:</span> <strong className="text-slate-800 capitalize">{patientContext.biologicalSex}</strong>
                    </div>
                    {patientContext.biologicalSex === 'female' && (
                      <div className="flex justify-between border-b border-slate-100 pb-1">
                        <span>Pregnant:</span> <strong className="text-slate-800">{patientContext.isPregnant ? "Yes" : "No"}</strong>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Safety Routing Urgency:</span> 
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${activeTriage.tier === 0 ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'}`}>
                        TIER {activeTriage.tier}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Main Handoff Output Block */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
                  <h4 className="text-[10px] text-slate-400 uppercase font-mono font-bold tracking-wider">Clinician Transfer Report</h4>
                  
                  <div className="text-xs prose prose-slate max-w-none text-slate-700 font-sans leading-relaxed whitespace-pre-wrap">
                    {activeTriage.handoffPacket || "Dynamic Handoff compilation pending clinical escalation trigger..."}
                  </div>
                </div>

                {/* Standards Taxonomy Section */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-2">
                  <h4 className="text-[10px] text-slate-400 uppercase font-mono font-bold tracking-wider">Terminology Mapping Dictionary</h4>
                  <div className="space-y-1.5" id="snomed-rxnorm-mappings-packet">
                    {activeTriage.mappedCodes && activeTriage.mappedCodes.length > 0 ? (
                      activeTriage.mappedCodes.map((c, i) => (
                        <div key={i} className="text-[11px] p-2 bg-slate-50 rounded border border-slate-100 font-mono">
                          <div className="flex justify-between font-bold text-slate-700">
                            <span>{c.concept}</span>
                            <span className="text-[9px] bg-slate-200/60 px-1 rounded">{c.vocabulary}</span>
                          </div>
                          <div className="flex gap-2 text-[10px] text-slate-400 mt-1">
                            <span>ID: <strong className="text-slate-600">{c.code}</strong></span>
                            <span>CUI: <strong className="text-indigo-600">{c.cui}</strong></span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-[11px] text-slate-400">No standardized diagnostic dictionary references required for current triage tier.</p>
                    )}
                  </div>
                </div>

              </div>

              {/* Footer transfer tools */}
              <div className="p-4 bg-white border-t border-slate-200 flex flex-col gap-2 shrink-0">
                <button
                  onClick={() => setShowPrintModal(true)}
                  className="w-full py-2 border border-slate-200 hover:bg-slate-50 text-teal-700 text-xs font-semibold rounded cursor-pointer transition-all flex items-center justify-center gap-1.5"
                >
                  <Printer className="h-3.5 w-3.5" /> Print Physical Referral Packet
                </button>
              </div>

            </div>
          )}

        </div>

        {/* BOTTOM GLOBAL CARE ACTION FOOTER */}
        {activeTriage && (
          <footer className="h-20 bg-white border-t border-[#E5E7EB] flex items-center justify-between px-6 shrink-0 z-10" id="main-app-footer">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 shrink-0">
                <Shield className="h-5 w-5 text-teal-600" />
              </div>
              <p className="text-xs text-gray-500 leading-normal max-w-xl">
                {confirmedPlan ? (
                  <span className="text-emerald-700 font-medium flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4" /> Thank you. Your understanding of the Tier {activeTriage.tier} precautions and next clinical steps is confirmed.
                  </span>
                ) : (
                  <span>
                    <strong>Confirmation Challenge:</strong> Does this care directive and routing make sense to you? Please confirm comprehension or provide additional safety questions.
                  </span>
                )}
              </p>
            </div>

            <div className="flex gap-2">
              <button 
                onClick={() => setShowPrintModal(true)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold hover:bg-gray-50 transition-colors text-slate-600 cursor-pointer flex items-center gap-1 bg-white"
              >
                <Printer className="h-3.5 w-3.5" /> Print Patient Care Summary
              </button>
              <button
                onClick={() => setConfirmedPlan(true)}
                disabled={confirmedPlan}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  confirmedPlan 
                    ? 'bg-emerald-100 text-emerald-800 cursor-default' 
                    : 'bg-teal-600 hover:bg-teal-700 text-white shadow-xs'
                }`}
              >
                {confirmedPlan ? 'Plan Confirmed' : 'Confirm Understanding'}
              </button>
            </div>
          </footer>
        )}

      </main>

      {/* PRINT PREVIEW / REPORT EXPORT MODAL */}
      {showPrintModal && activeTriage && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in" id="print-modal-overlay">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-200" id="print-modal-container">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-teal-100 text-teal-700 rounded-lg">
                  <Printer className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800">Print & Care Summary Export</h3>
                  <p className="text-[10px] text-slate-500">View, print or copy the clinical decisions and terminology mappings.</p>
                </div>
              </div>
              <button 
                onClick={() => setShowPrintModal(false)}
                className="p-1.5 hover:bg-slate-200 text-slate-400 hover:text-slate-700 rounded-lg transition-colors cursor-pointer text-sm font-bold flex items-center justify-center h-8 w-8"
              >
                ×
              </button>
            </div>

            {/* Quick Actions Panel */}
            <div className="p-4 bg-teal-50/50 border-b border-teal-100/40 flex flex-wrap gap-2 shrink-0">
              <button
                onClick={handleCopyToClipboard}
                className={`text-xs px-4 py-2 rounded-lg font-semibold cursor-pointer flex items-center gap-1.5 transition-all ${
                  copySuccess 
                    ? 'bg-emerald-600 text-white shadow-sm' 
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                {copySuccess ? (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5" /> Copied Patient Summary!
                  </>
                ) : (
                  <>
                    <ClipboardList className="h-3.5 w-3.5 text-slate-500" /> Copy Report Text
                  </>
                )}
              </button>

              <button
                onClick={handleDownloadFile}
                className="text-xs bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 px-4 py-2 rounded-lg font-semibold cursor-pointer transition-all flex items-center gap-1.5"
              >
                <FileText className="h-3.5 w-3.5 text-slate-500" /> Download Text Report (.txt)
              </button>

              <button
                onClick={handlePrint}
                className="text-xs bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-bold cursor-pointer transition-all flex items-center gap-1.5 shadow-xs ml-auto"
              >
                <Printer className="h-3.5 w-3.5" /> Browser Print File
              </button>
            </div>

            {/* Printable Document Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/20" id="printable-area-modal">
              
              {/* Document Header Page */}
              <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm space-y-5">
                
                {/* Clinical Logo Banner */}
                <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                  <div>
                    <h1 className="text-xl font-bold tracking-tight text-slate-900">PaxMind CDS Summary</h1>
                    <p className="text-[10px] text-teal-700 uppercase font-mono tracking-wider font-semibold">Clinical Decision Support Triage Protocol</p>
                  </div>
                  <div className="text-right text-xs text-slate-500 font-mono">
                    <p>Report Date: {new Date().toLocaleDateString()}</p>
                    <p>CDS Engine ID: PaxMind CDS v4.2</p>
                  </div>
                </div>

                {/* Patient Context Grid */}
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-teal-800 mb-2 font-mono">I. Patient Demographic & Clinical Parameters</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100/80 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Age:</span>
                      <strong className="text-slate-800">{patientContext.age || 'Unspecified'} years old</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Biological Sex:</span>
                      <strong className="text-slate-800 capitalize">{patientContext.biologicalSex || 'Unspecified'}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Pregnancy:</span>
                      <strong className="text-slate-800">{patientContext.isPregnant ? 'Active' : 'Negative/N_A'}</strong>
                    </div>
                  </div>
                  
                  {/* Comorbidities & Meds Sub-rows */}
                  <div className="mt-3 space-y-1.5 text-xs">
                    <div className="flex items-start gap-1 pb-1 border-b border-dashed border-slate-100">
                      <span className="text-slate-500 font-semibold w-28 shrink-0">Comorbidities:</span>
                      <span className="text-slate-700">{patientContext.conditions.join(', ') || 'No known conditions reported.'}</span>
                    </div>
                    <div className="flex items-start gap-1 pb-1 border-b border-dashed border-slate-100">
                      <span className="text-slate-500 font-semibold w-28 shrink-0">Daily Meds:</span>
                      <span className="text-slate-700">{patientContext.medications.join(', ') || 'No habitual active therapeutic drugs.'}</span>
                    </div>
                    <div className="flex items-start gap-1">
                      <span className="text-slate-500 font-semibold w-28 shrink-0">Allergies:</span>
                      <span className="text-slate-700 text-amber-900 font-medium">{patientContext.allergies.join(', ') || 'NKDA - No Known Drug Allergies.'}</span>
                    </div>
                  </div>
                </div>

                {/* Triage Decision Banner */}
                <div className="border-t border-slate-200 pt-4">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-teal-800 mb-2 font-mono">II. System Triage Classification</h4>
                  
                  {(() => {
                    const d = getTierDetails(activeTriage.tier);
                    return (
                      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div>
                          <span className={`px-2 py-0.5 text-[9px] font-bold rounded uppercase tracking-wider ${d.badge}`}>
                            TIER {activeTriage.tier} - {
                              activeTriage.tier === 0 ? 'EMERGENCY' :
                              activeTriage.tier === 1 ? 'URGENT' :
                              activeTriage.tier === 2 ? 'ROUTINE EVAL' :
                              'SELF-CARE'
                            }
                          </span>
                          <p className="text-sm font-semibold text-slate-800 mt-1">{d.actionText}</p>
                        </div>
                        <div className="md:text-right max-w-sm md:border-l border-slate-200 md:pl-4">
                          <span className="text-[10px] text-slate-400 block font-mono">Triage Rationale:</span>
                          <p className="text-xs text-slate-600 leading-normal">{activeTriage.reason}</p>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Critical Red Flags & Precautions */}
                <div className="border-t border-slate-200 pt-4">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-teal-800 mb-2 font-mono">III. Active Red Flags & Return Precautions</h4>
                  <ul className="text-xs space-y-1 bg-rose-50/20 border border-slate-100 p-3 rounded-lg">
                    {activeTriage.precautions.map((p, idx) => (
                      <li key={idx} className="flex gap-2 text-slate-700 font-medium select-text">
                        <strong className="text-rose-600">•</strong> {p}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Adverse Clinical Findings Explanations */}
                {activeTriage.explanations && activeTriage.explanations.length > 0 && (
                  <div className="border-t border-slate-200 pt-4">
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-teal-800 mb-2 font-mono">IV. Dynamic Risk Factor & Cascade Analysis</h4>
                    <ul className="text-xs space-y-1 text-slate-600 leading-relaxed list-disc list-inside">
                      {activeTriage.explanations.map((ex, i) => (
                        <li key={i}>{ex}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Standardized Codes & mappings */}
                {activeTriage.mappedCodes && activeTriage.mappedCodes.length > 0 && (
                  <div className="border-t border-slate-200 pt-4">
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-teal-800 mb-2 font-mono">V. Standardized Terminology Mapping Ledger</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-1">
                      {activeTriage.mappedCodes.map((c, i) => (
                        <div key={i} className="text-[10.5px] p-2 bg-slate-50 rounded border border-slate-100 font-mono flex flex-col justify-between">
                          <div className="flex justify-between items-center pb-1 border-b border-slate-100">
                            <span className="font-bold text-slate-700 truncate max-w-[180px]">{c.concept}</span>
                            <span className="text-[8px] bg-slate-200/80 px-1 rounded scale-90">{c.vocabulary}</span>
                          </div>
                          <div className="flex justify-between text-[9px] text-slate-400 mt-1">
                            <span>Code ID: <strong className="text-slate-600">{c.code}</strong></span>
                            <span>UMLS CUI: <strong className="text-indigo-600">{c.cui}</strong></span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Physician Markdown Handoff in formatted structure */}
                {activeTriage.handoffPacket && (
                  <div className="border-t border-slate-200 pt-4">
                    <h4 className="text-[10px] font-bold uppercase tracking-wider text-teal-800 mb-2 font-mono">VI. Clinician Transfer SBAR Summary</h4>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed prose prose-slate max-w-none font-sans whitespace-pre-wrap">
                      {activeTriage.handoffPacket}
                    </div>
                  </div>
                )}

              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-2 shrink-0">
              <button
                onClick={() => setShowPrintModal(false)}
                className="px-4 py-2 bg-white border border-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-50 text-xs cursor-pointer transition-all"
              >
                Close Report View
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

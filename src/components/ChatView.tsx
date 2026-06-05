/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { 
  Send, 
  Bot, 
  User, 
  HelpCircle, 
  Plus, 
  Check, 
  RefreshCw, 
  Database, 
  AlertCircle, 
  FileText,
  Clock,
  ShieldAlert,
  Terminal,
  Loader2
} from "lucide-react";
import { Ticket, TicketCategory, PriorityLevel, ChatMessage } from "../types";
import { EPHI_DEPARTMENTS, EPHI_OFFICERS } from "../data";

interface ChatViewProps {
  onAddTicket: (ticket: Ticket) => void;
  onNavigate: (page: string) => void;
}

export default function ChatView({ onAddTicket, onNavigate }: ChatViewProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      sender: "copilot",
      text: "Hello! I am your EPHI ICT Support Copilot. I can guide you through diagnostics, troubleshoot system networks, or log ticket logs into the EPHI system. Let me know what technical issue you are facing today.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState<string | null>(null);

  // Suggested Ticket Draft (extracted from AI response by matching XML tags)
  const [ticketDraft, setTicketDraft] = useState<Partial<Ticket> | null>(null);
  const [isCommitSuccess, setIsCommitSuccess] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Pre-configured typical issues at EPHI for quick testing
  const QUICK_SHORTCUTS = [
    {
      label: "AD Password Reset",
      prompt: "End-user Abebe Kebede from National Reference Lab has locked his Active Directory password after 3 failed login attempts. Can you reset it and log the incident?"
    },
    {
      label: "VPN Cert Refusal",
      prompt: "Epidemiological officer Solomon Tekle in Gondar remote station complains that AnyConnect Secure VPN rejects with 'Security certificate expired'. What diagnostics should I follow?"
    },
    {
      label: "Outlook Relay Failure",
      prompt: "Genet Hailu in Finance cannot send encrypted xls spreadsheets to external regulators. The mail relay rejects it. What's the protocol here?"
    },
    {
      label: "Printer Streak",
      prompt: "The HP LaserJet printer on the warehouse floor displays 'Toner Low' and prints with faded, streaky text. How do I fix this?"
    }
  ];

  // Keep chat scrolled down
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Handle parse of ticket extraction block
  const parseTicketExtraction = (text: string) => {
    const regex = /<ticket_extract>([\s\S]*?)<\/ticket_extract>/i;
    const match = text.match(regex);
    if (match && match[1]) {
      try {
        const parsed = JSON.parse(match[1].trim());
        setTicketDraft({
          ...parsed,
          timeSpentMinutes: parsed.timeSpentMinutes || 25,
          supportOfficer: parsed.supportOfficer || "Abebe Kebede"
        });
      } catch (err) {
        console.warn("Failed to parse extracted ticket block.", err);
      }
    }
  };

  // Submit Chat message to backend
  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    setHasError(null);
    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInputMessage("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Send full messages array to support conversational context
        body: JSON.stringify({ 
          messages: updatedMessages 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to communicate with AI.");
      }

      const copilotMsg: ChatMessage = {
        id: Math.random().toString(),
        sender: "copilot",
        text: data.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, copilotMsg]);
      parseTicketExtraction(data.text);

    } catch (err: any) {
      console.error(err);
      setHasError(err.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  // Function to commit the active ticket draft into backend / main dashboard state
  const handleCommitDraft = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketDraft) return;

    // Create unique Incident ID
    const randomID = "EPHI-INC-" + Math.floor(1000 + Math.random() * 9000);
    const currentDate = new Date().toISOString().split('T')[0];

    const completedTicket: Ticket = {
      id: randomID,
      date: currentDate,
      userName: ticketDraft.userName || "Unknown Staff",
      department: ticketDraft.department || "Information Technology",
      location: ticketDraft.location || "Central Offices",
      deviceType: ticketDraft.deviceType || "Workstation",
      systemAffected: ticketDraft.systemAffected || "LIMS Database",
      category: (ticketDraft.category as TicketCategory) || "Account Management",
      priority: (ticketDraft.priority as PriorityLevel) || "High",
      description: ticketDraft.description || "Diagnostics conducted via Copilot Chat.",
      rootCause: ticketDraft.rootCause || "Undergoing verification",
      actionsTaken: ticketDraft.actionsTaken || "Troubleshooted using EPHI Standard steps.",
      status: "Closed", // Default logged as closed since it is resolved through assistant
      supportOfficer: ticketDraft.supportOfficer || "Abebe Kebede",
      timeSpentMinutes: Number(ticketDraft.timeSpentMinutes) || 30
    };

    onAddTicket(completedTicket);
    setIsCommitSuccess(true);
    setTicketDraft(null);

    // Timeout congratulations screen and redirect
    setTimeout(() => {
      setIsCommitSuccess(false);
      onNavigate("dashboard");
    }, 2200);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-170px)]" id="chatbot-workspace">
      {/* LEFT: The Interactive Chat Window - 7 Cols */}
      <div className="lg:col-span-7 flex flex-col bg-white border border-slate-100 rounded-2xl shadow-xs overflow-hidden h-full">
        {/* Chat header */}
        <div className="bg-slate-900 border-b border-slate-800 p-4 shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg">
              <Bot className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">EPHI Support Assistant</h3>
              <p className="text-[11px] text-slate-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                Gemini 3.5 Model Active
              </p>
            </div>
          </div>
          <button 
            onClick={() => setMessages([
              {
                id: "welcome",
                sender: "copilot",
                text: "Hello! I am your EPHI ICT Support Copilot. Let's restart our session. What tech issue can I troubleshoot for you today?",
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              }
            ])}
            title="Reset Conversation"
            className="p-1 px-2.5 bg-slate-850 hover:bg-slate-800 text-slate-300 font-medium text-xs rounded border border-slate-700/50 cursor-pointer flex items-center gap-1 transition-all"
          >
            <RefreshCw className="w-3 h-3" />
            Clear
          </button>
        </div>

        {/* Chat messages stream */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 min-h-0 bg-slate-50/50" id="chat-scroller">
          {messages.map((msg, index) => {
            // Strip out <ticket_extract> tags if present in the model's text display representation
            const processedText = msg.text.replace(/<ticket_extract>[\s\S]*?<\/ticket_extract>/gi, "").trim();
            const isUser = msg.sender === "user";

            if (processedText === "") return null;

            return (
              <div 
                key={msg.id || index}
                className={`flex gap-3 text-left ${isUser ? "justify-end" : "justify-start"}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center shrink-0 border border-slate-800 text-emerald-400 font-mono text-xs font-bold">
                    EP
                  </div>
                )}
                
                <div className="space-y-1 max-w-[85%]">
                  <div 
                    className={`p-3.5 rounded-2xl text-sm leading-relaxed ${
                      isUser 
                        ? "bg-slate-900 text-white rounded-tr-none" 
                        : "bg-white border border-slate-100 text-slate-800 rounded-tl-none shadow-xs"
                    }`}
                  >
                    {/* Render markdown spacing basics manually */}
                    <div className="whitespace-pre-line space-y-2">
                      {processedText}
                    </div>
                  </div>
                  <p className={`text-[10px] text-slate-400 font-mono ${isUser ? "text-right" : "text-left"}`}>
                    {msg.timestamp}
                  </p>
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200 text-slate-700 font-mono text-xs font-bold font-sans">
                    U
                  </div>
                )}
              </div>
            );
          })}

          {/* Loading States / AI thinking animation */}
          {isLoading && (
            <div className="flex gap-3 text-left">
              <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center shrink-0 border border-slate-800 text-emerald-400 animate-spin font-sans">
                <Loader2 className="w-4 h-4" />
              </div>
              <div className="space-y-1">
                <div className="bg-slate-100/70 p-3.5 px-5 rounded-2xl rounded-tl-none text-xs text-slate-500 font-mono flex items-center gap-2">
                  <Terminal className="w-3.5 h-3.5 animate-pulse text-indigo-500" />
                  EPHI Copilot formulating troubleshooting guide...
                </div>
              </div>
            </div>
          )}

          {/* API Keys Configuration Error Notification */}
          {hasError && (
            <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl text-xs text-rose-800 space-y-2 text-left" id="chat-api-error">
              <div className="flex items-center gap-1.5 font-bold">
                <AlertCircle className="w-4 h-4 text-rose-500" />
                Connectivity Issue / Absent Secret Key
              </div>
              <p className="leading-relaxed">
                {hasError}
              </p>
              <div className="bg-white p-2.5 rounded border border-rose-150 font-mono text-[10px] leading-relaxed text-slate-600">
                To enable the AI Troubleshooting Copilot, paste your real Google Gemini API Key inside 
                the **Settings &gt; Secrets** panel in the top-right corner of Google AI Studio. Keep the name as <code className="bg-slate-100 px-1 py-0.5 rounded text-rose-600">GEMINI_API_KEY</code>.
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick diagnostic shortcut keys */}
        {messages.length === 1 && (
          <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 text-left" id="shortcuts-panel">
            <span className="text-[10px] font-mono font-medium text-slate-400 uppercase tracking-wider block mb-2">
              Instant Diagnostics Launchers
            </span>
            <div className="grid grid-cols-2 gap-2">
              {QUICK_SHORTCUTS.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(s.prompt)}
                  className="p-2 bg-white hover:bg-slate-100/50 text-left border border-slate-200/60 rounded-lg text-xs leading-snug cursor-pointer font-sans transition-all text-slate-700 font-semibold"
                >
                  &rarr; {s.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input box */}
        <div className="p-3 border-t border-slate-100 bg-white shrink-0">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage(inputMessage);
            }}
            className="flex items-center gap-2"
          >
            <input 
              type="text" 
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask for password guide, log an issue, or ask a question..."
              className="flex-1 bg-slate-50 border border-slate-200/80 hover:bg-slate-100/20 focus:bg-white rounded-xl py-2.5 px-4 text-sm outline-none transition-all placeholder:text-slate-400 text-slate-800"
              disabled={isLoading}
            />
            <button 
              type="submit" 
              disabled={!inputMessage.trim() || isLoading}
              className="bg-slate-900 border border-slate-800 hover:bg-emerald-600 hover:border-emerald-700 disabled:bg-slate-100 disabled:border-slate-200 text-white p-2.5 rounded-xl cursor-pointer transition-all shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* RIGHT: Ticket log assistant drafting panel - 5 Cols */}
      <div className="lg:col-span-5 h-full flex flex-col bg-white border border-slate-100 rounded-2xl shadow-xs overflow-hidden">
        <div className="bg-slate-50 border-b border-slate-100 p-4 shrink-0 text-left">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-600" />
            Copilot Ticket Drafting Assistant
          </h3>
          <p className="text-[11px] text-slate-400">Step 5: Automated incident documentation generator</p>
        </div>

        {/* Validation or waiting state representation */}
        <div className="flex-1 p-5 overflow-y-auto min-h-0 text-left space-y-4">
          {isCommitSuccess ? (
            <div className="h-full flex flex-col items-center justify-center p-8 space-y-3 text-center" id="congratulations-panel">
              <div className="w-16 h-16 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-600 flex items-center justify-center">
                <Check className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-bold text-slate-800">Incident File Documented!</h4>
              <p className="text-xs text-slate-500 max-w-sm">
                The technical support log was fully structured and pushed directly into the EPHI Operations Dashboard logs database.
              </p>
              <span className="text-[10px] bg-slate-100 font-mono px-2 py-1 rounded text-slate-500">
                Forwarding to Dashboards...
              </span>
            </div>
          ) : ticketDraft ? (
            <form onSubmit={handleCommitDraft} className="space-y-4" id="ticket-verification-form">
              <div className="bg-emerald-50 border border-emerald-100/50 p-3.5 rounded-xl flex items-start gap-2.5">
                <Plus className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-emerald-800">Draft Extracted Successfully!</h4>
                  <p className="text-[11px] text-emerald-600 leading-normal">
                    Check the details extracted from the AI dialogue below. Modify anything if needed, then sync it to the logs.
                  </p>
                </div>
              </div>

              <div className="space-y-3" id="draft-fields-grid">
                {/* 2 Cols Info */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">User Name</label>
                    <input 
                      type="text"
                      required
                      value={ticketDraft.userName || ""}
                      onChange={(e) => setTicketDraft({ ...ticketDraft, userName: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs outline-none focus:border-slate-400 text-slate-800 font-medium"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Department</label>
                    <select
                      value={ticketDraft.department || ""}
                      onChange={(e) => setTicketDraft({ ...ticketDraft, department: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded px-1.5 py-1 text-xs outline-none focus:border-slate-400 text-slate-800"
                    >
                      {EPHI_DEPARTMENTS.map((d, i) => (
                        <option key={i} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Location</label>
                    <input 
                      type="text"
                      value={ticketDraft.location || ""}
                      onChange={(e) => setTicketDraft({ ...ticketDraft, location: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs outline-none focus:border-slate-400 text-slate-800 font-medium"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Device Type</label>
                    <input 
                      type="text"
                      value={ticketDraft.deviceType || ""}
                      onChange={(e) => setTicketDraft({ ...ticketDraft, deviceType: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs outline-none focus:border-slate-400 text-slate-800 font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">System Affected</label>
                    <input 
                      type="text"
                      value={ticketDraft.systemAffected || ""}
                      onChange={(e) => setTicketDraft({ ...ticketDraft, systemAffected: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs outline-none focus:border-slate-400 text-slate-800 font-medium"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Category</label>
                    <select
                      value={ticketDraft.category || ""}
                      onChange={(e) => setTicketDraft({ ...ticketDraft, category: e.target.value as TicketCategory })}
                      className="w-full bg-slate-50 border border-slate-200 rounded px-1.5 py-1 text-xs outline-none focus:border-slate-400 text-slate-800"
                    >
                      <option value="Account Management">Account Management</option>
                      <option value="Email">Email</option>
                      <option value="Network">Network</option>
                      <option value="Hardware">Hardware</option>
                      <option value="Software">Software</option>
                      <option value="Printer">Printer</option>
                      <option value="Security">Security</option>
                      <option value="VPN">VPN</option>
                      <option value="Operating System">Operating System</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Priority</label>
                    <select
                      value={ticketDraft.priority || ""}
                      onChange={(e) => setTicketDraft({ ...ticketDraft, priority: e.target.value as PriorityLevel })}
                      className="w-full bg-slate-50 border border-slate-200 rounded px-1.5 py-1 text-xs outline-none focus:border-slate-400 text-slate-800 font-medium"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Support Officer</label>
                    <select
                      value={ticketDraft.supportOfficer || ""}
                      onChange={(e) => setTicketDraft({ ...ticketDraft, supportOfficer: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded px-1.5 py-1 text-xs outline-none focus:border-slate-400 text-slate-800"
                    >
                      {EPHI_OFFICERS.map((o, idx) => (
                        <option key={idx} value={o}>{o}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Problem Description</label>
                  <textarea 
                    rows={2}
                    value={ticketDraft.description || ""}
                    onChange={(e) => setTicketDraft({ ...ticketDraft, description: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs outline-none focus:border-slate-400 text-slate-800 font-medium resize-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1 font-sans">Resolved Actions Taken</label>
                  <textarea 
                    rows={2}
                    value={ticketDraft.actionsTaken || ""}
                    onChange={(e) => setTicketDraft({ ...ticketDraft, actionsTaken: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs outline-none focus:border-slate-400 text-slate-800 font-medium resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Time Spent (Minutes)</label>
                    <input 
                      type="number"
                      required
                      value={ticketDraft.timeSpentMinutes ?? ""}
                      onChange={(e) => setTicketDraft({ ...ticketDraft, timeSpentMinutes: Number(e.target.value) })}
                      className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1 text-xs outline-none focus:border-slate-400 text-slate-800 font-mono font-bold"
                    />
                  </div>
                  <div className="flex items-end">
                    <button 
                      type="submit"
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2 px-3 rounded cursor-pointer transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Database className="w-3.5 h-3.5" />
                      Commit Incident Log
                    </button>
                  </div>
                </div>
              </div>
            </form>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-3 my-12" id="empty-draft-panel">
              <Database className="w-12 h-12 text-slate-200 animate-pulse" />
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-slate-700">Waiting for Incident Parameters...</h4>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  As you describe technical issues and troubleshoot in the AI Chat, I will dynamically construct structured parameters (Step 1-5 criteria) for validation.
                </p>
              </div>
              <div className="text-[11px] bg-slate-50 p-3 rounded-lg border border-slate-100 max-w-sm mt-3">
                <strong>Try it:</strong> Click on the <strong className="text-indigo-600 font-sans cursor-pointer" onClick={() => handleSendMessage(QUICK_SHORTCUTS[0].prompt)}>"&rarr; AD Password Reset"</strong> shortcut below the chat line to see auto-extraction in action!
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

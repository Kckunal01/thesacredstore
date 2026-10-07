import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, X, Send, RotateCcw, ArrowRight } from 'lucide-react';
import ConciergeRecommendationCard from './ui/ConciergeRecommendationCard';

const INITIAL_GREETING = {
  role: 'assistant',
  content: "Welcome to The Sacred Store ✨\n\nTell me what you're looking for, who it's for, or how you want it to feel — I'll find the perfect piece from our collection.",
  recommendations: [],
  categoryLinks: [],
  policyLinks: [],
};

// 8 Clickable Starter Questions
const STARTER_QUESTIONS = [
  "Help me choose a crystal for what I'm going through",
  "I need a meaningful gift",
  "Help me choose a bracelet",
  "I need something for protection",
  "I want something for abundance & growth",
  "I don't know which crystal is right for me",
  "Help me choose something within my budget",
  "Tell me about The Sacred Store",
];

// Render markdown-like **bold** in AI messages
function renderFormattedText(text) {
  if (!text) return null;
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-semibold text-[#2B241C]">{part.slice(2, -2)}</strong>;
    }
    return <span key={i}>{part}</span>;
  });
}

const AskSacred = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([INITIAL_GREETING]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 250);
    }
  }, [isOpen, messages, loading]);

  const handleSendMessage = async (textToSend) => {
    const text = (textToSend || input).trim();
    if (!text || loading) return;

    const newMessages = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const historyPayload = newMessages
        .slice(1, -1)
        .map(m => ({ role: m.role, content: m.content }));

      const response = await fetch('/api/ai-recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history: historyPayload }),
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();

      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: data.message || "Here are a few pieces from our collection that might speak to you:",
          recommendations: data.recommendations || [],
          categoryLinks: data.categoryLinks || [],
          policyLinks: data.policyLinks || [],
        },
      ]);
    } catch (err) {
      console.error('AskSacred error:', err);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: "I'm having a little trouble right now. Please try asking again in just a moment.",
          recommendations: [],
          categoryLinks: [],
          policyLinks: [],
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleReset = () => {
    setMessages([INITIAL_GREETING]);
    setInput('');
  };

  return (
    <>
      {/* ── FLOATING ACTION BUTTON — BOTTOMMOST ── */}
      <div className="fixed bottom-6 right-6 z-[95] flex flex-col items-center">
        <button
          onClick={() => setIsOpen(prev => !prev)}
          aria-label="Ask Sacred - AI Crystal Concierge"
          className="group relative bg-[#1E1A15] text-[#FBF6EE] w-14 h-14 rounded-full shadow-xl hover:shadow-2xl border border-[#B89968]/50 flex items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95"
        >
          {isOpen ? (
            <X className="w-6 h-6 text-[#FBF6EE] transition-transform duration-200" />
          ) : (
            <>
              <Sparkles className="w-6 h-6 text-[#B89968] group-hover:rotate-12 transition-transform duration-300" />
              <span className="sr-only">Ask Sacred Concierge</span>
            </>
          )}
        </button>
      </div>

      {/* ── CHAT PANEL ── */}
      {isOpen && (
        <div className="fixed inset-x-0 bottom-0 top-20 md:top-24 md:bottom-24 md:right-6 md:left-auto md:w-[420px] md:h-[calc(100vh-120px)] md:max-h-[680px] z-[110] bg-[#FAF7F2] md:rounded-2xl border border-[#E0D8CB] shadow-2xl flex flex-col overflow-hidden">

          {/* ── HEADER ── */}
          <div className="bg-[#1E1A15] text-[#FBF6EE] px-5 py-4 flex items-center justify-between border-b border-[#3D3328]/60 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#B89968] to-[#8B7347] flex items-center justify-center shadow-inner">
                <Sparkles className="w-[18px] h-[18px] text-white" />
              </div>
              <div>
                <h2 className="font-display font-semibold text-[15px] tracking-[0.08em] text-[#FBF6EE] leading-tight uppercase">
                  Ask Sacred
                </h2>
                <p className="text-[10.5px] text-[#B89968] font-medium tracking-wide leading-tight mt-0.5">
                  24×7 AI Guide
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleReset}
                title="Start a new conversation"
                className="p-2 text-[#8B7F72] hover:text-[#FBF6EE] rounded-lg hover:bg-white/10 transition-colors"
                aria-label="Reset chat"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-[#8B7F72] hover:text-[#FBF6EE] rounded-lg hover:bg-white/10 transition-colors"
                aria-label="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* ── CHAT BODY ── */}
          <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4 text-[13px] font-body">
            {messages.map((msg, index) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={index}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[88%] rounded-2xl px-4 py-3 leading-[1.65] whitespace-pre-line ${
                      isUser
                        ? 'bg-[#1E1A15] text-[#FBF6EE] rounded-br-sm shadow-md'
                        : 'bg-white text-[#3A342C] rounded-bl-sm border border-[#EAE3D8] shadow-sm'
                    }`}
                  >
                    {isUser ? msg.content : renderFormattedText(msg.content)}
                  </div>

                  {/* Product Recommendations */}
                  {!isUser && msg.recommendations && msg.recommendations.length > 0 && (
                    <div className="w-full mt-2.5 space-y-2">
                      {msg.recommendations.map(rec => (
                        <ConciergeRecommendationCard
                          key={rec.productId}
                          productId={rec.productId}
                          reason={rec.reason}
                          onCloseChat={() => setIsOpen(false)}
                        />
                      ))}
                    </div>
                  )}

                  {/* Category Action Links */}
                  {!isUser && msg.categoryLinks && msg.categoryLinks.length > 0 && (
                    <div className="w-full mt-2.5 flex flex-wrap gap-1.5">
                      {msg.categoryLinks.map((cat, cIdx) => (
                        <Link
                          key={cIdx}
                          to={cat.route}
                          onClick={() => setIsOpen(false)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white border border-[#B89968]/60 text-[#2B241C] hover:bg-[#B89968] hover:text-white transition-all text-[11px] font-semibold uppercase tracking-wider shadow-sm"
                        >
                          <span>{cat.label}</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* Policy Links */}
                  {!isUser && msg.policyLinks && msg.policyLinks.length > 0 && (
                    <div className="w-full mt-2 flex flex-wrap gap-1.5">
                      {msg.policyLinks.map((pol, pIdx) => (
                        <Link
                          key={pIdx}
                          to={pol.route}
                          onClick={() => setIsOpen(false)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#E0D8CB] text-[#5E5A52] hover:text-[#2B241C] hover:border-[#B89968] transition-colors text-[11px] font-medium tracking-wide shadow-xs"
                        >
                          <span>{pol.label}</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {/* ── STARTER QUESTIONS — Clean single-line left-aligned horizontal rectangles ── */}
            {messages.length === 1 && (
              <div className="mt-4 pt-4 border-t border-[#E8DFD3]/60">
                <p className="text-[10px] font-semibold text-[#A0947F] uppercase tracking-[0.15em] mb-2.5 px-0.5">
                  Try asking
                </p>
                <div className="flex flex-col gap-2">
                  {STARTER_QUESTIONS.map((qText, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(qText)}
                      className="w-full text-left bg-white border border-[#EAE3D8] hover:border-[#B89968] hover:bg-[#FAF7F2] rounded-xl px-3.5 py-2.5 transition-all duration-200 shadow-xs cursor-pointer active:scale-[0.99] flex items-center justify-between group"
                    >
                      <span className="text-[12px] text-[#3A342C] font-medium truncate pr-2">
                        {qText}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#A0947F] group-hover:text-[#B89968] group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Typing Indicator */}
            {loading && (
              <div className="flex items-start">
                <div className="bg-white border border-[#EAE3D8] rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#B89968] animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#B89968] animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#B89968] animate-bounce" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* ── DISCLOSURE ── */}
          <div className="text-[9.5px] text-[#A0947F] text-center py-1.5 px-4 bg-[#F5F1EA] border-t border-[#EAE3D8]/60 flex-shrink-0 tracking-wide">
            AI assistant · Recommendations are for guidance and may not always be accurate
          </div>

          {/* ── INPUT BAR ── */}
          <div className="p-3 bg-white border-t border-[#EAE3D8] flex-shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2 bg-[#FAF7F2] rounded-xl border border-[#E0D8CB] px-3.5 py-1.5 focus-within:border-[#B89968] focus-within:shadow-[0_0_0_3px_rgba(184,153,104,0.1)] transition-all duration-200"
            >
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Tell me what you're looking for..."
                rows={1}
                className="flex-1 bg-transparent border-none text-[13px] text-[#2B241C] placeholder:text-[#B0A696] focus:outline-none resize-none max-h-24 py-1.5 font-body"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                aria-label="Send message"
                className="w-9 h-9 rounded-xl bg-[#1E1A15] text-white flex items-center justify-center hover:bg-[#B89968] disabled:opacity-25 disabled:hover:bg-[#1E1A15] transition-all duration-200 flex-shrink-0 cursor-pointer shadow-sm"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AskSacred;

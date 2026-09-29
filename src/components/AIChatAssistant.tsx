"use client";

import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  User, 
  MessageSquare, 
  Sparkles, 
  BarChart3, 
  TrendingUp, 
  HelpCircle, 
  Copy, 
  Check, 
  Zap,
  Clock
} from 'lucide-react';
import { useTrading } from '@/context/TradingContext';

export default function AIChatAssistant() {
  const { chatMessages, sendChatMessage } = useTrading();
  const [inputText, setInputText] = useState('');
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom whenever messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const handleSend = (textToSend?: string) => {
    const text = (textToSend !== undefined ? textToSend : inputText).trim();
    if (!text) return;
    
    sendChatMessage(text);
    if (textToSend === undefined) {
      setInputText('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCopy = (id: number, text: string) => {
    if (!navigator?.clipboard) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const formatTimestamp = (ts: string) => {
    if (!mounted) return '';
    try {
      const date = new Date(ts);
      if (!isNaN(date.getTime())) {
        return date.toLocaleTimeString('th-TH', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        });
      }
    } catch {
      // Fallback to raw string
    }
    return ts;
  };

  // Quick action presets requested
  const quickActions = [
    { label: 'วิเคราะห์กราฟ', icon: BarChart3, desc: 'Technical & Indicators' },
    { label: 'สรุปวันนี้', icon: TrendingUp, desc: 'Win Rate & Profit' },
    { label: 'ควรเข้าไหม?', icon: HelpCircle, desc: 'AI Confidence Signal' },
  ];

  // Determine if AI is actively generating response (last message is from user)
  const isAITyping = chatMessages.length > 0 && chatMessages[chatMessages.length - 1].role === 'user';

  return (
    <div className="flex flex-col h-full w-full bg-[#0a0f1c] text-slate-200 border border-slate-800 rounded-lg overflow-hidden shadow-xl">
      {/* 1. Header */}
      <div className="h-14 bg-[#131b2f] border-b border-slate-800 px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Bot className="w-5 h-5" />
            </div>
            {/* Online Indicator */}
            <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-[#131b2f]"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-slate-100 flex items-center gap-1.5">
                <span>🤖</span> AI Assistant
              </h2>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                ONLINE
              </span>
            </div>
            <p className="text-[11px] text-slate-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              ผู้ช่วยวิเคราะห์การเทรดอัจฉริยะแบบเรียลไทม์
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-xs text-slate-400">
            <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
            <span>{chatMessages.length} ข้อความ</span>
          </div>
        </div>
      </div>

      {/* 2. Messages Area (scrollable) */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent"
      >
        {chatMessages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-2 shadow-inner">
              <Bot className="w-7 h-7" />
            </div>
            <h3 className="text-base font-semibold text-slate-200">เริ่มการสนทนากับ AI</h3>
            <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
              ถามข้อมูลเกี่ยวกับกลยุทธ์ สถิติการเทรด หรือคลิกปุ่มด้านล่างเพื่อวิเคราะห์ตลาดได้ทันที
            </p>
          </div>
        ) : (
          chatMessages.map((msg) => {
            const isUser = msg.role === 'user';
            const formattedTime = formatTimestamp(msg.timestamp);

            return (
              <div 
                key={msg.id} 
                className={`flex items-start gap-2.5 sm:gap-3 ${isUser ? 'flex-row-reverse justify-start' : 'justify-start'}`}
              >
                {/* Avatar Icon */}
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${
                    isUser 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-[#131b2f] border border-slate-700 text-blue-400'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* Message Bubble Container */}
                <div className={`flex flex-col max-w-[85%] sm:max-w-[75%] ${isUser ? 'items-end' : 'items-start'}`}>
                  {/* Sender Label & Timestamp */}
                  <div className="flex items-center gap-1.5 mb-1 px-1 text-[11px] text-slate-400">
                    <span className="font-semibold">{isUser ? 'คุณ' : 'AI Assistant'}</span>
                    <span>•</span>
                    <span className="flex items-center gap-0.5 text-slate-500">
                      <Clock className="w-3 h-3" />
                      {formattedTime}
                    </span>
                  </div>

                  {/* Message Bubble */}
                  <div 
                    className={`relative group rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-md transition-all ${
                      isUser 
                        ? 'bg-blue-600 text-white rounded-tr-xs' 
                        : 'bg-[#131b2f] border border-slate-800 text-slate-200 rounded-tl-xs'
                    }`}
                  >
                    {/* Content text with newline support */}
                    <div className="whitespace-pre-wrap break-words font-sans">
                      {msg.content}
                    </div>

                    {/* Copy action button on hover for AI responses */}
                    {!isUser && (
                      <button
                        onClick={() => handleCopy(msg.id, msg.content)}
                        className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200"
                        title="คัดลอกข้อความ"
                      >
                        {copiedId === msg.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* AI Typing / Analyzing Indicator */}
        {isAITyping && (
          <div className="flex items-start gap-2.5 sm:gap-3 justify-start animate-fade-in">
            <div className="w-8 h-8 rounded-full bg-[#131b2f] border border-slate-700 flex items-center justify-center text-blue-400 shrink-0">
              <Bot className="w-4 h-4 animate-pulse" />
            </div>
            <div className="bg-[#131b2f] border border-slate-800 rounded-2xl rounded-tl-xs px-4 py-3 flex items-center gap-2.5 text-xs text-slate-300 shadow-md">
              <Sparkles className="w-4 h-4 text-blue-400 animate-spin" />
              <span>AI กำลังประมวลผลคำตอบ...</span>
              <span className="flex items-center gap-1 ml-1">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce"></span>
              </span>
            </div>
          </div>
        )}

        {/* Bottom anchor for auto-scroll */}
        <div ref={messagesEndRef} />
      </div>

      {/* 3. Quick Action Buttons */}
      <div className="px-3 sm:px-4 py-2.5 bg-[#131b2f]/60 border-t border-slate-800/80 shrink-0">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-0.5">
          <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1 shrink-0 pl-0.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            คำสั่งด่วน:
          </span>
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.label}
                type="button"
                onClick={() => handleSend(action.label)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#0a0f1c] hover:bg-slate-800 border border-slate-800 hover:border-blue-500/50 text-slate-300 hover:text-white text-xs font-medium transition-all shrink-0 cursor-pointer shadow-sm group active:scale-95"
              >
                <Icon className="w-3.5 h-3.5 text-blue-400 group-hover:text-blue-300 transition-colors" />
                <span>{action.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Input Field with Send Button */}
      <div className="p-3 sm:p-4 bg-[#131b2f] border-t border-slate-800 shrink-0">
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }} 
          className="flex items-center gap-2"
        >
          <div className="relative flex-1">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="พิมพ์คำถาม เช่น วิเคราะห์กราฟ, สรุปวันนี้, ควรเข้าไหม..."
              className="w-full bg-[#0a0f1c] text-slate-200 placeholder-slate-500 text-sm rounded-xl px-4 py-2.5 border border-slate-800 focus:outline-none focus:border-blue-500/60 focus:ring-1 focus:ring-blue-500/30 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={!inputText.trim()}
            className="p-2.5 sm:px-4 sm:py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800/80 disabled:text-slate-600 text-white font-medium text-sm flex items-center justify-center gap-1.5 transition-all shadow-md shrink-0 cursor-pointer disabled:cursor-not-allowed active:scale-95"
            title="ส่งข้อความ (Enter)"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">ส่ง</span>
          </button>
        </form>
      </div>
    </div>
  );
}

export { AIChatAssistant };

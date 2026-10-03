"use client";

import React, { useState, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useTrading } from "@/context/TradingContext";
import SidebarLeft from "@/components/SidebarLeft";
import SidebarRight from "@/components/SidebarRight";
import MainDashboard from "@/components/MainDashboard";
import BottomBar from "@/components/BottomBar";
import SettingsModal from "@/components/SettingsModal";
import AccountModal from "@/components/AccountModal";
import AIPreTradeConfigModal from "@/components/AIPreTradeConfigModal";
import AISignalDashboard from "@/components/AISignalDashboard";
import SmartRiskManager from "@/components/SmartRiskManager";
import NotificationsPanel from "@/components/NotificationsPanel";
import ExnessWebTrading from "@/components/ExnessWebTrading";
import { 
  User, 
  LogIn, 
  CheckCircle2, 
  LayoutDashboard, 
  Wallet, 
  Activity, 
  BarChart2, 
  Play, 
  Square,
  ArrowLeft 
} from "lucide-react";

const panelComponents: Record<string, React.ComponentType> = {
  'แดชบอร์ด': MainDashboard,
  'Exness เทรด': ExnessWebTrading,
  'AI สัญญาณ': AISignalDashboard,
  'ความเสี่ยง': SmartRiskManager,
  'แจ้งเตือน': NotificationsPanel,
};

type MobileViewTab = 'panel' | 'portfolio' | 'orders' | 'chart';

export default function Home() {
  const { 
    activePanel, 
    setActivePanel, 
    user, 
    setIsLoginModalOpen, 
    isRunning, 
    setIsRunning,
    notifications
  } = useTrading();

  const containerRef = useRef<HTMLDivElement>(null);
  const [mobileView, setMobileView] = useState<MobileViewTab>('panel');
  const unreadCount = notifications.filter(n => !n.read).length;

  const ActiveComponent = panelComponents[activePanel] || MainDashboard;

  // GSAP Initial & Layout Animations
  useGSAP(() => {
    // Stagger in nav tab buttons
    gsap.fromTo(
      ".nav-tab-item",
      { opacity: 0, y: -10 },
      { opacity: 1, y: 0, duration: 0.4, stagger: 0.03, ease: "power2.out" }
    );

    // Sidebar entrances
    gsap.fromTo(
      ".gsap-sidebar-left",
      { opacity: 0, x: -20 },
      { opacity: 1, x: 0, duration: 0.5, ease: "power3.out" }
    );
    gsap.fromTo(
      ".gsap-sidebar-right",
      { opacity: 0, x: 20 },
      { opacity: 1, x: 0, duration: 0.5, ease: "power3.out" }
    );
  }, { scope: containerRef });

  // GSAP Animation when Active Panel changes
  useGSAP(() => {
    gsap.fromTo(
      ".gsap-active-panel",
      { opacity: 0, scale: 0.985, y: 8 },
      { opacity: 1, scale: 1, y: 0, duration: 0.35, ease: "power2.out" }
    );
  }, { dependencies: [activePanel, mobileView], scope: containerRef });

  return (
    <main ref={containerRef} className="flex flex-col h-screen bg-slate-950 text-slate-200 font-sans overflow-hidden select-none">
      {/* Top Header: Navigation Tabs + Account Profile */}
      <header className="w-full bg-[#131b2f] border-b border-slate-800 px-2 sm:px-4 py-1.5 flex items-center justify-between gap-2 shrink-0 z-30 shadow-md">
        {/* Navigation Tabs (Smooth touch and mouse scrolling on all devices) */}
        <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto py-0.5 flex-1 mr-2 scrollbar-none">
          {Object.keys(panelComponents).map((key) => {
            const isActive = activePanel === key;
            const isExness = key === 'Exness เทรด';
            return (
              <button
                key={key}
                onClick={() => {
                  setActivePanel(key);
                  setMobileView('panel');
                }}
                className={`nav-tab-item px-2.5 sm:px-3 py-1 text-[11px] sm:text-xs rounded-md whitespace-nowrap transition-all cursor-pointer font-medium shrink-0 flex items-center gap-1.5 ${
                  isActive
                    ? isExness 
                      ? 'bg-amber-500/30 text-amber-300 border border-amber-400 shadow-sm shadow-amber-500/20 font-bold'
                      : 'bg-blue-600/30 text-blue-400 border border-blue-500/60 shadow-xs'
                    : isExness
                      ? 'bg-amber-950/40 text-amber-400 hover:bg-amber-900/50 border border-amber-500/40 hover:text-amber-200'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 border border-transparent'
                }`}
              >
                {isExness && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>}
                <span>{key}</span>
                {isExness && (
                  <span className="px-1 py-0.2 text-[9px] bg-emerald-500/30 text-emerald-300 rounded font-mono font-bold">
                    LIVE
                  </span>
                )}
                {key === 'แจ้งเตือน' && unreadCount > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 text-[9px] bg-red-500 text-white rounded-full font-bold animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Account / Login Profile Button (Compact on Mobile, Full on Desktop) */}
        <div className="flex items-center shrink-0">
          <button
            onClick={() => setIsLoginModalOpen(true)}
            className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 hover:border-blue-500/60 rounded-lg text-xs transition-all cursor-pointer shadow-xs"
            title="จัดการบัญชีและเข้าสู่ระบบ"
          >
            <div className="w-6 h-6 rounded-full bg-blue-600/30 border border-blue-500/50 flex items-center justify-center text-blue-400">
              {user.isLoggedIn ? <User size={13} /> : <LogIn size={13} />}
            </div>
            
            <div className="hidden md:flex flex-col text-left">
              <span className="text-[11px] font-bold text-slate-200 leading-tight flex items-center gap-1">
                {user.email.split('@')[0]}
                {user.isLoggedIn && <CheckCircle2 size={11} className="text-green-400" />}
              </span>
              <span className="text-[9px] text-slate-400 leading-tight">
                {user.broker} • <strong className={user.accountType === 'REAL' ? 'text-green-400' : 'text-amber-400'}>{user.accountType === 'REAL' ? 'บัญชีจริง' : 'ทดลองเทรด'}</strong>
              </span>
            </div>

            <span className={`md:hidden text-[10px] font-bold px-1.5 py-0.5 rounded border ${
              user.accountType === 'REAL' 
                ? 'bg-green-500/20 text-green-400 border-green-500/40' 
                : 'bg-amber-500/20 text-amber-400 border-amber-500/40'
            }`}>
              {user.accountType === 'REAL' ? 'REAL' : 'DEMO'}
            </span>
          </button>
        </div>
      </header>

      {/* Mobile Sub-Navigation Bar (Shown only on Mobile < 768px) */}
      <div className="md:hidden bg-[#0c1222] border-b border-slate-800/80 px-2 py-1 flex items-center justify-around text-xs shrink-0 z-20">
        <button
          onClick={() => setMobileView('panel')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded transition-colors ${
            mobileView === 'panel' 
              ? 'bg-blue-600/25 text-blue-400 font-bold border border-blue-500/40' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <LayoutDashboard size={13} />
          <span>{activePanel}</span>
        </button>
        <button
          onClick={() => setMobileView('portfolio')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded transition-colors ${
            mobileView === 'portfolio' 
              ? 'bg-amber-500/25 text-amber-400 font-bold border border-amber-500/40' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Wallet size={13} />
          <span>ทุน & เป้า</span>
        </button>
        <button
          onClick={() => setMobileView('orders')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded transition-colors ${
            mobileView === 'orders' 
              ? 'bg-green-500/25 text-green-400 font-bold border border-green-500/40' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Activity size={13} />
          <span>ออเดอร์สด</span>
        </button>
        <button
          onClick={() => setMobileView('chart')}
          className={`flex items-center gap-1 px-2.5 py-1 rounded transition-colors ${
            mobileView === 'chart' 
              ? 'bg-purple-500/25 text-purple-400 font-bold border border-purple-500/40' 
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <BarChart2 size={13} />
          <span>กราฟแท่ง</span>
        </button>
      </div>

      {/* Main Workspace Layout */}
      <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden relative">
        {/* Left Sidebar (Desktop: always visible, Mobile: visible when 'portfolio' tab is active) */}
        <div className={`
          ${mobileView === 'portfolio' ? 'flex flex-1' : 'hidden'} 
          md:flex w-full md:w-56 lg:w-64 shrink-0 h-full overflow-hidden gsap-sidebar-left
        `}>
          <SidebarLeft />
        </div>
        
        {/* Center Main Panel (Desktop: always visible, Mobile: visible when 'panel' tab is active) */}
        <div className={`
          ${mobileView === 'panel' ? 'flex flex-1' : 'hidden'} 
          md:flex flex-1 flex-col min-h-0 h-full overflow-hidden relative gsap-active-panel
        `}>
          {/* Back to Main Dashboard button banner when inside any sub-menu */}
          {activePanel !== 'แดชบอร์ด' && (
            <div className="bg-[#111827] border-b border-blue-500/30 px-3 py-1.5 flex items-center justify-between shrink-0 z-20 shadow-xs">
              <button
                onClick={() => {
                  setActivePanel('แดชบอร์ด');
                  setMobileView('panel');
                }}
                className="flex items-center gap-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 px-3 py-1 rounded-lg transition-all cursor-pointer shadow-sm shadow-blue-600/30 active:scale-95 border border-blue-400/40"
              >
                <ArrowLeft size={14} />
                <span>← กลับหน้าหลัก (แดชบอร์ด)</span>
              </button>
              <div className="flex items-center gap-2 text-xs text-slate-300">
                <span className="text-slate-400">เมนูปัจจุบัน:</span>
                <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 font-medium">
                  {activePanel}
                </span>
              </div>
            </div>
          )}

          <ActiveComponent />
        </div>

        {/* Right Sidebar (Desktop: always visible, Mobile: visible when 'orders' tab is active) */}
        <div className={`
          ${mobileView === 'orders' ? 'flex flex-1' : 'hidden'} 
          md:flex w-full md:w-64 xl:w-72 shrink-0 h-full overflow-hidden gsap-sidebar-right
        `}>
          <SidebarRight />
        </div>

        {/* Mobile Dedicated Chart View */}
        {mobileView === 'chart' && (
          <div className="md:hidden flex flex-1 flex-col min-h-0 h-full overflow-y-auto p-2 bg-[#0a0f1c] gsap-active-panel">
            <div className="text-xs font-bold text-slate-300 mb-2 px-1">กราฟผลลัพธ์ประสิทธิภาพ (Performance Bar)</div>
            <BottomBar />
          </div>
        )}
      </div>
      
      {/* Bottom Bar (Desktop: docked at bottom, Mobile: hidden by default or shown in tab) */}
      <div className="hidden md:block w-full shrink-0">
        <BottomBar />
      </div>

      {/* Global Modals (Rendered at root to prevent GSAP transform clipping) */}
      <SettingsModal />
      <AccountModal />
      <AIPreTradeConfigModal />

      {/* Mobile Floating Quick Action START/STOP Button (Allows controlling bot from ANY screen on phone) */}
      <div className="md:hidden fixed bottom-3 right-3 z-40">
        <button
          onClick={() => setIsRunning(!isRunning)}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full font-bold text-xs shadow-xl transition-all ${
            isRunning
              ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/40 animate-pulse'
              : 'bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 text-white shadow-amber-500/30'
          }`}
        >
          {isRunning ? <Square size={13} fill="currentColor" /> : <Play size={13} fill="currentColor" />}
          <span>{isRunning ? 'STOP BOT' : 'START BOT'}</span>
        </button>
      </div>
    </main>
  );
}

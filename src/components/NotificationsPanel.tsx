"use client";

import { useState } from 'react';
import { 
  Bell, 
  Check, 
  X, 
  Zap, 
  AlertTriangle, 
  Award, 
  Trash2, 
  CheckCheck, 
  Clock 
} from 'lucide-react';
import { useTrading, type Notification } from '@/context/TradingContext';

type FilterTab = 'all' | 'signal' | 'win_lose' | 'risk' | 'achievement';

export default function NotificationsPanel() {
  const { notifications, markNotificationRead, markAllNotificationsRead, clearNotifications } = useTrading();
  const [activeTab, setActiveTab] = useState<FilterTab>('all');

  const unreadCount = notifications.filter(n => !n.read).length;

  const tabs: { key: FilterTab; label: string }[] = [
    { key: 'all', label: 'ทั้งหมด' },
    { key: 'signal', label: 'สัญญาณ' },
    { key: 'win_lose', label: 'ชนะ/แพ้' },
    { key: 'risk', label: 'ความเสี่ยง' },
    { key: 'achievement', label: 'รางวัล' },
  ];

  const getFilteredNotifications = () => {
    switch (activeTab) {
      case 'signal':
        return notifications.filter(n => n.type === 'signal');
      case 'win_lose':
        return notifications.filter(n => n.type === 'win' || n.type === 'lose');
      case 'risk':
        return notifications.filter(n => n.type === 'risk' || n.type === 'target');
      case 'achievement':
        return notifications.filter(n => n.type === 'achievement');
      case 'all':
      default:
        return notifications;
    }
  };

  const getCountForTab = (tab: FilterTab) => {
    switch (tab) {
      case 'signal':
        return notifications.filter(n => n.type === 'signal').length;
      case 'win_lose':
        return notifications.filter(n => n.type === 'win' || n.type === 'lose').length;
      case 'risk':
        return notifications.filter(n => n.type === 'risk' || n.type === 'target').length;
      case 'achievement':
        return notifications.filter(n => n.type === 'achievement').length;
      case 'all':
      default:
        return notifications.length;
    }
  };

  const handleMarkAllRead = () => {
    markAllNotificationsRead();
  };

  const getTypeConfig = (type: Notification['type']) => {
    switch (type) {
      case 'win':
        return {
          label: 'ชนะ (WIN)',
          icon: Check,
          iconColor: 'text-emerald-400',
          badgeBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
          accentBorder: 'border-l-emerald-500',
        };
      case 'lose':
        return {
          label: 'แพ้ (LOSS)',
          icon: X,
          iconColor: 'text-rose-400',
          badgeBg: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
          accentBorder: 'border-l-rose-500',
        };
      case 'signal':
        return {
          label: 'สัญญาณ AI',
          icon: Zap,
          iconColor: 'text-blue-400',
          badgeBg: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
          accentBorder: 'border-l-blue-500',
        };
      case 'risk':
        return {
          label: 'ความเสี่ยง',
          icon: AlertTriangle,
          iconColor: 'text-amber-400',
          badgeBg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
          accentBorder: 'border-l-amber-500',
        };
      case 'target':
        return {
          label: 'เป้าหมาย',
          icon: AlertTriangle,
          iconColor: 'text-cyan-400',
          badgeBg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
          accentBorder: 'border-l-cyan-500',
        };
      case 'achievement':
        return {
          label: 'รางวัลความสำเร็จ',
          icon: Award,
          iconColor: 'text-yellow-400',
          badgeBg: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
          accentBorder: 'border-l-yellow-500',
        };
      default:
        return {
          label: 'ทั่วไป',
          icon: Bell,
          iconColor: 'text-slate-400',
          badgeBg: 'bg-slate-800 text-slate-300 border-slate-700',
          accentBorder: 'border-l-slate-600',
        };
    }
  };

  const filteredList = getFilteredNotifications();
  const currentTabObj = tabs.find(t => t.key === activeTab);

  return (
    <div className="flex-1 flex flex-col bg-[#0a0f1c] min-h-0 overflow-hidden rounded-md border border-slate-800 m-2 relative">
      {/* Header */}
      <div className="bg-[#131b2f] border-b border-slate-800 p-3 sm:px-4 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Bell size={18} />
            </div>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-blue-500 ring-2 ring-[#131b2f] animate-pulse" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-slate-100">
                การแจ้งเตือนอัจฉริยะ
              </h2>
              {notifications.length > 0 && (
                <span className="px-1.5 py-0.5 text-[11px] font-mono rounded-full bg-slate-800 border border-slate-700 text-slate-300">
                  {notifications.length}
                </span>
              )}
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-400">
                  {unreadCount} ใหม่
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              ติดตามสัญญาณ AI ผลการเทรด และการจัดการความเสี่ยงแบบเรียลไทม์
            </p>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
              title="อ่านทั้งหมด"
            >
              <CheckCheck size={14} className="text-blue-400" />
              <span className="hidden sm:inline">อ่านทั้งหมด</span>
            </button>
          )}

          <button
            onClick={clearNotifications}
            disabled={notifications.length === 0}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs rounded border border-slate-700 bg-slate-800/80 hover:bg-rose-500/20 hover:border-rose-500/40 text-slate-300 hover:text-rose-400 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            title="ล้างการแจ้งเตือนทั้งหมด"
          >
            <Trash2 size={14} />
            <span>ล้างทั้งหมด</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-[#0e1628] border-b border-slate-800 px-3 py-2 shrink-0">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-0.5">
          {tabs.map(tab => {
            const count = getCountForTab(tab.key);
            const isActive = activeTab === tab.key;

            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium whitespace-nowrap transition-all duration-150 border ${
                  isActive
                    ? 'bg-blue-600/20 border-blue-500/40 text-blue-400 shadow-sm'
                    : 'bg-slate-900/60 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isActive
                      ? 'bg-blue-500/30 text-blue-300'
                      : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Notification List Area */}
      <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2.5 min-h-0">
        {filteredList.length === 0 ? (
          /* Empty State */
          <div className="h-full flex flex-col items-center justify-center text-center py-16 px-4">
            <div className="w-14 h-14 rounded-2xl bg-[#131b2f] border border-slate-800 flex items-center justify-center text-slate-500 mb-3 shadow-inner">
              <Bell size={26} className="stroke-[1.5] text-slate-500" />
            </div>
            <h3 className="text-sm font-semibold text-slate-200 mb-1">
              ไม่มีการแจ้งเตือน
            </h3>
            <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
              {activeTab === 'all'
                ? 'ยังไม่มีการแจ้งเตือนในระบบ เมื่อมีสัญญาณ AI, ผลการเทรด หรือข้อความความเสี่ยง ข้อมูลจะแสดงขึ้นที่นี่อัตโนมัติ'
                : `ไม่มีรายการแจ้งเตือนในหมวด "${currentTabObj?.label}" ในขณะนี้`}
            </p>
          </div>
        ) : (
          filteredList.map(item => {
            const config = getTypeConfig(item.type);
            const Icon = config.icon;

            return (
              <div
                key={item.id}
                onClick={() => {
                  if (!item.read) {
                    markNotificationRead(item.id);
                  }
                }}
                className={`group relative flex items-start gap-3 p-3 sm:p-3.5 rounded-lg border border-l-4 transition-all duration-200 cursor-pointer ${
                  config.accentBorder
                } ${
                  item.read
                    ? 'bg-[#0d1424]/60 border-slate-800/80 hover:bg-[#131b2f]/70 hover:border-slate-700/80 opacity-80 hover:opacity-100'
                    : 'bg-[#131b2f] border-slate-700/90 hover:border-blue-500/40 shadow-sm'
                }`}
                title={item.read ? 'อ่านแล้ว' : 'คลิกเพื่อทำเครื่องหมายว่าอ่านแล้ว'}
              >
                {/* Icon Container */}
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border mt-0.5 ${config.badgeBg}`}
                >
                  <Icon size={18} className={config.iconColor} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${config.badgeBg}`}
                      >
                        {config.label}
                      </span>
                      <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                        <Clock size={11} className="text-slate-500" />
                        <span>{item.time}</span>
                      </div>
                    </div>

                    {/* Unread indicator */}
                    {!item.read && (
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)] animate-pulse" />
                        <span className="text-[10px] text-blue-400 hidden sm:inline">
                          ใหม่
                        </span>
                      </div>
                    )}
                  </div>

                  <p
                    className={`text-xs sm:text-sm leading-snug break-words ${
                      item.read ? 'text-slate-300 font-normal' : 'text-slate-100 font-medium'
                    }`}
                  >
                    {item.message}
                  </p>
                </div>

                {/* Hover Check action for unread */}
                {!item.read && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      markNotificationRead(item.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-blue-400 shrink-0 self-center"
                    title="ทำเครื่องหมายว่าอ่านแล้ว"
                  >
                    <Check size={14} />
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer Status Bar */}
      <div className="bg-[#131b2f] border-t border-slate-800 px-4 py-2 flex items-center justify-between text-[11px] text-slate-400 shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
          <span>ระบบตรวจจับสัญญาณอัตโนมัติเปิดใช้งานอยู่</span>
        </div>
        <div className="font-mono text-slate-400">
          แสดง {filteredList.length} / {notifications.length} รายการ
        </div>
      </div>
    </div>
  );
}

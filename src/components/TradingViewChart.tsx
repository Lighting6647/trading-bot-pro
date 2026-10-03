"use client";

import React, { useEffect, useRef, useState } from 'react';
import { Maximize2, Minimize2, RefreshCw, BarChart2, TrendingUp, Zap } from 'lucide-react';

type Props = {
  symbol?: string;
  theme?: 'dark' | 'light';
  height?: number | string;
  allowFullscreen?: boolean;
};

export default function TradingViewChart({
  symbol = 'OANDA:XAUUSD',
  theme = 'dark',
  height = 380,
  allowFullscreen = true,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentSymbol, setCurrentSymbol] = useState(symbol);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear previous widget
    containerRef.current.innerHTML = '';

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.type = 'text/javascript';
    script.async = true;
    script.onload = () => {
      if (typeof (window as any).TradingView !== 'undefined' && containerRef.current) {
        new (window as any).TradingView.widget({
          container_id: containerRef.current.id,
          autosize: true,
          symbol: currentSymbol,
          interval: '5',
          timezone: 'Asia/Bangkok',
          theme: theme,
          style: '1', // Candlestick
          locale: 'th',
          toolbar_bg: '#0f172a',
          enable_publishing: false,
          hide_side_toolbar: false,
          allow_symbol_change: true,
          studies: [
            'MASimple@tv-basicstudies',
            'RSI@tv-basicstudies',
            'MACD@tv-basicstudies'
          ],
          disabled_features: ['header_saveload'],
          overrides: {
            "mainSeriesProperties.candleStyle.upColor": "#10b981",
            "mainSeriesProperties.candleStyle.downColor": "#ef4444",
            "mainSeriesProperties.candleStyle.borderUpColor": "#10b981",
            "mainSeriesProperties.candleStyle.borderDownColor": "#ef4444",
            "mainSeriesProperties.candleStyle.wickUpColor": "#10b981",
            "mainSeriesProperties.candleStyle.wickDownColor": "#ef4444",
            "paneProperties.background": "#0b1120",
            "paneProperties.vertGridProperties.color": "rgba(255,255,255,0.03)",
            "paneProperties.horzGridProperties.color": "rgba(255,255,255,0.03)",
          }
        });
      }
    };

    containerRef.current.appendChild(script);

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [currentSymbol, theme]);

  const quickSymbols = [
    { label: 'GOLD (XAU/USD)', value: 'OANDA:XAUUSD' },
    { label: 'EUR/USD', value: 'FX:EURUSD' },
    { label: 'ETH/USD', value: 'BINANCE:ETHUSDT' },
    { label: 'BTC/USD', value: 'BINANCE:BTCUSDT' },
  ];

  return (
    <div className={`flex flex-col bg-[#0b1120] border border-slate-800 rounded-xl overflow-hidden shadow-xl transition-all ${isFullscreen ? 'fixed inset-3 z-50 h-[calc(100vh-24px)]' : ''}`}>
      {/* Chart Top Navigation Bar */}
      <div className="bg-[#111827] px-3 py-2 border-b border-slate-800 flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-1 text-xs font-bold text-amber-400 mr-2 shrink-0">
            <BarChart2 size={15} />
            <span>TradingView Live</span>
          </div>

          {quickSymbols.map((item) => (
            <button
              key={item.value}
              onClick={() => setCurrentSymbol(item.value)}
              className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all shrink-0 cursor-pointer ${
                currentSymbol === item.value
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {allowFullscreen && (
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer shrink-0"
            title={isFullscreen ? 'ย่อหน้าต่าง' : 'ขยายเต็มจอ'}
          >
            {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
        )}
      </div>

      {/* Chart Container */}
      <div
        id={`tv-widget-${Math.random().toString(36).substring(2, 9)}`}
        ref={containerRef}
        style={{ height: isFullscreen ? '100%' : typeof height === 'number' ? `${height}px` : height }}
        className="w-full relative"
      />
    </div>
  );
}

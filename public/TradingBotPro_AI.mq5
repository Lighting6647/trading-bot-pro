//+------------------------------------------------------------------+
//|                                           TradingBotPro_AI.mq5   |
//|                             Copyright 2026, Trading Bot Pro Team |
//|                                https://trading-bot-pro-ivory.vercel.app |
//+------------------------------------------------------------------+
#property copyright "Trading Bot Pro - AI Auto Trader"
#property link      "https://trading-bot-pro-ivory.vercel.app/"
#property version   "2.00"
#property description "100% FREE AI Auto-Trading Robot for Exness MT5 Standard Cent (#160187619)"
#property description "Features: RSI + MACD + EMA AI Engine, Daily TP/SL, Dynamic Cent Lots, Market Close Protection"

#include <Trade\Trade.mqh>
#include <Trade\PositionInfo.mqh>
#include <Trade\AccountInfo.mqh>

//--- Input Parameters
input group "=== [ การตั้งค่าพอร์ต & บัญชี ] ==="
input ulong    InpAccountNumber     = 160187619;     // หมายเลขบัญชี Exness (0 = ใช้งานได้ทุกบัญชี)
input ulong    InpMagicNumber       = 888160;        // Magic Number สำหรับออเดอร์บอท

input group "=== [ การจัดการขนาดล็อต (Lot Management) ] ==="
input double   InpBaseLot           = 0.01;          // ขนาด Lot เริ่มต้น (สำหรับ Cent แนะนำ 0.01 - 0.05)
input double   InpMaxLot            = 0.50;          // ขนาด Lot สูงสุดที่อนุญาต
input bool     InpUseMoneyMgmt      = true;          // ปรับขนาด Lot อัตโนมัติตามเงินทุน

input group "=== [ การทำกำไร & จัดการความเสี่ยง (USC) ] ==="
input double   InpTakeProfitUSC     = 50.0;          // กำไรเป้าหมายต่อรอบ (USC)
input double   InpStopLossUSC       = 30.0;          // จุดตัดขาดทุนต่อรอบ (USC)
input double   InpDailyTargetProfit = 500.0;         // เป้ากำไรรายวัน (USC) -> ถึงเป้าแล้วหยุด
input double   InpDailyMaxLoss      = 300.0;         // ลิมิตขาดทุนรายวัน (USC) -> ถึงจุดแล้วหยุด

input group "=== [ ตัวกรองสัญญาณ AI Indicator ] ==="
input ENUM_TIMEFRAMES InpTimeframe  = PERIOD_M5;     // Timeframe สำหรับคำนวณสัญญาณ (แนะนำ M5)
input int      InpRsiPeriod         = 14;            // RSI Period
input double   InpRsiOversold       = 35.0;          // RSI Oversold (จังหวะเข้า BUY)
input double   InpRsiOverbought     = 65.0;          // RSI Overbought (จังหวะเข้า SELL)
input int      InpEmaFast           = 20;            // Fast EMA Period
input int      InpEmaSlow           = 50;            // Slow EMA Period

//--- Global Handles & Objects
CTrade         g_trade;
CPositionInfo  g_position;
CAccountInfo   g_account;

int            g_handle_rsi;
int            g_handle_macd;
int            g_handle_ema_fast;
int            g_handle_ema_slow;

double         g_start_day_balance  = 0.0;
datetime       g_last_trade_time    = 0;

//+------------------------------------------------------------------+
//| Expert initialization function                                   |
//+------------------------------------------------------------------+
int OnInit()
{
   // 1. ตรวจสอบหมายเลขบัญชี (ถ้าตั้งล็อกไว้)
   if(InpAccountNumber > 0 && AccountInfoInteger(ACCOUNT_LOGIN) != (long)InpAccountNumber)
   {
      PrintFormat("⚠️ แจ้งเตือน: บัญชีปัจจุบัน (#%I64d) ไม่ตรงกับที่กำหนด (#%I64d)", 
                  AccountInfoInteger(ACCOUNT_LOGIN), InpAccountNumber);
   }

   // 2. ตั้งค่า Trade Object
   g_trade.SetExpertMagicNumber(InpMagicNumber);
   g_trade.SetMarginMode();
   g_trade.SetTypeFillingBySymbol(_Symbol);

   // 3. สร้าง Indicator Handles
   g_handle_rsi = iRSI(_Symbol, InpTimeframe, InpRsiPeriod, PRICE_CLOSE);
   g_handle_macd = iMACD(_Symbol, InpTimeframe, 12, 26, 9, PRICE_CLOSE);
   g_handle_ema_fast = iMA(_Symbol, InpTimeframe, InpEmaFast, 0, MODE_EMA, PRICE_CLOSE);
   g_handle_ema_slow = iMA(_Symbol, InpTimeframe, InpEmaSlow, 0, MODE_EMA, PRICE_CLOSE);

   if(g_handle_rsi == INVALID_HANDLE || g_handle_macd == INVALID_HANDLE || 
      g_handle_ema_fast == INVALID_HANDLE || g_handle_ema_slow == INVALID_HANDLE)
   {
      Print("❌ เกิดข้อผิดพลาดในการโหลด Indicator Handles");
      return INIT_FAILED;
   }

   g_start_day_balance = AccountInfoDouble(ACCOUNT_BALANCE);

   PrintFormat("✅ Trading Bot Pro AI เริ่มทำงานสำเร็จบน %s | บาลานซ์: %.2f %s", 
               _Symbol, g_start_day_balance, AccountInfoString(ACCOUNT_CURRENCY));

   // แสดง Dashboard บนหน้าจอ MT5
   UpdateChartComment("บอท AI พร้อมทำงาน (STANDBY)");

   return(INIT_SUCCEEDED);
}

//+------------------------------------------------------------------+
//| Expert deinitialization function                                 |
//+------------------------------------------------------------------+
void OnDeinit(const int reason)
{
   IndicatorRelease(g_handle_rsi);
   IndicatorRelease(g_handle_macd);
   IndicatorRelease(g_handle_ema_fast);
   IndicatorRelease(g_handle_ema_slow);
   Comment("");
}

//+------------------------------------------------------------------+
//| Expert tick function                                             |
//+------------------------------------------------------------------+
void OnTick()
{
   // 1. ตรวจสอบการเปิดตลาด (ป้องกันเทรดช่วงตลาดปิดเสาร์-อาทิตย์)
   MqlDateTime dt;
   TimeCurrent(dt);
   if(dt.day_of_week == 6 || (dt.day_of_week == 0 && dt.hour < 23))
   {
      UpdateChartComment("🛑 ตลาดปิดทำการ (สุดสัปดาห์)");
      return;
   }

   // 2. ตรวจสอบเป้ากำไร/ขาดทุนรายวัน (Daily TP / SL Protection)
   double curBalance = AccountInfoDouble(ACCOUNT_BALANCE);
   double curEquity  = AccountInfoDouble(ACCOUNT_EQUITY);
   double dailyProfit = curEquity - g_start_day_balance;

   if(dailyProfit >= InpDailyTargetProfit)
   {
      UpdateChartComment(StringFormat("🎯 บรรลุเป้าหมายกำไรรายวัน (+%.2f USC) -> หยุดพักอัตโนมัติ", dailyProfit));
      return;
   }
   if(dailyProfit <= -InpDailyMaxLoss)
   {
      UpdateChartComment(StringFormat("🛑 ถึงจุดตัดขาดทุนรายวัน (-%.2f USC) -> หยุดพักอัตโนมัติ", MathAbs(dailyProfit)));
      return;
   }

   // 3. ตรวจสอบว่ามีออเดอร์ของบอทค้างอยู่หรือไม่
   int myPositions = 0;
   double totalFloatingProfit = 0.0;

   for(int i = PositionsTotal() - 1; i >= 0; i--)
   {
      if(g_position.SelectByIndex(i))
      {
         if(g_position.Symbol() == _Symbol && g_position.Magic() == InpMagicNumber)
         {
            myPositions++;
            totalFloatingProfit += g_position.Profit();

            // ตรวจสอบ TP / SL ของออเดอร์
            if(g_position.Profit() >= InpTakeProfitUSC)
            {
               g_trade.PositionClose(g_position.Ticket());
               PrintFormat("🎉 ปิดทำกำไรออเดอร์ #%I64d: +%.2f USC", g_position.Ticket(), g_position.Profit());
               return;
            }
            if(g_position.Profit() <= -InpStopLossUSC)
            {
               g_trade.PositionClose(g_position.Ticket());
               PrintFormat("⚠️ ตัดขาดทุนออเดอร์ #%I64d: %.2f USC", g_position.Ticket(), g_position.Profit());
               return;
            }
         }
      }
   }

   // ถ้ามีออเดอร์เปิดอยู่แล้ว ให้รอจนกว่าจะปิดก่อนเปิดไม้ใหม่
   if(myPositions > 0)
   {
      UpdateChartComment(StringFormat("กำลังถือออเดอร์ (%d ไม้) | กำไรลอยตัว: %.2f USC", myPositions, totalFloatingProfit));
      return;
   }

   // 4. รอแท่งเทียนใหม่ (1 แท่งเทียนต่อ 1 การตัดสินใจ ป้องกันเบิ้ลออเดอร์)
   datetime barTime = iTime(_Symbol, InpTimeframe, 0);
   if(barTime == g_last_trade_time) return;

   // 5. อ่านค่า Indicators
   double rsi[], macd_main[], macd_signal[], ema_fast[], ema_slow[];
   ArraySetAsSeries(rsi, true);
   ArraySetAsSeries(macd_main, true);
   ArraySetAsSeries(macd_signal, true);
   ArraySetAsSeries(ema_fast, true);
   ArraySetAsSeries(ema_slow, true);

   if(CopyBuffer(g_handle_rsi, 0, 1, 2, rsi) < 2 ||
      CopyBuffer(g_handle_macd, 0, 1, 2, macd_main) < 2 ||
      CopyBuffer(g_handle_macd, 1, 1, 2, macd_signal) < 2 ||
      CopyBuffer(g_handle_ema_fast, 0, 1, 2, ema_fast) < 2 ||
      CopyBuffer(g_handle_ema_slow, 0, 1, 2, ema_slow) < 2)
   {
      return;
   }

   // 6. ประมวลผลสัญญาณ AI (Bullish / Bearish Score)
   bool buySignal  = (rsi[0] <= InpRsiOversold || (rsi[0] > 45 && rsi[0] < 60)) &&
                     (macd_main[0] > macd_signal[0] && macd_main[1] <= macd_signal[1]) &&
                     (ema_fast[0] > ema_slow[0]);

   bool sellSignal = (rsi[0] >= InpOverbought || (rsi[0] < 55 && rsi[0] > 40)) &&
                     (macd_main[0] < macd_signal[0] && macd_main[1] >= macd_signal[1]) &&
                     (ema_fast[0] < ema_slow[0]);

   // คำนวณ Lot Size
   double lot = InpBaseLot;
   if(InpUseMoneyMgmt)
   {
      lot = MathMin(InpMaxLot, MathMax(InpBaseLot, NormalizeDouble((curBalance / 1000.0) * InpBaseLot, 2)));
   }

   // 7. ส่งคำสั่งซื้อขายจริงเข้าพอร์ต Exness MT5
   if(buySignal)
   {
      double ask = SymbolInfoDouble(_Symbol, SYMBOL_ASK);
      if(g_trade.Buy(lot, _Symbol, ask, 0, 0, "TradingBotPro-AI-Buy"))
      {
         g_last_trade_time = barTime;
         PrintFormat("🚀 เปิดออเดอร์ BUY %.2f Lot @ %.5f [RSI: %.1f]", lot, ask, rsi[0]);
      }
   }
   else if(sellSignal)
   {
      double bid = SymbolInfoDouble(_Symbol, SYMBOL_BID);
      if(g_trade.Sell(lot, _Symbol, bid, 0, 0, "TradingBotPro-AI-Sell"))
      {
         g_last_trade_time = barTime;
         PrintFormat("🚀 เปิดออเดอร์ SELL %.2f Lot @ %.5f [RSI: %.1f]", lot, bid, rsi[0]);
      }
   }

   UpdateChartComment(StringFormat("บอท AI กำลังสแกนตลาด... | RSI: %.1f | Balance: %.2f USC", rsi[0], curBalance));
}

//+------------------------------------------------------------------+
//| ฟังก์ชันแสดงสถานะบนหน้าจอกราฟ MT5                                |
//+------------------------------------------------------------------+
void UpdateChartComment(string status)
{
   string text = "\n" +
      "=========================================\n" +
      "  🤖 TRADING BOT PRO - AI AUTO TRADER (MT5)\n" +
      "  🌐 Web: https://trading-bot-pro-ivory.vercel.app/\n" +
      "=========================================\n" +
      StringFormat(" • บัญชี: #%I64d (%s)\n", AccountInfoInteger(ACCOUNT_LOGIN), AccountInfoString(ACCOUNT_COMPANY)) +
      StringFormat(" • บาลานซ์: %.2f %s | อิควิตี้: %.2f %s\n", AccountInfoDouble(ACCOUNT_BALANCE), AccountInfoString(ACCOUNT_CURRENCY), AccountInfoDouble(ACCOUNT_EQUITY), AccountInfoString(ACCOUNT_CURRENCY)) +
      StringFormat(" • สัญลักษณ์: %s | Timeframe: %s\n", _Symbol, EnumToString(InpTimeframe)) +
      StringFormat(" • สถานะบอท: %s\n", status) +
      "=========================================\n";

   Comment(text);
}

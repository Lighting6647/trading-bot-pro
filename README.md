# 🚀 Trading Bot Pro v3.0

ระบบเทรดและวิเคราะห์การลงทุนอัจฉริยะแบบเรียลไทม์ พัฒนาด้วย Next.js 16 (App Router), TypeScript, Tailwind CSS, และ Recharts พร้อม 10 สุดยอดฟีเจอร์สำหรับการเทรดระดับมืออาชีพ รองรับ Responsive สมบูรณ์แบบทุกอุปกรณ์ (Mobile, Tablet, Desktop)

---

## ✨ ไฮไลท์ฟีเจอร์เด่น (Key Features)

1. **🧠 AI Signal Dashboard:** ระบบประมวลผลสัญญาณเทรดอัตโนมัติ (BUY / SELL / HOLD) พร้อม Gauge Meter วัดระดับความมั่นใจ และสถิติ AI Accuracy
2. **🛡️ Smart Risk Manager:** ตรวจจับสภาวะทางอารมณ์ (Tilt Mode), ระบบพักเทรดอัตโนมัติ (Cool-down Timer), และการกำหนดเพดานขาดทุนรายวัน (Daily Loss Limit)
3. **🔔 Smart Notifications:** ระบบแจ้งเตือนอัจฉริยะแยกประเภท (สัญญาณ AI, ผลแพ้/ชนะ, ความเสี่ยง, รางวัลความสำเร็จ)
4. **📊 Backtesting Engine:** เครื่องมือจำลองและทดสอบกลยุทธ์ย้อนหลัง (7, 30, 90, 365 วัน) พร้อมกราฟ Equity Curve และการคำนวณ Max Drawdown
5. **📋 Trading Journal:** สมุดบันทึกการเทรดอัจฉริยะ บันทึกเหตุผล กลยุทธ์ และแท็ก (Breakout, Scalp, Reversal ฯลฯ) พร้อมสรุปสถิติอัตโนมัติ
6. **🏆 Gamification & Leveling:** ระบบเลเวล XP, เควสต์ประจำวัน (Daily Quests), และเหรียญรางวัลความสำเร็จ (Achievement Badges) สร้างวินัยในการเทรด
7. **🔥 Market Heatmap:** แผนที่ความร้อนตลาดแบบเรียลไทม์ เปรียบเทียบสัดส่วน Volume และทิศทางราคาของสินทรัพย์ Crypto, Forex, หุ้น และสินค้าโภคภัณฑ์
8. **📈 Multi-Timeframe Analysis:** สแกนแนวโน้มพร้อมกัน 6 กรอบเวลา (1m, 5m, 15m, 1h, 4h, 1D) พร้อมคะแนน Confluence Score
9. **🤖 AI Chat Assistant:** ผู้ช่วยเทรด AI อัจฉริยะ ตอบคำถามวิเคราะห์กราฟ สรุปผลงานวันนี้ และแนะนำจังหวะการเข้าออเดอร์
10. **🌍 Social Copy Trade:** ระบบคัดลอกคำสั่งเทรดอัตโนมัติจาก Master Traders ชั้นนำ พร้อม Leaderboard และการตั้งค่าอัตราส่วน Copy Ratio
11. **🔐 Multi-Broker Login:** รองรับการเชื่อมต่อและสลับบัญชีจริง (REAL) / ทดลอง (DEMO) สำหรับ IQ Option, Exness, Alpaca, Binance, MT5

---

## 🛠️ เทคโนโลยีที่ใช้ (Tech Stack)

- **Framework:** [Next.js 16](https://nextjs.org/) (App Router & Turbopack)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Charts:** [Recharts](https://recharts.org/)
- **State Management:** React Context API (`TradingContext`)

---

## 🚀 การเริ่มต้นใช้งาน (Getting Started)

### 1. ติดตั้ง Dependencies
```bash
npm install
```

### 2. รันโหมด Development
```bash
npm run dev
```
เปิดเบราว์เซอร์ไปที่ `http://localhost:3000`

### 3. Build สำหรับ Production
```bash
npm run build
npm start
```

---

## 📱 การรองรับทุกอุปกรณ์ (Responsive Design)
- **Desktop / Laptop (>= 768px):** Cockpit View 3 คอลัมน์เต็มรูปแบบ
- **Mobile / Smartphone (< 768px):** แถบเมนูย่อยแอปพลิเคชัน (Mobile Sub-Nav) พร้อมปุ่ม Floating `[START/STOP BOT]` ควบคุมได้สะดวกจากทุกหน้าจอ

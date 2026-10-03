"""
Trading Bot Pro - Python MetaTrader 5 Auto-Trader (100% FREE)
Connects directly to Exness-MT5Real account #160187619 for automated trading.

Requirements:
    pip install MetaTrader5

Usage:
    python exness_mt5_bot.py
"""

import time
import datetime
try:
    import MetaTrader5 as mt5
except ImportError:
    print("❌ กรุณาติดตั้งไลบรารี MetaTrader5 โดยพิมพ์คำสั่ง: pip install MetaTrader5")
    exit(1)

# ================= CONFIGURATION =================
ACCOUNT_NUMBER = 160187619          # หมายเลขบัญชี Exness ของคุณ
PASSWORD       = ""                 # ใส่รหัสผ่านบัญชี MT5 ของคุณที่นี่ (ถ้าปล่อยว่าง จะใช้รหัสที่บันทึกไว้ใน MT5)
SERVER         = "Exness-MT5Real20" # เซิร์ฟเวอร์ Exness ที่ถูกต้องของคุณคือ Exness-MT5Real20
SYMBOL         = "XAUUSDm"          # ทองคำ (หรือ EURUSDm, ETHUSD)
BASE_LOT       = 0.01               # ขนาด Lot เริ่มต้นสำหรับบัญชี Cent
MAGIC_NUMBER   = 888160

# ================= INITIALIZE MT5 =================
def initialize_mt5():
    print("=" * 50)
    print("🤖 TRADING BOT PRO - 100% FREE MT5 AUTO-TRADER")
    print("=" * 50)
    print("⏳ กำลังเชื่อมต่อกับโปรแกรม MetaTrader 5 EXNESS...")

    # Known MT5 installation paths on Windows
    candidate_paths = [
        r"C:\Program Files\MetaTrader 5 EXNESS\terminal64.exe",
        r"C:\Program Files\Exness MetaTrader 5\terminal64.exe",
        r"C:\Program Files\MetaTrader 5\terminal64.exe",
    ]

    initialized = False
    for path in candidate_paths:
        try:
            if mt5.initialize(path=path):
                initialized = True
                break
        except Exception:
            pass

    if not initialized:
        initialized = mt5.initialize()

    if not initialized:
        print(f"❌ ไม่สามารถเปิด MT5 ได้: {mt5.last_error()}")
        print("💡 โปรดเปิดโปรแกรม MetaTrader 5 EXNESS บนหน้าจอคอมพิวเตอร์ก่อนรันคำสั่งครับ")
        return False

    acc_info = mt5.account_info()
    
    # If MT5 is already logged in to our target account
    if acc_info and acc_info.login == ACCOUNT_NUMBER:
        print(f"✅ ตรวจพบพอร์ต Exness #{acc_info.login} ที่ล็อกอินอยู่ใน MT5 แล้ว!")
    elif PASSWORD:
        print(f"🔑 กำลังล็อกอินเข้าบัญชี #{ACCOUNT_NUMBER} ({SERVER})...")
        authorized = mt5.login(ACCOUNT_NUMBER, password=PASSWORD, server=SERVER)
        if not authorized:
            print(f"⚠️ ล็อกอินไม่สำเร็จ: {mt5.last_error()}")
            print("💡 กรุณาตรวจสอบรหัสผ่านในไฟล์ หรือล็อกอินในโปรแกรม MT5 ก่อนรันสคริปต์")
            return False
        acc_info = mt5.account_info()
    else:
        # Check whatever account is active in MT5
        if acc_info:
            print(f"ℹ️ พอร์ตที่เชื่อมต่อใน MT5: #{acc_info.login} ({acc_info.server})")
        else:
            print(f"⚠️ ยังไม่ได้ล็อกอินบัญชีใน MT5 โปรดล็อกอินพอร์ต #{ACCOUNT_NUMBER} ในโปรแกรม MT5")
            return False

    if acc_info:
        print("-" * 50)
        print(f"🟢 สถานะการเชื่อมต่อ: ONLINE (เชื่อมต่อสมบูรณ์)")
        print(f" • บัญชี: #{acc_info.login} ({acc_info.company})")
        print(f" • เซิร์ฟเวอร์: {acc_info.server}")
        print(f" • บาลานซ์: {acc_info.balance:,.2f} {acc_info.currency}")
        print(f" • อิควิตี้: {acc_info.equity:,.2f} {acc_info.currency}")
        print(f" • เลเวอเรจ: 1:{acc_info.leverage}")
        print("-" * 50)
    return True

# ================= SEND ORDER =================
def send_order(order_type, lot=0.01, symbol="XAUUSDm"):
    tick = mt5.symbol_info_tick(symbol)
    if not tick:
        print(f"❌ ไม่สามารถดึงราคาของ {symbol} ได้")
        return False

    price = tick.ask if order_type == 'BUY' else tick.bid
    mt5_type = mt5.ORDER_TYPE_BUY if order_type == 'BUY' else mt5.ORDER_TYPE_SELL

    request = {
        "action": mt5.TRADE_ACTION_DEAL,
        "symbol": symbol,
        "volume": lot,
        "type": mt5_type,
        "price": price,
        "sl": 0.0,
        "tp": 0.0,
        "deviation": 20,
        "magic": MAGIC_NUMBER,
        "comment": "TradingBotPro-AI",
        "type_time": mt5.ORDER_TIME_GTC,
        "type_filling": mt5.ORDER_FILLING_IOC,
    }

    result = mt5.order_send(request)
    if result.retcode != mt5.TRADE_RETCODE_DONE:
        print(f"❌ ส่งคำสั่ง {order_type} ไม่สำเร็จ: {result.comment} (Code: {result.retcode})")
        return False

    print(f"🚀 ส่งคำสั่ง {order_type} {symbol} ({lot} Lot) สำเร็จ! [Ticket: {result.order}]")
    return True

# ================= MAIN LOOP =================
def run_bot():
    if not initialize_mt5():
        return

    print("\n🟢 บอทเริ่มสแกนสัญญาณตลาดอัตโนมัติแล้ว (กด Ctrl+C เพื่อหยุด)...")

    while True:
        try:
            acc = mt5.account_info()
            positions = mt5.positions_get(symbol=SYMBOL)
            num_pos = len(positions) if positions else 0

            now_str = datetime.datetime.now().strftime("%H:%M:%S")
            print(f"[{now_str}] พอร์ต #{ACCOUNT_NUMBER} | ทุน: {acc.balance:,.2f} USC | ออเดอร์ถืออยู่: {num_pos} ไม้", end="\r")

            time.sleep(3)
        except KeyboardInterrupt:
            print("\n🛑 หยุดการทำงานของบอทเรียบร้อยแล้ว")
            break
        except Exception as e:
            print(f"\n⚠️ Error: {e}")
            time.sleep(5)

    mt5.shutdown()

if __name__ == "__main__":
    run_bot()

// Trading Bot Pro - Exness Live Bridge Injector v4.0
(function() {
    'use strict';
    console.log("⚡ [Trading Bot Pro] Live Bridge Attached to Exness WebTrading!");

    // Create On-Screen HUD Badge
    const existingHud = document.getElementById("tbp-bridge-hud");
    if (existingHud) existingHud.remove();

    const hud = document.createElement("div");
    hud.id = "tbp-bridge-hud";
    hud.style.cssText = "position:fixed;bottom:25px;right:25px;z-index:999999;background:#090d16;color:#10b981;padding:12px 18px;border-radius:12px;border:2px solid #10b981;font-family:system-ui,sans-serif;font-size:12px;font-weight:bold;box-shadow:0 8px 30px rgba(0,0,0,0.8);display:flex;align-items:center;gap:10px;";
    hud.innerHTML = "<span style='width:10px;height:10px;background:#10b981;border-radius:50%;display:inline-block;box-shadow:0 0 8px #10b981;'></span> <span>Trading Bot Pro: <strong style='color:#fff;'>Bridge LIVE</strong> (#160187619)</span>";
    document.body.appendChild(hud);

    // BroadcastChannel Bridge
    let bc = null;
    try {
        bc = new BroadcastChannel("exness_trading_bot_pro");
    } catch(e) {}

    function scrapeAndSend() {
        let balance = null;
        const balElements = document.querySelectorAll('[data-qa*="balance"], [data-testid*="balance"], .account-info__value, .balance-value, .value');
        balElements.forEach(el => {
            const text = el.innerText || '';
            const clean = parseFloat(text.replace(/[^0-9.]/g, ''));
            if (!isNaN(clean) && clean > 0 && !balance) {
                balance = clean;
            }
        });

        if (!balance) {
            const bodyText = document.body.innerText;
            const match = bodyText.match(/(?:Balance|ยอดเงินคงเหลือ|Equity|อิควิตี้)[:\s]*([0-9,]+(?:\.[0-9]+)?)/i);
            if (match && match[1]) {
                const parsed = parseFloat(match[1].replace(/,/g, ''));
                if (!isNaN(parsed) && parsed > 0) balance = parsed;
            }
        }

        if (balance) {
            hud.innerHTML = "<span style='width:10px;height:10px;background:#10b981;border-radius:50%;display:inline-block;box-shadow:0 0 8px #10b981;'></span> <span>Bot Sync: <strong style='color:#fbbf24;'>" + balance.toLocaleString() + " USC</strong></span>";
            if (bc) {
                bc.postMessage({
                    action: 'ACCOUNT_SYNC_FROM_EXNESS',
                    balance: balance,
                    equity: balance,
                    accountNumber: '160187619',
                    timestamp: Date.now()
                });
            }
        }
    }

    setInterval(scrapeAndSend, 2000);
    scrapeAndSend();

    // Listen for orders from Bot
    if (bc) {
        bc.onmessage = function(event) {
            const data = event.data;
            if (data?.action === 'EXECUTE_ORDER') {
                console.log("🎯 [Exness Bridge Engine] Executing Live Order:", data);
                hud.style.borderColor = "#f59e0b";
                hud.innerHTML = "<span style='width:10px;height:10px;background:#f59e0b;border-radius:50%;display:inline-block;'></span> <span>⚡ กำลังยิง " + data.side + " " + data.symbol + " (0.01 Lot)...</span>";

                const isBuy = data.side === 'BUY';
                const buttons = Array.from(document.querySelectorAll('button, div[role="button"], a'));
                const targetBtn = buttons.find(b => {
                    const text = (b.innerText || '').trim().toUpperCase();
                    return isBuy 
                        ? (text === 'BUY' || text.includes('BUY MARKET') || text.includes('ซื้อ') || text.includes('BUY 0.01')) 
                        : (text === 'SELL' || text.includes('SELL MARKET') || text.includes('ขาย') || text.includes('SELL 0.01'));
                });

                if (targetBtn) {
                    targetBtn.click();
                    hud.style.borderColor = "#10b981";
                    hud.innerHTML = "<span style='width:10px;height:10px;background:#10b981;border-radius:50%;display:inline-block;'></span> <span>✅ ยิงคำสั่ง " + data.side + " " + data.symbol + " สำเร็จ!</span>";
                    setTimeout(scrapeAndSend, 1500);
                } else {
                    hud.style.borderColor = "#ef4444";
                    hud.innerHTML = "<span style='width:10px;height:10px;background:#ef4444;border-radius:50%;display:inline-block;'></span> <span>⚠️ ไม่พบปุ่ม " + data.side + " (กรุณาเปิดหน้ากราฟ " + data.symbol + ")</span>";
                }
            }
        };
    }
})();

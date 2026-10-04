// Trading Bot Pro - Exness Live Sync Extension Content Script
(function() {
  'use strict';

  console.log("⚡ [Trading Bot Pro] Exness Extension Active on:", window.location.href);

  // HUD Indicator on Exness page
  let hud = document.getElementById("tbp-extension-hud");
  if (!hud) {
    hud = document.createElement("div");
    hud.id = "tbp-extension-hud";
    hud.style.cssText = "position:fixed;bottom:20px;right:20px;z-index:999999;background:#0d1527;color:#10b981;padding:10px 16px;border-radius:10px;border:1.5px solid #10b981;font-family:sans-serif;font-size:12px;font-weight:bold;box-shadow:0 8px 24px rgba(0,0,0,0.7);display:flex;align-items:center;gap:8px;";
    hud.innerHTML = "<span style='width:9px;height:9px;background:#10b981;border-radius:50%;display:inline-block;box-shadow:0 0 8px #10b981;'></span> <span>Trading Bot Pro: <span id='tbp-status-text'>เชื่อมต่อสด 🟢</span></span>";
    document.body.appendChild(hud);
  }

  let bc = null;
  try {
    bc = new BroadcastChannel("exness_trading_bot_pro");
  } catch (e) {
    console.error("BroadcastChannel error:", e);
  }

  function scrapeAccountData() {
    let balance = null;
    let equity = null;
    let accountNumber = '160187619';

    // 1. Selector search
    const targets = document.querySelectorAll('[data-qa*="balance"], [data-testid*="balance"], .balance, .equity, [class*="balance"], [class*="equity"]');
    targets.forEach(el => {
      const txt = (el.innerText || '').replace(/,/g, '');
      const num = parseFloat(txt.replace(/[^0-9.]/g, ''));
      if (!isNaN(num) && num > 0 && !balance) {
        balance = num;
      }
    });

    // 2. Full text regex fallback
    if (!balance) {
      const bodyText = document.body.innerText;
      const match = bodyText.match(/(?:Balance|ยอดคงเหลือ|Equity|อิควิตี้)[:\s]*([0-9,]+(?:\.[0-9]+)?)/i);
      if (match && match[1]) {
        const val = parseFloat(match[1].replace(/,/g, ''));
        if (!isNaN(val) && val > 0) balance = val;
      }
    }

    // Account number regex
    const accMatch = document.body.innerText.match(/#?([0-9]{7,10})/);
    if (accMatch && accMatch[1]) {
      accountNumber = accMatch[1];
    }

    if (balance) {
      const statusText = document.getElementById('tbp-status-text');
      if (statusText) statusText.innerText = "ซิงค์แล้ว: " + balance.toLocaleString() + " USC 🟢";

      const payload = {
        action: 'ACCOUNT_SYNC_FROM_EXNESS',
        balance: balance,
        equity: equity || balance,
        accountNumber: accountNumber,
        source: 'my.exness.com/webtrading',
        timestamp: Date.now()
      };

      if (bc) bc.postMessage(payload);
      if (window.opener && !window.opener.closed) {
        try { window.opener.postMessage(payload, '*'); } catch (err) {}
      }
    }
  }

  // Periodic scrape every 2 seconds
  setInterval(scrapeAccountData, 2000);
  setTimeout(scrapeAccountData, 1000);

  if (bc) {
    bc.onmessage = function(event) {
      const data = event.data;
      if (data?.action === 'REQUEST_ACCOUNT_SYNC') {
        scrapeAccountData();
      }
    };
  }
})();

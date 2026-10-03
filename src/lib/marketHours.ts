export type MarketSessionName = 'SYDNEY' | 'TOKYO' | 'LONDON' | 'NEW_YORK';

export type MarketStatus = {
  isOpen: boolean;
  statusText: string;
  statusBadge: 'OPEN' | 'CLOSED_WEEKEND' | 'CLOSED_DAILY_BREAK' | 'CLOSING_SOON';
  asset: string;
  currentSessions: MarketSessionName[];
  serverTimeUtc: string;
  localTimeTh: string;
  nyTime: string;
  londonTime: string;
  tokyoTime: string;
  nextEvent: string;
  timeUntilNextEvent: string;
};

/**
 * Calculates real-time market status and timezone clocks for global markets
 */
export function getMarketStatus(asset: string = 'GOLD (XAU/USD)', now: Date = new Date()): MarketStatus {
  // Convert current time to UTC metrics
  const utcDay = now.getUTCDay(); // 0 = Sunday, 1 = Monday, ..., 5 = Friday, 6 = Saturday
  const utcHour = now.getUTCHours();
  const utcMinute = now.getUTCMinutes();
  const utcTotalMinutes = utcHour * 60 + utcMinute;

  // Clocks
  const serverTimeUtc = now.toLocaleTimeString('en-US', { timeZone: 'UTC', hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const localTimeTh = now.toLocaleTimeString('th-TH', { timeZone: 'Asia/Bangkok', hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const nyTime = now.toLocaleTimeString('en-US', { timeZone: 'America/New_York', hour12: false, hour: '2-digit', minute: '2-digit' });
  const londonTime = now.toLocaleTimeString('en-US', { timeZone: 'Europe/London', hour12: false, hour: '2-digit', minute: '2-digit' });
  const tokyoTime = now.toLocaleTimeString('en-US', { timeZone: 'Asia/Tokyo', hour12: false, hour: '2-digit', minute: '2-digit' });

  // Determine Active Major Trading Sessions (in UTC)
  const currentSessions: MarketSessionName[] = [];
  // Sydney: 21:00 UTC - 06:00 UTC
  if (utcHour >= 21 || utcHour < 6) currentSessions.push('SYDNEY');
  // Tokyo: 00:00 UTC - 09:00 UTC
  if (utcHour >= 0 && utcHour < 9) currentSessions.push('TOKYO');
  // London: 07:00 UTC - 16:00 UTC
  if (utcHour >= 7 && utcHour < 16) currentSessions.push('LONDON');
  // New York: 12:00 UTC - 21:00 UTC
  if (utcHour >= 12 && utcHour < 21) currentSessions.push('NEW_YORK');

  const isCrypto = asset.toUpperCase().includes('BTC') || 
                   asset.toUpperCase().includes('ETH') || 
                   asset.toUpperCase().includes('CRYPTO');

  const isGoldOrMetal = asset.toUpperCase().includes('GOLD') || 
                        asset.toUpperCase().includes('XAU') || 
                        asset.toUpperCase().includes('SILVER') || 
                        asset.toUpperCase().includes('XAG');

  // 1. Crypto is 24/7
  if (isCrypto) {
    return {
      isOpen: true,
      statusText: 'ตลาด Crypto เปิดทำการ 24 ชั่วโมง 7 วัน',
      statusBadge: 'OPEN',
      asset,
      currentSessions,
      serverTimeUtc,
      localTimeTh,
      nyTime,
      londonTime,
      tokyoTime,
      nextEvent: 'เปิดตลอด 24/7',
      timeUntilNextEvent: 'เปิดทำการตลอดเวลา',
    };
  }

  // 2. Weekend Closure check for Forex & Gold
  // Forex/Gold closes Friday 21:00 UTC (Saturday 04:00 Thai Time)
  // Opens Sunday 21:00 UTC (Forex) / 22:05 UTC (Gold) (Monday ~04:00 - 05:00 Thai Time)
  let isWeekend = false;
  if (utcDay === 6) {
    // Saturday: All day closed
    isWeekend = true;
  } else if (utcDay === 5 && utcTotalMinutes >= 21 * 60) {
    // Friday after 21:00 UTC: Closed
    isWeekend = true;
  } else if (utcDay === 0) {
    // Sunday before market open
    const openMinuteUtc = isGoldOrMetal ? (22 * 60 + 5) : (21 * 60);
    if (utcTotalMinutes < openMinuteUtc) {
      isWeekend = true;
    }
  }

  if (isWeekend) {
    // Calculate hours until Monday market open (Sunday 21:00 UTC / 04:00 Thai Time Monday)
    let minutesUntilOpen = 0;
    if (utcDay === 5) { // Friday post 21:00
      minutesUntilOpen = (24 * 60 - utcTotalMinutes) + (24 * 60) + (21 * 60);
    } else if (utcDay === 6) { // Saturday
      minutesUntilOpen = (24 * 60 - utcTotalMinutes) + (21 * 60);
    } else if (utcDay === 0) { // Sunday
      const targetMin = isGoldOrMetal ? (22 * 60 + 5) : (21 * 60);
      minutesUntilOpen = Math.max(0, targetMin - utcTotalMinutes);
    }
    const hoursRemaining = Math.floor(minutesUntilOpen / 60);
    const minsRemaining = minutesUntilOpen % 60;

    return {
      isOpen: false,
      statusText: '🛑 ตลาดปิดช่วงวันหยุดสุดสัปดาห์ (Weekend Closed)',
      statusBadge: 'CLOSED_WEEKEND',
      asset,
      currentSessions,
      serverTimeUtc,
      localTimeTh,
      nyTime,
      londonTime,
      tokyoTime,
      nextEvent: `ตลาดเปิดวันจันทร์ 04:00 น. (เวลาไทย)`,
      timeUntilNextEvent: `${hoursRemaining} ชม. ${minsRemaining} นาที`,
    };
  }

  // 3. Daily Rollover Break for Gold & Metals (Mon-Thu 21:00 - 22:05 UTC / 04:00 - 05:05 Thai Time)
  if (isGoldOrMetal && (utcDay >= 1 && utcDay <= 4)) {
    if (utcTotalMinutes >= 21 * 60 && utcTotalMinutes < (22 * 60 + 5)) {
      const minsUntilOpen = (22 * 60 + 5) - utcTotalMinutes;
      return {
        isOpen: false,
        statusText: '⏸️ ตลาดทองคำพักช่วง Daily Rollover / Break ประจำวัน',
        statusBadge: 'CLOSED_DAILY_BREAK',
        asset,
        currentSessions,
        serverTimeUtc,
        localTimeTh,
        nyTime,
        londonTime,
        tokyoTime,
        nextEvent: 'ตลาดเปิดต่อเวลา 05:05 น. (เวลาไทย)',
        timeUntilNextEvent: `${minsUntilOpen} นาที`,
      };
    }
  }

  // 4. Market is OPEN
  return {
    isOpen: true,
    statusText: '🟢 ตลาดเปิดทำการปกติ (Market OPEN)',
    statusBadge: 'OPEN',
    asset,
    currentSessions,
    serverTimeUtc,
    localTimeTh,
    nyTime,
    londonTime,
    tokyoTime,
    nextEvent: isGoldOrMetal ? 'พักตลาดประจำวัน 04:00 น.' : 'ปิดสุดสัปดาห์ เสาร์ 04:00 น.',
    timeUntilNextEvent: 'ตลาดกำลังเปิดซื้อขาย',
  };
}

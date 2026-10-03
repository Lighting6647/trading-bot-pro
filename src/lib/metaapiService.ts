/**
 * MetaApi Cloud Service (MT5 Cloud REST Bridge)
 * Provides direct, 24/7 cloud connectivity to Exness-MT5Real accounts without needing a local MT5 terminal.
 */

const PROVISIONING_BASE_URL = 'https://mt-provisioning-api-v1.agiliumtrade.agiliumtrade.ai';
const CLIENT_BASE_URL = 'https://mt-client-api-v1.agiliumtrade.agiliumtrade.ai';

export type MetaApiAccountInfo = {
  platform: string;
  broker: string;
  currency: string;
  server: string;
  balance: number;
  equity: number;
  margin: number;
  freeMargin: number;
  leverage: number;
  marginLevel: number;
  name?: string;
  login?: number | string;
};

export type MetaApiPosition = {
  id: string;
  symbol: string;
  type: 'POSITION_TYPE_BUY' | 'POSITION_TYPE_SELL';
  volume: number;
  openPrice: number;
  currentPrice: number;
  profit: number;
  gain: number;
  time: string;
  comment?: string;
};

export class MetaApiService {
  private token: string;

  constructor(token: string) {
    this.token = token.trim();
  }

  private getHeaders() {
    return {
      'auth-token': this.token,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
  }

  /**
   * List all accounts under the user's MetaApi token
   */
  async getAccounts(): Promise<any[]> {
    const res = await fetch(`${PROVISIONING_BASE_URL}/users/current/accounts`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `MetaApi Error ${res.status}: Failed to get accounts`);
    }

    return await res.json();
  }

  /**
   * Get real-time account information (Balance, Equity, Free Margin)
   */
  async getAccountInformation(accountId: string): Promise<MetaApiAccountInfo> {
    const res = await fetch(`${CLIENT_BASE_URL}/users/current/accounts/${accountId}/account-information`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `MetaApi Error ${res.status}: Failed to fetch account info`);
    }

    return await res.json();
  }

  /**
   * Get open positions (Live trades running on Exness MT5)
   */
  async getOpenPositions(accountId: string): Promise<MetaApiPosition[]> {
    const res = await fetch(`${CLIENT_BASE_URL}/users/current/accounts/${accountId}/positions`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `MetaApi Error ${res.status}: Failed to fetch open positions`);
    }

    return await res.json();
  }

  /**
   * Execute Market Order (BUY / SELL) into Exness MT5
   */
  async executeMarketOrder(
    accountId: string,
    params: {
      symbol: string;
      side: 'BUY' | 'SELL';
      volume: number;
      stopLoss?: number;
      takeProfit?: number;
      comment?: string;
    }
  ) {
    const actionType = params.side === 'BUY' ? 'ORDER_TYPE_BUY' : 'ORDER_TYPE_SELL';
    
    // Auto-correct suffix for Exness Standard/Cent symbols
    let cleanSymbol = params.symbol.replace(/[\/\s()]/g, '');
    if (!cleanSymbol.endsWith('m') && !cleanSymbol.endsWith('c') && cleanSymbol !== 'BTCUSD' && cleanSymbol !== 'ETHUSD') {
      cleanSymbol = `${cleanSymbol}m`;
    }

    const payload: any = {
      actionType,
      symbol: cleanSymbol,
      volume: params.volume || 0.01,
      comment: params.comment || 'TradingBotPro-AI',
    };

    if (params.stopLoss) payload.stopLoss = params.stopLoss;
    if (params.takeProfit) payload.takeProfit = params.takeProfit;

    const res = await fetch(`${CLIENT_BASE_URL}/users/current/accounts/${accountId}/trade`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `MetaApi Trade Error: ${res.statusText}`);
    }

    return await res.json();
  }
}

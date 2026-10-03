import { NextRequest, NextResponse } from 'next/server';
import { executeBrokerOrder, BrokerCredentials, BrokerOrderRequest } from '@/lib/brokerApi';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const cred: BrokerCredentials = {
      broker: body.broker || 'Exness',
      environment: body.environment || 'LIVE',
      apiKey: body.apiKey,
      apiSecret: body.apiSecret,
      serverOrPassphrase: body.serverOrPassphrase || body.server,
      webhookUrl: body.webhookUrl,
      accountNumber: body.accountNumber,
    };

    const orderReq: BrokerOrderRequest = {
      symbol: body.symbol || 'GOLD (XAU/USD)',
      side: body.side || 'BUY',
      amount: body.amount || 100,
      orderType: body.orderType || 'MARKET',
      price: body.price,
      takeProfit: body.takeProfit,
      stopLoss: body.stopLoss,
      comment: body.comment || 'AutoTrade-TradingBotPro',
    };

    const result = await executeBrokerOrder(cred, orderReq);
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'เกิดข้อผิดพลาดในการส่งคำสั่งเข้า Broker API',
      },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { syncBrokerAccount, BrokerCredentials } from '@/lib/brokerApi';

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

    const accountInfo = await syncBrokerAccount(cred);
    return NextResponse.json(accountInfo);
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อ Broker API',
      },
      { status: 500 }
    );
  }
}

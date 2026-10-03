import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json().catch(() => ({}));
    const timestamp = new Date().toISOString();

    // Log or forward webhook payload from MetaTrader EA or TradingView
    return NextResponse.json({
      received: true,
      timestamp,
      message: 'Trading Bot Pro Webhook Gateway Received Payload',
      data: payload,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        received: false,
        error: error.message,
      },
      { status: 400 }
    );
  }
}

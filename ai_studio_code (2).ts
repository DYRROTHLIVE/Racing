import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-payment-signature');
    const secret = process.env.PAYMENT_WEBHOOK_SECRET;

    if (!secret || !signature) {
      return NextResponse.json({ error: 'Missing security configuration' }, { status: 401 });
    }

    // Verify HMAC-SHA256 signature
    const expectedSig = crypto
      .createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex');

    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))) {
      return NextResponse.json({ error: 'Invalid transaction signature' }, { status: 403 });
    }

    const payload = JSON.parse(rawBody);

    if (payload.event === 'order.successful') {
      const { userId, tier, expiresAt } = payload.data;

      // Update Database - Server Authoritative Only
      // e.g., await db.userSubscription.upsert({ ... })
      return NextResponse.json({ success: true, updated: userId, tier, expiresAt });
    }

    return NextResponse.json({ received: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
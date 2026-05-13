import { NextRequest, NextResponse } from 'next/server';
import { sendEmail, sendSMS } from '@/lib/notify';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const { channel, to, subject, message, html } = await req.json();

  if (channel === 'sms') {
    const r = await sendSMS(to, message);
    return NextResponse.json(r);
  }
  if (channel === 'email') {
    const r = await sendEmail(to, subject ?? 'Nimbus notification', html ?? message);
    return NextResponse.json(r);
  }
  return NextResponse.json({ error: 'channel must be sms or email' }, { status: 400 });
}

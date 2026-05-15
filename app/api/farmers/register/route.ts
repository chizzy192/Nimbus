import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Legacy farmer-register endpoint. Now a thin proxy to /api/accounts/register
 * so existing clients keep working. New code should call /api/accounts/register
 * directly.
 */
export async function POST(req: NextRequest) {
  const body = await req.text();
  const target = new URL('/api/accounts/register', req.nextUrl.origin);
  const res = await fetch(target.toString(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

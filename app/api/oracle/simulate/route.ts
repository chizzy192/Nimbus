import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const { farmer_id } = await req.json();
  if (!farmer_id) {
    return NextResponse.json({ error: 'farmer_id required' }, { status: 400 });
  }
  const url = new URL('/api/oracle/check', req.nextUrl.origin);
  url.searchParams.set('farmer_id', farmer_id);
  url.searchParams.set('force', 'true');
  const res = await fetch(url.toString(), { cache: 'no-store' });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

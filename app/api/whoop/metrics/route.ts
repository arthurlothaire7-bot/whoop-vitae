import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { getWhoopMetrics } from '@/lib/whoop';

export async function GET() {
    const session = await getSession();

    if (!session?.accessToken) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

    try {
          const metrics = await getWhoopMetrics(session.accessToken);
          return NextResponse.json(metrics);
        } catch (error) {
          console.error('Metrics fetch error:', error);
          return NextResponse.json({ error: 'Failed to fetch metrics' }, { status: 500 });
        }
  }

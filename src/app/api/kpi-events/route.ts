import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function formatEvent(e: any) {
  return {
    ...e,
    occurredAt: e.occurredAt instanceof Date ? e.occurredAt.toISOString().split('T')[0] : String(e.occurredAt)
  };
}

export async function GET() {
  try {
    // Bounded to a generous lookback so this never becomes an unbounded
    // full-table scan as the ledger grows — a year of daily activity
    // across the whole company is still a small row count.
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 2);

    const events = await prisma.kpiScoreEvent.findMany({
      where: { occurredAt: { gte: oneYearAgo } },
      orderBy: { occurredAt: 'desc' }
    });
    return NextResponse.json({ success: true, events: events.map(formatEvent) });
  } catch (error: any) {
    console.error('[API /api/kpi-events GET error]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const event = await prisma.kpiScoreEvent.create({
      data: {
        userId: body.userId,
        userName: body.userName,
        points: Number(body.points) || 0,
        reason: body.reason,
        sourceType: body.sourceType,
        sourceId: body.sourceId || null,
        occurredAt: new Date(body.occurredAt)
      }
    });
    return NextResponse.json({ success: true, event: formatEvent(event) });
  } catch (error: any) {
    console.error('[API /api/kpi-events POST error]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

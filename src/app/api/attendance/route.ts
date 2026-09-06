import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const date = searchParams.get('date');

    const where: any = {};
    if (userId) where.userId = userId;
    if (date) where.date = date;

    const records = await prisma.attendanceRecord.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, name: true, jobTitle: true, avatar: true }
        }
      }
    });

    return NextResponse.json({ success: true, records });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, userId, locationTag, coordinates, notes } = body;

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0]; // HH:MM:SS
    const [hours, minutes] = timeStr.split(':').map(Number);

    if (action === 'CLOCK_IN') {
      // Punctuality check: 08:15 cutoff
      const isLate = hours > 8 || (hours === 8 && minutes > 15);
      const status = isLate ? 'LATE' : 'PRESENT';
      const kpiAwarded = isLate ? 0 : 10;

      // Check if already clocked in today
      const existing = await prisma.attendanceRecord.findFirst({
        where: { userId, date: todayStr }
      });

      if (existing) {
        return NextResponse.json({ 
          success: false, 
          message: 'User has already clocked in for today.',
          record: existing 
        }, { status: 400 });
      }

      const record = await prisma.attendanceRecord.create({
        data: {
          userId,
          date: todayStr,
          clockInTime: timeStr,
          locationTag: locationTag || 'Lekki HQ',
          status,
          kpiAwarded,
          coordinates,
          notes
        }
      });

      // Award KPI points in KpiScore and KpiLog
      if (kpiAwarded > 0) {
        const monthYear = todayStr.substring(0, 7);
        await prisma.kpiLog.create({
          data: {
            userId,
            eventType: 'PUNCTUAL_ATTENDANCE',
            points: kpiAwarded,
            description: `On-time clock-in at ${timeStr} WAT (${locationTag || 'Lekki HQ'})`,
            awardedAt: now
          }
        });

        await prisma.kpiScore.upsert({
          where: { id: `kpi-${userId}-${monthYear}` },
          update: {
            totalScore: { increment: kpiAwarded },
            onTimeCount: { increment: 1 }
          },
          create: {
            id: `kpi-${userId}-${monthYear}`,
            userId,
            monthYear,
            totalScore: kpiAwarded,
            onTimeCount: 1,
            completedCount: 1
          }
        });
      }

      return NextResponse.json({
        success: true,
        action: 'CLOCK_IN',
        record,
        kpiAwarded,
        message: isLate 
          ? `Clocked in at ${timeStr} (Flagged Late). 0 KPI points awarded.`
          : `Punctual clock-in recorded at ${timeStr} WAT! +${kpiAwarded} KPI points awarded.`
      });
    } else if (action === 'CLOCK_OUT') {
      const existing = await prisma.attendanceRecord.findFirst({
        where: { userId, date: todayStr }
      });

      if (!existing) {
        return NextResponse.json({
          success: false,
          message: 'No active clock-in session found for today.'
        }, { status: 400 });
      }

      const record = await prisma.attendanceRecord.update({
        where: { id: existing.id },
        data: {
          clockOutTime: timeStr,
          notes: notes ? `${existing.notes || ''} | Out: ${notes}` : existing.notes
        }
      });

      return NextResponse.json({
        success: true,
        action: 'CLOCK_OUT',
        record,
        message: `Clocked out successfully at ${timeStr} WAT.`
      });
    }

    return NextResponse.json({ success: false, message: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

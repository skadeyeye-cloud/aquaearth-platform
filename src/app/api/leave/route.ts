import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    const where: any = {};
    if (userId) {
      where.userId = userId;
    }

    const records = await prisma.leaveRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            jobTitle: true,
            department: {
              select: { name: true }
            }
          }
        }
      }
    });

    const formatted = records.map(lr => ({
      id: lr.id,
      userId: lr.userId,
      userName: lr.user?.name || 'Staff Member',
      userDepartment: lr.user?.department?.name || 'Operations',
      leaveType: lr.leaveType as any,
      startDate: lr.startDate instanceof Date ? lr.startDate.toISOString().split('T')[0] : String(lr.startDate),
      endDate: lr.endDate instanceof Date ? lr.endDate.toISOString().split('T')[0] : String(lr.endDate),
      daysCount: lr.daysCount,
      status: lr.status as any,
      reason: lr.reason || '',
      createdAt: lr.createdAt instanceof Date ? lr.createdAt.toISOString().split('T')[0] : String(lr.createdAt),
      approvedById: lr.approvedById || undefined,
      approverComments: lr.reviewComments || undefined,
      approvalDate: lr.reviewedAt ? (lr.reviewedAt instanceof Date ? lr.reviewedAt.toISOString().split('T')[0] : String(lr.reviewedAt)) : undefined
    }));

    return NextResponse.json({ success: true, leaves: formatted });
  } catch (error: any) {
    console.error('[API /api/leave GET error]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, leaveType, startDate, endDate, daysCount, reason } = body;

    if (!userId || !startDate || !endDate) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const newLeave = await prisma.leaveRequest.create({
      data: {
        userId,
        leaveType: leaveType || 'ANNUAL',
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        daysCount: Number(daysCount) || 1,
        status: 'PENDING',
        reason: reason || null
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            department: { select: { name: true } }
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      leave: {
        id: newLeave.id,
        userId: newLeave.userId,
        userName: newLeave.user?.name || 'Staff Member',
        userDepartment: newLeave.user?.department?.name || 'Operations',
        leaveType: newLeave.leaveType,
        startDate: newLeave.startDate.toISOString().split('T')[0],
        endDate: newLeave.endDate.toISOString().split('T')[0],
        daysCount: newLeave.daysCount,
        status: newLeave.status,
        reason: newLeave.reason || '',
        createdAt: newLeave.createdAt.toISOString().split('T')[0]
      }
    });
  } catch (error: any) {
    console.error('[API /api/leave POST error]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status, approvedById, reviewComments } = body;

    if (!id || !status) {
      return NextResponse.json({ success: false, error: 'Missing id or status' }, { status: 400 });
    }

    const updated = await prisma.leaveRequest.update({
      where: { id },
      data: {
        status,
        approvedById: approvedById || null,
        reviewComments: reviewComments || null,
        reviewedAt: new Date()
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            department: { select: { name: true } }
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      leave: {
        id: updated.id,
        userId: updated.userId,
        userName: updated.user?.name || 'Staff Member',
        userDepartment: updated.user?.department?.name || 'Operations',
        leaveType: updated.leaveType,
        startDate: updated.startDate.toISOString().split('T')[0],
        endDate: updated.endDate.toISOString().split('T')[0],
        daysCount: updated.daysCount,
        status: updated.status,
        reason: updated.reason || '',
        createdAt: updated.createdAt.toISOString().split('T')[0],
        approvedById: updated.approvedById,
        approverComments: updated.reviewComments,
        approvalDate: updated.reviewedAt?.toISOString().split('T')[0]
      }
    });
  } catch (error: any) {
    console.error('[API /api/leave PATCH error]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

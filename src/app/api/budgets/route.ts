import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const department = searchParams.get('department');
    const status = searchParams.get('status');
    const approvalStage = searchParams.get('approvalStage');
    const requestedById = searchParams.get('requestedById');

    const where: any = {};
    if (department) where.department = department;
    if (status) where.status = status;
    if (approvalStage) where.approvalStage = approvalStage;
    if (requestedById) where.requestedById = requestedById;

    const budgets = await prisma.budgetRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ success: true, budgets });
  } catch (error: any) {
    console.error('[API /api/budgets GET error]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.title || !body.department || !body.requestedById || body.amountNgn === undefined) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const count = await prisma.budgetRequest.count();
    const requestNumber = `BGT-${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}`;

    const budget = await prisma.budgetRequest.create({
      data: {
        requestNumber,
        title: body.title,
        department: body.department,
        requestedById: body.requestedById,
        requestedByName: body.requestedByName,
        amountNgn: Number(body.amountNgn),
        category: body.category,
        justification: body.justification,
        status: body.status || 'PENDING_APPROVAL',
        budgetType: body.budgetType || null,
        frequency: body.frequency || null,
        projectId: body.projectId || null,
        projectName: body.projectName || null,
        collatedById: body.collatedById || null,
        collatedByName: body.collatedByName || null,
        cfoReviewStatus: body.cfoReviewStatus || null,
        presentedToMdBy: body.presentedToMdBy || null,
        approvalStage: body.approvalStage || 'MD_PENDING',
        miscellaneousAmountNgn: body.miscellaneousAmountNgn !== undefined ? Number(body.miscellaneousAmountNgn) : 0,
        miscellaneousJustification: body.miscellaneousJustification || null
      }
    });

    return NextResponse.json({ success: true, budget });
  } catch (error: any) {
    console.error('[API /api/budgets POST error]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Budget request ID is required' }, { status: 400 });
    }

    const allowedFields = [
      'status', 'approvalStage', 'collatedById', 'collatedByName', 'collationNotes',
      'cfoReviewStatus', 'cfoReviewNotes', 'cfoReviewedAt', 'presentedToMdBy',
      'approvedById', 'approvedByName', 'approvedOnBehalfOfDrK', 'drKNotified',
      'declineOutcome', 'reviewedById', 'reviewedByName', 'reviewComments', 'reviewedAt'
    ];

    const updateData: any = {};
    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        if ((field === 'cfoReviewedAt' || field === 'reviewedAt') && updates[field]) {
          updateData[field] = new Date(updates[field]);
        } else {
          updateData[field] = updates[field];
        }
      }
    }

    const budget = await prisma.budgetRequest.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json({ success: true, budget });
  } catch (error: any) {
    console.error('[API /api/budgets PATCH error]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

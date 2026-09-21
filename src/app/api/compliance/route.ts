import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function formatPermit(p: any) {
  return {
    ...p,
    issueDate: p.issueDate.toISOString().split('T')[0],
    expiryDate: p.expiryDate.toISOString().split('T')[0]
  };
}

export async function GET() {
  try {
    const permits = await prisma.compliancePermit.findMany({ orderBy: { expiryDate: 'asc' } });
    return NextResponse.json({ success: true, permits: permits.map(formatPermit) });
  } catch (error: any) {
    console.error('[API /api/compliance GET error]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Permit ID is required' }, { status: 400 });
    }

    const updateData: any = {};
    const allowedFields = ['status', 'daysRemaining', 'feeReconciled', 'stampedCertificateUrl'];
    for (const field of allowedFields) {
      if (updates[field] !== undefined) updateData[field] = updates[field];
    }
    if (updates.issueDate !== undefined) updateData.issueDate = new Date(updates.issueDate);
    if (updates.expiryDate !== undefined) updateData.expiryDate = new Date(updates.expiryDate);

    const permit = await prisma.compliancePermit.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json({ success: true, permit: formatPermit(permit) });
  } catch (error: any) {
    console.error('[API /api/compliance PATCH error]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

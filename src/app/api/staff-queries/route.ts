import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function formatQuery(q: any) {
  const fmt = (d: Date | null) => (d ? d.toISOString().split('T')[0] : undefined);
  return {
    ...q,
    incidentDate: fmt(q.incidentDate),
    issuedDate: fmt(q.issuedDate),
    respondedAt: fmt(q.respondedAt) || undefined,
    resolvedAt: fmt(q.resolvedAt) || undefined
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const staffId = searchParams.get('staffId');
    const status = searchParams.get('status');

    const where: any = {};
    if (staffId) where.staffId = staffId;
    if (status) where.status = status;

    const queries = await prisma.staffQuery.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ success: true, queries: queries.map(formatQuery) });
  } catch (error: any) {
    console.error('[API /api/staff-queries GET error]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const count = await prisma.staffQuery.count();
    const queryNumber = body.queryNumber || `QRY-${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}`;

    const query = await prisma.staffQuery.create({
      data: {
        queryNumber,
        staffId: body.staffId,
        staffName: body.staffName,
        staffDepartment: body.staffDepartment,
        issuedById: body.issuedById,
        issuedByName: body.issuedByName,
        title: body.title,
        allegationDetails: body.allegationDetails,
        incidentDate: new Date(body.incidentDate),
        responseDeadline: body.responseDeadline,
        status: body.status || 'ISSUED'
      }
    });

    return NextResponse.json({ success: true, query: formatQuery(query) });
  } catch (error: any) {
    console.error('[API /api/staff-queries POST error]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Query ID is required' }, { status: 400 });
    }

    const updateData: any = {};
    const allowedFields = ['status', 'staffResponse', 'resolution', 'resolutionNotes', 'resolvedById', 'resolvedByName'];
    for (const field of allowedFields) {
      if (updates[field] !== undefined) updateData[field] = updates[field];
    }
    if (updates.respondedAt !== undefined) updateData.respondedAt = updates.respondedAt ? new Date(updates.respondedAt) : null;
    if (updates.resolvedAt !== undefined) updateData.resolvedAt = updates.resolvedAt ? new Date(updates.resolvedAt) : null;

    const query = await prisma.staffQuery.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json({ success: true, query: formatQuery(query) });
  } catch (error: any) {
    console.error('[API /api/staff-queries PATCH error]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

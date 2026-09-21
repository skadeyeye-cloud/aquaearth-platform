import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function formatCandidate(c: any) {
  let notes: any[] = [];
  let documents: any[] = [];
  try { notes = c.notesJson ? JSON.parse(c.notesJson) : []; } catch {}
  try { documents = c.documentsJson ? JSON.parse(c.documentsJson) : []; } catch {}
  const { notesJson, documentsJson, ...rest } = c;
  return {
    ...rest,
    notes,
    documents,
    outcomeDate: c.outcomeDate ? c.outcomeDate.toISOString().split('T')[0] : undefined,
    createdAt: c.createdAt.toISOString().split('T')[0]
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const currentStage = searchParams.get('currentStage');

    const where: any = {};
    if (currentStage) where.currentStage = currentStage;

    const candidates = await prisma.candidateApplication.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ success: true, candidates: candidates.map(formatCandidate) });
  } catch (error: any) {
    console.error('[API /api/candidates GET error]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const count = await prisma.candidateApplication.count();
    const candidateNumber = body.candidateNumber || `CND-${new Date().getFullYear()}-${String(100 + count).padStart(3, '0')}`;

    const candidate = await prisma.candidateApplication.create({
      data: {
        candidateNumber,
        fullName: body.fullName,
        email: body.email,
        phone: body.phone,
        appliedRole: body.appliedRole,
        department: body.department,
        currentStage: body.currentStage || 'PROSPECTIVE',
        yearsExperience: Number(body.yearsExperience) || 0,
        expectedSalaryNgn: body.expectedSalaryNgn !== undefined ? Number(body.expectedSalaryNgn) : null,
        notesJson: body.notes ? JSON.stringify(body.notes) : JSON.stringify([]),
        documentsJson: body.documents ? JSON.stringify(body.documents) : JSON.stringify([]),
        vaultFolderId: body.vaultFolderId || null
      }
    });

    return NextResponse.json({ success: true, candidate: formatCandidate(candidate) });
  } catch (error: any) {
    console.error('[API /api/candidates POST error]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Candidate ID is required' }, { status: 400 });
    }

    const updateData: any = {};
    const allowedFields = ['currentStage', 'outcome', 'vaultFolderId'];
    for (const field of allowedFields) {
      if (updates[field] !== undefined) updateData[field] = updates[field];
    }
    if (updates.notes !== undefined) updateData.notesJson = JSON.stringify(updates.notes);
    if (updates.documents !== undefined) updateData.documentsJson = JSON.stringify(updates.documents);
    if (updates.outcomeDate !== undefined) updateData.outcomeDate = updates.outcomeDate ? new Date(updates.outcomeDate) : null;

    const candidate = await prisma.candidateApplication.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json({ success: true, candidate: formatCandidate(candidate) });
  } catch (error: any) {
    console.error('[API /api/candidates PATCH error]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

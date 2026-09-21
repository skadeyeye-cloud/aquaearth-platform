import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function formatQa(qa: any) {
  let reviewNotes: any[] = [];
  try {
    reviewNotes = qa.reviewNotesJson ? JSON.parse(qa.reviewNotesJson) : [];
  } catch {}
  const { reviewNotesJson, ...rest } = qa;
  return { ...rest, reviewNotes };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const documentId = searchParams.get('documentId');
    const stage = searchParams.get('stage');

    const where: any = {};
    if (documentId) where.documentId = documentId;
    if (stage) where.stage = stage;

    const reviews = await prisma.qaReview.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ success: true, reviews: reviews.map(formatQa) });
  } catch (error: any) {
    console.error('[API /api/qa-reviews GET error]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const review = await prisma.qaReview.create({
      data: {
        documentId: body.documentId,
        documentTitle: body.documentTitle,
        projectCode: body.projectCode,
        authorId: body.authorId,
        authorName: body.authorName,
        stage: body.stage || 'PEER_REVIEW',
        slaDeadline: body.slaDeadline,
        isOverdue: Boolean(body.isOverdue),
        peerReviewerId: body.peerReviewerId || null,
        peerReviewerName: body.peerReviewerName || null,
        qaLeadId: body.qaLeadId || null,
        qaLeadName: body.qaLeadName || null,
        managingConsultantSigned: Boolean(body.managingConsultantSigned),
        reviewNotesJson: JSON.stringify(body.reviewNotes || [])
      }
    });

    return NextResponse.json({ success: true, review: formatQa(review) });
  } catch (error: any) {
    console.error('[API /api/qa-reviews POST error]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'QA review ID is required' }, { status: 400 });
    }

    const updateData: any = {};
    const allowedFields = [
      'stage', 'isOverdue', 'managingConsultantSigned', 'tamperProofCertificateHash'
    ];
    for (const field of allowedFields) {
      if (updates[field] !== undefined) updateData[field] = updates[field];
    }
    if (updates.reviewNotes !== undefined) {
      updateData.reviewNotesJson = JSON.stringify(updates.reviewNotes);
    }

    const review = await prisma.qaReview.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json({ success: true, review: formatQa(review) });
  } catch (error: any) {
    console.error('[API /api/qa-reviews PATCH error]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

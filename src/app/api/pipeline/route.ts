import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const records = await prisma.opportunity.findMany({
      orderBy: { createdAt: 'desc' }
    });

    const formatted = records.map(opp => ({
      id: opp.id,
      title: opp.title,
      clientName: opp.clientName,
      serviceLines: opp.serviceLinesJson ? JSON.parse(opp.serviceLinesJson) : [],
      estimatedValue: opp.estimatedValue,
      currency: opp.currency as any,
      stage: opp.stage as any,
      source: opp.source || undefined,
      submissionDeadline: opp.submissionDeadline instanceof Date ? opp.submissionDeadline.toISOString().split('T')[0] : String(opp.submissionDeadline),
      decisionDate: opp.decisionDate ? (opp.decisionDate instanceof Date ? opp.decisionDate.toISOString().split('T')[0] : String(opp.decisionDate)) : undefined,
      bdOwnerName: opp.bdOwnerName,
      technicalLeadName: opp.technicalLeadName || undefined,
      winLossReason: opp.winLossReason || undefined,
      winningCompetitor: opp.winningCompetitor || undefined,
      convertedProjectId: opp.convertedProjectId || undefined
    }));

    return NextResponse.json({ success: true, opportunities: formatted });
  } catch (error: any) {
    console.error('[API /api/pipeline GET error]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const opportunity = await prisma.opportunity.create({
      data: {
        title: body.title,
        clientName: body.clientName,
        serviceLinesJson: JSON.stringify(body.serviceLines || []),
        estimatedValue: Number(body.estimatedValue) || 0,
        currency: body.currency || 'NGN',
        stage: body.stage || 'IDENTIFIED',
        source: body.source || null,
        submissionDeadline: new Date(body.submissionDeadline),
        bdOwnerName: body.bdOwnerName,
        technicalLeadName: body.technicalLeadName || null
      }
    });
    return NextResponse.json({ success: true, opportunity });
  } catch (error: any) {
    console.error('[API /api/pipeline POST error]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, stage, winLossReason, winningCompetitor, convertedProjectId } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Opportunity ID is required' }, { status: 400 });
    }

    const updateData: any = {};
    if (stage) updateData.stage = stage;
    if (winLossReason !== undefined) updateData.winLossReason = winLossReason;
    if (winningCompetitor !== undefined) updateData.winningCompetitor = winningCompetitor;
    if (convertedProjectId !== undefined) updateData.convertedProjectId = convertedProjectId;

    const opportunity = await prisma.opportunity.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json({ success: true, opportunity });
  } catch (error: any) {
    console.error('[API /api/pipeline PATCH error]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

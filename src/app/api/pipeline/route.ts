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
      secondaryValue: opp.secondaryValue ?? undefined,
      secondaryCurrency: opp.secondaryCurrency as any || undefined,
      stage: opp.stage as any,
      source: opp.source || undefined,
      referredByStaffId: opp.referredByStaffId || undefined,
      referredByStaffName: opp.referredByStaffName || undefined,
      submissionDeadline: opp.submissionDeadline instanceof Date ? opp.submissionDeadline.toISOString().split('T')[0] : String(opp.submissionDeadline),
      decisionDate: opp.decisionDate ? (opp.decisionDate instanceof Date ? opp.decisionDate.toISOString().split('T')[0] : String(opp.decisionDate)) : undefined,
      bdOwnerName: opp.bdOwnerName,
      technicalLeadId: opp.technicalLeadId || undefined,
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
        secondaryValue: body.secondaryValue !== undefined && body.secondaryValue !== null ? Number(body.secondaryValue) : null,
        secondaryCurrency: body.secondaryCurrency || null,
        stage: body.stage || 'IDENTIFIED',
        source: body.source || null,
        referredByStaffId: body.referredByStaffId || null,
        referredByStaffName: body.referredByStaffName || null,
        submissionDeadline: new Date(body.submissionDeadline),
        bdOwnerName: body.bdOwnerName,
        technicalLeadId: body.technicalLeadId || null,
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
    const {
      id, stage, winLossReason, winningCompetitor, convertedProjectId,
      title, clientName, serviceLines, estimatedValue, currency,
      secondaryValue, secondaryCurrency, source, referredByStaffId, referredByStaffName,
      submissionDeadline, technicalLeadId, technicalLeadName
    } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Opportunity ID is required' }, { status: 400 });
    }

    const updateData: any = {};
    if (stage) updateData.stage = stage;
    if (winLossReason !== undefined) updateData.winLossReason = winLossReason;
    if (winningCompetitor !== undefined) updateData.winningCompetitor = winningCompetitor;
    if (convertedProjectId !== undefined) updateData.convertedProjectId = convertedProjectId;
    if (title !== undefined) updateData.title = title;
    if (clientName !== undefined) updateData.clientName = clientName;
    if (serviceLines !== undefined) updateData.serviceLinesJson = JSON.stringify(serviceLines);
    if (estimatedValue !== undefined) updateData.estimatedValue = Number(estimatedValue);
    if (currency !== undefined) updateData.currency = currency;
    if (secondaryValue !== undefined) updateData.secondaryValue = secondaryValue === null ? null : Number(secondaryValue);
    if (secondaryCurrency !== undefined) updateData.secondaryCurrency = secondaryCurrency;
    if (source !== undefined) updateData.source = source;
    if (referredByStaffId !== undefined) updateData.referredByStaffId = referredByStaffId;
    if (referredByStaffName !== undefined) updateData.referredByStaffName = referredByStaffName;
    if (submissionDeadline !== undefined) updateData.submissionDeadline = new Date(submissionDeadline);
    if (technicalLeadId !== undefined) updateData.technicalLeadId = technicalLeadId;
    if (technicalLeadName !== undefined) updateData.technicalLeadName = technicalLeadName;

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

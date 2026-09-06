import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const opportunities = await prisma.opportunity.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json({ success: true, opportunities });
  } catch (error: any) {
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
        estimatedValue: Number(body.estimatedValue),
        currency: body.currency || 'NGN',
        stage: body.stage || 'IDENTIFIED',
        source: body.source,
        submissionDeadline: new Date(body.submissionDeadline),
        bdOwnerName: body.bdOwnerName,
        technicalLeadName: body.technicalLeadName
      }
    });
    return NextResponse.json({ success: true, opportunity });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

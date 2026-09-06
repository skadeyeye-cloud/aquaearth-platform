import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const invoices = await prisma.invoice.findMany({
      orderBy: { issuedDate: 'desc' }
    });
    return NextResponse.json({ success: true, invoices });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const subtotal = Number(body.subtotalNgn);
    const vatRate = Number(body.vatRatePercent || 7.5);
    const whtRate = Number(body.whtRatePercent || 5.0);

    const vatAmount = (subtotal * vatRate) / 100;
    const whtDeduction = (subtotal * whtRate) / 100;
    const netPayable = subtotal + vatAmount - whtDeduction;

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber: `INV-2026-${Math.floor(100 + Math.random() * 900)}`,
        projectId: body.projectId || 'prj-1',
        projectName: body.projectName,
        clientId: body.clientId || 'cli-1',
        clientName: body.clientName,
        milestoneDescription: body.milestoneDescription,
        subtotalNgn: subtotal,
        vatRatePercent: vatRate,
        vatAmountNgn: vatAmount,
        whtRatePercent: whtRate,
        whtDeductionNgn: whtDeduction,
        netPayableNgn: netPayable,
        status: 'ISSUED',
        dueDate: new Date(body.dueDate)
      }
    });

    return NextResponse.json({ success: true, invoice });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

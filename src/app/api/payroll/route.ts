import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function formatRecord(r: any) {
  let customBenefits: any[] = [];
  try {
    customBenefits = r.customBenefitsJson ? JSON.parse(r.customBenefitsJson) : [];
  } catch {}
  const { customBenefitsJson, ...rest } = r;
  return { ...rest, customBenefits };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const monthYear = searchParams.get('monthYear');
    const staffId = searchParams.get('staffId');

    const where: any = {};
    if (monthYear) where.monthYear = monthYear;
    if (staffId) where.staffId = staffId;

    const records = await prisma.payrollRecord.findMany({
      where,
      orderBy: [{ monthYear: 'desc' }, { staffName: 'asc' }]
    });

    return NextResponse.json({ success: true, records: records.map(formatRecord) });
  } catch (error: any) {
    console.error('[API /api/payroll GET error]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// Bulk-create a monthly payroll run (one row per staff member not already run that month)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { records } = body;

    if (!Array.isArray(records) || records.length === 0) {
      return NextResponse.json({ success: false, error: 'records array is required' }, { status: 400 });
    }

    await prisma.payrollRecord.createMany({
      data: records.map((r: any) => ({
        id: r.id,
        staffId: r.staffId,
        staffName: r.staffName,
        department: r.department,
        jobTitle: r.jobTitle,
        baseSalaryNgn: Number(r.baseSalaryNgn),
        hazardAllowanceNgn: Number(r.hazardAllowanceNgn) || 0,
        fieldPerDiemNgn: Number(r.fieldPerDiemNgn) || 0,
        performanceBonusNgn: Number(r.performanceBonusNgn) || 0,
        customBenefitsJson: r.customBenefits ? JSON.stringify(r.customBenefits) : null,
        pensionDeductionNgn: Number(r.pensionDeductionNgn) || 0,
        taxPayeNgn: Number(r.taxPayeNgn) || 0,
        netPayNgn: Number(r.netPayNgn) || 0,
        monthYear: r.monthYear,
        paymentStatus: r.paymentStatus || 'DRAFT'
      })),
      skipDuplicates: true
    });

    const created = await prisma.payrollRecord.findMany({
      where: { monthYear: records[0]?.monthYear, staffId: { in: records.map((r: any) => r.staffId) } }
    });

    return NextResponse.json({ success: true, records: created.map(formatRecord) });
  } catch (error: any) {
    console.error('[API /api/payroll POST error]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Payroll record ID is required' }, { status: 400 });
    }

    const updateData: any = {};
    const allowedFields = [
      'baseSalaryNgn', 'hazardAllowanceNgn', 'fieldPerDiemNgn', 'performanceBonusNgn',
      'pensionDeductionNgn', 'taxPayeNgn', 'netPayNgn', 'paymentStatus'
    ];
    for (const field of allowedFields) {
      if (updates[field] !== undefined) updateData[field] = updates[field];
    }
    if (updates.customBenefits !== undefined) {
      updateData.customBenefitsJson = JSON.stringify(updates.customBenefits);
    }

    const record = await prisma.payrollRecord.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json({ success: true, record: formatRecord(record) });
  } catch (error: any) {
    console.error('[API /api/payroll PATCH error]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

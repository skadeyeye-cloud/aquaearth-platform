import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const DEFAULT_FUNDS = [
  { custodian: 'GIFT', custodianName: 'Gift', allocatedAmountNgn: 300000, currentBalanceNgn: 300000, allocatedBy: 'Dr. Kaine Edike' },
  { custodian: 'MARVELOUS', custodianName: 'Marvelous', allocatedAmountNgn: 300000, currentBalanceNgn: 300000, allocatedBy: 'Dr. Kaine Edike' }
];

async function ensureFundsSeeded() {
  const count = await prisma.pettyCashFund.count();
  if (count === 0) {
    await prisma.pettyCashFund.createMany({
      data: DEFAULT_FUNDS.map(f => ({ ...f, lastReplenishedDate: new Date() }))
    });
  }
}

const toDateStr = (d: Date) => d.toISOString().split('T')[0];
const toTimestampStr = (d: Date) => d.toISOString().replace('T', ' ').substring(0, 19);

export async function GET() {
  try {
    await ensureFundsSeeded();

    const [funds, transactions, topups, analyses] = await Promise.all([
      prisma.pettyCashFund.findMany({ orderBy: { custodian: 'asc' } }),
      prisma.pettyCashTransaction.findMany({ orderBy: { createdAt: 'desc' } }),
      prisma.pettyCashTopUpRecord.findMany({ orderBy: { createdAt: 'desc' } }),
      prisma.pettyCashAnalysis.findMany({ orderBy: { createdAt: 'desc' } })
    ]);

    return NextResponse.json({
      success: true,
      funds: funds.map(f => ({ ...f, lastReplenishedDate: toDateStr(f.lastReplenishedDate) })),
      transactions: transactions.map(t => ({ ...t, date: toDateStr(t.date), createdAt: toTimestampStr(t.createdAt) })),
      topups: topups.map(t => ({ ...t, date: toDateStr(t.date), createdAt: toTimestampStr(t.createdAt) })),
      analyses: analyses.map(a => ({ ...a, createdAt: toTimestampStr(a.createdAt) }))
    });
  } catch (error: any) {
    console.error('[API /api/petty-cash GET error]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type } = body;

    if (type === 'TRANSACTION') {
      const [transaction] = await prisma.$transaction([
        prisma.pettyCashTransaction.create({
          data: {
            fundCustodian: body.fundCustodian,
            date: new Date(body.date),
            amountNgn: Number(body.amountNgn),
            category: body.category,
            description: body.description,
            receiptUrl: body.receiptUrl || null,
            approvedByName: body.approvedByName
          }
        }),
        prisma.pettyCashFund.updateMany({
          where: { custodian: body.fundCustodian },
          data: { currentBalanceNgn: { decrement: Number(body.amountNgn) } }
        })
      ]);

      return NextResponse.json({ success: true, transaction });
    }

    if (type === 'TOPUP') {
      const amountNgn = Number(body.amountNgn);
      const [topup] = await prisma.$transaction([
        prisma.pettyCashTopUpRecord.create({
          data: {
            fundCustodian: body.fundCustodian,
            amountNgn,
            fundingSource: body.fundingSource,
            referenceNumber: body.referenceNumber || `TOP-${Date.now().toString().slice(-6)}`,
            notes: body.notes || null,
            authorizedByName: body.authorizedByName,
            date: new Date(body.date)
          }
        }),
        prisma.pettyCashFund.updateMany({
          where: { custodian: body.fundCustodian },
          data: {
            currentBalanceNgn: { increment: amountNgn },
            lastReplenishedDate: new Date(body.date)
          }
        })
      ]);

      return NextResponse.json({ success: true, topup });
    }

    if (type === 'ANALYSIS') {
      const analysis = await prisma.pettyCashAnalysis.create({
        data: {
          monthYear: body.monthYear,
          analyzedById: body.analyzedById,
          analyzedByName: body.analyzedByName,
          isPrimaryGift: Boolean(body.isPrimaryGift),
          giftOpeningBalanceNgn: Number(body.giftOpeningBalanceNgn),
          giftDisbursedNgn: Number(body.giftDisbursedNgn),
          giftClosingBalanceNgn: Number(body.giftClosingBalanceNgn),
          marvelousOpeningBalanceNgn: Number(body.marvelousOpeningBalanceNgn),
          marvelousDisbursedNgn: Number(body.marvelousDisbursedNgn),
          marvelousClosingBalanceNgn: Number(body.marvelousClosingBalanceNgn),
          totalDisbursedNgn: Number(body.totalDisbursedNgn),
          replenishmentRequestedNgn: Number(body.replenishmentRequestedNgn),
          status: body.status || 'SUBMITTED_TO_DR_K',
          drKNotes: body.drKNotes || null
        }
      });

      return NextResponse.json({ success: true, analysis });
    }

    return NextResponse.json({ success: false, error: 'Unknown type' }, { status: 400 });
  } catch (error: any) {
    console.error('[API /api/petty-cash POST error]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { type } = body;

    if (type === 'APPROVE_REPLENISHMENT') {
      const { id, notes } = body;
      if (!id) {
        return NextResponse.json({ success: false, error: 'Analysis ID is required' }, { status: 400 });
      }

      const [analysis] = await prisma.$transaction([
        prisma.pettyCashAnalysis.update({
          where: { id },
          data: { status: 'APPROVED', approvedByDrK: true, drKNotes: notes || undefined }
        }),
        prisma.$executeRaw`UPDATE "PettyCashFund" SET "currentBalanceNgn" = "allocatedAmountNgn", "lastReplenishedDate" = NOW(), "updatedAt" = NOW()`
      ]);

      const funds = await prisma.pettyCashFund.findMany({ orderBy: { custodian: 'asc' } });
      return NextResponse.json({ success: true, analysis, funds });
    }

    return NextResponse.json({ success: false, error: 'Unknown type' }, { status: 400 });
  } catch (error: any) {
    console.error('[API /api/petty-cash PATCH error]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function formatAsset(a: any) {
  let history: any[] = [];
  try { history = a.historyJson ? JSON.parse(a.historyJson) : []; } catch {}
  const { historyJson, ...rest } = a;
  return {
    ...rest,
    purchaseDate: a.purchaseDate.toISOString().split('T')[0],
    history
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const assignedToId = searchParams.get('assignedToId');

    const where: any = {};
    if (status) where.status = status;
    if (assignedToId) where.assignedToId = assignedToId;

    const assets = await prisma.hardwareAsset.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ success: true, assets: assets.map(formatAsset) });
  } catch (error: any) {
    console.error('[API /api/hardware-assets GET error]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const asset = await prisma.hardwareAsset.create({
      data: {
        assetTag: body.assetTag,
        name: body.name,
        serialNumber: body.serialNumber || null,
        category: body.category,
        assignedToId: body.assignedToId || null,
        assignedToName: body.assignedToName,
        assignedToDept: body.assignedToDept,
        purchaseDate: new Date(body.purchaseDate),
        status: body.status || 'OPERATIONAL',
        location: body.location,
        condition: body.condition || null,
        historyJson: body.history ? JSON.stringify(body.history) : null
      }
    });

    return NextResponse.json({ success: true, asset: formatAsset(asset) });
  } catch (error: any) {
    console.error('[API /api/hardware-assets POST error]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Asset ID is required' }, { status: 400 });
    }

    const updateData: any = {};
    const allowedFields = ['status', 'assignedToId', 'assignedToName', 'assignedToDept', 'location', 'condition'];
    for (const field of allowedFields) {
      if (updates[field] !== undefined) updateData[field] = updates[field];
    }
    if (updates.history !== undefined) updateData.historyJson = JSON.stringify(updates.history);

    const asset = await prisma.hardwareAsset.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json({ success: true, asset: formatAsset(asset) });
  } catch (error: any) {
    console.error('[API /api/hardware-assets PATCH error]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

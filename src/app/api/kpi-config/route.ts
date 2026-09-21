import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const row = await prisma.kpiConfig.findUnique({ where: { id: 'singleton' } });
    if (!row) {
      return NextResponse.json({ success: true, config: null });
    }
    return NextResponse.json({ success: true, config: JSON.parse(row.configJson) });
  } catch (error: any) {
    console.error('[API /api/kpi-config GET error]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { config, updatedBy } = body;

    if (!config) {
      return NextResponse.json({ success: false, error: 'config is required' }, { status: 400 });
    }

    const row = await prisma.kpiConfig.upsert({
      where: { id: 'singleton' },
      update: { configJson: JSON.stringify(config), updatedBy },
      create: { id: 'singleton', configJson: JSON.stringify(config), updatedBy }
    });

    return NextResponse.json({ success: true, config: JSON.parse(row.configJson) });
  } catch (error: any) {
    console.error('[API /api/kpi-config PUT error]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

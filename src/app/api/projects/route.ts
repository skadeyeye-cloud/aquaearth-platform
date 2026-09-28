import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function formatProject(p: any) {
  return {
    ...p,
    serviceLines: p.serviceLinesJson ? JSON.parse(p.serviceLinesJson) : [],
    startDate: p.startDate instanceof Date ? p.startDate.toISOString().split('T')[0] : String(p.startDate),
    targetEndDate: p.targetEndDate instanceof Date ? p.targetEndDate.toISOString().split('T')[0] : String(p.targetEndDate),
    actualEndDate: p.actualEndDate ? (p.actualEndDate instanceof Date ? p.actualEndDate.toISOString().split('T')[0] : String(p.actualEndDate)) : undefined,
    pausedAt: p.pausedAt ? (p.pausedAt instanceof Date ? p.pausedAt.toISOString().split('T')[0] : String(p.pausedAt)) : undefined,
    createdAt: p.createdAt instanceof Date ? p.createdAt.toISOString().split('T')[0] : String(p.createdAt)
  };
}

export async function GET() {
  try {
    const projects = await prisma.project.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json({ success: true, projects: projects.map(formatProject) });
  } catch (error: any) {
    console.error('[API /api/projects GET error]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const project = await prisma.project.create({
      data: {
        projectCode: body.projectCode || `PRJ-${Date.now()}`,
        title: body.title,
        clientId: body.clientId || null,
        clientName: body.clientName,
        serviceLinesJson: JSON.stringify(body.serviceLines || []),
        contractValue: Number(body.contractValue) || 0,
        currency: body.currency || 'NGN',
        status: body.status || 'ACTIVE',
        health: body.health || 'ON_TRACK',
        startDate: new Date(body.startDate),
        targetEndDate: new Date(body.targetEndDate),
        leadPmId: body.leadPmId || null,
        projectManagerId: body.projectManagerId || null,
        leadPmName: body.leadPmName,
        isPaused: !!body.isPaused,
        vaultStorageTier: body.vaultStorageTier || 'ACTIVE_VAULT'
      }
    });
    return NextResponse.json({ success: true, project: formatProject(project) });
  } catch (error: any) {
    console.error('[API /api/projects POST error]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;
    if (!id) {
      return NextResponse.json({ success: false, error: 'Project ID is required' }, { status: 400 });
    }

    const updateData: any = {};
    const directFields = [
      'title', 'clientId', 'clientName', 'contractValue', 'currency', 'status', 'health',
      'leadPmId', 'projectManagerId', 'leadPmName', 'isPaused', 'pausedReason', 'vaultStorageTier'
    ];
    for (const field of directFields) {
      if (updates[field] !== undefined) updateData[field] = updates[field];
    }
    if (updates.serviceLines !== undefined) updateData.serviceLinesJson = JSON.stringify(updates.serviceLines);
    if (updates.startDate !== undefined) updateData.startDate = new Date(updates.startDate);
    if (updates.targetEndDate !== undefined) updateData.targetEndDate = new Date(updates.targetEndDate);
    if (updates.actualEndDate !== undefined) updateData.actualEndDate = updates.actualEndDate ? new Date(updates.actualEndDate) : null;
    if (updates.pausedAt !== undefined) updateData.pausedAt = updates.pausedAt ? new Date(updates.pausedAt) : null;

    const project = await prisma.project.update({ where: { id }, data: updateData });
    return NextResponse.json({ success: true, project: formatProject(project) });
  } catch (error: any) {
    console.error('[API /api/projects PATCH error]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

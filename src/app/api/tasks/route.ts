import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const assigneeId = searchParams.get('assigneeId');
    const status = searchParams.get('status');

    const where: any = {};
    if (assigneeId) where.assigneeId = assigneeId;
    if (status) where.status = status;

    const tasks = await prisma.task.findMany({
      where,
      orderBy: { dueDate: 'asc' },
      include: {
        assignee: { select: { id: true, name: true, jobTitle: true, avatar: true } }
      }
    });

    const formatted = tasks.map(t => ({
      id: t.id,
      title: t.title,
      description: t.description || '',
      moduleOrigin: t.moduleOrigin as any,
      status: t.status as any,
      priority: t.priority as any,
      dueDate: t.dueDate instanceof Date ? t.dueDate.toISOString().split('T')[0] : String(t.dueDate),
      completedAt: t.completedAt ? (t.completedAt instanceof Date ? t.completedAt.toISOString() : String(t.completedAt)) : undefined,
      assigneeId: t.assigneeId,
      assigneeName: t.assignee?.name || 'Unassigned',
      projectId: t.projectId || undefined,
      projectName: t.projectName || undefined,
      estimatedHours: t.estimatedHours,
      loggedHours: t.loggedHours
    }));

    return NextResponse.json({ success: true, tasks: formatted });
  } catch (error: any) {
    console.error('[API /api/tasks GET error]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const task = await prisma.task.create({
      data: {
        title: body.title,
        description: body.description,
        moduleOrigin: body.moduleOrigin || 'PROJECT',
        status: body.status || 'NOT_STARTED',
        priority: body.priority || 'MEDIUM',
        dueDate: new Date(body.dueDate),
        assigneeId: body.assigneeId,
        projectId: body.projectId || null,
        projectName: body.projectName || null,
        estimatedHours: Number(body.estimatedHours) || 0
      },
      include: {
        assignee: { select: { id: true, name: true, jobTitle: true, avatar: true } }
      }
    });
    return NextResponse.json({ success: true, task });
  } catch (error: any) {
    console.error('[API /api/tasks POST error]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status, loggedHours, blockedReason } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Task ID is required' }, { status: 400 });
    }

    const updateData: any = {};
    if (status) {
      updateData.status = status;
      if (status === 'COMPLETED') {
        updateData.completedAt = new Date();
      }
    }
    if (loggedHours !== undefined) updateData.loggedHours = Number(loggedHours);
    if (blockedReason !== undefined) updateData.blockedReason = blockedReason;

    const task = await prisma.task.update({
      where: { id },
      data: updateData,
      include: {
        assignee: { select: { id: true, name: true, jobTitle: true, avatar: true } }
      }
    });

    return NextResponse.json({ success: true, task });
  } catch (error: any) {
    console.error('[API /api/tasks PATCH error]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

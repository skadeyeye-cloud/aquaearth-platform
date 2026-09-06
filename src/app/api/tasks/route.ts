import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const tasks = await prisma.task.findMany({
      orderBy: { dueDate: 'asc' },
      include: {
        assignee: { select: { id: true, name: true, jobTitle: true, avatar: true } }
      }
    });
    return NextResponse.json({ success: true, tasks });
  } catch (error: any) {
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
        status: 'NOT_STARTED',
        priority: body.priority || 'MEDIUM',
        dueDate: new Date(body.dueDate),
        assigneeId: body.assigneeId,
        projectId: body.projectId,
        projectName: body.projectName
      }
    });
    return NextResponse.json({ success: true, task });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

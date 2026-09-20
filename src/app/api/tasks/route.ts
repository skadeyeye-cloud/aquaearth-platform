import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateTaskKpiDistribution } from '@/lib/kpi-engine';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const assigneeId = searchParams.get('assigneeId');
    const assignedById = searchParams.get('assignedById');
    const departmentId = searchParams.get('departmentId');
    const status = searchParams.get('status');

    const where: any = {};
    if (assigneeId) where.assigneeId = assigneeId;
    if (assignedById) where.assignedById = assignedById;
    if (departmentId) where.departmentId = departmentId;
    if (status) where.status = status;

    const tasks = await prisma.task.findMany({
      where,
      orderBy: { dueDate: 'asc' },
      include: {
        assignee: { select: { id: true, name: true, jobTitle: true, avatar: true, departmentId: true } }
      }
    });

    const formatted = tasks.map(t => {
      let assigneeIds: string[] = [t.assigneeId];
      let assigneeNames: string[] = [t.assignee?.name || 'Unassigned'];
      let kpiBreakdown: any = undefined;

      try {
        if (t.assigneeIdsJson) assigneeIds = JSON.parse(t.assigneeIdsJson);
      } catch {}
      try {
        if (t.assigneeNamesJson) assigneeNames = JSON.parse(t.assigneeNamesJson);
      } catch {}
      try {
        if (t.kpiBreakdownJson) kpiBreakdown = JSON.parse(t.kpiBreakdownJson);
      } catch {}

      return {
        id: t.id,
        title: t.title,
        description: t.description || '',
        moduleOrigin: t.moduleOrigin as any,
        status: (t.status === 'COMPLETED' ? 'DONE' : t.status) as any,
        priority: t.priority as any,
        dueDate: t.dueDate instanceof Date ? t.dueDate.toISOString().split('T')[0] : String(t.dueDate),
        completedAt: t.completedAt ? (t.completedAt instanceof Date ? t.completedAt.toISOString().split('T')[0] : String(t.completedAt)) : undefined,
        assigneeId: t.assigneeId,
        assigneeName: t.assignee?.name || 'Unassigned',
        assignedById: t.assignedById || undefined,
        assignedByName: t.assignedByName || undefined,
        managerId: t.managerId || undefined,
        managerName: t.managerName || undefined,
        assignmentType: (t.assignmentType || 'INDIVIDUAL') as any,
        assigneeIds,
        assigneeNames,
        departmentId: t.departmentId || undefined,
        departmentName: t.departmentName || undefined,
        completedById: t.completedById || undefined,
        completedByName: t.completedByName || undefined,
        completionNotes: t.completionNotes || undefined,
        kpiAttributed: t.kpiAttributed,
        kpiBreakdown,
        projectId: t.projectId || undefined,
        projectName: t.projectName || undefined,
        estimatedHours: t.estimatedHours,
        loggedHours: t.loggedHours
      };
    });

    return NextResponse.json({ success: true, tasks: formatted });
  } catch (error: any) {
    console.error('[API /api/tasks GET error]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const assignmentType = body.assignmentType || 'INDIVIDUAL';
    const assigneeIds = Array.isArray(body.assigneeIds) && body.assigneeIds.length > 0 
      ? body.assigneeIds 
      : [body.assigneeId || 'usr-1'];
    const assigneeNames = Array.isArray(body.assigneeNames) ? body.assigneeNames : [];

    const task = await prisma.task.create({
      data: {
        title: body.title,
        description: body.description,
        moduleOrigin: body.moduleOrigin || 'PROJECT',
        status: body.status || 'NOT_STARTED',
        priority: body.priority || 'MEDIUM',
        dueDate: new Date(body.dueDate),
        assigneeId: assigneeIds[0],
        assignedById: body.assignedById || null,
        assignedByName: body.assignedByName || null,
        managerId: body.managerId || null,
        managerName: body.managerName || null,
        assignmentType,
        assigneeIdsJson: JSON.stringify(assigneeIds),
        assigneeNamesJson: assigneeNames.length > 0 ? JSON.stringify(assigneeNames) : null,
        departmentId: body.departmentId || null,
        departmentName: body.departmentName || null,
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
    const { 
      id, 
      status, 
      loggedHours, 
      blockedReason, 
      completedById, 
      completedByName, 
      completionNotes 
    } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Task ID is required' }, { status: 400 });
    }

    const existingTask = await prisma.task.findUnique({
      where: { id },
      include: {
        assignee: { select: { id: true, name: true, managerId: true, departmentId: true } }
      }
    });

    if (!existingTask) {
      return NextResponse.json({ success: false, error: 'Task not found' }, { status: 404 });
    }

    const updateData: any = {};
    const isMarkingDone = status === 'DONE' || status === 'COMPLETED';

    if (status) {
      updateData.status = isMarkingDone ? 'DONE' : status;
    }
    if (loggedHours !== undefined) updateData.loggedHours = Number(loggedHours);
    if (blockedReason !== undefined) updateData.blockedReason = blockedReason;

    // Handle Task Completion & KPI Attribution
    let kpiBreakdown: any = undefined;

    if (isMarkingDone && !existingTask.kpiAttributed) {
      const now = new Date();
      updateData.completedAt = now;
      updateData.completedById = completedById || existingTask.assigneeId;
      updateData.completedByName = completedByName || null;
      updateData.completionNotes = completionNotes || null;
      updateData.kpiAttributed = true;

      const completionDateStr = now.toISOString().split('T')[0];
      const dueDateStr = existingTask.dueDate.toISOString().split('T')[0];
      const kpiDist = calculateTaskKpiDistribution(dueDateStr, completionDateStr, existingTask.assignmentType as any);

      const monthYear = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      const isDeptTask = existingTask.assignmentType === 'DEPARTMENT' || !!existingTask.departmentId;

      if (isDeptTask) {
        // Department Task KPI Attribution
        const actualCompleterId = completedById || existingTask.assigneeId;
        const actualCompleterName = completedByName || 'Department Officer';
        const deptId = existingTask.departmentId;

        // 1. Completing officer gets highest positive boost
        await prisma.kpiLog.create({
          data: {
            userId: actualCompleterId,
            eventType: 'TASK_COMPLETED_LEAD',
            points: kpiDist.completerPoints,
            workItemId: existingTask.id,
            workItemType: 'PROJECT_TASK',
            description: `Lead Execution: Completed department deliverable "${existingTask.title}"`
          }
        });

        await prisma.kpiScore.upsert({
          where: { id: `kpi-${actualCompleterId}-${monthYear}` },
          create: {
            id: `kpi-${actualCompleterId}-${monthYear}`,
            userId: actualCompleterId,
            monthYear,
            totalScore: kpiDist.completerPoints,
            completedCount: 1,
            onTimeCount: kpiDist.isOnTime ? 1 : 0,
            overdueCount: kpiDist.isOnTime ? 0 : 1
          },
          update: {
            totalScore: { increment: kpiDist.completerPoints },
            completedCount: { increment: 1 },
            onTimeCount: { increment: kpiDist.isOnTime ? 1 : 0 },
            overdueCount: { increment: kpiDist.isOnTime ? 0 : 1 }
          }
        });

        // 2. Department members get collective boost
        if (deptId) {
          const deptUsers = await prisma.user.findMany({
            where: { departmentId: deptId, id: { not: actualCompleterId } },
            select: { id: true, name: true }
          });

          for (const u of deptUsers) {
            await prisma.kpiLog.create({
              data: {
                userId: u.id,
                eventType: 'TASK_COMPLETED_DEPT_TEAM',
                points: kpiDist.departmentMemberPoints,
                workItemId: existingTask.id,
                workItemType: 'PROJECT_TASK',
                description: `Department Success: "${existingTask.title}" delivered by ${actualCompleterName}`
              }
            });

            await prisma.kpiScore.upsert({
              where: { id: `kpi-${u.id}-${monthYear}` },
              create: {
                id: `kpi-${u.id}-${monthYear}`,
                userId: u.id,
                monthYear,
                totalScore: kpiDist.departmentMemberPoints,
                completedCount: 1,
                onTimeCount: kpiDist.isOnTime ? 1 : 0,
                overdueCount: kpiDist.isOnTime ? 0 : 1
              },
              update: {
                totalScore: { increment: kpiDist.departmentMemberPoints },
                completedCount: { increment: 1 },
                onTimeCount: { increment: kpiDist.isOnTime ? 1 : 0 },
                overdueCount: { increment: kpiDist.isOnTime ? 0 : 1 }
              }
            });
          }
        }

        // 3. Line Manager / Dept Head gets oversight points
        const managerId = existingTask.assignedById || existingTask.managerId || existingTask.assignee?.managerId;
        if (managerId && managerId !== actualCompleterId) {
          await prisma.kpiLog.create({
            data: {
              userId: managerId,
              eventType: 'TASK_COMPLETED_MANAGER',
              points: kpiDist.departmentHeadPoints,
              workItemId: existingTask.id,
              workItemType: 'PROJECT_TASK',
              description: `Leadership Oversight: Supervised department delivery "${existingTask.title}"`
            }
          });

          await prisma.kpiScore.upsert({
            where: { id: `kpi-${managerId}-${monthYear}` },
            create: {
              id: `kpi-${managerId}-${monthYear}`,
              userId: managerId,
              monthYear,
              totalScore: kpiDist.departmentHeadPoints,
              completedCount: 1,
              onTimeCount: kpiDist.isOnTime ? 1 : 0,
              overdueCount: kpiDist.isOnTime ? 0 : 1
            },
            update: {
              totalScore: { increment: kpiDist.departmentHeadPoints },
              completedCount: { increment: 1 },
              onTimeCount: { increment: kpiDist.isOnTime ? 1 : 0 },
              overdueCount: { increment: kpiDist.isOnTime ? 0 : 1 }
            }
          });
        }

        kpiBreakdown = {
          completerPoints: kpiDist.completerPoints,
          departmentPoints: kpiDist.departmentMemberPoints,
          managerPoints: kpiDist.departmentHeadPoints,
          completerName: actualCompleterName,
          isOnTime: kpiDist.isOnTime
        };
      } else {
        // Individual Task KPI Attribution
        const assigneeId = existingTask.assigneeId;

        // 1. Assignee gets major points
        await prisma.kpiLog.create({
          data: {
            userId: assigneeId,
            eventType: 'TASK_COMPLETED_ASSIGNEE',
            points: kpiDist.assigneePoints,
            workItemId: existingTask.id,
            workItemType: 'PROJECT_TASK',
            description: `Deliverable Execution: Completed assigned task "${existingTask.title}"`
          }
        });

        await prisma.kpiScore.upsert({
          where: { id: `kpi-${assigneeId}-${monthYear}` },
          create: {
            id: `kpi-${assigneeId}-${monthYear}`,
            userId: assigneeId,
            monthYear,
            totalScore: kpiDist.assigneePoints,
            completedCount: 1,
            onTimeCount: kpiDist.isOnTime ? 1 : 0,
            overdueCount: kpiDist.isOnTime ? 0 : 1
          },
          update: {
            totalScore: { increment: kpiDist.assigneePoints },
            completedCount: { increment: 1 },
            onTimeCount: { increment: kpiDist.isOnTime ? 1 : 0 },
            overdueCount: { increment: kpiDist.isOnTime ? 0 : 1 }
          }
        });

        // 2. Line Manager / Assigner gets oversight points
        const managerId = existingTask.assignedById || existingTask.managerId || existingTask.assignee?.managerId;
        if (managerId && managerId !== assigneeId) {
          await prisma.kpiLog.create({
            data: {
              userId: managerId,
              eventType: 'TASK_COMPLETED_MANAGER',
              points: kpiDist.managerPoints,
              workItemId: existingTask.id,
              workItemType: 'PROJECT_TASK',
              description: `Managerial Supervision: Supervised delivery of "${existingTask.title}"`
            }
          });

          await prisma.kpiScore.upsert({
            where: { id: `kpi-${managerId}-${monthYear}` },
            create: {
              id: `kpi-${managerId}-${monthYear}`,
              userId: managerId,
              monthYear,
              totalScore: kpiDist.managerPoints,
              completedCount: 1,
              onTimeCount: kpiDist.isOnTime ? 1 : 0,
              overdueCount: kpiDist.isOnTime ? 0 : 1
            },
            update: {
              totalScore: { increment: kpiDist.managerPoints },
              completedCount: { increment: 1 },
              onTimeCount: { increment: kpiDist.isOnTime ? 1 : 0 },
              overdueCount: { increment: kpiDist.isOnTime ? 0 : 1 }
            }
          });
        }

        kpiBreakdown = {
          assigneePoints: kpiDist.assigneePoints,
          managerPoints: kpiDist.managerPoints,
          isOnTime: kpiDist.isOnTime
        };
      }

      updateData.kpiBreakdownJson = JSON.stringify(kpiBreakdown);
    }

    const task = await prisma.task.update({
      where: { id },
      data: updateData,
      include: {
        assignee: { select: { id: true, name: true, jobTitle: true, avatar: true } }
      }
    });

    return NextResponse.json({ success: true, task, kpiBreakdown });
  } catch (error: any) {
    console.error('[API /api/tasks PATCH error]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}


import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const requesterId = searchParams.get('requesterId');

    const where: any = {};
    if (category) where.category = category;
    if (requesterId) where.requesterId = requesterId;

    const tickets = await prisma.supportRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        requester: { select: { id: true, name: true, jobTitle: true, avatar: true } },
        assignedTo: { select: { id: true, name: true, jobTitle: true, avatar: true } }
      }
    });

    const formatted = tickets.map(t => ({
      id: t.id,
      ticketNumber: t.ticketNumber,
      requesterId: t.requesterId,
      requesterName: t.requester?.name || 'Staff Member',
      category: t.category,
      subject: t.subject,
      description: t.description,
      priority: t.priority,
      status: t.status,
      assignedToId: t.assignedToId,
      assignedToName: t.assignedTo?.name || 'Unassigned',
      deliverableUrl: t.deliverableUrl,
      createdAt: t.createdAt.toISOString(),
      resolvedAt: t.resolvedAt?.toISOString()
    }));

    return NextResponse.json({ success: true, tickets: formatted });
  } catch (error: any) {
    console.error('[API /api/support GET error]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { requesterId, category, subject, description, priority } = body;

    if (!requesterId || !subject || !description) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const count = await prisma.supportRequest.count();
    const ticketNumber = `TKT-${new Date().getFullYear()}-${String(count + 1).padStart(3, '0')}`;

    const newTicket = await prisma.supportRequest.create({
      data: {
        ticketNumber,
        requesterId,
        category: category || 'GENERAL',
        subject,
        description,
        priority: priority || 'MEDIUM',
        status: 'SUBMITTED'
      },
      include: {
        requester: { select: { id: true, name: true } }
      }
    });

    return NextResponse.json({ success: true, ticket: newTicket });
  } catch (error: any) {
    console.error('[API /api/support POST error]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status, assignedToId, deliverableUrl } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Ticket ID is required' }, { status: 400 });
    }

    const updateData: any = {};
    if (status) {
      updateData.status = status;
      if (status === 'RESOLVED' || status === 'COMPLETED') {
        updateData.resolvedAt = new Date();
      }
    }
    if (assignedToId !== undefined) updateData.assignedToId = assignedToId;
    if (deliverableUrl !== undefined) updateData.deliverableUrl = deliverableUrl;

    const updated = await prisma.supportRequest.update({
      where: { id },
      data: updateData,
      include: {
        requester: { select: { id: true, name: true } },
        assignedTo: { select: { id: true, name: true } }
      }
    });

    return NextResponse.json({ success: true, ticket: updated });
  } catch (error: any) {
    console.error('[API /api/support PATCH error]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

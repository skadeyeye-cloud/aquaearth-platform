import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const folders = await prisma.documentFolder.findMany({ orderBy: { createdAt: 'desc' } });
    return NextResponse.json({ success: true, folders });
  } catch (error: any) {
    console.error('[API /api/document-folders GET error]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const folder = await prisma.documentFolder.create({
      data: {
        name: body.name,
        department: body.department,
        description: body.description,
        createdById: body.createdById,
        createdByName: body.createdByName,
        isRestricted: Boolean(body.isRestricted),
        itemCount: 0
      }
    });

    return NextResponse.json({ success: true, folder });
  } catch (error: any) {
    console.error('[API /api/document-folders POST error]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

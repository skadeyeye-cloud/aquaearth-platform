import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

function formatDoc(d: any) {
  return {
    ...d,
    uploadedAt: d.uploadedAt.toISOString().replace('T', ' ').substring(0, 16)
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId');
    const qaStatus = searchParams.get('qaStatus');

    const where: any = {};
    if (projectId) where.projectId = projectId;
    if (qaStatus) where.qaStatus = qaStatus;

    const documents = await prisma.documentItem.findMany({
      where,
      orderBy: { uploadedAt: 'desc' }
    });

    return NextResponse.json({ success: true, documents: documents.map(formatDoc) });
  } catch (error: any) {
    console.error('[API /api/documents GET error]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const count = await prisma.documentItem.count();
    const documentNumber = body.documentNumber || `DOC-2026-${String(100 + count).padStart(3, '0')}`;

    const document = await prisma.documentItem.create({
      data: {
        title: body.title,
        documentNumber,
        projectId: body.projectId || null,
        projectName: body.projectName || null,
        category: body.category,
        version: body.version,
        fileSizeMb: Number(body.fileSizeMb) || 0,
        authorName: body.authorName,
        qaStatus: body.qaStatus || 'DRAFT_WATERMARKED',
        storageTier: body.storageTier || 'ACTIVE_VAULT',
        downloadUrl: body.downloadUrl
      }
    });

    return NextResponse.json({ success: true, document: formatDoc(document) });
  } catch (error: any) {
    console.error('[API /api/documents POST error]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: 'Document ID is required' }, { status: 400 });
    }

    const updateData: any = {};
    const allowedFields = ['qaStatus', 'version', 'storageTier'];
    for (const field of allowedFields) {
      if (updates[field] !== undefined) updateData[field] = updates[field];
    }

    const document = await prisma.documentItem.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json({ success: true, document: formatDoc(document) });
  } catch (error: any) {
    console.error('[API /api/documents PATCH error]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

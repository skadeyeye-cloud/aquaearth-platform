import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const rawUrl = process.env.DATABASE_URL || '';
    let host = 'none';
    let db = 'none';
    let isPooler = false;

    if (rawUrl) {
      try {
        const parsed = new URL(rawUrl);
        host = parsed.host;
        db = parsed.pathname.replace('/', '');
        isPooler = host.includes('-pooler');
      } catch {
        host = 'invalid_url_format';
      }
    }

    let tables: string[] = [];
    let userCount = -1;
    let dbError: string | null = null;

    try {
      const tableRows: any = await prisma.$queryRaw`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema='public'
        ORDER BY table_name;
      `;
      tables = tableRows.map((r: any) => r.table_name);

      if (tables.includes('User')) {
        userCount = await prisma.user.count();
      }
    } catch (err: any) {
      dbError = err.message;
    }

    return NextResponse.json({
      status: dbError ? 'database_error' : 'connected',
      neon: {
        host,
        database: db,
        isPooler,
        hasDirectUrl: !!process.env.DIRECT_URL,
      },
      schema: {
        tableCount: tables.length,
        tables,
        userCount,
      },
      error: dbError,
    });
  } catch (error: any) {
    return NextResponse.json({
      status: 'server_error',
      error: error.message,
    }, { status: 500 });
  }
}

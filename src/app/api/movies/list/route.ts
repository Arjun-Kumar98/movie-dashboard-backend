import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { authenticateRequest } from '@/middleware/authMiddleware';
import { setCorsHeaders } from '@/middleware/cors';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const auth = authenticateRequest(req);
  if (!auth.authorized) return auth.response;

  const { searchParams } = new URL(req.url);
  const userId = parseInt(searchParams.get('userId') || '');
  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = 8;

  if (!userId) {
    return NextResponse.json({ error: 'User ID required' }, { status: 400, headers: setCorsHeaders() });
  }

  const movies = await prisma.movie.findMany({
    where: { userId },
    skip: (page - 1) * pageSize,
    take: pageSize,
    orderBy: { id: 'desc' },
  });

  const totalCount = await prisma.movie.count({ where: { userId } });

  return new NextResponse(
    JSON.stringify({
      movies,
      currentPage: page,
      totalPages: Math.ceil(totalCount / pageSize),
      totalCount,
    }),
    { status: 200, headers: setCorsHeaders() }
  );
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: setCorsHeaders() });
}

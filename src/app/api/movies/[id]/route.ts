import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { authenticateRequest } from '@/middleware/authMiddleware';
import { setCorsHeaders } from '@/middleware/cors';

const prisma = new PrismaClient();

export async function GET(req: NextRequest, context: { params: { id: string } }) {
  const auth = authenticateRequest(req);
  if (!auth.authorized) return auth.response;

  const movieId = parseInt(context.params.id);

  if (isNaN(movieId)) {
    return NextResponse.json({ error: 'Invalid movie ID' }, {
      status: 400,
      headers: setCorsHeaders(),
    });
  }

  try {
    const movie = await prisma.movie.findUnique({
      where: { id: movieId },
    });

    if (!movie) {
      return NextResponse.json({ error: 'Movie not found' }, {
        status: 404,
        headers: setCorsHeaders(),
      });
    }

    return new NextResponse(JSON.stringify({ movie }), {
      status: 200,
      headers: setCorsHeaders(),
    });

  } catch (err) {
    console.error('Fetch movie by ID failed:', err);
    return NextResponse.json({ error: 'Server error' }, {
      status: 500,
      headers: setCorsHeaders(),
    });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: setCorsHeaders() });
}

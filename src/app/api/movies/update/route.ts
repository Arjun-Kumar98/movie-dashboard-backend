// app/api/movies/update/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { uploadToS3 } from '@/utils/s3Uploader';
import { authenticateRequest } from '@/middleware/authMiddleware';
import { setCorsHeaders } from '@/middleware/cors';

const prisma = new PrismaClient();

export async function PUT(req: NextRequest) {

    const auth = authenticateRequest(req);
    if (!auth.authorized) return auth.response;
  try {
    const formData = await req.formData();

    const movieId = parseInt(formData.get('movieId') as string);
    const title = formData.get('title') as string;
    const publishYear = parseInt(formData.get('publishYear') as string);
    const userId = parseInt(formData.get('userId') as string);
    const file = formData.get('image') as File | null;

    if (!movieId || !title || !publishYear || !userId) {
      return NextResponse.json({ error: 'All required fields must be filled' }, { status: 400, headers:setCorsHeaders() });
    }

    let updatedData: any = {
      title,
      publishYear,
      userId,
    };

   
    if (file && file.size > 0) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const imageUrl = await uploadToS3(buffer, file.name, file.type);
      updatedData.posterUrl = imageUrl;
    }

    const updatedMovie = await prisma.movie.update({
      where: { id: movieId },
      data: updatedData,
    });

    return NextResponse.json({ message: 'Movie updated successfully', movie: updatedMovie }, { status: 200 , headers:setCorsHeaders()});
  } catch (error) {
    console.error('Movie update error:', error);
    return NextResponse.json({ error: 'Failed to update movie' }, { status: 500 , headers:setCorsHeaders()});
  }
}
export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: setCorsHeaders() });
}

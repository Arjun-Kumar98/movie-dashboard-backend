import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { uploadToS3 } from '@/utils/s3Uploader';
import { authenticateRequest } from '@/middleware/authMiddleware';
import { setCorsHeaders } from '@/middleware/cors';

export const runtime = 'nodejs'; // Ensures correct execution environment for Buffer + AWS SDK

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {


  const auth = authenticateRequest(req);
  if (!auth.authorized) {

    return auth.response;
  }

  try {

    const formData = await req.formData();
    const title = formData.get('title') as string;
    const publishYear = parseInt(formData.get('publishYear') as string);
    const userId = parseInt(formData.get('userId') as string);
    const file = formData.get('image') as File;




    if (!title || !publishYear || !userId || !file) {
 
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400, headers: setCorsHeaders() }
      );
    }


    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);



    const imageUrl = await uploadToS3(buffer, file.name, file.type);
    console.log('✅ Image uploaded to S3:', imageUrl);


    const movie = await prisma.movie.create({
      data: {
        title,
        publishYear,
        posterUrl: imageUrl,
        userId,
      },
    });


    return NextResponse.json(
      { message: 'Movie uploaded successfully', movie },
      { status: 201, headers: setCorsHeaders() }
    );
  } catch (error) {

    return NextResponse.json(
      { error: 'Failed to upload movie' },
      { status: 500, headers: setCorsHeaders() }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: setCorsHeaders() });
}


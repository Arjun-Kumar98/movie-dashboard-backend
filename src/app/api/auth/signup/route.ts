import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { setCorsHeaders } from '@/middleware/cors';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400, headers: setCorsHeaders() }
      );
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 409, headers: setCorsHeaders() });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.create({
      data: { email, password: hashedPassword },
    });

    return NextResponse.json({ message: 'User created successfully' }, { status: 201, headers: setCorsHeaders() });
  } catch (error) {
    return NextResponse.json({ error: 'Signup error' }, { status: 500, headers: setCorsHeaders() });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: setCorsHeaders() });
}

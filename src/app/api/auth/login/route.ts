import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { setCorsHeaders } from '@/middleware/cors';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400, headers: setCorsHeaders() });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401, headers: setCorsHeaders() });
    }

    const token = jwt.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET!, { expiresIn: '7d' });

    return NextResponse.json(
      { message: 'Login successful', token, userId: user.id },
      { status: 200, headers: setCorsHeaders() }
    );
  } catch (error) {
    return NextResponse.json({ error: 'Login error' }, { status: 500, headers: setCorsHeaders() });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: setCorsHeaders() });
}

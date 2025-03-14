import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export function authenticateRequest(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.split(' ')[1];

  if (!token) {
    return {
      authorized: false,
      response: NextResponse.json({ error: 'Unauthorized: Token missing' }, { status: 401 }),
    };
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    return {
      authorized: true,
      user: decoded,
    };
  } catch (err) {
    return {
      authorized: false,
      response: NextResponse.json({ error: 'Unauthorized: Invalid token' }, { status: 403 }),
    };
  }
}

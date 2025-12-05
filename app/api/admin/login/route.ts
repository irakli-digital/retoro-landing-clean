import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const ADMIN_EMAIL = 'irakli.digital@gmail.com';
const ADMIN_PASSWORD = 'Digitalhub!986';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      // Create session token (simple approach - in production use JWT or proper session)
      const sessionToken = Buffer.from(`${email}:${Date.now()}`).toString('base64');
      
      // Set cookie using Response
      const response = NextResponse.json({ success: true });
      response.cookies.set('admin_session', sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      });

      return response;
    } else {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE() {
  // Logout - clear session
  const response = NextResponse.json({ success: true });
  response.cookies.delete('admin_session');
  
  return response;
}


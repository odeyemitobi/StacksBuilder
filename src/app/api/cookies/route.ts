import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * Server-side cookie management API for StacksBuilder
 * Provides secure HTTP-only cookie operations
 */

export async function POST(request: NextRequest) {
  try {
    const { action, name, value, options } = await request.json();

    const cookieStore = await cookies();

    switch (action) {
      case 'set':
        cookieStore.set(name, value, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: options?.expires ? options.expires * 24 * 60 * 60 : 30 * 24 * 60 * 60, // Default 30 days
          path: '/',
          ...options,
        });
        return NextResponse.json({ success: true });

      case 'delete':
        cookieStore.delete(name);
        return NextResponse.json({ success: true });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Cookie API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name');

    if (!name) {
      return NextResponse.json({ error: 'Cookie name required' }, { status: 400 });
    }

    const cookieStore = await cookies();
    const cookie = cookieStore.get(name);

    return NextResponse.json({
      value: cookie?.value || null,
      exists: !!cookie,
    });
  } catch (error) {
    console.error('Cookie API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/packages/lib/prisma/client';
import { setAuthCookies } from '@/packages/lib/helpers/cookies';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json({ error: 'No session ID provided' }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    const userId = session.metadata?.userId;

    if (!userId) {
      return NextResponse.json({ error: 'No user ID found in session' }, { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    await setAuthCookies(user);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error handling Stripe success:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

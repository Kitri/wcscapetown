import { NextRequest, NextResponse } from 'next/server';
import { logWeekenderEvent } from '@/lib/redis';
import { createRegistration, findOrCreateMember, hasWeekenderRegistration } from '@/lib/db';
import { logApiResponse, logError, logInfo, getNextOrderNumber } from '@/lib/blobLogger';

// Price tiers in cents
const PRICES = {
  single: {
    now: 160000,      // R1600
    now_now: 180000,  // R1800
    just_now: 220000, // R2200
    ai_tog: 240000,   // R2400
  },
  couple: {
    now: 320000,      // R3200
    now_now: 360000,  // R3600
    just_now: 440000, // R4400
    ai_tog: 480000,   // R4800
  },
};

// Price tier display names
const TIER_NAMES: Record<string, string> = {
  now: 'Now',
  now_now: 'Now Now',
  just_now: 'Just Now',
  ai_tog: 'Ai Tog',
};

interface SingleRegistration {
  type: 'single';
  name: string;
  surname: string;
  email: string;
  role: 'Lead' | 'Follow';
  level: 1 | 2;
}

interface CoupleRegistration {
  type: 'couple';
  email: string;
  leader: {
    name: string;
    surname: string;
    level: 1 | 2;
  };
  follower: {
    name: string;
    surname: string;
    level: 1 | 2;
  };
}

type RegistrationData = SingleRegistration | CoupleRegistration;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, registration, priceTier } = body as {
      sessionId: string;
      registration: RegistrationData;
      priceTier: 'now' | 'now_now' | 'just_now' | 'ai_tog';
    };

    // Validation
    if (!sessionId || typeof sessionId !== 'string') {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    if (!registration || !priceTier) {
      return NextResponse.json({ error: 'Registration data and price tier are required' }, { status: 400 });
    }

    // Check for required environment variables
    if (!process.env.YOCO_SECRET_KEY || !process.env.NEXT_PUBLIC_BASE_URL) {
      console.error('Missing required environment variables');
      return NextResponse.json({ error: 'Payment system not configured' }, { status: 500 });
    }

    const isSingle = registration.type === 'single';
    const amountCents = isSingle ? PRICES.single[priceTier] : PRICES.couple[priceTier];

    // Check if any person already has a weekender registration (check registrations table)
    if (isSingle) {
      const alreadyRegistered = await hasWeekenderRegistration(registration.name, registration.surname);
      if (alreadyRegistered) {
        return NextResponse.json({
          error: 'already_registered',
          message: `${registration.name} ${registration.surname} is already registered for the weekender. Please contact weekender@wcscapetown.co.za if this is incorrect.`
        }, { status: 409 });
      }
    } else {
      // Check both in parallel for speed
      const [leaderRegistered, followerRegistered] = await Promise.all([
        hasWeekenderRegistration(registration.leader.name, registration.leader.surname),
        hasWeekenderRegistration(registration.follower.name, registration.follower.surname),
      ]);
      
      if (leaderRegistered || followerRegistered) {
        const name = leaderRegistered 
          ? `${registration.leader.name} ${registration.leader.surname}` 
          : `${registration.follower.name} ${registration.follower.surname}`;
        return NextResponse.json({
          error: 'already_registered',
          message: `${name} is already registered for the weekender. Please contact weekender@wcscapetown.co.za if this is incorrect.`
        }, { status: 409 });
      }
    }

    // Find or create member(s) and create registration(s)
    let primaryMemberId: number;
    
    if (isSingle) {
      // Find existing member or create new one
      primaryMemberId = await findOrCreateMember({
        name: registration.name,
        surname: registration.surname,
        role: registration.role,
        level: registration.level,
      });

      await createRegistration({
        email: registration.email,
        member_id: primaryMemberId,
        role: registration.role,
        level: registration.level,
        booking_session_id: sessionId,
        pass_type: 'weekend',
        price_tier: priceTier,
        amount_cents: amountCents,
        payment_status: 'pending',
        registration_type: 'single',
      });
    } else {
      // Find or create both members in parallel
      const [leaderId, followerId] = await Promise.all([
        findOrCreateMember({
          name: registration.leader.name,
          surname: registration.leader.surname,
          role: 'Lead',
          level: registration.leader.level,
        }),
        findOrCreateMember({
          name: registration.follower.name,
          surname: registration.follower.surname,
          role: 'Follow',
          level: registration.follower.level,
        }),
      ]);
      
      primaryMemberId = leaderId;

      // Create both registrations in parallel
      await Promise.all([
        createRegistration({
          email: registration.email,
          member_id: leaderId,
          role: 'Lead',
          level: registration.leader.level,
          booking_session_id: sessionId,
          pass_type: 'weekend',
          price_tier: priceTier,
          amount_cents: amountCents / 2,
          payment_status: 'pending',
          registration_type: 'couple',
        }),
        createRegistration({
          email: registration.email,
          member_id: followerId,
          role: 'Follow',
          level: registration.follower.level,
          booking_session_id: sessionId,
          pass_type: 'weekend',
          price_tier: priceTier,
          amount_cents: amountCents / 2,
          payment_status: 'pending',
          registration_type: 'couple',
        }),
      ]);
    }

    // Log payment in progress (non-blocking)
    logWeekenderEvent(sessionId, 'payment_in_progress', {
      registrationType: registration.type,
      amountCents,
      priceTier,
    }).catch(console.error);

    // Generate order ID
    const orderId = await getNextOrderNumber();
    const customerEmail = isSingle ? registration.email : registration.email;
    const quantity = isSingle ? 1 : 2;
    const passDisplayName = `Weekender Full Pass`;
    const passDescription = `Weekender Full Pass - ${TIER_NAMES[priceTier]}`;

    // Build Yoco request body per spec
    const yocoRequestBody = {
      amount: amountCents,
      currency: 'ZAR',
      successUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/bookweekender/success?ref=${orderId}&session=${sessionId}`,
      cancelUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/bookweekender/cancelled?session=${sessionId}`,
      failureUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/bookweekender/failed?session=${sessionId}`,
      metadata: {
        orderId,
        customerId: `MEMBER-${primaryMemberId}`,
        customerEmail,
        source: 'web_checkout',
      },
      lineItems: [
        {
          displayName: passDisplayName,
          quantity,
          pricingDetails: {
            price: isSingle ? amountCents : amountCents / 2, // Price per person
          },
          description: passDescription,
        },
      ],
    };

    // Log the request (non-blocking)
    logInfo('weekender_registration', 'Creating Yoco checkout', {
      sessionId,
      orderId,
      registrationType: registration.type,
      amountCents,
    }).catch(console.error);

    const yocoResponse = await fetch('https://payments.yoco.com/api/checkouts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.YOCO_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(yocoRequestBody),
    });

    const yocoData = await yocoResponse.json();

    // Log the API response (non-blocking)
    logApiResponse(
      'yoco',
      'https://payments.yoco.com/api/checkouts',
      yocoRequestBody,
      yocoResponse.status,
      yocoData
    ).catch(console.error);

    if (!yocoResponse.ok) {
      logError('weekender_registration', 'Yoco API error', {
        sessionId,
        orderId,
        status: yocoResponse.status,
        response: yocoData,
      }).catch(console.error);
      return NextResponse.json(
        { error: 'Failed to create payment. Please try again.' },
        { status: 500 }
      );
    }

    logInfo('weekender_registration', 'Payment checkout created', {
      sessionId,
      orderId,
      checkoutId: yocoData.id,
    }).catch(console.error);

    return NextResponse.json({
      success: true,
      checkoutUrl: yocoData.redirectUrl,
      reference: orderId,
    });

  } catch (error) {
    console.error('Error submitting registration:', error);
    return NextResponse.json(
      { error: 'Failed to submit registration. Please try again.' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { logWeekenderEvent, setOrderMemberIds } from '@/lib/redis';
import { 
  createRegistration, 
  findOrCreateMember, 
  getExistingRegistration,
  updateRegistrationForRetry,
} from '@/lib/db';
import { logApiResponse, logError, logInfo, getNextOrderNumber } from '@/lib/blobLogger';

// Price tiers in cents
const PRICES: Record<string, Record<string, number>> = {
  single: {
    'now': 160000,      // R1600
    'now-now': 180000,  // R1800
    'just-now': 220000, // R2200
    'ai-tog': 240000,   // R2400
  },
  couple: {
    'now': 320000,      // R3200
    'now-now': 360000,  // R3600
    'just-now': 440000, // R4400
    'ai-tog': 480000,   // R4800
  },
};

// Price tier display names
const TIER_NAMES: Record<string, string> = {
  'now': 'Now',
  'now-now': 'Now Now',
  'just-now': 'Just Now',
  'ai-tog': 'Ai Tog',
};

interface SingleRegistration {
  type: 'single';
  name: string;
  surname: string;
  email: string;
  role: 'L' | 'F';
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
      priceTier: 'now' | 'now-now' | 'just-now' | 'ai-tog';
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

    // Generate order ID first (needed for db and Redis)
    const orderId = await getNextOrderNumber();

    let primaryMemberId: number;
    let allMemberIds: number[] = [];
    
    if (isSingle) {
      // Step 1: Find or create member
      primaryMemberId = await findOrCreateMember({
        name: registration.name,
        surname: registration.surname,
        role: registration.role,
        level: registration.level,
      });

      // Step 2: Check existing registration for this member
      const existingReg = await getExistingRegistration(primaryMemberId);
      
      if (existingReg) {
        if (existingReg.registrationStatus === 'complete') {
          // Already fully registered - block
          return NextResponse.json({
            error: 'already_registered',
            message: `${registration.name} ${registration.surname} is already registered for the weekender. Please contact weekender@wcscapetown.co.za if this is incorrect.`
          }, { status: 409 });
        } else {
          // Pending or expired - update existing record (never create new)
          await updateRegistrationForRetry(primaryMemberId, sessionId, orderId, registration.email, priceTier, amountCents);
        }
      } else {
        // No existing registration - create new
        await createRegistration({
          email: registration.email,
          member_id: primaryMemberId,
          role: registration.role,
          level: registration.level,
          booking_session_id: sessionId,
          order_id: orderId,
          pass_type: 'weekend',
          pricing_tier: priceTier,
          amount_cents: amountCents,
          payment_status: 'pending',
          registration_status: 'pending',
          registration_type: 'single',
        });
      }
      allMemberIds = [primaryMemberId];
    } else {
      // Couple registration
      // Step 1: Find or create both members
      const [leaderId, followerId] = await Promise.all([
        findOrCreateMember({
          name: registration.leader.name,
          surname: registration.leader.surname,
          role: 'L',
          level: registration.leader.level,
        }),
        findOrCreateMember({
          name: registration.follower.name,
          surname: registration.follower.surname,
          role: 'F',
          level: registration.follower.level,
        }),
      ]);
      
      primaryMemberId = leaderId;

      // Step 2: Check existing registrations for both members
      const [leaderReg, followerReg] = await Promise.all([
        getExistingRegistration(leaderId),
        getExistingRegistration(followerId),
      ]);
      
      // Check if either is already complete
      if (leaderReg?.registrationStatus === 'complete') {
        return NextResponse.json({
          error: 'already_registered',
          message: `${registration.leader.name} ${registration.leader.surname} is already registered for the weekender. Please contact weekender@wcscapetown.co.za if this is incorrect.`
        }, { status: 409 });
      }
      if (followerReg?.registrationStatus === 'complete') {
        return NextResponse.json({
          error: 'already_registered',
          message: `${registration.follower.name} ${registration.follower.surname} is already registered for the weekender. Please contact weekender@wcscapetown.co.za if this is incorrect.`
        }, { status: 409 });
      }
      
      // Handle leader registration
      if (leaderReg) {
        // Existing record (pending or expired) - update it
        await updateRegistrationForRetry(leaderId, sessionId, orderId, registration.email, priceTier, amountCents / 2);
      } else {
        await createRegistration({
          email: registration.email,
          member_id: leaderId,
          role: 'L',
          level: registration.leader.level,
          booking_session_id: sessionId,
          order_id: orderId,
          pass_type: 'weekend',
          pricing_tier: priceTier,
          amount_cents: amountCents / 2,
          payment_status: 'pending',
          registration_status: 'pending',
          registration_type: 'couple',
        });
      }
      
      // Handle follower registration
      if (followerReg) {
        // Existing record (pending or expired) - update it
        await updateRegistrationForRetry(followerId, sessionId, orderId, registration.email, priceTier, amountCents / 2);
      } else {
        await createRegistration({
          email: registration.email,
          member_id: followerId,
          role: 'F',
          level: registration.follower.level,
          booking_session_id: sessionId,
          order_id: orderId,
          pass_type: 'weekend',
          pricing_tier: priceTier,
          amount_cents: amountCents / 2,
          payment_status: 'pending',
          registration_status: 'pending',
          registration_type: 'couple',
        });
      }
      allMemberIds = [leaderId, followerId];
    }

    // Store member_ids in Redis keyed by orderId (unique per registration attempt)
    await setOrderMemberIds(orderId, allMemberIds);

    // Log payment in progress (non-blocking)
    logWeekenderEvent(sessionId, 'payment_in_progress', {
      registrationType: registration.type,
      amountCents,
      priceTier,
      orderId,
      memberIds: allMemberIds,
    }).catch(console.error);
    const customerEmail = isSingle ? registration.email : registration.email;
    const quantity = isSingle ? 1 : 2;
    const passDisplayName = `Weekender Full Pass`;
    const passDescription = `Weekender Full Pass - ${TIER_NAMES[priceTier]}`;

    // Calculate checkout expiry (5 minutes from now)
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    // Build Yoco request body per spec
    const yocoRequestBody = {
      amount: amountCents,
      currency: 'ZAR',
      expiresAt,
      successUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/bookweekender/success?ref=${orderId}&session=${sessionId}`,
      cancelUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/bookweekender/cancelled?ref=${orderId}&session=${sessionId}`,
      failureUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/bookweekender/failed?ref=${orderId}&session=${sessionId}`,
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

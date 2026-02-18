import { NextRequest, NextResponse } from 'next/server';
import { logWeekenderEvent, setOrderMemberIds } from '@/lib/redis';
import { 
  createRegistration, 
  findOrCreateMember, 
  getExistingRegistration,
  updateRegistrationForRetry,
  createDayPassDetails,
  createCoupleRegistration,
  getRegistrationIdByMemberId,
} from '@/lib/db';
import { logApiResponse, logError, logInfo, getNextOrderNumber } from '@/lib/blobLogger';

// Pass type pricing in cents
type PassType = 'weekend' | 'day' | 'party';
type PriceTier = 'now' | 'now-now' | 'just-now' | 'ai-tog' | 'promo';

const PASS_PRICES: Record<PassType, { single: number; couple: number; name: string }> = {
  'weekend': { single: 180000, couple: 360000, name: 'Weekend Pass' },  // R1800/R3600
  'day': { single: 100000, couple: 200000, name: 'Day Pass' },          // R1000/R2000
  'party': { single: 80000, couple: 160000, name: 'Party Pass' },       // R800/R1600
};

// Special promo pricing (R1600 per person for weekend pass)
const PROMO_PRICE_CENTS = 160000; // R1600

const FRIDAY_ADDON_CENTS = 20000; // R200

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
    const { sessionId, registration, priceTier, passType = 'weekend', daySelection, addFridayParty, isWaitlist } = body as {
      sessionId: string;
      registration: RegistrationData;
      priceTier: PriceTier;
      passType?: PassType;
      daySelection?: 'saturday' | 'sunday';
      addFridayParty?: boolean;
      isWaitlist?: boolean;
    };

    // Validation
    if (!sessionId || typeof sessionId !== 'string') {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    if (!registration || !priceTier) {
      return NextResponse.json({ error: 'Registration data and price tier are required' }, { status: 400 });
    }

    // Check for required environment variables (only needed for non-waitlist)
    if (!isWaitlist && (!process.env.YOCO_CO_SECRET_KEY || !process.env.NEXT_PUBLIC_BASE_URL)) {
      console.error('Missing required environment variables');
      return NextResponse.json({ error: 'Payment system not configured' }, { status: 500 });
    }
    
    // Determine registration status based on waitlist flag
    const registrationStatus = isWaitlist ? 'waitlist' : 'pending';
    const paymentStatus = isWaitlist ? 'waitlist' : 'pending';

    const isSingle = registration.type === 'single';
    const passInfo = PASS_PRICES[passType] || PASS_PRICES['weekend'];
    // Add Friday addon price for Day Pass if selected
    const fridayAddon = (passType === 'day' && addFridayParty) ? (isSingle ? FRIDAY_ADDON_CENTS : FRIDAY_ADDON_CENTS * 2) : 0;
    
    // Use promo pricing if applicable (R1600 per person for weekend pass)
    let amountCents: number;
    if (priceTier === 'promo' && passType === 'weekend') {
      amountCents = isSingle ? PROMO_PRICE_CENTS : PROMO_PRICE_CENTS * 2;
    } else {
      amountCents = (isSingle ? passInfo.single : passInfo.couple) + fridayAddon;
    }

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
        await updateRegistrationForRetry(primaryMemberId, sessionId, orderId, registration.email, passType, amountCents);
        }
      } else {
        // No existing registration - create new
        const registrationId = await createRegistration({
          email: registration.email,
          member_id: primaryMemberId,
          role: registration.role,
          level: registration.level,
          booking_session_id: sessionId,
          order_id: orderId,
          pass_type: passType,
          pricing_tier: priceTier,
          amount_cents: amountCents,
          payment_status: paymentStatus,
          registration_status: registrationStatus,
          registration_type: 'single',
        });
        
        // Create day_pass_details for day pass
        if (passType === 'day' && daySelection) {
          const workshopDay = daySelection === 'saturday' ? 'Saturday' : 'Sunday';
          await createDayPassDetails(registrationId, workshopDay, addFridayParty || false);
        }
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
      let leaderRegistrationId: number | null = null;
      if (leaderReg) {
        // Existing record (pending or expired) - update it
        await updateRegistrationForRetry(leaderId, sessionId, orderId, registration.email, passType, amountCents / 2);
        leaderRegistrationId = await getRegistrationIdByMemberId(leaderId);
      } else {
        leaderRegistrationId = await createRegistration({
          email: registration.email,
          member_id: leaderId,
          role: 'L',
          level: registration.leader.level,
          booking_session_id: sessionId,
          order_id: orderId,
          pass_type: passType,
          pricing_tier: priceTier,
          amount_cents: amountCents / 2,
          payment_status: paymentStatus,
          registration_status: registrationStatus,
          registration_type: 'couple',
        });
      }
      
      // Handle follower registration
      let followerRegistrationId: number | null = null;
      if (followerReg) {
        // Existing record (pending or expired) - update it
        await updateRegistrationForRetry(followerId, sessionId, orderId, registration.email, passType, amountCents / 2);
        followerRegistrationId = await getRegistrationIdByMemberId(followerId);
      } else {
        followerRegistrationId = await createRegistration({
          email: registration.email,
          member_id: followerId,
          role: 'F',
          level: registration.follower.level,
          booking_session_id: sessionId,
          order_id: orderId,
          pass_type: passType,
          pricing_tier: priceTier,
          amount_cents: amountCents / 2,
          payment_status: paymentStatus,
          registration_status: registrationStatus,
          registration_type: 'couple',
        });
      }
      
      // Create couple_registrations entry
      await createCoupleRegistration(leaderId, followerId);
      
      // Create day_pass_details for day pass (for both leader and follower)
      if (passType === 'day' && daySelection) {
        const workshopDay = daySelection === 'saturday' ? 'Saturday' : 'Sunday';
        if (leaderRegistrationId) {
          await createDayPassDetails(leaderRegistrationId, workshopDay, addFridayParty || false);
        }
        if (followerRegistrationId) {
          await createDayPassDetails(followerRegistrationId, workshopDay, addFridayParty || false);
        }
      }
      
      allMemberIds = [leaderId, followerId];
    }

    // Store member_ids in Redis keyed by orderId (for payment callback lookup)
    await setOrderMemberIds(orderId, allMemberIds);

    // For waitlist registrations, return early without creating Yoco checkout
    if (isWaitlist) {
      logWeekenderEvent(sessionId, 'waitlist_registration', {
        registrationType: registration.type,
        priceTier,
        orderId,
        memberIds: allMemberIds,
      }).catch(console.error);

      logInfo('weekender_registration', 'Waitlist registration complete', {
        sessionId,
        orderId,
        registrationType: registration.type,
      }).catch(console.error);

      return NextResponse.json({
        success: true,
        reference: orderId,
        isWaitlist: true,
      });
    }

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
    
    // Build pass display name with day info for Day Pass
    let passDisplayName = passInfo.name;
    let passDescription = `${passInfo.name} - WCS Cape Town Weekender`;
    if (passType === 'day' && daySelection) {
      const dayText = daySelection === 'saturday' ? 'Saturday 21 March' : 'Sunday 22 March';
      passDisplayName = `${passInfo.name} (${dayText})`;
      passDescription = `${passInfo.name} - ${dayText}${addFridayParty ? ' + Friday Pre-Party' : ''}`;
    } else if (passType === 'day' && addFridayParty) {
      passDescription = `${passInfo.name} + Friday Pre-Party - WCS Cape Town Weekender`;
    }

    // Build Yoco request body per spec
    const yocoRequestBody = {
      amount: amountCents,
      currency: 'ZAR',
      successUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/bookweekender/success?ref=${orderId}&session=${sessionId}`,
      cancelUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/bookweekender/cancelled?ref=${orderId}&session=${sessionId}`,
      failureUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/bookweekender/failed?ref=${orderId}&session=${sessionId}`,
      metadata: {
        orderId: `${orderId}`,
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
        'Authorization': `Bearer ${process.env.YOCO_CO_SECRET_KEY}`,
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

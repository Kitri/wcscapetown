import { NextRequest, NextResponse } from 'next/server';
import { logWeekenderEvent, setOrderMemberIds } from '@/lib/redis';
import { 
  createRegistration, 
  findOrCreateMember, 
  createBootcampDetails,
  getRegistrationIdByMemberId,
} from '@/lib/db';
import { logApiResponse, logError, logInfo } from '@/lib/blobLogger';

// Bootcamp pricing in cents
const BOOTCAMP_FULL_PRICE_CENTS = 40000; // R400
const BOOTCAMP_DISCOUNT_PRICE_CENTS = 20000; // R200

interface BootcampRegistration {
  name: string;
  surname: string;
  email: string;
  role: 'L' | 'F';
  bootcampType: 'beginner' | 'fasttrack';
  wcsExperience: string;
  partnerDanceExperience?: string; // For beginner bootcamp
  yearsExperience?: number; // For fasttrack (in years)
  experienceUnit?: 'years' | 'months'; // For fasttrack
  danceStyles?: string[]; // For fasttrack
  otherDanceStyle?: string; // For fasttrack "Other" option
  danceRole?: string; // For fasttrack
  howDidYouFindUs?: string;
  hasWeekenderPass: boolean;
  weekenderValidated: boolean;
}

// Generate BOOT order number
async function getNextBootcampOrderNumber(): Promise<string> {
  const now = new Date();
  const year = now.getFullYear();
  const orderNum = now.getTime().toString().slice(-6);
  return `BOOT-${year}-${orderNum.padStart(6, '0')}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId, registration } = body as {
      sessionId: string;
      registration: BootcampRegistration;
    };

    // Validation
    if (!sessionId || typeof sessionId !== 'string') {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    if (!registration) {
      return NextResponse.json({ error: 'Registration data is required' }, { status: 400 });
    }

    // Check for required environment variables
    if (!process.env.YOCO_CO_SECRET_KEY || !process.env.NEXT_PUBLIC_BASE_URL) {
      console.error('Missing required environment variables');
      return NextResponse.json({ error: 'Payment system not configured' }, { status: 500 });
    }

    // Determine price based on weekender pass validation
    const priceTier = registration.weekenderValidated ? 'half' : 'full';
    const amountCents = registration.weekenderValidated 
      ? BOOTCAMP_DISCOUNT_PRICE_CENTS 
      : BOOTCAMP_FULL_PRICE_CENTS;

    // Generate order ID with BOOT prefix
    const orderId = await getNextBootcampOrderNumber();

    // Determine level: 1 if they have WCS experience, 0 if never
    const level = registration.wcsExperience === 'Never' ? 0 : 1;

    // Prepare bootcamp details data upfront
    let yearsExperience: number | null = null;
    if (registration.yearsExperience !== undefined) {
      yearsExperience = registration.experienceUnit === 'months' 
        ? registration.yearsExperience / 12 
        : registration.yearsExperience;
    }

    let danceStyleStr: string | null = null;
    if (registration.danceStyles && registration.danceStyles.length > 0) {
      const styles = [...registration.danceStyles];
      const otherIndex = styles.indexOf('Other');
      if (otherIndex !== -1 && registration.otherDanceStyle) {
        styles[otherIndex] = registration.otherDanceStyle;
      }
      danceStyleStr = styles.join(', ');
    }

    // Step 1: Find or create member (must be first)
    const memberId = await findOrCreateMember({
      name: registration.name,
      surname: registration.surname,
      role: registration.role,
      level: level as 0 | 1 | 2,
    });

    // Step 2: Create registration (depends on memberId)
    const registrationId = await createRegistration({
      email: registration.email,
      member_id: memberId,
      role: registration.role,
      level: level as 0 | 1 | 2,
      booking_session_id: sessionId,
      order_id: orderId,
      pass_type: 'bootcamp',
      pricing_tier: priceTier,
      amount_cents: amountCents,
      payment_status: 'pending',
      registration_status: 'pending',
      registration_type: 'single',
    });

    // Step 3: Parallel operations - bootcamp details, Redis, and start Yoco request
    const bootcampName = registration.bootcampType === 'beginner' 
      ? 'Beginner Bootcamp' 
      : 'Fast-Track Intensive';
    
    const yocoRequestBody = {
      amount: amountCents,
      currency: 'ZAR',
      successUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/bookbootcamp/success?ref=${orderId}&session=${sessionId}`,
      cancelUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/bookbootcamp/cancelled?ref=${orderId}&session=${sessionId}`,
      failureUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/bookbootcamp/failed?ref=${orderId}&session=${sessionId}`,
      metadata: {
        orderId: `${orderId}`,
        customerId: `MEMBER-${memberId}`,
        customerEmail: registration.email,
        source: 'web_checkout',
        bootcampType: registration.bootcampType,
      },
      lineItems: [
        {
          displayName: bootcampName,
          quantity: 1,
          pricingDetails: {
            price: amountCents,
          },
          description: `${bootcampName} - WCS Cape Town - 7 March 2026`,
        },
      ],
    };

    // Run bootcamp details, Redis store, and Yoco API in parallel
    const [, , yocoResponse] = await Promise.all([
      createBootcampDetails(
        registrationId,
        registration.bootcampType,
        registration.wcsExperience,
        registration.howDidYouFindUs || null,
        yearsExperience,
        danceStyleStr,
        registration.danceRole || null
      ),
      setOrderMemberIds(orderId, [memberId]),
      fetch('https://payments.yoco.com/api/checkouts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.YOCO_CO_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(yocoRequestBody),
      }),
    ]);

    // Log registration (non-blocking)
    logInfo('bootcamp_registration', 'Yoco checkout created', {
      sessionId,
      orderId,
      bootcampType: registration.bootcampType,
      amountCents,
      priceTier,
    }).catch(console.error);

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
      logError('bootcamp_registration', 'Yoco API error', {
        sessionId,
        orderId,
        status: yocoResponse.status,
        error: yocoData,
      }).catch(console.error);

      return NextResponse.json(
        { error: 'Payment system error. Please try again.' },
        { status: 500 }
      );
    }

    // Log event to Redis
    logWeekenderEvent(sessionId, 'bootcamp_payment_in_progress', {
      bootcampType: registration.bootcampType,
      amountCents,
      priceTier,
      orderId,
      memberId,
    }).catch(console.error);

    return NextResponse.json({
      success: true,
      redirectUrl: yocoData.redirectUrl,
      reference: orderId,
    });

  } catch (error) {
    console.error('Error submitting bootcamp registration:', error);
    logError('bootcamp_registration', 'Registration error', {}, error as Error).catch(console.error);
    
    return NextResponse.json(
      { error: 'Registration failed. Please try again.' },
      { status: 500 }
    );
  }
}

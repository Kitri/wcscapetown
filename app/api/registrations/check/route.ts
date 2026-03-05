import { NextRequest, NextResponse } from 'next/server';
import { getRegistrationsByEmailOrOrder } from '@/lib/db';

function getStatusInfo(paymentStatus: string, registrationStatus: string, role: string) {
  const normalizedRole = String(role || '').trim().toUpperCase();
  const needsRoleText =
    normalizedRole === 'F' || normalizedRole === 'FOLLOW'
      ? 'We are still waiting for more leads to sign up.'
      : normalizedRole === 'L' || normalizedRole === 'LEAD'
        ? 'We are still waiting for more followers to sign up.'
        : 'We are still waiting for more opposite-role dancers to sign up.';

  if (registrationStatus === 'waitlist') {
    return {
      label: 'On waitlist',
      message: `You are currently on the waitlist. ${needsRoleText}`,
    };
  }

  if (paymentStatus === 'complete' && registrationStatus === 'complete') {
    return {
      label: 'Confirmed',
      message: 'Booking confirmed.',
    };
  }

  if (paymentStatus === 'pending' || registrationStatus === 'pending') {
    return {
      label: 'Payment pending',
      message:
        'Payment is still pending. Your booking is only fully confirmed once payment is completed. If you paid recently, it may take a few minutes for your status to reflect.',
    };
  }

  if (paymentStatus === 'failed') {
    return {
      label: 'Payment failed',
      message:
        'Your last payment attempt appears to have failed. Please try again or contact us if you need help.',
    };
  }

  if (paymentStatus === 'expired' || registrationStatus === 'expired') {
    return {
      label: 'Expired',
      message:
        'This registration expired before payment completed. Please start a new booking if you still want to attend.',
    };
  }

  return {
    label: 'In progress',
    message: 'Your registration is still being processed.',
  };
}

function getBootcampInfo(bootcampType: string | null) {
  const isBeginner = bootcampType === 'beginner';
  const isFastTrack = bootcampType === 'fasttrack';

  const title = isBeginner
    ? 'Beginner Bootcamp'
    : isFastTrack
      ? 'Fast-Track Intensive Bootcamp'
      : 'Bootcamp';

  const startTime = isBeginner ? '11:00' : isFastTrack ? '14:30' : 'TBC';

  return {
    registrationLabel: title,
    eventDate: '7 March 2026',
    venueName: 'OBS Community Center',
    venueAddress: 'Cnr. Lower Main Road and Collingwood Street, Observatory',
    venueMapUrl: 'https://maps.app.goo.gl/kA2M3yYk1oVpupKP6',
    details: [
      `Workshop starts at ${startTime} and runs for 3 hours.`,
      'Please arrive 10 minutes before the workshop so we can check everyone in and direct you to the right room.',
      "Parking is available onsite, and we'll be near the parking lot to direct people to the smaller second-floor hall (not the main hall).",
    ],
    shoeTips: [
      'Wear comfortable dance shoes (WCS is not typically danced in heels).',
      'Bring a water bottle.',
    ],
    shoeOptions: [] as string[],
  };
}

function getWeekenderInfo(passType: string, workshopDay: string | null, partyAddOn: boolean | null) {
  const passLabel =
    passType === 'weekend'
      ? 'Weekender Weekend Pass'
      : passType === 'day'
        ? `Weekender Day Pass${workshopDay ? ` (${workshopDay})` : ''}${partyAddOn ? ' + Friday Pre-Party' : ''}`
        : passType === 'party'
          ? 'Weekender Party Pass'
          : 'Weekender Registration';

  const eventDate =
    passType === 'day'
      ? workshopDay === 'Saturday'
        ? '21 March 2026'
        : workshopDay === 'Sunday'
          ? '22 March 2026'
          : 'Weekender day pass (date to confirm)'
      : '20–22 March 2026';

  return {
    registrationLabel: passLabel,
    eventDate,
    venueName: 'Hellenic Community Centre, Greenpoint',
    venueAddress: 'Hellenic Community Centre, Greenpoint',
    venueMapUrl: 'https://maps.app.goo.gl/rhtWRj4fmg1Pw8fw8',
    details: [
      'Plenty of secure parking on site.',
      'There is a restaurant onsite with drinks, coffee, and food, open until 4pm.',
      'You can bring your own water bottle, but no other drinks before 4pm.',
      'The schedule is being finalised and will be shared via email on Monday 9 March 2026.',
      'The venue is close to the promenade and several restaurants/coffee shops, which makes for a great day out.',
      'Friday night social will be at a different venue (TBC), likely Claremont Scout Hall.',
    ],
    shoeTips: [
      'Bring comfortable, flat, or low-heeled shoes with smooth, non-stick soles that allow for easy spinning (particularly the patch around the ball of the foot).',
      'The venue has a tile floor, and some rubber-sole shoes may feel sticky.',
      "If you don't have proper dance shoes (suede-soled flats or low, wide heels are ideal), these are good options:",
    ],
    shoeOptions: [
      'Smooth-soled sneakers or trainers',
      'Canvas shoes (e.g., Keds-style)',
      'Casual flats or flexible shoes',
      'You can also dance in socks if you prefer',
    ],
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const query = String(body?.query ?? '').trim();
    const sourceRaw = String(body?.source ?? '').trim().toLowerCase();
    const source: 'weekender' | 'bootcamp' | 'all' =
      sourceRaw === 'weekender' || sourceRaw === 'bootcamp' ? sourceRaw : 'all';

    if (!query) {
      return NextResponse.json({ error: 'Please enter an email address or order number.' }, { status: 400 });
    }

    const rows = await getRegistrationsByEmailOrOrder(query, source);
    const registrations = rows.map((row) => {
      const status = getStatusInfo(row.paymentStatus, row.registrationStatus, row.role);
      const eventInfo =
        row.passType === 'bootcamp'
          ? getBootcampInfo(row.bootcampType)
          : getWeekenderInfo(row.passType, row.workshopDay, row.partyAddOn);

      return {
        orderId: row.orderId,
        name: row.name,
        surname: row.surname,
        email: row.email,
        role: row.role,
        level: row.level,
        passType: row.passType,
        registrationType: row.registrationType,
        createdAt: row.createdAt,
        statusLabel: status.label,
        statusMessage: status.message,
        registrationLabel: eventInfo.registrationLabel,
        eventDate: eventInfo.eventDate,
        venueName: eventInfo.venueName,
        venueAddress: eventInfo.venueAddress,
        venueMapUrl: eventInfo.venueMapUrl,
        details: eventInfo.details,
        shoeTips: eventInfo.shoeTips,
        shoeOptions: eventInfo.shoeOptions,
      };
    });

    return NextResponse.json({ registrations });
  } catch (error) {
    console.error('Error checking registration:', error);
    return NextResponse.json({ error: 'Failed to check registration details.' }, { status: 500 });
  }
}

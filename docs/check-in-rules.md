# Check-in system rules

How the `/check-in` screen decides what someone pays. This covers every rule the system applies today. The code behind it is listed at the end.

---

## 1. Events and what can be bought

The operator picks an event and a date at the top of the screen. Prices come from the **Costs** sheet.

| Event | Entry options |
|---|---|
| **Monday Plumstead** (class + social) | Standard entry, Student, Pensioner, Social only, monthly passes (see below), Door volunteer |
| **Thursday Pinelands** (practice) | Practice |
| **Strictly Social** | Social only (shown as "Social R50") |
| **Bootcamp** | Registered people only (no "Add new person") |

- **Only the member's own category is offered.** A member marked *student* sees Student / Student monthly, a *pensioner* sees Pensioner / Pensioner monthly, and everyone else sees Standard entry / Monthly. The category comes from the member record (`All_members`, column F).
- **Monthly passes are only offered in the first two weeks of the month** (day 1–14).
- **Level 2 Tuesday discount:** on a Tuesday, Level 2 members pay **R50** and only see Standard entry / Social only.
- **Thursday combo:** someone who attended the **Tuesday of the same week** gets free entry on Thursday ("Tuesday combo"). If they attended that Tuesday as a teacher and paid nothing, the Thursday costs **R25**.
- **Thursday bulk check-in:** for Thursday events, the screen lists people seen at the last 3 Thursday sessions so they can be checked in quickly.

## 2. Free entry (the Free Entry sheet)

Before showing prices, the system checks the **Free Entry** sheet (`member_id, name, entry_type, applicable_date, details, reason`) for the member. The `applicable_date` column can be:

| Value | Applies to | Priority |
|---|---|---|
| Exact date: `2026-11-02`, `2 November`, `02/11/2026` | that date, any event | 3 (highest) |
| Month and year: `November 2026` | every Monday that month | 2 |
| Session count: `5 sessions`, `Sessions: 5` | the next N check-ins, until used up | 2 |
| Year: `2026` | every Monday that year | 1 |
| `All Mondays` | every Monday | 1 |

- When several rows match, the highest priority wins. At the same priority, a door-volunteer row wins over a monthly row.
- A session-count rule shows "free session 2 of 5 — 3 remaining". Once the sessions are used up, the person falls through to normal paid entry without any warning.
- Buying a monthly pass automatically adds a `monthly` / `November 2026` row, so the member just signs in on the other Mondays ("Free entry – monthly").
- The operator can click **"This is not correct"** to ignore a free entry and charge normally.

## 3. Door volunteers and teachers (one rule for both)

Door volunteers (welcoming committee) and teachers now follow **exactly the same rule**.

### 3.1 Who counts as a volunteer or teacher tonight

- **Door volunteer:** has a Free Entry row for tonight whose entry type or reason mentions *door volunteer* or *welcoming committee*. Someone can also be made door volunteer on the night by picking **"Door volunteer (welcoming committee)"** in the paid options.
- **Teacher:** listed on the live **Teaching Roster** for tonight (columns C–F are class teachers, G is the newcomer teacher). Only people in the **Teachers** tab are looked up. A roster cell the system can't fully recognise (a note, a guest teacher) gives nobody free entry. If the roster can't be read, check-in carries on as normal.
- **Only one welcoming committee member per event.** Once someone has checked in as door volunteer, the walk-in door volunteer option is hidden for everyone else that night.
- Volunteers and teachers are never the same person, so nobody has a mix of the two.

### 3.2 Free entry on the night

A volunteer or teacher **always gets free entry that night**, whatever their category (student / pensioner / standard) and whether or not they have a pass.

| Situation | Screen shows |
|---|---|
| Door volunteer | **Free entry – welcoming committee** |
| Teacher | **Free entry – teaching** |
| Newcomer teacher | **Free entry – teaching (newcomer teacher)**, plus "First timers should go to …" |
| On a monthly pass, no session tonight | **Free entry – monthly** |

### 3.3 What a session is worth

**Every session is worth one class.** A monthly pass counts as **4 classes**, so:

- off a **monthly pass**, each session takes off **monthly price ÷ 4** (R75 off R300, R67.50 off a R270 student pass);
- on a **single entry** (Standard / Student / Pensioner), one session covers **the whole entry**.

How the session is used depends on when it happens:

| When the session happens | Where the credit goes |
|---|---|
| **Earlier this month, before buying a pass** | Off this month's pass, if they buy one later this month. (It does not count towards a single entry, because that night was already free.) |
| **Tonight, when buying a pass tonight** | Off the pass being bought |
| **Assigned for later this month** (Free Entry row or roster) when the pass is bought | Off the pass being bought |
| **While already on a pass**, and not already counted in its price | Rolls over to their **next** entry or pass |

**Monthly price formula:**

```
pass price = P − (P ÷ 4) × sessions − money already paid on Mondays this month
```

The result is never below R0, and at most 4 sessions come off. `sessions` is this month's sessions (earlier + tonight + assigned later), plus any credit rolled over from the last pass.

### 3.4 Paying for the rest of the month on a volunteer / teaching night

On a volunteer or teaching night (not on a pass yet, Monday, first two weeks), the free-entry box asks **"Would you like to pay for the rest of the month?"**. Ticking it shows:

- the amount due for the member's own monthly type, already discounted;
- a note such as **"2 volunteer sessions this month"** or **"2 teaching slots this month"**, which counts tonight plus every session assigned for later this month;
- **"Number of sessions wrong? Override"**: the operator types the correct number and a reason (both required, like the standard override), and the price is worked out again. The comment records `Sessions overridden: 1 (system said 2) – <reason>`.

The same panel (amount, note, override, discount tick box) appears in two other places, and the discount is always applied to start with:

- **Walk-in door volunteer:** pick **"Door volunteer (welcoming committee)"**, then tick **"Also pay for the month"**.
- **Monthly first:** pick the monthly pass (for example Joe below), then tick **"Door volunteer tonight too"** to count tonight as a session.

### 3.5 Sessions already paid for by a pass

When a pass is bought, the sessions **still to come** that were taken off its price are recorded on the purchase row (comment: `Pass price includes 2 upcoming sessions`). Each later session on that pass is then recorded as `monthly included: …` and earns **no further credit**. Once those are used up, any extra session that month is recorded as `monthly rollover: …` and rolls over.

### 3.6 Worked examples

| Who | What happens |
|---|---|
| **Mary** paid October monthly (R300) and volunteered once in October | November single entry: **free** (R100 covered by 1 session). November monthly: **R225** (300 − 75). |
| **Joe** (student) is on door duty twice this month, set up in advance, and buys the month on a non-volunteer night | Pass: **R135** (270 − 67.50 × 2). His volunteer nights show *Free entry – welcoming committee*, his other nights *Free entry – monthly*. |
| **Susan** teaches week 1 of November | Week 1: *Free entry – teaching*. Week 2 she buys the month: **R225** (300 − 75). |
| **Pete** is on door duty in weeks 1 and 3 (in the Free Entry sheet) | Week 1: *Free entry – welcoming committee*, plus "pay for the rest of the month?" at **R150** with the note "2 volunteer sessions this month". |

### 3.7 The discount tick box

The discount is applied by default. Unticking **"Apply volunteer / teaching discount"** (monthly) or **"Use credit from …"** (single entry) charges the full price, and the credit is kept for later.

## 4. Money already paid this month

Anything the member paid on **Monday entries this month since their last pass** is taken off a monthly pass bought later in the month. For example, someone who paid R100 in week 1 pays R200 for the month in week 2. When one payment covered two people, only the payer's own share counts.

## 5. Credit window

- Credit is counted from the member's **last monthly purchase** onwards. Buying a new pass uses up all credit and starts again from zero, so every credit is used exactly once. Credit beyond the 4 classes a pass can absorb is not carried forward.
- Credit is only tracked from **1 October 2026**. Anything earlier was settled by hand.
- A single entry uses one session of rolled-over credit at most. Any further sessions stay for the next entry or pass.

## 6. Other check-in options

- **Pay for 2 people:** one payment covers the selected member and a second member. Each pays their own category's price (for example R100 + R80). This is not available for monthly passes, free entries or door volunteers, and the second person must not already be checked in. The payer's row carries the full amount (to match the single Yoco payment), and the second person's row is R0 with "paid by …".
- **Override check-in:** for when something goes wrong. The operator sets any amount, a payment method (if more than R0) and a **required** comment, and the row is recorded with type `Override`.
- **Undo:** a check-in can be undone with a reason. The row moves to the **Check in reverted** sheet.
- **Already checked in:** a member already checked in for this event and date cannot be checked in again.
- **Early Level 1 warning:** on a Monday before 19:15, a member marked Level 1 (and not the door volunteer) gets a reminder to confirm whether they are here for Level 2, because Level 2 approval isn't recorded yet.
- **Payment method:** Cash or Yoco is required whenever the amount is above R0.

## 7. What gets written to the Attendance sheet

Columns: A member_id · B name (sheet lookup, never written) · C date · D event · E paid_via · F amount · G type · H comment · I free_entry_reason · J timestamp (Cape Town).

Values of `free_entry_reason` (column I) for sessions and credit:

| Value | Meaning |
|---|---|
| `welcoming committee` / `teacher` / `newcomer teacher` | Free session, not on a pass. Counts towards a pass bought later this month. |
| `monthly rollover: <role>` | Session on a pass, not in its price. Rolls over to the next entry or pass. |
| `monthly included: <role>` | Session on a pass, already taken off the pass price. No further credit. |
| `rollover_credit` | Credit or money already paid was applied to this entry or purchase. Details are in the comment, e.g. `Session discount R150.00 (2 volunteer sessions this month)` or `Session credit used: 1 session (R100.00)`. |
| `monthly` | A night covered by a monthly pass. |

**Monthly purchases.** A purchase is a monthly-type row with no reason, or with `rollover_credit`. A purchase adds the Free Entry month row (Monday Plumstead only), even when credit covers it completely and it costs R0. When the pass is bought on a volunteer or teaching night, a free session row for tonight is written **just before** the purchase row.

## 8. Known limits

- If an assigned session doesn't happen after it was taken off a pass (for example, door duty is cancelled), the system doesn't claw the discount back. Use the session override at purchase time, or sort it out by hand.
- Door-volunteer dates in advance must be **specific dates** in the Free Entry sheet. Ranges like "All Mondays" or "November 2026" count for tonight but aren't counted as upcoming sessions.
- "Pay for the rest of the month" follows the normal monthly rule, so it is only offered in the first two weeks of the month.

---

### Where this lives in the code

| File | What it does |
|---|---|
| `lib/sessionCredit.ts` | The volunteer / teacher rule: reasons, session value, monthly and single-entry prices, comment notes (shared by API and screen) |
| `lib/server/monthlyRollover.ts` | Reads Attendance to count credit since the last purchase and sessions a pass already includes |
| `lib/server/teacherRoster.ts` | Teaching roster: tonight's role and teaching dates this month |
| `app/api/check-in/free-entry/route.ts` | Free Entry matching, tonight's session role and reason, upcoming sessions |
| `app/api/check-in/already-checked-in/route.ts` | Already checked in, welcoming committee taken, session credit |
| `app/api/check-in/attendance/route.ts` | Writes the check-in, tonight's session row and the Free Entry month row |
| `app/check-in/CheckInClient.tsx` | The check-in screen |

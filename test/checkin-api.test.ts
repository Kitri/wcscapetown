import { CHECKIN_AUTH_COOKIE_NAME } from "@/lib/server/checkinConfig";

jest.mock("@/lib/server/checkinAuth", () => ({
  isCheckinAuthed: jest.fn(async () => true),
}));

const mockGetSheetValues = jest.fn();
const mockAppendToSheet = jest.fn();

jest.mock("@/lib/googleSheets", () => ({
  getSheetValues: (...args: unknown[]) => mockGetSheetValues(...args),
  appendToSheet: (...args: unknown[]) => mockAppendToSheet(...args),
}));

const mockFormatZaDateISO = jest.fn();
const mockFormatZaMonthYear = jest.fn();
const mockIsZaMonday = jest.fn();

jest.mock("@/lib/zaDate", () => ({
  formatZaDateISO: (...args: unknown[]) => mockFormatZaDateISO(...args),
  formatZaMonthYear: (...args: unknown[]) => mockFormatZaMonthYear(...args),
  isZaMonday: (...args: unknown[]) => mockIsZaMonday(...args),
}));

function jsonRequest(url: string, body: unknown): Request {
  return new Request(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/check-in/auth", () => {
  beforeEach(() => {
    jest.resetModules();
    process.env.CHECKIN_PASSCODE = "1234";
    process.env.NODE_ENV = "test";
  });

  it("grants access with correct passcode and sets auth cookie", async () => {
    const { POST } = await import("../app/api/check-in/auth/route");

    const res = await POST(jsonRequest("http://localhost/api/check-in/auth", { passcode: "1234" }));
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data).toEqual({ ok: true });

    const setCookie = res.headers.get("set-cookie");
    expect(setCookie).toBeTruthy();
    expect(setCookie).toContain(`${CHECKIN_AUTH_COOKIE_NAME}=1`);
  });

  it("denies access with incorrect passcode", async () => {
    const { POST } = await import("../app/api/check-in/auth/route");

    const res = await POST(jsonRequest("http://localhost/api/check-in/auth", { passcode: "nope" }));
    expect(res.status).toBe(401);

    const data = await res.json();
    expect(data).toEqual({ ok: false });
  });
});

describe("GET /api/check-in/free-entry (parseMemberId + matchesApplicableDate)", () => {
  beforeEach(() => {
    mockGetSheetValues.mockReset();
    mockFormatZaDateISO.mockReset();
    mockFormatZaMonthYear.mockReset();
    mockIsZaMonday.mockReset();

    mockFormatZaDateISO.mockImplementation(() => "2026-02-03");
    mockFormatZaMonthYear.mockImplementation(() => "February 2026");
    mockIsZaMonday.mockImplementation(() => true);
  });

  it("extracts numeric member_id from mixed input and rejects non-numeric input", async () => {
    const { GET } = await import("../app/api/check-in/free-entry/route");

    mockGetSheetValues.mockResolvedValue([
      ["member_id", "", "entry_type", "applicable_date", "details", "reason"],
      ["123", "", "Comp", "All Mondays", "", ""],
    ]);

    // numeric extraction
    const okReq = new Request(
      "http://localhost/api/check-in/free-entry?member_id=WCS-123",
      { method: "GET" }
    );
    const okRes = await GET(okReq);
    expect(okRes.status).toBe(200);
    const okData = await okRes.json();
    expect(okData.applies).toBe(true);

    // non-numeric should be invalid
    const badReq = new Request(
      "http://localhost/api/check-in/free-entry?member_id=ABC",
      { method: "GET" }
    );
    const badRes = await GET(badReq);
    expect(badRes.status).toBe(400);
    const badData = await badRes.json();
    expect(badData).toEqual({ error: "Invalid member_id" });
  });

  it("chooses the highest-priority applicable free-entry rule (exact ISO > month-year Monday > all Mondays)", async () => {
    const { GET } = await import("../app/api/check-in/free-entry/route");

    mockGetSheetValues.mockResolvedValue([
      ["member_id", "", "entry_type", "applicable_date", "details", "reason"],
      ["123", "", "AllMonday", "All Mondays", "d1", "r1"],
      ["123", "", "MonthYear", "February 2026", "d2", "r2"],
      ["123", "", "Exact", "2026-02-03", "d3", "r3"],
    ]);

    const req = new Request(
      "http://localhost/api/check-in/free-entry?member_id=123",
      { method: "GET" }
    );

    const res = await GET(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data).toMatchObject({
      applies: true,
      today: "2026-02-03",
      entry_type: "Exact",
      applicable_date: "2026-02-03",
      details: "d3",
      reason: "r3",
    });
  });

  it("matches other parseable date formats (best-effort)", async () => {
    const { GET } = await import("../app/api/check-in/free-entry/route");

    // The route calls formatZaDateISO(parsedDate) when parsing other formats;
    // make that return the same "today" for that call.
    mockFormatZaDateISO.mockImplementation((d?: unknown) => {
      if (d) return "2026-02-03";
      return "2026-02-03";
    });

    mockGetSheetValues.mockResolvedValue([
      ["member_id", "", "entry_type", "applicable_date", "details", "reason"],
      ["123", "", "Parsed", "Feb 3, 2026", "d", "r"],
    ]);

    const req = new Request(
      "http://localhost/api/check-in/free-entry?member_id=123",
      { method: "GET" }
    );

    const res = await GET(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.applies).toBe(true);
    expect(data.entry_type).toBe("Parsed");
  });
});

describe("POST /api/check-in/members (new member registration)", () => {
  beforeEach(() => {
    mockGetSheetValues.mockReset();
    mockAppendToSheet.mockReset();
    mockFormatZaDateISO.mockReset();

    mockFormatZaDateISO.mockImplementation(() => "2026-02-03");
  });

  it("creates a new member with valid data", async () => {
    const { POST } = await import("../app/api/check-in/members/route");

    // getNextMemberId reads column A
    mockGetSheetValues.mockResolvedValue([
      ["member_id"],
      ["10"],
      ["11"],
    ]);

    const payload = {
      firstName: "Ada",
      surname: "Lovelace",
      contactNumber: "+27 82 123 4567",
      email: "ada@example.com",
      feedbackConsent: true,
      role: "Lead",
      level: "1",
      howFoundUs: "Friend",
      visitor: false,
    };

    const res = await POST(jsonRequest("http://localhost/api/check-in/members", payload));
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.member).toMatchObject({
      member_id: 12,
      first_name: "Ada",
      surname: "Lovelace",
      full_name: "Ada Lovelace",
    });

    expect(mockAppendToSheet).toHaveBeenCalledTimes(1);
    const callArgs = mockAppendToSheet.mock.calls[0];
    expect(callArgs[1]).toBe("All_members!A:O");

    const rows = callArgs[2] as unknown as (string | number)[][];
    expect(rows[0][0]).toBe(12);
    expect(rows[0][1]).toBe("Ada");
    expect(rows[0][2]).toBe("Lovelace");
  });

  it("returns errors for invalid input", async () => {
    const { POST } = await import("../app/api/check-in/members/route");

    // missing names
    let res = await POST(jsonRequest("http://localhost/api/check-in/members", { firstName: "", surname: "" }));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({
      error: "First name and surname are required",
    });

    // invalid email
    res = await POST(
      jsonRequest("http://localhost/api/check-in/members", {
        firstName: "A",
        surname: "B",
        email: "not-an-email",
      })
    );
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "Invalid email" });

    // invalid phone
    res = await POST(
      jsonRequest("http://localhost/api/check-in/members", {
        firstName: "A",
        surname: "B",
        contactNumber: "123",
      })
    );
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "Invalid contact number" });

    // contact details require consent
    res = await POST(
      jsonRequest("http://localhost/api/check-in/members", {
        firstName: "A",
        surname: "B",
        email: "a@b.com",
        feedbackConsent: false,
      })
    );
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({
      error: "Consent is required if contact details are provided",
    });
  });
});

describe("POST /api/check-in/attendance", () => {
  beforeEach(() => {
    mockAppendToSheet.mockReset();
    mockFormatZaDateISO.mockReset();

    mockFormatZaDateISO.mockImplementation(() => "2026-02-03");
  });

  it("records a check-in with various payload details", async () => {
    const { POST } = await import("../app/api/check-in/attendance/route");

    const payload = {
      member_id: 42,
      type: "Member",
      paid_via: "Yoco",
      paid_amount: 100,
      comment: "Paid at door",
      free_entry_reason: "Promo",
    };

    const res = await POST(jsonRequest("http://localhost/api/check-in/attendance", payload));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });

    expect(mockAppendToSheet).toHaveBeenCalledTimes(1);
    const [spreadsheetId, range, rows] = mockAppendToSheet.mock.calls[0];
    expect(range).toBe("Attendance!A:H");

    const row = (rows as (string | number)[][])[0];
    expect(row[0]).toBe(42);
    expect(row[1]).toBe("2026-02-03");
    expect(row[3]).toBe("Yoco");
    expect(row[4]).toBe(100);
    expect(row[5]).toBe("Member");
    expect(row[6]).toBe("Paid at door");
    expect(row[7]).toBe("Promo");

    // spreadsheetId is passed through from config; just assert it exists
    expect(String(spreadsheetId)).toBeTruthy();
  });

  it("returns errors for invalid member IDs or missing type", async () => {
    const { POST } = await import("../app/api/check-in/attendance/route");

    let res = await POST(jsonRequest("http://localhost/api/check-in/attendance", { member_id: "nope", type: "Member" }));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "Invalid member_id" });

    res = await POST(jsonRequest("http://localhost/api/check-in/attendance", { member_id: 1, type: "" }));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "Type is required" });
  });
});

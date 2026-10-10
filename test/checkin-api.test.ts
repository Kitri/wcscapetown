import { CHECKIN_AUTH_COOKIE_NAME } from "@/lib/server/checkinConfig";

jest.mock("@/lib/server/checkinAuth", () => ({
  isCheckinAuthed: jest.fn(async () => true),
}));

const mockGetSheetValues = jest.fn();
const mockAppendToSheet = jest.fn();
const mockDeleteSheetRowByNumber = jest.fn();

jest.mock("@/lib/googleSheets", () => ({
  getSheetValues: (...args: unknown[]) => mockGetSheetValues(...args),
  appendToSheet: (...args: unknown[]) => mockAppendToSheet(...args),
  deleteSheetRowByNumber: (...args: unknown[]) => mockDeleteSheetRowByNumber(...args),
}));

const mockFormatZaDateISO = jest.fn();
const mockFormatZaMonthYear = jest.fn();
const mockIsZaMonday = jest.fn();
const mockParseZaDateISO = jest.fn();
const mockGetZaWeekday = jest.fn();

jest.mock("@/lib/zaDate", () => ({
  formatZaDateISO: (...args: unknown[]) => mockFormatZaDateISO(...args),
  formatZaMonthYear: (...args: unknown[]) => mockFormatZaMonthYear(...args),
  isZaMonday: (...args: unknown[]) => mockIsZaMonday(...args),
  parseZaDateISO: (...args: unknown[]) => mockParseZaDateISO(...args),
  getZaWeekday: (...args: unknown[]) => mockGetZaWeekday(...args),
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
  beforeEach(async () => {
    mockGetSheetValues.mockReset();
    mockFormatZaDateISO.mockReset();
    mockFormatZaMonthYear.mockReset();
    mockIsZaMonday.mockReset();
    mockParseZaDateISO.mockReset();
    mockGetZaWeekday.mockReset();

    // Teacher lookups are cached at module level; start every test clean.
    (await import("../lib/server/teacherRoster")).clearTeacherRosterCache();

    mockFormatZaDateISO.mockImplementation(() => "2026-02-03");
    mockFormatZaMonthYear.mockImplementation(() => "February 2026");
    mockIsZaMonday.mockImplementation(() => true);
    mockGetZaWeekday.mockImplementation(() => "Tuesday");
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

  it("matches teacher entries using day-month text format without a year", async () => {
    const { GET } = await import("../app/api/check-in/free-entry/route");

    mockParseZaDateISO.mockImplementation((v?: unknown) => {
      if (v === "2026-08-24") return new Date("2026-08-24T12:00:00+02:00");
      return null;
    });
    mockFormatZaMonthYear.mockImplementation(() => "August 2026");
    mockIsZaMonday.mockImplementation(() => true);

    mockGetSheetValues.mockResolvedValue([
      ["member_id", "", "entry_type", "applicable_date", "details", "reason", "Monday Plumstead", "Tuesday Pinelands", "Social"],
      ["14", "James Browning", "Teacher", "24 August", "Teaching a class tonight", "teacher", "TRUE", "", ""],
    ]);

    const req = new Request(
      "http://localhost/api/check-in/free-entry?member_id=14&date=2026-08-24&event=Monday%20Plumstead",
      { method: "GET" }
    );

    const res = await GET(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data).toMatchObject({
      applies: true,
      entry_type: "Teacher",
      applicable_date: "24 August",
      reason: "teacher",
    });
  });

  it("matches teacher entries using day-first numeric format", async () => {
    const { GET } = await import("../app/api/check-in/free-entry/route");

    mockParseZaDateISO.mockImplementation((v?: unknown) => {
      if (v === "2026-08-24") return new Date("2026-08-24T12:00:00+02:00");
      return null;
    });
    mockFormatZaMonthYear.mockImplementation(() => "August 2026");
    mockIsZaMonday.mockImplementation(() => true);

    mockGetSheetValues.mockResolvedValue([
      ["member_id", "", "entry_type", "applicable_date", "details", "reason", "Monday Plumstead", "Tuesday Pinelands", "Social"],
      ["61", "Priyanka Kooverjee", "Teacher", "24/08/2026", "Teaching a class tonight", "teacher", "TRUE", "", ""],
    ]);

    const req = new Request(
      "http://localhost/api/check-in/free-entry?member_id=61&date=2026-08-24&event=Monday%20Plumstead",
      { method: "GET" }
    );

    const res = await GET(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data).toMatchObject({
      applies: true,
      entry_type: "Teacher",
      applicable_date: "24/08/2026",
      reason: "teacher",
    });
  });

  it("applies Thursday Tuesday combo as free entry when member attended Tuesday in same week", async () => {
    const { GET } = await import("../app/api/check-in/free-entry/route");

    mockParseZaDateISO.mockImplementation((v?: unknown) => {
      if (v === "2026-02-05") return new Date("2026-02-05T12:00:00+02:00");
      return null;
    });

    mockGetZaWeekday.mockImplementation((d?: unknown) => {
      if (d instanceof Date && d.toISOString().startsWith("2026-02-05")) return "Thursday";
      if (d instanceof Date && d.toISOString().startsWith("2026-02-03")) return "Tuesday";
      return "Thursday";
    });

    mockFormatZaDateISO.mockImplementation((d?: unknown) => {
      if (d instanceof Date && d.toISOString().startsWith("2026-02-03")) return "2026-02-03";
      return "2026-02-05";
    });

    mockGetSheetValues.mockImplementation(async (_sheetId: string, range: string) => {
      if (range === "'Free Entry'!A:F") {
        return [["member_id", "", "entry_type", "applicable_date", "details", "reason"]];
      }
      if (range === "Attendance!A:J") {
        return [["123", "Test Member", "2026-02-03", "Tuesday Pinelands", "Cash", "50", "Standard entry", "", ""]];
      }
      return [];
    });

    const req = new Request(
      "http://localhost/api/check-in/free-entry?member_id=123&date=2026-02-05&event=Thursday%20Pinelands",
      { method: "GET" }
    );

    const res = await GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toMatchObject({
      applies: true,
      entry_type: "Tuesday combo",
      reason: "tuesday combo",
      paid_amount_override: 0,
    });
  });

  it("returns Thursday Tuesday combo with R25 override when Tuesday attendance was teacher with no payment", async () => {
    const { GET } = await import("../app/api/check-in/free-entry/route");

    mockParseZaDateISO.mockImplementation((v?: unknown) => {
      if (v === "2026-02-05") return new Date("2026-02-05T12:00:00+02:00");
      return null;
    });

    mockGetZaWeekday.mockImplementation((d?: unknown) => {
      if (d instanceof Date && d.toISOString().startsWith("2026-02-05")) return "Thursday";
      if (d instanceof Date && d.toISOString().startsWith("2026-02-03")) return "Tuesday";
      return "Thursday";
    });

    mockFormatZaDateISO.mockImplementation((d?: unknown) => {
      if (d instanceof Date && d.toISOString().startsWith("2026-02-03")) return "2026-02-03";
      return "2026-02-05";
    });

    mockGetSheetValues.mockImplementation(async (_sheetId: string, range: string) => {
      if (range === "'Free Entry'!A:F") {
        return [["member_id", "", "entry_type", "applicable_date", "details", "reason"]];
      }
      if (range === "Attendance!A:J") {
        return [["123", "Test Member", "2026-02-03", "Tuesday Pinelands", "", "0", "Teacher", "", ""]];
      }
      return [];
    });

    const req = new Request(
      "http://localhost/api/check-in/free-entry?member_id=123&date=2026-02-05&event=Thursday%20Pinelands",
      { method: "GET" }
    );

    const res = await GET(req);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toMatchObject({
      applies: true,
      entry_type: "Tuesday combo (R25)",
      reason: "tuesday combo",
      paid_amount_override: 25,
    });
  });

  it("applies a session-count free entry while sessions remain and shows the remaining count", async () => {
    const { GET } = await import("../app/api/check-in/free-entry/route");

    mockGetSheetValues.mockImplementation(async (_sheetId: string, range: string) => {
      if (range === "'Free Entry'!A:F") {
        return [
          ["member_id", "name", "entry_type", "applicable_date", "details", "reason"],
          ["123", "Test Member", "Free session", "5 sessions", "Welcome pass", "welcome 5-pass", "", "", ""],
        ];
      }
      if (range === "Attendance!A:J") {
        // 2 of 5 already used -> this is session 3, 3 remaining
        return [
          ["member_id", "name", "date", "event", "paid_via", "paid_amount", "type", "comment", "free_entry_reason"],
          ["123", "Test Member", "2026-01-05", "Monday Plumstead", "", "0", "Free session", "", "welcome 5-pass"],
          ["123", "Test Member", "2026-01-12", "Monday Plumstead", "", "0", "Free session", "", "welcome 5-pass"],
        ];
      }
      return [];
    });

    const req = new Request(
      "http://localhost/api/check-in/free-entry?member_id=123",
      { method: "GET" }
    );

    const res = await GET(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data).toMatchObject({
      applies: true,
      entry_type: "Free session",
      reason: "welcome 5-pass",
    });
    expect(data.details).toContain("free session 3 of 5");
    expect(data.details).toContain("3 remaining");
  });

  it("labels the final remaining session as the last free session", async () => {
    const { GET } = await import("../app/api/check-in/free-entry/route");

    mockGetSheetValues.mockImplementation(async (_sheetId: string, range: string) => {
      if (range === "'Free Entry'!A:F") {
        return [
          ["member_id", "name", "entry_type", "applicable_date", "details", "reason"],
          ["123", "Test Member", "Free session", "5 sessions", "", "welcome 5-pass", "", "", ""],
        ];
      }
      if (range === "Attendance!A:J") {
        // 4 of 5 already used -> this is the 5th and last session
        return [
          ["123", "Test Member", "2026-01-05", "Monday Plumstead", "", "0", "Free session", "", "welcome 5-pass"],
          ["123", "Test Member", "2026-01-12", "Monday Plumstead", "", "0", "Free session", "", "welcome 5-pass"],
          ["123", "Test Member", "2026-01-19", "Monday Plumstead", "", "0", "Free session", "", "welcome 5-pass"],
          ["123", "Test Member", "2026-01-26", "Monday Plumstead", "", "0", "Free session", "", "welcome 5-pass"],
        ];
      }
      return [];
    });

    const req = new Request(
      "http://localhost/api/check-in/free-entry?member_id=123",
      { method: "GET" }
    );

    const res = await GET(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.applies).toBe(true);
    expect(data.details).toContain("free session 5 of 5");
    expect(data.details).toContain("last free session");
  });

  it("stops applying once the session allowance is used up (token not misread as a date)", async () => {
    const { GET } = await import("../app/api/check-in/free-entry/route");

    mockGetSheetValues.mockImplementation(async (_sheetId: string, range: string) => {
      if (range === "'Free Entry'!A:F") {
        return [
          ["member_id", "name", "entry_type", "applicable_date", "details", "reason"],
          ["123", "Test Member", "Free session", "2 sessions", "", "welcome 2-pass", "", "", ""],
        ];
      }
      if (range === "Attendance!A:J") {
        // Both sessions already used
        return [
          ["123", "Test Member", "2026-01-05", "Monday Plumstead", "", "0", "Free session", "", "welcome 2-pass"],
          ["123", "Test Member", "2026-01-12", "Monday Plumstead", "", "0", "Free session", "", "welcome 2-pass"],
        ];
      }
      return [];
    });

    const req = new Request(
      "http://localhost/api/check-in/free-entry?member_id=123",
      { method: "GET" }
    );

    const res = await GET(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.applies).toBe(false);
    expect(data.today).toBe("2026-02-03");
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

  it("records student/pensioner in column F and defaults the level to First timer", async () => {
    const { POST } = await import("../app/api/check-in/members/route");
    mockGetSheetValues.mockResolvedValue([["member_id"], ["10"]]);

    let res = await POST(
      jsonRequest("http://localhost/api/check-in/members", {
        firstName: "Stu",
        surname: "Dent",
        concession: "student",
      })
    );
    expect(res.status).toBe(200);
    expect((await res.json()).member).toMatchObject({ pensionerStudent: "Student", level: "First timer" });
    let row = (mockAppendToSheet.mock.calls[0][2] as (string | number)[][])[0];
    expect(row[4]).toBe("First timer");
    expect(row[5]).toBe("Student");

    mockAppendToSheet.mockReset();
    res = await POST(
      jsonRequest("http://localhost/api/check-in/members", {
        firstName: "Pen",
        surname: "Sioner",
        level: "2",
        concession: "pensioner",
      })
    );
    row = (mockAppendToSheet.mock.calls[0][2] as (string | number)[][])[0];
    expect(row[5]).toBe("Pensioner");

    mockAppendToSheet.mockReset();
    await POST(
      jsonRequest("http://localhost/api/check-in/members", { firstName: "No", surname: "Concession" })
    );
    row = (mockAppendToSheet.mock.calls[0][2] as (string | number)[][])[0];
    expect(row[5]).toBe("");
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

describe("GET /api/check-in/free-entry (live teaching roster)", () => {
  const TEACHERS = [
    ["member_id", "roster name", "name"],
    ["11", "Michael E", "Michael Eadie"],
    ["12", "Michael R", "Michael Rapson"],
    ["13", "Priyanka", "Priyanka K"],
    ["14", "Liam", "Liam J"],
    ["", "Kristen", ""], // guest: known name, no member id
  ];
  const ROSTER = [
    ["Date", "Venue", "L1 primary", "L1 assistant", "L2 primary", "L2 assistant", "Newcomer"],
    ["2026-10-05", "Havana", "Liam", "Priyanka (Co-teaching)", "Michael E", "", "None"],
    ["2026-10-12", "Havana", "Kristen - All level", "", "", "", "Priyanka, Michael R"],
    ["2026-10-19", "Havana", "Liam", "None", "Priyanka and Michael E", "", ""],
    ["2026-10-26", "Havana", "Mercia, Michael E and Liam and Victoria are not in CT this day"],
  ];

  let rosterReads = 0;

  beforeEach(async () => {
    mockGetSheetValues.mockReset();
    mockFormatZaDateISO.mockReset();
    mockFormatZaMonthYear.mockReset();
    mockIsZaMonday.mockReset();
    mockParseZaDateISO.mockReset();
    mockGetZaWeekday.mockReset();
    (await import("../lib/server/teacherRoster")).clearTeacherRosterCache();
    rosterReads = 0;

    mockFormatZaMonthYear.mockImplementation(() => "October 2026");
    mockIsZaMonday.mockImplementation(() => true);
    mockGetZaWeekday.mockImplementation(() => "Monday");
    mockParseZaDateISO.mockImplementation((v?: unknown) =>
      typeof v === "string" ? new Date(`${v}T12:00:00+02:00`) : null
    );

    mockGetSheetValues.mockImplementation(async (sheetId: string, range: string) => {
      if (range === "Teachers!A:B") return TEACHERS;
      if (range === "'Teaching Roster'!A:G") {
        rosterReads += 1;
        void sheetId;
        return ROSTER;
      }
      return [["member_id", "", "entry_type", "applicable_date", "details", "reason"]];
    });
  });

  async function lookup(memberId: number, date: string) {
    mockFormatZaDateISO.mockImplementation(() => date);
    const { GET } = await import("../app/api/check-in/free-entry/route");
    const res = await GET(
      new Request(
        `http://localhost/api/check-in/free-entry?member_id=${memberId}&date=${date}&event=Monday%20Plumstead`
      )
    );
    expect(res.status).toBe(200);
    return res.json();
  }

  it("gives a rostered class teacher free entry as Teacher", async () => {
    // "Priyanka (Co-teaching)" in the L1 assistant column
    const data = await lookup(13, "2026-10-05");
    expect(data).toMatchObject({ applies: true, entry_type: "Teacher", reason: "teacher" });
  });

  it("treats column G as the newcomer teacher, including comma-separated names", async () => {
    let data = await lookup(13, "2026-10-12");
    expect(data).toMatchObject({ applies: true, entry_type: "Teacher", reason: "newcomer teacher" });
    data = await lookup(12, "2026-10-12");
    expect(data).toMatchObject({ applies: true, reason: "newcomer teacher" });
  });

  it("handles 'X and Y' cells and ignores 'None'", async () => {
    expect(await lookup(13, "2026-10-19")).toMatchObject({ applies: true, reason: "teacher" });
    expect(await lookup(11, "2026-10-19")).toMatchObject({ applies: true, reason: "teacher" });
    expect((await lookup(14, "2026-10-19")).applies).toBe(true); // Liam in L1 primary
  });

  it("does not grant free entry from a cell it cannot fully recognise (guest / note)", async () => {
    // L1 primary "Kristen - All level" is not a clean known name, and the note row must not match anyone
    expect((await lookup(14, "2026-10-12")).applies).toBe(false);
    expect((await lookup(11, "2026-10-26")).applies).toBe(false);
    expect((await lookup(14, "2026-10-26")).applies).toBe(false);
  });

  it("does not apply to teachers not on the roster that day, or on dates with no roster row", async () => {
    expect((await lookup(12, "2026-10-05")).applies).toBe(false);
    expect((await lookup(13, "2026-11-02")).applies).toBe(false);
  });

  it("never reads the roster for members who are not in the Teachers tab", async () => {
    const data = await lookup(999, "2026-10-05");
    expect(data.applies).toBe(false);
    expect(rosterReads).toBe(0);
  });

  it("still lets check-in continue if the roster cannot be read", async () => {
    mockGetSheetValues.mockImplementation(async (_s: string, range: string) => {
      if (range === "Teachers!A:B") return TEACHERS;
      if (range === "'Teaching Roster'!A:G") throw new Error("no access");
      return [["member_id", "", "entry_type", "applicable_date", "details", "reason"]];
    });
    const data = await lookup(13, "2026-10-05");
    expect(data.applies).toBe(false);
  });

  it("records a rostered teacher on a monthly pass as a rollover class", async () => {
    mockGetSheetValues.mockImplementation(async (_s: string, range: string) => {
      if (range === "Teachers!A:B") return TEACHERS;
      if (range === "'Teaching Roster'!A:G") return ROSTER;
      return [
        ["member_id", "", "entry_type", "applicable_date", "details", "reason"],
        ["13", "Priyanka", "monthly", "October 2026", "paid for the month", "monthly"],
      ];
    });
    const data = await lookup(13, "2026-10-05");
    expect(data).toMatchObject({ entry_type: "Teacher", reason: "monthly rollover: teacher" });
    // newcomer teacher keeps the phrase the front end looks for
    const newcomer = await lookup(13, "2026-10-12");
    expect(newcomer.reason).toBe("monthly rollover: newcomer teacher");
  });

  it("a newcomer-teacher roster entry outranks a core 'All Mondays' row", async () => {
    mockGetSheetValues.mockImplementation(async (_s: string, range: string) => {
      if (range === "Teachers!A:B") return TEACHERS;
      if (range === "'Teaching Roster'!A:G") return ROSTER;
      return [
        ["member_id", "", "entry_type", "applicable_date", "details", "reason"],
        ["13", "Priyanka", "Core", "All Mondays", "", "core"],
      ];
    });
    const data = await lookup(13, "2026-10-12");
    expect(data).toMatchObject({ entry_type: "Teacher", reason: "newcomer teacher" });
  });
});

describe("POST /api/check-in/revert", () => {
  it("moves the row to the reverted sheet in its original (no name column) layout", async () => {
    mockAppendToSheet.mockReset();
    mockDeleteSheetRowByNumber.mockReset();
    mockParseZaDateISO.mockImplementation((v?: unknown) =>
      typeof v === "string" ? new Date(`${v}T12:00:00+02:00`) : null
    );
    mockGetSheetValues.mockResolvedValue([
      ["member_id", "name", "date", "event", "paid_via", "paid_amount", "type", "comment", "free_entry_reason"],
      ["42", "Test Member", "2026-02-03", "Monday Plumstead", "Yoco", "100", "Standard entry", "hi", "Promo"],
    ]);

    const { POST } = await import("../app/api/check-in/revert/route");
    const res = await POST(
      jsonRequest("http://localhost/api/check-in/revert", {
        member_id: 42,
        date: "2026-02-03",
        event: "Monday Plumstead",
        revert_reason: "mistake",
        rowNumber: 2,
      })
    );
    expect(res.status).toBe(200);
    expect(mockAppendToSheet.mock.calls[0][2]).toEqual([
      ["42", "2026-02-03", "Monday Plumstead", "Yoco", "100", "Standard entry", "hi", "Promo", "mistake"],
    ]);
    expect(mockDeleteSheetRowByNumber).toHaveBeenCalledWith(expect.anything(), "Attendance", 2);
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
    expect(await res.json()).toMatchObject({ ok: true });

    expect(mockAppendToSheet).toHaveBeenCalledTimes(1);
    const [spreadsheetId, range, rows] = mockAppendToSheet.mock.calls[0];
    expect(range).toBe("Attendance!A:J");

    const row = (rows as (string | number)[][])[0];
    // Column B (name) is a lookup in the sheet: never written.
    expect(row[0]).toBe(42);
    expect(row[1]).toBeNull();
    expect(row[2]).toBe("2026-02-03");
    expect(row[4]).toBe("Yoco");
    expect(row[5]).toBe(100);
    expect(row[6]).toBe("Member");
    expect(row[7]).toBe("Paid at door");
    expect(row[8]).toBe("Promo");
    // J: when it was recorded (Cape Town time), for matching against Yoco
    expect(row[9]).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);

    // spreadsheetId is passed through from config; just assert it exists
    expect(String(spreadsheetId)).toBeTruthy();
  });

  it("writes two rows when one payment covers 2 people", async () => {
    const { POST } = await import("../app/api/check-in/attendance/route");

    mockGetSheetValues.mockImplementation(async (_id: string, range: string) => {
      if (range === "Attendance!A:D") return [["7", "Test Member", "2026-02-03", "Monday Plumstead"]];
      if (range === "All_members!A:C") return [["99", "Jane", "Doe"]];
      return [];
    });

    const res = await POST(
      jsonRequest("http://localhost/api/check-in/attendance", {
        member_id: 42,
        type: "Standard entry",
        paid_via: "Yoco",
        paid_amount: 100,
        event: "Monday Plumstead",
        paid_for_member_id: 99,
      })
    );
    expect(res.status).toBe(200);

    expect(mockAppendToSheet).toHaveBeenCalledTimes(1);
    const rows = mockAppendToSheet.mock.calls[0][2] as (string | number)[][];
    expect(rows).toHaveLength(2);
    expect(rows[0][9]).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/);
    expect(rows[1][9]).toBe(rows[0][9]);
    expect(rows[0].slice(0, 8)).toEqual([
      42, null, "2026-02-03", "Monday Plumstead", "Yoco", 200, "Standard entry", "paid for 99",
    ]);
    expect(rows[1].slice(0, 8)).toEqual([
      99, null, "2026-02-03", "Monday Plumstead", "", 0, "Standard entry", "paid by 42",
    ]);
  });

  it("rejects paying for someone already checked in, or for yourself", async () => {
    const { POST } = await import("../app/api/check-in/attendance/route");

    mockGetSheetValues.mockImplementation(async (_id: string, range: string) => {
      if (range === "Attendance!A:D") return [["99", "Test Member", "2026-02-03", "Monday Plumstead"]];
      if (range === "All_members!A:C") return [["99", "Jane", "Doe"]];
      return [];
    });

    const base = {
      member_id: 42,
      type: "Standard entry",
      paid_via: "Yoco",
      paid_amount: 100,
      event: "Monday Plumstead",
    };
    let res = await POST(
      jsonRequest("http://localhost/api/check-in/attendance", { ...base, paid_for_member_id: 99 })
    );
    expect(res.status).toBe(409);
    res = await POST(
      jsonRequest("http://localhost/api/check-in/attendance", { ...base, paid_for_member_id: 42 })
    );
    expect(res.status).toBe(400);
    expect(mockAppendToSheet).not.toHaveBeenCalled();
  });

  it("adds a monthly pass to Free Entry without writing column B", async () => {
    const { POST } = await import("../app/api/check-in/attendance/route");
    mockFormatZaMonthYear.mockImplementation(() => "February 2026");
    mockGetSheetValues.mockResolvedValue([]);

    const res = await POST(
      jsonRequest("http://localhost/api/check-in/attendance", {
        member_id: 42,
        type: "Monthly",
        paid_via: "Yoco",
        paid_amount: 300,
        event: "Monday Plumstead",
      })
    );
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ free_entry_added: true });

    const freeEntryCall = mockAppendToSheet.mock.calls.find((c) => c[1] === "'Free Entry'!A:F");
    expect(freeEntryCall).toBeTruthy();
    const row = (freeEntryCall![2] as unknown[][])[0];
    expect(row).toEqual([42, null, "monthly", "February 2026", expect.any(String), "monthly"]);
  });

  it("still adds the Free Entry month when the pass is fully covered by rollover credit (R0)", async () => {
    const { POST } = await import("../app/api/check-in/attendance/route");
    mockFormatZaMonthYear.mockImplementation(() => "November 2026");
    mockGetSheetValues.mockResolvedValue([]);

    const res = await POST(
      jsonRequest("http://localhost/api/check-in/attendance", {
        member_id: 8,
        type: "Monthly",
        paid_via: "Cash",
        paid_amount: 0,
        event: "Monday Plumstead",
      })
    );
    expect(await res.json()).toMatchObject({ free_entry_added: true });
  });

  it("a monthly pass bought with rollover credit is still a purchase and carries the fixed reason", async () => {
    const { POST } = await import("../app/api/check-in/attendance/route");
    mockFormatZaMonthYear.mockImplementation(() => "November 2026");
    mockGetSheetValues.mockResolvedValue([]);

    const res = await POST(
      jsonRequest("http://localhost/api/check-in/attendance", {
        member_id: 8,
        type: "Monthly",
        paid_via: "Yoco",
        paid_amount: 262.5,
        comment: "Rollover credit used: R37.50 (from 1 day volunteered)",
        free_entry_reason: "rollover_credit",
        event: "Monday Plumstead",
      })
    );
    expect(await res.json()).toMatchObject({ free_entry_added: true });
    const row = (mockAppendToSheet.mock.calls[0][2] as unknown[][])[0];
    expect(row[5]).toBe(262.5);
    expect(row[8]).toBe("rollover_credit");
  });

  it("records a welcoming committee check-in with a custom amount", async () => {
    const { POST } = await import("../app/api/check-in/attendance/route");
    const res = await POST(
      jsonRequest("http://localhost/api/check-in/attendance", {
        member_id: 5,
        type: "Welcoming committee",
        paid_via: "Cash",
        paid_amount: 30,
        free_entry_reason: "welcoming committee",
        event: "Monday Plumstead",
      })
    );
    expect(res.status).toBe(200);
    const rows = mockAppendToSheet.mock.calls[0][2] as (string | number)[][];
    expect(rows[0][5]).toBe(30);
    expect(rows[0][6]).toBe("Welcoming committee");
    expect(rows[0][8]).toBe("welcoming committee");
    expect(mockAppendToSheet).toHaveBeenCalledTimes(1); // not a monthly pass
  });

  it("works out the rollover credit since the member's last monthly purchase", async () => {
    const { GET } = await import("../app/api/check-in/already-checked-in/route");
    mockFormatZaDateISO.mockImplementation(() => "2026-11-02");
    const H = ["member_id", "name", "date", "event", "paid_via", "paid_amount", "type", "comment", "free_entry_reason"];
    const ev = "Monday Plumstead";
    mockGetSheetValues.mockResolvedValue([
      H,
      // Rei (7): pays for the month, volunteers once, then attends normally
      ["7", "Rei", "2026-10-05", ev, "Yoco", "300", "Monthly", "", ""],
      ["7", "Rei", "2026-10-12", ev, "", "0", "Welcoming committee", "", "monthly rollover: welcoming committee"],
      ["7", "Rei", "2026-10-19", ev, "", "0", "monthly", "", "monthly"],
      ["7", "Rei", "2026-10-26", ev, "", "0", "monthly", "", "monthly"],
      // Ada (8): old credit used up by a later purchase, then teaches twice
      ["8", "Ada", "2026-09-07", ev, "Cash", "300", "Monthly", "", ""],
      ["8", "Ada", "2026-09-14", ev, "", "0", "Teacher", "", "monthly rollover: teacher"],
      ["8", "Ada", "2026-10-05", ev, "Cash", "262.5", "Monthly", "", ""],
      ["8", "Ada", "2026-10-12", ev, "", "0", "Teacher", "", "monthly rollover: newcomer teacher"],
      ["8", "Ada", "2026-10-19", ev, "", "0", "Teacher", "", "monthly rollover: teacher"],
      // Cy (10): volunteers on a pass, then spends R20 of the credit on a day entry
      ["10", "Cy", "2026-10-05", ev, "Yoco", "300", "Monthly", "", ""],
      ["10", "Cy", "2026-10-12", ev, "", "0", "Welcoming committee", "", "monthly rollover: welcoming committee"],
      ["10", "Cy", "2026-11-02", ev, "Cash", "80", "Standard entry", "Rollover credit used: R20.00 (from 1 day volunteered)", "rollover_credit"],
      // Em (12): pass bought WITH credit (reason rollover_credit) still resets the count
      ["12", "Em", "2026-09-07", ev, "Yoco", "300", "Monthly", "", ""],
      ["12", "Em", "2026-09-14", ev, "", "0", "Welcoming committee", "", "monthly rollover: welcoming committee"],
      ["12", "Em", "2026-10-05", ev, "Yoco", "262.5", "Monthly", "Rollover credit used: R37.50 (from 1 day volunteered)", "rollover_credit"],
      // someone else's rows never count
      ["9", "Bo", "2026-10-12", ev, "", "0", "Teacher", "", "monthly rollover: teacher"],
    ]);

    const credit = async (id: number) =>
      (
        await (
          await GET(
            new Request(
              `http://localhost/api/check-in/already-checked-in?member_id=${id}&date=2026-11-02&event=Monday%20Plumstead`
            )
          )
        ).json()
      ).rolloverCredit;

    const none = { teacherClasses: 0, volunteerClasses: 0 };
    expect(await credit(7)).toEqual({ teacherClasses: 0, volunteerClasses: 1, creditUsed: 0, earlierThisMonth: none });
    expect(await credit(8)).toEqual({ teacherClasses: 2, volunteerClasses: 0, creditUsed: 0, earlierThisMonth: none });
    expect(await credit(10)).toEqual({ teacherClasses: 0, volunteerClasses: 1, creditUsed: 20, earlierThisMonth: none });
    expect(await credit(12)).toEqual({ teacherClasses: 0, volunteerClasses: 0, creditUsed: 0, earlierThisMonth: none });
    expect(await credit(99)).toEqual({ teacherClasses: 0, volunteerClasses: 0, creditUsed: 0, earlierThisMonth: none });
  });

  it("counts teaching / volunteering earlier this month (no pass) towards a monthly purchase", async () => {
    const { GET } = await import("../app/api/check-in/already-checked-in/route");
    mockFormatZaDateISO.mockImplementation(() => "2026-10-12");
    const H = ["member_id", "name", "date", "event", "paid_via", "paid_amount", "type", "comment", "free_entry_reason"];
    const ev = "Monday Plumstead";
    mockGetSheetValues.mockResolvedValue([
      H,
      // Rei (7): pays R50 as door volunteer in week 1 (no pass), now week 2
      ["7", "Rei", "2026-10-05", ev, "Cash", "50", "Welcoming committee", "", "welcoming committee"],
      // Ada (8): teaches for free in week 1 (roster), plus a September teaching day
      ["8", "Ada", "2026-09-28", ev, "", "0", "Teacher", "", "teacher"],
      ["8", "Ada", "2026-10-05", ev, "", "0", "Teacher", "", "newcomer teacher"],
      // Cy (10): volunteered in week 1, then bought a pass the same week: nothing left
      ["10", "Cy", "2026-10-05", ev, "Cash", "50", "Welcoming committee", "", "welcoming committee"],
      ["10", "Cy", "2026-10-05", ev, "Yoco", "300", "Monthly", "", ""],
      // Di (11): ordinary paying entries never count
      ["11", "Di", "2026-10-05", ev, "Yoco", "100", "Standard entry", "", ""],
    ]);
    const credit = async (id: number) =>
      (
        await (
          await GET(
            new Request(
              `http://localhost/api/check-in/already-checked-in?member_id=${id}&date=2026-10-12&event=Monday%20Plumstead`
            )
          )
        ).json()
      ).rolloverCredit;

    expect((await credit(7)).earlierThisMonth).toEqual({ teacherClasses: 0, volunteerClasses: 1 });
    // only this month's teaching day counts (the September one does not)
    expect((await credit(8)).earlierThisMonth).toEqual({ teacherClasses: 1, volunteerClasses: 0 });
    expect((await credit(10)).earlierThisMonth).toEqual({ teacherClasses: 0, volunteerClasses: 0 });
    expect((await credit(11)).earlierThisMonth).toEqual({ teacherClasses: 0, volunteerClasses: 0 });
  });

  it("flags when a welcoming committee member has already checked in today", async () => {
    const { GET } = await import("../app/api/check-in/already-checked-in/route");
    mockFormatZaDateISO.mockImplementation(() => "2026-10-12");
    mockGetSheetValues.mockResolvedValue([
      ["member_id", "name", "date", "event", "paid_via", "paid_amount", "type", "comment", "free_entry_reason"],
      ["5", "Test Member", "2026-10-12", "Monday Plumstead", "Cash", "50", "Welcoming committee", "", "welcoming committee"],
      ["6", "Test Member", "2026-10-05", "Monday Plumstead", "", "0", "Welcoming committee", "", "welcoming committee"],
    ]);

    const call = async (id: number, date: string) =>
      (
        await GET(
          new Request(
            `http://localhost/api/check-in/already-checked-in?member_id=${id}&date=${date}&event=Monday%20Plumstead`
          )
        )
      ).json();

    expect(await call(9, "2026-10-12")).toMatchObject({
      alreadyCheckedIn: false,
      welcomingCommitteeCheckedIn: true,
    });
    expect(await call(5, "2026-10-12")).toMatchObject({ alreadyCheckedIn: true });
    // a volunteer from a different week doesn't count
    expect(await call(9, "2026-10-19")).toMatchObject({ welcomingCommitteeCheckedIn: false });
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

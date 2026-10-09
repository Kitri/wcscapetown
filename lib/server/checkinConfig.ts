export const CHECKIN_SPREADSHEET_ID =
  process.env.SHEET_ID_CHECKIN_DB ??
  "1NIWwqsGhRhXIQeYpU9eo8ZQaGXi8rq8VTom7l6jCI-8";

export const CHECKIN_PASSCODE =
  process.env.CHECKIN_PASSCODE ?? "wcs&a1&a2";

export const CHECKIN_EVENT_NAME = "Monday Class + Social";

export const CHECKIN_AUTH_COOKIE_NAME = "checkin_auth";

// Live teaching roster (separate spreadsheet). Column A = date (yyyy-mm-dd),
// C-F = class teachers, G = newcomer teacher. Must be shared with the service account.
export const ROSTER_SPREADSHEET_ID =
  process.env.SHEET_ID_TEACHING_ROSTER ??
  "1ex8PWN4RM8m0og0hJ8k1KjniAkL7HGJiEMWhS_80Mh8";

export const ROSTER_SHEET_TAB = "Teaching Roster";

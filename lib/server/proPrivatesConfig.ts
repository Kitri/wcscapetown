export const PRO_PRIVATES_SPREADSHEET_ID = process.env.SHEET_ID_WEEKEND_PRIVATES ?? "";
export const PRO_PRIVATES_PASSCODE = process.env.PRO_PRIVATES_PASSCODE ?? "pro123";
export const PRO_PRIVATES_IF_PASSCODE =
  process.env.PRO_PRIVATES_IF_PASSCODE ?? process.env.PRO_PRIVATES_PRO_PASSCODE ?? "IF_CT";
export const PRO_PRIVATES_HAROLD_PASSCODE =
  process.env.PRO_PRIVATES_HAROLD_PASSCODE ?? "hb_ct";
export const PRO_PRIVATES_KRISTEN_PASSCODE =
  process.env.PRO_PRIVATES_KRISTEN_PASSCODE ?? "kw_ct";
export const PRO_PRIVATES_PRO_SESSION_MAX_AGE = 60 * 60 * 24 * 365 * 10; // 10 years
export const PRO_PRIVATES_AUTH_COOKIE_NAME = "pro_privates_auth";

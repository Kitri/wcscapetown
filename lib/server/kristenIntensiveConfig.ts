// Kristen Wallace intensive — 16 December 2026
// Registrations are written to the "Kristen Workshop" Google Sheet (shared with the service account).
// Columns: A=Timestamp B=Email C=First Name D=Surname E=Role F=Level G=OrderID H=Status I=payment_id

export const KRISTEN_INTENSIVE_SHEET_ID =
  process.env.SHEET_ID_KRISTEN_INTENSIVE ??
  "1wQUScAICNHSILVZ5nYFlF9ZEjJlo6VJB98cgO2wnGKk";

// Tab name in the sheet (it was copied from the Swing Strong sheet, hence the name).
export const KRISTEN_INTENSIVE_SHEET_TAB = "Jeff Workshop";

export const KRISTEN_INTENSIVE_RANGE = `'${KRISTEN_INTENSIVE_SHEET_TAB}'!A:I`;

export const KRISTEN_INTENSIVE_PRICE_CENTS = 25000; // R250

export const KRISTEN_INTENSIVE_YOCO_SOURCE = "kristen_intensive";

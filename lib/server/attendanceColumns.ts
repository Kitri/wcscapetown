// Column positions (0-based) of the "Attendance" sheet.
// Column B (name) is a lookup formula in the sheet: the app never writes to it.
export const ATT_COL = {
  memberId: 0, // A
  name: 1, // B (lookup, not written)
  date: 2, // C
  event: 3, // D
  paidVia: 4, // E
  amount: 5, // F
  type: 6, // G
  comment: 7, // H
  reason: 8, // I (free_entry_reason)
  timestamp: 9, // J (when the check-in was recorded, Cape Town time)
} as const;

export const ATTENDANCE_RANGE = "Attendance!A:J";

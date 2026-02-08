import { google } from "googleapis";

// Parse the private key properly, handling both formats
function parsePrivateKey(key: string | undefined): string | undefined {
  if (!key) return undefined;

  // If the key contains literal \\n strings, replace them with actual newlines
  const parsedKey = key.replace(/\\n/g, "\n");

  // Ensure the key has proper BEGIN and END markers
  if (!parsedKey.includes("-----BEGIN PRIVATE KEY-----")) {
    console.error("Invalid private key format: missing BEGIN marker");
  }

  return parsedKey;
}

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: parsePrivateKey(process.env.GOOGLE_PRIVATE_KEY),
  },
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const sheets = google.sheets({ version: "v4", auth });

export async function getSheetValues(
  spreadsheetId: string,
  range: string
): Promise<string[][]> {
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    const values = response.data.values ?? [];
    return values.map((row) => row.map((cell) => String(cell ?? "")));
  } catch (error) {
    console.error("Error reading sheet:", error);
    throw error;
  }
}

export async function appendToSheet(
  spreadsheetId: string,
  range: string,
  values: (string | number)[][]
) {
  try {
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: "RAW",
      requestBody: {
        values,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error appending to sheet:", error);
    throw error;
  }
}

export async function updateSheetValues(
  spreadsheetId: string,
  range: string,
  values: (string | number)[][]
) {
  try {
    const response = await sheets.spreadsheets.values.update({
      spreadsheetId,
      range,
      valueInputOption: "RAW",
      requestBody: { values },
    });
    return response.data;
  } catch (error) {
    console.error("Error updating sheet:", error);
    throw error;
  }
}

import { google } from 'googleapis';

let sheets = null;

async function getSheetsClient() {
  if (sheets) return sheets;

  const credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS || '{}');

  if (!credentials.client_email) {
    console.log('Google Sheets not configured - skipping');
    return null;
  }

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  });

  sheets = google.sheets({ version: 'v4', auth });
  return sheets;
}

export async function logSubmission({ userId, userName, problem, solution, timeSaved, reusableBy, polishedSummary }) {
  const client = await getSheetsClient();
  if (!client) return;

  const spreadsheetId = process.env.GOOGLE_SHEET_ID;
  if (!spreadsheetId) {
    console.log('GOOGLE_SHEET_ID not configured - skipping');
    return;
  }

  const timestamp = new Date().toISOString();

  try {
    await client.spreadsheets.values.append({
      spreadsheetId,
      range: 'Submissions!A:G',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[
          timestamp,
          userName || userId,
          problem,
          solution,
          timeSaved,
          reusableBy,
          polishedSummary
        ]]
      }
    });
    console.log('Submission logged to Google Sheets');
  } catch (error) {
    console.error('Failed to log to Google Sheets:', error.message);
  }
}

export async function logHelpRequest({ userId, userName, challenge, category, matchedTools, aiResponse }) {
  const client = await getSheetsClient();
  if (!client) return;

  const spreadsheetId = process.env.GOOGLE_SHEET_ID;
  if (!spreadsheetId) {
    console.log('GOOGLE_SHEET_ID not configured - skipping');
    return;
  }

  const timestamp = new Date().toISOString();

  try {
    await client.spreadsheets.values.append({
      spreadsheetId,
      range: 'Help Requests!A:F',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[
          timestamp,
          userName || userId,
          challenge,
          category || 'Uncategorized',
          matchedTools || 'None',
          aiResponse
        ]]
      }
    });
    console.log('Help request logged to Google Sheets');
  } catch (error) {
    console.error('Failed to log help request to Google Sheets:', error.message);
  }
}

// Cache for submissions to avoid hitting API too often
let submissionsCache = null;
let cacheTimestamp = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function getApprovedSubmissions() {
  // Return cached data if fresh
  if (submissionsCache && (Date.now() - cacheTimestamp) < CACHE_TTL) {
    return submissionsCache;
  }

  const client = await getSheetsClient();
  if (!client) return [];

  const spreadsheetId = process.env.GOOGLE_SHEET_ID;
  if (!spreadsheetId) return [];

  try {
    const response = await client.spreadsheets.values.get({
      spreadsheetId,
      range: 'Submissions!A:H', // Include column H for "approved" status
    });

    const rows = response.data.values || [];
    if (rows.length <= 1) return []; // Only header row or empty

    // Skip header row, parse submissions
    const submissions = rows.slice(1).map(row => ({
      timestamp: row[0],
      name: row[1],
      problem: row[2],
      solution: row[3],
      timeSaved: row[4],
      reusableBy: row[5],
      polishedSummary: row[6],
      approved: row[7]?.toLowerCase() === 'yes' || row[7]?.toLowerCase() === 'true'
    }));

    // Filter to only approved submissions (or all if no approval column used yet)
    const hasApprovalColumn = rows[0]?.length >= 8;
    const filtered = hasApprovalColumn
      ? submissions.filter(s => s.approved)
      : submissions; // If no approval column, include all

    submissionsCache = filtered;
    cacheTimestamp = Date.now();

    console.log(`Loaded ${filtered.length} submissions for context`);
    return filtered;
  } catch (error) {
    console.error('Failed to read submissions:', error.message);
    return submissionsCache || []; // Return stale cache if available
  }
}

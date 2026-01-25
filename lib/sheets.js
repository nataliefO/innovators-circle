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

// Columns: A=timestamp, B=userName, C=problem, D=solution, E=timeSaved, F=reusableBy, G=polishedSummary, H=status, I=userId
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
      range: 'Submissions!A:I',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[
          timestamp,
          userName || userId,
          problem,
          solution,
          timeSaved,
          reusableBy,
          polishedSummary,
          'pending', // H: status (pending, approved, declined)
          userId     // I: userId for notifications
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

// Parse a row into a submission object
function parseSubmissionRow(row, rowIndex) {
  return {
    rowNumber: rowIndex + 2, // +2 because: 1-indexed + skip header
    timestamp: row[0],
    name: row[1],
    problem: row[2],
    solution: row[3],
    timeSaved: row[4],
    reusableBy: row[5],
    polishedSummary: row[6],
    status: row[7]?.toLowerCase() || 'pending', // pending, approved, declined
    userId: row[8] || null
  };
}

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
      range: 'Submissions!A:I',
    });

    const rows = response.data.values || [];
    if (rows.length <= 1) return []; // Only header row or empty

    // Skip header row, parse submissions
    const submissions = rows.slice(1).map((row, i) => parseSubmissionRow(row, i));

    // Filter to only approved submissions
    // Support both old format (yes/true in col H) and new format (approved status)
    const filtered = submissions.filter(s =>
      s.status === 'approved' || s.status === 'yes' || s.status === 'true'
    );

    submissionsCache = filtered;
    cacheTimestamp = Date.now();

    console.log(`Loaded ${filtered.length} approved submissions for context`);
    return filtered;
  } catch (error) {
    console.error('Failed to read submissions:', error.message);
    return submissionsCache || []; // Return stale cache if available
  }
}

// Get pending submissions (admin only)
export async function getPendingSubmissions() {
  const client = await getSheetsClient();
  if (!client) return [];

  const spreadsheetId = process.env.GOOGLE_SHEET_ID;
  if (!spreadsheetId) return [];

  try {
    const response = await client.spreadsheets.values.get({
      spreadsheetId,
      range: 'Submissions!A:I',
    });

    const rows = response.data.values || [];
    if (rows.length <= 1) return [];

    const submissions = rows.slice(1).map((row, i) => parseSubmissionRow(row, i));

    // Return pending submissions (or those with no status yet)
    return submissions.filter(s => s.status === 'pending' || s.status === '');
  } catch (error) {
    console.error('Failed to read pending submissions:', error.message);
    return [];
  }
}

// Get all innovators (people with approved submissions) - grouped by person
export async function getInnovators() {
  const approved = await getApprovedSubmissions();

  // Group by name
  const innovatorMap = {};
  for (const sub of approved) {
    const name = sub.name || 'Unknown';
    if (!innovatorMap[name]) {
      innovatorMap[name] = [];
    }
    innovatorMap[name].push({
      problem: sub.problem,
      solution: sub.solution,
      timeSaved: sub.timeSaved,
      timestamp: sub.timestamp
    });
  }

  return innovatorMap;
}

// Update submission status (approve/decline)
export async function updateSubmissionStatus(rowNumber, status) {
  const client = await getSheetsClient();
  if (!client) return false;

  const spreadsheetId = process.env.GOOGLE_SHEET_ID;
  if (!spreadsheetId) return false;

  try {
    await client.spreadsheets.values.update({
      spreadsheetId,
      range: `Submissions!H${rowNumber}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[status]]
      }
    });

    // Clear cache so next read gets fresh data
    submissionsCache = null;
    cacheTimestamp = 0;

    console.log(`Updated submission row ${rowNumber} to status: ${status}`);
    return true;
  } catch (error) {
    console.error('Failed to update submission status:', error.message);
    return false;
  }
}

// Get a specific submission by row number
export async function getSubmissionByRow(rowNumber) {
  const client = await getSheetsClient();
  if (!client) return null;

  const spreadsheetId = process.env.GOOGLE_SHEET_ID;
  if (!spreadsheetId) return null;

  try {
    const response = await client.spreadsheets.values.get({
      spreadsheetId,
      range: `Submissions!A${rowNumber}:I${rowNumber}`,
    });

    const rows = response.data.values || [];
    if (rows.length === 0) return null;

    return parseSubmissionRow(rows[0], rowNumber - 2);
  } catch (error) {
    console.error('Failed to get submission:', error.message);
    return null;
  }
}

// Cron endpoint to send pending submission reminders
// Configure in vercel.json to run daily (e.g., 9am)

import { getPendingSubmissions } from '../../lib/sheets.js';
import { sendPendingReminder } from '../../lib/slack.js';

export default async function handler(req, res) {
  // Verify this is a legitimate cron request (Vercel adds this header)
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    // Also allow manual trigger from admin for testing
    if (req.method !== 'POST' || req.headers['x-admin-secret'] !== process.env.CRON_SECRET) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  }

  try {
    const pending = await getPendingSubmissions();

    if (pending.length > 0) {
      await sendPendingReminder(pending.length);
      console.log(`Sent reminder for ${pending.length} pending submissions`);
    } else {
      console.log('No pending submissions to remind about');
    }

    return res.status(200).json({
      success: true,
      pendingCount: pending.length,
      reminderSent: pending.length > 0
    });
  } catch (error) {
    console.error('Cron reminder error:', error);
    return res.status(500).json({ error: 'Failed to send reminder' });
  }
}

import { WebClient } from '@slack/web-api';

let client = null;

function getClient() {
  if (!client) {
    client = new WebClient(process.env.SLACK_BOT_TOKEN);
  }
  return client;
}

export async function sendDM(userId, text) {
  const slack = getClient();
  await slack.chat.postMessage({
    channel: userId,
    text
  });
}

export async function postToChannel(text) {
  const slack = getClient();
  await slack.chat.postMessage({
    channel: process.env.SLACK_CHANNEL_ID,
    text
  });
}

export async function getUserName(userId) {
  try {
    const slack = getClient();
    const result = await slack.users.info({ user: userId });
    return result.user.real_name || result.user.name;
  } catch (error) {
    console.error('Error getting user name:', error.message);
    return null;
  }
}

export async function notifyAdmin(userId, polishedSummary) {
  const adminUserId = process.env.ADMIN_USER_ID;
  if (!adminUserId || adminUserId === 'YOUR_USER_ID_HERE') {
    console.log('ADMIN_USER_ID not configured, skipping notification');
    return;
  }

  const message = `🎉 *New Innovators Circle Submission!*\n\n` +
    `Submitted by: <@${userId}>\n\n` +
    `${polishedSummary}\n\n` +
    `_Use \`/pending\` to review and approve/decline._`;

  await sendDM(adminUserId, message);
}

// Send reminder about pending submissions
export async function sendPendingReminder(pendingCount) {
  const adminUserId = process.env.ADMIN_USER_ID;
  if (!adminUserId || adminUserId === 'YOUR_USER_ID_HERE') {
    return;
  }

  if (pendingCount === 0) return;

  const message = `📬 *Reminder: ${pendingCount} submission${pendingCount > 1 ? 's' : ''} awaiting review*\n\n` +
    `Use \`/pending\` to see them and \`/approve\` or \`/decline\` to process.`;

  await sendDM(adminUserId, message);
}

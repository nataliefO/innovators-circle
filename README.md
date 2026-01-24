# Innovators Circle Bot

A Slack bot that collects AI solution submissions from employees, polishes them with OpenAI, and shares them with the team.

## Overview

The Innovators Circle Bot helps capture and share how employees are using AI to solve problems. Users interact with the bot through a simple 4-question conversation:

1. What problem did you solve?
2. What AI tool/solution did you use?
3. How much time did it save?
4. Who else could benefit?

The bot then uses GPT-4o-mini to polish the submission and posts it to a designated channel.

## Setup Instructions

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd innovators-circle-bot
npm install
```

### 2. Environment Variables

Copy the example env file:

```bash
cp .env.example .env
```

Fill in the required values (see Slack App Configuration below for where to find them):

- `SLACK_BOT_TOKEN` - Bot User OAuth Token from Slack
- `SLACK_SIGNING_SECRET` - Signing Secret from Slack
- `SLACK_CHANNEL_ID` - Channel ID where submissions are posted
- `OPENAI_API_KEY` - Your OpenAI API key

## Slack App Configuration

### Create the App

1. Go to [api.slack.com/apps](https://api.slack.com/apps)
2. Click **Create New App** → **From scratch**
3. Name it "Innovators Circle Bot"
4. Select your workspace

### Configure OAuth & Permissions

1. Go to **OAuth & Permissions** in the sidebar
2. Under **Bot Token Scopes**, add:
   - `chat:write`
   - `commands`
   - `im:history`
   - `im:write`
   - `im:read`
   - `users:read`
3. Click **Install to Workspace** at the top
4. Copy the **Bot User OAuth Token** (starts with `xoxb-`) → this is your `SLACK_BOT_TOKEN`

### Get Signing Secret

1. Go to **Basic Information** in the sidebar
2. Under **App Credentials**, copy the **Signing Secret** → this is your `SLACK_SIGNING_SECRET`

### Enable Event Subscriptions

1. Go to **Event Subscriptions** in the sidebar
2. Toggle **Enable Events** to On
3. Set the **Request URL** to: `https://[your-vercel-domain]/api/slack`
4. Under **Subscribe to bot events**, add:
   - `message.im`
5. Click **Save Changes**

### Create Slash Command

1. Go to **Slash Commands** in the sidebar
2. Click **Create New Command**
3. Configure:
   - **Command:** `/innovators`
   - **Request URL:** `https://[your-vercel-domain]/api/slack`
   - **Short Description:** "Submit a solution to The Innovators Circle"
4. Click **Save**

### Get Channel ID

1. In Slack, right-click the channel where submissions should be posted
2. Click **View channel details**
3. Scroll to the bottom and copy the **Channel ID** → this is your `SLACK_CHANNEL_ID`
4. Make sure to invite the bot to this channel!

## Local Development

### Using ngrok

1. Install ngrok: `npm install -g ngrok`
2. Start ngrok: `ngrok http 3000`
3. Copy the HTTPS URL (e.g., `https://abc123.ngrok.io`)
4. Update your Slack app URLs to use the ngrok URL:
   - Event Subscriptions Request URL: `https://abc123.ngrok.io/api/slack`
   - Slash Command Request URL: `https://abc123.ngrok.io/api/slack`
5. Run the dev server: `npm run dev`

## Deploy to Vercel

### Initial Deployment

1. Install Vercel CLI: `npm install -g vercel`
2. Run `vercel` and follow the prompts to link your project
3. Add environment variables in the [Vercel Dashboard](https://vercel.com):
   - Go to your project → Settings → Environment Variables
   - Add all variables from your `.env` file
4. Deploy: `vercel --prod`
5. Update your Slack app URLs to point to your Vercel domain

### Subsequent Deployments

```bash
npm run deploy
```

Or connect your GitHub repo to Vercel for automatic deployments.

## Usage

1. User types `/innovators` in any Slack channel
2. Bot sends a DM with the first question
3. User answers each question in the DM
4. Bot polishes the submission with AI
5. Polished submission is posted to the designated channel

Users can type `cancel` at any time to abort their submission.

## Scaling: Persistent Session Storage

The current MVP uses in-memory session storage, which works for low-volume usage but has limitations:
- Sessions are lost when serverless functions cold start
- Sessions aren't shared across function instances

When you're ready to scale, upgrade to Vercel KV (Redis):

1. Enable Vercel KV in your project dashboard
2. Install the package: `npm install @vercel/kv`
3. Update `lib/sessions.js`:

```javascript
import { kv } from '@vercel/kv';

const SESSION_TTL = 3600; // 1 hour

export async function getSession(userId) {
  return await kv.get(`session:${userId}`);
}

export async function setSession(userId, data) {
  await kv.set(`session:${userId}`, data, { ex: SESSION_TTL });
}

export async function deleteSession(userId) {
  await kv.del(`session:${userId}`);
}

export function createSubmissionSession(userId) {
  const data = {
    step: 'problem',
    problem: null,
    solution: null,
    timeSaved: null,
    reusableBy: null
  };
  await setSession(userId, data);
  return data;
}

export async function updateSession(userId, updates) {
  const current = await getSession(userId);
  if (!current) return null;

  const updated = { ...current, ...updates };
  await setSession(userId, updated);
  return updated;
}
```

4. Update the Slack handlers to use `await` with all session functions
5. Redeploy

## Project Structure

```
innovators-circle-bot/
├── api/
│   └── slack.js        # Main Slack event handler
├── lib/
│   ├── openai.js       # OpenAI integration
│   ├── sessions.js     # Session management
│   └── slack.js        # Slack API utilities
├── .env.example        # Environment variables template
├── package.json
├── vercel.json         # Vercel configuration
└── README.md
```

## Troubleshooting

**Bot doesn't respond to slash command:**
- Check that the Request URL is correct and accessible
- Verify the bot is installed to your workspace
- Check Vercel function logs for errors

**Bot doesn't respond to DMs:**
- Ensure `message.im` event is subscribed
- Verify Event Subscriptions Request URL is correct
- Check that the bot has `im:history` and `im:read` scopes

**Submissions don't post to channel:**
- Verify the bot is invited to the channel
- Check that `SLACK_CHANNEL_ID` is correct
- Ensure the bot has `chat:write` scope

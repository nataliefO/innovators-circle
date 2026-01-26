# Innovators Agent

A Slack bot for the Innovators Circle program that helps employees discover AI solutions, submit their wins, and learn from each other's successes.

## Features

### For All Users
- **`/submit`** - Share an AI win through a guided 4-question flow
- **`/help`** - Get AI tool recommendations for work challenges (conversational)
- **`/chat`** - General conversation about AI and productivity
- **`/tools`** - Browse all approved AI tools
- **`/tools [search]`** - Search tools by keyword (e.g., `/tools writing`)
- **`/workflows [team]`** - View AI workflows by team (e.g., `/workflows sales`)
- **`/tip`** - Get a random AI tip or see a recent employee win
- **`/innovators-circle`** - View the hall of fame of approved submissions
- **`/commands`** - List all available commands
- **`/new`** - Start a fresh conversation

### Admin Only
- **`/pending`** - View submissions awaiting approval
- **`/approve [row]`** - Approve a submission (user gets notified)
- **`/decline [row]`** - Decline a submission (user gets gentle notification)
- **Daily reminders** - Automatic Slack DM when submissions are pending

## Access Control

The bot operates in private mode by default. Only allowed users can interact with it.

**To add users**, edit `api/slack.js`:
```javascript
const ALLOWED_USERS = [
  process.env.ADMIN_USER_ID,
  'U57RY52DP',
  'UMMN64FNF',
  // Add more Slack user IDs here
];
```

**To open to everyone**, set `PRIVATE_MODE = false` in `api/slack.js`.

## Setup Instructions

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd innovator-bot
npm install
```

### 2. Environment Variables

Create a `.env` file with these variables:

```bash
# Slack Configuration
SLACK_BOT_TOKEN=xoxb-your-bot-token
SLACK_SIGNING_SECRET=your-signing-secret
SLACK_CHANNEL_ID=C0123456789
ADMIN_USER_ID=U0123456789

# OpenAI Configuration
OPENAI_API_KEY=sk-your-openai-key

# Google Sheets Configuration (for logging submissions)
GOOGLE_SHEET_ID=your-spreadsheet-id
GOOGLE_CREDENTIALS={"type":"service_account",...}

# Upstash Redis Configuration (for session persistence)
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-redis-token

# Cron Secret (for scheduled reminders)
CRON_SECRET=your-random-secret-string
```

### 3. Google Sheets Setup

1. Create a Google Cloud project and enable the Sheets API
2. Create a service account and download the JSON credentials
3. Create a Google Sheet with two tabs:
   - **Submissions** - Columns: Timestamp, Name, Problem, Solution, Time Saved, Reusable By, Polished Summary, Status, UserId
   - **Help Requests** - Columns: Timestamp, Name, Challenge, Category, Matched Tools, AI Response
4. Share the sheet with the service account email
5. Add the spreadsheet ID and credentials JSON to your environment variables

### 4. Upstash Redis Setup

1. Create an account at [console.upstash.com](https://console.upstash.com)
2. Create a new Redis database
3. Copy the REST URL and REST Token to your environment variables

## Slack App Configuration

### Create the App

1. Go to [api.slack.com/apps](https://api.slack.com/apps)
2. Click **Create New App** → **From scratch**
3. Name it "Innovators Agent"
4. Select your workspace

### Configure OAuth & Permissions

Go to **OAuth & Permissions** and add these **Bot Token Scopes**:
- `chat:write` - Send messages
- `commands` - Handle slash commands
- `im:history` - Read DM history
- `im:write` - Send DMs
- `im:read` - Access DM info
- `users:read` - Get user info for names

Install to workspace and copy the **Bot User OAuth Token**.

### Get Signing Secret

Go to **Basic Information** → **App Credentials** and copy the **Signing Secret**.

### Enable Event Subscriptions

1. Go to **Event Subscriptions** and toggle **Enable Events**
2. Set **Request URL** to: `https://[your-vercel-domain]/api/slack`
3. Under **Subscribe to bot events**, add: `message.im`
4. Save changes

### Create Slash Commands

Go to **Slash Commands** and create these commands (all pointing to `https://[your-vercel-domain]/api/slack`):

| Command | Description |
|---------|-------------|
| `/submit` | Submit a solution to The Innovators Circle |
| `/help` | Get AI tool recommendations for a challenge |
| `/chat` | Chat with the AI assistant |
| `/tools` | List approved AI tools |
| `/workflows` | Show AI workflows by team |
| `/tip` | Get a random AI tip |
| `/innovators-circle` | View the hall of fame |
| `/commands` | List all available commands |
| `/new` | Start a fresh conversation |
| `/pending` | (Admin) View pending submissions |
| `/approve` | (Admin) Approve a submission |
| `/decline` | (Admin) Decline a submission |

### Get Channel ID

1. Right-click the channel for submissions → **View channel details**
2. Copy the **Channel ID** at the bottom
3. Invite the bot to this channel

## Deploy to Vercel

### Initial Deployment

1. Install Vercel CLI: `npm install -g vercel`
2. Run `vercel` and follow prompts
3. Add all environment variables in Vercel Dashboard → Settings → Environment Variables
4. Deploy: `vercel --prod`
5. Update Slack app URLs to your Vercel domain

### Cron Job Setup

The bot sends daily reminders for pending submissions. This is configured in `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/reminder",
      "schedule": "0 14 * * 1-5"
    }
  ]
}
```

This runs at 2 PM UTC (9 AM EST) on weekdays. Adjust the schedule as needed.

**Important:** Add `CRON_SECRET` to your Vercel environment variables.

### Subsequent Deployments

```bash
npm run deploy
```

Or connect GitHub for automatic deployments.

## Company Configuration

Edit `config/company-context.js` to customize:

- **Company name and industry**
- **Approved AI tools** with categories, plans, and AI features
- **Team-specific workflows** (opportunities for AI)
- **Active AI workflows** (proven patterns already in use)

This context is used by the AI to give relevant recommendations.

## Project Structure

```
innovator-bot/
├── api/
│   ├── slack.js              # Main Slack event handler
│   └── cron/
│       └── reminder.js       # Daily pending reminder cron job
├── lib/
│   ├── openai.js             # OpenAI integration (GPT-4o)
│   ├── sessions.js           # Session management (Upstash Redis)
│   ├── sheets.js             # Google Sheets integration
│   └── slack.js              # Slack API utilities
├── config/
│   └── company-context.js    # Company tools, workflows, context
├── vercel.json               # Vercel config with routes & cron
├── package.json
└── README.md
```

## How It Works

### Submission Flow
1. User types `/submit`
2. Bot asks 4 questions via DM: problem, solution, time saved, who benefits
3. GPT-4o polishes the submission
4. Submission logged to Google Sheets with "pending" status
5. Admin gets DM notification
6. Admin reviews with `/pending`, then `/approve [row]` or `/decline [row]`
7. User gets notification of approval/decline

### Help Flow
1. User types `/help`
2. Bot asks what challenge they're facing
3. AI recommends tools from approved list, citing past employee solutions
4. Conversational back-and-forth to refine recommendations
5. Help request logged to Google Sheets

### Chat Flow
1. User types `/chat` or just sends a DM
2. Free-form conversation about AI and productivity
3. Context-aware responses using company tools and past submissions

## Troubleshooting

**Bot doesn't respond to slash commands:**
- Verify Request URL is correct and accessible
- Check Vercel function logs for errors
- Ensure bot is installed to workspace

**Bot doesn't respond to DMs:**
- Ensure `message.im` event is subscribed
- Verify Event Subscriptions URL is correct
- Check bot has `im:history` and `im:read` scopes

**Submissions don't post to channel:**
- Verify bot is invited to the channel
- Check `SLACK_CHANNEL_ID` is correct
- Ensure bot has `chat:write` scope

**Sessions lost between messages:**
- Configure Upstash Redis credentials
- Check Redis connection in Vercel logs

**Cron reminders not sending:**
- Verify `CRON_SECRET` is set in Vercel
- Check cron job logs in Vercel dashboard
- Verify `ADMIN_USER_ID` is configured

**"User not allowed" errors:**
- Add user's Slack ID to `ALLOWED_USERS` array
- Or set `PRIVATE_MODE = false` for open access

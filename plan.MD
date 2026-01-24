## vercel.json config
{
  "version": 2,
  "builds": [
    {
      "src": "api/slack.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/slack",
      "dest": "/api/slack.js"
    }
  ]
}

## OpenAI Prompt for Polishing
When generating the summary, use this prompt:

"You are helping format an employee's AI solution submission. Take their raw inputs and create a clean, professional summary. Keep it concise.

Raw inputs:
- Problem they solved: {problem}
- Tool/solution used: {solution}
- Time saved: {time_saved}
- Who else could use it: {reusable_by}

Format as:
📋 *SUBMISSION SUMMARY*

*Problem:* [1 sentence, cleaned up]
*Solution:* [tool/approach, cleaned up]
*Time Saved:* [standardized format]
*Reusable By:* [who can benefit]

Keep it brief and professional. Use Slack mrkdwn formatting."

## README.md Requirements

The README should include:

### 1. Overview
Brief description of what the bot does

### 2. Setup Instructions
- How to clone and install
- Environment variables needed

### 3. Slack App Configuration
Step-by-step instructions:
1. Go to api.slack.com/apps → Create New App → From scratch
2. Name it "Innovators Circle Bot"
3. Go to OAuth & Permissions, add Bot Token Scopes:
   - chat:write
   - commands
   - im:history
   - im:write
   - im:read
4. Install to Workspace, copy Bot User OAuth Token
5. Go to Basic Information, copy Signing Secret
6. Enable Event Subscriptions:
   - Request URL: https://[your-vercel-domain]/api/slack
   - Subscribe to bot events: message.im
7. Create Slash Command:
   - Command: /innovators
   - Request URL: https://[your-vercel-domain]/api/slack
   - Description: "Submit a solution to The Innovators Circle"

### 4. Local Development
How to run locally with ngrok for testing

### 5. Deploy to Vercel
- Connect GitHub repo to Vercel
- Add environment variables in Vercel dashboard
- Deploy
- Update Slack app URLs to point to Vercel domain

### 6. Scaling: Adding Persistent Sessions
Include this section for future reference:

"""
## Scaling: Persistent Session Storage

The current MVP uses in-memory session storage, which works fine for low-volume usage but has limitations:
- Sessions are lost when serverless functions cold start
- Sessions aren't shared across function instances

When you're ready to scale, upgrade to Vercel KV (Redis):

1. Enable Vercel KV in your project dashboard
2. Install the package: `npm install @vercel/kv`
3. Update lib/sessions.js:
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
```

4. Update the Slack handlers to use async session functions
5. Redeploy

This gives you persistent, shared sessions across all serverless instances with automatic expiration.
"""

## Slack App Configuration Instructions
After the code is built, I'll need to configure the Slack app at api.slack.com/apps:

1. Create new app from scratch
2. Bot Token Scopes needed:
   - chat:write
   - commands
   - im:history
   - im:write
   - im:read
3. Enable Event Subscriptions:
   - Request URL: https://[my-vercel-domain]/api/slack
   - Subscribe to bot events: message.im
4. Create Slash Command:
   - Command: /innovators
   - Request URL: https://[my-vercel-domain]/api/slack
   - Description: "Submit a solution to The Innovators Circle"
5. Install to workspace

## Deliverables
1. Complete working codebase
2. README.md with all sections above
3. All code should be clean, well-commented, and production-ready

## Notes
- Use the Slack Bolt receiver for serverless/Vercel
- Handle Slack's URL verification challenge automatically
- Make sure to acknowledge all interactions within 3 seconds (Slack requirement)
- Use gpt-4o-mini for cost efficiency

Start by initializing the project and setting up the directory structure, then build out each piece.
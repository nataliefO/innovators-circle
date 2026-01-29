// Cron endpoint to post weekly AI tips to the announcements channel
// Configure in vercel.json to run weekly (e.g., Monday 10am)

import OpenAI from 'openai';
import { postToChannel } from '../../lib/slack.js';
import { companyContext } from '../../config/company-context.js';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function generateWeeklyTip() {
  const toolNames = companyContext.approvedTools.map(t => t.name).join(', ');
  const teams = companyContext.teams.join(', ');

  const prompt = `You are Opie, the Innovators Circle assistant at Opiniion. Generate a short, practical AI tip or lesson for the team.

Context:
- Company: Opiniion (property management software)
- Teams: ${teams}
- Approved AI tools: ${toolNames}

Requirements:
- Pick ONE specific, actionable tip (not generic advice)
- Include a concrete example or sample prompt people can try right now
- Keep it short — 3-5 sentences max, plus the example
- Rotate between different tools and different teams each week
- Make it feel like a friendly tip from a coworker, not a lecture
- Use single asterisks *bold* for bold (NOT **double asterisks**)
- Use Slack mrkdwn formatting

Format:
💡 *Opie's AI Tip of the Week*

[The tip with a specific tool and use case]

_Try this prompt:_
> [A ready-to-use prompt they can copy-paste]

[One sentence about who this is most useful for]`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 400,
    temperature: 0.9
  });

  return response.choices[0].message.content;
}

export default async function handler(req, res) {
  // Verify this is a legitimate cron request
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    if (req.method !== 'POST' || req.headers['x-admin-secret'] !== process.env.CRON_SECRET) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  }

  try {
    const tip = await generateWeeklyTip();
    await postToChannel(tip);

    console.log('Weekly AI tip posted');
    return res.status(200).json({ success: true, tip });
  } catch (error) {
    console.error('Weekly tip error:', error);
    return res.status(500).json({ error: 'Failed to post weekly tip' });
  }
}

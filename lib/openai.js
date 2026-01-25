import OpenAI from 'openai';
import { buildSystemPrompt, companyContext } from '../config/company-context.js';
import { getApprovedSubmissions } from './sheets.js';

// Tool categories for organization
const TOOL_CATEGORIES = [
  "Productivity",
  "Writing & Content",
  "Data & Analysis",
  "Customer Service",
  "Sales & Marketing",
  "Development",
  "HR & Recruiting",
  "Finance",
  "Other"
];

// Build context from company approved tools
function buildApprovedToolsContext() {
  const { approvedTools } = companyContext;

  if (!approvedTools || approvedTools.length === 0) {
    return "No company-approved tools configured yet.";
  }

  const toolDescriptions = approvedTools.map(t => {
    const aiTag = t.hasAI ? ' ✨ *Has AI*' : '';
    const features = t.aiFeatures?.length > 0
      ? `\n   AI Features: ${t.aiFeatures.join(', ')}`
      : '';
    const teams = t.teams?.length > 0
      ? `\n   Teams: ${t.teams.join(', ')}`
      : '';
    const notes = t.notes
      ? `\n   Note: ${t.notes}`
      : '';

    return `• *${t.name}* (${t.category}${t.plan ? ` - ${t.plan}` : ''})${aiTag}
   Use cases: ${t.useCases?.join(', ') || 'General'}${features}${teams}${notes}`;
  }).join('\n\n');

  return `These are company-approved tools with subscriptions:\n\n${toolDescriptions}`;
}

// Build context from past submissions
async function buildSubmissionsContext() {
  const submissions = await getApprovedSubmissions();

  if (submissions.length === 0) {
    return "No employee solutions have been submitted yet.";
  }

  const summaries = submissions.slice(-20).map((s, i) => // Last 20 submissions
    `${i + 1}. *${s.problem}*
   Solution: ${s.solution}
   Time Saved: ${s.timeSaved}
   Useful for: ${s.reusableBy}`
  ).join("\n\n");

  return `Here are recent AI solutions submitted by employees:\n\n${summaries}`;
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function polishSubmission({ problem, solution, timeSaved, reusableBy }) {
  const prompt = `You are helping format an employee's AI solution submission. Take their raw inputs and create a clean, professional summary. Keep it concise.

Raw inputs:
- Problem they solved: ${problem}
- Tool/solution used: ${solution}
- Time saved: ${timeSaved}
- Who else could use it: ${reusableBy}

Format as:
📋 *SUBMISSION SUMMARY*

*Problem:* [1 sentence, cleaned up]
*Solution:* [tool/approach, cleaned up]
*Time Saved:* [standardized format]
*Reusable By:* [who can benefit]

Keep it brief and professional. Use Slack mrkdwn formatting.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'user',
        content: prompt
      }
    ],
    max_tokens: 500,
    temperature: 0.7
  });

  return response.choices[0].message.content;
}

export async function chat(conversationHistory) {
  const systemPrompt = buildSystemPrompt();
  const messages = [
    { role: 'system', content: systemPrompt },
    ...conversationHistory
  ];

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages,
    max_tokens: 800,
    temperature: 0.7
  });

  return response.choices[0].message.content;
}

// Build workflows context organized by team (opportunities for AI)
function buildWorkflowsContext() {
  const { workflows } = companyContext;
  if (!workflows || typeof workflows !== 'object') {
    return 'No workflows configured';
  }

  return Object.entries(workflows)
    .map(([team, items]) => `*${team}:*\n${items.map(w => `  • ${w}`).join('\n')}`)
    .join('\n\n');
}

// Build active workflows context (AI already in use)
function buildActiveWorkflowsContext() {
  const { activeWorkflows } = companyContext;
  if (!activeWorkflows || activeWorkflows.length === 0) {
    return 'No active AI workflows documented yet.';
  }

  return activeWorkflows
    .map(w => `• *${w.team}*: ${w.workflow} using ${w.tool}\n  _${w.description}_`)
    .join('\n');
}

export async function helpChat(conversationHistory, challenge) {
  const approvedToolsContext = buildApprovedToolsContext();
  const submissionsContext = await buildSubmissionsContext();
  const workflowsContext = buildWorkflowsContext();
  const activeWorkflowsContext = buildActiveWorkflowsContext();

  const { name, industry, industryTerms, teams } = companyContext;

  const systemPrompt = `You are a helpful AI assistant for the Innovators Circle program at ${name}. Your job is to help employees find AI tools and solutions for their work challenges.

## Company Context
Industry: ${industry}
Key terms: ${industryTerms?.join(', ') || ''}
Teams: ${teams?.join(', ') || ''}

## AI Workflows Already in Use (Proven patterns at ${name})
${activeWorkflowsContext}

## Opportunities: Tasks Where AI Could Help (by Team)
${workflowsContext}

## Company-Approved Tools (We Have Subscriptions)
${approvedToolsContext}

## Employee-Submitted Solutions (Real wins from colleagues)
${submissionsContext}

## How to Respond

**For the FIRST response to a challenge:**
1. Acknowledge their challenge briefly (1 sentence max)
2. Give 1-2 specific, actionable recommendations immediately - don't just ask questions
3. For each recommendation:
   - Name the tool and specific AI feature to use
   - Give a concrete example of how to apply it to their challenge
   - Include a sample prompt or workflow they can try right now
4. End with ONE focused follow-up question to refine your help (optional)

**Example good first response:**
"Writing sales proposals is a perfect use case for AI! Here's what I'd try:

*1. Use ChatGPT to draft the proposal structure*
Paste in the prospect's requirements and ask: "Create an outline for a sales proposal for [company] focusing on [their pain points]. Include sections for problem statement, proposed solution, timeline, and pricing."

*2. Use ClickUp AI to polish the final draft*
Once you have content, use ClickUp's AI writing assistant to check tone and make it more persuasive.

What type of proposals are you writing most often - new business or renewals?"

**What NOT to do:**
- Don't just ask clarifying questions without giving any recommendations
- Don't give vague advice like "AI can help with that!" - be specific
- Don't overwhelm with 5+ options - pick the best 1-2

Be conversational and concise (this is Slack). Use Slack mrkdwn formatting.`;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...conversationHistory
  ];

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages,
    max_tokens: 800,
    temperature: 0.7
  });

  return response.choices[0].message.content;
}

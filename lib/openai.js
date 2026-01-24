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

    return `• *${t.name}* (${t.category}${t.plan ? ` - ${t.plan}` : ''})${aiTag}
   Use cases: ${t.useCases?.join(', ') || 'General'}${features}${teams}`;
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

// Build workflows context organized by team
function buildWorkflowsContext() {
  const { workflows } = companyContext;
  if (!workflows || typeof workflows !== 'object') {
    return 'No workflows configured';
  }

  return Object.entries(workflows)
    .map(([team, items]) => `*${team}:*\n${items.map(w => `  • ${w}`).join('\n')}`)
    .join('\n\n');
}

export async function helpChat(conversationHistory, challenge) {
  const approvedToolsContext = buildApprovedToolsContext();
  const submissionsContext = await buildSubmissionsContext();
  const workflowsContext = buildWorkflowsContext();

  const { name, industry, industryTerms, teams } = companyContext;

  const systemPrompt = `You are a helpful AI assistant for the Innovators Circle program at ${name}. Your job is to help employees find existing AI tools and solutions that might help with their challenges.

## Company Context
Industry: ${industry}
Key terms: ${industryTerms?.join(', ') || ''}
Teams: ${teams?.join(', ') || ''}

## Common Workflows Where AI Can Help (by Team)
${workflowsContext}

## Company-Approved Tools (We Have Subscriptions)
${approvedToolsContext}

## Employee-Submitted Solutions (Real wins from colleagues)
${submissionsContext}

Categories of tools we track: ${TOOL_CATEGORIES.join(", ")}

Your approach:
1. Understand the user's challenge - ask clarifying questions if needed
2. Match their challenge to relevant workflows and tools we already have
3. If a company-approved tool has AI features that could help, recommend it with specific features
4. If a colleague submitted a similar solution, mention it! ("One of your colleagues found that...")
5. Suggest practical ways to use the tools, with specific AI features when applicable
6. If no exact match, brainstorm creative AI solutions using our approved tools
7. Encourage them to submit their solution to the Innovators Circle when they find something useful

Be conversational, practical, and concise (this is Slack). Use Slack mrkdwn formatting.`;

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

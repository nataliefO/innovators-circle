import OpenAI from 'openai';
import { buildSystemPrompt, companyContext } from '../config/company-context.js';
import { getApprovedSubmissions, getWorkflows } from './sheets.js';

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

export async function polishSubmission({ problem, solution, timeSaved, reusableBy, howToReuse, editRequest }) {
  let prompt;

  const rawInputs = `Raw inputs:
- Problem they solved: ${problem}
- Tool/solution used: ${solution}
- Time saved: ${timeSaved}
- Who else could use it: ${reusableBy}
- How someone else could use it: ${howToReuse}`;

  const formatTemplate = `Format as:
📋 *SUBMISSION SUMMARY*

*Problem:* [1 sentence, cleaned up]
*Solution:* [tool/approach, cleaned up]
*Time Saved:* [standardized format]
*Reusable By:* [who can benefit]
*How to Reuse:* [brief, actionable steps someone else could follow]

Keep it brief and professional. Use single asterisks *bold* for bold (NOT **double**). Use Slack mrkdwn formatting.`;

  if (editRequest) {
    prompt = `You previously formatted an employee's AI solution submission. The user wants changes. Apply their feedback and return the revised summary.

${rawInputs}

User's edit request: "${editRequest}"

${formatTemplate}

Apply the user's requested changes.`;
  } else {
    prompt = `You are helping format an employee's AI solution submission. Take their raw inputs and create a clean, professional summary. Keep it concise.

${rawInputs}

${formatTemplate}`;
  }

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
  const sheetWorkflows = await getWorkflows();
  const systemPrompt = buildSystemPrompt(sheetWorkflows);
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
// Build active workflows context — uses sheet data (graded) if provided, otherwise falls back to config
function buildActiveWorkflowsContext(sheetWorkflows = null) {
  if (sheetWorkflows && sheetWorkflows.length > 0) {
    const gradeGroups = { A: [], B: [], C: [], D: [] };
    for (const w of sheetWorkflows) {
      const g = w.grade || 'C';
      if (!gradeGroups[g]) gradeGroups[g] = [];
      gradeGroups[g].push(w);
    }
    const sections = [];
    if (gradeGroups.A.length) sections.push(`*CLASS A — Top Impact:*\n${gradeGroups.A.map(w => `  • ${w.team}: ${w.workflow} using ${w.tool} — _${w.description}_`).join('\n')}`);
    if (gradeGroups.B.length) sections.push(`*CLASS B — Proven:*\n${gradeGroups.B.map(w => `  • ${w.team}: ${w.workflow} using ${w.tool} — _${w.description}_`).join('\n')}`);
    if (gradeGroups.C.length) sections.push(`*CLASS C — In Use:*\n${gradeGroups.C.map(w => `  • ${w.team}: ${w.workflow} using ${w.tool} — _${w.description}_`).join('\n')}`);
    if (gradeGroups.D.length) sections.push(`*CLASS D — Experimental:*\n${gradeGroups.D.map(w => `  • ${w.team}: ${w.workflow} using ${w.tool} — _${w.description}_`).join('\n')}`);
    return sections.join('\n\n') || 'No active AI workflows documented yet.';
  }

  const { activeWorkflows } = companyContext;
  if (!activeWorkflows || activeWorkflows.length === 0) {
    return 'No active AI workflows documented yet.';
  }

  return activeWorkflows
    .map(w => `• *${w.team}*: ${w.workflow} using ${w.tool}\n  _${w.description}_`)
    .join('\n');
}

// Build ClickUp features context with links
function buildClickUpFeaturesContext() {
  const { clickUpFeatures } = companyContext;
  if (!clickUpFeatures) return '';

  return Object.values(clickUpFeatures)
    .map(f => `• *${f.name}*: ${f.description}\n  Link: ${f.url}`)
    .join('\n');
}

export async function helpChat(conversationHistory, challenge, department = null) {
  const approvedToolsContext = buildApprovedToolsContext();
  const submissionsContext = await buildSubmissionsContext();
  const workflowsContext = buildWorkflowsContext();
  const sheetWorkflows = await getWorkflows();
  const activeWorkflowsContext = buildActiveWorkflowsContext(sheetWorkflows);
  const clickUpFeaturesContext = buildClickUpFeaturesContext();

  const { name, industry, industryTerms, teams, workflows } = companyContext;

  // Get department-specific workflows if available
  const departmentWorkflows = department && workflows[department]
    ? workflows[department].map(w => `• ${w}`).join('\n')
    : null;

  // Get department-specific active workflows from sheet (with grades) or config fallback
  const deptSource = sheetWorkflows.length > 0 ? sheetWorkflows : companyContext.activeWorkflows;
  const departmentActiveWorkflows = department
    ? deptSource
        .filter(w => w.team === department)
        .map(w => `• ${w.workflow} using ${w.tool}: ${w.description}${w.grade ? ` [Class ${w.grade}]` : ''}`)
        .join('\n')
    : null;

  const systemPrompt = `You are Opie, the Innovators Circle assistant at ${name}. You help employees discover AI tools and solutions for their work challenges.

## YOUR IDENTITY — CRITICAL
You are NOT a ClickUp assistant. You are NOT any single tool's assistant. You are Opie, the Innovators Circle assistant — a Slack bot that helps employees at ${name} find AI solutions for work challenges using the company's approved tools. You cannot perform actions in any external tool (ClickUp, GitHub, HubSpot, etc.). You can only recommend tools, explain how to use them, and help employees figure out the best approach.

If someone asks you to do something in an external tool (create a ticket, book a meeting, run a report), be clear that you can't do that directly, but explain how they can do it themselves — and if the tool has an AI feature that can help, walk them through it.

If someone asks "what are you?" or "are you a [tool] assistant?", clarify: "I'm Opie, the Innovators Circle assistant. I help you find AI tools and solutions for your work challenges. I know about all the AI tools we use at ${name} and can recommend the best one for what you're working on."

## User Context
${department ? `Department: *${department}*` : 'Department: Not specified'}

## Company Context
Industry: ${industry}
Key terms: ${industryTerms?.join(', ') || ''}
Teams: ${teams?.join(', ') || ''}

${department && departmentWorkflows ? `## ${department} Team - Where AI Can Help\n${departmentWorkflows}\n` : ''}
${department && departmentActiveWorkflows ? `## ${department} Team - AI Already in Use\n${departmentActiveWorkflows}\n` : ''}

## ClickUp-First Approach
We have ClickUp Business with full AI features (ClickUp Brain). When ClickUp can solve the problem, recommend it first. But always be honest — if another approved tool is genuinely better for the use case, recommend that instead.

ClickUp Brain can do:
- Task management with AI auto-assignment and prioritization
- Document creation with AI writing assistance
- SOP and wiki generation from workspace knowledge
- Meeting notes with AI transcription and action items
- Custom AI agents (no-code) for any workflow
- Natural language automations
- AI standups and progress reports
- Connected search across tasks, docs, chats, and Google Workspace

ClickUp Feature Links (include when recommending):
${clickUpFeaturesContext}

Prefer ClickUp Docs over Notion for documentation, wikis, SOPs, and knowledge bases — we already have it and it integrates with Brain.

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
2. **Start with ClickUp** - if ClickUp Brain can help, recommend it FIRST with the specific feature and link
3. Give 1-2 specific, actionable recommendations with:
   - The tool and specific AI feature to use
   - A concrete example of how to apply it to their challenge
   - Include a sample prompt or workflow they can try right now
   - Include the ClickUp feature link when applicable
4. End with ONE focused follow-up question to refine your help (optional)

**Example good first response:**
"Creating SOPs is exactly what ClickUp Brain is built for!

*1. Use ClickUp Docs with Brain to generate your SOP*
Open a new Doc in ClickUp, click the Brain icon, and prompt: "Create an SOP for [process name] based on [describe the workflow]." Brain can pull context from your existing tasks and docs to make it accurate.
→ <https://clickup.com/features/docs|ClickUp Docs>

*2. Set up a Custom Agent to keep it updated*
Create a no-code agent that monitors related tasks and suggests SOP updates when processes change.
→ <https://clickup.com/features/ai|ClickUp Custom Agents>

What process are you documenting first?"

**What NOT to do:**
- NEVER say you are a ClickUp assistant or any single tool's assistant — you are Opie, the Innovators Circle assistant
- NEVER pretend you can perform actions in external tools (create tasks, send emails, book meetings, etc.) — you can only guide and recommend
- Don't recommend Notion - use ClickUp Docs instead
- Don't suggest tools outside our approved list unless absolutely necessary
- Don't just ask clarifying questions without giving any recommendations
- Don't give vague advice like "AI can help with that!" - be specific
- Don't overwhelm with 5+ options - pick the best 1-2

Be conversational and concise (this is Slack).

CRITICAL - SLACK FORMATTING RULES (do NOT use standard Markdown):
- Bold: Use single asterisks *like this* (NOT **double asterisks**)
- Italic: Use _underscores_ (NOT *single asterisks* for italic)
- Strikethrough: Use ~tildes~
- Links: Use <URL|display text> format (NOT [text](url))
- NEVER use **double asterisks** — Slack does not support them and they will show as literal ** characters
- Include clickable links using Slack format: <URL|Link Text>`;

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

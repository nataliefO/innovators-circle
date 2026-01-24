import crypto from 'crypto';
import {
  getSession,
  createSubmissionSession,
  createChatSession,
  createHelpSession,
  updateSession,
  deleteSession,
  addToChatHistory
} from '../lib/sessions.js';
import { polishSubmission, chat, helpChat } from '../lib/openai.js';
import { sendDM, notifyAdmin } from '../lib/slack.js';
import { logSubmission, logHelpRequest, getApprovedSubmissions } from '../lib/sheets.js';
import { companyContext } from '../config/company-context.js';

// Access control - set to false to open to everyone
const PRIVATE_MODE = true;
const ALLOWED_USERS = [process.env.ADMIN_USER_ID];

// Track processed events to prevent duplicates (Slack retries)
const processedEvents = new Set();
const EVENT_TTL = 60000; // Keep event IDs for 1 minute

function isUserAllowed(userId) {
  if (!PRIVATE_MODE) return true;
  return ALLOWED_USERS.includes(userId);
}

// Verify Slack request signature
function verifySlackSignature(req, body) {
  const timestamp = req.headers['x-slack-request-timestamp'];
  const signature = req.headers['x-slack-signature'];

  if (!timestamp || !signature) return false;

  // Check timestamp is within 5 minutes
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - timestamp) > 300) return false;

  const sigBaseString = `v0:${timestamp}:${body}`;
  const mySignature = 'v0=' + crypto
    .createHmac('sha256', process.env.SLACK_SIGNING_SECRET)
    .update(sigBaseString)
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(mySignature),
    Buffer.from(signature)
  );
}

// Question prompts for each step
const QUESTIONS = {
  name: "First, what's your name?",
  problem: "What problem did you solve with AI? (Describe the challenge you faced)",
  solution: "What AI tool or solution did you use? (e.g., ChatGPT, Claude, Copilot, custom script)",
  timeSaved: "How much time did this save you? (e.g., '2 hours per week', '30 minutes per report')",
  reusableBy: "Who else in the company could benefit from this? (e.g., 'All project managers', 'Sales team', 'Anyone who writes reports')"
};

const STEP_ORDER = ['name', 'problem', 'solution', 'timeSaved', 'reusableBy'];

function getNextStep(currentStep) {
  const currentIndex = STEP_ORDER.indexOf(currentStep);
  if (currentIndex === -1 || currentIndex >= STEP_ORDER.length - 1) {
    return null;
  }
  return STEP_ORDER[currentIndex + 1];
}

const WELCOME_MESSAGE = `👋 Hey! I'm the *Innovators Circle Bot*. I can help you in three ways:

*1️⃣ Submit a solution* - Share an AI win with the team
*2️⃣ Get help* - Find existing tools or get AI recommendations for your challenge
*3️⃣ Chat* - Brainstorm AI solutions for a challenge you're facing

What would you like to do? Reply with *"submit"*, *"help"*, or *"chat"*`;

const HELP_WELCOME = `🔍 *Let's find a solution for you!*

What challenge are you trying to solve? Be specific - what task takes too long, what's frustrating, or what would you like to automate?`;

const COMMANDS_HELP = `🤖 *Innovators Circle Commands*

*Quick Actions:*
• \`/submit\` - Share an AI win with the team
• \`/new\` - Start a fresh conversation
• \`/tools\` - List all approved AI tools
• \`/tools [search]\` - Search tools (e.g., \`/tools writing\`)
• \`/workflows [team]\` - Show AI workflows for a team
• \`/tip\` - Get a random AI tip or recent win

*In conversation:*
• Type \`cancel\` to exit current flow
• Type \`submit\` to switch to submission mode

Just message me directly to ask about AI solutions!`;

// Format tools list for display
function formatToolsList(tools, search = null) {
  let filtered = tools;
  if (search) {
    const searchLower = search.toLowerCase();
    filtered = tools.filter(t =>
      t.name.toLowerCase().includes(searchLower) ||
      t.category.toLowerCase().includes(searchLower) ||
      t.useCases?.some(u => u.toLowerCase().includes(searchLower)) ||
      t.aiFeatures?.some(f => f.toLowerCase().includes(searchLower))
    );
  }

  if (filtered.length === 0) {
    return search
      ? `No tools found matching "${search}". Try \`/tools\` to see all.`
      : "No tools configured yet.";
  }

  const toolLines = filtered.map(t => {
    const aiTag = t.hasAI ? ' ✨' : '';
    const features = t.aiFeatures?.length > 0 ? ` - ${t.aiFeatures.slice(0, 2).join(', ')}` : '';
    return `• *${t.name}*${aiTag} (${t.category})${features}`;
  });

  const header = search
    ? `🔧 *Tools matching "${search}":*`
    : `🔧 *Approved AI Tools (${filtered.length}):*`;

  return `${header}\n\n${toolLines.join('\n')}\n\n_Use \`/tools [search]\` to filter_`;
}

// Format workflows for a team
function formatWorkflows(teamSearch = null) {
  const { workflows } = companyContext;
  if (!workflows) return "No workflows configured.";

  if (teamSearch) {
    const searchLower = teamSearch.toLowerCase();
    const matchedTeam = Object.keys(workflows).find(t =>
      t.toLowerCase().includes(searchLower)
    );

    if (!matchedTeam) {
      const teamList = Object.keys(workflows).join(', ');
      return `Team "${teamSearch}" not found.\n\nAvailable teams: ${teamList}`;
    }

    const items = workflows[matchedTeam];
    return `📋 *${matchedTeam} Workflows:*\n\n${items.map(w => `• ${w}`).join('\n')}`;
  }

  // Show all teams summary
  const teamSummary = Object.entries(workflows)
    .map(([team, items]) => `• *${team}* (${items.length} workflows)`)
    .join('\n');

  return `📋 *AI Workflows by Team:*\n\n${teamSummary}\n\n_Use \`/workflows [team]\` to see details (e.g., \`/workflows sales\`)_`;
}

// Get a random tip or recent submission
async function getRandomTip() {
  const submissions = await getApprovedSubmissions();
  const tips = [
    "💡 *Tip:* When using ChatGPT for emails, paste in an example of your writing style first for more personalized results.",
    "💡 *Tip:* Use ClickUp AI to summarize long comment threads - just click the AI button on any task.",
    "💡 *Tip:* Before a customer call, ask ChatGPT to summarize key points from their recent feedback data.",
    "💡 *Tip:* Stuck on how to phrase something? Ask AI for 3 different versions and pick your favorite.",
    "💡 *Tip:* Use AI to create first drafts, then edit with your expertise - faster than starting from scratch."
  ];

  // Mix in recent submissions as tips
  if (submissions.length > 0) {
    const recentSubmission = submissions[Math.floor(Math.random() * submissions.length)];
    tips.push(`🏆 *Recent win:* ${recentSubmission.problem}\n_Solution:_ ${recentSubmission.solution}\n_Time saved:_ ${recentSubmission.timeSaved}`);
  }

  return tips[Math.floor(Math.random() * tips.length)];
}

// Handle first message from user (mode selection)
async function handleModeSelection(userId, text) {
  const lowerText = text.toLowerCase().trim();

  if (lowerText === 'submit' || lowerText === '1') {
    await createSubmissionSession(userId);
    await sendDM(userId, `Great! Let's capture your AI win. 🎯\n\n${QUESTIONS.name}`);
  } else if (lowerText === 'help' || lowerText === '2') {
    await createHelpSession(userId);
    await sendDM(userId, HELP_WELCOME);
  } else if (lowerText === 'chat' || lowerText === '3') {
    await createChatSession(userId);
    await sendDM(userId, "I'm ready to help you brainstorm! What challenge are you trying to solve with AI?");
  } else {
    // Treat their message as a challenge - start help session and process immediately
    await createHelpSession(userId);
    // Simulate them already being in the help flow with their message as the challenge
    const session = await getSession(userId);
    await handleHelpFlow(userId, text, session);
  }
}

// Handle submission flow
async function handleSubmissionFlow(userId, text, session) {
  // Handle cancel command
  if (text.toLowerCase() === 'cancel') {
    await deleteSession(userId);
    await sendDM(userId, "Submission cancelled. Message me anytime to start over!");
    return;
  }

  // Save current answer
  const currentStep = session.step;
  const updatedSession = await updateSession(userId, { [currentStep]: text });

  // Get next step
  const nextStep = getNextStep(currentStep);

  if (nextStep) {
    // Move to next question
    await updateSession(userId, { step: nextStep });
    await sendDM(userId, `Got it! ✅\n\n${QUESTIONS[nextStep]}`);
  } else {
    // All questions answered - process submission
    await sendDM(userId, "Thanks! Let me polish that up for you... ✨");

    try {
      // Polish with OpenAI
      const polishedSummary = await polishSubmission({
        problem: updatedSession.problem,
        solution: updatedSession.solution,
        timeSaved: updatedSession.timeSaved,
        reusableBy: text // Last answer
      });

      // Log to Google Sheets
      await logSubmission({
        userId,
        userName: updatedSession.name,
        problem: updatedSession.problem,
        solution: updatedSession.solution,
        timeSaved: updatedSession.timeSaved,
        reusableBy: text,
        polishedSummary
      });

      // Notify admin of new submission
      await notifyAdmin(userId, polishedSummary);

      // Clean up session
      await deleteSession(userId);

      await sendDM(userId,
        `🎉 Here's your polished submission:\n\n${polishedSummary}\n\nThank you for sharing! Message me anytime to submit another or chat about new ideas.`
      );
    } catch (error) {
      console.error('Error processing submission:', error);
      await sendDM(userId,
        "Sorry, there was an error processing your submission. Please try again."
      );
      await deleteSession(userId);
    }
  }
}

// Handle chat flow
async function handleChatFlow(userId, text, session) {
  // Allow user to switch to submit mode
  if (text.toLowerCase() === 'submit') {
    await deleteSession(userId);
    await createSubmissionSession(userId);
    await sendDM(userId, `Switching to submission mode! 🎯\n\n${QUESTIONS.name}`);
    return;
  }

  // Handle reset/cancel
  if (text.toLowerCase() === 'reset' || text.toLowerCase() === 'cancel') {
    await deleteSession(userId);
    await sendDM(userId, "Chat cleared! Message me anytime to start fresh.");
    return;
  }

  // Add user message to history
  await addToChatHistory(userId, 'user', text);

  try {
    const updatedSession = await getSession(userId);
    const response = await chat(updatedSession.conversationHistory);
    await addToChatHistory(userId, 'assistant', response);
    await sendDM(userId, response);
  } catch (error) {
    console.error('Chat error:', error);
    await sendDM(userId, "Sorry, I had trouble processing that. Could you try again?");
  }
}

// Handle help flow
async function handleHelpFlow(userId, text, session) {
  // Handle cancel command
  if (text.toLowerCase() === 'cancel') {
    await deleteSession(userId);
    await sendDM(userId, "No problem! Message me anytime you need help.");
    return;
  }

  // Allow switching modes
  if (text.toLowerCase() === 'submit') {
    await deleteSession(userId);
    await createSubmissionSession(userId);
    await sendDM(userId, `Switching to submission mode! 🎯\n\n${QUESTIONS.name}`);
    return;
  }

  const currentStep = session.step;

  // First message - get challenge and start conversation immediately
  if (currentStep === 'challenge' && !session.challenge) {
    await updateSession(userId, { challenge: text, step: 'conversation' });

    // Log the initial help request (name will be null until we have users:read)
    await logHelpRequest({
      userId,
      userName: null,
      challenge: text,
      category: null,
      matchedTools: null,
      aiResponse: 'Initial request - conversation started'
    });

    await sendDM(userId, "Let me think about that... 🤔");

    try {
      // Start the help conversation
      const conversationHistory = [{ role: 'user', content: text }];
      const response = await helpChat(conversationHistory, text);

      // Save to session
      await updateSession(userId, {
        conversationHistory: [
          { role: 'user', content: text },
          { role: 'assistant', content: response }
        ]
      });

      await sendDM(userId, response);
    } catch (error) {
      console.error('Help chat error:', error);
      await sendDM(userId, "Sorry, I had trouble processing that. Could you try again?");
    }
    return;
  }

  // Ongoing help conversation
  if (currentStep === 'conversation') {
    try {
      const currentSession = await getSession(userId);
      const newHistory = [...(currentSession.conversationHistory || []), { role: 'user', content: text }];

      const response = await helpChat(newHistory, currentSession.challenge);

      await updateSession(userId, {
        conversationHistory: [...newHistory, { role: 'assistant', content: response }]
      });

      await sendDM(userId, response);
    } catch (error) {
      console.error('Help chat error:', error);
      await sendDM(userId, "Sorry, I had trouble processing that. Could you try again?");
    }
  }
}

// Handle DM message (conversation flow)
async function handleDirectMessage(userId, text) {
  // Check if user is allowed (private mode)
  if (!isUserAllowed(userId)) {
    await sendDM(userId, "🚧 This bot is currently in testing mode. Check back soon!");
    return;
  }

  const session = await getSession(userId);

  // No session - show welcome and handle mode selection
  if (!session) {
    await handleModeSelection(userId, text);
    return;
  }

  // Route to appropriate handler based on mode
  if (session.mode === 'submit') {
    await handleSubmissionFlow(userId, text, session);
  } else if (session.mode === 'chat') {
    await handleChatFlow(userId, text, session);
  } else if (session.mode === 'help') {
    await handleHelpFlow(userId, text, session);
  }
}

// Parse raw request body
async function getRawBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => resolve(body));
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const rawBody = await getRawBody(req);

    // Verify signature (skip for URL verification challenge)
    let body;
    try {
      body = JSON.parse(rawBody);
    } catch {
      body = Object.fromEntries(new URLSearchParams(rawBody));
    }

    // Handle Slack URL verification challenge
    if (body.type === 'url_verification') {
      return res.status(200).json({ challenge: body.challenge });
    }

    // Verify signature for all other requests
    if (!verifySlackSignature(req, rawBody)) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    // Handle slash commands
    if (body.command === '/innovators') {
      await sendDM(body.user_id, WELCOME_MESSAGE);
      return res.status(200).send('');
    }

    if (body.command === '/help') {
      // Check if user is allowed (private mode)
      if (!isUserAllowed(body.user_id)) {
        await sendDM(body.user_id, "🚧 This bot is currently in testing mode. Check back soon!");
        return res.status(200).send('');
      }
      await deleteSession(body.user_id); // Clear any existing session
      await createHelpSession(body.user_id);
      await sendDM(body.user_id, HELP_WELCOME);
      return res.status(200).send('');
    }

    if (body.command === '/submit') {
      // Check if user is allowed (private mode)
      if (!isUserAllowed(body.user_id)) {
        await sendDM(body.user_id, "🚧 This bot is currently in testing mode. Check back soon!");
        return res.status(200).send('');
      }
      await deleteSession(body.user_id); // Clear any existing session
      await createSubmissionSession(body.user_id);
      await sendDM(body.user_id, `Great! Let's capture your AI win. 🎯\n\n${QUESTIONS.name}`);
      return res.status(200).send('');
    }

    if (body.command === '/tools') {
      const search = body.text?.trim() || null;
      const response = formatToolsList(companyContext.approvedTools, search);
      await sendDM(body.user_id, response);
      return res.status(200).send('');
    }

    if (body.command === '/workflows') {
      const teamSearch = body.text?.trim() || null;
      const response = formatWorkflows(teamSearch);
      await sendDM(body.user_id, response);
      return res.status(200).send('');
    }

    if (body.command === '/tip') {
      const tip = await getRandomTip();
      await sendDM(body.user_id, tip);
      return res.status(200).send('');
    }

    if (body.command === '/new') {
      await deleteSession(body.user_id);
      await sendDM(body.user_id, "✨ Fresh start! What can I help you with?");
      return res.status(200).send('');
    }

    if (body.command === '/commands') {
      await sendDM(body.user_id, COMMANDS_HELP);
      return res.status(200).send('');
    }

    // Handle event callbacks
    if (body.type === 'event_callback') {
      const event = body.event;

      // Only handle DMs from users (not bot messages)
      if (event.type === 'message' &&
          event.channel_type === 'im' &&
          !event.bot_id &&
          !event.subtype) {

        // Deduplicate events using client_msg_id or event_ts
        const eventId = event.client_msg_id || event.ts;
        if (processedEvents.has(eventId)) {
          console.log('Duplicate event ignored:', eventId);
          return res.status(200).send('');
        }
        processedEvents.add(eventId);
        // Clean up old event IDs after TTL
        setTimeout(() => processedEvents.delete(eventId), EVENT_TTL);

        // Process the message then respond
        await handleDirectMessage(event.user, event.text);
        return res.status(200).send('');
      }
    }

    // Default response
    return res.status(200).send('');
  } catch (error) {
    console.error('Handler error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

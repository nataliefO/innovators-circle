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
import { logSubmission, logHelpRequest } from '../lib/sheets.js';

// Access control - set to false to open to everyone
const PRIVATE_MODE = true;
const ALLOWED_USERS = [process.env.ADMIN_USER_ID];

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

First, what's your name?`;

const HELP_QUESTIONS = {
  name: "First, what's your name?",
  challenge: "Great! Now tell me: *What challenge are you trying to solve?*\n\nBe as specific as you can - what task takes too long, what's frustrating, or what would you like to automate?"
};

// Handle first message from user (mode selection)
async function handleModeSelection(userId, text) {
  const lowerText = text.toLowerCase().trim();

  if (lowerText === 'submit' || lowerText === '1') {
    createSubmissionSession(userId);
    await sendDM(userId, `Great! Let's capture your AI win. 🎯\n\n${QUESTIONS.name}`);
  } else if (lowerText === 'help' || lowerText === '2') {
    createHelpSession(userId);
    await sendDM(userId, HELP_WELCOME);
  } else if (lowerText === 'chat' || lowerText === '3') {
    createChatSession(userId);
    await sendDM(userId, "I'm ready to help you brainstorm! What challenge are you trying to solve with AI?");
  } else {
    // Treat as starting a help session with their message as the challenge
    createHelpSession(userId);
    await sendDM(userId, `Let me help you with that! But first, what's your name?`);
  }
}

// Handle submission flow
async function handleSubmissionFlow(userId, text, session) {
  // Handle cancel command
  if (text.toLowerCase() === 'cancel') {
    deleteSession(userId);
    await sendDM(userId, "Submission cancelled. Message me anytime to start over!");
    return;
  }

  // Save current answer
  const currentStep = session.step;
  const updatedSession = updateSession(userId, { [currentStep]: text });

  // Get next step
  const nextStep = getNextStep(currentStep);

  if (nextStep) {
    // Move to next question
    updateSession(userId, { step: nextStep });
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
      deleteSession(userId);

      await sendDM(userId,
        `🎉 Here's your polished submission:\n\n${polishedSummary}\n\nThank you for sharing! Message me anytime to submit another or chat about new ideas.`
      );
    } catch (error) {
      console.error('Error processing submission:', error);
      await sendDM(userId,
        "Sorry, there was an error processing your submission. Please try again."
      );
      deleteSession(userId);
    }
  }
}

// Handle chat flow
async function handleChatFlow(userId, text, session) {
  // Allow user to switch to submit mode
  if (text.toLowerCase() === 'submit') {
    deleteSession(userId);
    createSubmissionSession(userId);
    await sendDM(userId, `Switching to submission mode! 🎯\n\n${QUESTIONS.name}`);
    return;
  }

  // Handle reset/cancel
  if (text.toLowerCase() === 'reset' || text.toLowerCase() === 'cancel') {
    deleteSession(userId);
    await sendDM(userId, "Chat cleared! Message me anytime to start fresh.");
    return;
  }

  // Add user message to history
  addToChatHistory(userId, 'user', text);

  try {
    const updatedSession = getSession(userId);
    const response = await chat(updatedSession.conversationHistory);
    addToChatHistory(userId, 'assistant', response);
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
    deleteSession(userId);
    await sendDM(userId, "No problem! Message me anytime you need help.");
    return;
  }

  // Allow switching modes
  if (text.toLowerCase() === 'submit') {
    deleteSession(userId);
    createSubmissionSession(userId);
    await sendDM(userId, `Switching to submission mode! 🎯\n\n${QUESTIONS.name}`);
    return;
  }

  const currentStep = session.step;

  // Step 1: Get name
  if (currentStep === 'name') {
    updateSession(userId, { name: text, step: 'challenge' });
    await sendDM(userId, `Nice to meet you, ${text}! 👋\n\n${HELP_QUESTIONS.challenge}`);
    return;
  }

  // Step 2: Get challenge and start conversation
  if (currentStep === 'challenge' && !session.challenge) {
    const updatedSession = updateSession(userId, { challenge: text, step: 'conversation' });

    // Log the initial help request
    await logHelpRequest({
      userId,
      userName: updatedSession.name,
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
      updateSession(userId, {
        conversationHistory: [
          { role: 'user', content: text },
          { role: 'assistant', content: response }
        ]
      });

      await sendDM(userId, response);
      await sendDM(userId, "\n_Reply to continue the conversation, or type *submit* if you found a solution to share!_");
    } catch (error) {
      console.error('Help chat error:', error);
      await sendDM(userId, "Sorry, I had trouble processing that. Could you try again?");
    }
    return;
  }

  // Ongoing help conversation
  if (currentStep === 'conversation') {
    try {
      const currentSession = getSession(userId);
      const newHistory = [...(currentSession.conversationHistory || []), { role: 'user', content: text }];

      const response = await helpChat(newHistory, currentSession.challenge);

      updateSession(userId, {
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

  const session = getSession(userId);

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
      res.status(200).send('');
      await sendDM(body.user_id, WELCOME_MESSAGE);
      return;
    }

    if (body.command === '/help') {
      res.status(200).send('');
      // Check if user is allowed (private mode)
      if (!isUserAllowed(body.user_id)) {
        await sendDM(body.user_id, "🚧 This bot is currently in testing mode. Check back soon!");
        return;
      }
      deleteSession(body.user_id); // Clear any existing session
      createHelpSession(body.user_id);
      await sendDM(body.user_id, HELP_WELCOME);
      return;
    }

    if (body.command === '/submit') {
      res.status(200).send('');
      // Check if user is allowed (private mode)
      if (!isUserAllowed(body.user_id)) {
        await sendDM(body.user_id, "🚧 This bot is currently in testing mode. Check back soon!");
        return;
      }
      deleteSession(body.user_id); // Clear any existing session
      createSubmissionSession(body.user_id);
      await sendDM(body.user_id, `Great! Let's capture your AI win. 🎯\n\n${QUESTIONS.name}`);
      return;
    }

    // Handle event callbacks
    if (body.type === 'event_callback') {
      const event = body.event;

      // Only handle DMs from users (not bot messages)
      if (event.type === 'message' &&
          event.channel_type === 'im' &&
          !event.bot_id &&
          !event.subtype) {

        // Acknowledge immediately
        res.status(200).send('');

        // Process asynchronously
        await handleDirectMessage(event.user, event.text);
        return;
      }
    }

    // Default response
    return res.status(200).send('');
  } catch (error) {
    console.error('Handler error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

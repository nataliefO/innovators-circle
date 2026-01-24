// In-memory session storage for MVP
// See README for instructions on upgrading to Vercel KV for production

const sessions = new Map();

const SESSION_TTL = 30 * 60 * 1000; // 30 minutes in milliseconds

export function getSession(userId) {
  const session = sessions.get(userId);
  if (!session) return null;

  // Check if session has expired
  if (Date.now() > session.expiresAt) {
    sessions.delete(userId);
    return null;
  }

  return session.data;
}

export function setSession(userId, data) {
  sessions.set(userId, {
    data,
    expiresAt: Date.now() + SESSION_TTL
  });
}

export function deleteSession(userId) {
  sessions.delete(userId);
}

// Create a new submission session
export function createSubmissionSession(userId) {
  const data = {
    mode: 'submit',
    step: 'name',
    name: null,
    problem: null,
    solution: null,
    timeSaved: null,
    reusableBy: null
  };
  setSession(userId, data);
  return data;
}

// Create a new help session
export function createHelpSession(userId) {
  const data = {
    mode: 'help',
    step: 'name',
    name: null,
    challenge: null,
    conversationHistory: []
  };
  setSession(userId, data);
  return data;
}

// Create a new chat session
export function createChatSession(userId) {
  const data = {
    mode: 'chat',
    conversationHistory: []
  };
  setSession(userId, data);
  return data;
}

// Update session with new data
export function updateSession(userId, updates) {
  const current = getSession(userId);
  if (!current) return null;

  const updated = { ...current, ...updates };
  setSession(userId, updated);
  return updated;
}

// Add message to chat history
export function addToChatHistory(userId, role, content) {
  const current = getSession(userId);
  if (!current || current.mode !== 'chat') return null;

  current.conversationHistory.push({ role, content });
  setSession(userId, current);
  return current;
}

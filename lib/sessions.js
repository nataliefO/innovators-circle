// Persistent session storage using Upstash Redis
// Required env vars: UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN

import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN
});

const SESSION_TTL = 30 * 60; // 30 minutes in seconds (Redis uses seconds)
const SESSION_PREFIX = 'session:';

export async function getSession(userId) {
  try {
    const data = await redis.get(`${SESSION_PREFIX}${userId}`);
    return data || null;
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
}

export async function setSession(userId, data) {
  try {
    await redis.set(`${SESSION_PREFIX}${userId}`, data, { ex: SESSION_TTL });
  } catch (error) {
    console.error('Error setting session:', error);
  }
}

export async function deleteSession(userId) {
  try {
    await redis.del(`${SESSION_PREFIX}${userId}`);
  } catch (error) {
    console.error('Error deleting session:', error);
  }
}

// Create a new submission session
export async function createSubmissionSession(userId) {
  const data = {
    mode: 'submit',
    step: 'name',
    name: null,
    problem: null,
    solution: null,
    timeSaved: null,
    reusableBy: null
  };
  await setSession(userId, data);
  return data;
}

// Create a new help session
export async function createHelpSession(userId) {
  const data = {
    mode: 'help',
    step: 'challenge', // Skip name, go straight to challenge
    challenge: null,
    conversationHistory: []
  };
  await setSession(userId, data);
  return data;
}

// Create a new chat session
export async function createChatSession(userId) {
  const data = {
    mode: 'chat',
    conversationHistory: []
  };
  await setSession(userId, data);
  return data;
}

// Update session with new data
export async function updateSession(userId, updates) {
  const current = await getSession(userId);
  if (!current) return null;

  const updated = { ...current, ...updates };
  await setSession(userId, updated);
  return updated;
}

// Add message to chat history
export async function addToChatHistory(userId, role, content) {
  const current = await getSession(userId);
  if (!current || current.mode !== 'chat') return null;

  current.conversationHistory.push({ role, content });
  await setSession(userId, current);
  return current;
}

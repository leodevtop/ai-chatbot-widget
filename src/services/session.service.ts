import { ChatbotSession } from '~/types';
import ms, { StringValue } from 'ms';

const SESSION_STORAGE_KEYS = {
  TOKEN: 'chatbot-token',
  SESSION_ID: 'chatbot-session-id',
  EXPIRES_AT: 'chatbot-expires-at',
};

/**
 * Checks if a given expiration timestamp is in the past.
 * @param expiresAt The ISO string timestamp of expiration.
 * @returns True if expired, false otherwise.
 */
function isExpired(expiresAt: string): boolean {
  return new Date(expiresAt).getTime() < Date.now();
}

/**
 * Retrieves stored session data from localStorage.
 * @returns ChatbotSession object if valid and not expired, otherwise null.
 */
export function getStoredSession(): ChatbotSession | null {
  const token = localStorage.getItem(SESSION_STORAGE_KEYS.TOKEN);
  const expiresAt = localStorage.getItem(SESSION_STORAGE_KEYS.EXPIRES_AT);
  const sessionId = localStorage.getItem(SESSION_STORAGE_KEYS.SESSION_ID);

  if (!token || !expiresAt || !sessionId) {
    return null;
  }

  if (isExpired(expiresAt)) {
    console.log('[SessionService] Stored session expired. Clearing...');
    clearStoredSession();
    return null;
  }

  return { token, sessionId, expiresAt };
}

/**
 * Clears all stored session data from localStorage.
 */
export function clearStoredSession(): void {
  localStorage.removeItem(SESSION_STORAGE_KEYS.TOKEN);
  localStorage.removeItem(SESSION_STORAGE_KEYS.SESSION_ID);
  localStorage.removeItem(SESSION_STORAGE_KEYS.EXPIRES_AT);
}

/**
 * Requests a new session from the backend API.
 * @param apiKey The public widget API key (siteId).
 * @returns A new ChatbotSession object.
 * @throws Error if the API request fails.
 */
export async function requestNewSession(apiKey: string): Promise<ChatbotSession> {
  console.log('[SessionService] Requesting new session...');
  try {
    const response = await fetch(`${import.meta.env.VITE_CHATBOT_API_BASE_URL}/session/initiate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify({ origin: window.location.origin }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to initiate session');
    }

    const { token, sessionId, expiresIn } = await response.json();
    const expiresAt = new Date(Date.now() + ms(expiresIn as StringValue) * 1000).toISOString();

    localStorage.setItem(SESSION_STORAGE_KEYS.TOKEN, token);
    localStorage.setItem(SESSION_STORAGE_KEYS.SESSION_ID, sessionId);
    localStorage.setItem(SESSION_STORAGE_KEYS.EXPIRES_AT, expiresAt);

    const newSession = { token, sessionId, expiresAt };
    console.log('[SessionService] New session initiated and stored:', newSession);
    return newSession;
  } catch (error) {
    console.error('[SessionService] Error requesting new session:', error);
    throw error;
  }
}

/**
 * Placeholder for using the session (e.g., updating widget state).
 * In a real scenario, this would likely be a callback or event.
 * @param session The ChatbotSession to use.
 * @param onSessionReady Callback to inform the widget about the new session.
 */
export function useSession(session: ChatbotSession, onSessionReady: (token: string, sessionId: string) => void): void {
  console.log('[SessionService] Using session:', session);
  onSessionReady(session.token, session.sessionId);
}

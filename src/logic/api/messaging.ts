import { ChatMessage } from '~/types/chat.js';
import { sanitizeRole } from '~/logic/utils/common.utils.js';

/**
 * Sends a chat message to the backend API.
 * @param siteId The site ID (Public Widget API Key).
 * @param messages The array of chat messages (history).
 * @param siteToken The secure session token (JWT).
 * @param sessionId The session ID.
 * @returns The AI's response.
 * @throws Error if the API request fails.
 */
export async function sendMessage(
  siteId: string,
  messages: ChatMessage[],
  siteToken: string,
  sessionId: string
): Promise<string> {
  console.log('[MessageService] Sending message...');
  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${siteToken}`,
      'x-session-id': sessionId,
      'x-api-key': siteId,
    };

    // The API expects messages in a specific format, so map the current messages
    const apiMessages = messages.map((msg: ChatMessage) => ({
      role: sanitizeRole(msg.role),
      content: msg.content,
    }));

    const response = await fetch(`${import.meta.env.VITE_CHATBOT_API_BASE_URL}/chat/generate`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify({
        messages: apiMessages,
        sessionId: sessionId,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to get AI response');
    }

    const data = await response.json();
    console.log('[MessageService] Received AI response:', data);
    return data.response; // Assuming the AI's reply is in 'response' field
  } catch (error) {
    console.error('[MessageService] Error sending message:', error);
    throw error;
  }
}

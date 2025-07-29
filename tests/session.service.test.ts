import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { getStoredSession, clearStoredSession, requestNewSession, useSession } from '../src/services/session.service';

describe('Session Service', () => {
  beforeEach(() => {
    localStorage.clear(); // Clear localStorage before each test
    vi.clearAllMocks(); // Clear all mocks
    vi.stubEnv('VITE_CHATBOT_API_BASE_URL', 'http://localhost:3000'); // Mock environment variable
  });

  afterEach(() => {
    vi.unstubAllEnvs(); // Clean up stubbed environment variables
  });

  describe('getStoredSession', () => {
    it('should return null if no session data is stored', () => {
      expect(getStoredSession()).toBeNull();
    });

    it('should return null if session data is incomplete', () => {
      localStorage.setItem('chatbot-token', 'test-token');
      expect(getStoredSession()).toBeNull();
    });

    it('should return null if session is expired', () => {
      const expiredTime = new Date(Date.now() - 1000).toISOString(); // 1 second ago
      localStorage.setItem('chatbot-token', 'test-token');
      localStorage.setItem('chatbot-session-id', 'test-session-id');
      localStorage.setItem('chatbot-expires-at', expiredTime);
      expect(getStoredSession()).toBeNull();
      expect(localStorage.removeItem).toHaveBeenCalledWith('chatbot-token');
      expect(localStorage.removeItem).toHaveBeenCalledWith('chatbot-session-id');
      expect(localStorage.removeItem).toHaveBeenCalledWith('chatbot-expires-at');
    });

    it('should return session data if valid and not expired', () => {
      const futureTime = new Date(Date.now() + 3600 * 1000).toISOString(); // 1 hour from now
      localStorage.setItem('chatbot-token', 'valid-token');
      localStorage.setItem('chatbot-session-id', 'valid-session-id');
      localStorage.setItem('chatbot-expires-at', futureTime);

      const session = getStoredSession();
      expect(session).toEqual({
        token: 'valid-token',
        sessionId: 'valid-session-id',
        expiresAt: futureTime,
      });
    });
  });

  describe('clearStoredSession', () => {
    it('should remove all session items from localStorage', () => {
      localStorage.setItem('chatbot-token', 'any');
      localStorage.setItem('chatbot-session-id', 'any');
      localStorage.setItem('chatbot-expires-at', 'any');

      clearStoredSession();

      expect(localStorage.getItem('chatbot-token')).toBeNull();
      expect(localStorage.getItem('chatbot-session-id')).toBeNull();
      expect(localStorage.getItem('chatbot-expires-at')).toBeNull();
    });
  });

  describe('requestNewSession', () => {
    it('should fetch a new session and store it in localStorage', async () => {
      const mockResponse = {
        token: 'new-token',
        sessionId: 'new-session-id',
        expiresIn: 3600, // 1 hour
      };

      // Mock fetch to return a successful response
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const apiKey = 'pk-test-key';
      const session = await requestNewSession(apiKey);

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3000/api/session/initiate',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
          },
          body: JSON.stringify({ origin: window.location.origin }),
        })
      );

      expect(session.token).toBe('new-token');
      expect(session.sessionId).toBe('new-session-id');
      expect(localStorage.getItem('chatbot-token')).toBe('new-token');
      expect(localStorage.getItem('chatbot-session-id')).toBe('new-session-id');
      expect(localStorage.getItem('chatbot-expires-at')).toBeDefined();
      expect(new Date(session.expiresAt).getTime()).toBeGreaterThan(Date.now());
    });

    it('should throw an error if fetch fails', async () => {
      (fetch as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ error: 'API Error' }),
      });

      const apiKey = 'pk-test-key';
      await expect(requestNewSession(apiKey)).rejects.toThrow('API Error');
    });
  });

  describe('useSession', () => {
    it('should call onSessionReady callback with token and sessionId', () => {
      const mockSession = {
        token: 'mock-token',
        sessionId: 'mock-session-id',
        expiresAt: new Date(Date.now() + 10000).toISOString(),
      };
      const onSessionReadyMock = vi.fn();

      useSession(mockSession, onSessionReadyMock);

      expect(onSessionReadyMock).toHaveBeenCalledWith(mockSession.token, mockSession.sessionId);
    });
  });
});

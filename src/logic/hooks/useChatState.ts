import { ReactiveController, ReactiveControllerHost } from 'lit';
import { getStoredSession, requestNewSession, useSession } from '~/logic/api/session.js';
import { sendMessage } from '~/logic/api/messaging.js';
import { renderMarkdown } from '~/logic/utils/markdown.utils.js';
import { ChatbotSession, ChatMessage, Role } from '~/types/chat.js';
import { TypingIndicatorController } from './useTypingIndicator';

export class ChatStateController implements ReactiveController {
  private host: ReactiveControllerHost;

  // State
  messages: ChatMessage[] = [];
  quickReplies: string[] = [];
  errorState: 'init' | 'reply' | null = null;
  isLoading = false;
  sessionId: string | null = null;
  typingIndicator: TypingIndicatorController;
  
  // Private properties
  private siteId: string = '';
  private siteToken: string = '';
  private lastPrompt: string = '';
  private quickRepliesDefault: string = '';
  private isInitialized = false;

  constructor(host: ReactiveControllerHost, typingIndicator: TypingIndicatorController) {
    (this.host = host).addController(this);
    this.typingIndicator = typingIndicator;
  }

  hostConnected() {
    // This lifecycle method is required by the ReactiveController interface.
    // The actual initialization logic is now in the initialize() method,
    // which is called from the host component's connectedCallback.
  }

  initialize(siteId: string, quickRepliesDefault: string) {
    if (this.isInitialized) return;
    this.isInitialized = true;
    
    this.siteId = siteId;
    this.quickRepliesDefault = quickRepliesDefault;
    this.initSession();
  }


  public async initSession() {
    this.isLoading = true;
    this.host.requestUpdate();

    const msgWelcome = '<p>Xin chào! Tôi có thể giúp gì cho bạn hôm nay?</p>';
    const msgError = '<p>Lỗi: Không thể khởi tạo phiên chat.</p>';

    try {
      const storedSession = getStoredSession();
      let currentSession: ChatbotSession;

      if (storedSession) {
        currentSession = storedSession;
      } else {
        currentSession = await requestNewSession(this.siteId);
      }

      useSession(currentSession, (token, sessionId) => {
        this.siteToken = token;
        this.sessionId = sessionId;
      });

      this.errorState = null;
      if (this.quickRepliesDefault) {
        this.quickReplies = this.quickRepliesDefault.split('|').map(item => item.trim());
      } else {
        this.quickReplies = ['Dịch vụ', 'Cần hỗ trợ', 'Chính sách'];
      }

      if (this.messages.length === 0) {
        this.messages = [{ content: msgWelcome, role: Role.Assistant }];
      }
    } catch (err) {
      this.errorState = 'init';
      this.quickReplies = [];
      if (this.messages.length === 0) {
        this.messages = [{ content: msgError, role: Role.Assistant }];
      }
      console.error('[ChatState] Failed to initiate session:', err);
    } finally {
      this.isLoading = false;
      this.host.requestUpdate();
    }
  }

  public async handleSubmit(message: string) {
    const trimmedMessage = message.trim();
    if (this.isLoading || !trimmedMessage || !this.sessionId) return;

    this.isLoading = true;
    this.typingIndicator.start();
    this.lastPrompt = trimmedMessage;
    this.messages = [...this.messages, { content: trimmedMessage, role: Role.User }];
    this.host.requestUpdate();

    const smgError = 'Lỗi: Không lấy được câu trả lời.';

    try {
      const aiReplyMarkdown = await sendMessage(
        this.siteId,
        this.messages,
        this.siteToken,
        this.sessionId!
      );
      const html = renderMarkdown(aiReplyMarkdown);
      this.errorState = null;
      this.addAssistantMessage(html);
    } catch (error) {
      this.errorState = 'reply';
      console.error('Error sending message:', error);
      this.addAssistantMessage(smgError);
    } finally {
      this.isLoading = false;
      this.typingIndicator.start();
      this.host.requestUpdate();
    }
  }
  
  public retry() {
    if (this.errorState === 'init') {
      this.initSession();
    } else if (this.errorState === 'reply' && this.lastPrompt) {
      this.handleSubmit(this.lastPrompt);
    }
  }

  private addAssistantMessage(html: string) {
    this.messages = [...this.messages, { content: html, role: Role.Assistant }];
  }
}

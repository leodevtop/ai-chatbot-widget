import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { getStoredSession, requestNewSession, useSession } from './services/session.service';
import { sendMessage } from './services/message.service'; // Import the new message service
import { renderMarkdown } from './utils/markdown.utils'; // Import the markdown utility
import { ChatMessage, Role } from './types';
import { mystyles } from './styles';
import { loadConfiguration } from './utils/config.utils'; // Import the new config utility

import './components/button/ui-button';
import './components/chat-launcher-button/chat-launcher-button'; // Import the new component
import './components/teaser-message/teaser-message'; // Import the new teaser message component
import './components/chat-box/chat-box'; // Import the new chat box component
import './components/quick-replies/quick-replies'; // Import the new quick replies component

@customElement('chatbot-widget')
export class ChatbotWidget extends LitElement {
  // Public properties
  @property({ type: String }) siteId = 'site-001';
  @property({ type: String }) siteToken = '';
  @property({ type: String }) position: 'left' | 'right' = 'right';
  @property({ type: String }) themeColor = '#4caf50';
  @property({ type: String }) title = 'Chatbot';

  // Internal reactive states
  @state() private messages: ChatMessage[] = [];
  @state() private userInput = '';
  @state() private isLoading = false;
  @state() private typingIndicator: string | null = null;
  @state() private sessionId: string | null = null;
  @state() private isChatOpen = false; // New state to control chat window visibility
  @state() private teaserVisible = false; // New state for teaser message visibility
  @state() private quickReplies: string[] = []; // New state for quick replies

  private typingInterval: number | null = null;
  private teaserTimeout: number | null = null;

  connectedCallback() {
    super.connectedCallback();
    console.log('[ChatbotWidget] Connected');
    loadConfiguration(this); // Use the new loadConfiguration utility
    console.log('[ChatbotWidget] Site ID:', this.siteId);
    this.initSession(); // Initialize session after configuration is loaded
  }

  firstUpdated() {
    // Show teaser message after a delay if chat is not open
    this.teaserTimeout = window.setTimeout(() => {
      if (!this.isChatOpen) {
        this.teaserVisible = true;
      }
    }, 5000); // Show after 5 seconds
  }

  private async initSession() {
    const msgWelcome = '<p>Xin chào! Tôi có thể giúp gì cho bạn hôm nay?</p>';
    const msgError = '<p>Lỗi: Không thể khởi tạo phiên chat.</p>';
    this.startTyping();

    const session = getStoredSession();
    if (session) {
      useSession(session, (token, sessionId) => {
        this.siteToken = token;
        this.sessionId = sessionId;
      });
      return this.addAssistantMessageAndFinalize(msgWelcome);
    }

    try {
      const newSession = await requestNewSession(this.siteId);
      useSession(newSession, (token, sessionId) => {
        this.siteToken = token;
        this.sessionId = sessionId;
      });
      await this.addAssistantMessageAndFinalize(msgWelcome);
    } catch (err) {
      await this.addAssistantMessageAndFinalize(msgError);
      console.error('[ChatbotWidget] Failed to initiate new session:', err);
    }
  }

  // CSS styling for the chatbot UI
  static styles = mystyles;

  // Main render function
  render() {
    return html`
      <chat-launcher-button
        .isChatOpen=${this.isChatOpen}
        @toggle-chat=${this._handleToggleChat}
      ></chat-launcher-button>

      ${!this.isChatOpen && this.teaserVisible
        ? html`<teaser-message .visible=${this.teaserVisible}></teaser-message>`
        : ''}

      <chat-box
        class="${this.isChatOpen ? 'open' : ''}"
        .title=${this.title}
        .messages=${this.messages}
        .userInput=${this.userInput}
        .isLoading=${this.isLoading}
        .typingIndicator=${this.typingIndicator}
        @user-input=${this.handleInput}
        @send-message=${this.sendUserMessage}
      ></chat-box>

      ${this.isChatOpen && this.quickReplies.length > 0
        ? html`<quick-replies .replies=${this.quickReplies} @quick-reply-selected=${this._handleQuickReply}></quick-replies>`
        : ''}
    `;
  }

  private _handleQuickReply(event: CustomEvent) {
    const reply = event.detail;
    this.userInput = reply;
    this.sendUserMessage();
  }

  private _handleToggleChat() {
    this.isChatOpen = !this.isChatOpen;
    if (this.isChatOpen) {
      this.teaserVisible = false; // Hide teaser when chat opens
      if (this.teaserTimeout) {
        clearTimeout(this.teaserTimeout);
        this.teaserTimeout = null;
      }
      this.updateComplete.then(() => this.scrollToBottom());
    }
  }

  // Handle user typing
  handleInput(event: Event) {
    this.userInput = (event.target as HTMLInputElement).value;
    this.requestUpdate(); // Ensure UI updates to reflect input change and button state
  }

  // Handle Enter key to send message
  handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.sendUserMessage();
    }
  }

  private async finalizeMessageProcessing() {
    this.stopTyping();
    this.isLoading = false;
    await this.requestUpdate();
    this.scrollToBottom();
  }

  private async addAssistantMessageAndFinalize(message: string) {
    this.messages = [...this.messages, { content: message, role: Role.Assistant }];
    await this.finalizeMessageProcessing();
  }

  async sendByAssistant(message: string) {
    // This function is now simplified, as finalizeMessageProcessing is handled elsewhere
    this.messages = [...this.messages, { content: message, role: Role.Assistant }];
    await this.requestUpdate();
    this.scrollToBottom();
  }

  // Send user message and fetch AI reply
  async sendUserMessage() {
    const message = this.userInput.trim();
    const smgError = 'Lỗi: Không lấy được câu trả lời.';

    if (this.isLoading || !message || !this.sessionId) return; // Ensure sessionId is available

    this.isLoading = true;
    this.userInput = ''; // reset input binding
    await this.requestUpdate(); // ensure DOM update
    const input = this.shadowRoot?.querySelector('input') as HTMLInputElement;
    if (input) {
      input.value = '';
      input.blur();
    }

    this.messages = [...this.messages, { content: message, role: Role.User }];
    this.startTyping();

    try {
      // Use the new message service
      const aiReplyMarkdown = await sendMessage(
        this.siteId,
        this.messages, // Pass the full message history
        this.siteToken,
        this.sessionId! // sessionId should be available after initSession
      );

      const html = renderMarkdown(aiReplyMarkdown); // Use the utility function
      await this.addAssistantMessageAndFinalize(html);
    } catch (error) {
      console.error('Error sending message:', error);
      await this.addAssistantMessageAndFinalize(smgError);
    }
  }

  startTyping() {
    if (this.typingInterval) {
      // Clear existing interval if any
      clearInterval(this.typingInterval);
    }

    const dotStates = ['Đang gõ.', 'Đang gõ..', 'Đang gõ...'];
    let index = 0;
    this.typingIndicator = dotStates[0];

    this.typingInterval = window.setInterval(() => {
      index = (index + 1) % dotStates.length;
      this.typingIndicator = dotStates[index];
      this.requestUpdate();
      this.scrollToBottom();
    }, 500);
  }

  stopTyping() {
    if (this.typingInterval) {
      clearInterval(this.typingInterval);
      this.typingInterval = null;
    }
    this.typingIndicator = null;
  }

  scrollToBottom() {
    const messagesContainer = this.shadowRoot?.querySelector('.messages');
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }
}

// Auto-initialize widget if loaded from <script type="module" ... data-site=...>
// The script variable is already defined in loadConfiguration, so we don't need to redefine it here.
// We also don't need to pass siteId/siteToken explicitly to the widget constructor anymore,
// as loadConfiguration handles it internally.

window.addEventListener('load', () => {
  const widget = document.createElement('chatbot-widget') as ChatbotWidget;
  document.body.appendChild(widget);
  console.log('[ChatbotWidget] Auto-loaded.');
});

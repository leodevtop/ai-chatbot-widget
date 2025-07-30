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

  // No longer needed here, moved to ChatLauncherButton
  // private toggleChat() {
  //   this.isChatOpen = !this.isChatOpen;
  //   if (this.isChatOpen) {
  //     this.updateComplete.then(() => this.scrollToBottom());
  //   }
  // }

  private typingInterval: number | null = null;

  connectedCallback() {
    super.connectedCallback();
    console.log('[ChatbotWidget] Connected');
    loadConfiguration(this); // Use the new loadConfiguration utility
    console.log('[ChatbotWidget] Site ID:', this.siteId);
    this.initSession(); // Initialize session after configuration is loaded
  }

  firstUpdated() {
    // this.startTyping(); // typing animation
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

      <div class="container ${this.isChatOpen ? 'open' : ''}">
        <div class="header">${this.title}</div>
        <div class="messages">
          ${this.messages.map(
            (msg) => html`<div class="message ${msg.role}">
              ${msg.role === Role.Assistant ? unsafeHTML(msg.content) : msg.content}
            </div>`
          )}
          ${this.typingIndicator ? html`<div class="message assistant typing">${this.typingIndicator}</div>` : ''}
        </div>
        <div class="input-area">
          <input
            type="text"
            .value=${this.userInput}
            @input=${this.handleInput}
            @keydown=${this.handleKeyDown}
            placeholder="Đặt câu hỏi..."
            ?disabled=${this.isLoading}
          />
          <button @click=${this.sendUserMessage} ?disabled=${this.isLoading || !this.userInput.trim()}>
            ${this.isLoading ? '...' : 'Gửi'}
          </button>
        </div>
      </div>
    `;
  }

  private _handleToggleChat() {
    this.isChatOpen = !this.isChatOpen;
    if (this.isChatOpen) {
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

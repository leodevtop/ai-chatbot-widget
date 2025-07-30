import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { getStoredSession, requestNewSession, useSession } from './services/session.service';
import { sendMessage } from './services/message.service'; // Import the new message service
import { renderMarkdown } from './utils/markdown.utils'; // Import the markdown utility
import { ChatbotSession, ChatMessage, Role } from './types';
import { mystyles } from './styles';

import './components/button/ui-button';

// Define a type for the global configuration object
declare global {
  interface Window {
    ChatboxWidgetConfig?: {
      position?: 'left' | 'right';
      themeColor?: string;
      title?: string;
    };
  }
}

const findSelfScript = () => {
  const scripts = document.querySelectorAll('script');
  return Array.from(scripts).find((s) => s.src?.includes('widget') || s.dataset.site);
};

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

  private toggleChat() {
    this.isChatOpen = !this.isChatOpen;
    if (this.isChatOpen) {
      // When opening, ensure scroll to bottom
      this.updateComplete.then(() => this.scrollToBottom());
    }
  }

  private typingInterval: number | null = null;

  connectedCallback() {
    super.connectedCallback();
    console.log('[ChatbotWidget] Connected');
    this.loadConfiguration();
    console.log('[ChatbotWidget] Site ID:', this.siteId);
    this.initSession(); // Initialize session after configuration is loaded
  }

  firstUpdated() {
    // this.startTyping(); // typing animation
  }

  private loadConfiguration() {
    const script = (document.currentScript as HTMLScriptElement | null) || findSelfScript();
    if (!script) {
      console.warn('[ChatbotWidget] Không tìm thấy <script> để đọc config.');
      return;
    }

    const url = new URL(script.src, location.href);
    const urlParams = url.searchParams;

    // Ưu tiên 1: ChatboxWidgetConfig
    const config = window.ChatboxWidgetConfig;
    if (config) {
      if (config.position) this.position = config.position;
      if (config.themeColor) this.themeColor = config.themeColor;
      if (config.title) this.title = config.title;
    }

    // Ưu tiên 2: ?id trên src
    const urlId = urlParams.get('id');
    if (urlId) {
      this.siteId = urlId;
    }

    // Ưu tiên 3: data-site trên <script>
    const datasetSiteId = script.dataset.site;
    if (!urlId && datasetSiteId) {
      this.siteId = datasetSiteId;
    }

    // Token (nếu có)
    const datasetToken = script.dataset.token;
    if (datasetToken) {
      this.siteToken = datasetToken;
    }

    this.style.setProperty('--chatbot-primary-color', this.themeColor);
    this.style.setProperty('--chatbot-primary-light-color', this.themeColor + 'B3');
    this.style.setProperty('--chatbot-position', this.position);
  }

  private async initSession() {
    const msgWelcome = '<p>Xin chào! Tôi có thể giúp gì cho bạn hôm nay?</p>';
    const msgError = '<p>Lỗi: Không thể khởi tạo phiên chat.</p>';

    const applySession = (session: ChatbotSession) => {
      useSession(session, (token, sessionId) => {
        this.siteToken = token;
        this.sessionId = sessionId;
      });
      this.startTyping();
      this.sendByAssistant(msgWelcome);
    };

    const stored = getStoredSession();
    if (stored) return applySession(stored);

    try {
      const session = await requestNewSession(this.siteId);
      this.sendByAssistant(msgWelcome);
    } catch (err) {
      this.sendByAssistant(msgError);
      console.error('[ChatbotWidget] Failed to initiate new session:', err);
    }
  }

  // CSS styling for the chatbot UI
  static styles = mystyles;

  // Main render function
  render() {
    return html`
      <ui-button @click=${this.toggleChat}>
        ${this.isChatOpen ? html`&#x2715;` : html`&#x1F4AC;`}
        <!-- X or Chat bubble icon -->
      </ui-button>
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
          <button @click=${this._sendMessage} ?disabled=${this.isLoading || !this.userInput.trim()}>
            ${this.isLoading ? '...' : 'Gửi'}
          </button>
        </div>
      </div>
    `;
  }

  // Handle user typing
  handleInput(event: Event) {
    this.userInput = (event.target as HTMLInputElement).value;
  }

  // Handle Enter key to send message
  handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this._sendMessage();
    }
  }

  async sendByAssistant(message: string) {
    this.startTyping();
    this.messages = [...this.messages, { content: message, role: Role.Assistant }];
    await this.requestUpdate();
    this.scrollToBottom();
    this.stopTyping();
  }

  // Send user message and fetch AI reply
  async _sendMessage() {
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
      this.messages = [...this.messages, { content: html, role: Role.Assistant }];
    } catch (error) {
      console.error('Error sending message:', error);
      this.messages = [...this.messages, { content: smgError, role: Role.Assistant }];
    } finally {
      this.isLoading = false;
      await this.requestUpdate();
      this.scrollToBottom();
      this.stopTyping();
    }
  }

  startTyping() {
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

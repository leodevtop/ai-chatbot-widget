import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { getStoredSession, requestNewSession, useSession } from './services/session.service';
import { sendMessage } from './services/message.service'; // Import the new message service
import { renderMarkdown } from './utils/markdown.utils'; // Import the markdown utility
import { ChatMessage, Role } from './types';
import { mystyles } from './styles';

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

@customElement('chatbot-widget')
export class ChatbotWidget extends LitElement {
  // Public properties
  @property({ type: String }) siteId = 'site-001';
  @property({ type: String }) siteToken = '';
  @property({ type: String }) position: 'left' | 'right' = 'right';
  @property({ type: String }) themeColor = '#4caf50';
  @property({ type: String }) title = 'Chatbot';

  // Internal reactive states
  @state() private messages: ChatMessage[] = []; // Changed to role/content
  @state() private userInput = '';
  @state() private isLoading = false;
  @state() private typingIndicator: string | null = null;
  @state() private sessionId: string | null = null;
  @state() private isChatOpen = false; // New state to control chat window visibility

  private typingInterval: number | null = null;

  connectedCallback() {
    super.connectedCallback();
    console.log('[ChatbotWidget] Connected');
    this.loadConfiguration();
    console.log('[ChatbotWidget] Site ID:', this.siteId);
    this.initSession(); // Initialize session after configuration is loaded
  }

  firstUpdated() {
    this.sendWelcomeMessage();
  }

  private loadConfiguration() {
    const script = document.currentScript as HTMLScriptElement;
    const urlParams = new URLSearchParams(script?.src.split('?')[1]);

    // 1. Read from window.ChatboxWidgetConfig (highest precedence for theme/position/title)
    if (window.ChatboxWidgetConfig) {
      if (window.ChatboxWidgetConfig.position) {
        this.position = window.ChatboxWidgetConfig.position;
      }
      if (window.ChatboxWidgetConfig.themeColor) {
        this.themeColor = window.ChatboxWidgetConfig.themeColor;
      }
      if (window.ChatboxWidgetConfig.title) {
        this.title = window.ChatboxWidgetConfig.title;
      }
    }

    // 2. Read siteId from URL query 'id' (medium precedence for siteId)
    const urlId = urlParams.get('id');
    if (urlId) {
      this.siteId = urlId;
    }

    // 3. Read from script.dataset (lowest precedence for siteId, primary for siteToken)
    const datasetSiteId = script?.dataset.site;
    if (datasetSiteId && !urlId) {
      // Only use dataset.site if URL 'id' is not present
      this.siteId = datasetSiteId;
    }
    const datasetSiteToken = script?.dataset.token;
    if (datasetSiteToken) {
      this.siteToken = datasetSiteToken;
    }

    // Apply theme color to CSS variables
    this.style.setProperty('--chatbot-primary-color', this.themeColor);
    this.style.setProperty('--chatbot-primary-light-color', this.themeColor + 'B3'); // 70% opacity
    this.style.setProperty('--chatbot-position', this.position);
  }

  private async initSession() {
    let session = getStoredSession();

    if (session) {
      useSession(session, (token, sessionId) => {
        this.siteToken = token;
        this.sessionId = sessionId;
      });
    } else {
      try {
        session = await requestNewSession(this.siteId);
        useSession(session, (token, sessionId) => {
          this.siteToken = token;
          this.sessionId = sessionId;
        });
      } catch (error) {
        console.error('[ChatbotWidget] Failed to initiate new session:', error);
        this.messages = [...this.messages, { content: 'Lỗi: Không thể khởi tạo phiên chat.', role: Role.Assistant }];
      }
    }
  }

  static styles = mystyles;

  // Main render function
  render() {
    return html`
      <button class="chat-button ${`position-${this.position}`}" @click=${this.toggleChat}>
        ${this.isChatOpen ? html`&#x2715;` : html`&#x1F4AC;`}
        <!-- X or Chat bubble icon -->
      </button>

      <div class="container ${this.isChatOpen ? 'open' : ''} ${`position-${this.position}`}">
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

  private async toggleChat() {
    this.isChatOpen = !this.isChatOpen;
    await this.requestUpdate(); // ensure DOM update
    if (this.isChatOpen) {
      // When opening, ensure scroll to bottom
      this.updateComplete.then(() => this.scrollToBottom());
    }
  }

  private async sendWelcomeMessage() {
    const welcome = '<p>Xin chào! Tôi có thể giúp gì cho bạn hôm nay?</p>';

    this.startTyping(); // typing animation
    await new Promise((res) => setTimeout(res, 1000)); // simulate loading

    this.stopTyping();
    this.messages = [...this.messages, { content: welcome, role: Role.Assistant }]; // Changed to role/content
    this.requestUpdate();
    this.scrollToBottom();
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

  // Send user message and fetch AI reply
  async _sendMessage() {
    const message = this.userInput.trim();
    if (this.isLoading || !message || !this.sessionId) return; // Ensure sessionId is available

    this.isLoading = true;
    this.userInput = ''; // reset input binding
    await this.requestUpdate(); // ensure DOM update
    const input = this.shadowRoot?.querySelector('input') as HTMLInputElement;
    if (input) {
      input.value = '';
      input.blur();
    }

    this.messages = [...this.messages, { content: message, role: Role.User }]; // Changed to role/content
    this.startTyping();

    try {
      // Use the new message service
      const aiReplyMarkdown = await sendMessage(
        this.siteId,
        this.messages, // Pass the full message history
        this.siteToken,
        this.sessionId! // sessionId should be available after initSession
      );

      this.stopTyping();
      const html = renderMarkdown(aiReplyMarkdown); // Use the utility function
      this.messages = [...this.messages, { content: html, role: Role.Assistant }]; // Changed to role/content
    } catch (error) {
      console.error('Error sending message:', error);
      this.stopTyping();
      this.messages = [...this.messages, { content: 'Lỗi: Không lấy được câu trả lời.', role: Role.Assistant }]; // Changed to role/content
    } finally {
      this.isLoading = false;
      await this.requestUpdate();
      this.scrollToBottom();
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

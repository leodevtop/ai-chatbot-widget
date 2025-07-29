import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { getStoredSession, requestNewSession, useSession } from './services/session.service';
import { sendMessage } from './services/message.service'; // Import the new message service
import { renderMarkdown } from './utils/markdown.utils'; // Import the markdown utility
import { ChatMessage, Role } from './types';

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

  // CSS styling for the chatbot UI
  static styles = css`
    :host {
      display: block;
      font-size: 13px;
      font-family: sans-serif;
      --chatbot-primary-color: #4caf50; /* Default, overridden by themeColor */
      --chatbot-primary-light-color: rgba(76, 175, 79, 0.7); /* Default, overridden by themeColor */
      --chatbot-text-color: #333;
      --chatbot-bg-color: #f9f9f9;
      --chatbot-border-color: #ddd;
      --chatbot-position: right; /* Default, overridden by position */
    }

    .chat-button {
      position: fixed;
      bottom: 20px;
      z-index: 10000;
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background-color: var(--chatbot-primary-color);
      color: white;
      border: none;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      cursor: pointer;
      transition: background-color 0.3s ease, transform 0.3s ease;
      left: var(--chatbot-position, right) == 'left' ? 20px : auto;
      right: var(--chatbot-position, right) == 'right' ? 20px : auto;
    }

    .chat-button:hover {
      background-color: #45a049;
      transform: scale(1.05);
    }

    .container {
      border: 1px solid var(--chatbot-border-color);
      border-radius: 8px;
      width: 350px;
      height: 450px;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
      background-color: var(--chatbot-bg-color);
      position: fixed;
      bottom: 20px;
      z-index: 9999;
      /* Position based on --chatbot-position */
      left: var(--chatbot-position, right) == 'left' ? 20px : auto;
      right: var(--chatbot-position, right) == 'right' ? 20px : auto;
      transform: translateY(100%); /* Start hidden below the screen */
      opacity: 0;
      visibility: hidden;
      transition: transform 0.3s ease-out, opacity 0.3s ease-out, visibility 0.3s ease-out;
    }

    .container.open {
      transform: translateY(0); /* Slide up into view */
      opacity: 1;
      visibility: visible;
    }

    .header {
      background-color: var(--chatbot-primary-color);
      color: white;
      padding: 10px;
      text-align: center;
      font-weight: bold;
    }

    p {
      margin-top: 0;
      margin-bottom: 0.5rem;
    }

    .messages {
      flex-grow: 1;
      padding: 10px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
    }

    .message {
      margin-bottom: 8px;
      padding: 10px;
      border-radius: 10px;
      max-width: 80%;
    }

    .message.user {
      align-self: flex-end;
      background-color: #e0e0e0;
      color: var(--chatbot-text-color);
      border-bottom-right-radius: 2px;
    }

    .message.assistant {
      align-self: flex-start;
      background-color: var(--chatbot-primary-color);
      color: white;
      border-bottom-left-radius: 2px;
      &.typing {
        font-style: italic;
        background-color: var(--chatbot-primary-light-color);
      }

      p:last-child {
        margin-bottom: 0;
      }
    }

    .input-area {
      display: flex;
      padding: 10px;
      border-top: 1px solid var(--chatbot-border-color);
    }

    input {
      flex-grow: 1;
      padding: 8px;
      border: 1px solid var(--chatbot-border-color);
      border-radius: 4px;
      margin-right: 8px;
    }

    button {
      background-color: var(--chatbot-primary-color);
      color: white;
      border: none;
      padding: 8px 15px;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.3s ease;
    }

    button:hover {
      background-color: #45a049;
    }

    button:disabled {
      background-color: #cccccc;
      cursor: not-allowed;
    }
  `;

  // Main render function
  render() {
    return html`
      <button class="chat-button" @click=${this.toggleChat}>
        ${this.isChatOpen ? html`&#x2715;` : html`&#x1F4AC;`}
        <!-- X or Chat bubble icon -->
      </button>

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
          <button @click=${this.sendMessage} ?disabled=${this.isLoading || !this.userInput.trim()}>
            ${this.isLoading ? '...' : 'Gửi'}
          </button>
        </div>
      </div>
    `;
  }

  private toggleChat() {
    this.isChatOpen = !this.isChatOpen;
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
      this.sendMessage();
    }
  }

  // Send user message and fetch AI reply
  async sendMessage() {
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

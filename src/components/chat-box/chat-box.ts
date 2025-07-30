import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { ChatMessage, Role } from '../../types'; // Adjust path as needed
import '../quick-replies/quick-replies'; // Import QuickReplies
import '../chat-error-banner/chat-error-banner'; // Import ChatErrorBanner

@customElement('chat-box')
export class ChatBox extends LitElement {
  @property({ type: String }) title = 'Chatbot';
  @property({ type: Array }) messages: ChatMessage[] = [];
  @property({ type: String }) userInput = '';
  @property({ type: Boolean }) isLoading = false;
  @property({ type: String }) typingIndicator: string | null = null;
  @property({ type: Array }) quickReplies: string[] = []; // New property for quick replies
  @property({ type: String }) errorState: 'init' | 'reply' | null = null; // New property for error state
  @property({ type: String }) lastPrompt: string = ''; // New property for last prompt

  static styles = css`
    :host {
      display: block;
      /* Styles for the chat container */
      position: fixed;
      bottom: 90px; /* Adjust based on launcher button size */
      right: 20px;
      width: 350px;
      height: 450px;
      background-color: #fff;
      border-radius: 10px;
      box-shadow: 0 0 15px rgba(0, 0, 0, 0.2);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      transition: all 0.3s ease;
      z-index: 998; /* Below launcher button, above teaser */
    }

    .header {
      background-color: var(--chatbot-primary-color, #4caf50);
      color: white;
      padding: 15px;
      font-size: 18px;
      font-weight: bold;
      text-align: center;
      border-top-left-radius: 10px;
      border-top-right-radius: 10px;
    }

    .messages {
      flex-grow: 1;
      padding: 15px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 10px;
      background-color: #f9f9f9;
    }

    .message {
      max-width: 80%;
      padding: 8px 12px;
      border-radius: 15px;
      word-wrap: break-word;
    }

    .message.user {
      align-self: flex-end;
      background-color: var(--chatbot-primary-light-color, #81c784);
      color: white;
      border-bottom-right-radius: 2px;
    }

    .message.assistant {
      align-self: flex-start;
      background-color: #e0e0e0;
      color: #333;
      border-bottom-left-radius: 2px;
    }

    .message.assistant.typing {
      font-style: italic;
      color: #666;
    }

    .input-area {
      display: flex;
      padding: 10px 15px;
      border-top: 1px solid #eee;
      background-color: #fff;
    }

    input {
      flex-grow: 1;
      border: 1px solid #ddd;
      border-radius: 20px;
      padding: 8px 15px;
      font-size: 14px;
      margin-right: 10px;
      outline: none;
    }

    input:focus {
      border-color: var(--chatbot-primary-color, #4caf50);
    }

    button {
      background-color: var(--chatbot-primary-color, #4caf50);
      color: white;
      border: none;
      border-radius: 20px;
      padding: 8px 15px;
      cursor: pointer;
      font-size: 14px;
      transition: background-color 0.3s ease;
    }

    button:disabled {
      background-color: #ccc;
      cursor: not-allowed;
    }
  `;

  render() {
    return html`
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
          @input=${this._handleInput}
          @keydown=${this._handleKeyDown}
          placeholder="Đặt câu hỏi..."
          ?disabled=${this.isLoading}
        />
        <button @click=${this._sendMessage} ?disabled=${this.isLoading || !this.userInput.trim()}>
          ${this.isLoading ? '...' : 'Gửi'}
        </button>
      </div>

      ${this.quickReplies.length > 0
        ? html`<quick-replies .replies=${this.quickReplies} @quick-reply-selected=${this._handleQuickReply}></quick-replies>`
        : ''}

      ${this.errorState
        ? html`<chat-error-banner
            .visible=${!!this.errorState}
            .errorType=${this.errorState}
            @retry-action=${this._handleRetryAction}
          ></chat-error-banner>`
        : ''}
    `;
  }

  private _handleInput(event: Event) {
    this.dispatchEvent(new CustomEvent('user-input', { detail: (event.target as HTMLInputElement).value }));
  }

  private _handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.dispatchEvent(new CustomEvent('send-message'));
    }
  }

  private _sendMessage() {
    this.dispatchEvent(new CustomEvent('send-message'));
  }

  private _handleQuickReply(event: CustomEvent) {
    this.dispatchEvent(new CustomEvent('quick-reply-selected', { detail: event.detail }));
  }

  private _handleRetryAction(event: CustomEvent) {
    this.dispatchEvent(new CustomEvent('retry-action', { detail: event.detail }));
  }
}

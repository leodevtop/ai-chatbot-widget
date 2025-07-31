import { LitElement, html, css } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { ChatMessage, Role } from '~/types/chat';

@customElement('chat-body')
export class ChatBody extends LitElement {
  @property({ type: Array }) messages: ChatMessage[] = [];
  @property({ type: String }) typingIndicator: string | null = null;

  @query('.messages')
  private _messagesContainer!: HTMLDivElement;

  static styles = css`
    :host {
      display: flex;
      flex-direction: column;
      flex-grow: 1;
      overflow: hidden; /* To contain the scrolling messages div */
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

    p {
      margin-top: 0;
      margin-bottom: 0.5rem;
    }

    .message p:last-child {
      margin-bottom: 0;
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
  `;

  updated(changedProperties: Map<string, any>) {
    if (changedProperties.has('messages') || changedProperties.has('typingIndicator')) {
      this.scrollToLatestMessage();
    }
  }

  render() {
    return html`
      <div class="messages">
        ${this.messages.map(
          (msg) => html`<div class="message ${msg.role}">
            ${msg.role === Role.Assistant ? unsafeHTML(msg.content) : msg.content}
          </div>`
        )}
        ${this.typingIndicator ? html`<div class="message assistant typing">${this.typingIndicator}</div>` : ''}
      </div>
    `;
  }

  public scrollToLatestMessage() {
    // Use a microtask to allow the DOM to update before scrolling
    Promise.resolve().then(() => {
        if (this._messagesContainer) {
            const lastElement = this._messagesContainer.lastElementChild;
            if (lastElement) {
                // const top = (lastElement as HTMLElement).offsetTop + 30;
                // this._messagesContainer.scrollTo({ top, behavior: 'smooth' });
                lastElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        }
    });
  }
}

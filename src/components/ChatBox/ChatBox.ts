import { LitElement, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { styles } from './ChatBox.styles.js';
import type { ChatMessage } from '~/types/chat.js';

// Import children
import './ChatHeader.js';
import './ChatBody.js';
import './QuickReplies.js';
import './InputBox.js';
import './ChatErrorBanner.js';

@customElement('chat-box')
export class ChatBox extends LitElement {
  static styles = styles;

  @property({ type: String }) title = 'Chatbot';
  @property({ type: Array }) messages: ChatMessage[] = [];
  @property({ type: Array }) quickReplies: string[] = [];
  @property({ type: String }) errorState: 'init' | 'reply' | null = null;
  @property({ type: Boolean }) isLoading = false;
  @property({ type: String }) typingIndicator: string | null = null;

  render() {
    return html`
      <chat-header .title=${this.title} @minimize=${this._dispatchMinimize}></chat-header>
      <chat-body .messages=${this.messages} .typingIndicator=${this.typingIndicator}></chat-body>
      ${this.errorState
        ? html`<chat-error-banner .type=${this.errorState} @retry=${this._dispatchRetry}></chat-error-banner>`
        : null}
      <quick-replies .items=${this.quickReplies} @quick-reply=${this._dispatchQuickReply}></quick-replies>
      <input-box .isLoading=${this.isLoading} @submit=${this._dispatchSubmit}></input-box>
    `;
  }

  private _dispatch(eventName: string, detail = {}) {
    this.dispatchEvent(new CustomEvent(eventName, { detail, bubbles: true, composed: true }));
  }

  private _dispatchMinimize() { this._dispatch('minimize'); }
  private _dispatchRetry() { this._dispatch('retry'); }
  private _dispatchQuickReply(e: CustomEvent) { this._dispatch('quick-reply', e.detail); }
  private _dispatchSubmit(e: CustomEvent) { this._dispatch('submit', e.detail); }
}
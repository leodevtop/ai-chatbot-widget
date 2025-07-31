import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('chat-error-banner')
export class ChatErrorBanner extends LitElement {
  @property({ type: String }) type: 'init' | 'reply' | null = null;

  static styles = css`
    :host {
      display: block;
      padding: 10px 15px;
      background-color: #f8d7da;
      color: #721c24;
      border-top: 1px solid #f5c6cb;
      border-bottom: 1px solid #f5c6cb;
      text-align: center;
      font-size: 14px;
    }

    button {
      background-color: #dc3545;
      color: white;
      border: none;
      border-radius: 5px;
      padding: 5px 10px;
      margin-left: 10px;
      cursor: pointer;
      font-size: 13px;
      transition: background-color 0.3s ease;
    }

    button:hover {
      background-color: #c82333;
    }
  `;

  render() {
    if (!this.type) return null;

    const message = this.type === 'init'
      ? 'Lỗi kết nối phiên chat.'
      : 'Không thể gửi tin nhắn.';

    return html`
      <span>${message}</span>
      <button @click=${this._handleRetry}>Thử lại</button>
    `;
  }

  private _handleRetry() {
    this.dispatchEvent(new CustomEvent('retry', {
      bubbles: true,
      composed: true
    }));
  }
}

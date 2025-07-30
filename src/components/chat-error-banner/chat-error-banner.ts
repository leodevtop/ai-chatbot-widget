import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('chat-error-banner')
export class ChatErrorBanner extends LitElement {
  @property({ type: String }) message = 'Đã xảy ra lỗi.';
  @property({ type: Boolean }) visible = false;
  @property({ type: String }) errorType: 'init' | 'reply' | null = null;

  static styles = css`
    :host {
      display: block;
      position: fixed;
      bottom: 160px; /* Adjust based on other components */
      right: 20px;
      background-color: #f8d7da;
      color: #721c24;
      border: 1px solid #f5c6cb;
      border-radius: 8px;
      padding: 10px 15px;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
      opacity: 0;
      transform: translateY(10px);
      transition: opacity 0.3s ease, transform 0.3s ease;
      z-index: 997;
      max-width: 250px;
      text-align: center;
      font-size: 14px;
    }

    :host([visible]) {
      opacity: 1;
      transform: translateY(0);
    }

    button {
      background-color: #dc3545;
      color: white;
      border: none;
      border-radius: 5px;
      padding: 5px 10px;
      margin-top: 10px;
      cursor: pointer;
      font-size: 13px;
      transition: background-color 0.3s ease;
    }

    button:hover {
      background-color: #c82333;
    }
  `;

  render() {
    if (!this.visible) return html``;

    return html`
      <p>${this.message}</p>
      <button @click=${this._handleRetry}>Thử lại</button>
    `;
  }

  private _handleRetry() {
    this.dispatchEvent(new CustomEvent('retry-action', { detail: this.errorType, bubbles: true, composed: true }));
  }
}

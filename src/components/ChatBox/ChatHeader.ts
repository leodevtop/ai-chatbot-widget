import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('chat-header')
export class ChatHeader extends LitElement {
  @property({ type: String }) title = 'Chatbot';

  static styles = css`
    .header {
      background-color: var(--chatbot-primary-color, #4caf50);
      color: white;
      padding: 15px;
      font-size: 18px;
      font-weight: bold;
      text-align: center;
      border-top-left-radius: 10px;
      border-top-right-radius: 10px;
      position: relative;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .minimize-btn {
      position: absolute;
      right: 15px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      color: white;
      font-size: 24px;
      cursor: pointer;
    }
  `;

  render() {
    return html`
      <div class="header">
        <span>${this.title}</span>
        <button class="minimize-btn" @click=${this._handleMinimizeClick}>&times;</button>
      </div>
    `;
  }

  private _handleMinimizeClick() {
    this.dispatchEvent(new CustomEvent('minimize', { bubbles: true, composed: true }));
  }
}

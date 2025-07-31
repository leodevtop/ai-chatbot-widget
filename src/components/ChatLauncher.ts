import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('chat-launcher')
export class ChatLauncher extends LitElement {
  static styles = css`
    :host {
      display: block;
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 1000;
    }

    button {
      background-color: var(--chatbot-primary-color, #4caf50);
      color: white;
      border: none;
      border-radius: 50%;
      width: 60px;
      height: 60px;
      font-size: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
      transition: transform 0.3s ease;
    }

    button:hover {
      transform: scale(1.05);
    }
  `;

  render() {
    // This button is only visible when the chat is closed, so it always shows the "open" icon.
    return html` <button @click=${this._handleClick}>&#x1F4AC;</button> `;
  }

  private _handleClick() {
    this.dispatchEvent(new CustomEvent('open-chat', { bubbles: true, composed: true }));
  }
}

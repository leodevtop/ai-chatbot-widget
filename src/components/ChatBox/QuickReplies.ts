import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('quick-replies')
export class QuickReplies extends LitElement {
  @property({ type: Array }) items: string[] = [];

  static styles = css`
    :host {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      padding: 10px 15px;
      justify-content: center;
      border-top: 1px solid #eee;
      background-color: #f0f0f0;
    }

    button {
      background-color: var(--chatbot-primary-light-color, #81c784);
      color: white;
      border: none;
      border-radius: 20px;
      padding: 8px 12px;
      cursor: pointer;
      font-size: 13px;
      transition: background-color 0.3s ease;
    }

    button:hover {
      background-color: var(--chatbot-primary-color, #4caf50);
    }
  `;

  render() {
    if (!this.items || this.items.length === 0) {
      return null;
    }
    return html`
      ${this.items.map(
        (item) => html`
          <button @click=${() => this._handleClick(item)}>${item}</button>
        `
      )}
    `;
  }

  private _handleClick(reply: string) {
    this.dispatchEvent(new CustomEvent('quick-reply', {
      detail: { message: reply },
      bubbles: true,
      composed: true
    }));
  }
}

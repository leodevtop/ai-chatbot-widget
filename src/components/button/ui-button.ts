import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('ui-button')
export class UIButton extends LitElement {
  static styles = css`
    button {
    }
  `;

  render() {
    return html`<button class="chat-button"><slot></slot></button>`;
  }
}

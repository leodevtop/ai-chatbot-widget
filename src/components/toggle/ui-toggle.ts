import { LitElement, html, css } from 'lit';
import { customElement, state } from 'lit/decorators.js';

import '../button/ui-button';

@customElement('ui-toggle')
export class UIToggle extends LitElement {
  static styles = css`
    .content {
      margin-top: 1rem;
      padding: 1rem;
      border: 1px solid #ccc;
      border-radius: 6px;
      display: none;
    }
    .content.show {
      display: block;
    }
  `;

  @state() private open = false;

  toggle() {
    this.open = !this.open;
  }

  render() {
    return html`
      <ui-button @click=${this.toggle}> ${this.open ? 'Hide' : 'Show'} </ui-button>
      <div class="content ${this.open ? 'show' : ''}">
        <slot></slot>
      </div>
    `;
  }
}

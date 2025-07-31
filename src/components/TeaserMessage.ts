import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';

@customElement('teaser-message')
export class TeaserMessage extends LitElement {
  static styles = css`
    :host {
      position: fixed;
      bottom: 90px; /* Above the launcher */
      right: 20px;
      background-color: #fff;
      color: #333;
      padding: 12px 15px;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
      z-index: 999;
      font-size: 14px;
      max-width: 250px;
      animation: slide-in 0.5s forwards;
    }

    @keyframes slide-in {
      from {
        opacity: 0;
        transform: translateY(10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `;

  render() {
    return html`<div>Xin chào! Tôi có thể giúp gì cho bạn?</div>`;
  }
}
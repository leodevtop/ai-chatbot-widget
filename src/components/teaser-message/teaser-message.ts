import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';

@customElement('teaser-message')
export class TeaserMessage extends LitElement {
  @property({ type: String }) message = 'Xin chào! Tôi có thể giúp gì cho bạn hôm nay?';
  @property({ type: Boolean }) visible = false;

  static styles = css`
    :host {
      display: block;
      position: fixed;
      bottom: 90px; /* Adjust based on launcher button size */
      right: 20px;
      background-color: white;
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 10px 15px;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
      opacity: 0;
      transform: translateY(10px);
      transition: opacity 0.3s ease, transform 0.3s ease;
      z-index: 999;
      max-width: 200px;
      text-align: left;
      font-size: 14px;
      color: #333;
    }

    :host([visible]) {
      opacity: 1;
      transform: translateY(0);
    }
  `;

  render() {
    return html` <div class="teaser-content">${this.message}</div> `;
  }
}

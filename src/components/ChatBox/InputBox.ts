import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

@customElement('input-box')
export class InputBox extends LitElement {
  @property({ type: String }) value = '';
  @property({ type: Boolean }) isLoading = false;

  @state()
  private _internalValue = '';

  static styles = css`
    .input-area {
      display: flex;
      padding: 10px 15px;
      border-top: 1px solid #eee;
      background-color: #fff;
    }

    input {
      flex-grow: 1;
      border: 1px solid #ddd;
      border-radius: 20px;
      padding: 8px 15px;
      font-size: 14px;
      margin-right: 10px;
      outline: none;
    }

    input:focus {
      border-color: var(--chatbot-primary-color, #4caf50);
    }

    button {
      background-color: var(--chatbot-primary-color, #4caf50);
      color: white;
      border: none;
      border-radius: 20px;
      padding: 8px 15px;
      cursor: pointer;
      font-size: 14px;
      transition: background-color 0.3s ease;
    }

    button:disabled {
      background-color: #ccc;
      cursor: not-allowed;
    }
  `;

  // Sync internal state when the public 'value' property changes.
  willUpdate(changedProperties: Map<string, any>) {
    if (changedProperties.has('value')) {
      this._internalValue = this.value;
    }
  }

  render() {
    return html`
      <div class="input-area">
        <input
          type="text"
          .value=${this._internalValue}
          @input=${this._handleInput}
          @keydown=${this._handleKeyDown}
          placeholder="Đặt câu hỏi..."
          ?disabled=${this.isLoading}
        />
        <button @click=${this._handleSubmit} ?disabled=${this.isLoading || !this._internalValue.trim()}>
          ${this.isLoading ? '...' : 'Gửi'}
        </button>
      </div>
    `;
  }

  private _handleInput(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    this._internalValue = inputElement.value;
  }

  private _handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' && !this.isLoading) {
      this._handleSubmit();
    }
  }

  private _handleSubmit() {
    if (!this._internalValue.trim()) return;
    this.dispatchEvent(new CustomEvent('submit', {
      detail: { message: this._internalValue },
      bubbles: true,
      composed: true
    }));
    this._internalValue = ''; // Clear input after sending
  }
}

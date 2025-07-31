import { LitElement } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { loadConfiguration } from '~/logic/utils/config.utils.js';
import { ChatStateController } from '~/logic/hooks/useChatState.js';
import { AutoTeaserController } from '~/logic/hooks/useAutoTeaser.js';
import { styles } from './ChatWidget.styles.js';
import { renderView } from './ChatWidget.view.js';
import { TypingIndicatorController } from '~/logic/hooks/useTypingIndicator.js';

@customElement('chat-widget')
export class ChatWidget extends LitElement {
  static styles = styles;

  // Public properties
  @property({ type: String }) siteId: string = '';
  @property({ type: String }) position: 'left' | 'right' = 'right';
  @property({ type: String }) themeColor: string = '#4caf50';
  @property({ type: String }) title: string = 'Chatbot';
  @property({ type: String }) quickRepliesDefault: string = '';
  @property({ type: String }) typingIndicator!: TypingIndicatorController;

  // Internal reactive states
  @state() private _expanded = false;

  // Controllers
  private chatState: ChatStateController;
  private teaser: AutoTeaserController;

  constructor() {
    super();
    // Controllers are instantiated here.
    this.teaser = new AutoTeaserController(this);
    this.typingIndicator = new TypingIndicatorController(this);
    this.chatState = new ChatStateController(this, this.typingIndicator);
  }

  // --- Public Accessors ---
  get isExpanded() {
    return this._expanded;
  }

  // Properties are guaranteed to be available in connectedCallback.
  connectedCallback(): void {
    super.connectedCallback();
    loadConfiguration(this);
    this.chatState.initialize(this.siteId, this.quickRepliesDefault);
  }

  // --- Event Handlers ---
  
  open = () => {
    this._expanded = true;
    this.teaser.dismiss();
  }

  close = () => {
    this._expanded = false;
  }

  handleQuickReply = (e: CustomEvent) => {
    this.chatState.handleSubmit(e.detail.message);
  }

  handleSubmit = (e: CustomEvent) => {
    this.chatState.handleSubmit(e.detail.message);
  }
  
  retry = () => {
      this.chatState.retry();
  }

  // --- Render ---
  render() {
    return renderView(this, this.chatState, this.teaser);
  }
}

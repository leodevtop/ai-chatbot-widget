import { html } from 'lit';
import type { ChatWidget } from './ChatWidget';
import type { ChatStateController } from '~/logic/hooks/useChatState.js';
import type { AutoTeaserController } from '~/logic/hooks/useAutoTeaser.js';

// Import child components
import '../ChatLauncher.js';
import '../TeaserMessage.js';
import '../ChatBox/ChatBox.js';

export function renderView(
  widget: ChatWidget,
  chatState: ChatStateController,
  teaser: AutoTeaserController
) {
  return html`
    <div class="chat-widget-container">
      ${!widget.isExpanded
        ? html`
            <chat-launcher @open-chat=${widget.open}></chat-launcher>
            ${teaser.teaserVisible ? html`<teaser-message></teaser-message>` : null}
          `
        : html`
            <chat-box
              .title=${widget.title}
              .messages=${chatState.messages}
              .quickReplies=${chatState.quickReplies}
              .errorState=${chatState.errorState}
              .isLoading=${chatState.isLoading}
              .typingIndicator=${chatState.isLoading ? chatState.typingIndicator.typingIndicator : null}
              @minimize=${widget.close}
              @quick-reply=${widget.handleQuickReply}
              @submit=${widget.handleSubmit}
              @retry=${widget.retry}
            ></chat-box>
          `}
    </div>
  `;
}

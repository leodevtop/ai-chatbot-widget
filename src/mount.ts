import './components/ChatWidget/ChatWidget.js';
import { ChatWidget } from './components/ChatWidget/ChatWidget.js';

/**
 * Waits for the 'chat-widget' custom element to be defined, then creates
 * and appends it to the document body. This is the robust way to avoid
 * race conditions where the script tries to use the element before it's ready.
 */
customElements.whenDefined('chat-widget').then(() => {
  const widget = document.createElement('chat-widget') as ChatWidget;
  document.body.appendChild(widget);
  console.log('[ChatWidget] Auto-loaded and mounted after definition.');
});
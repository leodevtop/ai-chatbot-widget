import { css } from 'lit';

// CSS styling for the chatbot UI
export const mystyles = css`
  :host {
    display: block;
    font-size: 13px;
    font-family: sans-serif;
    --chatbot-primary-color: #4caf50; /* Default, overridden by themeColor */
    --chatbot-primary-light-color: rgba(76, 175, 79, 0.7); /* Default, overridden by themeColor */
    --chatbot-text-color: #333;
    --chatbot-bg-color: #f9f9f9;
    --chatbot-border-color: #ddd;
    --chatbot-position: right; /* Default, overridden by position */
  }

  .chat-button {
    position: fixed;
    bottom: 20px;
    z-index: 10000;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background-color: var(--chatbot-primary-color);
    color: white;
    border: none;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    cursor: pointer;
    transition: background-color 0.3s ease, transform 0.3s ease;
  }

  .chat-button.position-left {
    left: 20px;
    right: auto;
  }

  .chat-button.position-right {
    right: 20px;
    left: auto;
  }

  .chat-button:hover {
    background-color: #45a049;
    transform: scale(1.05);
  }

  .container {
    border: 1px solid var(--chatbot-border-color);
    border-radius: 8px;
    width: 350px;
    height: 450px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    background-color: var(--chatbot-bg-color);
    position: fixed;
    bottom: 20px;
    z-index: 9999;
    // transform: translateY(100%); /* Start hidden below the screen */
    // opacity: 0;
    // visibility: hidden;
    transition: transform 0.3s ease-out, opacity 0.3s ease-out, visibility 0.3s ease-out;
  }

  .container.position-left {
    left: 20px;
    right: auto;
  }

  .container.position-right {
    right: 20px;
    left: auto;
  }

  .container.open {
    transform: translateY(0); /* Slide up into view */
    opacity: 1;
    visibility: visible;
  }

  .header {
    background-color: var(--chatbot-primary-color);
    color: white;
    padding: 10px;
    text-align: center;
    font-weight: bold;
  }

  p {
    margin-top: 0;
    margin-bottom: 0.5rem;
  }

  .messages {
    flex-grow: 1;
    padding: 10px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
  }

  .message {
    margin-bottom: 8px;
    padding: 10px;
    border-radius: 10px;
    max-width: 80%;
  }

  .message.user {
    align-self: flex-end;
    background-color: #e0e0e0;
    color: var(--chatbot-text-color);
    border-bottom-right-radius: 2px;
  }

  .message.assistant {
    align-self: flex-start;
    background-color: var(--chatbot-primary-color);
    color: white;
    border-bottom-left-radius: 2px;
    &.typing {
      font-style: italic;
      background-color: var(--chatbot-primary-light-color);
    }

    p:last-child {
      margin-bottom: 0;
    }
  }

  .input-area {
    display: flex;
    padding: 10px;
    border-top: 1px solid var(--chatbot-border-color);
  }

  input {
    flex-grow: 1;
    padding: 8px;
    border: 1px solid var(--chatbot-border-color);
    border-radius: 4px;
    margin-right: 8px;
  }

  button {
    background-color: var(--chatbot-primary-color);
    color: white;
    border: none;
    padding: 8px 15px;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }

  button:hover {
    background-color: #45a049;
  }

  button:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

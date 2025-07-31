import { ReactiveController, ReactiveControllerHost } from 'lit';

export class TypingIndicatorController implements ReactiveController {
  private host: ReactiveControllerHost;
  
  typingIndicator: string | null = null;
  private typingInterval: number | null = null;

  constructor(host: ReactiveControllerHost) {
    (this.host = host).addController(this);
  }

  hostDisconnected() {
    this.stop();
  }

  start() {
    if (this.typingInterval) return;
    
    const dot = '.';
    this.typingIndicator = `Đang gõ ${dot.repeat(3)}`;
    this.host.requestUpdate();

    let index = 0;
    this.typingInterval = window.setInterval(() => {
      index = (index + 1) % 4;
      this.typingIndicator = `Đang gõ ${dot.repeat(index)}`;
      this.host.requestUpdate();
    }, 500);
  }

  stop() {
    if (this.typingInterval) {
      clearInterval(this.typingInterval);
      this.typingInterval = null;
    }
    if (this.typingIndicator) {
        this.typingIndicator = null;
        this.host.requestUpdate();
    }
  }
}

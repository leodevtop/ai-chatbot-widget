import { ReactiveController, ReactiveControllerHost } from 'lit';

export class AutoTeaserController implements ReactiveController {
  private host: ReactiveControllerHost;
  
  teaserVisible = false;
  private teaserTimeout: number | null = null;

  constructor(host: ReactiveControllerHost) {
    (this.host = host).addController(this);
  }

  hostConnected() {
    this.teaserTimeout = window.setTimeout(() => {
      this.teaserVisible = true;
      this.host.requestUpdate();
    }, 3000);
  }

  hostDisconnected() {
    if (this.teaserTimeout) {
      clearTimeout(this.teaserTimeout);
    }
  }
  
  dismiss() {
      if (this.teaserTimeout) {
          clearTimeout(this.teaserTimeout);
          this.teaserTimeout = null;
      }
      if (this.teaserVisible) {
          this.teaserVisible = false;
          this.host.requestUpdate();
      }
  }
}

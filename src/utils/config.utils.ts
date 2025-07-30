// Define a type for the global configuration object
interface ChatboxWidgetConfig {
  position?: 'left' | 'right';
  themeColor?: string;
  title?: string;
}

declare global {
  interface Window {
    ChatboxWidgetConfig?: ChatboxWidgetConfig;
  }
}

const findSelfScript = () => {
  const scripts = document.querySelectorAll('script');
  return Array.from(scripts).find((s) => s.src?.includes('widget') || s.dataset.site);
};

export function loadConfiguration(widget: any) {
  const script = (document.currentScript as HTMLScriptElement | null) || findSelfScript();
  if (!script) {
    console.warn('[ChatbotWidget] Không tìm thấy <script> để đọc config.');
    return;
  }

  const url = new URL(script.src, location.href);
  const urlParams = url.searchParams;

  // Ưu tiên 1: ChatboxWidgetConfig
  const config = window.ChatboxWidgetConfig;
  if (config) {
    if (config.position) widget.position = config.position;
    if (config.themeColor) widget.themeColor = config.themeColor;
    if (config.title) widget.title = config.title;
  }

  // Ưu tiên 2: ?id trên src
  const urlId = urlParams.get('id');
  if (urlId) {
    widget.siteId = urlId;
  }

  // Ưu tiên 3: data-site trên <script>
  const datasetSiteId = script.dataset.site;
  if (!urlId && datasetSiteId) {
    widget.siteId = datasetSiteId;
  }

  // Token (nếu có)
  const datasetToken = script.dataset.token;
  if (datasetToken) {
    widget.siteToken = datasetToken;
  }

  widget.style.setProperty('--chatbot-primary-color', widget.themeColor);
  widget.style.setProperty('--chatbot-primary-light-color', widget.themeColor + 'B3');
  widget.style.setProperty('--chatbot-position', widget.position);
}

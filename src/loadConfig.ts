export interface WidgetConfig {
  siteId?: string;
  siteToken?: string;
  [key: string]: any;
}

function findSelfScriptTag(): HTMLScriptElement | undefined {
  const scripts = document.querySelectorAll('script');

  return Array.from(scripts).find((s) => {
    const src = s.getAttribute('src') || '';
    return src.includes('widget') || s.hasAttribute('data-site');
  }) as HTMLScriptElement | undefined;
}

export function loadConfig(): WidgetConfig {
  const scripts = document.querySelectorAll<HTMLScriptElement>('script');

  const script = Array.from(scripts).find((s) => s.src.includes('widget') || s.dataset.site);
  if (!script) {
    console.warn('[Widget] Cannot locate <script> tag for config.');
    return {};
  }

  const url = new URL(script.src, window.location.href);
  const urlId = url.searchParams.get('id'); // medium precedence
  const datasetSiteId = script.dataset.site; // fallback
  const siteToken = script.dataset.token;

  return {
    siteId: urlId || datasetSiteId,
    siteToken,
    dataset: { ...script.dataset },
  };
}

/**
 * Google Analytics 4。シリーズ共通プロパティ（housing 等と同じ測定ID）。
 */

const MEASUREMENT_ID: string = "G-2J4CRWHPDB";

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

export function initAnalytics(): void {
  if (MEASUREMENT_ID === "" || window.gtag !== undefined) return;

  window.dataLayer = window.dataLayer ?? [];
  window.gtag = function gtag() {
    // gtag は arguments オブジェクトをそのまま積む。配列に包むと計測が落ちる。
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer.push(arguments);
  };
  window.gtag("js", new Date());
  window.gtag("config", MEASUREMENT_ID);

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
  document.head.appendChild(script);
}

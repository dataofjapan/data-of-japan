(() => {
  const config = document.currentScript?.dataset;
  const id = config?.measurementId;
  if (!id || !/^G-[A-Z0-9]+$/.test(id) || config.environment !== 'production') return;
  if (!['data-of-japan.org', 'www.data-of-japan.org'].includes(location.hostname)) return;
  if (window.dataOfJapanAnalytics) return;
  window.dataOfJapanAnalytics = true;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  const gtag = window.gtag;
  gtag('js', new Date());
  let last = snapshot();
  function setPage(state) {
    gtag('set', { page_location: state.location, page_path: state.path, content_group: state.group });
  }
  setPage(last);
  gtag('config', id, {
    send_page_view: false,
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
  });
  const tag = document.createElement('script');
  tag.async = true;
  tag.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
  document.head.appendChild(tag);

  function snapshot() {
    const url = new URL(location.href);
    const query = new URLSearchParams();
    for (const key of ['view', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_id', 'utm_term', 'utm_content']) {
      if (url.searchParams.has(key)) query.set(key, url.searchParams.get(key));
    }
    url.search = query.toString();
    url.hash = '';
    return {
      path: url.pathname,
      view: url.searchParams.get('view') || 'default',
      location: url.href,
      group: url.pathname.split('/')[1] || 'home',
    };
  }
  function send(name, state, referrer) {
    gtag('event', name, {
      send_to: id,
      page_title: document.title,
      page_location: state.location,
      page_path: state.path,
      page_referrer: referrer,
      content_group: state.group,
      ...(name === 'view_change' ? { view_name: state.view } : {}),
    });
  }
  send('page_view', last, document.referrer);
  let timer;
  function schedule() {
    window.clearTimeout(timer);
    timer = window.setTimeout(() => {
      const next = snapshot();
      setPage(next);
      if (next.path !== last.path) send('page_view', next, last.location);
      else if (next.view !== last.view) send('view_change', next, last.location);
      last = next;
    }, 0);
  }
  for (const method of ['pushState', 'replaceState']) {
    const original = history[method];
    history[method] = function (...args) {
      const result = original.apply(this, args);
      schedule();
      return result;
    };
  }
  window.addEventListener('popstate', schedule);
})();

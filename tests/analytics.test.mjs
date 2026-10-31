import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
const source = await readFile(new URL('../public/analytics.js', import.meta.url), 'utf8');
function browser({ url = 'https://data-of-japan.org/politics/elections/shugiin/votes/', environment = 'production', id = 'G-TEST123' } = {}) {
  const scripts = [], listeners = new Map(), timers = new Map(); let sequence = 0;
  const state = {
    URL, URLSearchParams, location: new URL(url),
    document: { currentScript: { dataset: { measurementId: id, environment } }, title: 'Test visualization', referrer: 'https://example.org/', createElement: () => ({}), head: { appendChild: s => scripts.push(s) } },
    history: {}, addEventListener: (name, fn) => listeners.set(name, fn),
    clearTimeout: id => timers.delete(id), setTimeout: fn => { timers.set(++sequence, fn); return sequence; },
  };
  state.window = state;
  for (const name of ['pushState', 'replaceState']) state.history[name] = (_, __, url) => { state.location = new URL(url, state.location); };
  const run = () => runInNewContext(source, state);
  run();
  return { state, scripts, run, listeners, flush: () => { for (const fn of timers.values()) fn(); timers.clear(); }, events: () => (state.dataLayer || []).map(args => Array.from(args)).filter(args => args[0] === 'event') };
}
test('production initializes one tag and one manual pageview, even if loaded twice', () => {
  const b = browser(); b.run();
  assert.equal(b.scripts.length, 1);
  assert.equal(b.events().length, 1);
  assert.equal(b.events()[0][1], 'page_view');
  const config = b.state.dataLayer.find(args => args[0] === 'config')[2];
  assert.equal(config.send_page_view, false);
  assert.equal(config.allow_google_signals, false);
});
test('localhost, preview domains, preview environment and missing IDs send nothing', () => {
  for (const config of [{ url: 'http://localhost:4173/' }, { url: 'https://data-of-japan.vercel.app/' }, { environment: 'preview' }, { id: '' }, { id: 'invalid' }]) {
    const b = browser(config);
    assert.equal(b.events().length, 0); assert.equal(b.scripts.length, 0);
  }
});
test('filters do not inflate pageviews; coalesced view changes generate a separate event', () => {
  const b = browser();
  b.state.history.replaceState(null, '', '?party=ldp&year=2024'); b.flush();
  assert.equal(b.events().length, 1);
  b.state.history.replaceState(null, '', '?view=pref&party=ldp');
  b.state.history.replaceState(null, '', '?view=pref&party=ldp&year=2024'); b.flush();
  assert.equal(b.events().length, 2);
  assert.equal(b.events()[1][1], 'view_change');
  assert.equal(b.events()[1][2].view_name, 'pref');
  assert.equal(b.events()[1][2].page_location, 'https://data-of-japan.org/politics/elections/shugiin/votes/?view=pref');
});
test('path navigation and back navigation send pageviews with content groups', () => {
  const b = browser();
  b.state.history.pushState(null, '', '/society/food/'); b.flush();
  assert.equal(b.events()[1][1], 'page_view');
  assert.equal(b.events()[1][2].content_group, 'society');
  b.state.location = new URL('https://data-of-japan.org/politics/'); b.listeners.get('popstate')(); b.flush();
  assert.equal(b.events()[2][2].content_group, 'politics');
});
test('initial page location keeps campaign attribution but drops arbitrary queries and fragments', () => {
  const b = browser({ url: 'https://data-of-japan.org/society/food/?utm_source=newsletter&email=example&view=era#detail' });
  assert.equal(b.events()[0][2].page_location, 'https://data-of-japan.org/society/food/?view=era&utm_source=newsletter');
});

test('automatic measurement events inherit the sanitized page URL', () => {
  const b = browser({url: 'https://data-of-japan.org/society/food/?email=private'});
  const setting = () => b.state.dataLayer.filter(args => args[0] === 'set').at(-1)[1];
  assert.equal(setting().page_location, 'https://data-of-japan.org/society/food/');
  b.state.history.replaceState(null, '', '?view=era&search=private'); b.flush();
  assert.equal(setting().page_location, 'https://data-of-japan.org/society/food/?view=era');
});

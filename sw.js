'use strict';
const VERSION = '20261027-catalog2';
const BASE = new URL(self.registration.scope);
const PREFIX = 'agenda-anhanguera-' + encodeURIComponent(BASE.pathname) + '-';
const CACHE = PREFIX + VERSION;
const SHELL = [
  'index.html', 'auditoria-materiais.html', 'auditoria-materiais.json', 'theme.css?v=20261027-catalog2', 'ui.js?v=20261027',
  'pwa.js?v=20261027-catalog2', 'manifest.webmanifest', 'icons/icon.svg',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-maskable-512.png',
  'icons/apple-touch-icon.png'
].map(path => new URL(path, BASE).href);
const ASSET_PATHS = new Set(SHELL.map(url => new URL(url).pathname));
const INDEX = new URL('index.html', BASE).href;
const navigationStatus = new Map();
function rememberNavigation(clientId, offline) {
  if (!clientId) return;
  navigationStatus.set(clientId, offline);
  if (navigationStatus.size > 40) navigationStatus.delete(navigationStatus.keys().next().value);
}

self.addEventListener('install', event => {
  // An incomplete download must never replace a working offline version.
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(SHELL)));
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter(name => name.startsWith(PREFIX) && name !== CACHE).map(name => caches.delete(name)));
    await self.clients.claim();
  })());
});

self.addEventListener('message', event => {
  if (event.data?.type === 'ACTIVATE_UPDATE') self.skipWaiting();
  if (event.data?.type === 'GET_OFFLINE_STATUS' && navigationStatus.has(event.source?.id)) {
    event.source.postMessage({ type: 'AGENDA_OFFLINE_STATUS', offline: navigationStatus.get(event.source.id) });
  }
});

async function networkFirst(request, navigation, clientId) {
  const cache = await caches.open(CACHE);
  const path = new URL(request.url).pathname;
  const documentKey = navigation && (path === BASE.pathname || path === new URL(INDEX).pathname) ? INDEX : request;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  try {
    const response = await fetch(request, { signal: controller.signal });
    if (!response.ok) throw new Error('Resource unavailable');
    if (navigation) {
      if (!(response.headers.get('content-type') || '').includes('text/html')) return response;
      await cache.put(documentKey, response.clone());
      rememberNavigation(clientId, false);
    } else {
      await cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const stored = await cache.match(documentKey, { ignoreSearch: true });
    if (stored) {
      if (navigation) rememberNavigation(clientId, true);
      return stored;
    }
    return new Response('Este recurso precisa de conexão. Volte à agenda para consultar os dados disponíveis.', {
      status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    });
  } finally {
    clearTimeout(timeout);
  }
}

self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  // Only this project's static shell is cached. Drive, PDFs, AI and sync stay online.
  if (request.method !== 'GET' || url.origin !== BASE.origin || !url.pathname.startsWith(BASE.pathname)) return;
  if (request.mode === 'navigate') event.respondWith(networkFirst(request, true, event.resultingClientId || event.clientId));
  else if (ASSET_PATHS.has(url.pathname)) event.respondWith(networkFirst(request, false));
});

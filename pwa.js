'use strict';
(() => {
  let deferredPrompt = null;
  let installedInThisVisit = false;
  let prompting = false;
  let registration = null;
  let updateRequested = false;
  let cachedNavigation = false;
  const displayMode = window.matchMedia('(display-mode: standalone)');
  const isInstalled = () => installedInThisVisit || displayMode.matches || navigator.standalone === true;
  const controls = [...document.querySelectorAll('[data-install-app]')];
  const banner = document.getElementById('installBanner');
  const guide = document.getElementById('installDialog');
  const notice = document.getElementById('offlineNotice');
  const updateBanner = document.getElementById('appUpdateBanner');
  let dismissed = false;
  try { dismissed = localStorage.getItem('agenda-anhanguera-install-dismissed') === '1'; } catch {}

  function refreshInstallUI() {
    const installed = isInstalled();
    controls.forEach(control => { control.hidden = installed; control.disabled = prompting; });
    banner.hidden = installed || dismissed;
  }

  function showGuide() {
    const ua = navigator.userAgent;
    const ios = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const android = /Android/i.test(ua);
    const target = ios ? 'iphone' : android ? 'android' : 'desktop';
    document.querySelectorAll('[data-install-guide]').forEach(section => {
      section.hidden = section.dataset.installGuide !== target;
    });
    if (!guide.open) guide.showModal();
    document.body.classList.add('body-lock');
  }

  async function install() {
    if (isInstalled() || prompting) return;
    if (!deferredPrompt) { showGuide(); return; }
    const prompt = deferredPrompt;
    deferredPrompt = null;
    prompting = true;
    refreshInstallUI();
    try {
      await prompt.prompt();
      await prompt.userChoice;
      // Only appinstalled / standalone confirms installation, not a button click.
    } catch {
      showGuide();
    } finally {
      prompting = false;
      refreshInstallUI();
    }
  }

  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    deferredPrompt = event;
    refreshInstallUI();
  });
  window.addEventListener('appinstalled', () => {
    installedInThisVisit = true;
    deferredPrompt = null;
    if (guide.open) guide.close();
    refreshInstallUI();
  });
  displayMode.addEventListener?.('change', refreshInstallUI);
  controls.forEach(control => control.addEventListener('click', install));
  document.getElementById('dismissInstallBanner').addEventListener('click', () => {
    dismissed = true;
    try { localStorage.setItem('agenda-anhanguera-install-dismissed', '1'); } catch {}
    refreshInstallUI();
  });

  const updateConnection = () => { notice.hidden = navigator.onLine && !cachedNavigation; };
  window.addEventListener('online', () => { cachedNavigation = false; updateConnection(); });
  window.addEventListener('offline', updateConnection);
  updateConnection();
  refreshInstallUI();

  if ('serviceWorker' in navigator && window.isSecureContext) {
    navigator.serviceWorker.addEventListener('message', event => {
      if (event.data?.type === 'AGENDA_OFFLINE_STATUS') {
        cachedNavigation = event.data.offline === true;
        updateConnection();
      }
    });
    navigator.serviceWorker.controller?.postMessage({ type: 'GET_OFFLINE_STATUS' });
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (updateRequested) { updateRequested = false; location.reload(); }
      else navigator.serviceWorker.controller?.postMessage({ type: 'GET_OFFLINE_STATUS' });
    });
    document.getElementById('updateAppBtn').addEventListener('click', () => {
      if (!registration?.waiting) return;
      updateRequested = true;
      document.getElementById('updateAppBtn').disabled = true;
      registration.waiting.postMessage({ type: 'ACTIVATE_UPDATE' });
    });
    window.addEventListener('load', async () => {
      try {
        registration = await navigator.serviceWorker.register(new URL('./sw.js', document.baseURI), { updateViaCache: 'none' });
        const offerUpdate = () => {
          if (registration.waiting && navigator.serviceWorker.controller) updateBanner.hidden = false;
        };
        offerUpdate();
        registration.addEventListener('updatefound', () => {
          const worker = registration.installing;
          worker?.addEventListener('statechange', () => { if (worker.state === 'installed') offerUpdate(); });
        });
      } catch (error) {
        console.warn('A agenda está disponível; a cópia para uso offline não pôde ser preparada.', error);
      }
    }, { once: true });
  }
})();

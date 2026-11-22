const offlineStatus = document.querySelector('#offline-status');
const installButton = document.querySelector('#install-app');
let installPrompt;

window.addEventListener('beforeinstallprompt', event => {
  event.preventDefault();
  installPrompt = event;
  installButton.hidden = false;
});
installButton.addEventListener('click', async () => {
  if (!installPrompt) return;
  const prompt = installPrompt;
  installPrompt = null;
  installButton.hidden = true;
  await prompt.prompt();
});
window.addEventListener('appinstalled', () => {
  installPrompt = null;
  installButton.hidden = true;
});

if ('serviceWorker' in navigator && window.isSecureContext) {
  offlineStatus.textContent = 'Preparing offline recipes…';
  navigator.serviceWorker.register('./sw.js').then(async registration => {
    await navigator.serviceWorker.ready;
    offlineStatus.textContent = 'Recipes and PDFs ready offline';
    if (registration.waiting) {
      offlineStatus.textContent = 'Update ready. Close and reopen the cookbook to update.';
    }
    registration.addEventListener('updatefound', () => {
      const worker = registration.installing;
      if (!worker) return;
      worker.addEventListener('statechange', () => {
        if (worker.state === 'installed' && navigator.serviceWorker.controller) {
          offlineStatus.textContent = 'Update ready. Close and reopen the cookbook to update.';
        }
      });
    });
  }).catch(() => {
    offlineStatus.textContent = 'Offline setup incomplete. Reopen while connected to try again.';
  });
}

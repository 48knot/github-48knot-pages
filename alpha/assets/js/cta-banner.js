(function () {
  const banners = document.querySelectorAll('[data-cta-banner]');
  if (!banners.length) {
    return;
  }

  const getStorage = () => {
    try {
      return window.sessionStorage;
    } catch (error) {
      return null;
    }
  };

  const storage = getStorage();

  const hideBanner = (banner) => {
    banner.classList.add('is-hidden');
    banner.setAttribute('aria-hidden', 'true');
    banner.removeAttribute('aria-live');
  };

  banners.forEach((banner, index) => {
    const dismissControl = banner.querySelector('[data-cta-dismiss]');
    if (!dismissControl) {
      return;
    }

    const storageKey = banner.id
      ? `alpha-cta-dismissed:${banner.id}`
      : `alpha-cta-dismissed:index-${index}`;

    if (storage && storage.getItem(storageKey)) {
      hideBanner(banner);
      return;
    }

    dismissControl.addEventListener('click', () => {
      hideBanner(banner);
      if (storage) {
        storage.setItem(storageKey, '1');
      }
    });
  });
})();

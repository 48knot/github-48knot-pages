(function () {
  const NAV_LINKS = [
    { label: "Home", href: "index.html" },
    { label: "Why Alpha", href: "index.html#why-alpha" },
    { label: "Services", href: "service.html" },
    { label: "Alpha’s Choice", href: "choice.html" },
    { label: "About", href: "about.html" },
    { label: "Contact", href: "contact.html" },
    { label: "Our Story", href: "index.html#our-story" }
  ];

  const navContainers = document.querySelectorAll('[data-nav="primary"]');
  if (!navContainers.length) {
    return;
  }

  const normalizePage = (path) => {
    if (!path) {
      return "index.html";
    }
    if (!path.includes(".")) {
      return "index.html";
    }
    return path;
  };

  const getCurrentPage = () => {
    const segments = window.location.pathname.split("/").filter(Boolean);
    const lastSegment = segments[segments.length - 1] || "";
    return normalizePage(lastSegment);
  };

  const getCurrentHash = () => window.location.hash.replace(/^#/, "");

  const navAnchors = [];

  navContainers.forEach((container) => {
    const linkClass = container.dataset.navLinkClass || "";
    const activeClass = container.dataset.navActiveClass || "";
    const activeClasses = activeClass.split(" ").filter(Boolean);

    NAV_LINKS.forEach((link) => {
      const anchor = document.createElement("a");
      anchor.textContent = link.label;
      anchor.href = link.href;
      if (linkClass) {
        anchor.className = linkClass;
      }
      navAnchors.push({ anchor, activeClasses });
      container.appendChild(anchor);
    });
  });

  const shouldActivate = (href, currentPage, currentHash) => {
    const [targetPathRaw, targetHash = ""] = href.split("#");
    const targetPath = normalizePage(targetPathRaw);
    if (targetPath !== currentPage) {
      return false;
    }
    if (!targetHash) {
      return currentHash === "";
    }
    return currentHash === targetHash;
  };

  const refreshActiveStates = () => {
    const page = getCurrentPage();
    const hash = getCurrentHash();

    navAnchors.forEach(({ anchor, activeClasses }) => {
      const isActive = shouldActivate(anchor.getAttribute("href"), page, hash);
      if (isActive) {
        anchor.setAttribute("aria-current", "page");
        activeClasses.forEach((cls) => anchor.classList.add(cls));
      } else {
        anchor.removeAttribute("aria-current");
        activeClasses.forEach((cls) => anchor.classList.remove(cls));
      }
    });
  };

  refreshActiveStates();
  window.addEventListener("hashchange", refreshActiveStates);
  window.addEventListener("popstate", refreshActiveStates);
})();

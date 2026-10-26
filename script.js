/* =========================================
   YOURFOLIO STUDIO — INTERACTIONS
========================================= */

// MOBILE NAVIGATION

const menuButton = document.querySelector(".menu-toggle");
const navMenu = document.querySelector(".nav-menu");
const navLinks = document.querySelectorAll(".nav-link, .nav-book");

function closeMenu() {
  if (!menuButton || !navMenu) return;

  navMenu.classList.remove("open");
  menuButton.classList.remove("active");
  menuButton.setAttribute("aria-expanded", "false");
  menuButton.setAttribute("aria-label", "Open navigation menu");
}

if (menuButton && navMenu) {
  menuButton.addEventListener("click", function () {
    const isOpen = navMenu.classList.toggle("open");

    menuButton.classList.toggle("active", isOpen);
    menuButton.setAttribute("aria-expanded", String(isOpen));
    menuButton.setAttribute(
      "aria-label",
      isOpen ? "Close navigation menu" : "Open navigation menu",
    );
  });

  navLinks.forEach(function (link) {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      closeMenu();
    }
  });

  window.addEventListener("resize", function () {
    if (window.innerWidth > 760) {
      closeMenu();
    }
  });
}

// SCROLL-REVEAL ANIMATION

const revealElements = document.querySelectorAll(".reveal");

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

if ("IntersectionObserver" in window && !reduceMotion.matches) {
  const revealObserver = new IntersectionObserver(
    function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: "0px 0px -35px 0px",
    },
  );

  revealElements.forEach(function (element) {
    revealObserver.observe(element);
  });
} else {
  // Keep content visible on older browsers or reduced-motion devices.
  revealElements.forEach(function (element) {
    element.classList.add("is-visible");
  });
}

// HERO CTA FEEDBACK

const heroCTA = document.querySelector(".hero-cta");

if (heroCTA) {
  heroCTA.addEventListener("click", function () {
    heroCTA.classList.add("cta-clicked");

    window.setTimeout(function () {
      heroCTA.classList.remove("cta-clicked");
    }, 350);
  });
}

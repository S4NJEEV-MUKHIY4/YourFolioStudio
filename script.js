// YOURFOLIO STUDIO — simple site interactions
(function () {
  const menuButton = document.querySelector('.menu-toggle');
  const navMenu = document.querySelector('.nav-menu');
  const navLinks = document.querySelectorAll('.nav-link, .nav-book');

  function closeMenu() {
    if (!menuButton || !navMenu) return;
    navMenu.classList.remove('open');
    menuButton.classList.remove('active');
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Open navigation menu');
  }

  if (menuButton && navMenu) {
    menuButton.addEventListener('click', function () {
      const open = navMenu.classList.toggle('open');
      menuButton.classList.toggle('active', open);
      menuButton.setAttribute('aria-expanded', String(open));
      menuButton.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
    });
    navLinks.forEach(function (link) { link.addEventListener('click', closeMenu); });
    document.addEventListener('keydown', function (event) { if (event.key === 'Escape') closeMenu(); });
    document.addEventListener('click', function (event) {
      if (!navMenu.contains(event.target) && !menuButton.contains(event.target)) closeMenu();
    });
    window.addEventListener('resize', function () { if (window.innerWidth > 760) closeMenu(); });
  }

  // Reveal items once as they scroll into view.
  const revealElements = document.querySelectorAll('.reveal');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if ('IntersectionObserver' in window && !reduceMotion.matches) {
    const revealObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -25px 0px' });
    revealElements.forEach(function (element) { revealObserver.observe(element); });
  } else {
    revealElements.forEach(function (element) { element.classList.add('is-visible'); });
  }

  const year = document.querySelector('#year');
  if (year) year.textContent = new Date().getFullYear();

  // Fill the requested portfolio type when a service card is clicked.
  const typeField = document.querySelector('#portfolioType');
  if (typeField) {
    const params = new URLSearchParams(window.location.search);
    const requestedType = params.get('type');
    if (requestedType) {
      const option = Array.from(typeField.options).find(function (item) { return item.value === requestedType; });
      if (option) typeField.value = requestedType;
    }
  }

  // A friendly confirmation before the external form service sends the booking.
  const bookingForm = document.querySelector('#bookingForm');
  if (bookingForm) {
    bookingForm.addEventListener('submit', function (event) {
      if (!bookingForm.checkValidity()) {
        event.preventDefault();
        bookingForm.reportValidity();
        return;
      }
      const note = document.querySelector('#formNote');
      if (note) {
        note.textContent = 'Your details are being submitted. Please wait for the confirmation page.';
        note.classList.add('show');
      }
    });
  }
})();

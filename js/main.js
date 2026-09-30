/**
 * Stackly Logistics & Transportation - Main Core Scripts
 * Handles Loader, Navigation, Global 404 Action Redirection, Time-Aware Greetings, Go Back Functionality
 */

document.addEventListener('DOMContentLoaded', () => {
  initLoader();
  initStickyNavbar();
  initMobileDrawer();
  initActiveNavHighlight();
  initGoBackButton();
  initGlobalActionButtons();
  initGreetings();
  initContactForm();
});

/* ==========================================================================
   1. FULL VIEWPORT PURE CSS/JS LOADER
   ========================================================================== */
function initLoader() {
  const loader = document.getElementById('site-loader');
  if (!loader) return;

  const dismissLoader = () => {
    loader.classList.add('loader-hidden');
    setTimeout(() => {
      if (loader.parentNode) loader.parentNode.removeChild(loader);
    }, 500);
  };

  // Immediate dismiss on load with fallback timeout
  window.addEventListener('load', dismissLoader);
  setTimeout(dismissLoader, 1200); // Fail-safe
}

/* ==========================================================================
   2. STICKY NAVBAR WITH SCROLL SHADOW
   ========================================================================== */
function initStickyNavbar() {
  const header = document.querySelector('.site-header');
  if (!header) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 25) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }, { passive: true });
}

/* ==========================================================================
   3. MOBILE NAVIGATION DRAWER
   ========================================================================== */
function initMobileDrawer() {
  const hamburger = document.querySelector('.hamburger-btn');
  const drawer = document.querySelector('.mobile-drawer');
  const overlay = document.querySelector('.mobile-nav-overlay');
  const closeBtn = document.querySelector('.drawer-close-btn');

  if (!hamburger || !drawer || !overlay) return;

  const openDrawer = () => {
    drawer.classList.add('open');
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  };

  const closeDrawer = () => {
    drawer.classList.remove('open');
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  };

  hamburger.addEventListener('click', openDrawer);
  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
  overlay.addEventListener('click', closeDrawer);
}

/* ==========================================================================
   4. ACTIVE NAV HIGHLIGHT
   ========================================================================== */
function initActiveNavHighlight() {
  const currentPath = window.location.pathname.toLowerCase();
  const navLinks = document.querySelectorAll('.nav-link, .dropdown-item, .mobile-link');

  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;
    const cleanHref = href.toLowerCase().split('/').pop();
    const cleanPath = currentPath.split('/').pop() || 'index.html';

    if (cleanHref === cleanPath || (cleanPath === '' && cleanHref === 'index.html')) {
      link.classList.add('active');
    }
  });
}

/* ==========================================================================
   5. GO BACK BUTTON WITH ROBUST FUNCTIONALITY
   ========================================================================== */
function initGoBackButton() {
  const backButtons = document.querySelectorAll('.btn-back, [data-action="go-back"]');
  const isInPagesDir = window.location.pathname.includes('/pages/');
  const defaultFallback = isInPagesDir ? '../index.html' : 'index.html';

  backButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      // Check if browser history has previous page within same origin
      if (window.history.length > 1 && document.referrer && document.referrer.includes(window.location.host)) {
        window.history.back();
      } else {
        window.location.href = defaultFallback;
      }
    });
  });
}

/* ==========================================================================
   6. GLOBAL 404 REDIRECTION FOR ACTION BUTTONS & NON-QUICK LINKS
   Requirement: "Make sure every action button redirects to 404 page in website."
   "Make sure every link redirects to 404 page except quick links."
   ========================================================================== */
function initGlobalActionButtons() {
  const isInPagesDir = window.location.pathname.includes('/pages/');
  const notFoundUrl = isInPagesDir ? '../404.html' : '404.html';
  const isContactPage = window.location.pathname.includes('contact.html');

  // Allowed quick links for legitimate site navigation
  const allowedHrefs = [
    '/', 'index.html', './index.html', '../index.html',
    'pages/about.html', 'about.html', './about.html', '../pages/about.html',
    'pages/services.html', 'services.html', './services.html', '../pages/services.html',
    'pages/pricing.html', 'pricing.html', './pricing.html', '../pages/pricing.html',
    'pages/tracking.html', 'tracking.html', './tracking.html', '../pages/tracking.html',
    'pages/contact.html', 'contact.html', './contact.html', '../pages/contact.html',
    'pages/sign-in.html', 'sign-in.html', './sign-in.html', '../pages/sign-in.html',
    'pages/sign-up.html', 'sign-up.html', './sign-up.html', '../pages/sign-up.html',
    'pages/dashboard.html', 'dashboard.html', './dashboard.html', '../pages/dashboard.html',
    'customer-dashboard.html', 'pages/customer-dashboard.html',
    'admin-dashboard.html', 'pages/admin-dashboard.html',
    '404.html', '../404.html', '#', 'javascript:void(0);'
  ];

  document.addEventListener('click', (e) => {
    const targetBtn = e.target.closest('button, .btn, a, .btn-back');
    if (!targetBtn) return;

    // Do NOT intercept the Go Back button
    if (targetBtn.classList.contains('btn-back') || targetBtn.getAttribute('data-action') === 'go-back') {
      return;
    }

    // Do NOT redirect authentication / UI controls
    if (targetBtn.classList.contains('role-pill-btn') || 
        targetBtn.classList.contains('tracker-tab-btn') || 
        targetBtn.classList.contains('password-toggle-btn') ||
        targetBtn.classList.contains('drawer-close-btn') ||
        targetBtn.classList.contains('hamburger-btn') ||
        targetBtn.id === 'logout-btn' ||
        targetBtn.classList.contains('dashboard-nav-item') ||
        targetBtn.classList.contains('admin-toggle-status')) {
      return;
    }

    // Do NOT redirect form submit buttons inside active non-contact forms
    if (targetBtn.type === 'submit' && (
      targetBtn.closest('#signin-form') || 
      targetBtn.closest('#signup-form') || 
      targetBtn.closest('#tracking-search-form') ||
      targetBtn.closest('#customer-ticket-form')
    )) {
      return;
    }

    // Transmit button on contact page has its own dedicated sequence in initContactForm()
    if (targetBtn.id === 'contact-submit-btn' || 
       (targetBtn.type === 'submit' && targetBtn.closest('#contact-form'))) {
      return;
    }

    // SPECIAL REQUIREMENT: In contact page every action button should redirect to 404 page.
    if (isContactPage) {
      if (targetBtn.classList.contains('btn') || targetBtn.tagName.toLowerCase() === 'button') {
        e.preventDefault();
        window.location.href = notFoundUrl;
        return;
      }
    }

    // SPECIAL REQUIREMENT: In footer section other than quick links every action button should get redirected to the 404 page.
    const inFooter = targetBtn.closest('.site-footer');
    if (inFooter) {
      const inQuickLinks = targetBtn.closest('.footer-col-quicklinks');
      if (!inQuickLinks) {
        e.preventDefault();
        window.location.href = notFoundUrl;
        return;
      }
    }

    // If it's explicitly marked as action-404, redirect
    if (targetBtn.classList.contains('btn-action-404') || targetBtn.getAttribute('data-action') === '404') {
      e.preventDefault();
      window.location.href = notFoundUrl;
      return;
    }

    // If it's a link (<a> tag)
    if (targetBtn.tagName.toLowerCase() === 'a') {
      const rawHref = targetBtn.getAttribute('href');
      if (!rawHref) return;

      const href = rawHref.trim();

      // Check if it's telephone or email link
      if (href.startsWith('tel:') || href.startsWith('mailto:')) {
        if (inFooter || isContactPage) {
          e.preventDefault();
          window.location.href = notFoundUrl;
          return;
        }
        return;
      }

      const isAllowed = allowedHrefs.some(allowed => href === allowed || href.endsWith(allowed));
      
      // If it's not in allowed quick links (e.g. social icons, external, terms, etc.), redirect to 404
      if (!isAllowed) {
        e.preventDefault();
        window.location.href = notFoundUrl;
      }
    } else if (targetBtn.tagName.toLowerCase() === 'button') {
      // General action buttons without internal handlers
      if (targetBtn.classList.contains('btn') && !targetBtn.getAttribute('data-keep')) {
        e.preventDefault();
        window.location.href = notFoundUrl;
      }
    }
  });
}

/* ==========================================================================
   7. TIME-AWARE DYNAMIC GREETINGS
   ========================================================================== */
function getTimeBasedGreeting() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) {
    return 'Good morning';
  } else if (hour >= 12 && hour < 17) {
    return 'Good afternoon';
  } else if (hour >= 17 && hour < 21) {
    return 'Good evening';
  } else {
    return 'Good night';
  }
}

function initGreetings() {
  const greetingElements = document.querySelectorAll('.dynamic-greeting');
  const greeting = getTimeBasedGreeting();
  greetingElements.forEach(el => {
    const customUser = el.getAttribute('data-user-prefix') || '';
    el.textContent = `${greeting}${customUser}`;
  });
}

/* ==========================================================================
   8. CONTACT FORM VALIDATION & CHARACTER COUNTER
   ========================================================================== */
function initContactForm() {
  const contactForm = document.getElementById('contact-form');
  if (!contactForm) return;

  const msgInput = document.getElementById('contact-message');
  const counter = document.getElementById('char-count');

  if (msgInput && counter) {
    msgInput.addEventListener('input', () => {
      counter.textContent = msgInput.value.length;
    });
  }

  // Real-time validation listeners
  const fields = [
    { id: 'contact-name', test: val => val.trim().length >= 2, errorMsg: 'Please enter your full name (minimum 2 characters).' },
    { id: 'contact-email', test: val => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val), errorMsg: 'Please enter a valid business email address.' },
    { id: 'contact-phone', test: val => /^[0-9+\s\-]{8,15}$/.test(val), errorMsg: 'Please enter a valid phone number.' },
    { id: 'contact-subject', test: val => val.trim().length >= 3, errorMsg: 'Please provide an inquiry subject.' },
    { id: 'contact-message', test: val => val.trim().length >= 10, errorMsg: 'Please write a message with at least 10 characters.' }
  ];

  fields.forEach(f => {
    const input = document.getElementById(f.id);
    const errEl = document.getElementById(`${f.id}-error`);
    if (!input) return;

    input.addEventListener('input', () => {
      input.classList.remove('is-invalid');
      if (errEl) errEl.classList.remove('show');
    });

    input.addEventListener('blur', () => {
      if (input.value.trim() && !f.test(input.value)) {
        input.classList.add('is-invalid');
        if (errEl) {
          errEl.textContent = f.errorMsg;
          errEl.classList.add('show');
        }
      }
    });
  });

  // Handler for clicking "Transmit message to salem hub" button
  function handleTransmitMessage(e) {
    if (e) e.preventDefault();

    // 1. Reset the form
    contactForm.reset();
    if (counter) counter.textContent = '0';
    fields.forEach(f => {
      const input = document.getElementById(f.id);
      const errEl = document.getElementById(`${f.id}-error`);
      if (input) input.classList.remove('is-invalid');
      if (errEl) {
        errEl.textContent = '';
        errEl.classList.remove('show');
      }
    });

    // 2. Display success message
    const successMsg = document.getElementById('contact-success-alert');
    if (successMsg) {
      successMsg.style.display = 'block';
      successMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    // 3. Within a second redirect to 404 page
    setTimeout(() => {
      const isInPagesDir = window.location.pathname.includes('/pages/');
      window.location.href = isInPagesDir ? '../404.html' : '404.html';
    }, 850);
  }

  contactForm.addEventListener('submit', handleTransmitMessage);

  const transmitBtn = document.getElementById('contact-submit-btn') || 
                      contactForm.querySelector('button[type="submit"]');
  if (transmitBtn) {
    transmitBtn.addEventListener('click', handleTransmitMessage);
  }
}

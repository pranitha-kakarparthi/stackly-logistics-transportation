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
  initQuickTrackerTabs();
  initDashboardControls();
  initScrollAnimations();
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

  if (hamburger && drawer && overlay) {
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

  // Requirement 5: Mobile Services accordion dropdown menu
  const dropdownBtns = document.querySelectorAll('.mobile-dropdown-btn');
  dropdownBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const parent = btn.closest('.mobile-dropdown');
      if (!parent) return;
      const isOpen = parent.classList.toggle('open');
      btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  });
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
        targetBtn.classList.contains('mobile-dropdown-btn') ||
        targetBtn.closest('.mobile-dropdown-btn') ||
        targetBtn.classList.contains('sidebar-collapse-btn') ||
        targetBtn.id === 'sidebar-collapse-btn' ||
        targetBtn.classList.contains('mobile-sidebar-toggle-btn') ||
        targetBtn.id === 'mobile-sidebar-toggle-btn' ||
        targetBtn.classList.contains('back-to-home-btn') ||
        targetBtn.classList.contains('back-to-home-link') ||
        targetBtn.id === 'logout-btn' ||
        targetBtn.classList.contains('dashboard-nav-item') ||
        targetBtn.classList.contains('admin-toggle-status')) {
      return;
    }

    // Do NOT redirect form submit buttons inside active working forms
    if (targetBtn.type === 'submit' && (
      targetBtn.closest('#signin-form') || 
      targetBtn.closest('#signup-form') || 
      targetBtn.closest('#tracking-search-form') ||
      targetBtn.closest('#customer-ticket-form') ||
      targetBtn.closest('.tracker-form')
    )) {
      return;
    }

    // Transmit button on contact page has its own dedicated sequence in initContactForm()
    if (targetBtn.id === 'contact-submit-btn' || 
       (targetBtn.type === 'submit' && targetBtn.closest('#contact-form'))) {
      return;
    }

    // Customer waybill lookup button in dashboard has dedicated handler
    if (targetBtn.id === 'cust-waybill-btn') {
      return;
    }

    // SPECIAL REQUIREMENT 3: "In footer section redirect the contact information to 404 page."
    if (targetBtn.closest('.footer-contact-item') || targetBtn.classList.contains('footer-contact-link')) {
      e.preventDefault();
      window.location.href = notFoundUrl;
      return;
    }

    // SPECIAL REQUIREMENT: "In every page redirect every action button to 404 page."
    if (targetBtn.classList.contains('btn') || targetBtn.tagName.toLowerCase() === 'button') {
      // Allow top-level site navigation actions in header (Sign In / Sign Up)
      if (targetBtn.closest('.nav-actions') || targetBtn.closest('.mobile-drawer')) {
        return;
      }

      e.preventDefault();
      window.location.href = notFoundUrl;
      return;
    }

    // SPECIAL REQUIREMENT: In footer section other than quick links every action button/link should get redirected to the 404 page.
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

/* ==========================================================================
   9. QUICK WAYBILL TRACKING TABS CLICK ACTION (HOME PAGE)
   Requirement: "In Home page 'Quick Waybill Tracking' section add click action to 'Road Freight', 'Customs Bill'."
   ========================================================================== */
function initQuickTrackerTabs() {
  const tabs = document.querySelectorAll('.tracker-tab-btn');
  if (!tabs.length) return;

  const labelEl = document.getElementById('hero-tracker-label');
  const inputEl = document.getElementById('hero-tracker-input');
  const demoCodeEl = document.getElementById('hero-tracker-demo-code');
  const demoRouteEl = document.getElementById('hero-tracker-demo-route');

  const configs = {
    'air-ocean': {
      label: 'Air Waybill (AWB) / Ocean Container Number',
      placeholder: 'e.g. STK-88219',
      value: '',
      demoCode: '#STK-88219',
      demoRoute: '(Frankfurt → Salem Hub)'
    },
    'road-freight': {
      label: 'Road Haulage Consignment / E-Way Bill Number',
      placeholder: 'e.g. RDF-99412 or TN-30-HAUL',
      value: '',
      demoCode: '#RDF-99412',
      demoRoute: '(Salem Central Hub → Bangalore Tech Park)'
    },
    'customs-bill': {
      label: 'Customs Bill of Entry (BOE) / IGM Filing Reference',
      placeholder: 'e.g. CBE-55210 or INMAA-1092',
      value: '',
      demoCode: '#CBE-55210',
      demoRoute: '(Chennai Port Maritime Customs Desk)'
    }
  };

  tabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      e.preventDefault();
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const text = tab.textContent.trim().toLowerCase();
      let mode = tab.getAttribute('data-mode');
      if (!mode) {
        if (text.includes('road')) mode = 'road-freight';
        else if (text.includes('customs')) mode = 'customs-bill';
        else mode = 'air-ocean';
      }

      const cfg = configs[mode] || configs['air-ocean'];
      if (labelEl) labelEl.textContent = cfg.label;
      if (inputEl) {
        inputEl.placeholder = cfg.placeholder;
        // REQUIREMENT: Make "Road Freight", "Customs Bill" search box empty by default
        inputEl.value = '';
        inputEl.focus();
      }
      if (demoCodeEl) demoCodeEl.textContent = cfg.demoCode;
      if (demoRouteEl) demoRouteEl.textContent = cfg.demoRoute;
    });
  });
}

/* ==========================================================================
   11. DASHBOARD COLLAPSIBLE SIDEBAR & RESPONSIVE DRAWER CONTROLS
   ========================================================================== */
function initDashboardControls() {
  const layout = document.getElementById('dashboard-layout') || document.querySelector('.dashboard-layout');
  const collapseBtn = document.getElementById('sidebar-collapse-btn');
  const mobileToggleBtn = document.getElementById('mobile-sidebar-toggle-btn');
  const overlay = document.getElementById('dashboard-overlay');
  const sidebar = document.getElementById('dashboard-sidebar') || document.querySelector('.dashboard-sidebar');

  if (!layout) return;

  const toggleCollapse = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const isCollapsed = layout.classList.toggle('sidebar-collapsed');
    if (collapseBtn) {
      collapseBtn.setAttribute('title', isCollapsed ? 'Expand sidebar' : 'Collapse sidebar');
      collapseBtn.setAttribute('aria-expanded', isCollapsed ? 'false' : 'true');
    }
    try {
      localStorage.setItem('stackly_sidebar_collapsed', isCollapsed ? 'true' : 'false');
    } catch (err) {}
  };

  // 1. Collapse button inside sidebar
  if (collapseBtn) {
    collapseBtn.addEventListener('click', toggleCollapse);

    // Restore preference on desktop
    try {
      if (window.innerWidth > 1024 && localStorage.getItem('stackly_sidebar_collapsed') === 'true') {
        layout.classList.add('sidebar-collapsed');
      }
    } catch (err) {}
  }

  // 2. Header toggle button (handles desktop collapse & mobile offcanvas)
  if (mobileToggleBtn) {
    mobileToggleBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (window.innerWidth > 1024) {
        toggleCollapse();
      } else {
        layout.classList.toggle('sidebar-open');
      }
    });
  }

  // 3. Close on overlay click
  if (overlay) {
    overlay.addEventListener('click', () => {
      layout.classList.remove('sidebar-open');
    });
  }

  // 4. Auto-close sidebar on mobile when nav link is clicked
  if (sidebar) {
    const navItems = sidebar.querySelectorAll('.dashboard-nav-item');
    navItems.forEach(item => {
      item.addEventListener('click', () => {
        if (window.innerWidth <= 1024) {
          layout.classList.remove('sidebar-open');
        }
      });
    });
  }
}

/* ==========================================================================
   12. INTERSECTION OBSERVER SCROLL ANIMATIONS
   ========================================================================== */
function initScrollAnimations() {
  const targets = document.querySelectorAll(
    '.reveal-on-scroll, .feature-card, .service-card, .stat-card, .pricing-card, .kpi-card, .dash-card, .timeline-event-item'
  );

  if (!targets.length) return;

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          obs.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: '0px 0px -40px 0px',
      threshold: 0.1
    });

    targets.forEach(target => {
      if (!target.classList.contains('reveal-on-scroll')) {
        target.classList.add('reveal-on-scroll');
      }
      observer.observe(target);
    });
  } else {
    targets.forEach(target => target.classList.add('in-view'));
  }
}


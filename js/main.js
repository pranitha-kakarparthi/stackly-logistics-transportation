/**
 * Stackly Logistics & Transportation - Main Core Scripts
 * Handles Loader, Navigation, Global 404 Action Redirection, Time-Aware Greetings, Go Back Functionality
 */

document.addEventListener('DOMContentLoaded', () => {
  initLoader();
  initStickyNavbar();
  initMobileDrawer();
  initDesktopDropdown();
  initActiveNavHighlight();
  initGoBackButton();
  initGlobalActionButtons();
  initGreetings();
  initContactForm();
  initQuickTrackerTabs();
  initTrackingLocateForms();
  initDashboardControls();
  initScrollAnimations();
  initServicesPage();
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

  // Mobile sublinks anchor handling and drawer auto-close
  const mobileSublinks = document.querySelectorAll('.mobile-sublink');
  mobileSublinks.forEach(link => {
    link.addEventListener('click', (e) => {
      if (drawer) drawer.classList.remove('open');
      if (overlay) overlay.classList.remove('open');
      document.body.style.overflow = '';

      const href = link.getAttribute('href');
      if (href && href.includes('#')) {
        const isServicesPage = window.location.pathname.includes('services.html');
        if (isServicesPage) {
          const hash = href.split('#')[1];
          if (hash && document.getElementById(hash)) {
            e.preventDefault();
            if (typeof scrollToAnchor === 'function') {
              scrollToAnchor(hash, true);
            }
          }
        }
      }
    });
  });
}

/* ==========================================================================
   3B. DESKTOP SERVICES DROPDOWN MENU
   Requirement: "When clicked on services the drop down menu for services is missing make sure the options are visible all the time through drop down menu."
   ========================================================================== */
function initDesktopDropdown() {
  const dropdowns = document.querySelectorAll('.nav-dropdown');
  dropdowns.forEach(dd => {
    const toggleLink = dd.querySelector('.nav-link, .dropdown-toggle');
    if (toggleLink) {
      toggleLink.addEventListener('click', (e) => {
        const wasOpen = dd.classList.contains('open');
        if (!wasOpen) {
          e.preventDefault();
          e.stopPropagation();
          
          // Close other dropdowns if any exist
          dropdowns.forEach(other => {
            if (other !== dd) {
              other.classList.remove('open');
              const otherToggle = other.querySelector('.nav-link, .dropdown-toggle');
              if (otherToggle) otherToggle.setAttribute('aria-expanded', 'false');
            }
          });

          dd.classList.add('open');
          toggleLink.setAttribute('aria-expanded', 'true');
        } else {
          // If already open, clicking takes you directly to the services page
          const targetUrl = toggleLink.getAttribute('href');
          if (targetUrl && targetUrl !== '#' && !targetUrl.startsWith('javascript:')) {
            window.location.href = targetUrl;
          }
        }
      });
    }

    // Close dropdown when a dropdown item is clicked and handle same-page anchor smoothly
    const items = dd.querySelectorAll('.dropdown-item');
    items.forEach(item => {
      item.addEventListener('click', (e) => {
        dd.classList.remove('open');
        if (toggleLink) toggleLink.setAttribute('aria-expanded', 'false');

        const href = item.getAttribute('href');
        if (href && href.includes('#')) {
          const isServicesPage = window.location.pathname.includes('services.html');
          if (isServicesPage) {
            const hash = href.split('#')[1];
            if (hash && document.getElementById(hash)) {
              e.preventDefault();
              if (typeof scrollToAnchor === 'function') {
                scrollToAnchor(hash, true);
              }
            }
          }
        }
      });
    });
  });

  // Close dropdown on outside click
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.nav-dropdown')) {
      dropdowns.forEach(dd => {
        dd.classList.remove('open');
        const toggleLink = dd.querySelector('.nav-link, .dropdown-toggle');
        if (toggleLink) toggleLink.setAttribute('aria-expanded', 'false');
      });
    }
  });
}

/* ==========================================================================
   4. ACTIVE NAV HIGHLIGHT
   ========================================================================== */
function initActiveNavHighlight() {
  const currentPath = window.location.pathname.toLowerCase();
  const cleanPath = currentPath.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.nav-link, .dropdown-item, .mobile-link, .mobile-sublink');

  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;
    const cleanHref = href.toLowerCase().split('/').pop().split('#')[0];

    if (cleanHref === cleanPath || (cleanPath === '' && cleanHref === 'index.html')) {
      link.classList.add('active');
    }
  });

  const isServicesSection = [
    'services.html', 'air-freight.html', 'ocean-freight.html', 
    'road-transport.html', 'warehousing-cold-chain.html'
  ].some(page => cleanPath === page);

  if (isServicesSection) {
    document.querySelectorAll('.dropdown-toggle, .mobile-dropdown-btn').forEach(btn => {
      btn.classList.add('active');
    });
  }
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
    'pages/air-freight.html', 'air-freight.html', './air-freight.html', '../pages/air-freight.html',
    'pages/ocean-freight.html', 'ocean-freight.html', './ocean-freight.html', '../pages/ocean-freight.html',
    'pages/road-transport.html', 'road-transport.html', './road-transport.html', '../pages/road-transport.html',
    'pages/warehousing-cold-chain.html', 'warehousing-cold-chain.html', './warehousing-cold-chain.html', '../pages/warehousing-cold-chain.html',
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
        targetBtn.classList.contains('dropdown-toggle') ||
        targetBtn.classList.contains('dropdown-item') ||
        targetBtn.closest('.nav-dropdown') ||
        targetBtn.classList.contains('mobile-dropdown-btn') ||
        targetBtn.closest('.mobile-dropdown') ||
        targetBtn.closest('.mobile-dropdown-btn') ||
        targetBtn.classList.contains('sidebar-collapse-btn') ||
        targetBtn.id === 'sidebar-collapse-btn' ||
        targetBtn.classList.contains('mobile-sidebar-toggle-btn') ||
        targetBtn.id === 'mobile-sidebar-toggle-btn' ||
        targetBtn.classList.contains('back-to-home-btn') ||
        targetBtn.classList.contains('back-to-home-link') ||
        targetBtn.id === 'logout-btn' ||
        targetBtn.classList.contains('dashboard-nav-item') ||
        targetBtn.classList.contains('admin-toggle-status') ||
        targetBtn.classList.contains('service-filter-btn') ||
        targetBtn.classList.contains('specs-modal-btn') ||
        targetBtn.classList.contains('specs-modal-close') ||
        targetBtn.closest('.specs-modal-close') ||
        targetBtn.classList.contains('calc-jump-btn') ||
        targetBtn.id === 'modal-calc-btn' ||
        targetBtn.classList.contains('calc-btn') ||
        targetBtn.id === 'calc-submit-btn' ||
        targetBtn.classList.contains('faq-accordion-header') ||
        targetBtn.closest('.faq-accordion-header') ||
        targetBtn.closest('#freight-calc-form') ||
        targetBtn.closest('#services-specs-modal')) {
      return;
    }

    // Do NOT redirect form submit buttons inside active working forms
    if (targetBtn.type === 'submit' && (
      targetBtn.closest('#signin-form') || 
      targetBtn.closest('#signup-form') || 
      targetBtn.closest('#tracking-search-form') ||
      targetBtn.closest('#hero-tracker-form') ||
      targetBtn.closest('#customer-ticket-form') ||
      targetBtn.closest('#freight-calc-form') ||
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

    // In-page hash anchors (e.g. href="#air-freight" or href="#rate-calculator") should scroll, not redirect
    const rawHref = targetBtn.getAttribute('href');
    if (rawHref && rawHref.trim().startsWith('#')) {
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

      // Do not block dropdown items or mobile sublinks
      if (targetBtn.classList.contains('dropdown-item') ||
          targetBtn.classList.contains('mobile-sublink') ||
          targetBtn.closest('.dropdown-menu') ||
          targetBtn.closest('.mobile-dropdown-menu')) {
        return;
      }

      // Strip query parameters and hash anchors before matching against allowed quick links
      const baseHref = href.split('#')[0].split('?')[0];

      const isAllowed = allowedHrefs.some(allowed => 
        href === allowed || 
        href.endsWith(allowed) || 
        baseHref === allowed || 
        baseHref.endsWith(allowed)
      );
      
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

    // 0. Strict Form Validation
    let isValid = true;
    let firstInvalid = null;

    fields.forEach(f => {
      const input = document.getElementById(f.id);
      const errEl = document.getElementById(`${f.id}-error`);
      if (!input) return;

      const val = input.value;
      if (!f.test(val)) {
        isValid = false;
        input.classList.add('is-invalid');
        if (errEl) {
          errEl.textContent = f.errorMsg;
          errEl.classList.add('show');
        }
        if (!firstInvalid) firstInvalid = input;
      } else {
        input.classList.remove('is-invalid');
        if (errEl) {
          errEl.textContent = '';
          errEl.classList.remove('show');
        }
      }
    });

    if (!isValid) {
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    // 1. Display success message
    const successMsg = document.getElementById('contact-success-alert');
    if (successMsg) {
      successMsg.style.display = 'block';
      successMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    // 2. Reset the form
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
   10. TRACKING LOCATE BUTTONS VALIDATION & 404 REDIRECTION
   Requirement: "Remove demo waybill details and make sure the locate button redirects to 404 page upon submitting any valid way bill number."
   ========================================================================== */
function initTrackingLocateForms() {
  const isInPagesDir = window.location.pathname.includes('/pages/');
  const notFoundUrl = isInPagesDir ? '../404.html' : '404.html';

  // 1. Home page quick tracking form
  const heroTrackerForm = document.getElementById('hero-tracker-form') || document.querySelector('.tracker-form');
  const heroTrackerInput = document.getElementById('hero-tracker-input');
  const heroTrackerError = document.getElementById('hero-tracker-error');

  if (heroTrackerForm && heroTrackerInput) {
    heroTrackerInput.addEventListener('input', () => {
      heroTrackerInput.classList.remove('is-invalid');
      if (heroTrackerError) heroTrackerError.classList.remove('show');
    });

    heroTrackerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = heroTrackerInput.value.trim();
      if (!val || val.length < 3) {
        heroTrackerInput.classList.add('is-invalid');
        if (heroTrackerError) {
          heroTrackerError.textContent = 'Please enter a valid waybill or container number (min. 3 characters).';
          heroTrackerError.classList.add('show');
        }
        heroTrackerInput.focus();
        return;
      }
      // Valid waybill submitted -> redirect to 404 page
      window.location.href = notFoundUrl;
    });
  }

  // 2. Tracking page form
  const trackingForm = document.getElementById('tracking-search-form');
  const trackingInput = document.getElementById('tracking-input');
  const trackingError = document.getElementById('tracking-input-error');

  if (trackingForm && trackingInput) {
    trackingInput.addEventListener('input', () => {
      trackingInput.classList.remove('is-invalid');
      if (trackingError) trackingError.classList.remove('show');
    });

    trackingForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = trackingInput.value.trim();
      if (!val || val.length < 3) {
        trackingInput.classList.add('is-invalid');
        if (trackingError) {
          trackingError.textContent = 'Please enter a valid waybill number (min. 3 characters).';
          trackingError.classList.add('show');
        }
        trackingInput.focus();
        return;
      }
      // Valid waybill submitted -> redirect to 404 page
      window.location.href = notFoundUrl;
    });
  }
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

/* ==========================================================================
   13. SERVICES PAGE DYNAMIC FUNCTIONALITY & MULTIMODAL FEATURES
   ========================================================================== */

const SERVICE_SPECS = {
  'air-freight': {
    title: 'Air Freight Priority Charter & Scheduled Logistics',
    subtitle: 'High-speed air cargo capacity with guaranteed tarmac turnaround and thermal telemetry.',
    badge: 'IATA CEIV Certified',
    calculatorPreset: 'air',
    rows: [
      { label: 'Primary Fleet Types', value: 'Boeing 777F, Airbus A330-200F, Boeing 747-8F Heavy Freighters' },
      { label: 'Maximum Payload Capacity', value: 'Up to 102,000 kg (102 MT) per full-charter aircraft' },
      { label: 'Cargo Volume Utilization', value: '650 m³ volumetric capacity across main deck and lower holds' },
      { label: 'Key Gateways & Hubs', value: 'Chennai (MAA), Bangalore (BLR), Frankfurt (FRA), Dubai (DWC), Singapore (SIN)' },
      { label: 'Temperature Control Bands', value: 'Active Envirotainer / CSafe containers (-20°C to +25°C)' },
      { label: 'Transit SLA (Express / Standard)', value: '24 to 36 hours (Express Charter) / 48 to 72 hours (Scheduled Consolidation)' },
      { label: 'Customs & Documentation', value: 'Pre-flight e-AWB manifest transmission via direct ICEGATE EDI integration' },
      { label: 'Security & Certifications', value: 'TAPA TSR Level 1, ISO 9001:2015, IATA CEIV Pharma Certified' },
      { label: 'Tracking & Telemetry', value: 'Real-time GPS coordinates, barometric pressure, shock & temperature sensor feed' }
    ]
  },
  'ocean-freight': {
    title: 'Ocean Container Line & Maritime Intermodal Logistics',
    subtitle: 'Full Container Load (FCL) and Less than Container Load (LCL) global shipping corridors.',
    badge: 'IMO 2020 Compliant',
    calculatorPreset: 'ocean',
    rows: [
      { label: 'Service Coverage', value: 'FCL (Full Container Load) & LCL (Consolidated Groupage) Maritime Haulage' },
      { label: 'Container Types Supported', value: '20ft Standard, 40ft High Cube, 45ft High Cube, 40ft Reefer, Open Top & Flat Rack' },
      { label: 'Maximum Container Payload', value: '28,500 kg per 40ft High Cube container' },
      { label: 'Primary Maritime Gateways', value: 'Chennai Sea Port, Tuticorin Port, Rotterdam (NLD), Singapore (SIN), New York (USA)' },
      { label: 'Average Ocean Transit SLA', value: 'Rotterdam: 18-22 Days | Singapore: 4-6 Days | New York / US East Coast: 24-28 Days' },
      { label: 'Reefer Monitoring', value: 'Continuous telemetry logging cold-chain temperatures (-30°C to +30°C) with backup power' },
      { label: 'Customs Bonded Handling', value: 'Direct port drayage under customs bond to Salem Inland Container Depot' },
      { label: 'Sailing Schedules', value: 'Weekly guaranteed carrier allocations with Tier-1 shipping alliances' },
      { label: 'Environmental Standards', value: 'IMO 2020 low-sulfur marine gasoil compliance with optional Carbon-Offset Ledger' }
    ]
  },
  'road-freight': {
    title: 'Interstate Heavy Road Haulage & Corridor Freight',
    subtitle: 'Dedicated road transport across the Indian National Highway network with dual-driver shifts.',
    badge: 'Fast-Track GPS Telematics',
    calculatorPreset: 'road',
    rows: [
      { label: 'Fleet Configuration', value: 'BharatBenz & Volvo Multi-Axle Prime Movers (32ft & 40ft High-Deck Trailers)' },
      { label: 'Payload Capacity per Vehicle', value: '15 to 45 Metric Tons per truck configuration' },
      { label: 'Operating Corridors', value: 'Chennai-Salem-Coimbatore, Bangalore-Salem-Madurai, Salem-Mumbai NH48 Expressway' },
      { label: 'Dispatch Punctuality', value: '99.4% on-time corridor dispatch across Golden Quadrilateral routes' },
      { label: 'Driver Protocols', value: 'Dual-driver continuous team hauling with 4-hour fatigue management rotation' },
      { label: 'Onboard Telematics', value: 'OBD-II CANbus telemetry, ADAS blind-spot radar, and digital fuel theft sensors' },
      { label: 'Security & Geofencing', value: 'Active route geofencing with automated unauthorized stop alert protocols' },
      { label: 'Cross-Dock Connection', value: 'Direct roll-on roll-off ramp docking at Salem Central Terminal' }
    ]
  },
  'warehousing': {
    title: 'Cross-Dock Warehousing & High-Velocity Distribution',
    subtitle: 'Strategic regional hub operations at Salem with rapid turnaround cross-dock bays.',
    badge: 'AEO-T2 Bonded Facility',
    calculatorPreset: 'road',
    rows: [
      { label: 'Facility Footprint', value: '185,000 sq.ft grade-A warehouse floor located at MMR Complex, Salem' },
      { label: 'Cross-Dock Bays', value: '28 hydraulic rapid-dock bays with weather-sealed inflatable shelter aprons' },
      { label: 'Storage Infrastructure', value: 'Very Narrow Aisle (VNA) selective pallet racking with wire-guided turret trucks' },
      { label: 'WMS Technology', value: 'SAP-integrated Stackly WMS with 99.98% inventory cycle count accuracy' },
      { label: 'Throughput Turnaround', value: 'Under 15-minute cross-dock turnaround from inbound de-palletization to outbound dispatch' },
      { label: 'Fire & Facility Safety', value: 'NFPA-compliant ESFR overhead sprinkler matrix with FM Global certified fire pumps' },
      { label: 'Customs Bonded Zone', value: '35,000 sq.ft segregated customs-bonded staging floor under 24/7 CCTV surveillance' },
      { label: 'Security Infrastructure', value: 'Biometric multi-factor access control and 4K AI video perimeter intrusion detection' }
    ]
  },
  'cold-chain': {
    title: 'Pharma Cryogenic & Perishables Cold Chain',
    subtitle: 'Strict temperature-governed multimodal transit complying with Good Distribution Practices (GDP).',
    badge: 'WHO GDP / US FDA Compliant',
    calculatorPreset: 'cold',
    rows: [
      { label: 'Temperature Regimes', value: 'Cryogenic (-80°C to -60°C), Deep Frozen (-20°C), Chilled (+2°C to +8°C), Controlled (+15°C to +25°C)' },
      { label: 'Refrigeration Equipment', value: 'Dual-circuit Carrier Vector 1950 multi-temp units with redundant diesel generators' },
      { label: 'Passive Packaging', value: 'Vacuum Insulated Panels (VIP) and Phase Change Material (PCM) thermal shipper boxes' },
      { label: 'Regulatory Compliance', value: 'WHO TRS 961 Annex 9, US FDA 21 CFR Part 11 compliant electronic data logs' },
      { label: 'Thermal Mapping & Validation', value: 'Annual seasonal temperature profile mapping (summer/winter) with 72-hr hold tests' },
      { label: 'IoT Sensor Frequency', value: 'NIST-traceable calibrated wireless temperature and humidity logging every 60 seconds' },
      { label: 'Emergency Protocol', value: 'Automated 15-minute SMS/Email escalation upon ±0.5°C temperature excursions' },
      { label: 'Pre-Cooling Infrastructure', value: 'High-velocity blast pre-cooling staging chambers at Salem Cold Terminal' }
    ]
  },
  'customs': {
    title: 'Strategic Customs Brokerage & Trade Compliance',
    subtitle: 'Fast-track green channel electronic clearance through direct ICEGATE EDI integration.',
    badge: 'AEO-Tier 2 Certified Broker',
    calculatorPreset: 'air',
    rows: [
      { label: 'Licensing Accreditation', value: 'Authorized Economic Operator Tier-2 (AEO-T2) Certified Customs Brokerage' },
      { label: 'EDI Integration', value: 'Direct electronic ICEGATE gateway filing with automated duty & IGST calculations' },
      { label: 'Standard Clearance Speed', value: 'Green channel RMS clearance within 3 to 6 hours of flight/vessel arrival' },
      { label: 'Bonded Warehouse Facilities', value: 'Customs bonded public and private storage administration under Sections 49 & 59' },
      { label: 'Documentation Managed', value: 'Bills of Entry, Shipping Bills, Certificates of Origin, Phytosanitary, e-BRC tracking' },
      { label: 'Tariff & Duty Advisory', value: 'HS Code classification audits and FTA / CEPA preferential tariff optimization' },
      { label: 'Port Coverage', value: 'Chennai Sea/Air, Tuticorin Port, Bangalore Inland Port, Coimbatore ICD, Salem Hub' },
      { label: 'Post-Clearance Audit', value: 'Complete digital archiving of customs entries with automated 5-year audit trail' }
    ]
  }
};

function scrollToAnchor(targetId, pulse) {
  const target = document.getElementById(targetId);
  if (!target) return;

  const header = document.querySelector('.site-header');
  const headerHeight = header ? header.offsetHeight : 80;
  const targetPos = target.getBoundingClientRect().top + window.pageYOffset - (headerHeight + 20);

  window.scrollTo({
    top: targetPos,
    behavior: 'smooth'
  });

  if (pulse) {
    target.classList.remove('section-highlight-pulse');
    void target.offsetWidth; // force reflow
    target.classList.add('section-highlight-pulse');
    setTimeout(() => {
      target.classList.remove('section-highlight-pulse');
    }, 2500);
  }

  // Sync the filter bar active state if there is a matching filter button
  const filterBtn = document.querySelector(`.service-filter-btn[data-filter="${targetId}"]`);
  if (filterBtn) {
    document.querySelectorAll('.service-filter-btn').forEach(b => b.classList.remove('active'));
    filterBtn.classList.add('active');
  }
}

function initSpecsModal() {
  const modal = document.getElementById('services-specs-modal');
  if (!modal) return;

  const titleEl = document.getElementById('specs-modal-title');
  const descEl = document.getElementById('specs-modal-desc');
  const badgeEl = document.getElementById('modal-spec-badge');
  const tbody = document.getElementById('specs-table-body');
  const calcBtn = document.getElementById('modal-calc-btn');
  const backdrop = document.getElementById('specs-modal-backdrop');
  const closeBtns = modal.querySelectorAll('.specs-modal-close');

  function openModal(specKey) {
    const spec = SERVICE_SPECS[specKey];
    if (!spec) return;

    if (titleEl) titleEl.textContent = spec.title;
    if (descEl) descEl.textContent = spec.subtitle;
    if (badgeEl) badgeEl.textContent = spec.badge;

    if (tbody) {
      tbody.innerHTML = spec.rows.map(row => `
        <tr>
          <td style="padding:10px 14px; font-weight:600; color:#0f172a; border-bottom:1px solid #e2e8f0; width:35%;">${row.label}</td>
          <td style="padding:10px 14px; color:#475569; border-bottom:1px solid #e2e8f0;">${row.value}</td>
        </tr>
      `).join('');
    }

    if (calcBtn) {
      calcBtn.setAttribute('data-mode-preset', spec.calculatorPreset || 'air');
    }

    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }

  document.querySelectorAll('.specs-modal-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const specKey = btn.getAttribute('data-spec');
      if (specKey) openModal(specKey);
    });
  });

  closeBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      closeModal();
    });
  });

  if (backdrop) {
    backdrop.addEventListener('click', closeModal);
  }

  if (calcBtn) {
    calcBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const mode = calcBtn.getAttribute('data-mode-preset') || 'air';
      closeModal();
      
      const calcModeSelect = document.getElementById('calc-mode');
      if (calcModeSelect) {
        calcModeSelect.value = mode;
      }
      scrollToAnchor('rate-calculator', true);
      triggerRateCalculation();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('open')) {
      closeModal();
    }
  });
}

function initFreightCalculator() {
  const calcForm = document.getElementById('freight-calc-form');
  if (!calcForm) return;

  calcForm.addEventListener('submit', (e) => {
    e.preventDefault();
    triggerRateCalculation();
  });

  // Auto-update when changing inputs
  ['calc-mode', 'calc-origin', 'calc-destination', 'calc-weight', 'calc-commodity'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('change', triggerRateCalculation);
      if (id === 'calc-weight') {
        el.addEventListener('input', triggerRateCalculation);
      }
    }
  });

  // Calculate immediately on load
  triggerRateCalculation();
}

function triggerRateCalculation() {
  const modeSelect = document.getElementById('calc-mode');
  const originSelect = document.getElementById('calc-origin');
  const destSelect = document.getElementById('calc-destination');
  const weightInput = document.getElementById('calc-weight');
  const commoditySelect = document.getElementById('calc-commodity');

  if (!modeSelect || !weightInput) return;

  const mode = modeSelect.value || 'air';
  const origin = originSelect && originSelect.selectedIndex >= 0 ? originSelect.options[originSelect.selectedIndex].text : 'Salem Central Terminal (HQ)';
  const dest = destSelect && destSelect.selectedIndex >= 0 ? destSelect.options[destSelect.selectedIndex].text : 'Frankfurt Airport Node (FRA)';
  const weight = Math.max(10, parseFloat(weightInput.value) || 500);
  const commodity = commoditySelect ? commoditySelect.value : 'standard';

  let ratePerKg = 4.25;
  let slaText = '24 - 48 Hours Express';
  let handlingFee = 120;

  if (mode === 'ocean') {
    ratePerKg = 0.48;
    slaText = '18 - 22 Days Intermodal Sea';
    handlingFee = 240;
  } else if (mode === 'road') {
    ratePerKg = 0.85;
    slaText = '48 - 72 Hours Corridor Haulage';
    handlingFee = 75;
  } else if (mode === 'cold') {
    ratePerKg = 5.90;
    slaText = '24 - 36 Hours Cryo Monitored';
    handlingFee = 195;
  } else {
    ratePerKg = 4.25;
    slaText = '24 - 48 Hours Air Priority';
    handlingFee = 120;
  }

  let commodityMult = 1.0;
  if (commodity === 'pharma') commodityMult = 1.25;
  else if (commodity === 'electronics') commodityMult = 1.15;
  else if (commodity === 'heavy') commodityMult = 1.30;

  const baseRate = Math.round(weight * ratePerKg * commodityMult);
  const fuelRate = Math.round(baseRate * 0.15);
  const terminalRate = handlingFee;
  const totalTariffUSD = baseRate + fuelRate + terminalRate;
  const inrTariff = Math.round(totalTariffUSD * 83);

  const routeTitleEl = document.getElementById('res-route-title');
  const transitSlaEl = document.getElementById('res-transit-sla');
  const baseRateEl = document.getElementById('res-base-rate');
  const fuelRateEl = document.getElementById('res-fuel-rate');
  const terminalRateEl = document.getElementById('res-terminal-rate');
  const totalTariffEl = document.getElementById('res-total-tariff');
  const inrTariffEl = document.getElementById('res-inr-tariff');
  const resultsBox = document.getElementById('calc-results-box');

  if (routeTitleEl) routeTitleEl.textContent = `${origin} → ${dest}`;
  if (transitSlaEl) transitSlaEl.textContent = slaText;
  if (baseRateEl) baseRateEl.textContent = `$${baseRate.toLocaleString()}`;
  if (fuelRateEl) fuelRateEl.textContent = `$${fuelRate.toLocaleString()}`;
  if (terminalRateEl) terminalRateEl.textContent = `$${terminalRate.toLocaleString()}`;
  if (totalTariffEl) totalTariffEl.textContent = `$${totalTariffUSD.toLocaleString()}`;
  if (inrTariffEl) inrTariffEl.textContent = `(₹${inrTariff.toLocaleString('en-IN')} INR)`;

  if (resultsBox) {
    resultsBox.style.display = 'block';
  }
}

function initFaqAccordion() {
  const accordionItems = document.querySelectorAll('.faq-accordion-item');
  if (!accordionItems.length) return;

  accordionItems.forEach(item => {
    const header = item.querySelector('.faq-accordion-header');
    if (!header) return;

    header.addEventListener('click', (e) => {
      e.preventDefault();
      const isOpen = item.classList.contains('open');

      accordionItems.forEach(other => {
        other.classList.remove('open');
        const otherBtn = other.querySelector('.faq-accordion-header');
        if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
      });

      if (!isOpen) {
        item.classList.add('open');
        header.setAttribute('aria-expanded', 'true');
      }
    });
  });
}

function initServicesPage() {
  const isServicesPage = window.location.pathname.includes('services.html');

  // Jump buttons to calculator with mode preset
  document.querySelectorAll('.calc-jump-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const mode = btn.getAttribute('data-mode-preset');
      const calcModeSelect = document.getElementById('calc-mode');
      if (calcModeSelect && mode) {
        calcModeSelect.value = mode;
      }
      if (isServicesPage) {
        e.preventDefault();
        scrollToAnchor('rate-calculator', true);
        triggerRateCalculation();
      }
    });
  });

  if (!isServicesPage) return;

  // Filter Tabs
  const filterBtns = document.querySelectorAll('.service-filter-btn[data-filter]');
  const serviceCards = document.querySelectorAll('.service-card[data-service]');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');
      if (!filter) return;

      serviceCards.forEach(card => {
        const matches = filter === 'all' || card.getAttribute('data-service') === filter;
        card.style.display = matches ? 'flex' : 'none';
      });

      if (filter !== 'all') {
        const targetSection = document.getElementById(filter);
        if (targetSection) {
          scrollToAnchor(filter, true);
        }
      }
    });
  });

  // Initialize interactive sub-components
  initSpecsModal();
  initFreightCalculator();
  initFaqAccordion();

  // Handle deep link anchor on page load
  if (window.location.hash) {
    const hash = window.location.hash.substring(1);
    if (hash) {
      setTimeout(() => {
        scrollToAnchor(hash, true);
      }, 300);
    }
  }

  // Smooth scroll for in-page anchors
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const href = anchor.getAttribute('href');
      if (href && href.length > 1) {
        const targetId = href.substring(1);
        if (targetId && document.getElementById(targetId)) {
          e.preventDefault();
          scrollToAnchor(targetId, true);
        }
      }
    });
  });
}


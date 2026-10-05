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
  initDashboardForms();
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
  };

  // Immediate dismiss on load with fallback timeout
  if (document.readyState === 'complete') {
    dismissLoader();
  } else {
    window.addEventListener('load', dismissLoader);
  }

  // Handle BFCache (Back/Forward navigation) where DOMContentLoaded doesn't re-fire
  window.addEventListener('pageshow', () => {
    dismissLoader();
  });

  // Handle tab visibility restoration
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      dismissLoader();
    }
  });

  setTimeout(dismissLoader, 900); // Fail-safe
}

// Track last visited non-404 page for reliable 404 "Go Back" redirection
if (!window.location.pathname.toLowerCase().includes('404.html')) {
  try {
    sessionStorage.setItem('stackly_last_valid_page', window.location.href);
  } catch (err) {
    // Ignore storage restrictions if any
  }
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
      e.stopPropagation();

      const loader = document.getElementById('site-loader');
      if (loader) loader.classList.add('loader-hidden');

      const lastPage = sessionStorage.getItem('stackly_last_valid_page');
      if (lastPage && lastPage !== window.location.href) {
        window.location.href = lastPage;
      } else if (window.history.length > 1) {
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
  const indexUrl = isInPagesDir ? '../index.html' : 'index.html';
  const isContactPage = window.location.pathname.includes('contact.html');

  const triggerRedirectWithSpinner = (targetUrl) => {
    const loader = document.getElementById('site-loader');
    if (loader) {
      loader.classList.remove('loader-hidden');
    }
    // Prevent BFCache from persisting the loader state
    window.addEventListener('pagehide', () => {
      if (loader) loader.classList.add('loader-hidden');
    }, { once: true });

    setTimeout(() => {
      window.location.href = targetUrl;
    }, 280);
  };

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
    'customer-tracking.html', 'pages/customer-tracking.html',
    'customer-orders.html', 'pages/customer-orders.html',
    'customer-waybill.html', 'pages/customer-waybill.html',
    'customer-consignees.html', 'pages/customer-consignees.html',
    'customer-support.html', 'pages/customer-support.html',
    'admin-dashboard.html', 'pages/admin-dashboard.html',
    'admin-dispatch.html', 'pages/admin-dispatch.html',
    'admin-fleet.html', 'pages/admin-fleet.html',
    'admin-warehouse.html', 'pages/admin-warehouse.html',
    'admin-customs.html', 'pages/admin-customs.html',
    'admin-alerts.html', 'pages/admin-alerts.html',
    'admin-drivers.html', 'pages/admin-drivers.html',
    '404.html', '../404.html', '#', 'javascript:void(0);'
  ];

  document.addEventListener('click', (e) => {
    const targetEl = e.target.closest('button, .btn, a, .btn-back');
    if (!targetEl) return;

    // Do NOT intercept if modifier keys pressed (user opened in new tab/window)
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (targetEl.target === '_blank') return;

    // 1. Stackly brand logo click -> redirect to index.html using same link after spinner
    if (targetEl.classList.contains('brand-logo') || targetEl.closest('.brand-logo')) {
      e.preventDefault();
      triggerRedirectWithSpinner(indexUrl);
      return;
    }

    // 2. Go Back button is handled by initGoBackButton
    if (targetEl.classList.contains('btn-back') || targetEl.getAttribute('data-action') === 'go-back') {
      return;
    }

    // 3. UI Controls that stay on the current page (tabs, toggles, accordion, drawer buttons, close buttons)
    if (targetEl.classList.contains('role-pill-btn') || 
        targetEl.classList.contains('tracker-tab-btn') || 
        targetEl.classList.contains('password-toggle-btn') ||
        targetEl.classList.contains('drawer-close-btn') ||
        targetEl.classList.contains('hamburger-btn') ||
        targetEl.classList.contains('dropdown-toggle') ||
        targetEl.classList.contains('mobile-dropdown-btn') ||
        targetEl.closest('.mobile-dropdown-btn') ||
        targetEl.classList.contains('sidebar-collapse-btn') ||
        targetEl.id === 'sidebar-collapse-btn' ||
        targetEl.classList.contains('mobile-sidebar-toggle-btn') ||
        targetEl.id === 'mobile-sidebar-toggle-btn' ||
        targetEl.id === 'logout-btn' ||
        targetEl.classList.contains('filter-pill') ||
        targetEl.classList.contains('waybill-selector-btn') ||
        targetEl.classList.contains('quick-preset-chip') ||
        (targetEl.classList.contains('service-filter-btn') && targetEl.hasAttribute('data-filter')) ||
        targetEl.classList.contains('specs-modal-btn') ||
        targetEl.classList.contains('specs-modal-close') ||
        targetEl.classList.contains('specs-modal-close-icon') ||
        targetEl.classList.contains('specs-modal-close-btn') ||
        targetEl.closest('.specs-modal-close') ||
        targetEl.closest('.specs-modal-close-icon') ||
        targetEl.classList.contains('faq-accordion-header') ||
        targetEl.closest('.faq-accordion-header')) {
      return;
    }

    // 4. Modal action button -> redirect to 404 page after spinner
    if (targetEl.id === 'modal-calc-btn' || targetEl.closest('#modal-calc-btn')) {
      e.preventDefault();
      const modal = document.getElementById('services-specs-modal');
      if (modal) modal.classList.remove('open');
      document.body.style.overflow = '';
      triggerRedirectWithSpinner(notFoundUrl);
      return;
    }

    // 5. Form submit buttons
    if (targetEl.type === 'submit' && (
      targetEl.closest('#signin-form') || 
      targetEl.closest('#signup-form') || 
      targetEl.closest('#tracking-search-form') ||
      targetEl.closest('#hero-tracker-form') ||
      targetEl.closest('#customer-ticket-form') ||
      targetEl.closest('#contact-form') ||
      targetEl.closest('.tracker-form') ||
      targetEl.closest('#new-consignee-form') ||
      targetEl.closest('#cust-ticket-form') ||
      targetEl.closest('#wb-search-form')
    )) {
      return;
    }

    if (targetEl.id === 'cust-waybill-btn') {
      return;
    }

    // 6. Rate Estimator button in services page -> redirect to 404
    const btnText = (targetEl.textContent || '').trim().toLowerCase();
    const isRateEstimator = btnText.includes('rate estimator') || 
                            btnText.includes('freight tariff') || 
                            btnText.includes('calculate air freight') || 
                            btnText.includes('calculate ocean') || 
                            btnText.includes('calculate haulage') ||
                            targetEl.id === 'calc-submit-btn' ||
                            targetEl.classList.contains('calc-jump-btn');
    if (isRateEstimator) {
      e.preventDefault();
      triggerRedirectWithSpinner(notFoundUrl);
      return;
    }

    // 7. Footer contact information -> redirect to 404
    if (targetEl.closest('.footer-contact-item') || targetEl.classList.contains('footer-contact-link')) {
      e.preventDefault();
      triggerRedirectWithSpinner(notFoundUrl);
      return;
    }

    // 8. In-page hash anchors (e.g. href="#air-freight")
    const rawHref = targetEl.getAttribute('href');
    if (rawHref && rawHref.trim().startsWith('#')) {
      return;
    }

    // 9. Top-level action buttons: redirect to 404 unless in nav-actions / drawer (Sign In / Sign Up)
    if (targetEl.classList.contains('btn') || targetEl.tagName.toLowerCase() === 'button') {
      if (targetEl.closest('.nav-actions') || targetEl.closest('.mobile-drawer')) {
        // Sign In / Sign Up in header: allow navigation with spinner
        if (rawHref && (rawHref.endsWith('.html') || rawHref.includes('.html'))) {
          e.preventDefault();
          triggerRedirectWithSpinner(rawHref.trim());
          return;
        }
        return;
      }
      e.preventDefault();
      triggerRedirectWithSpinner(notFoundUrl);
      return;
    }

    // 10. Footer non-quick-links: redirect to 404
    const inFooter = targetEl.closest('.site-footer');
    if (inFooter) {
      const inQuickLinks = targetEl.closest('.footer-col-quicklinks');
      if (!inQuickLinks) {
        e.preventDefault();
        triggerRedirectWithSpinner(notFoundUrl);
        return;
      }
    }

    // 11. Explicit 404 button
    if (targetEl.classList.contains('btn-action-404') || targetEl.getAttribute('data-action') === '404') {
      e.preventDefault();
      triggerRedirectWithSpinner(notFoundUrl);
      return;
    }

    // 12. Anchor tag navigation
    if (targetEl.tagName.toLowerCase() === 'a') {
      if (!rawHref) return;
      const href = rawHref.trim();

      if (href.startsWith('tel:') || href.startsWith('mailto:')) {
        if (inFooter || isContactPage) {
          e.preventDefault();
          triggerRedirectWithSpinner(notFoundUrl);
          return;
        }
        return;
      }

      if (href.startsWith('javascript:')) return;

      const baseHref = href.split('#')[0].split('?')[0];
      const isAllowed = allowedHrefs.some(allowed => 
        href === allowed || 
        href.endsWith(allowed) || 
        baseHref === allowed || 
        baseHref.endsWith(allowed)
      );

      if (!isAllowed) {
        e.preventDefault();
        triggerRedirectWithSpinner(notFoundUrl);
        return;
      }

      // Allowed page navigation: use same link to redirect after loading spinner!
      if (href.endsWith('.html') || href.includes('.html') || href === '/' || href === './' || href === '../') {
        e.preventDefault();
        triggerRedirectWithSpinner(href);
        return;
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

  const firstNameInput = document.getElementById('contact-firstname');
  const lastNameInput = document.getElementById('contact-lastname');
  const phoneInput = document.getElementById('contact-phone');

  // Real-time restriction: First & Last Name ONLY accept alphabets
  [firstNameInput, lastNameInput].forEach(inp => {
    if (inp) {
      inp.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/[^A-Za-z]/g, '');
      });
    }
  });

  // Real-time restriction: Mobile Number ONLY accepts 10 digits
  if (phoneInput) {
    phoneInput.addEventListener('input', (e) => {
      e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10);
    });
  }

  // Real-time validation listeners
  const fields = [
    { 
      id: 'contact-firstname', 
      test: val => /^[A-Za-z]+$/.test(val.trim()), 
      errorMsg: 'First name should only accept alphabetic letters.' 
    },
    { 
      id: 'contact-lastname', 
      test: val => /^[A-Za-z]+$/.test(val.trim()), 
      errorMsg: 'Last name should only accept alphabetic letters.' 
    },
    { 
      id: 'contact-email', 
      test: val => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(val.trim()), 
      errorMsg: 'Please enter a valid email address format (e.g. name@company.com).' 
    },
    { 
      id: 'contact-phone', 
      test: val => /^\d{10}$/.test(val.trim()), 
      errorMsg: 'Mobile number must be exactly 10 digits.' 
    },
    { 
      id: 'contact-subject', 
      test: val => val.trim().length >= 3, 
      errorMsg: 'Please provide an inquiry subject (minimum 3 characters).' 
    },
    { 
      id: 'contact-message', 
      test: () => true, 
      errorMsg: '' 
    }
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
   Requirement: Format validated according to the ID used for searching.
   ========================================================================== */
function initQuickTrackerTabs() {
  const tabs = document.querySelectorAll('.tracker-tab-btn');
  if (!tabs.length) return;

  const labelEl = document.getElementById('hero-tracker-label');
  const inputEl = document.getElementById('hero-tracker-input');
  const formEl = document.getElementById('hero-tracker-form') || document.querySelector('.tracker-form');
  const errorEl = document.getElementById('hero-tracker-error');

  const configs = {
    'air-ocean': {
      label: 'Air Waybill (AWB) / Ocean Container Number',
      placeholder: 'e.g. STK-88219 or MSCU-992144',
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

      if (formEl) formEl.setAttribute('data-current-mode', mode);

      const cfg = configs[mode] || configs['air-ocean'];
      if (labelEl) labelEl.textContent = cfg.label;
      if (inputEl) {
        inputEl.placeholder = cfg.placeholder;
        inputEl.value = '';
        inputEl.classList.remove('is-invalid');
        if (errorEl) {
          errorEl.textContent = '';
          errorEl.classList.remove('show');
        }
        inputEl.focus();
      }
    });
  });
}

/* ==========================================================================
   10. TRACKING LOCATE BUTTONS VALIDATION & 404 REDIRECTION
   Requirement: Validate search option ID format according to the active mode.
   ========================================================================== */
function initTrackingLocateForms() {
  const isInPagesDir = window.location.pathname.includes('/pages/');
  const notFoundUrl = isInPagesDir ? '../404.html' : '404.html';

  // Format validation patterns according to the ID we use for searching:
  const MODE_FORMATS = {
    'air-ocean': {
      regex: /^((STK|AWB)[- ]?[A-Z0-9]{4,10}|[A-Z]{4}[- ]?[0-9]{6,7}|[0-9]{3}[- ][0-9]{7,8})$/i,
      errorMsg: 'Invalid format for Air & Ocean Cargo. Please use format like STK-88219, AWB-020-7819, or MSCU-992144.'
    },
    'road-freight': {
      regex: /^(RDF[- ][A-Z0-9]{4,8}|[A-Z]{2}[- ][0-9]{2}[- ][A-Z0-9-]{3,8}|EWB[- ]?[0-9]{8,12}|[0-9]{12})$/i,
      errorMsg: 'Invalid format for Road Freight. Please use format like RDF-99412, TN-30-HAUL, or 12-digit E-Way Bill.'
    },
    'customs-bill': {
      regex: /^(CBE|BOE|IGM|IN[A-Z]{3})[- ]?[0-9]{4,10}$/i,
      errorMsg: 'Invalid format for Customs Bill. Please use format like CBE-55210, INMAA-1092, or BOE-123456.'
    }
  };

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

      // Determine active mode from data attribute or active tab
      let activeMode = heroTrackerForm.getAttribute('data-current-mode');
      if (!activeMode) {
        const activeTab = document.querySelector('.tracker-tab-btn.active');
        if (activeTab) {
          activeMode = activeTab.getAttribute('data-mode') || 'air-ocean';
        } else {
          activeMode = 'air-ocean';
        }
      }

      const formatConfig = MODE_FORMATS[activeMode] || MODE_FORMATS['air-ocean'];

      if (!val) {
        heroTrackerInput.classList.add('is-invalid');
        if (heroTrackerError) {
          heroTrackerError.textContent = 'Please enter an ID to track.';
          heroTrackerError.classList.add('show');
        }
        heroTrackerInput.focus();
        return;
      }

      if (!formatConfig.regex.test(val)) {
        heroTrackerInput.classList.add('is-invalid');
        if (heroTrackerError) {
          heroTrackerError.textContent = formatConfig.errorMsg;
          heroTrackerError.classList.add('show');
        }
        heroTrackerInput.focus();
        return;
      }

      // Valid ID submitted according to active mode format -> redirect to 404 page
      window.location.href = notFoundUrl;
    });
  }

  // 2. Tracking page form (Multi-Constellation Sync)
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

      // REQUIREMENT: Reset the Multi-Constellation Sync form every time upon clicking submit
      trackingForm.reset();
      trackingInput.value = '';

      // Accepts any of the valid logistics ID formats
      const generalTrackingRegex = /^((STK|AWB|RDF|CBE|BOE|IGM|IN[A-Z]{3}|EWB)[- ]?[A-Z0-9-]{3,12}|[A-Z]{4}[- ]?[0-9]{6,7}|[0-9]{12}|[0-9]{3}[- ][0-9]{7,8})$/i;

      if (!val) {
        trackingInput.classList.add('is-invalid');
        if (trackingError) {
          trackingError.textContent = 'Please enter a waybill or container ID.';
          trackingError.classList.add('show');
        }
        trackingInput.focus();
        return;
      }

      if (!generalTrackingRegex.test(val)) {
        trackingInput.classList.add('is-invalid');
        if (trackingError) {
          trackingError.textContent = 'Please enter a valid format (e.g. STK-88219, MSCU-992144, RDF-99412, or CBE-55210).';
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

  const updateToggleLabels = (isCollapsed) => {
    if (collapseBtn) {
      collapseBtn.setAttribute('title', isCollapsed ? 'Open side menu bar' : 'Close side menu bar completely');
      collapseBtn.setAttribute('aria-expanded', isCollapsed ? 'false' : 'true');
    }
    if (mobileToggleBtn) {
      mobileToggleBtn.setAttribute('title', isCollapsed ? 'Open side menu bar' : 'Close side menu bar');
      mobileToggleBtn.setAttribute('aria-expanded', isCollapsed ? 'false' : 'true');
    }
  };

  const closeSidebarCompletely = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (window.innerWidth <= 1024) {
      // On tablet/mobile: close offcanvas drawer completely
      layout.classList.remove('sidebar-open');
      if (mobileToggleBtn) mobileToggleBtn.setAttribute('aria-expanded', 'false');
    } else {
      // On desktop: collapse sidebar completely
      layout.classList.add('sidebar-collapsed');
      updateToggleLabels(true);
      try {
        localStorage.setItem('stackly_sidebar_collapsed', 'true');
      } catch (err) {}
    }
  };

  const toggleCollapse = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (window.innerWidth <= 1024) {
      // On tablet/mobile: toggle drawer
      const isOpen = layout.classList.toggle('sidebar-open');
      if (mobileToggleBtn) mobileToggleBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    } else {
      // On desktop: toggle complete collapse
      const isCollapsed = layout.classList.toggle('sidebar-collapsed');
      updateToggleLabels(isCollapsed);
      try {
        localStorage.setItem('stackly_sidebar_collapsed', isCollapsed ? 'true' : 'false');
      } catch (err) {}
    }
  };

  // 1. Collapse button inside sidebar: closes sidebar completely
  if (collapseBtn) {
    collapseBtn.addEventListener('click', closeSidebarCompletely);

    // Restore preference on desktop
    try {
      if (window.innerWidth > 1024 && localStorage.getItem('stackly_sidebar_collapsed') === 'true') {
        layout.classList.add('sidebar-collapsed');
        updateToggleLabels(true);
      } else {
        updateToggleLabels(false);
      }
    } catch (err) {}
  }

  // 2. Header toggle button: re-opens or toggles sidebar
  if (mobileToggleBtn) {
    mobileToggleBtn.addEventListener('click', toggleCollapse);
  }

  // 3. Close on overlay click
  if (overlay) {
    overlay.addEventListener('click', () => {
      layout.classList.remove('sidebar-open');
      if (mobileToggleBtn) mobileToggleBtn.setAttribute('aria-expanded', 'false');
    });
  }

  // 4. Auto-close sidebar on mobile when nav link is clicked
  if (sidebar) {
    const navItems = sidebar.querySelectorAll('.dashboard-nav-item');
    navItems.forEach(item => {
      item.addEventListener('click', () => {
        if (window.innerWidth <= 1024) {
          layout.classList.remove('sidebar-open');
          if (mobileToggleBtn) mobileToggleBtn.setAttribute('aria-expanded', 'false');
        }
      });
    });
  }
}

/* ==========================================================================
   11B. DASHBOARD FORM VALIDATION ENGINE
   ========================================================================== */
function initDashboardForms() {
  // 1. Customer Support Ticket Form (#cust-ticket-form on customer-dashboard.html and customer-support.html)
  const ticketForms = document.querySelectorAll('#cust-ticket-form');
  ticketForms.forEach(form => {
    const waybillInput = form.querySelector('#ticket-waybill, input[placeholder*="STK-"]');
    const reasonSelect = form.querySelector('#ticket-reason, select');
    const msgTextarea = form.querySelector('#ticket-message, textarea');
    const alertEl = form.querySelector('#cust-ticket-alert, .alert-success');

    if (waybillInput) {
      waybillInput.addEventListener('input', (e) => {
        e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9#-]/g, '');
        waybillInput.classList.remove('is-invalid');
        const errEl = form.querySelector('#ticket-waybill-error');
        if (errEl) errEl.classList.remove('show');
      });
    }

    if (msgTextarea) {
      msgTextarea.addEventListener('input', () => {
        msgTextarea.classList.remove('is-invalid');
        const errEl = form.querySelector('#ticket-message-error');
        if (errEl) errEl.classList.remove('show');
      });
    }

    if (reasonSelect) {
      reasonSelect.addEventListener('change', () => {
        reasonSelect.classList.remove('is-invalid');
        const errEl = form.querySelector('#ticket-reason-error');
        if (errEl) errEl.classList.remove('show');
      });
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let isValid = true;
      let firstInvalid = null;

      // Validate Waybill Number (format: STK- followed by numbers)
      if (waybillInput) {
        const wbVal = waybillInput.value.trim().toUpperCase();
        const wbErr = form.querySelector('#ticket-waybill-error');
        if (!/^#?STK-\d{4,6}$/.test(wbVal)) {
          isValid = false;
          waybillInput.classList.add('is-invalid');
          if (wbErr) {
            wbErr.textContent = 'Please enter a valid Waybill format: STK- followed by numbers (e.g. STK-88219).';
            wbErr.classList.add('show');
          }
          if (!firstInvalid) firstInvalid = waybillInput;
        } else {
          waybillInput.classList.remove('is-invalid');
          if (wbErr) wbErr.classList.remove('show');
        }
      }

      // Validate Inquiry Reason
      if (reasonSelect) {
        const reasonErr = form.querySelector('#ticket-reason-error');
        if (!reasonSelect.value || reasonSelect.value.trim() === '') {
          isValid = false;
          reasonSelect.classList.add('is-invalid');
          if (reasonErr) {
            reasonErr.textContent = 'Please select a valid inquiry category.';
            reasonErr.classList.add('show');
          }
          if (!firstInvalid) firstInvalid = reasonSelect;
        } else {
          reasonSelect.classList.remove('is-invalid');
          if (reasonErr) reasonErr.classList.remove('show');
        }
      }

      // Validate Message / Details (min 10 characters)
      if (msgTextarea) {
        const msgErr = form.querySelector('#ticket-message-error');
        if (msgTextarea.value.trim().length < 10) {
          isValid = false;
          msgTextarea.classList.add('is-invalid');
          if (msgErr) {
            msgErr.textContent = 'Please describe your dispatch inquiry (minimum 10 characters).';
            msgErr.classList.add('show');
          }
          if (!firstInvalid) firstInvalid = msgTextarea;
        } else {
          msgTextarea.classList.remove('is-invalid');
          if (msgErr) msgErr.classList.remove('show');
        }
      }

      if (!isValid) {
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      // Success feedback
      if (alertEl) {
        alertEl.style.display = 'block';
        alertEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        form.reset();
        setTimeout(() => {
          alertEl.style.display = 'none';
        }, 5000);
      }
    });
  });

  // 2. New Consignee Address Form (#new-consignee-form on customer-consignees.html)
  const consigneeForm = document.getElementById('new-consignee-form');
  if (consigneeForm) {
    const nameInp = consigneeForm.querySelector('#consignee-name, input[placeholder*="Coimbatore"]');
    const gstinInp = consigneeForm.querySelector('#consignee-gstin, input[placeholder*="33AAACS"]');
    const officerInp = consigneeForm.querySelector('#consignee-officer, input[placeholder*="Murugesan"]');
    const phoneInp = consigneeForm.querySelector('#consignee-phone, input[type="tel"]');
    const addressInp = consigneeForm.querySelector('#consignee-address, textarea');
    const alertEl = document.getElementById('consignee-success-alert');

    // Real-time restrictions:
    // Officer Name: ONLY alphabets and spaces
    if (officerInp) {
      officerInp.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/[^A-Za-z\s.]/g, '');
        officerInp.classList.remove('is-invalid');
        const err = document.getElementById('consignee-officer-error');
        if (err) err.classList.remove('show');
      });
    }

    // Phone: ONLY 10 digits
    if (phoneInp) {
      phoneInp.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10);
        phoneInp.classList.remove('is-invalid');
        const err = document.getElementById('consignee-phone-error');
        if (err) err.classList.remove('show');
      });
    }

    // GSTIN: Alphanumeric uppercase (15 chars)
    if (gstinInp) {
      gstinInp.addEventListener('input', (e) => {
        e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 15);
        gstinInp.classList.remove('is-invalid');
        const err = document.getElementById('consignee-gstin-error');
        if (err) err.classList.remove('show');
      });
    }

    [nameInp, addressInp].forEach(inp => {
      if (inp) {
        inp.addEventListener('input', () => {
          inp.classList.remove('is-invalid');
          const err = document.getElementById(`${inp.id}-error`);
          if (err) err.classList.remove('show');
        });
      }
    });

    consigneeForm.addEventListener('submit', (e) => {
      e.preventDefault();
      let isValid = true;
      let firstInvalid = null;

      // Validate Entity Name (min 3 chars)
      if (nameInp) {
        const err = document.getElementById('consignee-name-error');
        if (nameInp.value.trim().length < 3) {
          isValid = false;
          nameInp.classList.add('is-invalid');
          if (err) {
            err.textContent = 'Consignee entity name must be at least 3 characters.';
            err.classList.add('show');
          }
          if (!firstInvalid) firstInvalid = nameInp;
        } else {
          nameInp.classList.remove('is-invalid');
          if (err) err.classList.remove('show');
        }
      }

      // Validate GSTIN (10 to 15 chars)
      if (gstinInp) {
        const err = document.getElementById('consignee-gstin-error');
        const gstinVal = gstinInp.value.trim();
        if (gstinVal.length < 10 || !/^[A-Z0-9]{10,15}$/.test(gstinVal)) {
          isValid = false;
          gstinInp.classList.add('is-invalid');
          if (err) {
            err.textContent = 'Please enter a valid GSTIN or Corporate Tax ID (e.g. 33AAACS7729K1Z9).';
            err.classList.add('show');
          }
          if (!firstInvalid) firstInvalid = gstinInp;
        } else {
          gstinInp.classList.remove('is-invalid');
          if (err) err.classList.remove('show');
        }
      }

      // Validate Officer Name (alphabets only, min 2 chars)
      if (officerInp) {
        const err = document.getElementById('consignee-officer-error');
        const officerVal = officerInp.value.trim();
        if (!/^[A-Za-z\s.]+$/.test(officerVal) || officerVal.length < 2) {
          isValid = false;
          officerInp.classList.add('is-invalid');
          if (err) {
            err.textContent = 'Receiving officer name should only accept alphabetic characters.';
            err.classList.add('show');
          }
          if (!firstInvalid) firstInvalid = officerInp;
        } else {
          officerInp.classList.remove('is-invalid');
          if (err) err.classList.remove('show');
        }
      }

      // Validate Phone (10 digits)
      if (phoneInp) {
        const err = document.getElementById('consignee-phone-error');
        if (!/^\d{10}$/.test(phoneInp.value.trim())) {
          isValid = false;
          phoneInp.classList.add('is-invalid');
          if (err) {
            err.textContent = 'Receiving officer phone must be exactly 10 digits.';
            err.classList.add('show');
          }
          if (!firstInvalid) firstInvalid = phoneInp;
        } else {
          phoneInp.classList.remove('is-invalid');
          if (err) err.classList.remove('show');
        }
      }

      // Validate Address (min 8 chars)
      if (addressInp) {
        const err = document.getElementById('consignee-address-error');
        if (addressInp.value.trim().length < 8) {
          isValid = false;
          addressInp.classList.add('is-invalid');
          if (err) {
            err.textContent = 'Please enter complete street address and postal code (minimum 8 characters).';
            err.classList.add('show');
          }
          if (!firstInvalid) firstInvalid = addressInp;
        } else {
          addressInp.classList.remove('is-invalid');
          if (err) err.classList.remove('show');
        }
      }

      if (!isValid) {
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      // Valid: show alert and prepend new card to the list if present
      if (alertEl) {
        alertEl.style.display = 'block';
        alertEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }

      const grid = document.querySelector('#customer-consignees-list, .grid-3');
      if (grid && nameInp && officerInp && phoneInp && gstinInp && addressInp) {
        const card = document.createElement('div');
        card.className = 'address-card';
        card.style.animation = 'fadeInUp 0.4s ease forwards';
        card.innerHTML = `
          <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
            <span class="status-badge status-delivered" style="font-size:11px;">Verified Node</span>
            <span style="font-size:12px; color:#94a3b8;">Active Node</span>
          </div>
          <strong style="color:var(--primary); font-size:14px; display:block; margin-bottom:4px;">${nameInp.value.trim()}</strong>
          <p style="font-size:13px; color:#64748b; line-height:1.5;">${addressInp.value.trim()}</p>
          <div style="font-size:12px; color:#475569; margin-top:8px;">
            <strong>Recipient:</strong> ${officerInp.value.trim()} (+91 ${phoneInp.value.trim()})<br>
            <strong>GSTIN:</strong> ${gstinInp.value.trim()}
          </div>
        `;
        grid.prepend(card);
      }

      consigneeForm.reset();
      setTimeout(() => {
        if (alertEl) alertEl.style.display = 'none';
      }, 5000);
    });
  }

  // 3. Customer Waybill Lookup Form Validation (#wb-search-form and #cust-waybill-btn)
  const wbInputs = document.querySelectorAll('#cust-waybill-input');
  wbInputs.forEach(input => {
    const parentContainer = input.closest('form') || input.parentElement;
    const btn = parentContainer ? parentContainer.querySelector('#cust-waybill-btn') : null;
    let errEl = parentContainer ? (parentContainer.querySelector('#wb-validation-error') || parentContainer.parentElement.querySelector('#wb-validation-error')) : null;

    if (!errEl && parentContainer) {
      errEl = document.createElement('div');
      errEl.id = 'wb-validation-error';
      errEl.className = 'form-error-msg';
      errEl.style.cssText = 'color:#dc2626; font-size:12px; margin-top:6px; display:none;';
      errEl.textContent = 'Please enter a valid format: STK- followed by numbers (e.g. STK-88219).';
      if (parentContainer.tagName.toLowerCase() === 'form') {
        parentContainer.appendChild(errEl);
      } else {
        parentContainer.parentElement.insertBefore(errEl, parentContainer.nextSibling);
      }
    }

    input.addEventListener('input', (e) => {
      e.target.value = e.target.value.toUpperCase();
      input.classList.remove('is-invalid');
      if (errEl) errEl.style.display = 'none';
    });

    const validateAndSearch = (e) => {
      const val = input.value.trim().toUpperCase();
      if (!/^#?STK-\d{4,6}$/.test(val)) {
        if (e) {
          e.preventDefault();
          e.stopImmediatePropagation();
        }
        input.classList.add('is-invalid');
        if (errEl) {
          errEl.style.display = 'block';
          errEl.textContent = 'Please enter a valid format: STK- followed by numbers (e.g. STK-88219).';
        }
        input.focus();
        return false;
      }
      input.classList.remove('is-invalid');
      if (errEl) errEl.style.display = 'none';
      return true;
    };

    if (btn) {
      btn.addEventListener('click', (e) => {
        validateAndSearch(e);
      });
    }

    const form = input.closest('form');
    if (form) {
      form.addEventListener('submit', (e) => {
        validateAndSearch(e);
      });
    }
  });
}

/* ==========================================================================
   12. INTERSECTION OBSERVER SCROLL ANIMATIONS
   ========================================================================== */
function initScrollAnimations() {
  const isReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const targets = document.querySelectorAll(
    '.reveal-on-scroll, .feature-card, .service-card, .stat-card, .pricing-card, .kpi-card, .dash-card, .timeline-event-item, .faq-accordion-item, .address-card, .testimonial-card, .fleet-card, .driver-card'
  );

  if (!targets.length) return;

  if (isReduced) {
    targets.forEach(t => t.classList.add('in-view'));
    return;
  }

  targets.forEach(target => {
    if (!target.classList.contains('reveal-on-scroll')) {
      target.classList.add('reveal-on-scroll');
    }
  });

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
        } else {
          // Re-arm when element scrolls out of viewport either above or below
          const rect = entry.boundingClientRect;
          if (rect.top > window.innerHeight || rect.bottom < 0) {
            entry.target.classList.remove('in-view');
          }
        }
      });
    }, {
      rootMargin: '0px 0px -40px 0px',
      threshold: 0.1
    });

    targets.forEach(target => {
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
  const closeBtns = modal.querySelectorAll('.specs-modal-close, .specs-modal-close-icon, .specs-modal-close-btn, [data-action="close-modal"]');

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

  // Action button inside the modal redirects to 404 page with spinner
  if (calcBtn) {
    calcBtn.addEventListener('click', (e) => {
      e.preventDefault();
      closeModal();
      const loader = document.getElementById('site-loader');
      if (loader) loader.classList.remove('loader-hidden');
      setTimeout(() => {
        window.location.href = '../404.html';
      }, 280);
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


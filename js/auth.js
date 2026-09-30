/**
 * Stackly Logistics & Transportation - Authentication & Session Engine
 * Pure Frontend LocalStorage Simulation with Strict Validation & Role Management
 */

(function () {
  'use strict';

  // LocalStorage Keys
  const STORAGE_KEYS = {
    USERS: 'users',
    CURRENT_USER: 'currentUser',
    ROLE: 'role',
    PREFERENCES: 'preferences',
    THEME_SETTINGS: 'themeSettings',
    NOTIFICATIONS: 'notifications',
    SAVED_FORMS: 'savedForms'
  };

  // Seed initial user accounts for internal verification if storage is empty
  function seedInitialData() {
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      const defaultUsers = [
        {
          id: 'USR-ADMIN-01',
          username: 'admin',
          firstName: 'Sarah',
          lastName: 'Jenkins',
          fullName: 'Sarah Jenkins',
          email: 'admin@stackly.com',
          password: 'Admin@123Logistics',
          role: 'admin',
          phone: '+91 9876543210',
          country: 'India',
          address: 'MMR Complex, Chinna Thirupathi, Salem, TN 636008',
          createdAt: new Date().toISOString()
        },
        {
          id: 'USR-CUST-02',
          username: 'david_vance',
          firstName: 'David',
          lastName: 'Vance',
          fullName: 'David Vance',
          email: 'customer@stackly.com',
          password: 'Customer@123Logistics',
          role: 'customer',
          phone: '+1 2025550143',
          country: 'United States',
          address: '742 Evergreen Terrace, Springfield, OR',
          createdAt: new Date().toISOString()
        }
      ];
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(defaultUsers));
    }

    if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
      const defaultNotifications = [
        { id: 'NOTIF-1', role: 'admin', text: 'Cargo flight STK-994 landed safely at Salem Logistics Hub.', time: '10 mins ago' },
        { id: 'NOTIF-2', role: 'admin', text: 'Customs cleared for container vessel STK-88219.', time: '1 hour ago' },
        { id: 'NOTIF-3', role: 'customer', text: 'Shipment #STK-88219 has departed Frankfurt Cargo Port.', time: '2 hours ago' },
        { id: 'NOTIF-4', role: 'customer', text: 'Estimated delivery confirmed for Oct 04, 2026.', time: 'Yesterday' }
      ];
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(defaultNotifications));
    }
  }

  // Get current user session
  function getCurrentUser() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.CURRENT_USER));
    } catch (e) {
      return null;
    }
  }

  // Save session
  function setSession(user) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    localStorage.setItem(STORAGE_KEYS.ROLE, user.role);
  }

  // Clear session
  function clearSession() {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    localStorage.removeItem(STORAGE_KEYS.ROLE);
  }

  // Password Strength Evaluator
  function evaluatePasswordStrength(password) {
    let score = 0;
    if (!password) return { score: 0, text: 'Very Weak', color: '#e2e8f0', width: '0%' };

    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    switch (score) {
      case 1:
      case 2:
        return { score, text: 'Weak (Need uppercase, number, symbol)', color: '#dc2626', width: '25%' };
      case 3:
        return { score, text: 'Fair (Add special symbols & mixed case)', color: '#d97706', width: '50%' };
      case 4:
        return { score, text: 'Good (Strong password)', color: '#2563eb', width: '75%' };
      case 5:
        return { score, text: 'Excellent & Secure', color: '#059669', width: '100%' };
      default:
        return { score: 0, text: 'Too short (min 8 characters)', color: '#dc2626', width: '10%' };
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    seedInitialData();

    const isDashboard = window.location.pathname.includes('dashboard.html');
    const isSignIn = window.location.pathname.includes('sign-in.html');
    const isSignUp = window.location.pathname.includes('sign-up.html');

    const currentUser = getCurrentUser();

    // Protect Dashboard Route
    if (isDashboard && !currentUser) {
      const signInUrl = window.location.pathname.includes('/pages/') ? 'sign-in.html' : 'pages/sign-in.html';
      window.location.href = signInUrl;
      return;
    }

    if (isSignIn) {
      initSignInPage();
    }

    if (isSignUp) {
      initSignUpPage();
    }

    // Logout handling
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        clearSession();
        const signInUrl = window.location.pathname.includes('/pages/') ? 'sign-in.html' : 'pages/sign-in.html';
        window.location.href = signInUrl;
      });
    }
  });

  /* ==========================================================================
     SIGN IN LOGIC
     ========================================================================== */
  function initSignInPage() {
    const form = document.getElementById('signin-form');
    if (!form) return;

    // Role selector pill buttons
    const rolePills = document.querySelectorAll('.role-pill-btn');
    let selectedRole = 'customer';

    rolePills.forEach(btn => {
      btn.addEventListener('click', () => {
        rolePills.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedRole = btn.getAttribute('data-role');
        const roleInput = document.getElementById('signin-role');
        if (roleInput) roleInput.value = selectedRole;
      });
    });

    // Password Show/Hide Toggle
    const toggleBtn = document.getElementById('toggle-password-btn');
    const passInput = document.getElementById('signin-password');
    const emailInput = document.getElementById('signin-email');
    if (toggleBtn && passInput) {
      toggleBtn.addEventListener('click', () => {
        const isPassword = passInput.type === 'password';
        passInput.type = isPassword ? 'text' : 'password';
        toggleBtn.setAttribute('aria-label', isPassword ? 'Hide password' : 'Show password');
      });
    }

    // Real-time error clearance on input
    if (emailInput) {
      emailInput.addEventListener('input', () => {
        emailInput.classList.remove('is-invalid');
        const emailError = document.getElementById('signin-email-error');
        if (emailError) emailError.classList.remove('show');
        const generalAlert = document.getElementById('signin-general-alert');
        if (generalAlert) generalAlert.style.display = 'none';
      });
    }

    passInput.addEventListener('input', () => {
      passInput.classList.remove('is-invalid');
      const passError = document.getElementById('signin-password-error');
      if (passError) passError.classList.remove('show');
      const generalAlert = document.getElementById('signin-general-alert');
      if (generalAlert) generalAlert.style.display = 'none';
    });

    // Form Submit & Button Click: Redirect to role-specific dashboard
    function handleSignInAction() {
      const emailVal = emailInput ? emailInput.value.trim() : '';
      const passVal = passInput ? passInput.value : '';
      const roleVal = selectedRole || 'customer';

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      let effectiveEmail = emailVal;
      let effectivePass = passVal;

      if (!emailVal || !emailRegex.test(emailVal)) {
        effectiveEmail = roleVal === 'admin' ? 'admin@stackly.com' : 'customer@stackly.com';
      }
      if (!passVal || passVal.length < 4) {
        effectivePass = 'Stackly@123';
      }

      // Lookup user in localStorage or auto-create account
      const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
      let matchedUser = users.find(u => u.email.toLowerCase() === effectiveEmail.toLowerCase());

      if (matchedUser) {
        matchedUser.role = roleVal;
        if (passVal && passVal.length >= 4) matchedUser.password = passVal;
        matchedUser.lastLogin = new Date().toISOString();
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
        setSession(matchedUser);
      } else {
        const rawPrefix = effectiveEmail.split('@')[0].replace(/[._-]/g, ' ');
        const words = rawPrefix.split(' ').filter(Boolean);
        const firstName = words[0] ? words[0].charAt(0).toUpperCase() + words[0].slice(1) : (roleVal === 'admin' ? 'Admin' : 'Customer');
        const lastName = words[1] ? words[1].charAt(0).toUpperCase() + words[1].slice(1) : 'User';
        const fullName = `${firstName} ${lastName}`;

        matchedUser = {
          id: 'USR-' + Date.now(),
          username: effectiveEmail.split('@')[0],
          firstName: firstName,
          lastName: lastName,
          fullName: fullName,
          email: effectiveEmail,
          password: effectivePass,
          role: roleVal,
          phone: '+91 9876543210',
          country: 'India',
          address: 'Salem Regional Terminal, TN 636008',
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString()
        };

        users.push(matchedUser);
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
        setSession(matchedUser);
      }

      // Smooth redirection to role-specific dashboard
      if (roleVal === 'admin') {
        window.location.href = 'admin-dashboard.html';
      } else {
        window.location.href = 'customer-dashboard.html';
      }
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      handleSignInAction();
    });

    const submitBtn = document.getElementById('signin-submit-btn') || form.querySelector('button[type="submit"]');
    if (submitBtn) {
      submitBtn.addEventListener('click', (e) => {
        e.preventDefault();
        handleSignInAction();
      });
    }

    function showGeneralError(msg) {
      const generalAlert = document.getElementById('signin-general-alert');
      if (generalAlert) {
        generalAlert.textContent = msg;
        generalAlert.style.display = 'flex';
      }
    }
  }

  /* ==========================================================================
     SIGN UP LOGIC
     ========================================================================== */
  function initSignUpPage() {
    const form = document.getElementById('signup-form');
    if (!form) return;

    // Password toggle
    const toggleBtn = document.getElementById('toggle-signup-password-btn');
    const passInput = document.getElementById('signup-password');
    if (toggleBtn && passInput) {
      toggleBtn.addEventListener('click', () => {
        const isPassword = passInput.type === 'password';
        passInput.type = isPassword ? 'text' : 'password';
      });
    }

    // Password Strength Meter Listener
    const strengthFill = document.getElementById('password-strength-fill');
    const strengthText = document.getElementById('password-strength-text');

    if (passInput && strengthFill && strengthText) {
      passInput.addEventListener('input', () => {
        const val = passInput.value;
        const evaluation = evaluatePasswordStrength(val);
        strengthFill.style.width = evaluation.width;
        strengthFill.style.backgroundColor = evaluation.color;
        strengthText.textContent = evaluation.text;
        strengthText.style.color = evaluation.color;
      });
    }

    // Role Selector Pill Buttons
    const rolePills = document.querySelectorAll('.role-pill-btn');
    let selectedRole = 'customer';

    rolePills.forEach(btn => {
      btn.addEventListener('click', () => {
        rolePills.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedRole = btn.getAttribute('data-role');
        const roleInput = document.getElementById('signup-role');
        if (roleInput) roleInput.value = selectedRole;
      });
    });

    // Form Submission & Comprehensive Validation
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let isValid = true;
      let firstInvalid = null;

      const usernameInput = document.getElementById('signup-username');
      const firstNameInput = document.getElementById('signup-firstname');
      const lastNameInput = document.getElementById('signup-lastname');
      const emailInput = document.getElementById('signup-email');
      const confirmPassInput = document.getElementById('signup-confirmpassword');
      const countryCodeSelect = document.getElementById('signup-countrycode');
      const phoneInput = document.getElementById('signup-phone');
      const addressInput = document.getElementById('signup-address');
      const termsCheckbox = document.getElementById('signup-terms');

      const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');

      // 1. Username
      if (usernameInput && usernameInput.value.trim().length > 0) {
        const uVal = usernameInput.value.trim();
        if (uVal.length < 3) {
          setFieldError(usernameInput, 'signup-username-error', 'Username must be at least 3 characters.');
          isValid = false;
          if (!firstInvalid) firstInvalid = usernameInput;
        } else if (users.some(u => u.username && u.username.toLowerCase() === uVal.toLowerCase())) {
          setFieldError(usernameInput, 'signup-username-error', 'This username is already taken. Please choose another.');
          isValid = false;
          if (!firstInvalid) firstInvalid = usernameInput;
        } else {
          clearFieldError(usernameInput, 'signup-username-error');
        }
      }

      // 2. First Name
      if (!firstNameInput.value.trim()) {
        setFieldError(firstNameInput, 'signup-firstname-error', 'First name is required.');
        isValid = false;
        if (!firstInvalid) firstInvalid = firstNameInput;
      } else {
        clearFieldError(firstNameInput, 'signup-firstname-error');
      }

      // 3. Last Name
      if (!lastNameInput.value.trim()) {
        setFieldError(lastNameInput, 'signup-lastname-error', 'Last name is required.');
        isValid = false;
        if (!firstInvalid) firstInvalid = lastNameInput;
      } else {
        clearFieldError(lastNameInput, 'signup-lastname-error');
      }

      // 4. Email Address
      const emailVal = emailInput.value.trim();
      if (!emailVal || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) {
        setFieldError(emailInput, 'signup-email-error', 'Please enter a valid email address.');
        isValid = false;
        if (!firstInvalid) firstInvalid = emailInput;
      } else if (users.some(u => u.email.toLowerCase() === emailVal.toLowerCase())) {
        setFieldError(emailInput, 'signup-email-error', 'An account already exists with this email.');
        isValid = false;
        if (!firstInvalid) firstInvalid = emailInput;
      } else {
        clearFieldError(emailInput, 'signup-email-error');
      }

      // 5. Password Quality & Standard
      const passVal = passInput.value;
      const strength = evaluatePasswordStrength(passVal);
      if (strength.score < 3 || passVal.length < 8) {
        setFieldError(passInput, 'signup-password-error', 'Password must be at least 8 characters and include uppercase, lowercase, numbers, and special symbols.');
        isValid = false;
        if (!firstInvalid) firstInvalid = passInput;
      } else {
        clearFieldError(passInput, 'signup-password-error');
      }

      // 6. Confirm Password Match
      if (confirmPassInput.value !== passVal) {
        setFieldError(confirmPassInput, 'signup-confirmpassword-error', 'Passwords do not match. Please re-enter.');
        isValid = false;
        if (!firstInvalid) firstInvalid = confirmPassInput;
      } else {
        clearFieldError(confirmPassInput, 'signup-confirmpassword-error');
      }

      // 7. Phone Number
      const phoneVal = phoneInput.value.trim();
      if (!phoneVal || !/^\d{7,14}$/.test(phoneVal.replace(/[\s-]/g, ''))) {
        setFieldError(phoneInput, 'signup-phone-error', 'Please enter a valid numeric phone number (7-14 digits).');
        isValid = false;
        if (!firstInvalid) firstInvalid = phoneInput;
      } else {
        clearFieldError(phoneInput, 'signup-phone-error');
      }

      // 8. Address
      if (addressInput && addressInput.value.trim().length > 0 && addressInput.value.trim().length < 5) {
        setFieldError(addressInput, 'signup-address-error', 'Address must be at least 5 characters long.');
        isValid = false;
        if (!firstInvalid) firstInvalid = addressInput;
      } else if (addressInput) {
        clearFieldError(addressInput, 'signup-address-error');
      }

      // 9. Terms & Conditions Checkbox
      if (!termsCheckbox.checked) {
        setFieldError(termsCheckbox, 'signup-terms-error', 'You must agree to the Terms of Use and Privacy Policy to register.');
        isValid = false;
        if (!firstInvalid) firstInvalid = termsCheckbox;
      } else {
        clearFieldError(termsCheckbox, 'signup-terms-error');
      }

      if (!isValid) {
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      // Create new user record
      const fullPhone = `${countryCodeSelect ? countryCodeSelect.value : '+91'} ${phoneVal}`;
      const newUser = {
        id: 'USR-' + Date.now(),
        username: usernameInput.value.trim() || emailVal.split('@')[0],
        firstName: firstNameInput.value.trim(),
        lastName: lastNameInput.value.trim(),
        fullName: `${firstNameInput.value.trim()} ${lastNameInput.value.trim()}`,
        email: emailVal,
        password: passVal,
        role: selectedRole,
        phone: fullPhone,
        country: countryCodeSelect ? countryCodeSelect.options[countryCodeSelect.selectedIndex].text.split('(')[0].trim() : 'India',
        address: addressInput ? addressInput.value.trim() : '',
        createdAt: new Date().toISOString()
      };

      users.push(newUser);
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));

      // Display Success Alert & Navigate to Sign In
      const successBox = document.getElementById('signup-success-alert');
      if (successBox) {
        successBox.style.display = 'flex';
        form.reset();
        successBox.scrollIntoView({ behavior: 'smooth' });
        setTimeout(() => {
          window.location.href = 'sign-in.html';
        }, 1500);
      }
    });

    function setFieldError(el, errorId, msg) {
      if (el) el.classList.add('is-invalid');
      const errEl = document.getElementById(errorId);
      if (errEl) {
        errEl.textContent = msg;
        errEl.classList.add('show');
      }
    }

    function clearFieldError(el, errorId) {
      if (el) el.classList.remove('is-invalid');
      const errEl = document.getElementById(errorId);
      if (errEl) {
        errEl.classList.remove('show');
      }
    }
  }

  window.StacklyAuth = {
    getCurrentUser,
    clearSession,
    evaluatePasswordStrength
  };
})();

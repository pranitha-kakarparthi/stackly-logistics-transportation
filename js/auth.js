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

    const path = window.location.pathname;
    const isAdminPage = path.includes('admin-');
    const isCustomerPage = path.includes('customer-');
    const isDashboardPage = path.includes('dashboard.html') || isAdminPage || isCustomerPage;
    const isSignIn = path.includes('sign-in.html');
    const isSignUp = path.includes('sign-up.html');

    const currentUser = getCurrentUser();

    // Protect Dashboard Routes: Unauthenticated users are bounced to sign-in
    // Roles are strictly segregated: admin can only access admin pages, customer can only access customer pages
    if (isDashboardPage) {
      if (!currentUser) {
        const signInUrl = path.includes('/pages/') ? 'sign-in.html' : 'pages/sign-in.html';
        window.location.replace(signInUrl);
        return;
      }
      if (isAdminPage && currentUser.role !== 'admin') {
        const target = path.includes('/pages/') ? 'customer-dashboard.html' : 'pages/customer-dashboard.html';
        window.location.replace(target);
        return;
      }
      if (isCustomerPage && currentUser.role !== 'customer') {
        const target = path.includes('/pages/') ? 'admin-dashboard.html' : 'pages/admin-dashboard.html';
        window.location.replace(target);
        return;
      }
    }

    if (isSignIn) {
      initSignInPage();
    }

    if (isSignUp) {
      initSignUpPage();
    }

    // Attach Logout handler to any logout buttons on the page
    const logoutBtns = document.querySelectorAll('#logout-btn, .logout-btn, [data-action="logout"]');
    logoutBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        clearSession();
        const signInUrl = window.location.pathname.includes('/pages/') ? 'sign-in.html' : 'pages/sign-in.html';
        window.location.replace(signInUrl);
      });
    });
  });

  // Prevent back-navigation / bfcache restore after logout
  window.addEventListener('pageshow', (event) => {
    const path = window.location.pathname;
    const isDashboardPage = path.includes('dashboard.html') || path.includes('admin-') || path.includes('customer-');
    if (isDashboardPage) {
      const user = getCurrentUser();
      if (!user) {
        const signInUrl = path.includes('/pages/') ? 'sign-in.html' : 'pages/sign-in.html';
        window.location.replace(signInUrl);
      }
    }
  });

  /* ==========================================================================
     SIGN IN LOGIC
     ========================================================================== */
  function initSignInPage() {
    const form = document.getElementById('signin-form');
    if (!form) return;

    // Form-styled role selection
    const roleRadios = document.querySelectorAll('input[name="auth_role"]');
    const roleCards = document.querySelectorAll('.form-role-card');
    const rolePills = document.querySelectorAll('.role-pill-btn');
    let selectedRole = 'customer';

    function updateRoleSelection(role) {
      selectedRole = role;
      const roleInput = document.getElementById('signin-role');
      if (roleInput) roleInput.value = role;

      roleCards.forEach(card => {
        const input = card.querySelector('input[type="radio"]');
        if (input && input.value === role) {
          card.style.borderColor = 'var(--accent)';
          card.style.backgroundColor = '#fff7ed';
          input.checked = true;
        } else if (input) {
          card.style.borderColor = '#cbd5e1';
          card.style.backgroundColor = '#fff';
        }
      });
    }

    roleRadios.forEach(radio => {
      radio.addEventListener('change', () => {
        if (radio.checked) updateRoleSelection(radio.value);
      });
    });

    roleCards.forEach(card => {
      card.addEventListener('click', () => {
        const input = card.querySelector('input[type="radio"]');
        if (input) updateRoleSelection(input.value);
      });
    });

    rolePills.forEach(btn => {
      btn.addEventListener('click', () => {
        rolePills.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        updateRoleSelection(btn.getAttribute('data-role'));
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

    const firstNameInput = document.getElementById('signin-firstname');
    const lastNameInput = document.getElementById('signin-lastname');

    // Real-time restriction: First & Last Name ONLY accept alphabets
    [firstNameInput, lastNameInput].forEach(inp => {
      if (inp) {
        inp.addEventListener('input', (e) => {
          e.target.value = e.target.value.replace(/[^A-Za-z]/g, '');
          inp.classList.remove('is-invalid');
          const errEl = document.getElementById(`${inp.id}-error`);
          if (errEl) errEl.classList.remove('show');
          const generalAlert = document.getElementById('signin-general-alert');
          if (generalAlert) generalAlert.style.display = 'none';
        });
      }
    });

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
      const firstNameVal = firstNameInput ? firstNameInput.value.trim() : '';
      const lastNameVal = lastNameInput ? lastNameInput.value.trim() : '';
      const emailVal = emailInput ? emailInput.value.trim() : '';
      const passVal = passInput ? passInput.value : '';
      const roleVal = selectedRole || 'customer';

      const alphabetRegex = /^[A-Za-z]+$/;
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      let isValid = true;
      let firstInvalid = null;

      const firstError = document.getElementById('signin-firstname-error');
      const lastError = document.getElementById('signin-lastname-error');
      const emailError = document.getElementById('signin-email-error');
      const passError = document.getElementById('signin-password-error');

      // 1. First Name Validation (Alphabets only)
      if (firstNameInput) {
        if (!firstNameVal) {
          firstNameInput.classList.add('is-invalid');
          if (firstError) {
            firstError.textContent = 'Please enter your first name.';
            firstError.classList.add('show');
          }
          isValid = false;
          if (!firstInvalid) firstInvalid = firstNameInput;
        } else if (!alphabetRegex.test(firstNameVal)) {
          firstNameInput.classList.add('is-invalid');
          if (firstError) {
            firstError.textContent = 'First name should only accept alphabetic letters.';
            firstError.classList.add('show');
          }
          isValid = false;
          if (!firstInvalid) firstInvalid = firstNameInput;
        } else {
          firstNameInput.classList.remove('is-invalid');
          if (firstError) {
            firstError.textContent = '';
            firstError.classList.remove('show');
          }
        }
      }

      // 2. Last Name Validation (Alphabets only)
      if (lastNameInput) {
        if (!lastNameVal) {
          lastNameInput.classList.add('is-invalid');
          if (lastError) {
            lastError.textContent = 'Please enter your last name.';
            lastError.classList.add('show');
          }
          isValid = false;
          if (!firstInvalid) firstInvalid = lastNameInput;
        } else if (!alphabetRegex.test(lastNameVal)) {
          lastNameInput.classList.add('is-invalid');
          if (lastError) {
            lastError.textContent = 'Last name should only accept alphabetic letters.';
            lastError.classList.add('show');
          }
          isValid = false;
          if (!firstInvalid) firstInvalid = lastNameInput;
        } else {
          lastNameInput.classList.remove('is-invalid');
          if (lastError) {
            lastError.textContent = '';
            lastError.classList.remove('show');
          }
        }
      }

      // 3. Email Validation (Strict format)
      if (!emailVal) {
        if (emailInput) emailInput.classList.add('is-invalid');
        if (emailError) {
          emailError.textContent = 'Please enter your email address.';
          emailError.classList.add('show');
        }
        isValid = false;
        if (!firstInvalid && emailInput) firstInvalid = emailInput;
      } else if (!emailRegex.test(emailVal)) {
        if (emailInput) emailInput.classList.add('is-invalid');
        if (emailError) {
          emailError.textContent = 'Please enter a valid email address format (e.g. name@company.com).';
          emailError.classList.add('show');
        }
        isValid = false;
        if (!firstInvalid && emailInput) firstInvalid = emailInput;
      } else {
        if (emailInput) emailInput.classList.remove('is-invalid');
        if (emailError) {
          emailError.textContent = '';
          emailError.classList.remove('show');
        }
      }

      // 2. Password Validation
      if (!passVal) {
        if (passInput) passInput.classList.add('is-invalid');
        if (passError) {
          passError.textContent = 'Please enter your account password.';
          passError.classList.add('show');
        }
        isValid = false;
        if (!firstInvalid && passInput) firstInvalid = passInput;
      } else if (passVal.length < 4) {
        if (passInput) passInput.classList.add('is-invalid');
        if (passError) {
          passError.textContent = 'Password must be at least 4 characters.';
          passError.classList.add('show');
        }
        isValid = false;
        if (!firstInvalid && passInput) firstInvalid = passInput;
      } else {
        if (passInput) passInput.classList.remove('is-invalid');
        if (passError) {
          passError.textContent = '';
          passError.classList.remove('show');
        }
      }

      if (!isValid) {
        if (firstInvalid) {
          firstInvalid.focus();
          firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
        return;
      }

      const effectiveEmail = emailVal;
      const effectivePass = passVal;

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

    // Form-styled role selection
    const signupRoleRadios = document.querySelectorAll('input[name="signup_role_radio"]');
    const signupRoleCards = document.querySelectorAll('.form-role-card');
    const rolePills = document.querySelectorAll('.role-pill-btn');
    let selectedRole = 'customer';

    function updateSignupRoleSelection(role) {
      selectedRole = role;
      const roleInput = document.getElementById('signup-role');
      if (roleInput) roleInput.value = role;

      signupRoleCards.forEach(card => {
        const input = card.querySelector('input[type="radio"]');
        if (input && input.value === role) {
          card.style.borderColor = 'var(--accent)';
          card.style.backgroundColor = '#fff7ed';
          input.checked = true;
        } else if (input) {
          card.style.borderColor = '#cbd5e1';
          card.style.backgroundColor = '#fff';
        }
      });
    }

    signupRoleRadios.forEach(radio => {
      radio.addEventListener('change', () => {
        if (radio.checked) updateSignupRoleSelection(radio.value);
      });
    });

    signupRoleCards.forEach(card => {
      card.addEventListener('click', () => {
        const input = card.querySelector('input[type="radio"]');
        if (input) updateSignupRoleSelection(input.value);
      });
    });

    rolePills.forEach(btn => {
      btn.addEventListener('click', () => {
        rolePills.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        updateSignupRoleSelection(btn.getAttribute('data-role'));
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

      // Real-time restriction: First & Last Name ONLY accept alphabets
      [firstNameInput, lastNameInput].forEach(inp => {
        if (inp) {
          inp.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/[^A-Za-z]/g, '');
            clearFieldError(inp, `${inp.id}-error`);
          });
        }
      });

      // Real-time restriction: Phone number ONLY accepts up to 10 digits
      if (phoneInput) {
        phoneInput.addEventListener('input', (e) => {
          e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10);
          clearFieldError(phoneInput, 'signup-phone-error');
        });
      }

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

      const alphabetRegex = /^[A-Za-z]+$/;
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

      // 2. First Name (Alphabets only)
      const firstNameVal = firstNameInput ? firstNameInput.value.trim() : '';
      if (!firstNameVal) {
        setFieldError(firstNameInput, 'signup-firstname-error', 'First name is required.');
        isValid = false;
        if (!firstInvalid) firstInvalid = firstNameInput;
      } else if (!alphabetRegex.test(firstNameVal)) {
        setFieldError(firstNameInput, 'signup-firstname-error', 'First name should only accept alphabetic letters.');
        isValid = false;
        if (!firstInvalid) firstInvalid = firstNameInput;
      } else {
        clearFieldError(firstNameInput, 'signup-firstname-error');
      }

      // 3. Last Name (Alphabets only)
      const lastNameVal = lastNameInput ? lastNameInput.value.trim() : '';
      if (!lastNameVal) {
        setFieldError(lastNameInput, 'signup-lastname-error', 'Last name is required.');
        isValid = false;
        if (!firstInvalid) firstInvalid = lastNameInput;
      } else if (!alphabetRegex.test(lastNameVal)) {
        setFieldError(lastNameInput, 'signup-lastname-error', 'Last name should only accept alphabetic letters.');
        isValid = false;
        if (!firstInvalid) firstInvalid = lastNameInput;
      } else {
        clearFieldError(lastNameInput, 'signup-lastname-error');
      }

      // 4. Email Address (Strict valid format)
      const emailVal = emailInput ? emailInput.value.trim() : '';
      if (!emailVal || !emailRegex.test(emailVal)) {
        setFieldError(emailInput, 'signup-email-error', 'Please enter a valid email address format (e.g. name@company.com).');
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

      // 7. Phone Number (Exactly 10 digits)
      const phoneVal = phoneInput ? phoneInput.value.trim() : '';
      if (!phoneVal || !/^\d{10}$/.test(phoneVal)) {
        setFieldError(phoneInput, 'signup-phone-error', 'Mobile number must be exactly 10 digits.');
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
        if (firstInvalid) {
          firstInvalid.focus();
          firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
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

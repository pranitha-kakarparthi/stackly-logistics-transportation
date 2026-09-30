/**
 * Stackly Logistics & Transportation - Role-Specific Dashboard Engine
 * Adapts UI dynamically for:
 * 1. Customer (Tracking information, Order details, Delivery timeline, Support tickets)
 * 2. Admin (Logistics management, Fleet control, Freight dispatch, Warehouse analytics, System alerts)
 */

document.addEventListener('DOMContentLoaded', () => {
  const currentUser = window.StacklyAuth ? window.StacklyAuth.getCurrentUser() : null;
  if (!currentUser) return; // auth.js will redirect

  renderUserHeader(currentUser);
  renderRoleDashboard(currentUser);
});

/* ==========================================================================
   1. USER HEADER & GREETING
   ========================================================================== */
function renderUserHeader(user) {
  const greetingEl = document.getElementById('dash-greeting-text');
  const userNameEl = document.getElementById('dash-user-name');
  const userRoleEl = document.getElementById('dash-user-role');
  const userAvatarEl = document.getElementById('dash-user-avatar');
  const sessionStatusEl = document.getElementById('dash-session-status');

  const hour = new Date().getHours();
  let timeOfDay = 'Good morning';
  if (hour >= 12 && hour < 17) timeOfDay = 'Good afternoon';
  else if (hour >= 17 && hour < 21) timeOfDay = 'Good evening';
  else if (hour >= 21 || hour < 5) timeOfDay = 'Good night';

  if (greetingEl) {
    greetingEl.textContent = `${timeOfDay}, ${user.fullName || user.username}!`;
  }

  if (userNameEl) userNameEl.textContent = user.fullName || user.username;
  
  if (userRoleEl) {
    userRoleEl.textContent = user.role.toUpperCase();
    userRoleEl.className = `role-badge ${user.role}`;
  }

  if (userAvatarEl) {
    const initials = (user.firstName ? user.firstName[0] : user.username[0] || 'U') + 
                     (user.lastName ? user.lastName[0] : '');
    userAvatarEl.textContent = initials.toUpperCase();
  }

  if (sessionStatusEl) {
    const loginTime = user.lastLogin ? new Date(user.lastLogin).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Active now';
    sessionStatusEl.innerHTML = `Active Session &bull; Stackly Salem Node &bull; Logged in at ${loginTime}`;
  }
}

/* ==========================================================================
   2. ROLE-BASED DASHBOARD CONTENT INJECTION
   ========================================================================== */
function renderRoleDashboard(user) {
  const container = document.getElementById('role-dashboard-container');
  const sidebarNav = document.getElementById('dashboard-sidebar-nav');
  if (!container) return;

  if (user.role === 'admin') {
    renderAdminDashboard(container, sidebarNav, user);
  } else {
    renderCustomerDashboard(container, sidebarNav, user);
  }
}

/* ==========================================================================
   ADMIN DASHBOARD VIEW
   ========================================================================== */
function renderAdminDashboard(container, sidebarNav, user) {
  if (sidebarNav) {
    sidebarNav.innerHTML = `
      <button class="dashboard-nav-item active" data-tab="overview">
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
        Command Center
      </button>
      <button class="dashboard-nav-item" data-tab="fleet">
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/></svg>
        Fleet &amp; Dispatch
      </button>
      <button class="dashboard-nav-item" data-tab="cargo">
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
        Cargo Shipments
      </button>
      <button class="dashboard-nav-item" data-tab="warehousing">
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>
        Salem Hub Terminal
      </button>
    `;
  }

  container.innerHTML = `
    <!-- Top Action Bar with Go Back Button -->
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px;">
      <button class="btn-back" data-action="go-back">
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
        Go Back
      </button>
      <span class="status-badge status-in-transit">&bull; Live Stackly Dispatch Sync Active</span>
    </div>

    <!-- KPI Metrics -->
    <div class="kpi-grid">
      <div class="kpi-card">
        <div class="kpi-info">
          <h4>Active Fleet Units</h4>
          <div class="kpi-number">142 <span style="font-size:14px; font-weight:500; color:#64748b;">Vehicles</span></div>
          <div class="kpi-trend positive">&uarr; 94.2% Fleet Utilization</div>
        </div>
        <div class="kpi-icon">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"/></svg>
        </div>
      </div>

      <div class="kpi-card">
        <div class="kpi-info">
          <h4>Cargo In-Transit</h4>
          <div class="kpi-number">1,420 <span style="font-size:14px; font-weight:500; color:#64748b;">TEUs</span></div>
          <div class="kpi-trend positive">&uarr; +14.8% vs last month</div>
        </div>
        <div class="kpi-icon">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
        </div>
      </div>

      <div class="kpi-card">
        <div class="kpi-info">
          <h4>On-Time SLA Delivery</h4>
          <div class="kpi-number">99.1%</div>
          <div class="kpi-trend positive">&check; Industry leading benchmark</div>
        </div>
        <div class="kpi-icon">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        </div>
      </div>

      <div class="kpi-card">
        <div class="kpi-info">
          <h4>Monthly Freight Volume</h4>
          <div class="kpi-number">18,450 <span style="font-size:14px; font-weight:500; color:#64748b;">Tons</span></div>
          <div class="kpi-trend positive">&uarr; Stackly Salem Hub Growth</div>
        </div>
        <div class="kpi-icon">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
        </div>
      </div>
    </div>

    <!-- Active Freight Dispatch Operations Management -->
    <div class="dashboard-panel">
      <div class="panel-header">
        <div>
          <h3 class="panel-title">Active Freight Dispatch &amp; Operations Control</h3>
          <p style="font-size:13px; color:#64748b; margin-top:2px;">Real-time management of intermodal routes across Salem, Chennai Port, Dubai, Frankfurt, and Singapore.</p>
        </div>
        <span class="status-badge status-in-transit" style="font-size:11px;">Stackly Telematics</span>
      </div>

      <div class="data-table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>Tracking ID</th>
              <th>Origin Hub</th>
              <th>Destination</th>
              <th>Mode</th>
              <th>Driver / Carrier</th>
              <th>Weight / Cargo</th>
              <th>Operational Status</th>
              <th>Quick Action</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>#STK-88219</strong></td>
              <td>Frankfurt Cargo Port (FRA)</td>
              <td>Salem Central Hub, TN</td>
              <td>Air &amp; Road Express</td>
              <td>Capt. R. Werner (FL-772)</td>
              <td>420.5 kg (Electronics)</td>
              <td><span class="status-badge status-in-transit" id="status-88219">&bull; In Transit (Approaching Hub)</span></td>
              <td><button class="btn btn-outline btn-sm admin-toggle-status" data-target="status-88219">Advance Status</button></td>
            </tr>
            <tr>
              <td><strong>#STK-90432</strong></td>
              <td>Singapore Jurong Terminal</td>
              <td>Chennai Port &rarr; Salem</td>
              <td>Ocean Cargo (LCL)</td>
              <td>Ever Fortune (V-102)</td>
              <td>12,400 kg (Industrial Parts)</td>
              <td><span class="status-badge status-customs" id="status-90432">&bull; Customs Clearance</span></td>
              <td><button class="btn btn-outline btn-sm admin-toggle-status" data-target="status-90432">Clear Customs</button></td>
            </tr>
            <tr>
              <td><strong>#STK-77150</strong></td>
              <td>Salem Hub (MMR Complex)</td>
              <td>Bangalore Tech Park, KA</td>
              <td>Heavy Road Haulage</td>
              <td>M. Selvam (Truck #TN-54-9921)</td>
              <td>3,100 kg (Medical Devices)</td>
              <td><span class="status-badge status-delivered">&bull; Delivered &amp; Signed</span></td>
              <td><button class="btn btn-outline btn-sm" disabled style="opacity:0.6;">Completed</button></td>
            </tr>
            <tr>
              <td><strong>#STK-65912</strong></td>
              <td>Dubai Logistics City (DWC)</td>
              <td>Salem Central Hub, TN</td>
              <td>Air Freight Express</td>
              <td>Emirates SkyCargo 402</td>
              <td>890 kg (Automotive Spares)</td>
              <td><span class="status-badge status-pending" id="status-65912">&bull; Awaiting Warehouse Dispatch</span></td>
              <td><button class="btn btn-outline btn-sm admin-toggle-status" data-target="status-65912">Dispatch Now</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Warehouse & Logistics Hub Utilization -->
    <div class="grid-2">
      <div class="dashboard-panel">
        <h3 class="panel-title" style="margin-bottom:14px;">Salem Central Logistics Terminal Capacity</h3>
        <p style="font-size:13px; color:#64748b; margin-bottom:16px;">Stackly MMR Complex, Chinna Thirupathi Warehouse &amp; Cold Storage</p>
        
        <div style="margin-bottom:16px;">
          <div style="display:flex; justify-content:space-between; font-size:13px; font-weight:600; margin-bottom:6px;">
            <span>Cold-Chain Pharmaceutical Storage (2&deg;C - 8&deg;C)</span>
            <span>82% (4,100 / 5,000 cu.m)</span>
          </div>
          <div style="background:#e2e8f0; height:8px; border-radius:99px; overflow:hidden;">
            <div style="background:#2563eb; width:82%; height:100%;"></div>
          </div>
        </div>

        <div style="margin-bottom:16px;">
          <div style="display:flex; justify-content:space-between; font-size:13px; font-weight:600; margin-bottom:6px;">
            <span>General Dry Goods Bulk Storage</span>
            <span>67% (13,400 / 20,000 pallets)</span>
          </div>
          <div style="background:#e2e8f0; height:8px; border-radius:99px; overflow:hidden;">
            <div style="background:#059669; width:67%; height:100%;"></div>
          </div>
        </div>

        <div>
          <div style="display:flex; justify-content:space-between; font-size:13px; font-weight:600; margin-bottom:6px;">
            <span>Express Cross-Dock Staging Bays</span>
            <span>91% (29 / 32 Active Docks)</span>
          </div>
          <div style="background:#e2e8f0; height:8px; border-radius:99px; overflow:hidden;">
            <div style="background:#ff5e15; width:91%; height:100%;"></div>
          </div>
        </div>
      </div>

      <div class="dashboard-panel">
        <h3 class="panel-title" style="margin-bottom:14px;">Live Operations Notification Feed</h3>
        <div style="display:flex; flex-direction:column; gap:12px;">
          <div style="display:flex; gap:12px; font-size:13px; padding-bottom:10px; border-bottom:1px solid #f1f5f9;">
            <span style="color:#ff5e15; font-weight:700;">[DISPATCH]</span>
            <div>
              <p style="font-weight:600; color:#0f172a;">Fleet Convoy TN-54 departing Stackly Salem Hub towards Coimbatore.</p>
              <span style="color:#94a3b8; font-size:11px;">10 minutes ago</span>
            </div>
          </div>
          <div style="display:flex; gap:12px; font-size:13px; padding-bottom:10px; border-bottom:1px solid #f1f5f9;">
            <span style="color:#059669; font-weight:700;">[CUSTOMS]</span>
            <div>
              <p style="font-weight:600; color:#0f172a;">Shipment #STK-90432 pre-approved by Port Customs authority.</p>
              <span style="color:#94a3b8; font-size:11px;">40 minutes ago</span>
            </div>
          </div>
          <div style="display:flex; gap:12px; font-size:13px;">
            <span style="color:#2563eb; font-weight:700;">[TELEMETRY]</span>
            <div>
              <p style="font-weight:600; color:#0f172a;">Cold chain sensor telemetry active on Truck Bay #04 (Temp steady: 4.1&deg;C).</p>
              <span style="color:#94a3b8; font-size:11px;">1 hour ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Attach status toggle interactivity for admin
  const toggleBtns = container.querySelectorAll('.admin-toggle-status');
  toggleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      const badge = document.getElementById(targetId);
      if (badge) {
        badge.className = 'status-badge status-delivered';
        badge.innerHTML = '&bull; Delivered &amp; Closed';
        btn.textContent = 'Completed';
        btn.disabled = true;
        btn.style.opacity = '0.6';
      }
    });
  });
}

/* ==========================================================================
   CUSTOMER DASHBOARD VIEW
   ========================================================================== */
function renderCustomerDashboard(container, sidebarNav, user) {
  if (sidebarNav) {
    sidebarNav.innerHTML = `
      <button class="dashboard-nav-item active" data-tab="tracking">
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
        Live Tracking
      </button>
      <button class="dashboard-nav-item" data-tab="orders">
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
        My Shipments
      </button>
      <button class="dashboard-nav-item" data-tab="quotes">
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        Billing &amp; Invoices
      </button>
      <button class="dashboard-nav-item" data-tab="support">
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/></svg>
        Help &amp; Support
      </button>
    `;
  }

  container.innerHTML = `
    <!-- Top Action Bar with Go Back Button -->
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:24px;">
      <button class="btn-back" data-action="go-back">
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
        Go Back
      </button>
      <span class="status-badge status-in-transit">&bull; Client Tracking Hub Active</span>
    </div>

    <!-- Customer Quick Stat Cards -->
    <div class="kpi-grid">
      <div class="kpi-card">
        <div class="kpi-info">
          <h4>Active In-Transit</h4>
          <div class="kpi-number">2 <span style="font-size:14px; font-weight:500; color:#64748b;">Packages</span></div>
          <div class="kpi-trend positive">Arriving in 36-48 Hours</div>
        </div>
        <div class="kpi-icon">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"/></svg>
        </div>
      </div>

      <div class="kpi-card">
        <div class="kpi-info">
          <h4>Delivered Total</h4>
          <div class="kpi-number">14 <span style="font-size:14px; font-weight:500; color:#64748b;">Orders</span></div>
          <div class="kpi-trend positive">&check; 100% On-Time SLA</div>
        </div>
        <div class="kpi-icon">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        </div>
      </div>

      <div class="kpi-card">
        <div class="kpi-info">
          <h4>Total Weight Moved</h4>
          <div class="kpi-number">420.5 <span style="font-size:14px; font-weight:500; color:#64748b;">KG</span></div>
          <div class="kpi-trend positive">Air &amp; Road Express</div>
        </div>
        <div class="kpi-icon">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"/></svg>
        </div>
      </div>

      <div class="kpi-card">
        <div class="kpi-info">
          <h4>Carbon Offset Credits</h4>
          <div class="kpi-number">850 <span style="font-size:14px; font-weight:500; color:#64748b;">PTS</span></div>
          <div class="kpi-trend positive">&hearts; Eco-Green Logistics</div>
        </div>
        <div class="kpi-icon">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        </div>
      </div>
    </div>

    <!-- Active Live Shipment Timeline for Customer -->
    <div class="dashboard-panel">
      <div class="panel-header">
        <div>
          <h3 class="panel-title">Active Live Shipment &bull; Waybill #STK-88219</h3>
          <p style="font-size:13px; color:#64748b;">Frankfurt International Cargo Hub &rarr; Stackly Salem Central Terminal</p>
        </div>
        <span class="status-badge status-in-transit">Arriving in 36 Hours</span>
      </div>

      <!-- Stepper Visual -->
      <div class="tracking-stepper">
        <div class="step-node completed">
          <div class="step-circle">&check;</div>
          <div>
            <div class="step-title">Order Picked Up</div>
            <div class="step-time">Frankfurt &bull; Sep 28, 08:30</div>
          </div>
        </div>
        <div class="step-node completed">
          <div class="step-circle">&check;</div>
          <div>
            <div class="step-title">Customs Cleared</div>
            <div class="step-time">FRA Cargo &bull; Sep 29, 14:15</div>
          </div>
        </div>
        <div class="step-node active">
          <div class="step-circle">3</div>
          <div>
            <div class="step-title">In-Flight / Transit</div>
            <div class="step-time">En Route to Chennai &bull; Live</div>
          </div>
        </div>
        <div class="step-node">
          <div class="step-circle">4</div>
          <div>
            <div class="step-title">Salem Hub Dispatch</div>
            <div class="step-time">MMR Complex &bull; Expected Oct 02</div>
          </div>
        </div>
        <div class="step-node">
          <div class="step-circle">5</div>
          <div>
            <div class="step-title">Final Delivery</div>
            <div class="step-time">Delivered to Door &bull; Oct 03</div>
          </div>
        </div>
      </div>

      <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:16px; background:#f8fafc; padding:18px; border-radius:8px; margin-top:24px; border:1px solid #e2e8f0; font-size:13px;">
        <div>
          <span style="color:#64748b; display:block;">Service Category</span>
          <strong style="color:#0f172a;">Global Air Priority</strong>
        </div>
        <div>
          <span style="color:#64748b; display:block;">Gross Weight &amp; Vol</span>
          <strong style="color:#0f172a;">420.5 KG (3 Pallets)</strong>
        </div>
        <div>
          <span style="color:#64748b; display:block;">Destination Address</span>
          <strong style="color:#0f172a;">Salem Industrial Park, TN</strong>
        </div>
        <div>
          <span style="color:#64748b; display:block;">Security Insurance</span>
          <strong style="color:#059669;">100% Full Cover (Tier 1)</strong>
        </div>
      </div>
    </div>

    <!-- Customer Order History Table -->
    <div class="dashboard-panel">
      <div class="panel-header">
        <h3 class="panel-title">My Orders &amp; Shipment History</h3>
        <button class="btn btn-outline btn-sm" id="customer-refresh-btn">Refresh Records</button>
      </div>

      <div class="data-table-wrapper">
        <table class="data-table">
          <thead>
            <tr>
              <th>Tracking ID</th>
              <th>Order Date</th>
              <th>Origin</th>
              <th>Destination</th>
              <th>Carrier Mode</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>#STK-88219</strong></td>
              <td>Sep 28, 2026</td>
              <td>Frankfurt, Germany</td>
              <td>Salem, India</td>
              <td>Air Express</td>
              <td><span class="status-badge status-in-transit">&bull; In Transit</span></td>
              <td><a href="../pages/tracking.html" class="btn btn-accent btn-sm">Track Live</a></td>
            </tr>
            <tr>
              <td><strong>#STK-77150</strong></td>
              <td>Sep 14, 2026</td>
              <td>Singapore</td>
              <td>Salem, India</td>
              <td>Sea Cargo</td>
              <td><span class="status-badge status-delivered">&bull; Delivered</span></td>
              <td><button class="btn btn-outline btn-sm" style="color:#64748b;">View Waybill</button></td>
            </tr>
            <tr>
              <td><strong>#STK-64011</strong></td>
              <td>Aug 30, 2026</td>
              <td>Dubai, UAE</td>
              <td>Salem, India</td>
              <td>Air Freight</td>
              <td><span class="status-badge status-delivered">&bull; Delivered</span></td>
              <td><button class="btn btn-outline btn-sm" style="color:#64748b;">View Waybill</button></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Customer Support Ticket Form -->
    <div class="dashboard-panel">
      <h3 class="panel-title" style="margin-bottom:8px;">Raise a Logistics Support Ticket</h3>
      <p style="font-size:13px; color:#64748b; margin-bottom:20px;">Dedicated assistance for Salem hub deliveries, customs documentation, or rescheduled drop-offs.</p>

      <form id="customer-ticket-form">
        <div class="grid-2">
          <div class="form-group">
            <label class="form-label">Related Shipment ID</label>
            <select class="form-select" id="ticket-shipment">
              <option value="STK-88219">#STK-88219 (Frankfurt &rarr; Salem)</option>
              <option value="STK-77150">#STK-77150 (Singapore &rarr; Salem)</option>
              <option value="general">General Logistics Inquiry</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Query Subject</label>
            <input type="text" class="form-input" id="ticket-subject" placeholder="e.g., Gate delivery instruction or delivery rescheduling" required>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Details / Instructions</label>
          <textarea class="form-textarea" id="ticket-message" rows="3" placeholder="Provide any special instructions for Salem delivery drivers..." required></textarea>
        </div>
        <button type="submit" class="btn btn-primary">Submit Ticket to Operations Desk</button>
        <div id="ticket-success-msg" class="alert alert-success" style="display:none; margin-top:14px;">
          &check; Ticket submitted successfully! Our dispatch manager at Stackly Salem Hub will contact you shortly.
        </div>
      </form>
    </div>
  `;

  const ticketForm = container.querySelector('#customer-ticket-form');
  if (ticketForm) {
    ticketForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const successMsg = container.querySelector('#ticket-success-msg');
      if (successMsg) {
        successMsg.style.display = 'flex';
        ticketForm.reset();
      }
    });
  }
}

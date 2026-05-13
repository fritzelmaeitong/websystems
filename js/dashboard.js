async function loadDashboard() {
  const urlParams = new URLSearchParams(window.location.search);
  const role = urlParams.get('role');
  const username = urlParams.get('username');
  const currentUser = getCurrentUser();

  if (!currentUser || currentUser.role !== role || currentUser.username !== username) {
    alert('Session invalid. Please login again.');
    window.location.href = 'index.html';
    return;
  }

  document.querySelector('.container')?.classList.add('dashboard-container');

  const welcomeEl = document.getElementById('welcome');
  if (role === 'resident') {
    welcomeEl.textContent = `Welcome ${currentUser.firstName} ${currentUser.lastName}!`;
    const content = document.querySelector('.dashboard-content');
    content.innerHTML = `
      <h3>Resident Dashboard</h3>
      <button class="blotter-btn" onclick="showBlotterStep1()">File Blotter Report</button>
      <div id="blotter-steps" class="step-container"></div>
      <div class="my-reports-section">
        <h4>My Submitted Reports</h4>
        <div id="resident-reports" class="admin-reports"></div>
      </div>
      <button onclick="logout()" class="logout-btn">Logout</button>
    `;
    await renderResidentReports(currentUser.username);
    return;
  }

  if (role === 'admin') {
    welcomeEl.textContent = 'Welcome Admin!';
    await loadAdminDashboard();
  }
}

async function loadAdminDashboard() {
  const content = document.querySelector('.dashboard-content');
  content.innerHTML = `
    <h3>Admin Dashboard</h3>
    <h4>Blotter Reports</h4>
    <div id="admin-reports" class="admin-reports"></div>
    <button onclick="logout()">Logout</button>
  `;
  await renderAdminReports();
}

function formatDate(dateStr) {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function logout() {
  showLogoutConfirmation();
}

window.loadDashboard = loadDashboard;
window.loadAdminDashboard = loadAdminDashboard;
window.formatDate = formatDate;
window.logout = logout;

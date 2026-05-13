document.addEventListener('DOMContentLoaded', async function () {
  initUsers();
  initBlotterReports();

  const loginForm = document.getElementById('loginForm');
  if (loginForm) loginForm.addEventListener('submit', handleLogin);

  const regForm = document.getElementById('regForm');
  if (regForm) regForm.addEventListener('submit', handleRegister);

  if (document.getElementById('welcome')) {
    await loadDashboard();
  }
});

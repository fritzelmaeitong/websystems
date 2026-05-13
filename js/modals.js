function showConfirmationModal() {
  let modal = document.getElementById('confirmation-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'confirmation-modal';
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-content">
        <h3>Confirm Submission</h3>
        <p>Are you sure you want to submit this blotter report?</p>
        <div class="modal-actions">
          <button onclick="confirmBlotterSubmit()">Yes, Submit</button>
          <button class="back-btn" onclick="closeConfirmationModal()">Cancel</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }
  modal.classList.add('active');
}

function closeConfirmationModal() {
  const modal = document.getElementById('confirmation-modal');
  if (modal) modal.classList.remove('active');
}

function showLogoutConfirmation() {
  let modal = document.getElementById('logout-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'logout-modal';
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-content">
        <h3>Confirm Logout</h3>
        <p>Are you sure you want to log out?</p>
        <div class="modal-actions">
          <button onclick="confirmLogout()">Yes</button>
          <button class="back-btn" onclick="closeLogoutModal()">No</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }
  modal.classList.add('active');
}

function closeLogoutModal() {
  const modal = document.getElementById('logout-modal');
  if (modal) modal.classList.remove('active');
}

function confirmLogout() {
  clearCurrentUser();
  window.location.href = 'index.html';
}

window.showConfirmationModal = showConfirmationModal;
window.closeConfirmationModal = closeConfirmationModal;
window.showLogoutConfirmation = showLogoutConfirmation;
window.closeLogoutModal = closeLogoutModal;
window.confirmLogout = confirmLogout;

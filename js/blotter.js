let currentNumPersons = 0;
let pendingReport = null;

function showBlotterStep1() {
  const stepsEl = document.getElementById('blotter-steps');
  stepsEl.innerHTML = `
    <div class="step-container active">
      <h4>Step 1: Number of Persons Involved</h4>
      <label for="num-persons">Enter number:</label>
      <input type="number" id="num-persons" min="1" max="10" value="1">
      <button onclick="showPersonForms()">Next</button>
      <button class="back-btn" onclick="resetBlotter()">Back</button>
    </div>
  `;
  stepsEl.classList.add('active');
}

function showPersonForms() {
  const num = parseInt(document.getElementById('num-persons').value, 10) || 1;
  if (num < 1 || num > 10) {
    alert('Enter 1-10 persons.');
    return;
  }

  currentNumPersons = num;
  let formsHtml = '';

  for (let i = 1; i <= num; i++) {
    formsHtml += `
      <div class="person-card">
        <div class="person-header">Person ${i}</div>
        <form class="person-form">
          <div>
            <label>Last Name</label>
            <input type="text" name="lastName${i}">
          </div>
          <div>
            <label>First Name</label>
            <input type="text" name="firstName${i}">
          </div>
          <div>
            <label>Age</label>
            <input type="number" name="age${i}" min="1" max="120">
          </div>
          <div>
            <label>Purok</label>
            <input type="text" name="purok${i}">
          </div>
          <div>
            <label>Incident Type</label>
            <select name="incidentType${i}" onchange="toggleOthersInput(this, ${i})">
              <option>Theft</option>
              <option>Assault</option>
              <option>Complaint</option>
              <option>Others</option>
            </select>
          </div>
          <div id="others-container-${i}" style="display: none; transition: opacity 0.3s ease; opacity: 0;">
            <label>Please specify</label>
            <input type="text" name="incidentTypeOthers${i}">
          </div>
          <div>
            <label>Date of Incident</label>
            <input type="date" name="date${i}">
          </div>
          <div class="full-width">
            <label>Incident Description</label>
            <textarea name="description${i}" placeholder="Describe the incident..."></textarea>
          </div>
        </form>
      </div>
    `;
  }

  const stepsEl = document.getElementById('blotter-steps');
  stepsEl.innerHTML = `
    <div class="step-container active">
      ${formsHtml}
      <button class="submit-all-btn" onclick="handleBlotterSubmit()">Submit All Reports</button>
      <button class="back-btn" onclick="showBlotterStep1()">Back</button>
    </div>
  `;
}

function toggleOthersInput(select, index) {
  const container = document.getElementById(`others-container-${index}`);
  const input = document.querySelector(`[name="incidentTypeOthers${index}"]`);

  if (select.value === 'Others') {
    container.style.display = 'block';
    setTimeout(() => {
      container.style.opacity = '1';
    }, 10);
    input.required = true;
    return;
  }

  container.style.opacity = '0';
  setTimeout(() => {
    container.style.display = 'none';
  }, 300);
  input.required = false;
  input.value = '';
}

function handleBlotterSubmit() {
  const currentUser = getCurrentUser();
  const report = {
    residentUsername: currentUser.username,
    timestamp: new Date().toISOString(),
    numPersons: currentNumPersons,
    persons: []
  };

  let allValid = true;

  for (let i = 1; i <= currentNumPersons; i++) {
    const baseType = document.querySelector(`[name="incidentType${i}"]`).value;
    const finalType = baseType === 'Others'
      ? document.querySelector(`[name="incidentTypeOthers${i}"]`).value.trim()
      : baseType;

    const person = {
      lastName: document.querySelector(`[name="lastName${i}"]`).value.trim(),
      firstName: document.querySelector(`[name="firstName${i}"]`).value.trim(),
      age: document.querySelector(`[name="age${i}"]`).value,
      purok: document.querySelector(`[name="purok${i}"]`).value.trim(),
      incidentType: finalType,
      date: document.querySelector(`[name="date${i}"]`).value,
      description: document.querySelector(`[name="description${i}"]`).value.trim()
    };

    if (!person.lastName || !person.firstName || !person.description || !person.incidentType) {
      allValid = false;
      break;
    }

    report.persons.push(person);
  }

  if (!allValid) {
    alert('Please fill all required fields for every person.');
    return;
  }

  pendingReport = report;
  showConfirmationModal();
}

async function confirmBlotterSubmit() {
  if (!pendingReport) return;

  try {
    await saveBlotterReport(pendingReport);
    closeConfirmationModal();

    const currentUser = getCurrentUser();
    if (currentUser && document.getElementById('resident-reports')) {
      await renderResidentReports(currentUser.username);
    }

    let summary = '<h4>Summary:</h4><ul class="summary-list">';
    pendingReport.persons.forEach((person, idx) => {
      summary += `<li><strong>Person ${idx + 1}:</strong> ${person.firstName} ${person.lastName}, ${person.incidentType}, ${person.date}</li>`;
    });
    summary += '</ul>';

    const stepsEl = document.getElementById('blotter-steps');
    stepsEl.innerHTML = `
      <div class="confirmation">
        <h4>Blotter report submitted successfully!</h4>
        ${summary}
        <button class="blotter-btn" onclick="resetBlotter()">File Another Report</button>
        <button onclick="loadDashboard()">Back to Dashboard</button>
      </div>
    `;
    pendingReport = null;
  } catch (error) {
    console.error(error);
    alert('Unable to submit report. Check your Supabase settings.');
  }
}

function resetBlotter() {
  document.getElementById('blotter-steps').innerHTML = '';
}

async function renderResidentReports(username) {
  const container = document.getElementById('resident-reports');
  if (!container) return;

  try {
    const reports = await getBlotterReports();
    const userReports = reports.filter((report) => report.residentUsername === username);

    if (userReports.length === 0) {
      container.innerHTML = '<p style="color: #718096; font-style: italic;">No submitted reports yet.</p>';
      return;
    }

    let html = '';
    userReports.forEach((report) => {
      report.persons.forEach((person) => {
        const status = person.status || 'pending';
        const badgeClass = `status-${status}`;
        const badgeText = status.charAt(0).toUpperCase() + status.slice(1);
        let detailHtml = '';

        if (status === 'accepted') {
          detailHtml = `
            <div class="status-detail accepted">
              <strong>Action:</strong> Scheduled on ${formatDate(person.scheduleDate)} at ${person.scheduleTime}
              <p style="margin-top: 0.5rem;"><strong>Admin Remarks:</strong> ${person.adminResponse || 'N/A'}</p>
            </div>
          `;
        } else if (status === 'rejected') {
          detailHtml = `<div class="status-detail rejected"><strong>Reason:</strong> ${person.rejectReason}</div>`;
        } else {
          detailHtml = '<div class="status-detail pending"><em>Status: Under review by admin.</em></div>';
        }

        html += `
          <div class="report-card">
            <div class="report-header">
              <strong>${person.firstName} ${person.lastName}</strong>
              <span class="status-badge ${badgeClass}">${badgeText}</span>
            </div>
            <p><strong>Incident:</strong> ${person.incidentType}</p>
            <p><strong>Date:</strong> ${formatDate(person.date)}</p>
            <p><strong>Description:</strong> ${person.description}</p>
            ${detailHtml}
          </div>
        `;
      });
    });

    container.innerHTML = html;
  } catch (error) {
    console.error(error);
    container.innerHTML = '<p>Unable to load reports. Check your Supabase settings.</p>';
  }
}

window.showBlotterStep1 = showBlotterStep1;
window.showPersonForms = showPersonForms;
window.toggleOthersInput = toggleOthersInput;
window.handleBlotterSubmit = handleBlotterSubmit;
window.confirmBlotterSubmit = confirmBlotterSubmit;
window.resetBlotter = resetBlotter;
window.renderResidentReports = renderResidentReports;

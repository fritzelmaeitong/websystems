let currentOpenAction = null;

async function renderAdminReports() {
  const container = document.getElementById('admin-reports');
  if (!container) return;

  try {
    const reports = await getBlotterReports();
    if (reports.length === 0) {
      container.innerHTML = '<p>No blotter reports yet.</p>';
      return;
    }

    let html = '';
    reports.forEach((report, reportIdx) => {
      report.persons.forEach((person, personIdx) => {
        const id = `${reportIdx}-${personIdx}`;
        const status = person.status || 'pending';
        const badgeClass = `status-${status}`;
        const badgeText = status.charAt(0).toUpperCase() + status.slice(1);
        let actionHtml = '';

        if (status === 'pending') {
          actionHtml = `
            <div class="action-buttons">
              <button class="action-btn accept-btn" onclick="openAcceptForm('${id}')">Accept</button>
              <button class="action-btn reject-btn" onclick="openRejectForm('${id}')">Reject</button>
            </div>
            <div id="accept-${id}" class="action-section"></div>
            <div id="reject-${id}" class="action-section"></div>
          `;
        } else {
          let detailHtml = '';
          if (status === 'accepted' && person.scheduleDate && person.scheduleTime) {
            detailHtml = `
              <p><strong>Scheduled:</strong> ${formatDate(person.scheduleDate)} at ${person.scheduleTime}</p>
              <p><strong>Remarks:</strong> ${person.adminResponse || 'N/A'}</p>
            `;
          } else if (status === 'rejected' && person.rejectReason) {
            detailHtml = `<p><strong>Reason:</strong> ${person.rejectReason}</p>`;
          }
          actionHtml = `<div class="status-badge ${badgeClass}">${badgeText}</div>${detailHtml}`;
        }

        html += `
          <div class="report-card">
            <div class="report-header">
              <strong>${person.firstName} ${person.lastName}</strong>
              <span class="status-badge ${badgeClass}">${badgeText}</span>
            </div>
            <p><strong>Age:</strong> ${person.age || 'N/A'}</p>
            <p><strong>Purok:</strong> ${person.purok || 'N/A'}</p>
            <p><strong>Incident Type:</strong> ${person.incidentType}</p>
            <p><strong>Date:</strong> ${formatDate(person.date)}</p>
            <p><strong>Description:</strong> ${person.description}</p>
            ${actionHtml}
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

function openAcceptForm(id) {
  closeCurrentAction();
  currentOpenAction = `accept-${id}`;
  const section = document.getElementById(currentOpenAction);
  section.innerHTML = `
    <div class="schedule-form">
      <label>Schedule of Action (Date & Time)</label>
      <input type="date" id="accept-date-${id}">
      <label>Time</label>
      <input type="time" id="accept-time-${id}" class="time-input">
      <label>Admin Response / Action Taken</label>
      <textarea id="accept-response-${id}" class="reason-textarea" placeholder="Enter instructions or action taken..."></textarea>
      <button onclick="submitAccept('${id}')">Submit</button>
      <button class="back-btn" onclick="closeCurrentAction()">Cancel</button>
    </div>
  `;
  section.classList.add('active');
}

function openRejectForm(id) {
  closeCurrentAction();
  currentOpenAction = `reject-${id}`;
  const section = document.getElementById(currentOpenAction);
  section.innerHTML = `
    <div class="schedule-form">
      <label>Reason for Rejection</label>
      <textarea id="reject-reason-${id}" class="reason-textarea" placeholder="Enter reason..."></textarea>
      <button onclick="submitReject('${id}')">Submit</button>
      <button class="back-btn" onclick="closeCurrentAction()">Cancel</button>
    </div>
  `;
  section.classList.add('active');
}

function closeCurrentAction() {
  if (currentOpenAction) {
    const section = document.getElementById(currentOpenAction);
    if (section) section.classList.remove('active');
    currentOpenAction = null;
  }
}

async function submitAccept(id) {
  const [reportIdx, personIdx] = id.split('-').map(Number);
  const reports = await getBlotterReports();
  const date = document.getElementById(`accept-date-${id}`).value;
  const time = document.getElementById(`accept-time-${id}`).value;
  const response = document.getElementById(`accept-response-${id}`).value.trim();

  if (!date || !time || !response) {
    alert('Please fill in the schedule and action taken details.');
    return;
  }

  reports[reportIdx].persons[personIdx].status = 'accepted';
  reports[reportIdx].persons[personIdx].scheduleDate = date;
  reports[reportIdx].persons[personIdx].scheduleTime = time;
  reports[reportIdx].persons[personIdx].adminResponse = response;

  try {
    await saveAllBlotterReports(reports);
    alert('Report accepted successfully!');
    await renderAdminReports();
    closeCurrentAction();
  } catch (error) {
    console.error(error);
    alert('Unable to accept report. Check your Supabase settings.');
  }
}

async function submitReject(id) {
  const [reportIdx, personIdx] = id.split('-').map(Number);
  const reason = document.getElementById(`reject-reason-${id}`).value.trim();

  if (!reason) {
    alert('Please enter rejection reason.');
    return;
  }

  const reports = await getBlotterReports();
  reports[reportIdx].persons[personIdx].status = 'rejected';
  reports[reportIdx].persons[personIdx].rejectReason = reason;

  try {
    await saveAllBlotterReports(reports);
    alert('Report rejected.');
    await renderAdminReports();
    closeCurrentAction();
  } catch (error) {
    console.error(error);
    alert('Unable to reject report. Check your Supabase settings.');
  }
}

window.renderAdminReports = renderAdminReports;
window.openAcceptForm = openAcceptForm;
window.openRejectForm = openRejectForm;
window.closeCurrentAction = closeCurrentAction;
window.submitAccept = submitAccept;
window.submitReject = submitReject;

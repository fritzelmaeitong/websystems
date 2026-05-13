const STORAGE_KEYS = {
  users: 'users',
  reports: 'blotterReports',
  currentUser: 'currentUser'
};

function initUsers() {
  if (!localStorage.getItem(STORAGE_KEYS.users)) {
    localStorage.setItem(STORAGE_KEYS.users, JSON.stringify([]));
  }
}

function initBlotterReports() {
  if (!localStorage.getItem(STORAGE_KEYS.reports)) {
    localStorage.setItem(STORAGE_KEYS.reports, JSON.stringify([]));
  }
}

function getLocalUsers() {
  initUsers();
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.users));
}

function getLocalReports() {
  initBlotterReports();
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.reports));
}

async function getUsers() {
  if (!window.isSupabaseReady()) return getLocalUsers();

  const { data, error } = await window.supabaseClient
    .from('profiles')
    .select('first_name,last_name,username,password')
    .order('created_at', { ascending: true });

  if (error) throw error;

  return data.map((user) => ({
    firstName: user.first_name,
    lastName: user.last_name,
    username: user.username,
    password: user.password
  }));
}

async function saveUser(user) {
  if (!window.isSupabaseReady()) {
    const users = getLocalUsers();
    users.push(user);
    localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users));
    return;
  }

  const { error } = await window.supabaseClient.from('profiles').insert({
    first_name: user.firstName,
    last_name: user.lastName,
    username: user.username,
    password: user.password
  });

  if (error) throw error;
}

async function findUser(username) {
  if (!window.isSupabaseReady()) {
    return getLocalUsers().find((user) => user.username === username);
  }

  const { data, error } = await window.supabaseClient
    .from('profiles')
    .select('first_name,last_name,username,password')
    .eq('username', username)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return {
    firstName: data.first_name,
    lastName: data.last_name,
    username: data.username,
    password: data.password
  };
}

async function getBlotterReports() {
  if (!window.isSupabaseReady()) return getLocalReports();

  const { data, error } = await window.supabaseClient
    .from('blotter_reports')
    .select('id,resident_username,report_data,created_at')
    .order('created_at', { ascending: true });

  if (error) throw error;

  return data.map((row) => ({
    ...row.report_data,
    _id: row.id,
    residentUsername: row.resident_username || row.report_data.residentUsername
  }));
}

async function saveBlotterReport(report) {
  if (!window.isSupabaseReady()) {
    const reports = getLocalReports();
    reports.push(report);
    localStorage.setItem(STORAGE_KEYS.reports, JSON.stringify(reports));
    return;
  }

  const { error } = await window.supabaseClient.from('blotter_reports').insert({
    resident_username: report.residentUsername,
    report_data: report
  });

  if (error) throw error;
}

async function saveAllBlotterReports(reports) {
  if (!window.isSupabaseReady()) {
    localStorage.setItem(STORAGE_KEYS.reports, JSON.stringify(reports));
    return;
  }

  await Promise.all(reports.map(async (report) => {
    if (!report._id) return;

    const { _id, ...reportData } = report;
    const { error } = await window.supabaseClient
      .from('blotter_reports')
      .update({ report_data: reportData, resident_username: report.residentUsername })
      .eq('id', _id);

    if (error) throw error;
  }));
}

function getCurrentUser() {
  return JSON.parse(localStorage.getItem(STORAGE_KEYS.currentUser));
}

function setCurrentUser(user) {
  localStorage.setItem(STORAGE_KEYS.currentUser, JSON.stringify(user));
}

function clearCurrentUser() {
  localStorage.removeItem(STORAGE_KEYS.currentUser);
}

window.initUsers = initUsers;
window.initBlotterReports = initBlotterReports;
window.getUsers = getUsers;
window.saveUser = saveUser;
window.findUser = findUser;
window.getBlotterReports = getBlotterReports;
window.saveBlotterReport = saveBlotterReport;
window.saveAllBlotterReports = saveAllBlotterReports;
window.getCurrentUser = getCurrentUser;
window.setCurrentUser = setCurrentUser;
window.clearCurrentUser = clearCurrentUser;

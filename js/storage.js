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

function shouldUseLocalStorage() {
  return !window.isSupabaseConfigured || !window.isSupabaseConfigured();
}

function ensureSupabaseReady() {
  if (!window.isSupabaseReady || !window.isSupabaseReady()) {
    throw new Error(window.getSupabaseStatusMessage ? window.getSupabaseStatusMessage() : 'Supabase is not ready.');
  }
}

async function getUsers() {
  if (shouldUseLocalStorage()) return getLocalUsers();
  ensureSupabaseReady();

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
  if (shouldUseLocalStorage()) {
    const users = getLocalUsers();
    users.push(user);
    localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users));
    return;
  }

  ensureSupabaseReady();

  const { error } = await window.supabaseClient.from('profiles').insert({
    first_name: user.firstName,
    last_name: user.lastName,
    username: user.username,
    password: user.password
  });

  if (error) throw error;
}

async function findUser(username) {
  if (shouldUseLocalStorage()) {
    return getLocalUsers().find((user) => user.username === username);
  }
  ensureSupabaseReady();

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
  if (shouldUseLocalStorage()) return getLocalReports();
  ensureSupabaseReady();

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
  if (shouldUseLocalStorage()) {
    const reports = getLocalReports();
    reports.push(report);
    localStorage.setItem(STORAGE_KEYS.reports, JSON.stringify(reports));
    return;
  }

  ensureSupabaseReady();

  const { data, error } = await window.supabaseClient.from('blotter_reports').insert({
    resident_username: report.residentUsername,
    report_data: report
  }).select('id').single();

  if (error) throw error;
  return data?.id;
}

async function saveAllBlotterReports(reports) {
  if (shouldUseLocalStorage()) {
    localStorage.setItem(STORAGE_KEYS.reports, JSON.stringify(reports));
    return;
  }
  ensureSupabaseReady();

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

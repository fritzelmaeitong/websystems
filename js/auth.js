async function handleLogin(event) {
  event.preventDefault();

  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;
  const role = document.querySelector('input[name="role"]:checked')?.value;

  if (!role) {
    alert('Please select a role: Admin or Resident.');
    return;
  }

  let userData = null;

  try {
    if (role === 'admin') {
      if (username !== 'admin' || password !== '123456') {
        alert('Invalid admin credentials. Username: admin, Password: 123456');
        return;
      }
      userData = { role: 'admin', username: 'admin', firstName: 'Admin', lastName: '' };
    }

    if (role === 'resident') {
      const user = await findUser(username);
      if (!user || user.password !== password) {
        alert('Invalid username or password for resident.');
        return;
      }
      userData = { role: 'resident', username, firstName: user.firstName, lastName: user.lastName };
    }

    setCurrentUser(userData);
    window.location.href = `dashboard.html?role=${userData.role}&username=${userData.username}`;
  } catch (error) {
    console.error(error);
    alert('Login failed. Check your Supabase settings or try again.');
  }
}

async function handleRegister(event) {
  event.preventDefault();

  const firstName = document.getElementById('firstName').value.trim();
  const lastName = document.getElementById('lastName').value.trim();
  const username = document.getElementById('regUsername').value.trim();
  const password = document.getElementById('regPassword').value;

  if (!firstName || !lastName || !username || !password) {
    alert('Please fill all fields.');
    return;
  }

  try {
    const users = await getUsers();
    if (users.find((user) => user.username === username)) {
      alert('Username already exists. Choose another.');
      return;
    }

    await saveUser({ firstName, lastName, username, password });
    alert('Registration successful! You can now login.');
    window.location.href = 'index.html';
  } catch (error) {
    console.error(error);
    alert('Registration failed. Check your Supabase settings or try again.');
  }
}

window.handleLogin = handleLogin;
window.handleRegister = handleRegister;

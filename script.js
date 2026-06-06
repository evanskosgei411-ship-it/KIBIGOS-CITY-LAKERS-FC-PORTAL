const uploadButtons = document.querySelectorAll('.upload-btn');
const imageInputs = document.querySelectorAll('.image-input');
const messageButtons = document.querySelectorAll('.message-btn');
const playerSelect = document.getElementById('message-player');
const messageForm = document.getElementById('message-form');
const messageResult = document.getElementById('message-result');
const adminForm = document.getElementById('admin-form');
const adminStatus = document.getElementById('admin-status');
const adminActions = document.getElementById('admin-actions');
const adminLogout = document.getElementById('admin-logout');
const adminAboutForm = document.getElementById('admin-about-form');
const adminAboutStatus = document.getElementById('admin-about-status');
const adminAboutText = document.getElementById('admin-about-text');
const adminAboutLocation = document.getElementById('admin-about-location');
const adminPlayerForm = document.getElementById('admin-player-form');
const adminPlayerSelect = document.getElementById('admin-player-select');
const adminPlayerName = document.getElementById('admin-player-name');
const adminPlayerPosition = document.getElementById('admin-player-position');
const adminPlayerEmail = document.getElementById('admin-player-email');
const adminPlayerStatusInput = document.getElementById('admin-player-status');
const adminPlayerResult = document.getElementById('admin-player-result');
const adminFormationForm = document.getElementById('admin-formation-form');
const adminFormationType = document.getElementById('admin-formation-type');
const adminFormationLineup = document.getElementById('admin-formation-lineup');
const adminFormationStatus = document.getElementById('admin-formation-status');
const aboutCopy = document.getElementById('about-copy');
const aboutLocation = document.getElementById('about-location');
const registerForm = document.getElementById('register-form');
const loginForm = document.getElementById('login-form');
const registerStatus = document.getElementById('register-status');
const loginStatus = document.getElementById('login-status');
const userPanel = document.getElementById('user-panel');
const userWelcome = document.getElementById('user-welcome');
const userLogout = document.getElementById('user-logout');
const refreshInbox = document.getElementById('refresh-inbox');
const inboxLoginNote = document.getElementById('inbox-login-note');
const inboxMessages = document.getElementById('inbox-messages');
const stkForm = document.getElementById('stk-form');
const stkStatus = document.getElementById('stk-status');
const stkPhone = document.getElementById('stk-phone');
const stkAmount = document.getElementById('stk-amount');
const stkDescription = document.getElementById('stk-description');

uploadButtons.forEach(button => {
  button.addEventListener('click', () => {
    const player = button.dataset.player;
    const input = document.querySelector(`.image-input[data-player="${player}"]`);
    if (input) {
      input.click();
    }
  });
});

imageInputs.forEach(input => {
  input.addEventListener('change', () => {
    const player = input.dataset.player;
    const file = input.files && input.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const avatar = document.querySelector(`.player-avatar[data-player="${player}"]`);
      if (avatar) {
        avatar.classList.add('has-image');
        avatar.style.backgroundImage = `url(${event.target.result})`;
        avatar.innerHTML = '';
      }
    };
    reader.readAsDataURL(file);
  });
});

messageButtons.forEach(button => {
  button.addEventListener('click', () => {
    const player = button.dataset.player;
    if (playerSelect) {
      playerSelect.value = player;
      playerSelect.scrollIntoView({ behavior: 'smooth', block: 'center' });
      playerSelect.focus();
    }
  });
});

const getStoredToken = () => window.localStorage.getItem('clu_token');
const setStoredToken = (token) => window.localStorage.setItem('clu_token', token);
const clearStoredToken = () => window.localStorage.removeItem('clu_token');
const getAuthHeaders = () => {
  const token = getStoredToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const escapeRegExp = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const getPlayerCards = () => Array.from(document.querySelectorAll('.player-card')).map((card) => {
  const name = card.querySelector('h4')?.textContent.trim() || '';
  const position = card.querySelector('p')?.textContent.trim() || '';
  const email = card.querySelector('.button.email')?.getAttribute('href')?.replace('mailto:', '') || '';
  return { name, position, email };
});

const populateAdminPlayerSelect = () => {
  if (!adminPlayerSelect) return;
  const players = getPlayerCards();
  adminPlayerSelect.innerHTML = '<option value="">Choose a player</option>' + players.map((player) => `\u003coption value="${player.name}"\u003e${player.name} (${player.position})\u003c/option\u003e`).join('');
};

const loadAdminPlayer = (playerName) => {
  if (!playerName || !adminPlayerName || !adminPlayerPosition || !adminPlayerEmail) return;
  const player = getPlayerCards().find((item) => item.name === playerName);
  if (!player) return;
  adminPlayerName.value = player.name;
  adminPlayerPosition.value = player.position;
  adminPlayerEmail.value = player.email;
  if (adminPlayerResult) adminPlayerResult.textContent = '';
};

const updatePlayerDom = (oldName, updated) => {
  const cards = Array.from(document.querySelectorAll('.player-card'));
  cards.forEach((card) => {
    const title = card.querySelector('h4');
    if (title?.textContent.trim() === oldName) {
      title.textContent = updated.name;
      const pos = card.querySelector('p');
      if (pos) pos.textContent = updated.position;
      const emailButton = card.querySelector('.button.email');
      if (emailButton) emailButton.href = `mailto:${updated.email}`;
      card.querySelectorAll('[data-player]').forEach((element) => {
        if (element.dataset.player === oldName) {
          element.dataset.player = updated.name;
        }
      });
    }
  });

  document.querySelectorAll('#message-player option, #admin-player-select option').forEach((option) => {
    if (option.value === oldName) {
      option.value = updated.name;
      option.textContent = `${updated.name} (${updated.position})`;
    }
  });

  document.querySelectorAll('.formation-pitch .player-node strong, li').forEach((element) => {
    const regex = new RegExp(`\\b${escapeRegExp(oldName)}\\b`, 'g');
    if (regex.test(element.textContent)) {
      element.textContent = element.textContent.replace(regex, updated.name);
    }
  });
};

const applySavedFormation = (formation) => {
  if (!formation || !formation.lines) return;
  const nonGoalNodes = Array.from(document.querySelectorAll('.formation-pitch .player-node:not(.goalkeeper)'));
  const goalNode = document.querySelector('.formation-pitch .player-node.goalkeeper');
  if (!goalNode) return;

  const lineup = formation.lines.slice();
  lineup.forEach(([position, name]) => {
    if (position.toUpperCase() === 'GK') {
      const span = goalNode.querySelector('span');
      const strong = goalNode.querySelector('strong');
      if (span) span.textContent = position;
      if (strong) strong.textContent = name;
    } else {
      const node = nonGoalNodes.shift();
      if (node) {
        const span = node.querySelector('span');
        const strong = node.querySelector('strong');
        if (span) span.textContent = position;
        if (strong) strong.textContent = name;
      }
    }
  });
  const headerType = document.querySelector('.formation-header strong');
  if (headerType) headerType.textContent = formation.type || '4-3-3';
};

const saveFormationToStorage = (formation) => {
  window.localStorage.setItem('clu_formation_data', JSON.stringify(formation));
};

const loadSavedFormation = () => {
  const saved = window.localStorage.getItem('clu_formation_data');
  if (!saved) return;
  try {
    const formation = JSON.parse(saved);
    if (adminFormationType) adminFormationType.value = formation.type || '4-3-3';
    if (adminFormationLineup) {
      adminFormationLineup.value = formation.lines.map(([position, name]) => `${position}: ${name}`).join('\n');
    }
    applySavedFormation(formation);
  } catch (error) {
    console.error('Unable to load saved formation:', error);
  }
};

const initAdminPlayerEditor = () => {
  populateAdminPlayerSelect();
  if (adminPlayerSelect) {
    adminPlayerSelect.addEventListener('change', (event) => {
      loadAdminPlayer(event.target.value);
    });
  }
};

const updateFormationFromForm = (formText, type) => {
  const lines = formText.split('\n').map((line) => line.split(':').map((text) => text.trim())).filter((parts) => parts.length === 2 && parts[0] && parts[1]);
  const formation = { type, lines };
  applySavedFormation(formation);
  saveFormationToStorage(formation);
};

const showAuthState = async () => {
  const token = getStoredToken();
  if (!token) {
    userPanel?.classList.add('hidden');
    inboxLoginNote?.classList.remove('hidden');
    messageForm?.querySelector('button[type="submit"]')?.setAttribute('disabled', 'true');
    messageResult.textContent = 'Login or register first to send inbox messages.';
    return;
  }

  try {
    const response = await fetch('/api/me', {
      headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
    });
    if (!response.ok) throw new Error('Session invalid');

    const data = await response.json();
    userWelcome.textContent = `Signed in as ${data.username} (${data.email})`;
    userPanel?.classList.remove('hidden');
    inboxLoginNote?.classList.add('hidden');
    messageForm?.querySelector('button[type="submit"]')?.removeAttribute('disabled');
    messageResult.textContent = '';
    fetchInbox();
  } catch (error) {
    clearStoredToken();
    userPanel?.classList.add('hidden');
    inboxLoginNote?.classList.remove('hidden');
    messageForm?.querySelector('button[type="submit"]')?.setAttribute('disabled', 'true');
    messageResult.textContent = 'Login or register first to send inbox messages.';
  }
};

const fetchInbox = async () => {
  const container = inboxMessages;
  if (!container) return;
  container.innerHTML = '<p>Loading inbox messages...</p>';

  try {
    const response = await fetch('/api/inbox', {
      headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
    });
    if (!response.ok) throw new Error('Unable to load inbox');
    const data = await response.json();
    if (!data.messages || data.messages.length === 0) {
      container.innerHTML = '<p>No messages yet.</p>';
      return;
    }

    container.innerHTML = data.messages.map((message) => `
      <div class="message-item">
        <h4>${message.subject}</h4>
        <p><strong>To:</strong> ${message.recipient}</p>
        <p><strong>From:</strong> ${message.senderName} &lt;${message.senderEmail}&gt;</p>
        <p>${message.body}</p>
        <p class="muted">Sent: ${new Date(message.createdAt).toLocaleString()}</p>
      </div>
    `).join('');
  } catch (error) {
    container.innerHTML = `<p>Error loading inbox: ${error.message}</p>`;
  }
};

if (messageForm) {
  messageForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const playerName = playerSelect?.value || '';
    const subject = document.getElementById('message-subject')?.value.trim();
    const body = document.getElementById('message-body')?.value.trim();
    if (!playerName || !subject || !body) {
      messageResult.textContent = 'Please select a player and fill in subject and message.';
      return;
    }

    try {
      const response = await fetch('/api/message', {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ recipient: playerName, subject, body }),
      });
      const result = await response.json();
      if (!response.ok) {
        messageResult.textContent = result.error || 'Failed to send message.';
        return;
      }
      messageResult.textContent = `Message sent to ${playerName}.`;
      messageForm.reset();
      fetchInbox();
    } catch (error) {
      messageResult.textContent = `Unable to send message: ${error.message}`;
    }
  });
}

if (registerForm) {
  registerForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const username = document.getElementById('register-username')?.value.trim();
    const email = document.getElementById('register-email')?.value.trim();
    const password = document.getElementById('register-password')?.value;
    if (!username || !email || !password) {
      registerStatus.textContent = 'Please complete all registration fields.';
      return;
    }

    const response = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password }),
    });
    const result = await response.json();
    if (!response.ok) {
      registerStatus.textContent = result.error || 'Registration failed.';
      return;
    }

    setStoredToken(result.token);
    registerStatus.textContent = 'Registration successful. You are now logged in.';
    loginStatus.textContent = '';
    showAuthState();
    registerForm.reset();
  });
}

if (loginForm) {
  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const email = document.getElementById('login-email')?.value.trim();
    const password = document.getElementById('login-password')?.value;
    if (!email || !password) {
      loginStatus.textContent = 'Email and password are required.';
      return;
    }

    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const result = await response.json();
    if (!response.ok) {
      loginStatus.textContent = result.error || 'Login failed.';
      return;
    }

    setStoredToken(result.token);
    loginStatus.textContent = 'Logged in successfully.';
    registerStatus.textContent = '';
    showAuthState();
    loginForm.reset();
  });
}

userLogout?.addEventListener('click', async () => {
  const token = getStoredToken();
  if (token) {
    await fetch('/api/logout', {
      method: 'POST',
      headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
    });
  }
  clearStoredToken();
  userPanel?.classList.add('hidden');
  inboxLoginNote?.classList.remove('hidden');
  messageForm?.querySelector('button[type="submit"]')?.setAttribute('disabled', 'true');
  messageResult.textContent = 'You have been logged out.';
});

refreshInbox?.addEventListener('click', fetchInbox);

showAuthState();
initAdminPlayerEditor();
loadSavedFormation();

if (adminForm) {
  adminForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const username = document.getElementById('admin-username')?.value.trim();
    const password = document.getElementById('admin-password')?.value || '';

    if (username === 'admin' && password === 'admin2026') {
      adminStatus.textContent = 'Admin access granted.';
      adminActions?.classList.remove('hidden');
    } else {
      adminStatus.textContent = 'Login failed. Use valid admin credentials.';
      adminActions?.classList.add('hidden');
    }
    adminForm.reset();
  });
}

if (adminAboutForm) {
  adminAboutForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if (aboutCopy && aboutLocation && adminAboutText && adminAboutLocation) {
      aboutCopy.textContent = adminAboutText.value.trim();
      aboutLocation.textContent = adminAboutLocation.value.trim();
      adminAboutStatus.textContent = 'About section saved successfully.';
    }
  });
}

if (adminPlayerForm) {
  adminPlayerForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!adminPlayerSelect || !adminPlayerName || !adminPlayerPosition || !adminPlayerEmail || !adminPlayerResult) return;
    const selected = adminPlayerSelect.value;
    const name = adminPlayerName.value.trim();
    const position = adminPlayerPosition.value.trim();
    const email = adminPlayerEmail.value.trim();
    if (!selected || !name || !position || !email) {
      adminPlayerResult.textContent = 'Select a player and fill in all fields.';
      return;
    }
    updatePlayerDom(selected, { name, position, email });
    populateAdminPlayerSelect();
    adminPlayerSelect.value = name;
    adminPlayerResult.textContent = `Saved ${name} successfully.`;
  });
}

if (adminFormationForm) {
  adminFormationForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!adminFormationType || !adminFormationLineup || !adminFormationStatus) return;
    const formationName = adminFormationType.value.trim();
    const lineup = adminFormationLineup.value.trim();
    if (!formationName || !lineup) {
      adminFormationStatus.textContent = 'Enter the formation name and player lineup.';
      return;
    }
    updateFormationFromForm(lineup, formationName);
    adminFormationStatus.textContent = 'Formation updated successfully.';
  });
}

if (stkForm) {
  stkForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const phone = stkPhone?.value.trim() || '';
    const amount = stkAmount?.value || '';
    const description = stkDescription?.value.trim() || '';

    if (!/^2547\d{8}$/.test(phone)) {
      stkStatus.textContent = 'Enter a valid Safaricom phone number starting with 2547.';
      return;
    }

    stkStatus.textContent = 'Sending STK Push request...';
    stkForm.querySelector('button[type="submit"]')?.setAttribute('disabled', 'true');

    try {
      const response = await fetch('/api/stkpush', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone,
          amount: Number(amount),
          description,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        stkStatus.textContent = result.error || 'STK Push request failed. Check server logs.';
      } else {
        stkStatus.textContent = `STK Push sent. CheckoutRequestID: ${result.CheckoutRequestID || result.checkOutRequestID || 'unknown'}.`;
      }
    } catch (error) {
      stkStatus.textContent = `Unable to reach Safaricom API server: ${error.message}`;
    } finally {
      stkForm.querySelector('button[type="submit"]')?.removeAttribute('disabled');
      stkForm.reset();
    }
  });
}

adminLogout?.addEventListener('click', () => {
  adminActions?.classList.add('hidden');
  adminStatus.textContent = 'Logged out of admin panel.';
});

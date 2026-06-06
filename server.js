const express = require('express');
const path = require('path');
const cors = require('cors');
const crypto = require('crypto');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

const users = [
  {
    id: 1,
    username: 'admin',
    email: 'admin@citylakersunited.com',
    password: 'admin2026',
    role: 'admin',
  },
];
const sessions = new Map();
const messages = [];
const transfers = [];
const players = [
  { id: 1, name: 'Joel Korir', position: 'Goalkeeper', email: 'joel.korir@citylakersunited.com', club: 'City Lakers United', assists: 0, passes: 0, quality: 'Safe', status: 'Active' },
  { id: 2, name: 'Robert Simiyu', position: 'Right Back', email: 'robert.simiyu@citylakersunited.com', club: 'City Lakers United', assists: 0, passes: 0, quality: 'Strong', status: 'Active' },
  { id: 3, name: 'Evans Lakeny', position: 'Right Back', email: 'evans.lakeny@citylakersunited.com', club: 'City Lakers United', assists: 0, passes: 0, quality: 'Quick', status: 'Active' },
  { id: 4, name: 'Hosea Biwwot', position: 'Center Back', email: 'hosea.biwwot@citylakersunited.com', club: 'City Lakers United', assists: 0, passes: 0, quality: 'Reliable', status: 'Active' },
  { id: 5, name: 'Hosea Kiprop', position: 'Center Back', email: 'hosea.kiprop@citylakersunited.com', club: 'City Lakers United', assists: 0, passes: 0, quality: 'Aggressive', status: 'Active' },
  { id: 6, name: 'Justine Chelanga', position: 'DMF', email: 'justine.chelanga@citylakersunited.com', club: 'City Lakers United', assists: 0, passes: 0, quality: 'Calm', status: 'Active' },
  { id: 7, name: 'Evans Kosgei', position: 'CMF', email: 'evans.kosgei@citylakersunited.com', club: 'City Lakers United', assists: 0, passes: 0, quality: 'Balanced', status: 'Active' },
  { id: 8, name: 'Evans Limo', position: 'Center Midfield', email: 'evans.limo@citylakersunited.com', club: 'City Lakers United', assists: 0, passes: 0, quality: 'Creative', status: 'Active' },
  { id: 9, name: 'Mathew Kipsang', position: 'Striker', email: 'mathew.kipsang@citylakersunited.com', club: 'City Lakers United', assists: 0, passes: 0, quality: 'Clinical', status: 'Active' },
  { id: 10, name: 'Titus Kemboi', position: 'RW', email: 'titus.kemboi@citylakersunited.com', club: 'City Lakers United', assists: 0, passes: 0, quality: 'Pacey', status: 'Active' },
  { id: 11, name: 'Justine Mutai', position: 'Right Wing', email: 'justine.mutai@citylakersunited.com', club: 'City Lakers United', assists: 0, passes: 0, quality: 'Skillful', status: 'Active' },
  { id: 12, name: 'Evans Kiptoo', position: 'Left Wing', email: 'evans.kiptoo@citylakersunited.com', club: 'City Lakers United', assists: 0, passes: 0, quality: 'Dribbler', status: 'Active' },
  { id: 13, name: 'Brian Kiprono', position: 'CMF', email: 'brian.kiprono@citylakersunited.com', club: 'City Lakers United', assists: 0, passes: 0, quality: 'Dynamic', status: 'Active' },
  { id: 14, name: 'Brian Kiprono Kimeli', position: 'Center Midfield', email: 'brian.kiprono.kimeli@citylakersunited.com', club: 'City Lakers United', assists: 0, passes: 0, quality: 'Tactical', status: 'Active' },
  { id: 15, name: 'Collins Kigen', position: 'Defensive Midfield', email: 'collins.kigen@citylakersunited.com', club: 'City Lakers United', assists: 0, passes: 0, quality: 'Shielding', status: 'Active' },
  { id: 16, name: 'Meshack Kimutai', position: 'Left Wing', email: 'meshack.kimutai@citylakersunited.com', club: 'City Lakers United', assists: 0, passes: 0, quality: 'Creative', status: 'Active' },
  { id: 17, name: 'Enock Kiprop', position: 'Left Back', email: 'enock.kiprop@citylakersunited.com', club: 'City Lakers United', assists: 0, passes: 0, quality: 'Strong', status: 'Active' },
  { id: 18, name: 'Isaac Kibet', position: 'Left Back', email: 'isaac.kibet@citylakersunited.com', club: 'City Lakers United', assists: 0, passes: 0, quality: 'Solid', status: 'Active' },
  { id: 19, name: 'Kenneth Ruto', position: 'Center Back', email: 'kenneth.ruto@citylakersunited.com', club: 'City Lakers United', assists: 0, passes: 0, quality: 'Disciplined', status: 'Active' },
  { id: 20, name: 'Collins Kipkemoi', position: 'Left Wing', email: 'collins.kipkemoi@citylakersunited.com', club: 'City Lakers United', assists: 0, passes: 0, quality: 'Fast', status: 'Active' },
  { id: 21, name: 'Gideon Kipkeu', position: 'DMF', email: 'gideon.kipkeu@citylakersunited.com', club: 'City Lakers United', assists: 0, passes: 0, quality: 'Tough', status: 'Active' },
];

const createToken = () => crypto.randomBytes(24).toString('hex');

const getTokenFromHeader = (req) => {
  const header = req.headers.authorization || '';
  const parts = header.split(' ');
  if (parts.length === 2 && parts[0] === 'Bearer') {
    return parts[1];
  }
  return null;
};

const getUserFromToken = (token) => {
  const userId = sessions.get(token);
  if (!userId) return null;
  return users.find((user) => user.id === userId) || null;
};

const requireAuth = (req, res) => {
  const token = getTokenFromHeader(req);
  const user = getUserFromToken(token);
  if (!user) {
    res.status(401).json({ error: 'Authentication required.' });
    return null;
  }
  return user;
};

const requireAdmin = (req, res) => {
  const user = requireAuth(req, res);
  if (!user) return null;
  if (user.role !== 'admin') {
    res.status(403).json({ error: 'Admin access required.' });
    return null;
  }
  return user;
};

const getAuthToken = async (consumerKey, consumerSecret) => {
  const tokenUrl = 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials';
  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');

  const response = await fetch(tokenUrl, {
    headers: {
      Authorization: `Basic ${auth}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Token request failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
};

const formatTimestamp = () => {
  const now = new Date();
  const pad = (value) => String(value).padStart(2, '0');
  return `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
};

const getPassword = (shortCode, passkey, timestamp) => {
  return Buffer.from(`${shortCode}${passkey}${timestamp}`).toString('base64');
};

app.post('/api/stkpush', async (req, res) => {
  try {
    const { phone, amount, description } = req.body;

    const consumerKey = process.env.CONSUMER_KEY;
    const consumerSecret = process.env.CONSUMER_SECRET;
    const shortCode = process.env.BUSINESS_SHORT_CODE;
    const passkey = process.env.PASSKEY;
    const callbackUrl = process.env.CALLBACK_URL;

    if (!consumerKey || !consumerSecret || !shortCode || !passkey || !callbackUrl) {
      return res.status(500).json({ error: 'Missing Safaricom API credentials. Set CONSUMER_KEY, CONSUMER_SECRET, BUSINESS_SHORT_CODE, PASSKEY, and CALLBACK_URL.' });
    }

    if (!/^2547\d{8}$/.test(phone)) {
      return res.status(400).json({ error: 'Phone number must start with 2547 and include 12 digits.' });
    }

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ error: 'Amount must be a positive number.' });
    }

    const tokenData = await getAuthToken(consumerKey, consumerSecret);
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      throw new Error('Unable to obtain Safaricom access token.');
    }

    const timestamp = formatTimestamp();
    const password = getPassword(shortCode, passkey, timestamp);

    const body = {
      BusinessShortCode: shortCode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: Number(amount),
      PartyA: phone,
      PartyB: shortCode,
      PhoneNumber: phone,
      CallBackURL: callbackUrl,
      AccountReference: 'CityLakersUnited',
      TransactionDesc: description || 'Club payment',
    };

    const response = await fetch('https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const result = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({ error: result.errorMessage || JSON.stringify(result), details: result });
    }

    return res.json(result);
  } catch (error) {
    console.error('STK Push error:', error);
    return res.status(500).json({ error: error.message || 'Internal server error.' });
  }
});

app.post('/api/register', (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'Username, email, and password are required.' });
  }

  const existing = users.find((user) => user.email === email.toLowerCase());
  if (existing) {
    return res.status(409).json({ error: 'Email is already registered.' });
  }

  const id = users.length + 1;
  const user = {
    id,
    username,
    email: email.toLowerCase(),
    password,
    role: 'user',
  };
  users.push(user);

  const token = createToken();
  sessions.set(token, id);

  return res.json({ token, user: { id, username, email: user.email, role: user.role } });
});

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const user = users.find((item) => item.email === email.toLowerCase() && item.password === password);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials.' });
  }

  const token = createToken();
  sessions.set(token, user.id);

  return res.json({ token, user: { id: user.id, username: user.username, email: user.email, role: user.role } });
});

app.get('/api/me', (req, res) => {
  const token = getTokenFromHeader(req);
  const user = getUserFromToken(token);
  if (!user) {
    return res.status(401).json({ error: 'Invalid session.' });
  }

  return res.json({ id: user.id, username: user.username, email: user.email, role: user.role });
});

app.post('/api/message', (req, res) => {
  const token = getTokenFromHeader(req);
  const sender = getUserFromToken(token);
  if (!sender) {
    return res.status(401).json({ error: 'Authentication required.' });
  }

  const { recipient, subject, body } = req.body;
  if (!recipient || !subject || !body) {
    return res.status(400).json({ error: 'Recipient, subject, and message body are required.' });
  }

  const message = {
    id: messages.length + 1,
    senderId: sender.id,
    senderName: sender.username,
    senderEmail: sender.email,
    recipient,
    subject,
    body,
    createdAt: new Date().toISOString(),
  };
  messages.unshift(message);

  return res.json({ message, success: true });
});

app.get('/api/inbox', (req, res) => {
  const token = getTokenFromHeader(req);
  const user = getUserFromToken(token);
  if (!user) {
    return res.status(401).json({ error: 'Authentication required.' });
  }

  if (user.role === 'admin') {
    return res.json({ messages });
  }

  const userMessages = messages.filter((message) => message.senderId === user.id || message.recipient === user.username || message.recipient === user.email);
  return res.json({ messages: userMessages });
});

app.post('/api/logout', (req, res) => {
  const token = getTokenFromHeader(req);
  if (token) {
    sessions.delete(token);
  }
  return res.json({ success: true });
});

app.get('/api/players', (req, res) => {
  return res.json({ players });
});

app.post('/api/players', (req, res) => {
  const user = requireAdmin(req, res);
  if (!user) return;
  const { name, position, email, club, quality, status } = req.body;
  if (!name || !position || !email || !club) {
    return res.status(400).json({ error: 'Name, position, email, and club are required.' });
  }
  const exists = players.find((player) => player.email.toLowerCase() === email.toLowerCase());
  if (exists) {
    return res.status(409).json({ error: 'Player with this email already exists.' });
  }
  const id = players.length + 1;
  const player = { id, name, position, email: email.toLowerCase(), club, assists: 0, passes: 0, quality: quality || 'N/A', status: status || 'Active' };
  players.push(player);
  return res.json({ player });
});

app.put('/api/players/:id', (req, res) => {
  const user = requireAdmin(req, res);
  if (!user) return;
  const playerId = Number(req.params.id);
  const player = players.find((item) => item.id === playerId);
  if (!player) {
    return res.status(404).json({ error: 'Player not found.' });
  }
  const { name, position, email, club, quality, status } = req.body;
  if (name) player.name = name;
  if (position) player.position = position;
  if (email) player.email = email.toLowerCase();
  if (club) player.club = club;
  if (quality) player.quality = quality;
  if (status) player.status = status;
  return res.json({ player });
});

app.delete('/api/players/:id', (req, res) => {
  const user = requireAdmin(req, res);
  if (!user) return;
  const playerId = Number(req.params.id);
  const index = players.findIndex((item) => item.id === playerId);
  if (index === -1) {
    return res.status(404).json({ error: 'Player not found.' });
  }
  players.splice(index, 1);
  return res.json({ success: true });
});

app.post('/api/players/:id/transfer', (req, res) => {
  const user = requireAdmin(req, res);
  if (!user) return;
  const playerId = Number(req.params.id);
  const player = players.find((item) => item.id === playerId);
  if (!player) {
    return res.status(404).json({ error: 'Player not found.' });
  }
  const { club, position } = req.body;
  if (!club || !position) {
    return res.status(400).json({ error: 'New club and position are required.' });
  }
  transfers.unshift({ playerId, playerName: player.name, fromClub: player.club, toClub: club, fromPosition: player.position, toPosition: position, date: new Date().toISOString(), changedBy: user.username });
  player.club = club;
  player.position = position;
  return res.json({ player, transfer: transfers[0] });
});

app.post('/api/players/:id/stats', (req, res) => {
  const user = requireAdmin(req, res);
  if (!user) return;
  const playerId = Number(req.params.id);
  const player = players.find((item) => item.id === playerId);
  if (!player) {
    return res.status(404).json({ error: 'Player not found.' });
  }
  const { assists, passes, quality, match } = req.body;
  if (assists !== undefined) player.assists = Number(assists);
  if (passes !== undefined) player.passes = Number(passes);
  if (quality) player.quality = quality;
  if (match) player.lastMatch = match;
  return res.json({ player });
});

app.get('/api/transfers', (req, res) => {
  const user = requireAdmin(req, res);
  if (!user) return;
  return res.json({ transfers });
});

app.listen(port, () => {
  console.log(`City Lakers portal running at http://localhost:${port}`);
});

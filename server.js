const express = require('express');
const cors = require('cors');
const axios = require('axios');
const fs = require('fs/promises');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());
const { addEvent } = require('./db'); 
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
app.use(express.static(path.join(__dirname))); // for serving your HTML/JS/CSS files

const users = [
  { username: 'admin', password: bcrypt.hashSync('password123', 10) } // Example user
];

const SECRET_KEY = process.env.SECRET_KEY || 'your_secret_key';

// Login endpoint
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username);

  if (user && bcrypt.compareSync(password, user.password)) {
    const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ token });
  } else {
    res.status(401).json({ error: 'Invalid username or password' });
  }
});

// Middleware to protect routes
function authenticateToken(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access denied' });

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
}

// Example protected route
app.get('/api/protected', authenticateToken, (req, res) => {
  res.json({ message: 'This is a protected route', user: req.user });
});

app.get('/api/events', async (req, res) => {
  try {
    const filePath = path.join(__dirname, 'events.json');
    const data = await fs.readFile(filePath, 'utf8');
    res.json(JSON.parse(data));
  } catch (error) {
    console.error("Error reading events.json:", error);
    res.status(500).json({ error: 'Failed to load events' });
  }
});



const EVENTBRITE_TOKEN = process.env.EVENTBRITE_TOKEN;
const ORGANIZATION_ID = process.env.ORGANIZATION_ID;

app.post('/create-event', async (req, res) => {
  const eventData = req.body;

  try {
    const response = await axios.post(
      `https://www.eventbriteapi.com/v3/organizations/${ORGANIZATION_ID}/events/`,
      eventData,
      {
        headers: {
          Authorization: `Bearer ${EVENTBRITE_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );

        addEvent(eventData, response.data.id);
        
    res.json({ success: true, eventId: response.data.id });
  } catch (error) {
    console.error('Error creating event:', error.response?.data || error.message);
    res.status(500).json({ success: false, error: error.response?.data || 'Unknown error' });
  }
});

const { checkoutTicket } = require('./db');

app.post('/checkout', async (req, res) => {
  const { eventId, ticketClassId, attendee, quantity } = req.body;

  try {
    const order = await checkoutTicket(eventId, ticketClassId, attendee, quantity);
    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});


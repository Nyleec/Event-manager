const express = require('express');
const cors = require('cors');
const axios = require('axios');
const fs = require('fs/promises');
const path = require('path');
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


// filepath: /Users/Nyleec/Desktop/Event-manager/server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const fetch = require('node-fetch');

dotenv.config(); // Load .env variables

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3000;

// Proxy route to delete events
app.delete('/api/events/:id', async (req, res) => {
  const eventId = req.params.id;
  const token = process.env.EVENTBRITE_TOKEN;

  try {
    const response = await fetch(`https://www.eventbriteapi.com/v3/events/${eventId}/`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (response.ok) {
      res.status(200).send({ message: `Event ${eventId} deleted successfully.` });
    } else {
      const errorText = await response.text();
      res.status(response.status).send({ error: errorText });
    }
  } catch (err) {
    res.status(500).send({ error: 'Failed to delete event.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
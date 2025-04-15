const fs = require('fs');
const path = require('path');
const axios = require('axios');
require('dotenv').config(); // Load environment variables from .env

const eventsFilePath = path.join(__dirname, 'events.json');

// Load environment variables
const EVENTBRITE_TOKEN = process.env.EVENTBRITE_TOKEN;
const ORGANIZATION_ID = process.env.ORGANIZATION_ID;

// Load events from the file if it exists
let events = [];
if (fs.existsSync(eventsFilePath)) {
  try {
    const fileData = fs.readFileSync(eventsFilePath, 'utf8');
    events = JSON.parse(fileData);
  } catch (error) {
    console.error("Error parsing events.json. Initializing with an empty array.", error);
    events = [];
  }
} else {
  // If the file doesn't exist, initialize it with an empty array
  fs.writeFileSync(eventsFilePath, JSON.stringify([]));
}

/**
 * Add a new event to the database.
 * @param {Object} eventData - The data sent to the Eventbrite API.
 * @param {string} eventId - The event ID received from the Eventbrite API.
 */
function addEvent(eventData, eventId) {
  const newEvent = {
    name: eventData.event?.name?.html || null,
    description: eventData.event?.description?.html || null,
    start: {
      timezone: eventData.event?.start?.timezone || null,
      utc: eventData.event?.start?.utc || null,
    },
    end: {
      timezone: eventData.event?.end?.timezone || null,
      utc: eventData.event?.end?.utc || null,
    },
    currency: eventData.event?.currency || null,
    eventId: eventId,
    timestamp: new Date().toISOString(),
  };

  events.push(newEvent);

  // Save the updated events array to the file
  try {
    fs.writeFileSync(eventsFilePath, JSON.stringify(events, null, 2));
    console.log("Events successfully written to file.");
  } catch (error) {
    console.error("Error writing to events.json:", error);
  }
}

/**
 * Get all stored events.
 * @returns {Array} The array of stored events.
 */
function getEvents() {
  return events;
}

/**
 * Fetch all events from the Eventbrite API and save them to events.json.
 * @returns {Promise<Array>} A promise that resolves to an array of events.
 */
async function fetchAllEvents() {
  try {
    const response = await axios.get(
      `https://www.eventbriteapi.com/v3/organizations/${ORGANIZATION_ID}/events/`,
      {
        headers: {
          Authorization: `Bearer ${EVENTBRITE_TOKEN}`,
        },
      }
    );

    const fetchedEvents = response.data.events;
    console.log("Fetched events from Eventbrite:", fetchedEvents);

    // Save the fetched events to events.json
    events = fetchedEvents.map(event => ({
      name: event.name?.html || null,
      description: event.description?.html || null,
      start: {
        timezone: event.start?.timezone || null,
        utc: event.start?.utc || null,
      },
      end: {
        timezone: event.end?.timezone || null,
        utc: event.end?.utc || null,
      },
      currency: event.currency || null,
      eventId: event.id || null,
      timestamp: new Date().toISOString(),
    }));

    try {
      fs.writeFileSync(eventsFilePath, JSON.stringify(events, null, 2));
      console.log("Fetched events successfully written to events.json.");
    } catch (error) {
      console.error("Error writing fetched events to events.json:", error);
    }

    return events;
  } catch (error) {
    console.error("Error fetching events from Eventbrite:", error.response?.data || error.message);
    throw new Error("Failed to fetch events from Eventbrite.");
  }
}

/**
 * Checkout a ticket for a user and process the transaction.
 * @param {string} eventId - The ID of the event.
 * @param {string} ticketClassId - The ID of the ticket class.
 * @param {Object} attendee - The attendee's information (email, first_name, last_name).
 * @param {number} quantity - The number of tickets to purchase.
 * @returns {Promise<Object>} A promise that resolves to the order details.
 */
async function checkoutTicket(eventId, ticketClassId, attendee, quantity) {
  try {
    const orderData = {
      event_id: eventId,
      tickets: [
        {
          ticket_class_id: ticketClassId,
          quantity: quantity,
        },
      ],
      attendees: [
        {
          profile: {
            email: attendee.email,
            first_name: attendee.first_name,
            last_name: attendee.last_name,
          },
        },
      ],
    };

    const response = await axios.post(
      'https://www.eventbriteapi.com/v3/orders/',
      orderData,
      {
        headers: {
          Authorization: `Bearer ${EVENTBRITE_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log("Order created successfully:", response.data);
    return response.data; // Return the order details
  } catch (error) {
    console.error("Error creating order:", error.response?.data || error.message);
    throw new Error(error.response?.data?.error_description || "Failed to create order.");
  }
}

module.exports = {
  addEvent,
  getEvents,
  fetchAllEvents,
  checkoutTicket,
};
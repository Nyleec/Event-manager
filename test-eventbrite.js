const axios = require('axios');

// Replace this with your personal OAuth token from the dev console
const EVENTBRITE_TOKEN = 'W5TACDM6GESNY75BFGZH';

async function testEventbriteConnection() {
  try {
    const response = await axios.get('https://www.eventbriteapi.com/v3/users/me/', {
      headers: {
        Authorization: `Bearer ${EVENTBRITE_TOKEN}`
      }
    });

    console.log('✅ Token is valid!');
    console.log('👤 User Info:', response.data);
  } catch (error) {
    if (error.response) {
      console.error('❌ API Error:', error.response.status, error.response.data);
    } else {
      console.error('❌ Connection Error:', error.message);
    }
  }
}

testEventbriteConnection();

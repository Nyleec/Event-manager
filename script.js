let allEvents = [];

async function fetchEvents() {
    try {
    const response = await fetch('http://localhost:3000/api/events');
      allEvents = await response.json();
  
      const upcoming = allEvents
        .filter(e => e.start?.utc)
        .sort((a, b) => new Date(a.start.utc) - new Date(b.start.utc))
        .slice(0, 10);
  
      displayEvents(upcoming);
    } catch (err) {
      console.error('Failed to fetch events:', err);
    }
  }
  

function displayEvents(events) {
  const container = document.getElementById('eventsContainer');
  container.innerHTML = ''; // clear old content

  if (events.length === 0) {
    container.innerHTML = '<p>No events found.</p>';
    return;
  }

  for (const event of events) {
    const div = document.createElement('div');
    div.className = 'event';
    div.innerHTML = `
      <h3>${event.name || 'Untitled Event'}</h3>
      <p><strong>Start:</strong> ${event.start?.utc || 'N/A'}</p>
      <p><strong>End:</strong> ${event.end?.utc || 'N/A'}</p>
      <p><strong>Currency:</strong> ${event.currency || 'N/A'}</p>
      <p>${event.description || ''}</p>
    `;
    container.appendChild(div);
  }
}

function filterEvents() {
    const keyword = document.getElementById('keywordInput').value.toLowerCase();
    const startDateInput = document.getElementById('startDate').value;
    const endDateInput = document.getElementById('endDate').value;
    const sortOption = document.getElementById('sortSelect').value;
  
    const startDate = startDateInput ? new Date(startDateInput) : null;
    const endDate = endDateInput ? new Date(endDateInput) : null;
  
    let filtered = allEvents.filter(event => {
      const name = event.name?.toLowerCase() || '';
      const desc = event.description?.toLowerCase() || '';
      const matchesKeyword = name.includes(keyword) || desc.includes(keyword);
  
      const eventStart = event.start?.utc ? new Date(event.start.utc) : null;
  
      const matchesDate =
        (!startDate || (eventStart && eventStart >= startDate)) &&
        (!endDate || (eventStart && eventStart <= endDate));
  
      return matchesKeyword && matchesDate;
    });
  
    if (sortOption === 'soonest') {
      filtered.sort((a, b) => new Date(a.start?.utc) - new Date(b.start?.utc));
    } else if (sortOption === 'latest') {
      filtered.sort((a, b) => new Date(b.start?.utc) - new Date(a.start?.utc));
    }
  
    displayEvents(filtered);
  }

  function resetFilters() {
    document.getElementById('keywordInput').value = '';
    document.getElementById('startDate').value = '';
    document.getElementById('endDate').value = '';
    document.getElementById('sortSelect').value = 'soonest';
  
    // Show the 10 closest events again
    const upcoming = allEvents
      .filter(e => e.start?.utc)
      .sort((a, b) => new Date(a.start.utc) - new Date(b.start.utc))
      .slice(0, 10);
  
    displayEvents(upcoming);
  }
  

// Initial load
fetchEvents();

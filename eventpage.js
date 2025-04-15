document.getElementById("eventForm").addEventListener("submit", async function(e) {
    e.preventDefault();

const formData = new FormData(e.target);
const data = {};

for (const [key, value] of formData.entries()) {
let val = value;
  //timezone has to be included in the start & end times
// Convert datetime-local to ISO UTC format for date fields
if (key.includes("start.utc") || key.includes("end.utc")) {
  const localDate = new Date(value);
  val = localDate.toISOString().split(".")[0] + "Z"; // Remove milliseconds // returns full UTC ISO 8601
}

const keys = key.split(".");
if (keys.length === 3) {
  data[keys[0]] = data[keys[0]] || {};
  data[keys[0]][keys[1]] = data[keys[0]][keys[1]] || {};
  data[keys[0]][keys[1]][keys[2]] = val;
} else if (keys.length === 2) {
  data[keys[0]] = data[keys[0]] || {};
  data[keys[0]][keys[1]] = val;
} else {
  data[key] = val;
}
}

  // Ensure the API receives the correct structure
  data.event.start = {
    timezone: "America/Los_Angeles",
    utc: data.event.start.utc,
  };
  data.event.end = {
    timezone: "America/Los_Angeles",
    utc: data.event.end.utc,
  };

    console.log("Data to be sent:", data);

    //timezone has to be included in the start & end times
    try {
      const response = await fetch('http://localhost:3000/create-event', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();
      if (result.success) {
        alert(`Event created successfully! Event ID: ${result.eventId}`);
      } else {
        alert(`Failed to create event: ${JSON.stringify(result.error)}`);
      }
    } catch (err) {
      console.error('Error sending request:', err);
      alert('Something went wrong!');
    }
  });
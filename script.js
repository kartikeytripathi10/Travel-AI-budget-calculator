flatpickr("#tripDateRange", {
  mode: "range",
  enableTime: true,
  dateFormat: "Y-m-d H:i",
  time_24hr: true,
  minDate: "today"
});

document.getElementById("tripForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const form = e.target;
  const adults = parseInt(form.adults.value, 10);
  const children = parseInt(form.children.value, 10);
  const hotel = form.hotel.value;
  const destination = form.destination.value;

  const dateRange = form.tripDateRange.value.split(" to ");
  if (dateRange.length < 2) {
    document.getElementById("durationResult").textContent = "❌ Please select a valid date range.";
    return;
  }

  const startDate = new Date(dateRange[0]);
  const endDate = new Date(dateRange[1]);

  const duration = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
  if (duration <= 0) {
    document.getElementById("durationResult").textContent = "❌ End date must be after start date.";
    return;
  }

  document.getElementById("durationResult").textContent = `✅ Trip Duration: ${duration} day(s)`;
  document.getElementById("apiResult").textContent = "⏳ Calculating... Please wait...";

  const prompt = `
A user is planning a trip.

Details:
- Number of Adults: ${adults}
- Number of Children: ${children}
- Hotel Type: ${hotel} Star
- Destination: ${destination}
- Trip Duration: ${duration} day(s)

Calculate estimated budget including:
1. Accommodation cost range based on the selected hotel type.
2. All meals (breakfast, lunch, and dinner).
3. Transportation cost range.
4. Total estimated cost range.

Reply in this format:
Place: ${destination}
Accommodation (based on ${hotel}-star hotel): ₹xxxx - ₹xxxx
Transportation: ₹xxxx - ₹xxxx
Meals: ₹xxxx - ₹xxxx
Total: ₹xxxx - ₹xxxx

To travel to ${destination}, ₹xxxx should be your estimated budget.
`;

  const API_KEY = 'AIzaSyDJ_yCsvL7_QW22Uxy1XA8X7mzyGoh8vp8';
  const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

  try {
    const response = await fetch(GEMINI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          { role: "user", parts: [ { text: prompt } ] }
        ]
      })
    });

    const data = await response.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "❌ Failed to generate result.";
    document.getElementById("apiResult").innerHTML = `<div style="white-space: pre-wrap; color: #2c3e50;">${reply}</div>`;
  } catch (error) {
    console.error("API Error:", error);
    document.getElementById("apiResult").textContent = "❌ An error occurred while calculating the trip cost.";
  }
});

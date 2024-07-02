const express = require("express");
const axios = require("axios");

const app = express();
const port = 3000;

// Middleware to parse JSON requests
app.use(express.json());
app.set("trust proxy", true);

const getIPv4 = (ip) => {
  if (ip.startsWith("::ffff:")) {
    return ip.split(":").pop();
  }
  return ip;
};

async function getLocationFromIP() {
  const url = `https://api.ipgeolocation.io/ipgeo?apiKey=388779fff2914fcdb636ca55edb43159`;

  try {
    const response = await axios.get(url);
    return response;
  } catch (error) {
    console.log("Error fetching location data:", error);
    return error;
  }
}

async function fetchWeatherData(lat, lon) {
  const apiKey = "d0bb2381513b7c00e0e3785da082273d"; // Replace with your OpenWeatherMap API key
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`;

  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.log("Error fetching weather data:", error);
    throw error; // Rethrow the error after logging it
  }
}

app.get("/", (req, res) => {
  res.send("Server running successfully");
});

// Router to handle the POST request
app.get("/api/hello", async (req, res) => {
  let { visitor_name } = req.query;

  visitor_name = visitor_name.replace(/[' "]/g, "");

  if (!visitor_name) {
    return res.status(400).json({ error: "Username is required" });
  }

  let ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || null;
  ip = getIPv4(ip);

  let location;

  try {
    location = await getLocationFromIP();
  } catch {
    return res.status(500).json({ error: "Failed to fetch location data" });
  }
  /*   const location = await getLocationFromIP(); */
  const latitude = Number(location.latitude);
  const longitude = Number(location.longitude);

  let weatherInfo;

  try {
    weatherInfo = await fetchWeatherData(latitude, longitude);
  } catch (error) {
    console.log(error);
  }

  let temperature = weatherInfo;
  res.status(200).json({
    client_ip: ip,
    location: location ? location.city : null,
    greeting: `Hello ${visitor_name}!, the temperature is ${ip} degrees celcius in ${location.city}`,
    location: location,
    ip: typeof ip,
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

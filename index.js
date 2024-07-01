const express = require("express");
const axios = require("axios");

const app = express();
const port = 3000;

// Middleware to parse JSON requests
app.use(express.json());
app.set("trust proxy", true);

const API_KEY = "388779fff2914fcdb636ca55edb43159";

const getIPv4 = (ip) => {
  if (ip.startsWith("::ffff:")) {
    return ip.split(":").pop();
  }
  return ip;
};

async function getLocationFromIP() {
  const url = `https://api.ipgeolocation.io/ipgeo?apiKey=${API_KEY}`;

  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching location data:", error);
    return null;
  }
}

async function fetchWeatherData(lat, lon) {
  const apiKey = "d0bb2381513b7c00e0e3785da082273d"; // Replace with your OpenWeatherMap API key
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=imperial`;

  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching weather data:", error);
    throw error; // Rethrow the error after logging it
  }
}

app.get("/", (req, res) => {
  res.send("Server running successfully");
});

// Router to handle the POST request
app.get("/user", async (req, res) => {
  let { visitor_name } = req.query;

  visitor_name = visitor_name.replace(/[' "]/g, "");

  if (!visitor_name) {
    return res.status(400).send({ error: "Username is required" });
  }

  let ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || null;
  ip = getIPv4(ip);

  const location = await getLocationFromIP();
  const latitude = Number(location.latitude);
  const longitude = Number(location.longitude);

  let weatherInfo;

  try {
    weatherInfo = await fetchWeatherData(latitude, longitude);
  } catch (error) {
    console.log(error);
  }

  let temperature = weatherInfo.main.temp;
  res.send({
    client_ip: ip,
    location: location ? location.city : null,
    greeting: `Hello ${visitor_name}!, the temperature is ${temperature} degrees celcius in ${location.city}`,
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

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

const getWeather = async (lat, lon) => {
  const apiKey = "d0bb2381513b7c00e0e3785da082273d";
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`;

  try {
    const response = await axios.get(url);
    console.log(response.data);
  } catch (error) {
    console.error(error);
  }
};

app.get("/", (req, res) => {
  res.send("Server running successfully");
});

// Router to handle the POST request
app.post("/user", async (req, res) => {
  let { username } = req.query;

  username = username.replace(/[' "]/g, "");

  if (!username) {
    return res.status(400).send({ error: "Username is required" });
  }

  let ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || null;
  ip = getIPv4(ip);

  const location = await getLocationFromIP();
  const latitude = location.latitude;
  const longitude = location.longitude;

  res.send({
    greeting: `Hello ${username}!, the temperature is 11 degrees celcius in ${location.city}`,
    client_ip: ip,
    location: location ? location.city : null,
    data: typeof location.latitude,
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

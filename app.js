const express = require("express");
const nodeIplocate = require("node-iplocate");
const app = express();
const port = 3000;
const iplocate = require("node-iplocate");

// Middleware to parse JSON requests
app.use(express.json());
app.set("trust proxy", true);

const apiKey = "388779fff2914fcdb636ca55edb43159";

const getIPv4 = (ip) => {
  if (ip.startsWith("::ffff:")) {
    return ip.split(":").pop();
  }
  return ip;
};

// Router to handle the POST request
app.post("/user", (req, res) => {
  let { username } = req.query;

  username = username.replace(/[' "]/g, "");
  console.log(req.params);

  if (!username) {
    return res.status(400).send({ error: "Username is required" });
  }

  let ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || null;
  ip = getIPv4(ip);
  console.log(ip);

  iplocate(`${ip}`).then(function (results) {
    console.log(results);
  });
  res.send({
    greeting: `Hello ${username}!, the temperature is 11 degrees celcius in New York`,
    client_ip: ip,
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

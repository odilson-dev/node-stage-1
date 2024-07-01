const express = require("express");
const http = require("http");
const https = require("https");

const app = express();

app.get("/api/hello", (req, res) => {
  const visitorName = req.query.visitor_name;
  const clientIp =
    req.headers["x-forwarded-for"] || req.connection.remoteAddress;

  // Get location based on IP address
  http
    .get(`http://ip-api.com/json/${clientIp}`, (geoRes) => {
      let geoData = "";

      geoRes.on("data", (chunk) => {
        geoData += chunk;
      });

      geoRes.on("end", () => {
        const location = JSON.parse(geoData).city;

        // Get weather data based on location
        https
          .get(
            `https://api.weatherapi.com/v1/current.json?key=YOUR_API_KEY&q=${location}`,
            (weatherRes) => {
              let weatherData = "";

              weatherRes.on("data", (chunk) => {
                weatherData += chunk;
              });

              weatherRes.on("end", () => {
                const temperature = JSON.parse(weatherData).current.temp_c;

                res.json({
                  client_ip: clientIp,
                  location: location,
                  greeting: `Hello, ${visitorName}!, the temperature is ${temperature} degrees Celsius in ${location}`,
                });
              });
            }
          )
          .on("error", (e) => {
            res.status(500).send("Error occurred while fetching weather data");
          });
      });
    })
    .on("error", (e) => {
      res.status(500).send("Error occurred while fetching location data");
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

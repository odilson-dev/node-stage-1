var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
require("dotenv").config();
const axios = require("axios");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");

var app = express();
app.set("trust proxy", true);

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.get("/", async (req, res) => {
  const ip = req.ip;
  res.send(ip);
});

app.use("/users", usersRouter);

app.get("/api/hello", async (req, res, next) => {
  const visitor_name = req.query.visitor_name || "Mark";

  let clientIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  if (clientIp.startsWith("::ffff:")) {
    clientIp = clientIp.split("::ffff:")[1];
  }

  console.log(clientIp);
  try {
    // Get location data from IP address
    const locationResponse = await axios.get(
      `http://api.ipstack.com/${clientIp}?access_key=b36bc2713163d33c7315fe2cf1757fba`
    );
    const { city, country_code } = locationResponse.data;

    // Get weather data for the location
    const weatherResponse = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${city},${country_code}&appid=b40dacdf727ab9a1523506ac015d99d8&units=metric`
    );
    const temperature = weatherResponse.data.main.temp;
    const location = weatherResponse.data.name;

    res.json({
      client_ip: clientIp, // The IP address of the requester
      location: location, // The city of the requester
      greeting: `Hello, ${visitor_name}!, the temperature is ${temperature} degrees Celcius in ${location}`,
    });
  } catch (error) {
    res.status(500).json({ error: error.toString() });
  }
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;

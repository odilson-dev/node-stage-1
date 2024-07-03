var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);

app.use("/users", usersRouter);

app.get("/api/hello", async (req, res, next) => {
  const clientIp = req.ip;
  const visitor_name = req.query.visitor_name || "Mark";
  const temperature = req.query.temperature || "23"; // Default to "Unknown Temperature" if temperature is not provided

  var fetch_res = await fetch(`https://ipapi.co/${req.get("host")}/json/`);
  var fetch_data = await fetch_res.json();
  const location = fetch_data.region;

  res.json({
    client_ip: clientIp, // The IP address of the requester
    location: location, // The city of the requester
    greeting: `Hello, ${visitor_name}!, the temperature is ${temperature} degrees Celcius in ${location}`,
  });
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

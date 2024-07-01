var express = require("express");
var router = express.Router();

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

router.get("/api/hello", function (req, res, next) {
  const visitor_name = req.query.visitor_name || "Mark";
  const location = req.query.location || "Lagos"; // Default to "Unknown Location" if location is not provided
  const temperature = req.query.temperature || "23"; // Default to "Unknown Temperature" if temperature is not provided

  res.render("visitor", {
    visitor_name: visitor_name,
    location: location,
    temperature: temperature,
  });
});

module.exports = router;

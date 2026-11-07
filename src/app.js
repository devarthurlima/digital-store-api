const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  return res.status(200).json({
    message: "Digital Store API is running",
    timestamp: new Date().toISOString(),
  });
});

module.exports = app;

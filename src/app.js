const express = require("express");
const cors = require("cors");
const userRoutes = require("./routes/userRoutes");
const categoryRoutes = require("./routes/categoryRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/v1", userRoutes);
app.use("/v1", categoryRoutes);

app.get("/", (req, res) => {
  return res.status(200).json({
    message: "Digital Store API is running",
    timestamp: new Date().toISOString(),
  });
});

module.exports = app;

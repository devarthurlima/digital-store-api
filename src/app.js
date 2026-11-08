const express = require("express");
const cors = require("cors");
const path = require("path");
const userRoutes = require("./routes/userRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const productRoutes = require("./routes/productRoutes");

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use(
  "/uploads",
  express.static(path.resolve(__dirname, "..", "public", "uploads")),
);

app.use("/v1", userRoutes);
app.use("/v1", categoryRoutes);
app.use("/v1", productRoutes);

app.get("/", (req, res) => {
  return res.status(200).json({
    message: "Digital Store API is running",
    timestamp: new Date().toISOString(),
  });
});

module.exports = app;

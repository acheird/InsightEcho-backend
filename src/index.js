const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

// Import routes
const reviewRoutes = require("./routes/reviews");

// Connect routes
app.use("/api", reviewRoutes);

app.get("/ping", (req, res) => {
  res.send("Server is running!");
});

// Debugging: Log available routes
app._router.stack.forEach((r) => {
  if (r.route && r.route.path) {
    console.log(`Route found: ${r.route.path}`);
  }
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

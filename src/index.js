const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

// const corsOptions = {
//   origin: "http://localhost:5173",
//   methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
//   allowedHeaders: ["Content-Type"],
// };

// app.use(cors(corsOptions));

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

// Import routes
const reviewRoutes = require("./routes/reviews");

// Connect routes
app.use("/api", reviewRoutes);

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

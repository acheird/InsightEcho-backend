// Import Express to create a router for handling API routes
const express = require("express");
const router = express.Router();

// Import controller functions for handling review related logic
const { addReview, getAnalysis } = require("../controllers/reviewController");

// Define a POST route to add a new review
router.post("/reviews", addReview);

// Define a GET route to analyze sentiment based on stored reviews
router.get("/analysis", getAnalysis);

// Export the router so it can be used in the main server file
module.exports = router;
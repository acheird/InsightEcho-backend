// Import database connection
const pool = require("../db"); 

// Function to add a review
const addReview = async (req, res) => {
  const { text, rating } = req.body;

  if (!text || !rating) {
    return res.status(400).json({ error: "Text and rating are required" });
  }

  try {
    const result = await pool.query(
      "INSERT INTO reviews (text, rating) VALUES ($1, $2) RETURNING *",
      [text, rating]
    );
    res.json(result.rows[0]); // Return the stored review
  } catch (error) {
    res.status(500).json({ error: "Database error" });
  }
};

// Function to analyze reviews (placeholder)
const getAnalysis = (req, res) => {
  res.json({ message: "Sentiment analysis not implemented yet." });
};

// Export functions
module.exports = { addReview, getAnalysis };

// Import database connection
const pool = require("../db");

const Sentiment = require("sentiment");
const sentiment = new Sentiment();
const config = require("../config");

const { calculateSentiment } = require("../utils/calculateSentiment");

// Stopwords
const STOPWORDS = new Set([
  "the",
  "is",
  "and",
  "or",
  "a",
  "an",
  "to",
  "in",
  "of",
  "for",
  "on",
  "with",
  "as",
]);

// Take review's text as input and clean it
const cleanText = (text) => {
  return text
    .toLowerCase()
    .replace(/[^a-zA-Z ]/gi, "") // Remove special characters
    .split(" ")
    .filter((word) => !STOPWORDS.has(word)) // Remove stopwords
    .join(" ");
};

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

// Function to analyze reviews
const getAnalysis = async (req, res) => {
  //console.log("Fetching reviews from database..."); // DEBUGGING

  try {
    const result = await pool.query("SELECT text, rating FROM reviews");

    //console.log("Query executed!");

    const reviews = result.rows;

    //console.log("Fetched reviews:", reviews);

    //console.log("Fetched reviews:", reviews.length); // DEBUGGING

    if (reviews.length === 0) {
      return res.json({ message: "There are not reviews for analysis" });
    }

    let analysisResult = calculateSentiment(reviews);

    res.json(analysisResult);
  } catch (error) {
    res.status(500).json({ error: "Error occurred during sentiment analysis" });
  }
};

// Export functions
module.exports = { addReview, getAnalysis };

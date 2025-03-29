// Import database connection
const pool = require("../db"); 

const Sentiment = require("sentiment");
const sentiment = new Sentiment();
const config = require("../config"); 

// Stopwords
const STOPWORDS = new Set([
  "the", "is", "and", "or", "a", "an", "to", "in", "of", "for", "on", "with", "as"
]);

// Take review's text as input and clean it
const cleanText = (text) => {
  return text
    .toLowerCase()
    .replace(/[^a-zA-Z ]/gi, '') // Remove special characters
    .split(" ")
    .filter(word => !STOPWORDS.has(word)) // Remove stopwords
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


// Function to calculate sentiment per review and gives back a sentiment analysis
const calculateSentiment = (reviews) => {
  let totalSentiment = 0;
  let sentimentByRating = {};
  let wordFrequency = {};
  let wordSentimentScores = {};

  reviews.forEach((review) => {
    let { text, rating } = review;

    // Checks if rating is is range (1-5)
    if (rating < 1 || rating > 5) {
      console.warn(`Skipping review with invalid rating: ${rating}`);
      return;
    }

    // Clean review's text
    text = cleanText(text);

    const analysis = sentiment.analyze(text);
    totalSentiment += analysis.score;

    if (!sentimentByRating[rating]) {
      sentimentByRating[rating] = { totalScore: 0, count: 0 };
    }
    sentimentByRating[rating].totalScore += analysis.score;
    sentimentByRating[rating].count++;

    analysis.words.forEach((word) => {
      wordFrequency[word] = (wordFrequency[word] || 0) + 1;
      wordSentimentScores[word] = (wordSentimentScores[word] || 0) + analysis.score;
    });
  });

  let sentimentTrends = {};
  for (let rating in sentimentByRating) {
    sentimentTrends[rating] = sentimentByRating[rating].totalScore / sentimentByRating[rating].count;
  }

  let sortedWords = Object.keys(wordSentimentScores)
    .map((word) => ({
      word,
      score: wordFrequency[word] ? wordSentimentScores[word] / wordFrequency[word] : 0,

    }))
    .sort((a, b) => b.score - a.score);

  let topPositiveWords = sortedWords.filter((w) => w.score > 0).slice(0, 10);
  let topNegativeWords = sortedWords.filter((w) => w.score < 0).slice(0, 10);

  return {
    totalReviews: reviews.length,
    averageSentiment: totalSentiment / reviews.length || 0,
    sentimentByRating: sentimentTrends,
    topPositiveWords,
    topNegativeWords,
  };
};

// Function to analyze reviews (placeholder)
const getAnalysis = async (req, res) => {

  console.log("Fetching reviews from database..."); // DEBUGGING

  try{
    const result = await pool.query("SELECT text, rating FROM reviews");
    
    console.log("Query executed!");
    
    const reviews = result.rows;

    console.log("Fetched reviews:", reviews);
    
    console.log("Fetched reviews:", reviews.length); // DEBUGGING

    if(reviews.length === 0){
      return res.json({message: "There are not reviews for analysis"})
    }

    let analysisResult = calculateSentiment(reviews);

    res.json(analysisResult);
  }catch (error){
    res.status(500).json({error: "Error occurred during sentiment analysis"})
  }
};

// Export functions
module.exports = { addReview, getAnalysis };

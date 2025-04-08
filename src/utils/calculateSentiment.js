const Sentiment = require("sentiment");
const sentiment = new Sentiment();
const { cleanText } = require("./textUtils");
const natural = require("natural");

const tokenizer = new natural.WordTokenizer();

function getNGrams(words, n) {
  const grams = [];
  for (let i = 0; i <= words.length - n; i++) {
    grams.push(words.slice(i, i + n).join(" "));
  }
  return grams;
}

const calculateSentiment = (reviews) => {
  let totalSentiment = 0;
  let sentimentByRating = {};
  let wordFrequency = {};
  let wordSentimentScores = {};
  let phraseSentiment = {};
  let phraseFrequency = {};

  reviews.forEach((review) => {
    let { text, rating } = review;

    if (rating < 1 || rating > 5) {
      console.warn(`Skipping invalid rating: ${rating}`);
      return;
    }

    const cleaned = cleanText(text);
    const analysis = sentiment.analyze(cleaned);
    totalSentiment += analysis.score;

    if (!sentimentByRating[rating]) {
      sentimentByRating[rating] = { totalScore: 0, count: 0 };
    }
    sentimentByRating[rating].totalScore += analysis.score;
    sentimentByRating[rating].count++;

    analysis.words.forEach((word) => {
      wordFrequency[word] = (wordFrequency[word] || 0) + 1;
      wordSentimentScores[word] =
        (wordSentimentScores[word] || 0) + analysis.score;
    });

    const words = tokenizer.tokenize(cleaned);
    const bigrams = getNGrams(words, 2);
    const trigrams = getNGrams(words, 3);
    const phrases = [...bigrams, ...trigrams];

    phrases.forEach((phrase) => {
      const phraseScore = sentiment.analyze(phrase).score;
      phraseSentiment[phrase] = (phraseSentiment[phrase] || 0) + phraseScore;
      phraseFrequency[phrase] = (phraseFrequency[phrase] || 0) + 1;
    });
  });

  const sentimentTrends = {};
  for (let rating in sentimentByRating) {
    sentimentTrends[rating] =
      sentimentByRating[rating].totalScore / sentimentByRating[rating].count;
  }

  const sortedWords = Object.keys(wordSentimentScores)
    .map((word) => ({
      word,
      score: wordFrequency[word]
        ? wordSentimentScores[word] / wordFrequency[word]
        : 0,
    }))
    .sort((a, b) => b.score - a.score);

  const sortedPhrases = Object.keys(phraseSentiment)
    .map((phrase) => ({
      phrase,
      score: phraseFrequency[phrase]
        ? phraseSentiment[phrase] / phraseFrequency[phrase]
        : 0,
    }))
    .sort((a, b) => b.score - a.score);

  return {
    totalReviews: reviews.length,
    averageSentiment: totalSentiment / reviews.length || 0,
    sentimentByRating: sentimentTrends,
    topPositiveWords: sortedWords.filter((w) => w.score > 0).slice(0, 10),
    topNegativeWords: sortedWords.filter((w) => w.score < 0).slice(0, 10),
    topPositivePhrases: sortedPhrases.filter((p) => p.score > 0).slice(0, 10),
    topNegativePhrases: sortedPhrases.filter((p) => p.score < 0).slice(0, 10),
    wordFrequency,
    wordSentimentScores,
    phraseFrequency,
    phraseSentiment,
  };
};

module.exports = { calculateSentiment };

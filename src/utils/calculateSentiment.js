const Sentiment = require("sentiment");
const sentiment = new Sentiment();
const { cleanText } = require("./textUtils");
const natural = require("natural");

const tokenizer = new natural.WordTokenizer();

function getNGrams(words, n) {
  return Array.from({ length: words.length - n + 1 }, (_, i) =>
    words.slice(i, i + n).join(" ")
  );
}

const calculateSentiment = (reviews) => {
  let totalSentiment = 0;
  const sentimentBuckets = {
    stronglyPositive: 0,
    mildlyPositive: 0,
    neutral: 0,
    mildlyNegative: 0,
    stronglyNegative: 0,
  };
  const sentimentByRating = {};
  const wordFrequency = {};
  const wordSentimentScores = {};
  const phraseSentiment = {};
  const phraseFrequency = {};

  const themes = {
    price: ["price", "expensive", "cheap", "cost", "pricing"],
    service: ["support", "customer", "service", "staff", "help"],
    delivery: ["delivery", "shipping", "arrived", "late", "on time"],
  };

  const themeSentiment = Object.keys(themes).reduce((acc, theme) => {
    acc[theme] = { total: 0, count: 0 };
    return acc;
  }, {});

  reviews.forEach(({ text, rating }) => {
    if (rating < 1 || rating > 5) {
      console.warn(`Skipping invalid rating: ${rating}`);
      return;
    }

    const cleaned = cleanText(text);
    const analysis = sentiment.analyze(cleaned);
    const { score, words } = analysis;
    totalSentiment += score;

    // Sentiment Buckets
    if (score > 3) sentimentBuckets.stronglyPositive++;
    else if (score > 1) sentimentBuckets.mildlyPositive++;
    else if (score >= -1) sentimentBuckets.neutral++;
    else if (score > -3) sentimentBuckets.mildlyNegative++;
    else sentimentBuckets.stronglyNegative++;

    // Theme-based sentiment
    const lowerText = cleaned.toLowerCase();
    Object.entries(themes).forEach(([theme, keywords]) => {
      if (keywords.some((k) => lowerText.includes(k))) {
        themeSentiment[theme].total += score;
        themeSentiment[theme].count++;
      }
    });

    // Sentiment by rating
    if (!sentimentByRating[rating])
      sentimentByRating[rating] = { totalScore: 0, count: 0 };
    sentimentByRating[rating].totalScore += score;
    sentimentByRating[rating].count++;

    // Word and Phrase Frequency Analysis
    words.forEach((word) => {
      wordFrequency[word] = (wordFrequency[word] || 0) + 1;
      wordSentimentScores[word] = (wordSentimentScores[word] || 0) + score;
    });

    const tokens = tokenizer.tokenize(cleaned);
    const bigrams = getNGrams(tokens, 2);
    const trigrams = getNGrams(tokens, 3);
    const phrases = [...bigrams, ...trigrams];

    phrases.forEach((phrase) => {
      const phraseScore = sentiment.analyze(phrase).score;
      phraseSentiment[phrase] = (phraseSentiment[phrase] || 0) + phraseScore;
      phraseFrequency[phrase] = (phraseFrequency[phrase] || 0) + 1;
    });
  });

  const sentimentTrends = Object.keys(sentimentByRating).reduce(
    (acc, rating) => {
      const { totalScore, count } = sentimentByRating[rating];
      acc[rating] = totalScore / count;
      return acc;
    },
    {}
  );

  const sortedWords = Object.entries(wordSentimentScores)
    .map(([word, score]) => ({
      word,
      score: wordFrequency[word] ? score / wordFrequency[word] : 0,
    }))
    .sort((a, b) => b.score - a.score);

  const sortedPhrases = Object.entries(phraseSentiment)
    .map(([phrase, score]) => ({
      phrase,
      score: phraseFrequency[phrase] ? score / phraseFrequency[phrase] : 0,
    }))
    .sort((a, b) => b.score - a.score);

  const frequentPositivePhrases = sortedPhrases
    .filter((p) => p.score > 1)
    .sort((a, b) => phraseFrequency[b.phrase] - phraseFrequency[a.phrase])
    .slice(0, 10);

  const frequentNegativePhrases = sortedPhrases
    .filter((p) => p.score < -1)
    .sort((a, b) => phraseFrequency[b.phrase] - phraseFrequency[a.phrase])
    .slice(0, 10);

  // Finalize average for themes
  Object.keys(themeSentiment).forEach((theme) => {
    const { total, count } = themeSentiment[theme];
    themeSentiment[theme].average = count > 0 ? total / count : 0;
  });

  return {
    totalReviews: reviews.length,
    averageSentiment: totalSentiment / reviews.length || 0,
    sentimentByRating: sentimentTrends,
    topPositiveWords: sortedWords.filter((w) => w.score > 0).slice(0, 10),
    topNegativeWords: sortedWords.filter((w) => w.score < 0).slice(0, 10),
    topPositivePhrases: sortedPhrases.filter((p) => p.score > 0).slice(0, 10),
    topNegativePhrases: sortedPhrases.filter((p) => p.score < 0).slice(0, 10),
    frequentPositivePhrases,
    frequentNegativePhrases,
    sentimentBuckets,
    themeSentiment,
    wordFrequency,
    wordSentimentScores,
    phraseFrequency,
    phraseSentiment,
  };
};

module.exports = { calculateSentiment };

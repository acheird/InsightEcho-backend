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

const cleanText = (text) => {
  return text
    .toLowerCase()
    .replace(/[^a-zA-Z ]/gi, "") // Remove special characters
    .split(" ")
    .filter((word) => !STOPWORDS.has(word)) // Remove stopwords
    .join(" ");
};

module.exports = { cleanText };

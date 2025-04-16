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
    .replace(/[^a-zA-Z ]/gi, "")
    .split(" ")
    .filter((word) => !STOPWORDS.has(word))
    .join(" ");
};

module.exports = { cleanText };

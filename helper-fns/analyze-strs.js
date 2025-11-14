const crypto = require("crypto");

//Compute SHA-256 hash
function computeSHA256(str) {
  return crypto.createHash("sha256").update(str).digest("hex");
}

// Analyze string properties
function analyzeString(value) {
  const length = value.length;

  // Check if palindrome (case-insensitive)
  const normalized = value.toLowerCase().replace(/\s/g, "");
  const is_palindrome = normalized === normalized.split("").reverse().join("");

  // Count unique characters
  const unique_characters = new Set(value).size;

  // Count words (split by whitespace)
  const word_count = value
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0).length;

  // Generate SHA-256 hash
  const sha256_hash = computeSHA256(value);

  // Character frequency map
  const character_frequency_map = {};
  for (const char of value) {
    character_frequency_map[char] = (character_frequency_map[char] || 0) + 1;
  }

  return {
    length,
    is_palindrome,
    unique_characters,
    word_count,
    sha256_hash,
    character_frequency_map,
  };
}

module.exports = { computeSHA256, analyzeString };

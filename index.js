const express = require("express");
const crypto = require("crypto");
const app = express();

app.use(express.json());

// In-memory storage (use database in production)
const strings = new Map();

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

// Parse natural language query
function parseNaturalLanguage(query) {
  const filters = {};
  const lowerQuery = query.toLowerCase();

  // Check for palindrome
  if (lowerQuery.includes("palindrome") || lowerQuery.includes("palindromic")) {
    filters.is_palindrome = true;
  }

  // Check for single word
  if (lowerQuery.includes("single word")) {
    filters.word_count = 1;
  }

  // Check for word count patterns
  const wordCountMatch = lowerQuery.match(/(\d+)\s+words?/);
  if (wordCountMatch) {
    filters.word_count = parseInt(wordCountMatch[1]);
  }

  // Check for length constraints
  const longerThanMatch = lowerQuery.match(/longer than (\d+)/);
  if (longerThanMatch) {
    filters.min_length = parseInt(longerThanMatch[1]) + 1;
  }

  const shorterThanMatch = lowerQuery.match(/shorter than (\d+)/);
  if (shorterThanMatch) {
    filters.max_length = parseInt(shorterThanMatch[1]) - 1;
  }

  // Check for specific character
  const containsMatch = lowerQuery.match(/containing (?:the letter |)([a-z])/);
  if (containsMatch) {
    filters.contains_character = containsMatch[1];
  }

  // Check for "first vowel" (interpret as 'a')
  if (lowerQuery.includes("first vowel")) {
    filters.contains_character = "a";
  }

  return filters;
}

// Apply filters to strings
function applyFilters(stringsArray, filters) {
  return stringsArray.filter((item) => {
    const { properties, value } = item;

    if (
      filters.is_palindrome !== undefined &&
      properties.is_palindrome !== filters.is_palindrome
    ) {
      return false;
    }

    if (
      filters.min_length !== undefined &&
      properties.length < filters.min_length
    ) {
      return false;
    }

    if (
      filters.max_length !== undefined &&
      properties.length > filters.max_length
    ) {
      return false;
    }

    if (
      filters.word_count !== undefined &&
      properties.word_count !== filters.word_count
    ) {
      return false;
    }

    if (
      filters.contains_character !== undefined &&
      !value.includes(filters.contains_character)
    ) {
      return false;
    }

    return true;
  });
}

// POST /strings - Create/Analyze String
app.post("/strings", (req, res) => {
  const { value } = req.body;

  // Validate request body
  if (!req.body.hasOwnProperty("value")) {
    return res
      .status(400)
      .json({ error: 'Missing "value" field in request body' });
  }

  if (typeof value !== "string") {
    return res
      .status(422)
      .json({ error: 'Invalid data type for "value" (must be string)' });
  }

  // Check if string already exists
  const hash = computeSHA256(value);
  if (strings.has(hash)) {
    return res
      .status(409)
      .json({ error: "String already exists in the system" });
  }

  // Analyze and store string
  const properties = analyzeString(value);
  const created_at = new Date().toISOString();

  const stringData = {
    id: hash,
    value,
    properties,
    created_at,
  };

  strings.set(hash, stringData);

  res.status(201).json(stringData);
});

// GET /strings/filter-by-natural-language - Natural Language Filtering
app.get("/strings/filter-by-natural-language", (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ error: 'Missing "query" parameter' });
  }

  try {
    const parsed_filters = parseNaturalLanguage(query);

    // Check for conflicting filters
    if (
      parsed_filters.min_length &&
      parsed_filters.max_length &&
      parsed_filters.min_length > parsed_filters.max_length
    ) {
      return res
        .status(422)
        .json({ error: "Query parsed but resulted in conflicting filters" });
    }

    const stringsArray = Array.from(strings.values());
    const filtered = applyFilters(stringsArray, parsed_filters);

    res.status(200).json({
      data: filtered,
      count: filtered.length,
      interpreted_query: {
        original: query,
        parsed_filters,
      },
    });
  } catch (error) {
    res.status(400).json({ error: "Unable to parse natural language query" });
  }
});

// GET /strings/:string_value - Get Specific String
app.get("/strings/:string_value", (req, res) => {
  const { string_value } = req.params;
  const hash = computeSHA256(string_value);

  const stringData = strings.get(hash);

  if (!stringData) {
    return res
      .status(404)
      .json({ error: "String does not exist in the system" });
  }

  res.status(200).json(stringData);
});

//  GET /strings - Get All Strings with Filtering
app.get("/strings", (req, res) => {
  const filters = {};

  // Parse query parameters
  if (req.query.is_palindrome !== undefined) {
    const val = req.query.is_palindrome.toLowerCase();
    if (val !== "true" && val !== "false") {
      return res.status(400).json({
        error: "Invalid value for is_palindrome (must be true or false)",
      });
    }
    filters.is_palindrome = val === "true";
  }

  if (req.query.min_length !== undefined) {
    const val = parseInt(req.query.min_length);
    if (isNaN(val) || val < 0) {
      return res.status(400).json({
        error: "Invalid value for min_length (must be non-negative integer)",
      });
    }
    filters.min_length = val;
  }

  if (req.query.max_length !== undefined) {
    const val = parseInt(req.query.max_length);
    if (isNaN(val) || val < 0) {
      return res.status(400).json({
        error: "Invalid value for max_length (must be non-negative integer)",
      });
    }
    filters.max_length = val;
  }

  if (req.query.word_count !== undefined) {
    const val = parseInt(req.query.word_count);
    if (isNaN(val) || val < 0) {
      return res.status(400).json({
        error: "Invalid value for word_count (must be non-negative integer)",
      });
    }
    filters.word_count = val;
  }

  if (req.query.contains_character !== undefined) {
    const val = req.query.contains_character;
    if (typeof val !== "string" || val.length !== 1) {
      return res.status(400).json({
        error:
          "Invalid value for contains_character (must be single character)",
      });
    }
    filters.contains_character = val;
  }

  const stringsArray = Array.from(strings.values());
  const filtered = applyFilters(stringsArray, filters);

  res.status(200).json({
    data: filtered,
    count: filtered.length,
    filters_applied: filters,
  });
});

//  DELETE /strings/:string_value - Delete String
app.delete("/strings/:string_value", (req, res) => {
  const { string_value } = req.params;
  const hash = computeSHA256(string_value);

  if (!strings.has(hash)) {
    return res
      .status(404)
      .json({ error: "String does not exist in the system" });
  }

  strings.delete(hash);
  res.status(204).send();
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Endpoint not found" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`String Analyzer API running on port ${PORT}`);
});

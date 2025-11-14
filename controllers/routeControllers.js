const { analyzeString } = require("../helper-fns/analyze-strs");
const { parseNaturalLanguage } = require("../helper-fns/nlquery");
const { applyFilters } = require("../helper-fns/filters");
const { computeSHA256 } = require("../helper-fns/analyze-strs");

const strings = new Map();

// POST /strings - Create/Analyze String
const createStr = (req, res) => {
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
};

// GET /strings/filter-by-natural-language - Natural Language Filtering
const filterByNaturalLanguage = (req, res) => {
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
};

// GET /strings/:string_value - Get Specific String
const getSpecificStr = (req, res) => {
  const hash = computeSHA256(string_value);

  const stringData = strings.get(hash);

  if (!stringData) {
    return res
      .status(404)
      .json({ error: "String does not exist in the system" });
  }

  res.status(200).json(stringData);
};

//  GET /strings - Get All Strings with Filtering
const getAllStrs = (req, res) => {
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
};

//  DELETE /strings/:string_value - Delete String
const deleteStr = (req, res) => {
  const { string_value } = req.params;
  const hash = computeSHA256(string_value);

  if (!strings.has(hash)) {
    return res
      .status(404)
      .json({ error: "String does not exist in the system" });
  }

  strings.delete(hash);
  res.status(204).send();
};

module.exports = {
  createStr,
  filterByNaturalLanguage,
  getSpecificStr,
  getAllStrs,
  deleteStr,
};

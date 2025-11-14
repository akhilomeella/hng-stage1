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
module.exports = { parseNaturalLanguage };

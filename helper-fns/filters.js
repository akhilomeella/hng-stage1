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

module.exports = { applyFilters };

# String Analyzer API

## 📖 Overview

A simple Node.js + Express API that analyzes strings and understands natural language filters.  
It supports string storage, analysis, and filtering through human-like queries.

---

## Features

- Analyze strings for:
  - Length
  - Word count
  - Palindrome check
  - Character frequency
- Parse natural language queries (e.g., “palindromes longer than 5 containing e”)
- Generate SHA-256 hash IDs for strings
- CRUD operations (add, fetch, delete)

---

## Endpoints

| Method     | Endpoint                             | Description                      |
| ---------- | ------------------------------------ | -------------------------------- |
| **POST**   | `/strings`                           | Add and analyze a string         |
| **GET**    | `/strings/value`                     | Retrieve a specific string by ID |
| **DELETE** | `/strings/value`                     | Delete a string                  |
| **GET**    | `/filter-by-natural-language?query=` | Parse natural language filters   |

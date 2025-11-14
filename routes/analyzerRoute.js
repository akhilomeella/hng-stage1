const router = require("express").Router();

const {
  createStr,
  filterByNaturalLanguage,
  getSpecificStr,
  getAllStrs,
  deleteStr,
} = require("../controllers/routeControllers");

router.post("/", createStr);
router.get("/filter-by-natural-language", filterByNaturalLanguage);
router.get("/:string_value", getSpecificStr);
router.get("/", getAllStrs);
router.delete("/:string_value", deleteStr);

module.exports = router;

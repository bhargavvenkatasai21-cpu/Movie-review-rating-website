const express = require("express");
const router = express.Router();

const {
  addReview,
  getReviewsByMovie,
  updateReview,
  deleteReview
} = require("../controllers/reviewController");

const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, addReview);
router.get("/:movieId", getReviewsByMovie);

router.put("/:id", protect, updateReview);
router.delete("/:id", protect, deleteReview);

module.exports = router;
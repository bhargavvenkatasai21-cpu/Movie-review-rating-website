const express = require("express");
const router = express.Router();

const {
  addReview,
  getReviewsByMovie,
  getMyReviews,
  updateReview,
  deleteReview
} = require("../controllers/reviewController");

const { protect } = require("../middleware/authMiddleware");

router.get("/myreviews", protect, getMyReviews);

router.post("/", protect, addReview);
router.get("/:movieId", getReviewsByMovie);
router.put("/:id", protect, updateReview);
router.delete("/:id", protect, deleteReview);

module.exports = router;
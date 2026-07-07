const Review = require("../models/Review");

const addReview = async (req, res) => {
  try {
    const { movieId, rating, review } = req.body;

    const existingReview = await Review.findOne({
      movieId,
      userId: req.user.id
    });

    if(existingReview){
      return res.status(400).json({
        message: "You have already reviewed this movie"
      });
    }

    const newReview = await Review.create({
      movieId,
      rating,
      review,
      userId: req.user.id
    });

    res.status(201).json(newReview);
  } 
    catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

const getReviewsByMovie = async (req, res) => {
  try {
    const reviews = await Review.find({
      movieId: req.params.movieId
    }).populate("userId", "name email");

    res.json(reviews);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

const getMyReviews = async (req, res) => {
  try {

    const reviews = await Review.find({
      userId: req.user.id
    })
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json(reviews);

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }
};

const updateReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        message: "Review not found"
      });
    }

    if (review.userId.toString() !== req.user.id) {
  return res.status(401).json({
    message: "Not Authorized"
  });
}

    review.rating = req.body.rating || review.rating;
    review.review = req.body.review || review.review;

    const updatedReview = await review.save();

    res.json(updatedReview);
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        message: "Review not found"
      });
    }

    if (review.userId.toString() !== req.user.id) {
  return res.status(401).json({
    message: "Not Authorized"
  });
}

    await review.deleteOne();

    res.json({
      message: "Review deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

module.exports = {
  addReview,
  getReviewsByMovie,
  getMyReviews,
  updateReview,
  deleteReview
};
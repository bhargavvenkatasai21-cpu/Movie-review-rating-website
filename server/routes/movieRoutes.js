const express = require("express");
const router = express.Router();

const {
    getPopularMovies,
    searchMovies,
    getMovieDetails
} = require("../controllers/movieController");

router.get("/popular", getPopularMovies);
router.get("/search", searchMovies);
router.get("/:id", getMovieDetails);

module.exports = router;
const express = require("express");
const router = express.Router();

const {
    addFavorite,
    getFavorites,
    removeFavorite
} = require("../controllers/favoriteController");

const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, addFavorite);

router.get("/", protect, getFavorites);

router.delete("/:movieId", protect, removeFavorite);

module.exports = router;
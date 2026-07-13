const mongoose = require("mongoose");

const favoriteSchema = new mongoose.Schema({

    movieId: {
        type: Number,
        required: true
    },

    title: {
        type: String,
        required: true
    },

    poster: {
        type: String,
        required: true
    },

    rating: {
        type: Number,
        required: true
    },

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    }

}, {
    timestamps: true
});

module.exports = mongoose.model(
    "Favorite",
    favoriteSchema
);
const Favorite = require("../models/Favorite");

//Add Favorite

const addFavorite = async (req, res) => {

    try {

        const {
            movieId,
            title,
            poster,
            rating
        } = req.body;

        const exists = await Favorite.findOne({
            movieId,
            userId: req.user.id
        });

        if (exists) {

            return res.status(400).json({
                message: "Movie already in favorites"
            });

        }

        const favorite = await Favorite.create({

            movieId,
            title,
            poster,
            rating,
            userId: req.user.id

        });

        res.status(201).json(favorite);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};

//My Favorites

const getFavorites = async (req, res) => {

    try {

        const favorites = await Favorite.find({
            userId: req.user.id
        }).sort({
            createdAt: -1
        });

        res.status(200).json(favorites);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};

//Remove Favorite

const removeFavorite = async (req, res) => {

    try {

        const favorite = await Favorite.findOne({

            movieId: req.params.movieId,
            userId: req.user.id

        });

        if (!favorite) {

            return res.status(404).json({
                message: "Favorite not found"
            });

        }

        await favorite.deleteOne();

        res.json({
            message: "Removed from favorites"
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};

module.exports = {

    addFavorite,
    getFavorites,
    removeFavorite

};
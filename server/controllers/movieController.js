const axios = require("axios");
const axiosRetry = require("axios-retry").default;

const tmdb = axios.create({
  baseURL: "https://api.themoviedb.org/3",
  timeout: 30000
});

axiosRetry(tmdb, {
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) => {
    return (
      axiosRetry.isNetworkError(error) ||
      error.code === "ECONNRESET" ||
      error.code === "ETIMEDOUT"
    );
  }
});

const getPopularMovies = async (req, res) => {
  try {

    const page = req.query.page || 1;

    const response = await tmdb.get(
      `/movie/popular?api_key=${process.env.TMDB_API_KEY}&page=${page}`
    );

    res.status(200).json({
      page: response.data.page,
      totalPages: response.data.total_pages,
      totalResults: response.data.total_results,
      results: response.data.results
    });

  } catch (error) {

    console.error("TMDB Popular Movies Error:", error.message);

    res.status(500).json({
      message: "Failed to fetch popular movies",
      error: error.message
    });

  }
};

const searchMovies = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({
        message: "Search query is required"
      });
    }

    const response = await tmdb.get(
      `/search/movie?api_key=${process.env.TMDB_API_KEY}&query=${encodeURIComponent(query)}`
    );

    res.json(response.data);

  } catch (error) {
    console.error("TMDB Search Error:", error.message);

    res.status(500).json({
      message: "Failed to search movies",
      error: error.message
    });
  }
};

const getMovieDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const response = await tmdb.get(
      `/movie/${id}?api_key=${process.env.TMDB_API_KEY}`
    );

    res.json(response.data);

  } catch (error) {
    console.error("TMDB Movie Details Error:", error.message);

    res.status(500).json({
      message: "Failed to fetch movie details",
      error: error.message
    });
  }
};

module.exports = {
  getPopularMovies,
  searchMovies,
  getMovieDetails
};
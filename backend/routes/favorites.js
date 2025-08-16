const express = require('express');
const User = require('../models/User');
const Movie = require('../models/Movie');
const { protect } = require('../middleware/auth');
const movieAPIService = require('../services/movieAPI');

const router = express.Router();

/**
 * @route   GET /api/favorites
 * @desc    Get user's favorite movies with full details
 * @access  Private
 */
router.get('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('favorites');
    
    if (!user.favorites || user.favorites.length === 0) {
      return res.json({
        success: true,
        favorites: [],
        count: 0
      });
    }

    // Get full movie details for each favorite
    const favoriteMovies = await Movie.find({
      imdbID: { $in: user.favorites },
      cacheExpiry: { $gt: new Date() }
    }).sort({ cachedAt: -1 });

    // If some movies are not in cache or expired, fetch from API
    const cachedImdbIds = favoriteMovies.map(movie => movie.imdbID);
    const missingIds = user.favorites.filter(id => !cachedImdbIds.includes(id));
    
    const additionalMovies = [];
    for (const imdbID of missingIds) {
      try {
        const result = await movieAPIService.getMovieWithCache(imdbID);
        if (result.success) {
          additionalMovies.push(result.movie);
        }
      } catch (error) {
        // Skip movies that can't be fetched
        continue;
      }
    }

    const allFavorites = [...favoriteMovies, ...additionalMovies];

    res.json({
      success: true,
      favorites: allFavorites,
      count: allFavorites.length,
      totalFavorites: user.favorites.length
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get favorites',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route   POST /api/favorites/:imdbID
 * @desc    Add movie to user's favorites
 * @access  Private
 */
router.post('/:imdbID', protect, async (req, res) => {
  try {
    const { imdbID } = req.params;
    
    // Validate IMDb ID format
    if (!imdbID || !imdbID.startsWith('tt')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid IMDb ID format'
      });
    }

    const user = await User.findById(req.user.id);
    
    // Check if already in favorites
    if (user.favorites.includes(imdbID)) {
      return res.status(400).json({
        success: false,
        message: 'Movie is already in favorites'
      });
    }

    // Check favorites limit
    if (user.favorites.length >= 100) {
      return res.status(400).json({
        success: false,
        message: 'Maximum 100 favorites allowed'
      });
    }

    // Add to favorites
    user.favorites.push(imdbID);
    await user.save();

    // Try to get movie details for response
    let movieDetails = null;
    try {
      const result = await movieAPIService.getMovieWithCache(imdbID);
      if (result.success) {
        movieDetails = result.movie;
      }
    } catch (error) {
      // Continue without movie details
    }

    res.status(201).json({
      success: true,
      message: 'Movie added to favorites',
      movie: movieDetails,
      favoritesCount: user.favorites.length
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to add favorite',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route   DELETE /api/favorites/:imdbID
 * @desc    Remove movie from user's favorites
 * @access  Private
 */
router.delete('/:imdbID', protect, async (req, res) => {
  try {
    const { imdbID } = req.params;
    
    const user = await User.findById(req.user.id);
    
    // Check if movie is in favorites
    if (!user.favorites.includes(imdbID)) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found in favorites'
      });
    }

    // Remove from favorites
    user.favorites = user.favorites.filter(id => id !== imdbID);
    await user.save();

    res.json({
      success: true,
      message: 'Movie removed from favorites',
      favoritesCount: user.favorites.length
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to remove favorite',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route   GET /api/favorites/check/:imdbID
 * @desc    Check if movie is in user's favorites
 * @access  Private
 */
router.get('/check/:imdbID', protect, async (req, res) => {
  try {
    const { imdbID } = req.params;
    const user = await User.findById(req.user.id).select('favorites');
    
    const isFavorite = user.favorites.includes(imdbID);
    
    res.json({
      success: true,
      isFavorite,
      favoritesCount: user.favorites.length
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to check favorite status',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;

const express = require('express');
const Movie = require('../models/Movie');
const movieAPIService = require('../services/movieAPI');
const { adminOnly, authOptional } = require('../middleware/adminAuth');
const router = express.Router();

/**
 * @route   GET /api/movies/recent
 * @desc    Get recently searched movies from cache
 * @access  Public
 */
router.get('/recent', async (req, res) => {
  try {
    const { limit = 12 } = req.query;
    
    // Get recently cached movies (by cachedAt date)
    const recentMovies = await Movie.find({
      cacheExpiry: { $gt: new Date() }, // Only non-expired movies
      poster: { $ne: null } // Only movies with posters for better UI
    })
    .sort({ cachedAt: -1 }) // Most recently cached first
    .limit(parseInt(limit))
    .select('imdbID title year genre rating poster plot searchTerms cachedAt');
    
    // Get popular search terms
    const searchTermStats = await Movie.aggregate([
      { $match: { cacheExpiry: { $gt: new Date() } } },
      { $unwind: '$searchTerms' },
      { $group: {
          _id: '$searchTerms',
          count: { $sum: 1 },
          movies: { $push: { title: '$title', rating: '$rating', year: '$year' } }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);
    
    res.json({
      success: true,
      recentMovies,
      totalRecent: recentMovies.length,
      popularSearchTerms: searchTermStats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Recent movies error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get recent movies',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/movies/cache-status/:searchTerm
 * @desc    Check if search term has cached results
 * @access  Public
 */
router.get('/cache-status/:searchTerm', async (req, res) => {
  try {
    const { searchTerm } = req.params;
    const cachedCount = await Movie.countDocuments({
      searchTerms: { $in: [searchTerm.toLowerCase()] },
      cacheExpiry: { $gt: new Date() }
    });
    
    res.json({
      success: true,
      searchTerm,
      cachedMovies: cachedCount,
      needsAPIFetch: cachedCount === 0,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to check cache status',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/movies/test-api
 * @desc    Test OMDb API connection
 * @access  Public (for debugging)
 */
router.get('/test-api', async (req, res) => {
  try {
    console.log('🧪 Testing OMDb API connection...');
    const testResult = await movieAPIService.searchMoviesExternal('batman', 1);
    
    res.json({
      success: true,
      message: 'OMDb API test completed',
      apiKeyStatus: process.env.OMDB_API_KEY ? 'Custom key configured' : 'Using demo key',
      testResult: {
        success: testResult.success,
        error: testResult.error || null,
        resultsCount: testResult.results?.length || 0,
        totalResults: testResult.totalResults || 0,
        firstResult: testResult.results?.[0] || null
      },
      debugInfo: {
        apiKeyPresent: !!process.env.OMDB_API_KEY,
        apiKeyPreview: process.env.OMDB_API_KEY ? 
          `${process.env.OMDB_API_KEY.substring(0, 4)}****` : 
          'b8ea****',
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('🧪 API Test Error:', error);
    res.status(500).json({
      success: false,
      message: 'API test failed',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/movies/search
 * @desc    Search movies with filtering and sorting
 * @access  Public
 * @params  ?search=term&sort=field&filter=genre:Action&page=1&limit=10
 */
router.get('/search', authOptional, async (req, res) => {
  try {
    const {
      search = '',
      sort = 'rating',
      filter,
      page = 1,
      limit = 10,
      forceRefresh = false
    } = req.query;
    
    // Extract individual filter values
    let year = null;
    let minRating = null;
    let genre = null;
    let genres = [];
    
    // Parse filters - handle both single and multiple filter values
    if (filter) {
      const filterArray = Array.isArray(filter) ? filter : [filter];
      
      filterArray.forEach(f => {
        const filterParts = f.split(':');
        if (filterParts.length === 2) {
          const [field, value] = filterParts;
          switch (field.toLowerCase()) {
            case 'genre':
              genres.push(value);
              break;
            case 'year':
              year = parseInt(value);
              break;
            case 'rating':
              if (value.startsWith('>=')) {
                minRating = parseFloat(value.replace('>=', ''));
              }
              break;
          }
        }
      });
    }

    let query = {};
    let sortOptions = {};

    // Build fallback cache query (only used if API filtering fails)
    if (search.trim()) {
      query = {
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { actors: { $elemMatch: { $regex: search, $options: 'i' } } },
          { director: { $regex: search, $options: 'i' } }
        ]
      };
    }

    // Only include non-expired cache entries
    query.cacheExpiry = { $gt: new Date() };

    // Build sort options
    switch (sort.toLowerCase()) {
      case 'rating':
        sortOptions = { rating: -1, year: -1 };
        break;
      case 'year':
        sortOptions = { year: -1, rating: -1 };
        break;
      case 'title':
        sortOptions = { title: 1 };
        break;
      case 'popularity':
        sortOptions = { totalSearches: -1, rating: -1 };
        break;
      default:
        sortOptions = { rating: -1, year: -1 };
    }

    // Smart filtering and caching - apply filters during API fetch for instant results
    if (search.trim()) {
      const searchFilters = {
        forceRefresh: forceRefresh === 'true',
        year: year || null,
        minRating: minRating || null,
        genres: genres || []
      };
      
      const startTime = Date.now();
      
      // This will apply filters DURING the API fetch process, not after
      const result = await movieAPIService.searchAndCacheMovies(search, searchFilters);
      
      const duration = Date.now() - startTime;
      
      if (result.success) {
        // Return filtered results directly - no need for additional processing
        return res.json({
          success: true,
          movies: result.movies,
          totalResults: result.totalResults,
          source: result.source,
          searchTerm: search,
          appliedFilters: searchFilters,
          processingTime: `${duration}ms`
        });
      }
    }

    // Execute query with pagination
    const pageNum = parseInt(page);
    const limitNum = Math.min(parseInt(limit), 50); // Max 50 results per page
    const skip = (pageNum - 1) * limitNum;

    const [movies, total] = await Promise.all([
      Movie.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum)
        .select('-__v -searchTerms'),
      Movie.countDocuments(query)
    ]);

    res.json({
      success: true,
      movies,
      totalResults: total,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
        hasNextPage: pageNum < Math.ceil(total / limitNum),
        hasPrevPage: pageNum > 1
      },
      filters: {
        search,
        sort,
        filter
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to search movies. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * @route   GET /api/movies/:id
 * @desc    Get specific movie details by IMDb ID
 * @access  Public
 */
router.get('/:id', authOptional, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate IMDb ID format (basic validation)
    if (!id.startsWith('tt') || id.length < 9) {
      return res.status(400).json({
        success: false,
        message: 'Invalid IMDb ID format'
      });
    }

    const result = await movieAPIService.getMovieWithCache(id);
    
    if (!result.success) {
      return res.status(404).json({
        success: false,
        message: result.error || 'Movie not found'
      });
    }

    res.json({
      success: true,
      movie: result.movie,
      source: result.source
    });
  } catch (error) {
    console.error('Movie details error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch movie details',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/movies/analytics/genres
 * @desc    Get genre statistics and analytics
 * @access  Public
 */
router.get('/analytics/genres', authOptional, async (req, res) => {
  try {
    const genreStats = await Movie.getGenreStats();
    
    res.json({
      success: true,
      analytics: {
        type: 'genres',
        data: genreStats,
        totalGenres: genreStats.length,
        generatedAt: new Date()
      }
    });
  } catch (error) {
    console.error('Genre analytics error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch genre analytics'
    });
  }
});

/**
 * @route   GET /api/movies/analytics/ratings
 * @desc    Get rating statistics and analytics
 * @access  Public
 */
router.get('/analytics/ratings', authOptional, async (req, res) => {
  try {
    const ratingStats = await Movie.getRatingStats();
    
    res.json({
      success: true,
      analytics: {
        type: 'ratings',
        data: ratingStats[0] || {
          avgRating: 0,
          minRating: 0,
          maxRating: 0,
          totalMovies: 0
        },
        generatedAt: new Date()
      }
    });
  } catch (error) {
    console.error('Rating analytics error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch rating analytics'
    });
  }
});

/**
 * @route   GET /api/movies/analytics/runtime
 * @desc    Get runtime statistics by year
 * @access  Public
 */
router.get('/analytics/runtime', authOptional, async (req, res) => {
  try {
    const runtimeStats = await Movie.getRuntimeByYear();
    
    res.json({
      success: true,
      analytics: {
        type: 'runtime',
        data: runtimeStats,
        totalYears: runtimeStats.length,
        generatedAt: new Date()
      }
    });
  } catch (error) {
    console.error('Runtime analytics error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch runtime analytics'
    });
  }
});

/**
 * @route   GET /api/movies/analytics/dashboard
 * @desc    Get combined analytics for dashboard
 * @access  Public
 */
router.get('/analytics/dashboard', authOptional, async (req, res) => {
  try {
    const [genreStats, ratingStats, runtimeStats, totalMovies, recentMovies] = await Promise.all([
      Movie.getGenreStats(),
      Movie.getRatingStats(),
      Movie.getRuntimeByYear(),
      Movie.countDocuments({ cacheExpiry: { $gt: new Date() } }),
      Movie.find({ cacheExpiry: { $gt: new Date() } })
        .sort({ lastFetched: -1 })
        .limit(5)
        .select('title year rating poster lastFetched')
    ]);

    const topGenres = genreStats.slice(0, 10);
    const topRuntimeYears = runtimeStats.slice(0, 10);

    res.json({
      success: true,
      dashboard: {
        summary: {
          totalMovies,
          totalGenres: genreStats.length,
          avgRating: ratingStats[0]?.avgRating || 0,
          totalYears: runtimeStats.length
        },
        topGenres,
        ratingDistribution: ratingStats[0] || {
          avgRating: 0,
          minRating: 0,
          maxRating: 0,
          totalMovies: 0
        },
        runtimeByYear: topRuntimeYears,
        recentMovies,
        generatedAt: new Date()
      }
    });
  } catch (error) {
    console.error('Dashboard analytics error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard analytics'
    });
  }
});

/**
 * @route   DELETE /api/movies/:id
 * @desc    Delete movie from cache (Admin only)
 * @access  Private (Admin)
 */
router.delete('/:id', adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    
    const movie = await Movie.findOneAndDelete({ imdbID: id });
    
    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found in cache'
      });
    }

    res.json({
      success: true,
      message: 'Movie deleted from cache',
      deletedMovie: {
        imdbID: movie.imdbID,
        title: movie.title,
        year: movie.year
      }
    });
  } catch (error) {
    console.error('Movie deletion error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to delete movie'
    });
  }
});

/**
 * @route   POST /api/movies/cache/refresh
 * @desc    Force refresh movie cache (Admin only)
 * @access  Private (Admin)
 */
router.post('/cache/refresh', adminOnly, async (req, res) => {
  try {
    const { search } = req.body;
    
    if (!search) {
      return res.status(400).json({
        success: false,
        message: 'Search term is required'
      });
    }

    const result = await movieAPIService.searchAndCacheMovies(search, { forceRefresh: true });
    
    res.json({
      success: true,
      message: 'Cache refreshed successfully',
      refreshed: {
        searchTerm: search,
        moviesCount: result.movies?.length || 0,
        source: result.source
      }
    });
  } catch (error) {
    console.error('Cache refresh error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to refresh cache'
    });
  }
});

/**
 * @route   DELETE /api/movies/cache/cleanup
 * @desc    Clean up expired cache entries (Admin only)
 * @access  Private (Admin)
 */
router.delete('/cache/cleanup', adminOnly, async (req, res) => {
  try {
    const deletedCount = await movieAPIService.cleanExpiredCache();
    
    res.json({
      success: true,
      message: 'Cache cleanup completed',
      deletedCount
    });
  } catch (error) {
    console.error('Cache cleanup error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to clean up cache'
    });
  }
});

/**
 * @route   GET /api/movies/cache/stats
 * @desc    Get cache statistics (Admin only)
 * @access  Private (Admin)
 */
router.get('/cache/stats', adminOnly, async (req, res) => {
  try {
    const [totalMovies, expiredMovies, recentMovies, topSearched] = await Promise.all([
      Movie.countDocuments(),
      Movie.countDocuments({ cacheExpiry: { $lte: new Date() } }),
      Movie.countDocuments({ lastFetched: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } }),
      Movie.find().sort({ totalSearches: -1 }).limit(10).select('title totalSearches lastSearched')
    ]);

    res.json({
      success: true,
      cacheStats: {
        totalMovies,
        activeMovies: totalMovies - expiredMovies,
        expiredMovies,
        recentMovies,
        topSearched,
        generatedAt: new Date()
      }
    });
  } catch (error) {
    console.error('Cache stats error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch cache statistics'
    });
  }
});

module.exports = router;

const axios = require('axios');
const Movie = require('../models/Movie');

class MovieAPIService {
  constructor() {
    // Free OMDb API key (you can get your own from http://www.omdbapi.com/apikey.aspx)
    this.OMDB_API_KEY = process.env.OMDB_API_KEY || 'b8eab4c8'; // Demo key
    this.OMDB_BASE_URL = 'http://www.omdbapi.com/';
    this.REQUEST_DELAY = 1000; // 1 second delay between requests (API limit)
    
    // Debug API key status
    if (!process.env.OMDB_API_KEY) {
      console.warn('Using demo OMDb API key. Get your free key from: http://www.omdbapi.com/apikey.aspx');
    }
  }

  /**
   * Search movies by title from OMDb API
   * @param {string} searchTerm - Movie title to search
   * @param {number} page - Page number (default 1)
   * @param {number|null} year - Year filter (supported by OMDb API)
   * @returns {Promise<Object>} Search results
   */
  async searchMoviesExternal(searchTerm, page = 1, year = null) {
    try {
      const requestUrl = `${this.OMDB_BASE_URL}?apikey=${this.OMDB_API_KEY}&s=${encodeURIComponent(searchTerm)}&page=${page}&type=movie`;

      
      const params = {
        apikey: this.OMDB_API_KEY,
        s: searchTerm,
        page: page,
        type: 'movie'
      };
      
      // Add year filter if provided (OMDb API supports this)
      if (year) {
        params.y = year;
      }

      const response = await axios.get(this.OMDB_BASE_URL, {
        params,
        timeout: 10000
      });



      if (response.data.Response === 'False') {

        return {
          success: false,
          error: response.data.Error,
          results: [],
          totalResults: 0
        };
      }


      
      return {
        success: true,
        results: response.data.Search || [],
        totalResults: parseInt(response.data.totalResults) || 0,
        page: page
      };
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('OMDb API Search Error:', error.message);
        if (error.response) {
          console.error('Error Response:', error.response.data);
        }
      }
      return {
        success: false,
        error: `Failed to fetch movies from external API: ${error.message}`,
        results: [],
        totalResults: 0
      };
    }
  }

  /**
   * Get detailed movie information by IMDb ID
   * @param {string} imdbID - IMDb ID of the movie
   * @returns {Promise<Object>} Detailed movie data
   */
  async getMovieDetailsExternal(imdbID) {
    try {
      const response = await axios.get(this.OMDB_BASE_URL, {
        params: {
          apikey: this.OMDB_API_KEY,
          i: imdbID,
          plot: 'full'
        },
        timeout: 10000
      });

      if (response.data.Response === 'False') {
        return {
          success: false,
          error: response.data.Error
        };
      }

      return {
        success: true,
        movie: this.normalizeMovieData(response.data)
      };
    } catch (error) {
      console.error('OMDb API Details Error:', error.message);
      return {
        success: false,
        error: 'Failed to fetch movie details from external API'
      };
    }
  }

  /**
   * Normalize and transform OMDb API data to our schema
   * @param {Object} omdbData - Raw data from OMDb API
   * @returns {Object} Normalized movie data
   */
  normalizeMovieData(omdbData) {
    const normalized = {
      imdbID: omdbData.imdbID,
      title: omdbData.Title,
      year: parseInt(omdbData.Year) || null,
      released: omdbData.Released,
      runtime: omdbData.Runtime,
      genre: omdbData.Genre ? omdbData.Genre.split(', ').map(g => g.trim()) : [],
      director: omdbData.Director,
      writer: omdbData.Writer,
      actors: omdbData.Actors ? omdbData.Actors.split(', ').map(a => a.trim()) : [],
      plot: omdbData.Plot,
      language: omdbData.Language,
      country: omdbData.Country,
      poster: omdbData.Poster !== 'N/A' ? omdbData.Poster : null,
      ratings: [],
      type: omdbData.Type || 'movie'
    };

    // Parse IMDb rating
    if (omdbData.imdbRating && omdbData.imdbRating !== 'N/A') {
      normalized.rating = parseFloat(omdbData.imdbRating);
      normalized.imdbRating = omdbData.imdbRating;
    }

    // Parse Metascore
    if (omdbData.Metascore && omdbData.Metascore !== 'N/A') {
      normalized.metascore = parseInt(omdbData.Metascore);
    }

    // Store IMDb votes
    if (omdbData.imdbVotes) {
      normalized.imdbVotes = omdbData.imdbVotes;
    }

    // Parse ratings array
    if (omdbData.Ratings && Array.isArray(omdbData.Ratings)) {
      normalized.ratings = omdbData.Ratings.map(rating => ({
        source: rating.Source,
        value: rating.Value
      }));
    }

    // Parse runtime to minutes
    if (omdbData.Runtime && omdbData.Runtime !== 'N/A') {
      const match = omdbData.Runtime.match(/(\d+)/);
      if (match) {
        normalized.runtimeMinutes = parseInt(match[1]);
      }
    }

    return normalized;
  }

  /**
   * Search and cache movies with filters applied during API fetch for instant results
   * @param {string} searchTerm - Search term
   * @param {Object} filters - Filters to apply during fetch (year, minRating, genres)
   * @returns {Promise<Object>} Filtered movies from cache or API
   */
  async searchAndCacheMovies(searchTerm, filters = {}) {
    const { page = 1, forceRefresh = false, year = null, minRating = null, genres = [] } = filters;

    try {
      // Build cache query with filters
      let cacheQuery = {
        searchTerms: { $in: [searchTerm.toLowerCase()] }
      };
      
      // Add year filter to cache query
      if (year) {
        cacheQuery.year = parseInt(year);
      }
      
      // Add rating filter to cache query
      if (minRating) {
        cacheQuery.rating = { $gte: parseFloat(minRating) };
      }
      
      // Add genre filter to cache query
      if (genres.length > 0) {
        cacheQuery.genre = { 
          $in: genres.map(g => new RegExp(g, 'i'))
        };
      }

      // First, try to find cached movies with filters
      if (!forceRefresh) {
        const cachedMovies = await Movie.findFresh(cacheQuery)
          .sort({ rating: -1, year: -1 });

        if (cachedMovies.length > 0) {

          return {
            success: true,
            movies: cachedMovies,
            source: 'cache',
            totalResults: cachedMovies.length
          };
        }
      }

      // If no cache or force refresh, fetch from external API with filters

      const searchResult = await this.searchMoviesExternal(searchTerm, page, year);

      if (!searchResult.success || searchResult.results.length === 0) {
        return {
          success: false,
          error: searchResult.error || 'No movies found',
          movies: [],
          totalResults: 0
        };
      }

      // Process movies with filters applied during fetch - MUCH FASTER!
      const filteredMovies = [];
      const BATCH_SIZE = 5; // Process 5 movies at a time for speed
      

      
      for (let i = 0; i < searchResult.results.length; i += BATCH_SIZE) {
        const batch = searchResult.results.slice(i, i + BATCH_SIZE);
        
        const batchPromises = batch.map(async (movieBasic, index) => {
          try {
            // Minimal delay for parallel processing
            await new Promise(resolve => setTimeout(resolve, index * 200));

            const detailResult = await this.getMovieDetailsExternal(movieBasic.imdbID);
            
            if (!detailResult.success) return null;
            
            const movieData = detailResult.movie;
            
            // Apply genre filter during fetch - only process matching movies
            if (genres.length > 0) {
              const movieGenres = movieData.genre || [];
              const hasMatchingGenre = movieGenres.some(genre => 
                genres.some(selectedGenre => 
                  genre.toLowerCase().includes(selectedGenre.toLowerCase())
                )
              );
              if (!hasMatchingGenre) {
                return null; // Skip this movie
              }
            }
            
            // Apply rating filter during fetch - only process matching movies
            if (minRating && movieData.rating) {
              if (movieData.rating < parseFloat(minRating)) {
                return null; // Skip this movie
              }
            }
            
            // Movie passed all filters - cache it for faster future searches
            let existingMovie = await Movie.findOne({ imdbID: movieBasic.imdbID });
            
            if (existingMovie && !existingMovie.isCacheExpired()) {
              // Update existing movie
              existingMovie.searchTerms = [...new Set([...existingMovie.searchTerms, searchTerm.toLowerCase()])];
              existingMovie.refreshCache();
              await existingMovie.save({ validateBeforeSave: false });
              return existingMovie;
            } else {
              // Create new movie entry
              const newMovie = new Movie({
                ...movieData,
                searchTerms: [searchTerm.toLowerCase()],
                totalSearches: 1
              });
              await newMovie.save({ validateBeforeSave: false });
              return newMovie;
            }
          } catch (error) {

            return null;
          }
        });

        // Wait for current batch to complete
        const batchResults = await Promise.all(batchPromises);
        const validResults = batchResults.filter(movie => movie !== null);
        filteredMovies.push(...validResults);
      }


      
      return {
        success: true,
        movies: filteredMovies,
        source: 'api',
        totalResults: filteredMovies.length
      };
    } catch (error) {

      return {
        success: false,
        error: 'Failed to search and cache movies',
        movies: [],
        totalResults: 0
      };
    }
  }

  /**
   * Get a specific movie by IMDb ID with caching
   * @param {string} imdbID - IMDb ID
   * @returns {Promise<Object>} Movie details
   */
  async getMovieWithCache(imdbID) {
    try {
      // Check cache first
      let movie = await Movie.findOne({ imdbID });
      
      if (movie && !movie.isCacheExpired()) {
        movie.refreshCache();
        await movie.save();
        return {
          success: true,
          movie,
          source: 'cache'
        };
      }

      // Fetch from API
      const result = await this.getMovieDetailsExternal(imdbID);
      
      if (!result.success) {
        return result;
      }

      // Update or create movie in cache
      if (movie) {
        Object.assign(movie, result.movie);
        movie.refreshCache();
        await movie.save();
      } else {
        movie = new Movie(result.movie);
        await movie.save();
      }

      return {
        success: true,
        movie,
        source: 'api'
      };
    } catch (error) {

      return {
        success: false,
        error: 'Failed to retrieve movie'
      };
    }
  }

  /**
   * Clean up expired cache entries
   * @returns {Promise<number>} Number of deleted entries
   */
  async cleanExpiredCache() {
    try {
      const result = await Movie.deleteMany({
        cacheExpiry: { $lte: new Date() }
      });


      return result.deletedCount;
    } catch (error) {

      return 0;
    }
  }
}

module.exports = new MovieAPIService();

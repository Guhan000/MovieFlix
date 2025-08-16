const cron = require('node-cron');
const movieAPIService = require('./movieAPI');
const Movie = require('../models/Movie');

class CacheManager {
  constructor() {
    this.isScheduled = false;
  }

  /**
   * Initialize cache management with scheduled tasks
   */
  initialize() {
    if (this.isScheduled) return;

    console.log('📅 Initializing cache management scheduler...');

    // Schedule cache cleanup every 24 hours at 2 AM
    cron.schedule('0 2 * * *', async () => {
      console.log('🧹 Running scheduled cache cleanup...');
      await this.performScheduledCleanup();
    });

    // Schedule cache statistics logging every 6 hours
    cron.schedule('0 */6 * * *', async () => {
      console.log('📊 Generating cache statistics...');
      await this.logCacheStatistics();
    });

    // Initial cleanup on startup (but delayed to allow DB connection)
    setTimeout(() => {
      this.performInitialCleanup();
    }, 5000);

    this.isScheduled = true;
    console.log('✅ Cache management scheduler initialized');
  }

  /**
   * Perform initial cleanup on application startup
   */
  async performInitialCleanup() {
    try {
      console.log('🔍 Performing initial cache cleanup...');
      
      const stats = await this.getCacheStatistics();
      console.log(`📊 Cache Status: ${stats.activeMovies} active, ${stats.expiredMovies} expired movies`);

      if (stats.expiredMovies > 0) {
        const deletedCount = await movieAPIService.cleanExpiredCache();
        console.log(`🧹 Cleaned up ${deletedCount} expired entries on startup`);
      }
    } catch (error) {
      console.error('❌ Initial cache cleanup failed:', error.message);
    }
  }

  /**
   * Perform scheduled cache cleanup
   */
  async performScheduledCleanup() {
    try {
      const startTime = Date.now();
      const deletedCount = await movieAPIService.cleanExpiredCache();
      const duration = Date.now() - startTime;

      console.log(`🧹 Scheduled cleanup completed: ${deletedCount} entries deleted in ${duration}ms`);
      
      // Log statistics after cleanup
      await this.logCacheStatistics();
    } catch (error) {
      console.error('❌ Scheduled cache cleanup failed:', error.message);
    }
  }

  /**
   * Get comprehensive cache statistics
   */
  async getCacheStatistics() {
    try {
      const [
        totalMovies,
        activeMovies,
        expiredMovies,
        recentMovies,
        oldMovies,
        topSearched,
        genreDistribution
      ] = await Promise.all([
        Movie.countDocuments(),
        Movie.countDocuments({ cacheExpiry: { $gt: new Date() } }),
        Movie.countDocuments({ cacheExpiry: { $lte: new Date() } }),
        Movie.countDocuments({ 
          lastFetched: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } 
        }),
        Movie.countDocuments({ 
          lastFetched: { $lte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } 
        }),
        Movie.find({})
          .sort({ totalSearches: -1 })
          .limit(5)
          .select('title totalSearches lastSearched'),
        Movie.aggregate([
          { $match: { cacheExpiry: { $gt: new Date() } } },
          { $unwind: '$genre' },
          { $group: { _id: '$genre', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 10 }
        ])
      ]);

      return {
        totalMovies,
        activeMovies,
        expiredMovies,
        recentMovies,
        oldMovies,
        topSearched,
        genreDistribution,
        cacheEfficiency: totalMovies > 0 ? ((activeMovies / totalMovies) * 100).toFixed(2) : 0
      };
    } catch (error) {
      console.error('❌ Failed to get cache statistics:', error.message);
      return null;
    }
  }

  /**
   * Log cache statistics
   */
  async logCacheStatistics() {
    try {
      const stats = await this.getCacheStatistics();
      
      if (stats) {
        console.log('📊 Cache Statistics:');
        console.log(`   Total Movies: ${stats.totalMovies}`);
        console.log(`   Active Movies: ${stats.activeMovies}`);
        console.log(`   Expired Movies: ${stats.expiredMovies}`);
        console.log(`   Cache Efficiency: ${stats.cacheEfficiency}%`);
        console.log(`   Recent Additions (24h): ${stats.recentMovies}`);
        console.log(`   Top Genres: ${stats.genreDistribution.slice(0, 3).map(g => `${g._id} (${g.count})`).join(', ')}`);
      }
    } catch (error) {
      console.error('❌ Failed to log cache statistics:', error.message);
    }
  }

  /**
   * Manual cache optimization
   */
  async optimizeCache() {
    try {
      console.log('⚡ Starting cache optimization...');
      const startTime = Date.now();

      // Remove expired entries
      const expiredDeleted = await movieAPIService.cleanExpiredCache();

      // Remove movies that haven't been searched in 30 days
      const oldMoviesResult = await Movie.deleteMany({
        lastSearched: { $lte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        totalSearches: { $lte: 1 }
      });

      const duration = Date.now() - startTime;

      console.log(`✅ Cache optimization completed in ${duration}ms:`);
      console.log(`   Expired entries removed: ${expiredDeleted}`);
      console.log(`   Old unused entries removed: ${oldMoviesResult.deletedCount}`);

      return {
        success: true,
        expiredDeleted,
        oldDeleted: oldMoviesResult.deletedCount,
        duration
      };
    } catch (error) {
      console.error('❌ Cache optimization failed:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Preload popular movie searches for better performance
   */
  async preloadPopularMovies() {
    const popularSearches = [
      'batman', 'spider-man', 'avengers', 'star wars', 'harry potter',
      'lord of the rings', 'marvel', 'disney', 'pixar', 'james bond'
    ];

    console.log('🔄 Preloading popular movie searches...');

    for (const search of popularSearches) {
      try {
        await movieAPIService.searchAndCacheMovies(search, { forceRefresh: false });
        console.log(`✓ Preloaded: ${search}`);
        
        // Add delay to respect API limits
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (error) {
        console.error(`❌ Failed to preload ${search}:`, error.message);
      }
    }

    console.log('✅ Popular movies preloading completed');
  }

  /**
   * Get cache health report
   */
  async getCacheHealthReport() {
    try {
      const stats = await this.getCacheStatistics();
      
      if (!stats) return null;

      const health = {
        status: 'healthy',
        issues: [],
        recommendations: []
      };

      // Check cache efficiency
      if (stats.cacheEfficiency < 70) {
        health.status = 'warning';
        health.issues.push(`Low cache efficiency: ${stats.cacheEfficiency}%`);
        health.recommendations.push('Run cache cleanup to improve efficiency');
      }

      // Check for too many expired entries
      if (stats.expiredMovies > stats.activeMovies * 0.3) {
        health.status = 'warning';
        health.issues.push(`High number of expired entries: ${stats.expiredMovies}`);
        health.recommendations.push('Schedule more frequent cache cleanups');
      }

      // Check for old unused data
      if (stats.oldMovies > stats.totalMovies * 0.2) {
        health.issues.push(`Many old unused entries: ${stats.oldMovies}`);
        health.recommendations.push('Consider removing old unused movie data');
      }

      if (health.issues.length === 0) {
        health.status = 'excellent';
        health.message = 'Cache is operating optimally';
      }

      return {
        ...health,
        stats,
        generatedAt: new Date()
      };
    } catch (error) {
      console.error('❌ Failed to generate cache health report:', error.message);
      return {
        status: 'error',
        error: error.message,
        generatedAt: new Date()
      };
    }
  }
}

module.exports = new CacheManager();

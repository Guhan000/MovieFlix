const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
  // External API identifiers
  imdbID: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  // Basic movie information
  title: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  year: {
    type: Number,
    required: true,
    index: true
  },
  released: {
    type: String
  },
  runtime: {
    type: String
  },
  runtimeMinutes: {
    type: Number // Calculated field for aggregation
  },
  // Movie details
  genre: [{
    type: String,
    index: true
  }],
  director: {
    type: String
  },
  writer: {
    type: String
  },
  actors: [{
    type: String
  }],
  plot: {
    type: String
  },
  language: {
    type: String
  },
  country: {
    type: String
  },
  // Ratings and scores
  rating: {
    type: Number, // IMDb rating
    min: 0,
    max: 10
  },
  metascore: {
    type: Number
  },
  imdbRating: {
    type: String
  },
  imdbVotes: {
    type: String
  },
  // Visual assets
  poster: {
    type: String
  },
  // External ratings
  ratings: [{
    source: String,
    value: String
  }],
  // Movie type and status
  type: {
    type: String,
    enum: ['movie', 'series', 'episode'],
    default: 'movie'
  },
  // Search and caching metadata
  searchTerms: [{
    type: String,
    index: true
  }],
  // Cache management
  lastFetched: {
    type: Date,
    default: Date.now,
    index: true
  },
  cacheExpiry: {
    type: Date,
    default: function() {
      return new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
    },
    index: true
  },
  // Analytics fields
  totalSearches: {
    type: Number,
    default: 1
  },
  lastSearched: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance - simplified to avoid language override issues
movieSchema.index({ title: 1, year: -1 });
movieSchema.index({ genre: 1, year: -1 });
movieSchema.index({ rating: -1 });
movieSchema.index({ cacheExpiry: 1 });
movieSchema.index({ imdbID: 1 }, { unique: true });

// Virtual for formatted runtime
movieSchema.virtual('formattedRuntime').get(function() {
  if (this.runtimeMinutes) {
    const hours = Math.floor(this.runtimeMinutes / 60);
    const minutes = this.runtimeMinutes % 60;
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  }
  return this.runtime || 'N/A';
});

// Method to check if cache is expired
movieSchema.methods.isCacheExpired = function() {
  return new Date() > this.cacheExpiry;
};

// Method to refresh cache expiry
movieSchema.methods.refreshCache = function() {
  this.lastFetched = new Date();
  this.cacheExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);
  this.totalSearches += 1;
  this.lastSearched = new Date();
};

// Static method to find non-expired movies
movieSchema.statics.findFresh = function(query = {}) {
  return this.find({
    ...query,
    cacheExpiry: { $gt: new Date() }
  });
};

// Static method to find expired movies for cleanup
movieSchema.statics.findExpired = function() {
  return this.find({
    cacheExpiry: { $lte: new Date() }
  });
};

// Pre-save middleware to parse runtime
movieSchema.pre('save', function(next) {
  if (this.runtime && !this.runtimeMinutes) {
    const match = this.runtime.match(/(\d+)/);
    if (match) {
      this.runtimeMinutes = parseInt(match[1]);
    }
  }
  next();
});

// Static methods for analytics
movieSchema.statics.getGenreStats = function() {
  return this.aggregate([
    { $match: { cacheExpiry: { $gt: new Date() } } },
    { $unwind: '$genre' },
    {
      $group: {
        _id: '$genre',
        count: { $sum: 1 },
        avgRating: { $avg: '$rating' },
        movies: { $push: { title: '$title', year: '$year', rating: '$rating' } }
      }
    },
    { $sort: { count: -1 } }
  ]);
};

movieSchema.statics.getRatingStats = function() {
  return this.aggregate([
    { $match: { cacheExpiry: { $gt: new Date() }, rating: { $exists: true } } },
    {
      $group: {
        _id: null,
        avgRating: { $avg: '$rating' },
        minRating: { $min: '$rating' },
        maxRating: { $max: '$rating' },
        totalMovies: { $sum: 1 }
      }
    }
  ]);
};

movieSchema.statics.getRuntimeByYear = function() {
  return this.aggregate([
    { 
      $match: { 
        cacheExpiry: { $gt: new Date() },
        runtimeMinutes: { $exists: true, $gt: 0 }
      } 
    },
    {
      $group: {
        _id: '$year',
        avgRuntime: { $avg: '$runtimeMinutes' },
        movieCount: { $sum: 1 },
        movies: { $push: { title: '$title', runtime: '$runtimeMinutes' } }
      }
    },
    { $sort: { _id: -1 } }
  ]);
};

module.exports = mongoose.model('Movie', movieSchema);

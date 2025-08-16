import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';
import api from '../utils/api';
import { exportSearchResults } from '../utils/csvExport';

const Favorites = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { theme, isDark } = useTheme();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMovie, setSelectedMovie] = useState(null);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      const response = await api.get('/favorites');
      setFavorites(response.data.favorites || []);
    } catch (error) {
      toast.error('Failed to load favorites');
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (imdbID, movieTitle) => {
    try {
      await api.delete(`/favorites/${imdbID}`);
      setFavorites(prev => prev.filter(movie => movie.imdbID !== imdbID));
      toast.success(`Removed "${movieTitle}" from favorites`);
    } catch (error) {
      toast.error('Failed to remove from favorites');
    }
  };

  const getMovieDetails = async (imdbID) => {
    try {
      const response = await api.get(`/movies/${imdbID}`);
      setSelectedMovie(response.data.movie);
    } catch (error) {
      toast.error('Failed to load movie details');
    }
  };

  const handleExportCSV = () => {
    if (favorites.length === 0) {
      toast.warning('No favorites to export');
      return;
    }

    try {
      const result = exportSearchResults(favorites, {
        searchTerm: 'favorites',
        totalResults: favorites.length
      });
      
      if (result.success) {
        toast.success(`Successfully exported ${result.count} favorites to ${result.filename}`);
      } else {
        toast.error(`Export failed: ${result.error}`);
      }
    } catch (error) {
      toast.error('Failed to export favorites');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4 animate-fade-in">
          <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full"></div>
          <div className="text-primary text-xl">Loading your favorites...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-12 space-y-4 sm:space-y-0 animate-slide-up">
          <div>
            <h1 className="text-4xl font-bold text-primary mb-4">❤️ My Favorites</h1>
            <p className="text-secondary text-lg">
              {favorites.length === 0 
                ? 'No favorite movies yet - start building your collection!' 
                : `${favorites.length} favorite movie${favorites.length > 1 ? 's' : ''} in your collection`
              }
            </p>
          </div>
          
          {favorites.length > 0 && (
            <button
              onClick={handleExportCSV}
              className="btn-secondary flex items-center space-x-2 px-6 py-3"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Export Favorites</span>
            </button>
          )}
        </div>

        {favorites.length === 0 ? (
          /* Empty State */
          <div className="text-center py-20 animate-fade-in">
            <div className="glass-card p-16 max-w-lg mx-auto border-0">
              <div className="text-8xl mb-8 animate-float">❤️</div>
              <h3 className="text-3xl font-bold text-primary mb-6">No Favorites Yet</h3>
              <p className="text-secondary text-lg mb-8 leading-relaxed">
                Start building your personal movie collection by exploring our vast library and adding movies to your favorites.
              </p>
              <a
                href="/movies"
                className="btn-primary px-8 py-4 text-lg inline-flex items-center space-x-2"
              >
                <span>🔍 Search Movies</span>
              </a>
            </div>
          </div>
        ) : (
          /* Favorites Grid */
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favorites.map((movie, index) => (
              <div 
                key={movie.imdbID} 
                className="glass-card overflow-hidden group relative cursor-pointer hover:scale-105 transition-all duration-300 hover:shadow-xl border-0 animate-slide-up"
                style={{animationDelay: `${index * 0.1}s`}}
              >
                {/* Remove Heart Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFavorite(movie.imdbID, movie.title);
                  }}
                  className="absolute top-3 right-3 z-10 p-2 bg-black/60 backdrop-blur-sm hover:bg-red-500 text-red-400 hover:text-white rounded-full transition-all hover:scale-110"
                  title="Remove from favorites"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                  </svg>
                </button>

                {/* Movie Poster */}
                <div 
                  className="h-64 bg-tertiary flex items-center justify-center relative overflow-hidden cursor-pointer"
                  onClick={() => getMovieDetails(movie.imdbID)}
                >
                  {movie.poster && movie.poster !== 'N/A' ? (
                    <img 
                      src={movie.poster} 
                      alt={movie.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 to-pink-500/20 flex items-center justify-center" style={{ display: movie.poster && movie.poster !== 'N/A' ? 'none' : 'flex' }}>
                    <div className="text-center">
                      <div className="text-6xl mb-4 animate-float">❤️</div>
                      <div className="text-primary text-sm px-4 font-medium">Favorite Movie</div>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  {movie.rating && (
                    <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-sm text-white px-2 py-1 rounded-full text-sm font-semibold">
                      ⭐ {movie.rating}
                    </div>
                  )}
                </div>

                {/* Movie Info */}
                <div className="p-5">
                  <h3 className="font-bold text-primary mb-3 line-clamp-2 leading-tight text-lg group-hover:text-gradient transition-all duration-300">
                    {movie.title}
                  </h3>
                  
                  <div className="flex justify-between items-center text-sm text-secondary mb-4">
                    <span className="flex items-center space-x-1">
                      <span>📅</span>
                      <span>{movie.year}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <span>⏱️</span>
                      <span>{movie.runtime || 'N/A'}</span>
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {movie.genre?.slice(0, 3).map((g) => (
                      <span 
                        key={g} 
                        className="bg-gradient-primary/20 text-red-300 px-3 py-1 text-xs rounded-full font-medium border border-red-400/20"
                      >
                        {g}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Movie Detail Modal */}
        {selectedMovie && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold">{selectedMovie.title}</h2>
                    <p className="text-gray-400 mt-1">
                      {selectedMovie.year} • {selectedMovie.runtime} • {selectedMovie.language}
                    </p>
                  </div>
                  <button 
                    onClick={() => setSelectedMovie(null)}
                    className="text-gray-400 hover:text-white text-2xl p-2"
                  >
                    ✕
                  </button>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  {/* Poster */}
                  <div>
                    {selectedMovie.poster && selectedMovie.poster !== 'N/A' ? (
                      <img 
                        src={selectedMovie.poster} 
                        alt={selectedMovie.title}
                        className="w-full rounded-lg"
                      />
                    ) : (
                      <div className="w-full h-96 bg-gray-700 rounded-lg flex items-center justify-center">
                        <span className="text-gray-500 text-4xl">🎬</span>
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="md:col-span-2 space-y-4">
                    <div>
                      <h3 className="font-semibold text-gray-400 mb-2">Plot</h3>
                      <p className="text-gray-300">{selectedMovie.plot}</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold text-gray-400 mb-2">Details</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Director:</span>
                            <span className="font-medium">{selectedMovie.director}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Rating:</span>
                            <span className="font-medium">{selectedMovie.rating}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Genre:</span>
                            <span className="font-medium">{selectedMovie.genre?.join(', ')}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-400 mb-2">Cast</h4>
                        <p className="text-sm text-gray-300">{selectedMovie.actors?.join(', ')}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;

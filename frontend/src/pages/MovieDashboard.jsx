import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import MultiSelectGenre from '../components/MultiSelectGenre';
import Pagination from '../components/Pagination';
import FavoriteButton from '../components/FavoriteButton';
import { exportSearchResults } from '../utils/csvExport';

const MovieDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { theme, isDark } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [movies, setMovies] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    sort: 'rating',
    genres: [],
    year: '',
    minRating: ''
  });
  const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'table'
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [recentMovies, setRecentMovies] = useState([]);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [itemsPerPage] = useState(12);
  const [totalPages, setTotalPages] = useState(0);

  // Load dashboard analytics and recent movies on component mount
  useEffect(() => {
    loadDashboardAnalytics();
    loadRecentMovies();
  }, []);

  const loadDashboardAnalytics = async () => {
    try {
      const response = await api.get('/movies/analytics/dashboard');
      setAnalytics(response.data.dashboard);
    } catch (error) {
      // Silent fail for analytics - not critical for user experience
    }
  };

  const loadRecentMovies = async () => {
    try {
      const response = await api.get('/movies/recent?limit=12');
      setRecentMovies(response.data.recentMovies || []);
    } catch (error) {
      // Silent fail for recent movies - not critical for user experience
    }
  };

  const searchMovies = async (page = 1) => {
    if (!searchTerm.trim()) {
      toast.warning('Please enter a movie title to search');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Build API parameters with all filters and pagination
      const params = new URLSearchParams({
        search: searchTerm,
        sort: filters.sort,
        page: page.toString(),
        limit: itemsPerPage.toString()
      });

      // Add all filters - backend will apply them during API fetch for instant results
      if (filters.year) {
        params.append('filter', `year:${filters.year}`);
      }
      
      if (filters.minRating) {
        params.append('filter', `rating:>=${filters.minRating}`);
      }

      // Handle multiple genres
      if (filters.genres.length > 0) {
        filters.genres.forEach(genre => {
          params.append('filter', `genre:${genre}`);
        });
      }
      
      const response = await api.get(`/movies/search?${params}`);
      
      // Update movies and pagination info
      const searchResults = response.data.movies || [];
      const total = response.data.totalResults || 0;
      
      setMovies(searchResults);
      setTotalResults(total);
      setCurrentPage(page);
      setTotalPages(Math.ceil(total / itemsPerPage));
      
      if (searchResults.length === 0) {
        toast.info(`No movies found for "${searchTerm}"`);
      } else {
        toast.success(`Found ${total} movies matching "${searchTerm}"`);
      }
      
      // Reload analytics after search
      loadDashboardAnalytics();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to search movies. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
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

  const handlePageChange = (page) => {
    setCurrentPage(page);
    searchMovies(page);
    // Scroll to top of results
    window.scrollTo({ top: 400, behavior: 'smooth' });
  };

  const handleExportCSV = () => {
    if (movies.length === 0) {
      toast.warning('No movies to export. Please search for movies first.');
      return;
    }

    try {
      const searchInfo = {
        searchTerm,
        filters,
        totalResults
      };
      
      const result = exportSearchResults(movies, searchInfo);
      
      if (result.success) {
        toast.success(`Successfully exported ${result.count} movies to ${result.filename}`);
      } else {
        toast.error(`Export failed: ${result.error}`);
      }
    } catch (error) {
      toast.error('Failed to export movies. Please try again.');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      searchMovies(1); // Reset to first page on new search
    }
  };

  const handleLogout = () => {
    const { logout } = useAuth();
    logout();
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-primary">
      {/* Header */}
      {/* <header className="bg-black/95 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="text-red-600 text-2xl font-bold">MOVIEFLIX SEARCH</div>
            
            <nav className="hidden md:flex space-x-6">
              <Link to="/dashboard" className="hover:text-red-500 transition">Home</Link>
              <Link to="/movies" className="text-red-500 font-semibold">Movie Search</Link>
              <Link to="/statistics" className="hover:text-red-500 transition">Statistics</Link>
            </nav>

            <div className="flex items-center space-x-4">
              <div className="text-sm">
                <span className="text-gray-400">Welcome, </span>
                <span className="font-semibold">{user?.name}</span>
                {user?.role === 'admin' && (
                  <span className="ml-2 px-2 py-1 bg-blue-600 text-xs rounded">ADMIN</span>
                )}
              </div>
              <button onClick={handleLogout} className="btn-secondary text-sm px-4 py-2">
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header> */}

      <div className="max-w-7xl mx-auto px-6 py-8">


        {/* Movie Search Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6 text-primary">🔍 Movie Search</h2>
          
          {/* Search Controls */}
          <div className="glass-card p-6 rounded-2xl mb-6 border-0">
            {/* Main Search Row */}
            <div className="grid md:grid-cols-12 gap-4 mb-4">
              <div className="md:col-span-4">
                <input
                  type="text"
                  placeholder="Search movies by title, plot, actors, director..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="input-field"
                />
              </div>
              <div className="md:col-span-2">
                <select 
                  value={filters.sort} 
                  onChange={(e) => setFilters({...filters, sort: e.target.value})}
                  className="input-field"
                >
                  <option value="rating">🌟 By Rating</option>
                  <option value="year">📅 By Year</option>
                  <option value="title">🔤 By Title</option>
                  <option value="popularity">🔥 By Popularity</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <input
                  type="number"
                  placeholder="Year (e.g., 2020)"
                  value={filters.year}
                  onChange={(e) => setFilters({...filters, year: e.target.value})}
                  className="input-field"
                />
              </div>
              <div className="md:col-span-2">
                <input
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  placeholder="Min Rating (e.g., 7.5)"
                  value={filters.minRating}
                  onChange={(e) => setFilters({...filters, minRating: e.target.value})}
                  className="input-field"
                />
              </div>
              <div className="md:col-span-2">
                <button 
                  onClick={() => searchMovies(1)}
                  disabled={loading}
                  className="btn-primary w-full"
                >
                  {loading ? 'Searching...' : 'Search Movies'}
                </button>
              </div>
            </div>
            
            {/* Genre Filter Row */}
            <div className="grid md:grid-cols-12 gap-4 mb-4">
              <div className="md:col-span-6">
                <label className="block text-sm font-medium text-primary mb-2">
                  🎭 Filter by Genres (Multi-select)
                </label>
                <MultiSelectGenre
                  selectedGenres={filters.genres}
                  onGenresChange={(genres) => setFilters({...filters, genres})}
                  availableGenres={analytics?.topGenres?.map(g => g._id) || []}
                />
              </div>
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-primary mb-2">
                  👁️ View Mode
                </label>
                <div className="flex bg-secondary rounded-xl p-1">
                  <button
                    onClick={() => setViewMode('cards')}
                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                      viewMode === 'cards' 
                        ? 'bg-gradient-primary text-white shadow-lg' 
                        : 'text-muted hover:text-primary hover:bg-primary/10'
                    }`}
                  >
                    🎬 Cards
                  </button>
                  <button
                    onClick={() => setViewMode('table')}
                    className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                      viewMode === 'table' 
                        ? 'bg-gradient-primary text-white shadow-lg' 
                        : 'text-muted hover:text-primary hover:bg-primary/10'
                    }`}
                  >
                    📊 Table
                  </button>
                </div>
              </div>
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-primary mb-2">
                  📈 Quick Actions
                </label>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => setFilters({sort: 'rating', genres: [], year: '', minRating: ''})}
                    className="btn-ghost text-sm px-3 py-2 flex-1"
                  >
                    🔄 Clear
                  </button>
                  <Link 
                    to="/statistics" 
                    className="btn-secondary text-sm px-3 py-2 flex-1 text-center"
                  >
                    📊 Stats
                  </Link>
                </div>
              </div>
            </div>
            
            {error && (
              <div className="glass-card p-4 border border-red-500/50 bg-red-500/10 text-red-400 text-sm rounded-xl">
                ⚠️ {error}
              </div>
            )}

          </div>

          {/* Recently Searched Movies */}
           {/* {(!movies.length && !loading && recentMovies.length > 0) && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">🔍 Recently Searched Movies</h3>
                <p className="text-gray-400 text-sm">{recentMovies.length} movies</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {recentMovies.map((movie) => (
                  <div 
                    key={movie.imdbID}
                    className="bg-gray-800 rounded-lg overflow-hidden hover:bg-gray-700 transition-colors cursor-pointer group"
                    onClick={() => getMovieDetails(movie.imdbID)}
                  >
                    <div className="aspect-w-2 aspect-h-3 relative">
                      {/* Favorite Heart Button */}
                      {/* <div className="absolute top-2 left-2 z-10">
                        <FavoriteButton movie={movie} size="w-4 h-4" />
                      </div>
                      
                      {movie.poster ? (
                        <img 
                          src={movie.poster} 
                          alt={movie.title}
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                      ) : (
                        <div className="w-full h-48 bg-gray-700 flex items-center justify-center">
                          <span className="text-gray-500">🎬</span>
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <h4 className="text-sm font-semibold text-white mb-1 truncate">{movie.title}</h4>
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <span>{movie.year}</span>
                        {movie.rating && (
                          <span className="text-yellow-400">⭐ {movie.rating}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )} */}
          


          {/* Movie Results */}
          {movies.length > 0 && (
            <>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 space-y-4 sm:space-y-0">
                <div>
                  <h3 className="text-lg font-semibold">
                    {totalResults > 0 ? (
                      <>
                        Showing {movies.length} of {totalResults} movie{totalResults > 1 ? 's' : ''}
                        {searchTerm && (
                          <span className="text-gray-400 text-sm ml-2">for "{searchTerm}"</span>
                        )}
                      </>
                    ) : (
                      `${movies.length} movie${movies.length > 1 ? 's' : ''} found`
                    )}
                  </h3>
                  <div className="text-sm text-gray-400">
                    {loading ? 'Searching...' : `Sorted by ${filters.sort}`}
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleExportCSV}
                    disabled={loading || movies.length === 0}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-sm rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>Export CSV</span>
                  </button>
                </div>
              </div>

              {/* Cards View */}
              {viewMode === 'cards' && (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {movies.map((movie) => (
                    <div 
                      key={movie.imdbID} 
                      className="glass-card overflow-hidden cursor-pointer group hover:scale-105 transition-all duration-300 hover:shadow-xl border-0"
                      onClick={() => getMovieDetails(movie.imdbID)}
                    >
                      <div className="h-64 bg-tertiary flex items-center justify-center relative overflow-hidden">
                        {/* Favorite Heart Button */}
                        <div className="absolute top-2 left-2 z-10">
                          <FavoriteButton movie={movie} size="w-5 h-5" />
                        </div>
                        
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
                        <div className="text-6xl hidden items-center justify-center w-full h-full text-muted">🎬</div>
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-gradient-to-t group-hover:from-black/50 group-hover:to-transparent transition-all duration-300"></div>
                        <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-sm text-white px-2 py-1 rounded-full text-sm font-semibold">
                          ⭐ {movie.rating?.toFixed(1) || 'N/A'}
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold mb-2 line-clamp-2 text-primary group-hover:text-gradient transition-all duration-300">
                          {movie.title}
                        </h3>
                        <div className="flex justify-between items-center text-sm text-secondary mb-2">
                          <span>📅 {movie.year}</span>
                          <span>⏱️ {movie.runtime || 'N/A'}</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {movie.genre?.slice(0, 3).map((g) => (
                            <span key={g} className="bg-gradient-primary/20 text-red-300 px-2 py-1 text-xs rounded-full font-medium">
                              {g}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Table View */}
              {viewMode === 'table' && (
                <div className="glass-card rounded-2xl overflow-hidden border-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-secondary">
                        <tr>
                          <th className="text-left p-4 font-semibold text-primary">Movie</th>
                          <th className="text-center p-4 font-semibold text-primary">Year</th>
                          <th className="text-center p-4 font-semibold text-primary">Runtime</th>
                          <th className="text-center p-4 font-semibold text-primary">Rating</th>
                          <th className="text-left p-4 font-semibold text-primary">Genres</th>
                          <th className="text-left p-4 font-semibold text-primary">Director</th>
                        </tr>
                      </thead>
                      <tbody>
                        {movies.map((movie, index) => (
                          <tr 
                            key={movie.imdbID}
                            className={`cursor-pointer transition-all duration-200 hover:bg-tertiary ${
                              index % 2 === 0 ? 'bg-primary/50' : 'bg-secondary/30'
                            }`}
                            style={{ borderTop: '1px solid rgb(var(--border-primary) / 0.3)' }}
                            onClick={() => getMovieDetails(movie.imdbID)}
                          >
                            <td className="p-4">
                              <div className="flex items-center space-x-3">
                                <div className="w-12 h-16 bg-tertiary rounded flex-shrink-0 flex items-center justify-center overflow-hidden">
                                  {movie.poster && movie.poster !== 'N/A' ? (
                                    <img 
                                      src={movie.poster} 
                                      alt={movie.title}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.nextSibling.style.display = 'block';
                                      }}
                                    />
                                  ) : null}
                                  <span className="text-xs text-muted" style={{ display: movie.poster && movie.poster !== 'N/A' ? 'none' : 'block' }}>🎬</span>
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-1">
                                    <FavoriteButton movie={movie} size="w-4 h-4" />
                                    <div className="font-semibold text-primary hover:text-gradient transition-all duration-300">
                                      {movie.title}
                                    </div>
                                  </div>
                                  {movie.plot && (
                                    <div className="text-sm text-muted line-clamp-2">
                                      {movie.plot.substring(0, 100)}...
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="text-center p-4 text-secondary font-medium">{movie.year}</td>
                            <td className="text-center p-4 text-secondary">{movie.runtime || 'N/A'}</td>
                            <td className="text-center p-4">
                              <span className="inline-flex items-center space-x-1">
                                <span className="text-yellow-400">⭐</span>
                                <span className="font-semibold text-primary">{movie.rating?.toFixed(1) || 'N/A'}</span>
                              </span>
                            </td>
                            <td className="p-4">
                              <div className="flex flex-wrap gap-1">
                                {movie.genre?.slice(0, 2).map((g) => (
                                  <span key={g} className="bg-gradient-primary/20 text-red-400 px-2 py-1 text-xs rounded-full font-medium border border-red-400/20">
                                    {g}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="p-4 text-sm text-secondary font-medium">
                              {movie.director || 'N/A'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Pagination */}
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalResults}
                itemsPerPage={itemsPerPage}
                onPageChange={handlePageChange}
                loading={loading}
              />
            </>
          )}
        </div>

        {/* Movie Detail Modal */}
        {selectedMovie && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="glass-card max-w-6xl w-full max-h-[95vh] overflow-y-auto border-0">
              <div className="p-8">
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h2 className="text-4xl font-bold text-primary mb-2">{selectedMovie.title}</h2>
                    <p className="text-secondary text-lg">
                      {selectedMovie.year} • {selectedMovie.runtime} • {selectedMovie.language}
                    </p>
                  </div>
                  <button 
                    onClick={() => setSelectedMovie(null)}
                    className="btn-ghost p-3 text-2xl hover:scale-110 transition-all duration-200"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="grid md:grid-cols-3 gap-8">
                  <div className="md:col-span-1">
                    <div className="glass-card h-96 flex items-center justify-center rounded-xl overflow-hidden border-0">
                      {selectedMovie.poster && selectedMovie.poster !== 'N/A' ? (
                        <img 
                          src={selectedMovie.poster} 
                          alt={selectedMovie.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-8xl text-muted">🎬</div>
                      )}
                    </div>
                    
                    {/* External Links */}
                    <div className="mt-8 space-y-4">
                      <h3 className="font-bold text-primary text-lg mb-4">🔗 External Links</h3>
                      
                      <a 
                        href={`https://www.imdb.com/title/${selectedMovie.imdbID}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="glass-card p-4 rounded-xl border-0 hover:scale-105 transition-all duration-300 flex items-center space-x-3"
                      >
                        <div className="w-10 h-10 bg-yellow-600 rounded-lg flex items-center justify-center text-white font-bold">
                          i
                        </div>
                        <div>
                          <div className="font-bold text-yellow-400">IMDb</div>
                          <div className="text-xs text-yellow-500">View on IMDb</div>
                        </div>
                      </a>
                      
                      <a 
                        href={`https://www.netflix.com/search?q=${encodeURIComponent(selectedMovie.title)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="glass-card p-4 rounded-xl border-0 hover:scale-105 transition-all duration-300 flex items-center space-x-3"
                      >
                        <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center text-white font-bold">
                          N
                        </div>
                        <div>
                          <div className="font-bold text-red-400">Netflix</div>
                          <div className="text-xs text-red-500">Search on Netflix</div>
                        </div>
                      </a>
                      
                      <a 
                        href={`https://www.primevideo.com/search/ref=atv_nb_sr?phrase=${encodeURIComponent(selectedMovie.title)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="glass-card p-4 rounded-xl border-0 hover:scale-105 transition-all duration-300 flex items-center space-x-3"
                      >
                        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                          P
                        </div>
                        <div>
                          <div className="font-bold text-blue-400">Prime Video</div>
                          <div className="text-xs text-blue-500">Search on Prime</div>
                        </div>
                      </a>
                      
                      <a 
                        href={`https://www.google.com/search?q=${encodeURIComponent(selectedMovie.title + ' ' + selectedMovie.year)} watch online`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="glass-card p-4 rounded-xl border-0 hover:scale-105 transition-all duration-300 flex items-center space-x-3"
                      >
                        <div className="w-10 h-10 bg-gray-600 rounded-lg flex items-center justify-center text-white font-bold">
                          G
                        </div>
                        <div>
                          <div className="font-bold text-secondary">Google</div>
                          <div className="text-xs text-muted">Find streaming options</div>
                        </div>
                      </a>
                    </div>
                  </div>
                  
                  <div className="md:col-span-2 space-y-8">
                    <div className="glass-card p-6 border-0 rounded-xl">
                      <h3 className="font-bold text-primary mb-4 text-xl">📝 Plot Summary</h3>
                      <p className="text-secondary leading-relaxed text-lg">{selectedMovie.plot}</p>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="glass-card p-6 border-0 rounded-xl">
                        <h3 className="font-bold text-primary mb-4 text-lg">ℹ️ Movie Details</h3>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center py-2 border-b border-tertiary">
                            <span className="text-muted font-medium">Year:</span> 
                            <span className="font-semibold text-primary">{selectedMovie.year}</span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-tertiary">
                            <span className="text-muted font-medium">Runtime:</span> 
                            <span className="font-semibold text-primary">{selectedMovie.runtime}</span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-tertiary">
                            <span className="text-muted font-medium">Director:</span> 
                            <span className="font-semibold text-primary">{selectedMovie.director}</span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-tertiary">
                            <span className="text-muted font-medium">Writer:</span> 
                            <span className="font-medium text-secondary">{selectedMovie.writer?.substring(0, 50)}...</span>
                          </div>
                          <div className="flex justify-between items-center py-2 border-b border-tertiary">
                            <span className="text-muted font-medium">Language:</span> 
                            <span className="font-medium text-secondary">{selectedMovie.language}</span>
                          </div>
                          <div className="flex justify-between items-center py-2">
                            <span className="text-muted font-medium">Country:</span> 
                            <span className="font-medium text-secondary">{selectedMovie.country}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="glass-card p-6 border-0 rounded-xl">
                        <h3 className="font-bold text-primary mb-4 text-lg">⭐ Ratings & Reviews</h3>
                        <div className="space-y-4">
                          <div className="glass-card p-4 border-0 flex items-center justify-between bg-gradient-primary/10">
                            <div className="flex items-center space-x-2">
                              <span className="text-yellow-400 text-lg">⭐</span>
                              <span className="font-semibold text-primary">IMDb Rating</span>
                            </div>
                            <span className="font-bold text-2xl text-gradient">
                              {selectedMovie.rating?.toFixed(1) || 'N/A'}/10
                            </span>
                          </div>
                          
                          {selectedMovie.ratings?.map((rating, index) => (
                            <div key={index} className="flex items-center justify-between glass-card p-3 border-0">
                              <span className="text-muted font-medium">{rating.source}</span>
                              <span className="font-semibold text-primary">{rating.value}</span>
                            </div>
                          ))}
                          
                          {selectedMovie.metascore && (
                            <div className="flex items-center justify-between glass-card p-3 border-0">
                              <span className="text-muted font-medium">Metascore</span>
                              <span className="font-semibold text-primary">{selectedMovie.metascore}/100</span>
                            </div>
                          )}
                          
                          {selectedMovie.imdbVotes && (
                            <div className="text-sm text-muted text-center">
                              Based on {selectedMovie.imdbVotes} votes
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="glass-card p-6 border-0 rounded-xl">
                      <h3 className="font-bold text-primary mb-4 text-lg">🎭 Genres</h3>
                      <div className="flex flex-wrap gap-3">
                        {selectedMovie.genre?.map((g) => (
                          <span key={g} className="bg-gradient-primary/20 text-red-400 px-4 py-2 text-sm rounded-full font-medium border border-red-400/30 hover:scale-105 transition-transform">
                            {g}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="glass-card p-6 border-0 rounded-xl">
                      <h3 className="font-bold text-primary mb-4 text-lg">🎬 Cast & Crew</h3>
                      <div className="space-y-4">
                        <div className="border-b border-tertiary pb-3">
                          <span className="text-muted font-semibold block mb-2">Starring:</span>
                          <span className="text-primary text-lg">{selectedMovie.actors?.join(', ')}</span>
                        </div>
                        <div>
                          <span className="text-muted font-semibold block mb-2">Director:</span>
                          <span className="text-primary text-lg font-medium">{selectedMovie.director}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Getting Started Guide */}
        {movies.length === 0 && !loading && (
          <div className="glass-card p-12 text-center border-0 animate-fade-in">
            <div className="text-8xl mb-8 animate-float">🎬</div>
            <h2 className="text-3xl font-bold mb-6 text-primary">Welcome to Movie Search</h2>
            <p className="text-secondary text-lg mb-8 max-w-2xl mx-auto leading-relaxed">
              Discover thousands of movies with our advanced search. Try searching for popular titles like "Batman", "Avengers", or "Star Wars".
            </p>
            <div className="grid md:grid-cols-3 gap-6 text-center max-w-4xl mx-auto">
              <div className="glass-card p-6 rounded-xl border-0 hover:scale-105 transition-all duration-300">
                <div className="text-4xl mb-4">🔍</div>
                <h3 className="font-bold mb-3 text-primary">Smart Search</h3>
                <p className="text-sm text-secondary">Find movies by title, plot, actors, or director with intelligent filters</p>
              </div>
              <div className="glass-card p-6 rounded-xl border-0 hover:scale-105 transition-all duration-300">
                <div className="text-4xl mb-4">📊</div>
                <h3 className="font-bold mb-3 text-primary">View Analytics</h3>
                <p className="text-sm text-secondary">Explore genre statistics, ratings, and cinematic trends</p>
              </div>
              <div className="glass-card p-6 rounded-xl border-0 hover:scale-105 transition-all duration-300">
                <div className="text-4xl mb-4">🎯</div>
                <h3 className="font-bold mb-3 text-primary">Advanced Filters</h3>
                <p className="text-sm text-secondary">Sort by rating, year, or filter by multiple genres</p>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Dashboard */}
        {analytics && (
          <div className="mb-8 mt-8">
            <h2 className="text-2xl font-bold mb-6 text-primary">📊 Movie Analytics</h2>
            
            {/* Summary Cards */}
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <div className="glass-card p-6 text-center border-0 hover:scale-105 transition-all duration-300">
                <div className="text-3xl font-bold bg-gradient-secondary bg-clip-text text-transparent mb-2">{analytics.summary.totalMovies}</div>
                <div className="text-muted font-medium">Total Movies</div>
              </div>
              <div className="glass-card p-6 text-center border-0 hover:scale-105 transition-all duration-300">
                <div className="text-3xl font-bold text-gradient mb-2">{analytics.summary.totalGenres}</div>
                <div className="text-muted font-medium">Genres</div>
              </div>
              <div className="glass-card p-6 text-center border-0 hover:scale-105 transition-all duration-300">
                <div className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
                  {analytics.summary.avgRating.toFixed(1)}
                </div>
                <div className="text-muted font-medium">Avg Rating</div>
              </div>
              <div className="glass-card p-6 text-center border-0 hover:scale-105 transition-all duration-300">
                <div className="text-3xl font-bold text-gradient mb-2">{analytics.summary.totalYears}</div>
                <div className="text-muted font-medium">Years Covered</div>
              </div>
            </div>

            {/* Top Genres */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="glass-card p-6 rounded-xl border-0">
                <h3 className="text-xl font-semibold mb-4 text-primary">🎭 Top Genres</h3>
                <div className="space-y-3">
                  {analytics.topGenres.slice(0, 5).map((genre, index) => (
                    <div key={genre._id} className="flex justify-between items-center p-3 bg-secondary rounded-lg hover:bg-tertiary transition-colors">
                      <span className="text-primary font-medium">{genre._id}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-yellow-400 font-semibold">{genre.avgRating?.toFixed(1)}</span>
                        <span className="bg-gradient-primary px-3 py-1 text-xs rounded-full text-white font-bold">{genre.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="glass-card p-6 rounded-xl border-0">
                <h3 className="text-xl font-semibold mb-4 text-primary">🆕 Recently Added</h3>
                <div className="space-y-3">
                  {analytics.recentMovies.map((movie) => (
                    <div key={movie._id} className="flex justify-between items-center p-3 bg-secondary rounded-lg hover:bg-tertiary transition-colors">
                      <div>
                        <div className="font-medium text-primary">{movie.title}</div>
                        <div className="text-muted text-sm">{movie.year}</div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-yellow-400 font-semibold">★{movie.rating?.toFixed(1) || 'N/A'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MovieDashboard;


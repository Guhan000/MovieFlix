import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';
import FavoriteButton from '../components/FavoriteButton';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const { theme, isDark } = useTheme();
  const navigate = useNavigate();
  
  // State for dashboard data
  const [recentMovies, setRecentMovies] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [topRatedMovies, setTopRatedMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalMovies: 0,
    totalFavorites: 0,
    avgRating: 0
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load data in parallel
      const [recentRes, favoritesRes, analyticsRes] = await Promise.all([
        api.get('/movies/recent?limit=8').catch(() => ({ data: { recentMovies: [] } })),
        api.get('/favorites').catch(() => ({ data: { favorites: [] } })),
        api.get('/movies/analytics/dashboard').catch(() => ({ data: { dashboard: null } }))
      ]);

      setRecentMovies(recentRes.data.recentMovies || []);
      setFavorites(favoritesRes.data.favorites || []);
      
      // Create top-rated movies from recent movies
      const topRated = (recentRes.data.recentMovies || [])
        .filter(movie => movie.rating && movie.rating >= 7.5)
        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
        .slice(0, 6);
      setTopRatedMovies(topRated);

      // Set stats
      if (analyticsRes.data.dashboard) {
        setStats({
          totalMovies: analyticsRes.data.dashboard.summary?.totalMovies || 0,
          totalFavorites: favoritesRes.data.favorites?.length || 0,
          avgRating: analyticsRes.data.dashboard.summary?.avgRating || 0
        });
      }

    } catch (error) {
      // Silent fail - dashboard should work even if some data fails to load
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="bg-primary min-h-screen">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Welcome Section */}
        <section className="mb-20 animate-fade-in">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-12">
            <div className="animate-slide-up">
              <h1 className="text-5xl font-black mb-4">
                Welcome back, <span className="text-gradient">{user?.name}</span>!
              </h1>
              <p className="text-2xl text-secondary font-light">
                Ready to discover your next cinematic masterpiece?
              </p>
            </div>
            
            {!loading && (
              <div className="flex flex-col sm:flex-row gap-6 mt-8 lg:mt-0 animate-slide-up" style={{animationDelay: '0.3s'}}>
                <div className="glass-card text-center px-6 py-4 border-0">
                  <div className="text-3xl font-bold bg-gradient-secondary bg-clip-text text-transparent">{stats.totalMovies}</div>
                  <div className="text-sm text-muted">Movies Cached</div>
                </div>
                <div className="glass-card text-center px-6 py-4 border-0">
                  <div className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">{stats.totalFavorites}</div>
                  <div className="text-sm text-muted">Your Favorites</div>
                </div>
                <div className="glass-card text-center px-6 py-4 border-0">
                  <div className="text-3xl font-bold text-gradient">
                    {stats.avgRating > 0 ? stats.avgRating.toFixed(1) : '--'}
                  </div>
                  <div className="text-sm text-muted">Avg Rating</div>
                </div>
              </div>
            )}
          </div>
          
          {/* {user?.subscription === 'guest' && (
            <div className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border border-yellow-600/50 text-yellow-100 p-6 rounded-lg mb-8">
              <div className="flex items-start space-x-4">
                <div className="text-2xl">🎭</div>
                <div>
                  <h3 className="font-semibold mb-2 text-yellow-200">Unlock the Full MovieFlix Experience</h3>
                  <p className="text-sm text-yellow-100 mb-4">
                    Create an account to save favorites, export your movie lists, and get personalized recommendations.
                  </p>
                  <Link to="/signup" className="text-yellow-300 hover:text-yellow-200 underline font-medium">
                    Sign up now →
                  </Link>
                </div>
              </div>
            </div>
          )} */}

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link 
              to="/movies" 
              className="glass-card group p-8 text-center border-0 hover:scale-105 transition-all duration-500 hover:shadow-xl animate-slide-up"
              style={{animationDelay: '0.4s'}}
            >
              <div className="text-5xl mb-4 animate-float group-hover:animate-glow">🎬</div>
              <div className="font-bold text-xl mb-2 text-primary group-hover:text-gradient transition-all duration-300">Search Movies</div>
              <div className="text-secondary text-base">Explore thousands of cinematic treasures</div>
            </Link>
            
            <Link 
              to="/favorites" 
              className="glass-card group p-8 text-center border-0 hover:scale-105 transition-all duration-500 hover:shadow-xl animate-slide-up"
              style={{animationDelay: '0.5s'}}
            >
              <div className="text-5xl mb-4 animate-float group-hover:animate-glow" style={{animationDelay: '0.5s'}}>❤️</div>
              <div className="font-bold text-xl mb-2 text-primary group-hover:text-gradient transition-all duration-300">My Favorites</div>
              <div className="text-secondary text-base">{stats.totalFavorites} movies in your collection</div>
            </Link>
            
            <Link 
              to="/statistics" 
              className="glass-card group p-8 text-center border-0 hover:scale-105 transition-all duration-500 hover:shadow-xl animate-slide-up"
              style={{animationDelay: '0.6s'}}
            >
              <div className="text-5xl mb-4 animate-float group-hover:animate-glow" style={{animationDelay: '1s'}}>📊</div>
              <div className="font-bold text-xl mb-2 text-primary group-hover:text-gradient transition-all duration-300">Analytics</div>
              <div className="text-secondary text-base">Discover movie trends and insights</div>
            </Link>
          </div>
        </section>

        {/* Your Favorites */}
        {!loading && favorites.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-4">
                <h2 className="text-3xl font-bold">Your Favorites</h2>
                <div className="bg-gradient-to-r from-red-600 to-pink-600 text-white px-4 py-2 rounded-full text-sm font-medium">
                  {favorites.length} movies
                </div>
              </div>
              <Link 
                to="/favorites" 
                className="text-red-400 hover:text-red-300 font-medium flex items-center space-x-2 group"
              >
                <span>View All Favorites</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {favorites.slice(0, 4).map((movie) => (
                <div 
                  key={movie.imdbID} 
                  className="group glass-card rounded-xl overflow-hidden hover:scale-105 hover:shadow-2xl cursor-pointer relative border-0 transition-all transform duration-300"
                >
                  {/* Heart Icon */}
                  <div className="absolute top-3 left-3 z-10">
                    <FavoriteButton movie={movie} size="w-5 h-5" />
                  </div>
                  
                  {/* Rating Badge */}
                  {movie.rating && (
                    <div className="absolute top-3 right-3 z-10 bg-black/80 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs font-bold flex items-center space-x-1">
                      <span className="text-yellow-400">★</span>
                      <span>{movie.rating}</span>
                    </div>
                  )}
                  
                  <div className="aspect-w-2 aspect-h-3 relative">
                    {movie.poster && movie.poster !== 'N/A' ? (
                      <img 
                        src={movie.poster} 
                        alt={movie.title}
                        className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-64 bg-gradient-to-br from-red-500/20 to-pink-500/20 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-4xl mb-2">❤️</div>
                          <div className="text-sm text-primary font-medium">Favorite Movie</div>
                        </div>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  
                  <div className="p-5">
                    <h3 className="font-bold text-lg mb-2 text-primary group-hover:text-gradient transition-all duration-300 line-clamp-1">
                      {movie.title}
                    </h3>
                    
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-secondary text-sm">{movie.year}</span>
                      <span className="text-secondary text-sm">{movie.runtime || 'N/A'}</span>
                    </div>
                    
                    {movie.genre && movie.genre.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {movie.genre.slice(0, 2).map((g) => (
                          <span 
                            key={g} 
                            className="bg-gradient-primary/20 text-red-400 px-2 py-1 text-xs rounded-full font-medium border border-red-400/20"
                          >
                            {g}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    {movie.plot && (
                      <p className="text-muted text-sm line-clamp-2 leading-relaxed">
                        {movie.plot.length > 100 ? `${movie.plot.substring(0, 100)}...` : movie.plot}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Recently Searched Movies */}
        {!loading && recentMovies.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-4">
                <h2 className="text-3xl font-bold">Recently Searched</h2>
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-full text-sm font-medium">
                  Fresh
                </div>
              </div>
              <Link 
                to="/movies" 
                className="text-blue-400 hover:text-blue-300 font-medium flex items-center space-x-2 group"
              >
                <span>Search More Movies</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
                          {recentMovies.slice(0, 5).map((movie) => (
              <div 
                key={movie.imdbID} 
                className="group glass-card rounded-xl overflow-hidden hover:scale-105 hover:shadow-xl cursor-pointer relative border-0 transition-all transform duration-300"
              >
                {/* Heart Icon */}
                <div className="absolute top-3 left-3 z-10">
                  <FavoriteButton movie={movie} size="w-4 h-4" />
                </div>
                
                {/* Rating Badge */}
                {movie.rating && (
                  <div className="absolute top-3 right-3 z-10 bg-black/80 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs font-bold flex items-center space-x-1">
                    <span className="text-yellow-400">★</span>
                    <span>{movie.rating}</span>
                  </div>
                )}
                
                <div className="aspect-w-2 aspect-h-3 relative">
                  {movie.poster && movie.poster !== 'N/A' ? (
                    <img 
                      src={movie.poster} 
                      alt={movie.title}
                      className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-3xl mb-2">🔍</div>
                        <div className="text-sm text-primary font-medium">Recently Found</div>
                      </div>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                
                <div className="p-4">
                  <h3 className="font-bold text-base mb-2 text-primary group-hover:text-gradient transition-all duration-300 line-clamp-1">
                    {movie.title}
                  </h3>
                  
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-secondary text-sm">{movie.year}</span>
                    <span className="text-secondary text-sm">{movie.runtime || 'N/A'}</span>
                  </div>
                  
                  {movie.genre && movie.genre.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {movie.genre.slice(0, 2).map((g) => (
                        <span 
                          key={g} 
                          className="bg-gradient-secondary/20 text-blue-400 px-2 py-1 text-xs rounded-full font-medium border border-blue-400/20"
                        >
                          {g}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            </div>
          </section>
        )}

        {/* Top Rated Movies */}
        {!loading && topRatedMovies.length > 0 && (
          <section className="mb-16">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-4">
                <h2 className="text-3xl font-bold">Critics' Choice</h2>
                <div className="bg-gradient-to-r from-yellow-600 to-orange-600 text-white px-4 py-2 rounded-full text-sm font-medium">
                  🏆 7.5+ Rating
                </div>
              </div>
              <Link 
                to="/statistics" 
                className="text-yellow-400 hover:text-yellow-300 font-medium flex items-center space-x-2 group"
              >
                <span>View Analytics</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {topRatedMovies.slice(0, 3).map((movie, index) => (
              <div 
                key={movie.imdbID} 
                className="group glass-card rounded-xl overflow-hidden hover:scale-105 hover:shadow-2xl cursor-pointer relative border-0 transition-all transform duration-300"
              >
                {/* Ranking Badge */}
                <div className="absolute top-3 left-3 z-10 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                  #{index + 1}
                </div>
                
                {/* Heart Icon */}
                <div className="absolute top-3 right-12 z-10">
                  <FavoriteButton movie={movie} size="w-5 h-5" />
                </div>
                
                {/* Rating Badge */}
                <div className="absolute top-3 right-3 z-10 bg-yellow-600 text-white px-2 py-1 rounded-full text-xs font-bold flex items-center space-x-1">
                  <span>★</span>
                  <span>{movie.rating}</span>
                </div>
                
                <div className="aspect-w-2 aspect-h-3 relative">
                  {movie.poster && movie.poster !== 'N/A' ? (
                    <img 
                      src={movie.poster} 
                      alt={movie.title}
                      className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-64 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-4xl mb-2">🏆</div>
                        <div className="text-sm text-primary font-medium">Top Rated</div>
                      </div>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
                
                <div className="p-5">
                  <h3 className="font-bold text-lg mb-2 text-primary group-hover:text-gradient transition-all duration-300 line-clamp-1">
                    {movie.title}
                  </h3>
                  
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-secondary text-sm">{movie.year}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-yellow-400 font-bold text-lg">{movie.rating}</span>
                      <span className="text-secondary text-sm">{movie.runtime || 'N/A'}</span>
                    </div>
                  </div>
                  
                  {movie.genre && movie.genre.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {movie.genre.slice(0, 3).map((g) => (
                        <span 
                          key={g} 
                          className="bg-yellow-400/20 text-yellow-500 px-2 py-1 text-xs rounded-full font-medium border border-yellow-400/30"
                        >
                          {g}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  {movie.director && (
                    <p className="text-muted text-sm mb-2">
                      <span className="font-medium text-secondary">Director:</span> {movie.director}
                    </p>
                  )}
                  
                  {movie.plot && (
                    <p className="text-muted text-sm line-clamp-2 leading-relaxed">
                      {movie.plot.length > 120 ? `${movie.plot.substring(0, 120)}...` : movie.plot}
                    </p>
                  )}
                </div>
              </div>
            ))}
            </div>
          </section>
        )}

        {/* Popular Genres */}
        {!loading && (recentMovies.length > 0 || favorites.length > 0) && (
          <section className="mb-16">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold">Explore by Genre</h2>
              <Link 
                to="/movies" 
                className="text-gray-400 hover:text-gray-300 font-medium flex items-center space-x-2 group"
              >
                <span>Browse All</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[
                { name: 'Action', emoji: '💥', gradient: 'from-red-600 to-orange-600' },
                { name: 'Comedy', emoji: '😄', gradient: 'from-yellow-500 to-pink-500' },
                { name: 'Drama', emoji: '🎭', gradient: 'from-purple-600 to-blue-600' },
                { name: 'Horror', emoji: '👻', gradient: 'from-gray-800 to-red-900' },
                { name: 'Sci-Fi', emoji: '🚀', gradient: 'from-blue-600 to-teal-600' },
                { name: 'Romance', emoji: '💕', gradient: 'from-pink-500 to-red-500' }
              ].map((genre) => (
                <Link
                  key={genre.name}
                  to={`/movies`}
                  className={`group bg-gradient-to-br ${genre.gradient} p-6 rounded-xl hover:scale-105 transition-all transform cursor-pointer border border-gray-700 hover:shadow-xl`}
                >
                  <div className="text-center">
                    <div className="text-3xl mb-2">{genre.emoji}</div>
                    <div className="text-white font-bold text-sm">{genre.name}</div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Movie Discovery Tips */}
        {!loading && (recentMovies.length > 0 || favorites.length > 0) && (
          <section className="mb-16">
            <div className="glass-card p-12 rounded-2xl border-0 hover:shadow-xl transition-all duration-300">
              <div className="text-center max-w-3xl mx-auto">
                <div className="text-6xl mb-6 animate-float">🎯</div>
                <h2 className="text-3xl font-bold mb-6 text-primary">Discover Your Next Favorite</h2>
                <p className="text-secondary text-lg mb-8 leading-relaxed">
                  Use our advanced search with genre filters, year ranges, and rating criteria to find exactly what you're looking for. 
                  Export your favorites to CSV, analyze movie trends with our statistics dashboard, and build your perfect movie collection.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    to="/movies"
                    className="btn-primary px-8 py-4 text-lg font-bold"
                  >
                    Advanced Search
                  </Link>
                  <Link
                    to="/statistics"
                    className="btn-secondary px-8 py-4 text-lg font-semibold"
                  >
                    View Analytics
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Empty State */}
        {!loading && recentMovies.length === 0 && favorites.length === 0 && (
          <section className="text-center py-20">
            <div className="max-w-4xl mx-auto">
              <div className="glass-card p-16 border-0">
                <div className="text-8xl mb-8 animate-float">🎬</div>
                <h3 className="text-4xl font-bold mb-6 text-primary">Welcome to CineVault</h3>
                <p className="text-xl text-secondary mb-8 leading-relaxed max-w-2xl mx-auto">
                  Start your cinematic journey by searching for movies, building your favorites collection, 
                  and discovering incredible stories from around the world.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
                  <Link 
                    to="/movies" 
                    className="btn-primary px-10 py-4 text-lg font-bold"
                  >
                    Explore Movies
                  </Link>
                  <button
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="btn-ghost px-10 py-4 text-lg"
                  >
                    Learn More
                  </button>
                </div>
                
                {/* Feature highlights for new users */}
                <div className="grid md:grid-cols-3 gap-8">
                  <div className="text-center glass-card p-6 border-0 hover:scale-105 transition-all duration-300">
                    <div className="text-4xl mb-4">🔍</div>
                    <h4 className="font-bold mb-3 text-primary">Smart Search</h4>
                    <p className="text-secondary text-sm">Find movies by title, genre, year, and rating with advanced filters</p>
                  </div>
                  <div className="text-center glass-card p-6 border-0 hover:scale-105 transition-all duration-300">
                    <div className="text-4xl mb-4">❤️</div>
                    <h4 className="font-bold mb-3 text-primary">Personal Favorites</h4>
                    <p className="text-secondary text-sm">Save movies to your favorites and export your collection anytime</p>
                  </div>
                  <div className="text-center glass-card p-6 border-0 hover:scale-105 transition-all duration-300">
                    <div className="text-4xl mb-4">📊</div>
                    <h4 className="font-bold mb-3 text-primary">Movie Analytics</h4>
                    <p className="text-secondary text-sm">Discover trends with interactive charts and detailed statistics</p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Loading State */}
        {loading && (
          <section className="text-center py-16">
            <div className="glass-card p-12 border-0 max-w-lg mx-auto">
              <div className="animate-spin w-16 h-16 border-4 border-primary border-t-transparent rounded-full mx-auto mb-6"></div>
              <p className="text-primary text-lg font-medium">Loading your dashboard...</p>
              <p className="text-secondary text-sm mt-2">Preparing your personalized movie experience</p>
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default Dashboard;

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../utils/api';

const Landing = () => {
  const { guestLogin } = useAuth();
  const { theme, isDark } = useTheme();
  const [recentMovies, setRecentMovies] = useState([]);
  
  // Hero showcase movies
  const [heroMovies] = useState([
    {
      imdbID: 'tt0111161',
      title: 'The Shawshank Redemption',
      rating: 9.3,
      poster: 'https://m.media-amazon.com/images/M/MV5BMDFkYTc0MGEtZmNhMC00ZDIzLWFmNTEtODM1ZmRlYWMwMWFmXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_SX300.jpg'
    },
    {
      imdbID: 'tt0068646',
      title: 'The Godfather',
      rating: 9.2,
      poster: 'https://m.media-amazon.com/images/M/MV5BM2MyNjYxNmUtYTAwNi00MTYxLWJmNWYtYzZlODY3ZTk3OTFlXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_SX300.jpg'
    },
    {
      imdbID: 'tt0468569',
      title: 'The Dark Knight',
      rating: 9.0,
      poster: 'https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_SX300.jpg'
    },
    {
      imdbID: 'tt0167260',
      title: 'The Lord of the Rings: The Return of the King',
      rating: 8.9,
      poster: 'https://m.media-amazon.com/images/M/MV5BNzA5ZDNlZWMtM2NhNS00NDJjLTk4NDItYTRmY2EwMWI5MTktXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_SX300.jpg'
    },
    {
      imdbID: 'tt0110912',
      title: 'Pulp Fiction',
      rating: 8.9,
      poster: 'https://m.media-amazon.com/images/M/MV5BNGNhMDIzZTUtNTBlZi00MTRlLWFjM2ItYzViMjE3YzI5MjljXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_SX300.jpg'
    },
    {
      imdbID: 'tt0120737',
      title: 'The Lord of the Rings: The Fellowship of the Ring',
      rating: 8.8,
      poster: 'https://m.media-amazon.com/images/M/MV5BN2EyZjM3NzUtNWUzMi00MTgxLWI0NTctMzY4M2VlOTdjZWRiXkEyXkFqcGdeQXVyNDUzOTQ5MjY@._V1_SX300.jpg'
    }
  ]);

  useEffect(() => {
    loadRecentMovies();
  }, []);

  const loadRecentMovies = async () => {
    try {
      const response = await api.get('/movies/recent?limit=12');
      setRecentMovies(response.data.recentMovies || []);
    } catch (error) {
      // Silent fail - not critical for landing page
    }
  };

  const handleGuestLogin = async () => {
    try {
      await guestLogin();
    } catch (error) {
      // Handle error
    }
  };

  return (
    <div className="min-h-screen bg-primary">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center py-20 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 via-transparent to-red-900/10"></div>
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-gradient-primary rounded-full opacity-10 blur-3xl animate-float"></div>
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-gradient-secondary rounded-full opacity-10 blur-3xl animate-float" style={{animationDelay: '2s'}}></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="text-left animate-fade-in">
              <div className="mb-6">
                <span className="inline-block bg-gradient-primary/20 text-red-400 px-4 py-2 rounded-full text-sm font-medium border border-red-400/20 mb-4">
                  🎬 Now Streaming
                </span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 leading-tight">
                <span className="text-primary">Discover Movies</span>
                <br />
                <span className="text-gradient">Like Never Before</span>
              </h1>
              
              <p className="text-lg md:text-xl mb-8 text-secondary leading-relaxed max-w-lg">
                Explore thousands of films, create your personal collection, and dive deep into cinema with advanced search, analytics, and personalized recommendations.
              </p>

              {/* Features List */}
              <div className="flex flex-wrap gap-6 mb-10">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-secondary text-sm">Advanced Search</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span className="text-secondary text-sm">Personal Favorites</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span className="text-secondary text-sm">Movie Analytics</span>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link 
                  to="/signup" 
                  className="btn-primary text-base px-8 py-4 font-semibold group"
                >
                  Get Started Free
                  <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                </Link>
                <button 
                  onClick={handleGuestLogin}
                  className="btn-ghost text-base px-6 py-4 font-medium"
                >
                  🎭 Try as Guest
                </button>
              </div>

              {/* Social Proof */}
              <div className="flex items-center space-x-6 text-sm text-muted">
                <div className="flex items-center space-x-2">
                  <span className="text-yellow-400">⭐</span>
                  <span>4.8/5 Rating</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-400">👥</span>
                  <span>10k+ Users</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-blue-400">🎯</span>
                  <span>50k+ Movies</span>
                </div>
              </div>
            </div>

            {/* Right Movie Showcase */}
            <div className="relative animate-slide-up">
              <div className="relative">
                {/* Main Featured Movie */}
                <div className="relative glass-card p-6 mb-6 border-0 group cursor-pointer">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 relative">
                      <div className="w-24 h-36 relative overflow-hidden rounded-lg">
                        <img 
                          src={heroMovies[0]?.poster} 
                          alt={heroMovies[0]?.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                      </div>
                      <div className="absolute -top-2 -right-2 bg-gradient-primary text-white text-xs px-2 py-1 rounded-full font-bold">
                        ⭐ {heroMovies[0]?.rating}
                      </div>
                    </div>
                    <div className="flex-grow min-w-0">
                      <h3 className="text-lg font-bold text-primary mb-2 line-clamp-2">
                        {heroMovies[0]?.title}
                      </h3>
                      <p className="text-sm text-secondary mb-3">
                        Drama • 1994 • 142 min
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted">Featured Movie</span>
                        <button className="text-red-400 hover:text-red-300 transition-colors text-sm font-medium">
                          Watch Trailer →
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Movie Grid */}
                <div className="grid grid-cols-3 gap-3">
                  {heroMovies.slice(1, 7).map((movie, index) => (
                    <div 
                      key={movie.imdbID}
                      className="relative group cursor-pointer animate-slide-up"
                      style={{animationDelay: `${index * 0.1}s`}}
                    >
                      <div className="aspect-[3/4] relative overflow-hidden rounded-lg glass-card p-2 border-0">
                        <img 
                          src={movie.poster} 
                          alt={movie.title}
                          className="w-full h-full object-cover rounded-md group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-2 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-md"></div>
                        <div className="absolute top-3 right-3 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded font-bold">
                          {movie.rating}
                        </div>
                        <div className="absolute bottom-3 left-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <p className="text-white text-xs font-medium truncate">{movie.title}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Floating Elements */}
                <div className="absolute -top-6 -right-6 w-12 h-12 bg-gradient-secondary rounded-full opacity-60 blur-xl animate-pulse"></div>
                <div className="absolute -bottom-6 -left-6 w-16 h-16 bg-gradient-primary rounded-full opacity-40 blur-xl animate-pulse" style={{animationDelay: '1s'}}></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trending Movies Section */}
      {recentMovies.length > 0 && (
        <section className="py-16 bg-secondary">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-bold text-primary mb-3">
                🔥 Trending Searches
              </h2>
              <p className="text-base text-secondary max-w-2xl mx-auto">
                Discover what movie enthusiasts are exploring right now
              </p>
            </div>
            
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
              {recentMovies.slice(0, 12).map((movie, index) => (
                <div 
                  key={movie.imdbID}
                  className="glass-card overflow-hidden group cursor-pointer border-0 hover:scale-105 transition-all duration-300 animate-slide-up"
                  style={{animationDelay: `${index * 0.05}s`}}
                  onClick={() => window.location.href = '/signin'}
                >
                  <div className="aspect-[3/4] relative">
                    {movie.poster ? (
                      <img 
                        src={movie.poster} 
                        alt={movie.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-secondary flex items-center justify-center">
                        <span className="text-2xl animate-float">🎬</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    {movie.rating && (
                      <div className="absolute top-1 right-1 bg-black/80 text-white text-xs px-1.5 py-0.5 rounded font-bold">
                        {movie.rating}
                      </div>
                    )}
                  </div>
                  <div className="p-2">
                    <h4 className="text-xs font-medium text-primary mb-1 line-clamp-1">{movie.title}</h4>
                    <div className="text-xs text-muted">{movie.year}</div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="text-center mt-8">
              <Link to="/signin" className="btn-primary text-base px-6 py-3 font-semibold">
                Explore All Movies
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="py-16 bg-primary">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-primary mb-3">
              Why Choose MovieFlix?
            </h2>
            <p className="text-base text-secondary max-w-2xl mx-auto">
              More than just a movie database - your complete cinematic companion
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: '🔍',
                title: 'Smart Search',
                description: 'Find movies instantly with advanced filters and intelligent recommendations',
                gradient: 'from-red-500 to-pink-500'
              },
              {
                icon: '❤️',
                title: 'Personal Collection',
                description: 'Save favorites, create watchlists, and export your movie data',
                gradient: 'from-blue-500 to-cyan-500'
              },
              {
                icon: '📊',
                title: 'Movie Analytics',
                description: 'Visualize movie trends, ratings, and discover insights with charts',
                gradient: 'from-green-500 to-emerald-500'
              },
              {
                icon: '🎯',
                title: 'Personalized',
                description: 'Get tailored recommendations based on your viewing preferences',
                gradient: 'from-purple-500 to-violet-500'
              }
            ].map((feature, index) => (
              <div 
                key={index}
                className="text-center glass-card p-6 border-0 hover:scale-105 transition-all duration-300 animate-slide-up"
                style={{animationDelay: `${index * 0.1}s`}}
              >
                <div className={`w-12 h-12 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center mx-auto mb-4 text-xl`}>
                  {feature.icon}
                </div>
                <h3 className="text-base font-bold text-primary mb-2">{feature.title}</h3>
                <p className="text-sm text-secondary leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-secondary">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="glass-card p-8 md:p-12 border-0">
            <div className="text-4xl mb-4 animate-float">🎭</div>
            <h2 className="text-2xl md:text-3xl font-bold text-primary mb-4">
              Ready to Start Your Movie Journey?
            </h2>
            <p className="text-base text-secondary mb-8 max-w-2xl mx-auto leading-relaxed">
              Join thousands of movie enthusiasts who have discovered their next favorite film through MovieFlix's intelligent platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
              <Link to="/signup" className="btn-primary text-base px-8 py-3 font-semibold">
                Get Started Free
              </Link>
              <button onClick={handleGuestLogin} className="btn-ghost text-base px-6 py-3">
                Try Without Signup
              </button>
            </div>
            <p className="text-sm text-muted">
              Free forever • No credit card required • Cancel anytime
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-primary">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-primary mb-3">
              Frequently Asked Questions
            </h2>
            <p className="text-base text-secondary">Everything you need to know about MovieFlix</p>
          </div>
          
          <div className="space-y-3">
            {[
              {
                question: "What is MovieFlix?",
                answer: "MovieFlix is a comprehensive movie discovery platform that helps you search, organize, and analyze your favorite films with advanced features and beautiful analytics."
              },
              {
                question: "Is MovieFlix free to use?",
                answer: "Yes! MovieFlix offers a free tier with access to movie search, favorites, and basic analytics. Create an account to unlock all features."
              },
              {
                question: "Can I export my movie lists?",
                answer: "Absolutely! You can export your favorites and search results to CSV format for easy sharing and backup."
              },
              {
                question: "How accurate is the movie data?",
                answer: "We use the reliable OMDb API to provide up-to-date and accurate movie information including ratings, cast, plot summaries, and more."
              }
            ].map((faq, index) => (
              <details 
                key={index} 
                className="glass-card p-4 border-0 cursor-pointer hover:shadow-md transition-all duration-300 animate-slide-up rounded-lg"
                style={{animationDelay: `${index * 0.05}s`}}
              >
                <summary className="text-base font-semibold text-primary hover:text-gradient transition-colors py-2">
                  {faq.question}
                </summary>
                <p className="mt-2 text-sm text-secondary leading-relaxed pl-4">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
          
          <div className="text-center mt-10">
            <p className="text-base mb-4 text-secondary">Still have questions?</p>
            <Link to="/signup" className="btn-secondary px-6 py-3 text-sm font-medium">
              Contact Support
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
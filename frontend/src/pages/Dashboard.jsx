import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="bg-black/95 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="text-red-600 text-2xl font-bold">MOVIEFLIX</div>
            
            <nav className="hidden md:flex space-x-6">
              <a href="#" className="hover:text-red-500 transition">Home</a>
              <a href="#" className="hover:text-red-500 transition">Movies</a>
              <a href="#" className="hover:text-red-500 transition">TV Shows</a>
              <a href="#" className="hover:text-red-500 transition">My List</a>
            </nav>

            <div className="flex items-center space-x-4">
              <div className="text-sm">
                <span className="text-gray-400">Welcome, </span>
                <span className="font-semibold">{user?.name}</span>
                {user?.subscription && (
                  <span className="ml-2 px-2 py-1 bg-red-600 text-xs rounded">
                    {user.subscription.toUpperCase()}
                  </span>
                )}
              </div>
              <button
                onClick={handleLogout}
                className="btn-secondary text-sm px-4 py-2"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <section className="mb-12">
          <h1 className="text-4xl font-bold mb-4">
            Welcome to MovieFlix, {user?.name}!
          </h1>
          <p className="text-xl text-gray-400 mb-6">
            Discover thousands of movies and TV shows
          </p>
          
          {user?.subscription === 'guest' && (
            <div className="bg-yellow-600/20 border border-yellow-600 text-yellow-300 p-4 rounded-lg mb-6">
              <h3 className="font-semibold mb-2">You're browsing as a guest</h3>
              <p className="text-sm">
                Create an account to save your favorites, create watchlists, and get personalized recommendations.
              </p>
            </div>
          )}
        </section>

        {/* Featured Content */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Featured Today</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="bg-gray-800 rounded-lg overflow-hidden hover:scale-105 transition-transform cursor-pointer">
                <div className="h-48 bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center">
                  <span className="text-2xl font-bold">Movie {item}</span>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold mb-2">Featured Movie {item}</h3>
                  <p className="text-gray-400 text-sm">Action • 2024 • 2h 15m</p>
                  <div className="flex items-center mt-2">
                    <span className="text-yellow-400">★</span>
                    <span className="ml-1 text-sm">8.{item}/10</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Popular Movies */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Popular Movies</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="bg-gray-800 rounded-lg overflow-hidden hover:scale-105 transition-transform cursor-pointer">
                <div className="h-32 bg-gradient-to-br from-blue-600 to-purple-800 flex items-center justify-center">
                  <span className="text-lg font-bold">Movie {item}</span>
                </div>
                <div className="p-3">
                  <h4 className="font-semibold text-sm">Popular Movie {item}</h4>
                  <p className="text-gray-400 text-xs">Drama • 2024</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* TV Shows */}
        <section>
          <h2 className="text-2xl font-bold mb-6">TV Shows</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="bg-gray-800 rounded-lg overflow-hidden hover:scale-105 transition-transform cursor-pointer">
                <div className="h-32 bg-gradient-to-br from-green-600 to-teal-800 flex items-center justify-center">
                  <span className="text-lg font-bold">Show {item}</span>
                </div>
                <div className="p-3">
                  <h4 className="font-semibold text-sm">TV Show {item}</h4>
                  <p className="text-gray-400 text-xs">Comedy • 2024 • S1</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 mt-20 py-8">
        <div className="max-w-6xl mx-auto px-6 text-center text-gray-400">
          <p>&copy; 2024 MovieFlix. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;

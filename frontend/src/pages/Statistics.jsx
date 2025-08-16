import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Link } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';
import api from '../utils/api';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const Statistics = () => {
  const { user, logout } = useAuth();
  const { theme, isDark } = useTheme();
  const [analytics, setAnalytics] = useState(null);
  const [genreStats, setGenreStats] = useState(null);
  const [ratingStats, setRatingStats] = useState(null);
  const [runtimeStats, setRuntimeStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadAllAnalytics();
  }, []);

  const loadAllAnalytics = async () => {
    setLoading(true);
    try {
      const [dashboardRes, genreRes, ratingRes, runtimeRes] = await Promise.all([
        api.get('/movies/analytics/dashboard'),
        api.get('/movies/analytics/genres'),
        api.get('/movies/analytics/ratings'),
        api.get('/movies/analytics/runtime')
      ]);

      setAnalytics(dashboardRes.data.dashboard);
      setGenreStats(genreRes.data.analytics);
      setRatingStats(ratingRes.data.analytics);
      setRuntimeStats(runtimeRes.data.analytics);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to load analytics');
      console.error('Analytics loading error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  // Chart configurations
  const genreChartData = {
    labels: genreStats?.data?.slice(0, 10).map(item => item._id) || [],
    datasets: [
      {
        data: genreStats?.data?.slice(0, 10).map(item => item.count) || [],
        backgroundColor: [
          '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
          '#FF9F40', '#FF6384', '#C9CBCF', '#4BC0C0', '#FF6384'
        ],
        borderColor: '#1f2937',
        borderWidth: 2,
      },
    ],
  };

  const ratingByGenreData = {
    labels: genreStats?.data?.slice(0, 8).map(item => item._id) || [],
    datasets: [
      {
        label: 'Average Rating',
        data: genreStats?.data?.slice(0, 8).map(item => item.avgRating?.toFixed(1) || 0) || [],
        backgroundColor: 'rgba(239, 68, 68, 0.8)',
        borderColor: 'rgba(239, 68, 68, 1)',
        borderWidth: 2,
        borderRadius: 4,
      },
    ],
  };

  const runtimeByYearData = {
    labels: runtimeStats?.data?.slice(0, 15).map(item => item._id).reverse() || [],
    datasets: [
      {
        label: 'Average Runtime (minutes)',
        data: runtimeStats?.data?.slice(0, 15).map(item => Math.round(item.avgRuntime)).reverse() || [],
        borderColor: 'rgba(59, 130, 246, 1)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'rgba(59, 130, 246, 1)',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 6,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#ffffff',
          font: {
            size: 12,
          },
        },
      },
      title: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: 'rgba(239, 68, 68, 0.5)',
        borderWidth: 1,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: '#9CA3AF',
        },
        grid: {
          color: 'rgba(156, 163, 175, 0.1)',
        },
      },
      x: {
        ticks: {
          color: '#9CA3AF',
          maxRotation: 45,
        },
        grid: {
          color: 'rgba(156, 163, 175, 0.1)',
        },
      },
    },
  };

  const pieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: '#ffffff',
          font: {
            size: 11,
          },
          usePointStyle: true,
          padding: 15,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: 'rgba(239, 68, 68, 0.5)',
        borderWidth: 1,
      },
    },
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="flex flex-col items-center space-y-6 animate-fade-in">
          <div className="animate-spin w-16 h-16 border-4 border-primary border-t-transparent rounded-full"></div>
          <div className="text-2xl text-primary font-bold">📊 Loading Analytics...</div>
          <div className="text-secondary">Preparing your movie statistics</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="glass-card p-12 text-center max-w-lg border-0 animate-slide-up">
          <div className="text-6xl mb-6 animate-float">❌</div>
          <div className="text-2xl font-bold text-primary mb-4">Error Loading Analytics</div>
          <p className="text-secondary mb-8 text-lg">{error}</p>
          <button onClick={loadAllAnalytics} className="btn-primary px-8 py-3">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary">

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="mb-12 text-center animate-fade-in">
          <h1 className="text-5xl font-black text-primary mb-6">📊 Movie Analytics Dashboard</h1>
          <p className="text-2xl text-secondary max-w-3xl mx-auto">
            Comprehensive insights into movie data, genres, ratings, and trends from your cached collection
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <div className="glass-card p-8 text-center hover:scale-105 transition-all duration-300 border-0 animate-slide-up" style={{animationDelay: '0.1s'}}>
            <div className="text-4xl font-black bg-gradient-secondary bg-clip-text text-transparent mb-2">
              {analytics?.summary?.totalMovies || 0}
            </div>
            <div className="text-primary font-bold text-lg mb-1">Total Movies</div>
            <div className="text-sm text-muted">In database cache</div>
          </div>
          <div className="glass-card p-8 text-center hover:scale-105 transition-all duration-300 border-0 animate-slide-up" style={{animationDelay: '0.2s'}}>
            <div className="text-4xl font-black text-gradient mb-2">{analytics?.summary?.totalGenres || 0}</div>
            <div className="text-primary font-bold text-lg mb-1">Unique Genres</div>
            <div className="text-sm text-muted">Across all movies</div>
          </div>
          <div className="glass-card p-8 text-center hover:scale-105 transition-all duration-300 border-0 animate-slide-up" style={{animationDelay: '0.3s'}}>
            <div className="text-4xl font-black bg-gradient-primary bg-clip-text text-transparent mb-2">
              {analytics?.summary?.avgRating?.toFixed(1) || '0.0'}
            </div>
            <div className="text-primary font-bold text-lg mb-1">Avg Rating</div>
            <div className="text-sm text-muted">IMDb average</div>
          </div>
          <div className="glass-card p-8 text-center hover:scale-105 transition-all duration-300 border-0 animate-slide-up" style={{animationDelay: '0.4s'}}>
            <div className="text-4xl font-black text-gradient mb-2">{analytics?.summary?.totalYears || 0}</div>
            <div className="text-primary font-bold text-lg mb-1">Years Covered</div>
            <div className="text-sm text-muted">Movie timeline</div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="space-y-8">
          {/* Genre Distribution Pie Chart */}
          <div className="glass-card p-8 rounded-2xl border-0 hover:shadow-xl transition-all duration-300 animate-slide-up" style={{animationDelay: '0.5s'}}>
            <h2 className="text-3xl font-bold mb-8 flex items-center text-primary">
              🎭 Genre Distribution
              <span className="ml-4 text-sm text-muted font-normal bg-secondary px-3 py-1 rounded-full">
                {genreStats?.data?.reduce((sum, item) => sum + item.count, 0)} total movies
              </span>
            </h2>
            <div className="h-96">
              <Pie data={genreChartData} options={pieChartOptions} />
            </div>
          </div>

          {/* Rating by Genre Bar Chart */}
          <div className="glass-card p-8 rounded-2xl border-0 hover:shadow-xl transition-all duration-300 animate-slide-up" style={{animationDelay: '0.6s'}}>
            <h2 className="text-3xl font-bold mb-8 flex items-center text-primary">
              ⭐ Average Ratings by Genre
              <span className="ml-4 text-sm text-muted font-normal bg-secondary px-3 py-1 rounded-full">
                Top 8 genres by movie count
              </span>
            </h2>
            <div className="h-96">
              <Bar data={ratingByGenreData} options={chartOptions} />
            </div>
          </div>

          {/* Runtime by Year Line Chart */}
          <div className="glass-card p-8 rounded-2xl border-0 hover:shadow-xl transition-all duration-300 animate-slide-up" style={{animationDelay: '0.7s'}}>
            <h2 className="text-3xl font-bold mb-8 flex items-center text-primary">
              📈 Average Runtime by Year
              <span className="ml-4 text-sm text-muted font-normal bg-secondary px-3 py-1 rounded-full">
                Last 15 years with data
              </span>
            </h2>
            <div className="h-96">
              <Line data={runtimeByYearData} options={chartOptions} />
            </div>
          </div>

          {/* Detailed Statistics Tables */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Top Genres Table */}
            <div className="glass-card p-8 rounded-2xl border-0 hover:shadow-xl transition-all duration-300 animate-slide-up" style={{animationDelay: '0.8s'}}>
              <h3 className="text-2xl font-bold mb-6 text-primary">🏆 Top Performing Genres</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b" style={{ borderColor: 'rgb(var(--border-primary))' }}>
                      <th className="text-left p-3 text-primary font-semibold">Genre</th>
                      <th className="text-center p-3 text-primary font-semibold">Movies</th>
                      <th className="text-center p-3 text-primary font-semibold">Avg Rating</th>
                    </tr>
                  </thead>
                  <tbody>
                    {genreStats?.data?.slice(0, 10).map((genre, index) => (
                      <tr key={genre._id} className="border-b border-opacity-30 hover:bg-secondary/20 transition-colors" style={{ borderColor: 'rgb(var(--border-primary))' }}>
                        <td className="p-3 font-medium text-primary">{genre._id}</td>
                        <td className="text-center p-3">
                          <span className="bg-gradient-primary px-3 py-1 text-xs rounded-full text-white font-bold">
                            {genre.count}
                          </span>
                        </td>
                        <td className="text-center p-3 text-yellow-400 font-semibold">
                          ⭐ {genre.avgRating?.toFixed(1) || 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Runtime Statistics */}
            <div className="glass-card p-8 rounded-2xl border-0 hover:shadow-xl transition-all duration-300 animate-slide-up" style={{animationDelay: '0.9s'}}>
              <h3 className="text-2xl font-bold mb-6 text-primary">⏱️ Runtime Analysis</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-secondary rounded-xl">
                  <span className="text-primary font-medium">Overall Average</span>
                  <span className="font-bold text-lg text-gradient">
                    {runtimeStats?.data?.length > 0 
                      ? Math.round(runtimeStats.data.reduce((sum, item) => sum + item.avgRuntime, 0) / runtimeStats.data.length)
                      : 0
                    } min
                  </span>
                </div>
                <div className="text-sm text-secondary">
                  <strong className="text-primary text-base">Runtime Trends:</strong>
                  <ul className="mt-3 space-y-2 ml-4">
                    <li className="flex items-center space-x-2">
                      <span className="text-green-400">▲</span>
                      <span>Longest average: <strong>{runtimeStats?.data?.[0] ? `${Math.round(Math.max(...runtimeStats.data.map(r => r.avgRuntime)))} min` : 'N/A'}</strong></span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="text-blue-400">▼</span>
                      <span>Shortest average: <strong>{runtimeStats?.data?.[0] ? `${Math.round(Math.min(...runtimeStats.data.map(r => r.avgRuntime)))} min` : 'N/A'}</strong></span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="text-purple-400">📊</span>
                      <span>Years with data: <strong>{runtimeStats?.data?.length || 0}</strong></span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Rating Distribution */}
          <div className="glass-card p-8 rounded-2xl border-0 hover:shadow-xl transition-all duration-300 animate-slide-up" style={{animationDelay: '1.0s'}}>
            <h3 className="text-2xl font-bold mb-6 text-primary text-center">📊 Rating Distribution Overview</h3>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="glass-card p-6 rounded-xl text-center border-0 hover:scale-105 transition-all duration-300">
                <div className="text-3xl font-black text-gradient mb-2">
                  {ratingStats?.data?.maxRating?.toFixed(1) || 'N/A'}
                </div>
                <div className="text-sm text-muted font-medium">Highest Rating</div>
              </div>
              <div className="glass-card p-6 rounded-xl text-center border-0 hover:scale-105 transition-all duration-300">
                <div className="text-3xl font-black bg-gradient-primary bg-clip-text text-transparent mb-2">
                  {ratingStats?.data?.avgRating?.toFixed(1) || 'N/A'}
                </div>
                <div className="text-sm text-muted font-medium">Average Rating</div>
              </div>
              <div className="glass-card p-6 rounded-xl text-center border-0 hover:scale-105 transition-all duration-300">
                <div className="text-3xl font-black bg-gradient-secondary bg-clip-text text-transparent mb-2">
                  {ratingStats?.data?.minRating?.toFixed(1) || 'N/A'}
                </div>
                <div className="text-sm text-muted font-medium">Lowest Rating</div>
              </div>
              <div className="glass-card p-6 rounded-xl text-center border-0 hover:scale-105 transition-all duration-300">
                <div className="text-3xl font-black text-gradient mb-2">
                  {ratingStats?.data?.totalMovies || 0}
                </div>
                <div className="text-sm text-muted font-medium">Rated Movies</div>
              </div>
            </div>
          </div>
        </div>

        {/* Refresh Button */}
        <div className="mt-12 text-center animate-fade-in">
          <div className="glass-card p-8 max-w-md mx-auto border-0">
            <button 
              onClick={loadAllAnalytics}
              className="btn-primary px-8 py-4 text-lg font-semibold"
              disabled={loading}
            >
              {loading ? '🔄 Refreshing...' : '🔄 Refresh Analytics'}
            </button>
            <p className="text-sm text-muted mt-4">
              Last updated: {analytics ? new Date(analytics.generatedAt).toLocaleString() : 'Never'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Statistics;

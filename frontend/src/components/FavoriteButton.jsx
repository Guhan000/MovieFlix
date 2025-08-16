import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../utils/api';

const FavoriteButton = ({ movie, className = "", size = "w-6 h-6" }) => {
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated && movie?.imdbID) {
      checkFavoriteStatus();
    }
  }, [isAuthenticated, movie?.imdbID]);

  const checkFavoriteStatus = async () => {
    try {
      const response = await api.get(`/favorites/check/${movie.imdbID}`);
      setIsFavorite(response.data.isFavorite);
    } catch (error) {
      // Silent fail - not critical
    }
  };

  const toggleFavorite = async (e) => {
    e.stopPropagation();
    
    if (!isAuthenticated) {
      toast.warning('Please sign in to add favorites');
      return;
    }

    if (!movie?.imdbID) {
      toast.error('Invalid movie data');
      return;
    }

    setLoading(true);
    
    try {
      if (isFavorite) {
        // Remove from favorites
        await api.delete(`/favorites/${movie.imdbID}`);
        setIsFavorite(false);
        toast.success(`Removed "${movie.title}" from favorites`);
      } else {
        // Add to favorites
        await api.post(`/favorites/${movie.imdbID}`);
        setIsFavorite(true);
        toast.success(`Added "${movie.title}" to favorites`);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 
        (isFavorite ? 'Failed to remove from favorites' : 'Failed to add to favorites');
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <button
      onClick={toggleFavorite}
      disabled={loading}
      className={`
        ${className}
        ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110'}
        transition-all duration-200 p-2 rounded-full
        ${isFavorite 
          ? 'text-red-500 bg-red-500/20 hover:bg-red-500/30' 
          : 'text-gray-400 bg-black/40 hover:text-red-400 hover:bg-red-500/20'
        }
      `}
      title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
    >
      <svg 
        className={size} 
        fill={isFavorite ? 'currentColor' : 'none'} 
        stroke="currentColor" 
        viewBox="0 0 24 24"
        strokeWidth={isFavorite ? 0 : 2}
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
        />
      </svg>
    </button>
  );
};

export default FavoriteButton;

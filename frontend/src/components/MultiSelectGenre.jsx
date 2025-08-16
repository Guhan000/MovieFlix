import React, { useState, useEffect, useRef } from 'react';

const MultiSelectGenre = ({ selectedGenres, onGenresChange, availableGenres = [] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  // Common movie genres for fallback
  const defaultGenres = [
    'Action', 'Adventure', 'Animation', 'Biography', 'Comedy', 'Crime', 
    'Documentary', 'Drama', 'Family', 'Fantasy', 'History', 'Horror',
    'Music', 'Mystery', 'Romance', 'Sci-Fi', 'Sport', 'Thriller', 'War', 'Western'
  ];

  const genres = availableGenres.length > 0 ? availableGenres : defaultGenres;

  const filteredGenres = genres.filter(genre =>
    genre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleGenreToggle = (genre) => {
    if (selectedGenres.includes(genre)) {
      onGenresChange(selectedGenres.filter(g => g !== genre));
    } else {
      onGenresChange([...selectedGenres, genre]);
    }
  };

  const clearAllGenres = () => {
    onGenresChange([]);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="input-field w-full text-left flex justify-between items-center"
      >
        <span className="truncate">
          {selectedGenres.length === 0 
            ? 'Select Genres' 
            : selectedGenres.length === 1 
              ? selectedGenres[0]
              : `${selectedGenres.length} genres selected`
          }
        </span>
        <svg 
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 glass-card border-0 rounded-xl shadow-xl max-h-64 overflow-hidden">
          {/* Search Input */}
          <div className="p-4" style={{ borderBottom: '1px solid rgb(var(--border-primary))' }}>
            <input
              type="text"
              placeholder="Search genres..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field w-full"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {/* Clear All Button */}
          {selectedGenres.length > 0 && (
            <div className="p-3" style={{ borderBottom: '1px solid rgb(var(--border-primary))' }}>
              <button
                onClick={clearAllGenres}
                className="w-full text-left glass-card px-4 py-2 text-red-400 border-0 hover:scale-105 transition-all duration-200 rounded-lg text-sm font-medium"
              >
                ✕ Clear all genres
              </button>
            </div>
          )}

          {/* Genre List */}
          <div className="max-h-40 overflow-y-auto">
            {filteredGenres.map((genre) => (
              <label
                key={genre}
                className="flex items-center px-4 py-3 hover:bg-tertiary cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selectedGenres.includes(genre)}
                  onChange={() => handleGenreToggle(genre)}
                  className="mr-3 rounded border-2 text-red-500 focus:ring-red-500 focus:ring-2"
                  style={{ borderColor: 'rgb(var(--border-primary))' }}
                />
                <span className="text-primary font-medium">{genre}</span>
              </label>
            ))}
            {filteredGenres.length === 0 && (
              <div className="px-4 py-3 text-muted text-sm text-center">
                No genres found
              </div>
            )}
          </div>
        </div>
      )}

      {/* Selected Genres Display */}
      {selectedGenres.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {selectedGenres.map((genre) => (
            <span
              key={genre}
              className="inline-flex items-center px-3 py-1 bg-gradient-primary/20 text-red-400 text-sm rounded-full border border-red-400/30 font-medium hover:scale-105 transition-transform"
            >
              {genre}
              <button
                onClick={() => handleGenreToggle(genre)}
                className="ml-2 text-red-400 hover:text-red-300 font-bold hover:scale-125 transition-all"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default MultiSelectGenre;

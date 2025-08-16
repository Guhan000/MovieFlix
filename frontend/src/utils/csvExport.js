/**
 * Export movie data to CSV format
 * @param {Array} movies - Array of movie objects
 * @param {String} filename - Name of the CSV file
 */
export const exportMoviesToCSV = (movies, filename = 'movieflix_movies.csv') => {
  if (!movies || movies.length === 0) {
    throw new Error('No movies to export');
  }

  // Define CSV headers
  const headers = [
    'Title',
    'Year', 
    'Rating',
    'Runtime',
    'Genre',
    'Director',
    'Actors',
    'Plot',
    'Language',
    'Country',
    'IMDb ID'
  ];

  // Convert movies to CSV rows
  const csvRows = [
    headers.join(','), // Header row
    ...movies.map(movie => [
      escapeCsvField(movie.title || ''),
      movie.year || '',
      movie.rating || '',
      movie.runtime || '',
      escapeCsvField(Array.isArray(movie.genre) ? movie.genre.join('; ') : movie.genre || ''),
      escapeCsvField(movie.director || ''),
      escapeCsvField(Array.isArray(movie.actors) ? movie.actors.join('; ') : movie.actors || ''),
      escapeCsvField(movie.plot || ''),
      escapeCsvField(movie.language || ''),
      escapeCsvField(movie.country || ''),
      movie.imdbID || ''
    ].join(','))
  ];

  // Create CSV content
  const csvContent = csvRows.join('\n');

  // Create and trigger download
  downloadCSV(csvContent, filename);
};

/**
 * Escape CSV field content
 * @param {String} field - Field content to escape
 * @returns {String} - Escaped field content
 */
const escapeCsvField = (field) => {
  if (typeof field !== 'string') {
    field = String(field);
  }
  
  // If field contains comma, newline, or quote, wrap in quotes and escape quotes
  if (field.includes(',') || field.includes('\n') || field.includes('"')) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  
  return field;
};

/**
 * Download CSV content as file
 * @param {String} content - CSV content
 * @param {String} filename - File name
 */
const downloadCSV = (content, filename) => {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};

/**
 * Export search results with metadata
 * @param {Array} movies - Movies to export
 * @param {Object} searchInfo - Search metadata
 */
export const exportSearchResults = (movies, searchInfo = {}) => {
  const { searchTerm, filters, totalResults } = searchInfo;
  
  let filename = 'movieflix_search_results.csv';
  
  if (searchTerm) {
    const sanitizedSearchTerm = searchTerm.replace(/[^a-zA-Z0-9]/g, '_');
    filename = `movieflix_${sanitizedSearchTerm}_${movies.length}_results.csv`;
  }
  
  try {
    exportMoviesToCSV(movies, filename);
    return {
      success: true,
      filename,
      count: movies.length
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

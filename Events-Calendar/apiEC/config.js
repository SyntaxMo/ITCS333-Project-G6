const config = {
    // API endpoints
    apiBaseUrl: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost/Events-Calendar/apiEC/api.php'
        : 'https://your-replit-url.repl.co/Events-Calendar/apiEC/api.php',
    
    // Image upload settings
    maxFileSize: 5 * 1024 * 1024, // 5MB
    allowedImageTypes: ['image/jpeg', 'image/png', 'image/jpg'],
    
    // Pagination settings
    eventsPerPage: 9,
    
    // Categories
    categories: ['Workshop', 'Competition', 'Talk', 'Meetup', 'Social', 'Others']
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = config;
} 
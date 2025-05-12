// API Configuration
const API_CONFIG = {
    // Base URL for API endpoints
    BASE_URL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
        ? 'http://localhost:3000/api' // Local development
        : 'https://your-production-url.com/api' // Production URL
};

// Don't modify this line - it's used to export the config
if (typeof module !== 'undefined' && module.exports) {
    module.exports = API_CONFIG;
}
// API Configuration
const API_CONFIG = {
    // Base URL for API endpoints
    BASE_URL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
        ? 'https://d5fad21c-f428-429a-9bb1-2ac8b3537d7d-00-1ca4huywajoo5.pike.replit.dev/CRapi.php?action=getReviews&' // Local development
        : 'https://d5fad21c-f428-429a-9bb1-2ac8b3537d7d-00-1ca4huywajoo5.pike.replit.dev/CRapi.php?action=getReviews&' // Production URL
};

// Don't modify this line - it's used to export the config
if (typeof module !== 'undefined' && module.exports) {
    module.exports = API_CONFIG;
}
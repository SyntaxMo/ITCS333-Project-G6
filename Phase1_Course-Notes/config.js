// API Configuration
const API_CONFIG = {
    // Base URL for API endpoints
    BASE_URL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
        ? '/Phase1_Course-Notes/apiCS.php' // Local development
        : 'https://63d98e1d-18eb-45d2-a341-3e5b80497860-00-2allsb7etny4v.pike.replit.dev/Phase1_Course-Notes/apiCS.php' // Production URL on Replit
};

// Don't modify this line - it's used to export the config
if (typeof module !== 'undefined' && module.exports) {
    module.exports = API_CONFIG;
}
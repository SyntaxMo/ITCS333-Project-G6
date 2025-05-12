// API Configuration
const API_CONFIG = {
    // Base URL for API endpoints
    BASE_URL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
        ? '/Phase1_Course-Notes/apiCS.php' // Local development
        : 'https://269a91e9-dce2-40e0-800d-0fa7b402854c-00-25or2lwnnjnlo.pike.replit.dev/Phase1_Course-Notes/apiCS.php' // Production URL on Replit
};

// Don't modify this line - it's used to export the config
if (typeof module !== 'undefined' && module.exports) {
    module.exports = API_CONFIG;
}
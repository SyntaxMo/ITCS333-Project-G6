// API Configuration
const API_CONFIG = {
    // Change this URL based on your environment
    BASE_URL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
        ? '../apiMP' // Local XAMPP
        : 'https://your-replit-url/apiMP' // PUT THE REPLIT URL HERE
};

// Don't modify this line - it's used to export the config
if (typeof module !== 'undefined' && module.exports) {
    module.exports = API_CONFIG;
}
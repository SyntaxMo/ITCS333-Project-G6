// Fetch and Render News Articles
// This function fetches news articles from a placeholder API and dynamically renders them on the page.
async function fetchNews() {
    const newsContainer = document.querySelector('#news-container');
    const loadingIndicator = document.querySelector('#loading-indicator');
    
    if (!newsContainer || !loadingIndicator) {
        console.error('Required DOM elements are missing: #news-container or #loading-indicator');
        return;
    }
    
    loadingIndicator.style.display = 'block';

    try {
        const response = await fetch('https://jsonplaceholder.typicode.com/posts');
        if (!response.ok) throw new Error('Failed to fetch news articles');
        const newsData = await response.json();

        // Render articles
        newsContainer.innerHTML = newsData.slice(0, 10).map(article => `
            <div class="col-md-4 mb-4">
      <div class="card">
        <img src="Pic/University-of-Bahrain-1260x630.jpg" class="card-img-top" alt="News Image">
        <div class="card-body">
          <h5 class="card-title">${article.title}</h5>
          <p class="card-text">${article.body.substring(0, 100)}.</p>
          <a href="ViewNews.html" class="btn btn-outline-primary">Read More</a>
        </div>
      </div>
    </div>
        `).join('');
    } catch (error) {
        newsContainer.innerHTML = `<p class="text-danger">Error: ${error.message}</p>`;
    } finally {
        loadingIndicator.style.display = 'none';
    }
}

// Form Validation
function validateForm() {
    const titleInput = document.querySelector('input[name="title"]');
    const collegeSelect = document.querySelector('select[name="college"]');
    const errorContainer = document.querySelector('#form-errors');
    errorContainer.innerHTML = '';

    if (!titleInput.value.trim()) {
        errorContainer.innerHTML += '<p class="text-danger">Title is required.</p>';
    }
    if (!collegeSelect.value) {
        errorContainer.innerHTML += '<p class="text-danger">Please select a college.</p>';
    }

    return errorContainer.innerHTML === '';
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Fetch and render news articles
    fetchNews();

    // Add form validation
    const form = document.querySelector('form');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            if (validateForm()) {
                alert('Form is valid and ready to submit!');
            }
        });
    }
});
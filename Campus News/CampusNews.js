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
        const response = await fetch('https://replit.com/@A-Alomari/camp#news.json'); // Fetching from the local file
        if (!response.ok) throw new Error('Failed to fetch news articles');
        const newsData = await response.json();

        newsContainer.innerHTML = newsData.map(article => `
            <div class="col-md-4 mb-4" data-college="${article.college}">
                <div class="card">
                    <img src="${article.image}" class="card-img-top" alt="News Image">
                    <div class="card-body">
                        <h5 class="card-title">${article.title}</h5>
                        <p class="card-text">${article.content ? article.content.substring(0, 100) : 'No content available'}...</p>
                        <a href="ViewNews.html" class="btn btn-outline-primary" onclick="viewArticle(${article.id})">Read More</a>
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

function viewArticle(articleId) {
    fetch('https://replit.com/@A-Alomari/camp#news.json')
        .then(response => response.json())
        .then(data => {
            const selectedArticle = data.find(article => article.id === articleId);
            if (selectedArticle) {
                // Increment the views count
                selectedArticle.views += 1;

                // Save the updated article to localStorage
                localStorage.setItem('selectedArticle', JSON.stringify(selectedArticle));

                // Redirect to the ViewNews.html page
                window.location.href = 'ViewNews.html';
            }
        })
        .catch(error => console.error('Error fetching article:', error));
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

    const selectedArticle = JSON.parse(localStorage.getItem('selectedArticle'));

    if (selectedArticle) {
        // Increment the views count for the selected article
        fetch('https://replit.com/@A-Alomari/camp#news.json')
            .then(response => response.json())
            .then(data => {
                const article = data.find(item => item.id === selectedArticle.id);
                if (article) {
                    article.views += 1;

                    // Save the updated data back to the JSON file (requires server-side handling)
                    fetch('https://replit.com/@A-Alomari/camp#news.json', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(data)
                    });
                }
            })
            .catch(error => console.error('Error updating views:', error));
    }
});

function handleCollegeChange() {
    const checkedBoxes = document.querySelectorAll('#collegeCollapse input[type="checkbox"]:checked');
    const selectedColleges = Array.from(checkedBoxes)
        .map(checkbox => checkbox.value.trim())
        .filter(val => val !== 'all');

    const allChecked = document.getElementById('collegeAll').checked;
    const cards = document.querySelectorAll('#news-container > div[data-college]');

    cards.forEach(card => {
        const cardCollege = card.getAttribute('data-college');
        if (allChecked || selectedColleges.length === 0 || selectedColleges.includes(cardCollege)) {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
}

function applyFiltersAndPagination() {
    const collegeCheckboxes = document.querySelectorAll('#collegeCollapse input[type="checkbox"]');
    const allNews = []; // Replace with the actual news data source or fetch it dynamically
    const selectedColleges = Array.from(collegeCheckboxes)
        .filter(checkbox => checkbox.checked)
        .map(checkbox => checkbox.value.trim());

    let filteredNews = allNews.filter(article => {
        // If "All Colleges" is selected, show all articles
        if (selectedColleges.includes("all")) {
            return true;
        }
        // Otherwise, filter by selected colleges
        return selectedColleges.includes(article.college);
    });

    displayNews(filteredNews);
    updatePagination(filteredNews.length);
}

const allCheckbox = document.getElementById('collegeAll');
const otherCheckboxes = document.querySelectorAll('#collegeCollapse input[type="checkbox"]:not(#collegeAll)');

if (allCheckbox.checked) {
    otherCheckboxes.forEach(cb => cb.checked = false);
}

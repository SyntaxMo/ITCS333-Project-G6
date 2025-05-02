async function fetchNews() {
    const newsContainer = document.querySelector('#news-container');
    const loadingIndicator = document.querySelector('#loading-indicator');

    if (!newsContainer || !loadingIndicator) {
        console.error('Required DOM elements are missing: #news-container or #loading-indicator');
        return;
    }
    loadingIndicator.style.display = 'block';
    try {
        const response = await fetch('http://localhost/ITCS333-Project-G6/CampusNews/api.php/articles');
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
    fetch('./news.json') // Ensure the path points to the correct JSON file
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
        fetch('./news.json')
            .then(response => response.json())
            .then(data => {
                const article = data.find(item => item.id === selectedArticle.id);
                if (article) {
                    article.views += 1;

                    // Save the updated data back to the JSON file (requires server-side handling)
                    fetch('./news.json', { // Ensure the path is correct relative to your script
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
    const allNews = JSON.parse(localStorage.getItem('newsData')) || []; // Fetch or use stored data
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

document.addEventListener('DOMContentLoaded', () => {
    const allCheckbox = document.getElementById('collegeAll');
    const otherCheckboxes = document.querySelectorAll('#collegeCollapse input[type="checkbox"]:not(#collegeAll)');

    if (allCheckbox) {
        allCheckbox.addEventListener('change', () => {
            if (allCheckbox.checked) {
                otherCheckboxes.forEach(cb => cb.checked = false);
            }
        });
    }
});

// JavaScript logic from AddArticle.html
new FroalaEditor("#froala-editor", {
    events: {
        'froalaEditor.contentChanged': function () {
            var editorContent = this.html.get();
            document.querySelector('textarea[name="content"]').value = editorContent;
        }
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form');

    if (form) { // Add a null check to ensure the form exists
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const title = form.querySelector('input[name="title"]').value;
            const college = form.querySelector('select[name="college"]').value;
            const courseCode = form.querySelector('input[name="course_code"]').value || null;
            const image = form.querySelector('input[name="image_file"]').files[0]?.name || "default.jpg";
            const content = form.querySelector('textarea[name="content"]').value;

            if (!title || !college) {
                alert('Title and College are required fields.');
                return;
            }

            const newArticle = {
                id: Date.now(),
                title,
                content,
                author: "Anonymous",
                date: new Date().toISOString().split('T')[0],
                image: `Pic/${image}`,
                college,
                courseCode,
                views: 0
            };

            try {
                const response = await fetch('./news.json', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(newArticle)
                });

                if (response.ok) {
                    alert('Article added successfully!');
                    window.location.href = 'Campus News.html';
                } else {
                    alert('Failed to add article. Please try again.');
                }
            } catch (error) {
                console.error('Error adding article:', error);
                alert('An error occurred. Please try again later.');
            }
        });
    }
});

// JavaScript logic from ViewNews.html
document.addEventListener('DOMContentLoaded', () => {
    const selectedArticle = JSON.parse(localStorage.getItem('selectedArticle'));

    if (selectedArticle) {
        const articleTitle = document.querySelector('.article-title');
        const articleContent = document.querySelector('.article-content');
        const articleImage = document.querySelector('.article-image');
        const articleDate = document.querySelector('.article-meta .h5.mb-1');
        const articleAuthor = document.querySelector('.article-meta .h5.mb-0');

        if (articleTitle) articleTitle.textContent = selectedArticle.title;
        if (articleContent) articleContent.textContent = selectedArticle.content;
        if (articleImage) articleImage.src = selectedArticle.image;
        if (articleDate) articleDate.textContent = `📅 ${selectedArticle.date}`;
        if (articleAuthor) articleAuthor.textContent = `✍️ ${selectedArticle.author}`;

        localStorage.removeItem('selectedArticle');
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.querySelector('input[type="search"]');
    const newsContainer = document.querySelector('#news-container');

    if (searchInput && newsContainer) {
        searchInput.addEventListener('input', () => {
            const query = searchInput.value.toLowerCase().replace(/\s+/g, ''); // Remove spaces from the query
            const articles = newsContainer.querySelectorAll('div[data-college]');

            articles.forEach(article => {
                const title = article.querySelector('.card-title').textContent.toLowerCase().replace(/\s+/g, ''); // Remove spaces from the title
                const content = article.querySelector('.card-text').textContent.toLowerCase().replace(/\s+/g, ''); // Remove spaces from the content

                if (title.includes(query) || content.includes(query)) {
                    article.style.display = 'block';
                } else {
                    article.style.display = 'none';
                }
            });
        });
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const sortDropdown = document.querySelector('.dropdown-menu');
    const newsContainer = document.querySelector('#news-container');

    if (sortDropdown && newsContainer) {
        sortDropdown.addEventListener('click', async (event) => {
            const sortOption = event.target.textContent.trim();

            try {
                const response = await fetch('./news.json');
                if (!response.ok) throw new Error('Failed to fetch news articles');
                const newsData = await response.json();

                // Apply filters if any
                const filteredArticles = Array.from(newsContainer.querySelectorAll('div[data-college]'))
                    .map(article => {
                        const id = parseInt(article.getAttribute('data-id'), 10);
                        return newsData.find(item => item.id === id);
                    })
                    .filter(Boolean); // Remove null values

                let sortedArticles = [...filteredArticles];

                if (sortOption === 'By Newest') {
                    sortedArticles.sort((a, b) => new Date(b.date) - new Date(a.date));
                } else if (sortOption === 'By Popular') {
                    sortedArticles.sort((a, b) => b.views - a.views);
                } else if (sortOption === 'By Colleges') {
                    sortedArticles.sort((a, b) => a.college.localeCompare(b.college));
                }
            } catch (error) {
                console.error('Error sorting articles:', error);
            }
        });
    }
});

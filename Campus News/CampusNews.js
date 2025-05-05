// DOM Elements
const newsContainer = document.querySelector('#news-container');
const loadingIndicator = document.querySelector('#loading-indicator');
const form = document.querySelector('form');
const allCheckbox = document.getElementById('collegeAll');
const otherCheckboxes = document.querySelectorAll('#collegeCollapse input[type="checkbox"]:not(#collegeAll)');
const searchInput = document.querySelector('input[type="search"]');
const sortDropdown = document.getElementById('sortDropdownMenu');
const courseCodeInput = document.getElementById('courseCode');
const deleteButton = document.querySelector('.btn-danger'); // Fix: define deleteButton so it doesn't throw ReferenceError

// Global Data Stores
let globalNewsData = [];
let filteredNewsData = [];
let currentPage = 1;

// Use the full base URL for images from Replit
const baseUrl = "https://7c52feb7-4a7c-440b-af78-47bb633d14a6-00-2v8szsbn47wab.sisko.replit.dev/";

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    initializeApplication();
});

function initializeApplication() {
    fetchNews();
    setupEventListeners();
    initializeFroalaEditor();
}

// Fetch news data from server
async function fetchNews() {
    if (!newsContainer || !loadingIndicator) {
        console.error('Required elements missing');
        return;
    }

    loadingIndicator.style.display = 'block';
    newsContainer.innerHTML = '';

    try {
        // Add cache-busting query param to always get the latest news
        const response = await fetch('https://7c52feb7-4a7c-440b-af78-47bb633d14a6-00-2v8szsbn47wab.sisko.replit.dev/getNews.php?' + new Date().getTime());
        if (!response.ok) throw new Error('Failed to fetch articles');
        
        globalNewsData = await response.json();
        filteredNewsData = [...globalNewsData];
        
        displayArticles(1, filteredNewsData);
        updatePagination(filteredNewsData.length);
        updateRecentNewsCards(globalNewsData);
    } catch (error) {
        newsContainer.innerHTML = `<p class="text-danger">Error: ${error.message}</p>`;
    } finally {
        loadingIndicator.style.display = 'none';
    }
}

// Display articles in 3x3 grid
function displayArticles(pageNumber, data) {
    currentPage = pageNumber;
    const startIndex = (pageNumber - 1) * 9;
    const endIndex = startIndex + 9;
    const articlesToShow = data.slice(startIndex, endIndex);

    newsContainer.innerHTML = '';

    articlesToShow.forEach(article => {
        const articleElement = createArticleElement(article);
        newsContainer.appendChild(articleElement);
    });

    updateActivePaginationItem(pageNumber);
}

// Create individual article element
function createArticleElement(article) {
    const colDiv = document.createElement('div');
    colDiv.className = 'col-lg-4 col-md-6 col-sm-12 mb-4';
    colDiv.setAttribute('data-college', article.college);
    colDiv.setAttribute('data-course-code', article.courseCode || '');
    // Use default image if not found or if image is missing
    let imgSrc = article.image ? baseUrl + article.image : baseUrl + "Pic/default.jpg";
    // fallback for broken images
    colDiv.innerHTML = `
        <div class="card h-100">
            <img src="${imgSrc}" class="card-img-top" alt="${article.title}" onerror="this.onerror=null;this.src='${baseUrl}Pic/default.jpg';">
            <div class="card-body d-flex flex-column">
                <h5 class="card-title">${article.title}</h5>
                <p class="card-text flex-grow-1">${article.content?.substring(0, 100) || 'No content available'}...</p>
                <div class="mt-auto">
                    <p class="card-text">
                        <small class="text-muted">📅 ${article.date} | ✍️ ${article.author}</small><br>
                        <small class="text-muted">🏫 ${article.college}</small><br>
                        <small class="text-muted">📚 ${article.courseCode || 'N/A'}</small><br>
                        <small class="text-muted">👁️ ${article.views} views</small>
                    </p>
                    <a href="ViewNews.html" class="btn btn-outline-primary" onclick="viewArticle(${article.id})">Read More</a>
                </div>
            </div>
        </div>
    `;

    return colDiv;
}

// Update pagination controls
function updatePagination(totalItems) {
    const paginationContainer = document.querySelector('.pagination');
    if (!paginationContainer) return;

    paginationContainer.innerHTML = '';
    const totalPages = Math.ceil(totalItems / 9);

    // Previous Button
    const prevItem = document.createElement('li');
    prevItem.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
    prevItem.innerHTML = `<a class="page-link" href="#" aria-label="Previous">&laquo;</a>`;
    prevItem.addEventListener('click', (e) => {
        e.preventDefault();
        if (currentPage > 1) displayArticles(currentPage - 1, filteredNewsData);
    });
    paginationContainer.appendChild(prevItem);

    // Page Numbers
    for (let i = 1; i <= totalPages; i++) {
        const pageItem = document.createElement('li');
        pageItem.className = `page-item ${i === currentPage ? 'active' : ''}`;
        pageItem.innerHTML = `<a class="page-link" href="#">${i}</a>`;
        pageItem.addEventListener('click', (e) => {
            e.preventDefault();
            displayArticles(i, filteredNewsData);
        });
        paginationContainer.appendChild(pageItem);
    }

    // Next Button
    const nextItem = document.createElement('li');
    nextItem.className = `page-item ${currentPage === totalPages ? 'disabled' : ''}`;
    nextItem.innerHTML = `<a class="page-link" href="#" aria-label="Next">&raquo;</a>`;
    nextItem.addEventListener('click', (e) => {
        e.preventDefault();
        if (currentPage < totalPages) displayArticles(currentPage + 1, filteredNewsData);
    });
    paginationContainer.appendChild(nextItem);
}

// Update active pagination item
function updateActivePaginationItem(pageNumber) {
    const paginationItems = document.querySelectorAll('.pagination .page-item');
    paginationItems.forEach((item, index) => {
        if (index === 0 || index === paginationItems.length - 1) return; // Skip prev/next buttons
        
        if (index === pageNumber) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

// Filter articles based on selections
function applyFilters() {
    const selectedColleges = getSelectedColleges();
    const courseCodeFilter = courseCodeInput?.value.trim().replace(/\s+/g, '').toLowerCase() || '';

    filteredNewsData = globalNewsData.filter(article => {
        const collegeMatch = allCheckbox.checked || 
                          selectedColleges.length === 0 || 
                          selectedColleges.includes(article.college);
        
        const courseCodeMatch = !courseCodeFilter || 
                              (article.courseCode && 
                               article.courseCode.toLowerCase().replace(/\s+/g, '').includes(courseCodeFilter));
        
        return collegeMatch && courseCodeMatch;
    });

    displayArticles(1, filteredNewsData);
    updatePagination(filteredNewsData.length);
}

// Get selected colleges from checkboxes
function getSelectedColleges() {
    return Array.from(document.querySelectorAll('#collegeCollapse input[type="checkbox"]:checked'))
        .map(checkbox => checkbox.value.trim())
        .filter(val => val !== 'all');
}

// Handle search functionality
function handleSearch() {
    const query = searchInput.value.toLowerCase().replace(/\s+/g, '');
    
    filteredNewsData = query === '' 
        ? [...globalNewsData]
        : globalNewsData.filter(article => {
            const title = article.title.toLowerCase().replace(/\s+/g, '');
            const content = article.content?.toLowerCase().replace(/\s+/g, '') || '';
            return title.includes(query) || content.includes(query);
        });
    
    displayArticles(1, filteredNewsData);
    updatePagination(filteredNewsData.length);
}

// Handle sorting
function handleSort(event) {
    if (!event.target.classList.contains('dropdown-item')) return;
    
    const sortOption = event.target.textContent.trim();
    const sortedData = [...filteredNewsData];
    
    switch (sortOption) {
        case 'By Newest':
            sortedData.sort((a, b) => new Date(b.date) - new Date(a.date));
            break;
        case 'By Popular':
            sortedData.sort((a, b) => b.views - a.views);
            break;
        case 'By Colleges':
            sortedData.sort((a, b) => a.college.localeCompare(b.college));
            break;
        case 'By Course Code':
            sortedData.sort((a, b) => (a.courseCode || '').localeCompare(b.courseCode || ''));
            break;
    }
    
    filteredNewsData = sortedData;
    displayArticles(1, filteredNewsData);
}

// View article details
function viewArticle(articleId) {
    localStorage.setItem('selectedArticleId', articleId);
    window.location.href = 'ViewNews.html';
}

// Initialize event listeners
function setupEventListeners() {
    // College filters
    if (allCheckbox) {
        allCheckbox.addEventListener('change', () => {
            if (allCheckbox.checked) otherCheckboxes.forEach(cb => cb.checked = false);
            applyFilters();
        });
    }

    otherCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            if (checkbox.checked) allCheckbox.checked = false;
            applyFilters();
        });
    });

    // Course code filter
    if (courseCodeInput) {
        courseCodeInput.addEventListener('input', applyFilters);
    }

    // Search
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
    }

    // Sort
    if (sortDropdown) {
        sortDropdown.addEventListener('click', handleSort);
    }

    // Form submission
    if (document.getElementById('articleForm')) {
        document.getElementById('articleForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            const submitBtn = this.querySelector('button[type="submit"]');
            submitBtn.disabled = true; // Prevent double submit
            if (!validateForm()) {
                submitBtn.disabled = false;
                return;
            }
            const formData = new FormData(this);
            formData.append('content', document.getElementById('editorContent').value);
            try {
                const response = await fetch('https://7c52feb7-4a7c-440b-af78-47bb633d14a6-00-2v8szsbn47wab.sisko.replit.dev/addNews.php', {
                    method: 'POST',
                    body: formData
                });
                const result = await response.json();
                if (result.success === true) {
                    showModal('Article added successfully!', function() {
                        window.location.href = 'CampusNews.html';
                    });
                } else {
                    showModal('Error: ' + (result.message || 'Failed to add article'));
                }
            } catch (error) {
                showModal('An error occurred while adding the article');
            } finally {
                submitBtn.disabled = false;
            }
        });
    }
}

// Handle article form submission
async function handleArticleSubmission(e) {
    e.preventDefault();
    if (!validateForm()) return;
    const formData = new FormData(e.target);
    formData.append('content', document.getElementById('editorContent').value);
    try {
        const response = await fetch('https://7c52feb7-4a7c-440b-af78-47bb633d14a6-00-2v8szsbn47wab.sisko.replit.dev/addNews.php', {
            method: 'POST',
            body: formData
        });
        const result = await response.json();
        if (result.success) {
            showModal('Article added successfully!');
            await fetchNews();
            setTimeout(() => {
                window.location.href = 'CampusNews.html';
            }, 1200);
        } else {
            showModal('Error: ' + (result.message || 'Failed to add article'));
        }
    } catch (error) {
        showModal('An error occurred while adding the article');
    }
}

// Validate form
function validateForm() {
    const titleInput = document.querySelector('input[name="title"]');
    const collegeSelect = document.querySelector('select[name="college"]');
    const errorContainer = document.querySelector('#form-errors');
    
    errorContainer.innerHTML = '';
    let isValid = true;

    if (!titleInput.value.trim()) {
        errorContainer.innerHTML += '<p class="text-danger">Title is required.</p>';
        isValid = false;
    }

    if (!collegeSelect.value) {
        errorContainer.innerHTML += '<p class="text-danger">Please select a college.</p>';
        isValid = false;
    }

    return isValid;
}

// Initialize Froala Editor
function initializeFroalaEditor() {
    if (typeof FroalaEditor !== 'undefined' && document.getElementById('froala-editor')) {
        new FroalaEditor('#froala-editor', {
            events: {
                'contentChanged': function() {
                    document.getElementById('editorContent').value = this.html.get();
                }
            }
        });
    }
}

// Show modal for user feedback
function showModal(message, onClose) {
    const modalBody = document.getElementById('customModalBody');
    if (!modalBody) {
        alert(message);
        if (typeof onClose === 'function') onClose();
        return;
    }
    modalBody.textContent = message;
    const modalEl = document.getElementById('customModal');
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
    const closeBtn = document.getElementById('modalCloseBtn');
    closeBtn.onclick = null;
    closeBtn.onclick = () => {
        // Accessibility fix: blur the button and move focus before hiding
        closeBtn.blur();
        document.body.focus();
        modal.hide();
        if (typeof onClose === 'function') onClose();
    };
}

// Add this function to update the recent news cards
function updateRecentNewsCards(newsData) {
    const recentNewsContainer = document.getElementById('recent-news-cards');
    if (!recentNewsContainer) return;
    // Sort by date descending
    const sorted = [...newsData].sort((a, b) => new Date(b.date) - new Date(a.date));
    const latestThree = sorted.slice(0, 3);
    recentNewsContainer.innerHTML = '';
    latestThree.forEach(article => {
        const card = document.createElement('div');
        card.className = 'card';
        // Remove <p> tags from content if present
        let cleanContent = (article.content || '').replace(/<p>/gi, '').replace(/<\/p>/gi, '');
        cleanContent = cleanContent.replace(/<[^>]+>/g, ''); // Remove any other HTML tags
        // Use full URL for image
        let imgSrc = article.image ? baseUrl + article.image : baseUrl + 'Pic/default.jpg';
        card.innerHTML = `
            <img src="${imgSrc}" class="card-img-top" alt="..." onerror="this.onerror=null;this.src='${baseUrl}Pic/default.jpg';">
            <div class="card-body">
                <h5 class="card-title">${article.title}</h5>
                <p class="card-text">${cleanContent.substring(0, 80)}...</p>
                <p class="card-text"><small class="text-body-secondary">${article.date}</small></p>
                <a href="ViewNews.html" class="btn btn-outline-primary" onclick="localStorage.setItem('selectedArticleId', ${article.id})">Read More</a>
            </div>
        `;
        recentNewsContainer.appendChild(card);
    });
}

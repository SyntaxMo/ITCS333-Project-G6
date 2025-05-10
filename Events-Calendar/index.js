// DOM Elements
const loadingIndicator = document.getElementById('loadingIndicator');
const pageLoadingIndicator = document.getElementById('pageLoadingIndicator');
const searchInput = document.querySelector('.search-input');
const filterDropdown = document.querySelector('.filter-dropdown .dropdown-menu');
const sortDropdown = document.querySelector('.sort-dropdown .dropdown-menu');
const eventsContainer = document.getElementById('eventsContainer');
const paginationContainer = document.querySelector('.pagination');
const eventForm = document.getElementById('eventForm');
const errorContainer = document.getElementById('errorContainer');

// State Management
let events = [];
let currentPage = 1;
const eventsPerPage = 9;
let currentFilter = 'all';
let currentSort = 'newest';

// Helper functions
function showLoading() {
    loadingIndicator.classList.remove('d-none');
}

function hideLoading() {
    loadingIndicator.classList.add('d-none');
}

function showPageLoading() {
    if (pageLoadingIndicator) {
        pageLoadingIndicator.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }
}

function hidePageLoading() {
    if (pageLoadingIndicator) {
        pageLoadingIndicator.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

function showError(message) {
    errorContainer.innerHTML = `
        <div class="alert alert-danger alert-dismissible fade show" role="alert">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
}

function showSuccess(message) {
    errorContainer.innerHTML = `
        <div class="alert alert-success alert-dismissible fade show" role="alert">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
}

// Filter and sort events
async function applyFiltersAndSort() {
    showLoading();
    const searchTerm = searchInput.value.toLowerCase();
    
    try {
        console.log('Fetching from:', `${config.apiBaseUrl}?action=list&page=${currentPage}&limit=${eventsPerPage}&category=${currentFilter}&search=${searchTerm}&sort=${currentSort}`);
        
        const response = await fetch(`${config.apiBaseUrl}?action=list&page=${currentPage}&limit=${eventsPerPage}&category=${currentFilter}&search=${searchTerm}&sort=${currentSort}`);
        console.log('Response status:', response.status);
        
        const data = await response.json();
        console.log('Response data:', data);
        
        if (!response.ok) {
            throw new Error(data.error || 'Failed to fetch events');
        }
        
        events = data.events;
        updatePagination(data.total);
        displayEvents(events);
    } catch (error) {
        console.error('Error details:', error);
        showError(error.message);
    } finally {
        hideLoading();
    }
}

// Display events with pagination
function displayEvents(events) {
    eventsContainer.innerHTML = events.map(event => `
        <div class="col-md-4 mb-4">
            <div class="event-card">
                <img src="apiEC/${event.image_path}" alt="${event.title}" class="event-image">
                <div class="event-details p-3">
                    <h3 class="event-title">${event.title}</h3>
                    <p class="event-date">📅 ${new Date(event.event_date).toLocaleDateString()}</p>
                    <p class="event-location">📍 ${event.location}</p>
                    <div class="event-actions mt-3">
                        <button onclick="viewEventDetails(${event.id})" class="btn btn-outline-primary btn-sm btn-view">View Details</button>
                        <button onclick="registerForEvent(${event.id})" class="btn btn-primary btn-sm btn-register">Register</button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// Update pagination
function updatePagination(totalEvents) {
    const totalPages = Math.ceil(totalEvents / eventsPerPage);
    
    paginationContainer.innerHTML = totalPages <= 1 ? '' : `
        <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="changePage(${currentPage - 1})">&lt;</a>
        </li>
        ${Array.from({length: totalPages}, (_, i) => i + 1).map(page => `
            <li class="page-item ${page === currentPage ? 'active' : ''}">
                <a class="page-link" href="#" onclick="changePage(${page})">${page}</a>
            </li>
        `).join('')}
        <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="changePage(${currentPage + 1})">&gt;</a>
        </li>
    `;
}

// Form validation
function validateEventForm(formData) {
    const errors = [];
    const today = new Date();
    const eventDate = new Date(formData.get('event_date'));

    if (!formData.get('title') || !formData.get('title').trim()) {
        errors.push('Event title is required');
    }
    if (!formData.get('event_date')) {
        errors.push('Event date is required');
    } else if (eventDate < today) {
        errors.push('Event date cannot be in the past');
    }
    if (!formData.get('location') || !formData.get('location').trim()) {
        errors.push('Event location is required');
    }
    if (!formData.get('description') || !formData.get('description').trim()) {
        errors.push('Event description is required');
    }
    if (!formData.get('category')) {
        errors.push('Event category is required');
    }

    return errors;
}

// Event Handlers
searchInput.addEventListener('input', () => {
    currentPage = 1;
    applyFiltersAndSort();
});

filterDropdown.addEventListener('click', (e) => {
    if (e.target.classList.contains('dropdown-item')) {
        const selectedCategory = e.target.textContent.trim();
        currentFilter = selectedCategory === 'All' ? 'all' : selectedCategory;
        currentPage = 1;
        applyFiltersAndSort();
    }
});

sortDropdown.addEventListener('click', (e) => {
    if (e.target.classList.contains('dropdown-item')) {
        currentSort = e.target.textContent.toLowerCase();
        currentPage = 1;
        applyFiltersAndSort();
    }
});

// Event form handler
eventForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(eventForm);
    const errors = validateEventForm(formData);
    
    if (errors.length > 0) {
        showError(errors.join('<br>'));
        return;
    }

    showLoading();
    try {
        const response = await fetch(`${config.apiBaseUrl}?action=create`, {
            method: 'POST',
            body: formData
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'Failed to create event');
        }

        // Reset form and update display
        eventForm.reset();
        bootstrap.Collapse.getInstance(document.getElementById('addItemForm')).hide();
        currentPage = 1;
        currentSort = 'newest';
        await applyFiltersAndSort();
        showSuccess('Event added successfully!');
    } catch (error) {
        console.error('Error:', error);
        showError(error.message);
    } finally {
        hideLoading();
    }
});

function changePage(page) {
    if (page < 1) return;
    currentPage = page;
    applyFiltersAndSort();
}

function viewEventDetails(eventId) {
    window.location.href = `view.php?id=${eventId}`;
}

async function registerForEvent(eventId) {
    try {
        // Fetch the event to get current popularity
        const eventRes = await fetch(`${config.apiBaseUrl}?action=get&id=${eventId}`);
        const eventData = await eventRes.json();
        let newPopularity = (eventData.popularity || 0) + 1;
        const response = await fetch(`${config.apiBaseUrl}?action=update`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `id=${eventId}&popularity=${newPopularity}`
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || 'Failed to register for event');
        }
        showSuccess(`Successfully registered for ${data.title}!`);
        if (currentSort === 'popular') {
            await applyFiltersAndSort();
        }
    } catch (error) {
        console.error('Error:', error);
        showError(error.message);
    }
}

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    showPageLoading();
    applyFiltersAndSort();
});
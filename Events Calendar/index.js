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

// Mock data for events
const mockEvents = Array.from({ length: 20 }, (_, i) => ({
    id: i + 1,
    title: `Event ${i + 1}`,
    date: new Date(2025, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
    location: `Room ${(i + 1) * 100}, Building ${Math.floor(i / 5) + 1}`,
    description: `This is a sample description for Event ${i + 1}. It contains details about what will happen at the event.`,
    category: ['Workshop', 'Competition', 'Talk', 'Meetup', 'Social'][Math.floor(Math.random() * 5)],
    image: 'Pics/imaa.jpeg',
    popularity: Math.floor(Math.random() * 100),
    comments: [],
    addedAt: Date.now() - (i * 1000)
}));

// Filter and sort events
function applyFiltersAndSort() {
    const searchTerm = searchInput.value.toLowerCase();
    
    let filteredEvents = events.filter(event => {
        const matchesSearch = event.title.toLowerCase().includes(searchTerm) ||
                            event.description.toLowerCase().includes(searchTerm);
        const matchesCategory = currentFilter === 'all' || 
                              event.category === currentFilter;
        return matchesSearch && matchesCategory;
    });

    // Sort events
    filteredEvents.sort((a, b) => {
        switch (currentSort) {
            case 'newest':
                // Sort by addedAt timestamp
                const aTime = a.addedAt || 0;
                const bTime = b.addedAt || 0;
                return bTime - aTime;
            case 'popular':
                return b.popularity - a.popularity;
            default:
                // Default to newest
                const aDefault = a.addedAt || 0;
                const bDefault = b.addedAt || 0;
                return bDefault - aDefault;
        }
    });

    updatePagination(filteredEvents.length);
    displayEvents(filteredEvents);
}

// Display events with pagination
function displayEvents(filteredEvents) {
    const startIndex = (currentPage - 1) * eventsPerPage;
    const endIndex = startIndex + eventsPerPage;
    const currentEvents = filteredEvents.slice(startIndex, endIndex);

    eventsContainer.innerHTML = currentEvents.map(event => `
        <div class="col-md-4 mb-4">
            <div class="event-card">
                <img src="${event.image}" alt="${event.title}" class="event-image">
                <div class="event-details p-3">
                    <h3 class="event-title">${event.title}</h3>
                    <p class="event-date">📅 ${new Date(event.date).toLocaleDateString()}</p>
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
    const eventDate = new Date(formData.get('eventDate'));

    if (!formData.get('eventName').trim()) {
        errors.push('Event title is required');
    }
    if (!formData.get('eventDate')) {
        errors.push('Event date is required');
    } else if (eventDate < today) {
        errors.push('Event date cannot be in the past');
    }
    if (!formData.get('eventLocation').trim()) {
        errors.push('Event location is required');
    }
    if (!formData.get('eventDescription').trim()) {
        errors.push('Event description is required');
    }
    if (!formData.get('eventCategory')) {
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

    // Handle image file
    const imageFile = document.getElementById('eventImage').files[0];
    let imageData = 'Pics/imaa.jpeg'; // Default fallback image

    if (imageFile) {
        try {
            // Convert image to base64
            const reader = new FileReader();
            imageData = await new Promise((resolve, reject) => {
                reader.onload = () => resolve(reader.result);
                reader.onerror = () => reject(reader.error);
                reader.readAsDataURL(imageFile);
            });
        } catch (error) {
            console.error('Error processing image:', error);
            showError('Failed to process image. Please try again.');
            return;
        }
    }

    // Create new event
    const newEvent = {
        id: Date.now(),
        title: formData.get('eventName'),
        date: new Date(formData.get('eventDate')),
        location: formData.get('eventLocation'),
        description: formData.get('eventDescription'),
        category: formData.get('eventCategory'),
        image: imageData,
        popularity: 0,
        comments: [],
        addedAt: Date.now()
    };

    // Add to events array and update storage
    events.unshift(newEvent);
    sessionStorage.setItem('events', JSON.stringify(events));
    
    // Reset form and update display
    eventForm.reset();
    bootstrap.Collapse.getInstance(document.getElementById('addItemForm')).hide();
    currentPage = 1;
    currentSort = 'newest'; // Force newest sort after adding
    applyFiltersAndSort();
    showSuccess('Event added successfully!');
});

// Helper functions
function showLoading() {
    loadingIndicator.classList.remove('d-none');
}

function hideLoading() {
    loadingIndicator.classList.add('d-none');
}

function showPageLoading() {
    pageLoadingIndicator.style.display = 'flex';
    document.body.style.overflow = 'hidden'; // Prevent scrolling while loading
}

function hidePageLoading() {
    pageLoadingIndicator.style.display = 'none';
    document.body.style.overflow = 'auto'; // Restore scrolling
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

function changePage(page) {
    if (page < 1 || page > Math.ceil(events.length / eventsPerPage)) return;
    currentPage = page;
    applyFiltersAndSort();
}

function viewEventDetails(eventId) {
    window.location.href = `view.html?id=${eventId}`;
}

function registerForEvent(eventId) {
    const event = events.find(e => e.id === eventId);
    if (event) {
        event.popularity++;
        sessionStorage.setItem('events', JSON.stringify(events));
        showSuccess(`Successfully registered for ${event.title}!`);
        // If currently sorted by popularity, refresh the display
        if (currentSort === 'popular') {
            applyFiltersAndSort();
        }
    }
}

// Fetch events from API (simulated)
async function fetchEvents() {
    showPageLoading();
    try {
        
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Try to get events from session storage
        const storedEvents = sessionStorage.getItem('events');
        if (storedEvents) {
            events = JSON.parse(storedEvents).map(event => ({
                ...event,
                date: new Date(event.date),
                addedAt: event.addedAt || Date.now() - Math.random() * 1000000
            }));
        } else {
            events = mockEvents;
            sessionStorage.setItem('events', JSON.stringify(events));
        }
        applyFiltersAndSort();
    } catch (error) {
        console.error('Error loading events:', error);
        events = mockEvents;
        applyFiltersAndSort();
        showError('An error occurred while loading events. Please try again.');
    } finally {
        hidePageLoading();
    }
}

// Clear session storage when the page loads (for testing)
sessionStorage.removeItem('events');

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    showPageLoading(); // Show loading indicator immediately
    fetchEvents();
});
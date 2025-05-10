// Get API base URL from config
const API_BASE_URL = API_CONFIG.BASE_URL;

// Initialize global variables
let items = [];
let filteredItems = [];
const itemsPerPage = 6; // Changed from 12 to 6
let currentPage = 1;
let currentSort = 'newest';
let currentCategory = 'all';
let currentPriceRange = 'all';
let currentSearchTerm = '';

// Save state to localStorage and URL
function saveState() {
    const state = {
        page: currentPage,
        sort: currentSort,
        category: currentCategory,
        priceRange: currentPriceRange,
        searchTerm: currentSearchTerm
    };
    
    // Save to localStorage
    localStorage.setItem('marketplaceState', JSON.stringify(state));
    
    // Update URL parameters without overwriting other parameters
    const params = new URLSearchParams(window.location.search);
    Object.entries(state).forEach(([key, value]) => {
        if (value && value !== 'all' && !(key === 'page' && value === 1) && value !== '') {
            params.set(key, value);
        } else {
            params.delete(key);
        }
    });
    
    // Update URL without reloading the page
    const newUrl = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
    window.history.pushState({ path: newUrl }, '', newUrl);
}

// Load state from localStorage and URL
function loadState() {
    // First try URL parameters
    const params = new URLSearchParams(window.location.search);
    
    // Then try localStorage
    const savedState = JSON.parse(localStorage.getItem('marketplaceState') || '{}');
    
    // URL parameters take precedence over localStorage
    currentPage = parseInt(params.get('page')) || savedState.page || 1;
    currentSort = params.get('sort') || savedState.sort || 'newest';
    currentCategory = params.get('category') || savedState.category || 'all';
    currentPriceRange = params.get('priceRange') || savedState.priceRange || 'all';
    currentSearchTerm = params.get('searchTerm') || savedState.searchTerm || '';
    
    // Apply the loaded state to UI elements
    const searchInput = document.getElementById('search-input');
    if (searchInput && currentSearchTerm) {
        searchInput.value = currentSearchTerm;
    }
    
    // Update active states in dropdowns
    updateActiveStates();
}

function updateActiveStates() {
    // Update category active states
    document.querySelectorAll('[data-category]').forEach(item => {
        item.classList.toggle('active', item.dataset.category === currentCategory);
    });
    
    // Update price range active states
    document.querySelectorAll('[data-price-range]').forEach(item => {
        item.classList.toggle('active', item.dataset.priceRange === currentPriceRange);
    });
    
    // Update sort active states
    document.querySelectorAll('[data-sort]').forEach(item => {
        item.classList.toggle('active', item.dataset.sort === currentSort);
    });
}

// Add popstate event listener to handle browser back/forward buttons
window.addEventListener('popstate', (event) => {
    loadState();
    applyFiltersAndDisplay();
});

document.addEventListener('DOMContentLoaded', () => {
    loadState();
    fetchItems();
    setupEventListeners();
});

function setupEventListeners() {
    // Add event listener for the submit button
    document.getElementById('submitItemButton')?.addEventListener('click', handleItemSubmission);
    
    // Search input
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            currentSearchTerm = searchInput.value;
            applyFiltersAndDisplay();
            saveState();
        });
    }

    // Category filters
    document.querySelectorAll('[data-category]').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelectorAll('[data-category]').forEach(el => el.classList.remove('active'));
            item.classList.add('active');
            currentCategory = item.dataset.category;
            applyFiltersAndDisplay();
            saveState();
        });
    });

    // Price range filters
    document.querySelectorAll('[data-price-range]').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelectorAll('[data-price-range]').forEach(el => el.classList.remove('active'));
            item.classList.add('active');
            currentPriceRange = item.dataset.priceRange;
            applyFiltersAndDisplay();
            saveState();
        });
    });

    // Sort options
    document.querySelectorAll('[data-sort]').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            document.querySelectorAll('[data-sort]').forEach(el => el.classList.remove('active'));
            item.classList.add('active');
            currentSort = item.dataset.sort;
            applyFiltersAndDisplay();
            saveState();
        });
    });
}

async function handleItemSubmission() {
    const form = document.getElementById('addNewItemForm');
    const submitButton = document.getElementById('submitItemButton');
    
    // Get form values using the correct field names from the form
    const formData = {
        name: document.getElementById('itemName').value,
        description: document.getElementById('itemDescription').value,
        price: parseFloat(document.getElementById('itemPrice').value),
        category_id: parseInt(document.getElementById('itemCategory').value),
    };

    // Validate form
    if (!formData.name || !formData.description || !formData.price || !formData.category_id) {
        alert('Please fill in all fields');
        return;
    }

    const imageFile = document.getElementById('itemImage').files[0];
    if (!imageFile) {
        alert('Please select an image');
        return;
    }

    // Store current page before submission
    const previousPage = currentPage;

    // Disable submit button while processing
    submitButton.disabled = true;
    submitButton.textContent = 'Submitting...';

    try {
        // Convert image to base64
        const base64Image = await convertImageToBase64(imageFile);
        formData.image = base64Image;

        // Send the request with the correct endpoint
        const response = await fetch(`${API_BASE_URL}?action=create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (result.success) {
            alert('Item added successfully!');
            form.reset();
            // Collapse the form
            bootstrap.Collapse.getInstance(document.getElementById('addItemForm')).hide();
            
            // Restore the previous page number
            currentPage = previousPage;
            
            // Refresh the items list while preserving the page
            await fetchItems();
        } else {
            throw new Error(result.message || 'Failed to add item');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred while adding the item: ' + error.message);
    } finally {
        // Re-enable submit button
        submitButton.disabled = false;
        submitButton.textContent = 'Submit Item';
    }
}

function convertImageToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result.split(',')[1]); // Remove data:image/xxx;base64, prefix
        reader.onerror = error => reject(error);
    });
}

function updateFilterDropdownText() {
    const filterDropdown = document.getElementById('filterDropdown');
    if (filterDropdown) {
        filterDropdown.textContent = currentCategory === 'all' ? 'Filter' : 
            document.querySelector(`[data-category="${currentCategory}"]`).textContent;
        filterDropdown.classList.toggle('has-filter', currentCategory !== 'all');
    }
}

function updateSortDropdownText(text) {
    const sortDropdown = document.getElementById('sort-filter');
    if (sortDropdown) {
        sortDropdown.textContent = text;
        sortDropdown.classList.add('has-sort');
    }
}

function toggleLoading(show) {
    const spinner = document.getElementById('loadingSpinner');
    if (spinner) {
        spinner.classList.toggle('d-none', !show);
    }
}

async function fetchItems() {
    const loadingSpinner = document.getElementById('loadingSpinner');
    loadingSpinner.classList.remove('d-none');
    
    try {
        // Remove /read.php from URL and use query parameter instead
        const response = await fetch(`${API_BASE_URL}?action=read`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
        if (data.success && data.data) {
            items = data.data;
            applyFiltersAndDisplay();
        } else {
            throw new Error(data.message || 'Failed to fetch items');
        }
    } catch (error) {
        console.error('Error fetching items:', error);
        showError('Error loading items');
    } finally {
        loadingSpinner.classList.add('d-none');
    }
}

function createItemCard(item) {
    const col = document.createElement('div');
    col.className = 'col-md-4 mb-4';
    
    // Create image URL properly
    const imageUrl = item.image_path || 'images/dumbCar.jpg';
    
    col.innerHTML = `
        <div class="card h-100">
            <div class="position-relative">
                <img src="${imageUrl}" 
                     class="card-img-top" 
                     alt="${item.name}"
                     onerror="this.onerror=null; this.src='images/dumbCar.jpg';"
                     style="height: 200px; object-fit: cover;">
                <span class="position-absolute top-0 end-0 m-2 badge ${getCategoryColorClass(getCategoryName(item.category_id))}">
                    ${getCategoryName(item.category_id)}
                </span>
            </div>
            <div class="card-body">
                <h5 class="card-title">${item.name}</h5>
                <p class="card-text">${item.description}</p>
                <p class="card-text"><strong>Price: ${item.price} BHD</strong></p>
                <a href="itemPage.php?id=${item.id}" class="btn btn-primary">View Details</a>
            </div>
        </div>
    `;
    
    return col;
}

function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'alert alert-danger alert-dismissible fade show';
    errorDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.querySelector('main').insertBefore(errorDiv, document.querySelector('section'));
    setTimeout(() => errorDiv.remove(), 5000);
}

function applyFiltersAndDisplay() {
    // Store current filter state before applying new filters
    const oldFilterState = {
        searchTerm: currentSearchTerm,
        category: currentCategory,
        priceRange: currentPriceRange,
        sort: currentSort
    };
    
    filteredItems = [...items];
    
    // Apply search filter
    if (currentSearchTerm) {
        filteredItems = filteredItems.filter(item => 
            item.name.toLowerCase().includes(currentSearchTerm.toLowerCase()) ||
            item.description.toLowerCase().includes(currentSearchTerm.toLowerCase())
        );
    }

    // Apply category filter
    if (currentCategory !== 'all') {
        filteredItems = filteredItems.filter(item => 
            item.category_id === getCategoryId(currentCategory)
        );
    }

    // Apply price range filter
    if (currentPriceRange !== 'all') {
        if (currentPriceRange === '500+') {
            filteredItems = filteredItems.filter(item => parseFloat(item.price) >= 500);
        } else {
            const [min, max] = currentPriceRange.split('-').map(Number);
            filteredItems = filteredItems.filter(item => {
                const price = parseFloat(item.price);
                return price >= min && price <= max;
            });
        }
    }

    // Apply sorting
    switch (currentSort) {
        case 'price-low-high':
            filteredItems.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
            break;
        case 'price-high-low':
            filteredItems.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
            break;
        case 'newest':
            filteredItems.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            break;
    }

    // Only reset page if filters have changed
    const newFilterState = {
        searchTerm: currentSearchTerm,
        category: currentCategory,
        priceRange: currentPriceRange,
        sort: currentSort
    };
    
    if (JSON.stringify(oldFilterState) !== JSON.stringify(newFilterState)) {
        currentPage = 1;
    }

    displayItems(filteredItems);
    saveState();
}

function displayItems(items) {
    const container = document.querySelector('.row');
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const itemsToShow = items.slice(startIndex, endIndex);

    if (items.length === 0) {
        container.innerHTML = '<p class="text-center w-100">No items found matching your criteria.</p>';
        updatePagination(0);
        return;
    }

    container.innerHTML = itemsToShow.map(item => `
        <div class="col-md-4 mb-4">
            <div class="card h-100">
                <div class="position-relative">
                    <img src="${item.image_path.startsWith('uploads/') ? item.image_path : 'uploads/' + item.image_path}" 
                         class="card-img-top" 
                         alt="${item.name}"
                         onerror="this.onerror=null; this.src='images/dumbCar.jpg';"
                         style="height: 300px; object-fit: cover;">
                    <span class="position-absolute top-0 end-0 m-2 badge ${getCategoryColorClass(getCategoryName(item.category_id))}">
                        ${getCategoryName(item.category_id)}
                    </span>
                </div>
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title">${item.name}</h5>
                    <p class="card-text flex-grow-1">${item.description ? item.description.substring(0, 100) : ''}${item.description && item.description.length > 100 ? '...' : ''}</p>
                    <div class="mt-auto">
                        <p class="price mb-3">${item.price} BHD</p>
                        <a href="itemPage.php?id=${item.id}" class="btn btn-primary w-100">View Details</a>
                    </div>
                </div>
            </div>
        </div>
    `).join('');

    updatePagination(items.length);
}

function updatePagination(totalItems) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const pagination = document.querySelector('.pagination');
    if (!pagination) return;

    let paginationHtml = '';
    
    // Previous button
    paginationHtml += `
        <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" data-page="${currentPage - 1}">Previous</a>
        </li>
    `;

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        // Always show first page, last page, and pages around current page
        if (
            i === 1 || // First page
            i === totalPages || // Last page
            (i >= currentPage - 1 && i <= currentPage + 1) // Pages around current page
        ) {
            paginationHtml += `
                <li class="page-item ${i === currentPage ? 'active' : ''}">
                    <a class="page-link" href="#" data-page="${i}">${i}</a>
                </li>
            `;
        } else if (i === currentPage - 2 || i === currentPage + 2) {
            paginationHtml += '<li class="page-item disabled"><span class="page-link">...</span></li>';
        }
    }

    // Next button
    paginationHtml += `
        <li class="page-item ${currentPage === totalPages || totalPages === 0 ? 'disabled' : ''}">
            <a class="page-link" href="#" data-page="${currentPage + 1}">Next</a>
        </li>
    `;

    pagination.innerHTML = paginationHtml;

    // Add click handlers for pagination with state persistence
    pagination.querySelectorAll('.page-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const newPage = parseInt(link.dataset.page);
            if (!isNaN(newPage) && newPage !== currentPage && newPage > 0 && newPage <= totalPages) {
                currentPage = newPage;
                displayItems(filteredItems); // Use filteredItems to maintain filters
                saveState();
                window.scrollTo(0, 0); // Scroll to top when changing pages
            }
        });
    });
}

// Helper functions for categories
function getCategoryName(categoryId) {
    const categories = {
        1: 'Books',
        2: 'Electronics',
        3: 'Clothing',
        4: 'Furniture',
        5: 'Accessories',
        6: 'Sports Equipment',
        7: 'Others'
    };
    return categories[categoryId] || 'Unknown';
}

function getCategoryId(categoryName) {
    const categories = {
        'Books': 1,
        'Electronics': 2,
        'Clothing': 3,
        'Furniture': 4,
        'Accessories': 5,
        'Sports Equipment': 6,
        'Others': 7
    };
    return categories[categoryName];
}

function getCategoryColorClass(category) {
    const colorMap = {
        'Books': 'bg-info',
        'Electronics': 'bg-warning',
        'Clothing': 'bg-success',
        'Furniture': 'bg-secondary',
        'Accessories': 'bg-primary',
        'Sports Equipment': 'bg-danger',
        'Others': 'bg-dark'
    };
    return colorMap[category] || 'bg-dark';
}

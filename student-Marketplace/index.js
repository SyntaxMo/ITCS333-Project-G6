// Mock API URL (replace with your actual API or JSON file URL)
const apiUrl = "https://jsonplaceholder.typicode.com/posts";

document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const itemsContainer = document.querySelector(".row");
    const searchInput = document.querySelector('input[type="search"]');
    const paginationContainer = document.querySelector(".pagination");
    const filterButton = document.querySelector('#filterDropdown');
    const sortButton = document.querySelector('[data-bs-toggle="dropdown"]:not(#filterDropdown)');

    // State Variables
    let items = [];
    let filteredItems = [];
    let currentPage = 1;
    const itemsPerPage = 6;
    let currentCategory = 'all';
    let currentPriceRange = 'all';
    let currentSort = 'Newest';

    // Load saved items
    loadItems();

    // Initialize display
    renderItems();
    renderPagination();

    function loadItems() {
        try {
            const savedItems = localStorage.getItem('marketplaceItems');
            if (savedItems) {
                items = JSON.parse(savedItems);
                filteredItems = [...items];
            }
        } catch (err) {
            console.error('Error loading items:', err);
            items = [];
            filteredItems = [];
        }
    }

    // Filter by Category and Price Range
    const filterDropdown = document.querySelector('.dropdown-menu[aria-labelledby="filterDropdown"]');
    if (filterDropdown) {
        filterDropdown.addEventListener('click', (e) => {
            if (!e.target.classList.contains('dropdown-item')) return;
            e.preventDefault();
            
            const isCategory = !!e.target.dataset.category;
            const siblings = e.target.parentElement.parentElement.querySelectorAll('.dropdown-item');
            siblings.forEach(item => {
                if ((isCategory && item.dataset.category) || (!isCategory && item.dataset.priceRange)) {
                    item.classList.remove('active');
                }
            });

            e.target.classList.add('active');

            if (e.target.dataset.category) {
                currentCategory = e.target.dataset.category;
                filterButton.textContent = currentCategory === 'all' ? 'Filter' : `Category: ${e.target.textContent}`;
            } else if (e.target.dataset.priceRange) {
                currentPriceRange = e.target.dataset.priceRange;
            }
            
            applyFilters();
        });
    }

    // Sort Functionality
    const sortDropdown = document.querySelector('.dropdown-menu[aria-labelledby="sortDropdown"]');
    if (sortDropdown) {
        sortDropdown.addEventListener('click', (e) => {
            if (!e.target.classList.contains('dropdown-item')) return;
            e.preventDefault();
            
            sortDropdown.querySelectorAll('.dropdown-item').forEach(item => item.classList.remove('active'));
            e.target.classList.add('active');
            
            currentSort = e.target.textContent;
            sortButton.textContent = `Sort: ${currentSort}`;
            
            applySorting();
            renderItems();
        });
    }

    function applyFilters() {
        filteredItems = [...items];
        
        if (currentCategory !== 'all') {
            filteredItems = filteredItems.filter(item => item.category === currentCategory);
        }

        if (currentPriceRange !== 'all') {
            filteredItems = filteredItems.filter(item => {
                const price = parseFloat(item.price);
                switch (currentPriceRange) {
                    case '0-50': return price <= 50;
                    case '50-100': return price > 50 && price <= 100;
                    case '100-200': return price > 100 && price <= 200;
                    case '200-500': return price > 200 && price <= 500;
                    case '500+': return price > 500;
                    default: return true;
                }
            });
        }

        currentPage = 1;
        applySorting();
        renderItems();
        renderPagination();
    }

    function applySorting() {
        const priceExtractor = price => parseFloat(price.replace(' BHD', ''));
        
        switch (currentSort) {
            case 'Price Low-High':
                filteredItems.sort((a, b) => priceExtractor(a.price) - priceExtractor(b.price));
                break;
            case 'Price High-Low':
                filteredItems.sort((a, b) => priceExtractor(b.price) - priceExtractor(a.price));
                break;
            case 'Newest':
                filteredItems.sort((a, b) => b.id - a.id);
                break;
        }
    }

    // Render Items Function
    function renderItems() {
        if (!itemsContainer) return;
        
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const itemsToRender = filteredItems.slice(start, end);

        itemsContainer.innerHTML = itemsToRender.length === 0 
            ? '<div class="col-12 text-center"><p>No items found</p></div>'
            : itemsToRender.map(item => `
                <article class="col-md-4 mb-4">
                    <div class="card">
                        <img src="${item.imageData || item.image}" class="card-img-top" alt="${item.title}">
                        <div class="card-body">
                            <h5 class="card-title">${item.title}</h5>
                            <p class="card-text"><strong>Price:</strong> ${item.price}</p>
                            <p class="card-text"><strong>Description:</strong> ${item.description}</p>
                            <a href="itemPage.html?id=${item.id}"><button class="btn btn-success w-100">View</button></a>
                        </div>
                    </div>
                </article>
            `).join('');
    }

    // Render Pagination
    function renderPagination() {
        if (!paginationContainer) return;
        
        const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
        if (totalPages <= 1) {
            paginationContainer.innerHTML = '';
            return;
        }

        const pages = [];
        
        pages.push(`
            <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
                <a class="page-link" href="#" data-page="${currentPage - 1}">Previous</a>
            </li>
        `);

        for (let i = 1; i <= totalPages; i++) {
            pages.push(`
                <li class="page-item ${i === currentPage ? 'active' : ''}">
                    <a class="page-link" href="#" data-page="${i}">${i}</a>
                </li>
            `);
        }

        pages.push(`
            <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
                <a class="page-link" href="#" data-page="${currentPage + 1}">Next</a>
            </li>
        `);

        paginationContainer.innerHTML = pages.join('');

        paginationContainer.querySelectorAll(".page-link").forEach(link => {
            link.addEventListener("click", (e) => {
                e.preventDefault();
                const newPage = parseInt(e.target.dataset.page);
                if (!isNaN(newPage) && newPage > 0 && newPage <= totalPages) {
                    currentPage = newPage;
                    renderItems();
                    renderPagination();
                }
            });
        });
    }

    // Search Functionality
    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            const query = e.target.value.toLowerCase();
            filteredItems = items.filter(item => 
                item.title.toLowerCase().includes(query) ||
                item.description.toLowerCase().includes(query)
            );
            currentPage = 1;
            renderItems();
            renderPagination();
        });
    }

    // Handle image upload with compression
    async function handleImageUpload(file) {
        return new Promise((resolve, reject) => {
            if (!file) {
                reject(new Error('No file selected'));
                return;
            }

            if (!file.type.startsWith('image/')) {
                reject(new Error('Please select an image file'));
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;
                    
                    // Calculate new dimensions - max 800px width/height
                    const maxSize = 800;
                    if (width > height && width > maxSize) {
                        height *= maxSize / width;
                        width = maxSize;
                    } else if (height > maxSize) {
                        width *= maxSize / height;
                        height = maxSize;
                    }

                    canvas.width = width;
                    canvas.height = height;
                    
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    
                    // Convert to JPEG with reduced quality
                    const compressedImage = canvas.toDataURL('image/jpeg', 0.6);
                    
                    // Check if adding this image would exceed storage
                    checkStorageLimit(compressedImage.length).then(() => {
                        resolve(compressedImage);
                    }).catch(reject);
                };
                img.onerror = () => reject(new Error('Failed to process image'));
                img.src = e.target.result;
            };
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsDataURL(file);
        });
    }

    // Check if we have enough storage space
    async function checkStorageLimit(newDataSize) {
        return new Promise((resolve, reject) => {
            try {
                // Get current storage usage
                const currentItems = localStorage.getItem('marketplaceItems');
                const currentSize = currentItems ? currentItems.length : 0;
                
                // Estimate new size
                const estimatedNewSize = currentSize + newDataSize;
                
                // Try to store a test string to check if we have space
                const testString = 'x'.repeat(newDataSize);
                localStorage.setItem('__test', testString);
                localStorage.removeItem('__test');
                
                resolve();
            } catch (e) {
                // If we get here, we're out of space
                reject(new Error('Not enough storage space. Try using a smaller image or removing some items.'));
            }
        });
    }

    // Add function to clear old items if needed
    function clearOldItems() {
        try {
            const savedItems = localStorage.getItem('marketplaceItems');
            if (savedItems) {
                const parsed = JSON.parse(savedItems);
                // Keep only the 20 most recent items
                const reduced = parsed.slice(0, 20);
                localStorage.setItem('marketplaceItems', JSON.stringify(reduced));
                return true;
            }
        } catch (e) {
            console.error('Error clearing old items:', e);
        }
        return false;
    }

    // Add Item Form Handler
    const addItemForm = document.querySelector("#addNewItemForm");
    if (addItemForm) {
        addItemForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            
            try {
                // Show loading state
                const submitButton = addItemForm.querySelector('button[type="submit"]');
                submitButton.disabled = true;
                submitButton.textContent = 'Adding...';

                const formData = new FormData(addItemForm);
                
                // Validate form data
                const itemName = formData.get("itemName");
                const description = formData.get("itemDescription");
                const category = formData.get("itemCategory");
                const price = formData.get("itemPrice");
                const imageFile = formData.get("itemImage");

                if (!itemName || !description || !category || !price || !imageFile) {
                    throw new Error('Please fill in all required fields');
                }

                // Process image
                let imageData;
                try {
                    imageData = await handleImageUpload(imageFile);
                } catch (error) {
                    if (error.message.includes('storage space')) {
                        // Try to clear some space first
                        if (clearOldItems()) {
                            // Try again after clearing space
                            imageData = await handleImageUpload(imageFile);
                        } else {
                            throw error;
                        }
                    } else {
                        throw error;
                    }
                }

                const newItem = {
                    id: Date.now(),
                    title: itemName,
                    description: description,
                    price: price + " BHD",
                    image: "images/loading.gif",
                    imageData: imageData,
                    category: category
                };

                // Add to arrays and save
                items.unshift(newItem);
                filteredItems = [...items];
                
                try {
                    localStorage.setItem('marketplaceItems', JSON.stringify(items));
                } catch (storageError) {
                    // Try to clear some space
                    if (clearOldItems()) {
                        localStorage.setItem('marketplaceItems', JSON.stringify(items));
                    } else {
                        throw new Error('Storage is full. Please delete some items first.');
                    }
                }
                
                // Reset filters and sort
                currentCategory = 'all';
                currentPriceRange = 'all';
                currentSort = 'Newest';
                currentPage = 1;
                
                // Update UI
                renderItems();
                renderPagination();
                
                // Reset form and hide
                const formSection = document.querySelector("#addItemForm");
                const bsCollapse = bootstrap.Collapse.getInstance(formSection);
                if (bsCollapse) {
                    bsCollapse.hide();
                }
                addItemForm.reset();
                
                alert("Item added successfully!");
                
            } catch (error) {
                console.error('Error adding item:', error);
                alert(error.message || "Error adding item. Please try again.");
            } finally {
                // Reset submit button
                const submitButton = addItemForm.querySelector('button[type="submit"]');
                submitButton.disabled = false;
                submitButton.textContent = 'Submit Item';
            }
        });
    }
});
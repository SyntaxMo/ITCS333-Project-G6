// Mock API URLs
const apiUrl = "https://jsonplaceholder.typicode.com/posts";
const imageApiUrl = "https://picsum.photos/300/200";

document.addEventListener('DOMContentLoaded', () => {
    const itemsContainer = document.querySelector(".row");
    const searchInput = document.querySelector('input[type="search"]');
    const paginationContainer = document.querySelector(".pagination");
    const filterButton = document.querySelector('#filterDropdown');
    const sortButton = document.querySelector('[data-bs-toggle="dropdown"]:not(#filterDropdown)');
    const loadingSpinner = document.querySelector('#loadingSpinner');

    // Function to show/hide loading spinner
    function toggleLoading(show) {
        if (loadingSpinner) {
            loadingSpinner.classList.toggle('d-none', !show);
            if (itemsContainer) {
                itemsContainer.style.opacity = show ? '0.5' : '1';
            }
        }
    }

    // State Variables
    let items = [];
    let filteredItems = [];
    let currentPage = 1;
    const itemsPerPage = 6;
    let currentCategory = 'all';
    let currentPriceRange = 'all';
    let currentSort = 'Newest';

    // Function to save filter/sort settings
    function saveSettings() {
        const settings = {
            category: currentCategory,
            priceRange: currentPriceRange,
            sort: currentSort,
            page: currentPage
        };
        localStorage.setItem('marketplaceSettings', JSON.stringify(settings));
    }

    // Function to restore filter/sort settings
    function restoreSettings() {
        const savedSettings = localStorage.getItem('marketplaceSettings');
        if (!savedSettings) return;

        const settings = JSON.parse(savedSettings);
        currentCategory = settings.category;
        currentPriceRange = settings.priceRange;
        currentSort = settings.sort;
        currentPage = settings.page || 1;

        // Restore category UI
        if (currentCategory !== 'all') {
            const categoryItem = filterDropdown.querySelector(`[data-category="${currentCategory}"]`);
            if (categoryItem) {
                categoryItem.classList.add('active');
                filterButton.textContent = `Category: ${categoryItem.textContent}`;
            }
        }

        // Restore price range UI
        if (currentPriceRange !== 'all') {
            const priceItem = filterDropdown.querySelector(`[data-price-range="${currentPriceRange}"]`);
            if (priceItem) {
                priceItem.classList.add('active');
            }
        }

        // Restore sort UI
        if (currentSort !== 'Newest') {
            const sortItems = sortDropdown.querySelectorAll('.dropdown-item');
            const sortItem = Array.from(sortItems).find(item => item.textContent === currentSort);
            if (sortItem) {
                sortItem.classList.add('active');
                sortButton.textContent = `Sort: ${currentSort}`;
            }
        }

        applyFilters();
    }

    async function loadItems() {
        toggleLoading(true);
        try {
            const savedItems = localStorage.getItem('marketplaceItems');
            let needsPlaceholders = true;
            
            if (savedItems) {
                items = JSON.parse(savedItems);
                needsPlaceholders = items.length < 5;
            }

            if (needsPlaceholders) {
                const response = await fetch(apiUrl);
                if (!response.ok) throw new Error('Failed to fetch items');
                const data = await response.json();
                
                const placeholderItems = data.slice(0, 10).map(post => ({
                    id: Date.now() + Math.random(),
                    title: post.title.slice(0, 30),
                    description: post.body,
                    price: Math.floor(Math.random() * 500) + " BHD",
                    image: `${imageApiUrl}?random=${Math.random()}`,
                    category: ["Books", "Electronics", "Clothing", "Furniture", "Accessories"][Math.floor(Math.random() * 5)],
                    imageData: null
                }));
                
                items = needsPlaceholders ? placeholderItems : [...items, ...placeholderItems];
                filteredItems = [...items];
                localStorage.setItem('marketplaceItems', JSON.stringify(items));
            }
            
            filteredItems = [...items];
        } catch (err) {
            console.error('Error loading items:', err);
            if (!items.length) {
                items = [{
                    id: Date.now(),
                    title: "Sample Item",
                    description: "This is a sample item.",
                    price: "100 BHD",
                    category: "Others",
                    image: "../images/marketplace.jpeg",
                    imageData: null
                }];
                filteredItems = [...items];
            }
        } finally {
            await new Promise(resolve => setTimeout(resolve, 100)); // Minimum loading time
            toggleLoading(false);
            renderItems();
            renderPagination();
        }
    }

    // Filter by Category and Price Range
    const filterDropdown = document.querySelector('.dropdown-menu[aria-labelledby="filterDropdown"]');
    if (filterDropdown) {
        filterDropdown.addEventListener('click', async (e) => {
            if (!e.target.classList.contains('dropdown-item')) return;
            e.preventDefault();
            
            toggleLoading(true);
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
            
            await new Promise(resolve => setTimeout(resolve, 300)); // Small delay for visual feedback
            applyFilters();
            saveSettings();
            toggleLoading(false);
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
            saveSettings();
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

        const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
        if (currentPage > totalPages) {
            currentPage = Math.max(1, totalPages);
        }
        
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
                        <img src="${item.imageData || item.image}" 
                             class="card-img-top" 
                             alt="${item.title}"
                             onerror="this.src='../images/marketplace.jpeg';">
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
                    saveSettings(); // Save settings when changing pages
                }
            });
        });
    }

    // Search Functionality
    if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener("input", (e) => {
            toggleLoading(true);
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                const query = e.target.value.toLowerCase();
                filteredItems = items.filter(item => 
                    item.title.toLowerCase().includes(query) ||
                    item.description.toLowerCase().includes(query)
                );
                currentPage = 1;
                renderItems();
                renderPagination();
                toggleLoading(false);
            }, 300);
        });
    }

    async function handleImageUpload(file) {
        if (!file || !file.type.startsWith('image/')) {
            throw new Error('Please select a valid image file');
        }

        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;
                    
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
                    resolve(canvas.toDataURL('image/jpeg', 0.6));
                };
                img.onerror = () => reject(new Error('Failed to process image'));
                img.src = e.target.result;
            };
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsDataURL(file);
        });
    }

    // Add Item Form Handler
    const addItemForm = document.querySelector("#addNewItemForm");
    if (addItemForm) {
        addItemForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const submitButton = addItemForm.querySelector('button[type="submit"]');
            submitButton.disabled = true;
            submitButton.textContent = 'Adding...';
            toggleLoading(true);

            try {
                const formData = new FormData(addItemForm);
                const newItem = {
                    id: Date.now(),
                    title: formData.get("itemName"),
                    description: formData.get("itemDescription"),
                    price: formData.get("itemPrice") + " BHD",
                    category: formData.get("itemCategory"),
                    image: "images/loading.gif",
                    imageData: await handleImageUpload(formData.get("itemImage"))
                };

                items.unshift(newItem);
                filteredItems = [...items];
                localStorage.setItem('marketplaceItems', JSON.stringify(items));
                
                renderItems();
                renderPagination();
                
                const formSection = document.querySelector("#addItemForm");
                const bsCollapse = bootstrap.Collapse.getInstance(formSection);
                if (bsCollapse) {
                    bsCollapse.hide();
                }
                addItemForm.reset();
                
                alert("Item added successfully!");
            } catch (error) {
                alert(error.message || "Error adding item. Please try again.");
            } finally {
                submitButton.disabled = false;
                submitButton.textContent = 'Submit Item';
                toggleLoading(false);
            }
        });
    }

    // Initialize
    loadItems().then(() => {
        restoreSettings();
    });
});
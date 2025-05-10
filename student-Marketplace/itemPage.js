const API_BASE_URL = API_CONFIG.BASE_URL;

// Get product ID from URL
const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get('id');

if (!productId) {
    window.location.href = 'StudentMarketplace.php';
}

document.addEventListener('DOMContentLoaded', () => {
    // Update the back button functionality
    const backButton = document.querySelector('a[href="StudentMarketplace.php"]');
    if (backButton) {
        backButton.addEventListener('click', function(e) {
            e.preventDefault();
            // Get the saved state from localStorage
            const savedState = JSON.parse(localStorage.getItem('marketplaceState') || '{}');
            
            // Build the URL with the saved state parameters
            const params = new URLSearchParams();
            if (savedState.page && savedState.page !== 1) params.set('page', savedState.page);
            if (savedState.sort && savedState.sort !== 'newest') params.set('sort', savedState.sort);
            if (savedState.category && savedState.category !== 'all') params.set('category', savedState.category);
            if (savedState.priceRange && savedState.priceRange !== 'all') params.set('priceRange', savedState.priceRange);
            if (savedState.searchTerm) params.set('searchTerm', savedState.searchTerm);
            
            // Redirect with the preserved state
            const queryString = params.toString();
            window.location.href = `StudentMarketplace.php${queryString ? '?' + queryString : ''}`;
        });
    }
    
    fetchProductDetails();
    setupEventListeners();
    loadComments();
});

function setupEventListeners() {
    // Try to get the edit form - don't throw error if not found yet
    const editForm = document.getElementById('editItemForm');
    if (editForm) {
        editForm.addEventListener('submit', handleEditSubmit);
    }
    
    // Try to get the comment form - don't throw error if not found yet
    const commentForm = document.querySelector('#commentForm form');
    if (commentForm) {
        commentForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await handleCommentSubmit(e);
        });
    }

    // Try to get the image input - don't throw error if not found yet
    const imageInput = document.getElementById('itemImageInput');
    if (imageInput) {
        imageInput.addEventListener('change', handleImagePreview);
    }
}

async function fetchProductDetails() {
    try {
        const response = await fetch(`${API_BASE_URL}?action=read&id=${productId}`);
        if (!response.ok) throw new Error('Failed to fetch product details');

        const result = await response.json();
        if (result.success && result.data) {
            displayProductDetails(result.data);
            populateEditForm(result.data);
        } else {
            throw new Error('Product not found');
        }
    } catch (error) {
        showError('Failed to load product details. Please try again later.');
    }
}

function displayProductDetails(product) {
    document.getElementById('itemName').textContent = product.name;
    document.getElementById('itemPrice').textContent = `${product.price} BHD`;
    document.getElementById('itemDescription').textContent = product.description;
    
    const itemImage = document.getElementById('itemImage');
    if (itemImage) {
        if (product.image_path) {
            // Fix image path construction
            const imagePath = product.image_path.startsWith('uploads/') ? product.image_path : 'uploads/' + product.image_path;
            itemImage.src = imagePath;
            itemImage.onerror = function() {
                this.onerror = null; // Remove the handler after first error
                this.src = 'images/dumbCar.jpg';
            };
        } else {
            itemImage.src = 'images/dumbCar.jpg';
        }
    }
}

function populateEditForm(product) {
    document.getElementById('itemNameInput').value = product.name;
    document.getElementById('itemPriceInput').value = product.price;
    document.getElementById('itemDescriptionInput').value = product.description;
    
    const editImage = document.getElementById('editItemImage');
    if (editImage) {
        if (product.image_path) {
            // Fix image path construction for edit preview
            const imagePath = product.image_path.startsWith('uploads/') ? product.image_path : 'uploads/' + product.image_path;
            editImage.src = imagePath;
            editImage.onerror = function() {
                this.onerror = null;
                this.src = 'images/dumbCar.jpg';
            };
        } else {
            editImage.src = 'images/dumbCar.jpg';
        }
    }
}

function toggleEditMode(show) {
    document.getElementById('item-details').style.display = show ? 'none' : 'flex';
    document.getElementById('edit-form').style.display = show ? 'flex' : 'none';
}

async function handleEditSubmit(e) {
    e.preventDefault();
    const form = e.target;
    
    try {
        const formData = {
            id: productId,
            name: form.elements.name.value,
            description: form.elements.description.value,
            price: parseFloat(form.elements.price.value)
        };

        // Handle image if one was selected
        const imageFile = form.elements.image?.files[0];
        if (imageFile) {
            const base64Image = await convertImageToBase64(imageFile);
            // Get only the base64 part after the comma
            formData.image = base64Image.split(',')[1];
        }

        const response = await fetch(`${API_BASE_URL}?action=update`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const result = await response.json();
        if (result.success) {
            showSuccess('Product updated successfully');
            // Refresh the product details to show new image
            await fetchProductDetails();
            toggleEditMode(false);
        } else {
            throw new Error(result.message || 'Failed to update product');
        }
    } catch (error) {
        showError(error.message);
    }
}

async function handleDelete() {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
        const response = await fetch(`${API_BASE_URL}?action=delete`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id: productId })
        });

        const result = await response.json();
        if (result.success) {
            window.location.href = 'StudentMarketplace.php';
        } else {
            throw new Error(result.message || 'Failed to delete product');
        }
    } catch (error) {
        showError(error.message);
    }
}

function handleImagePreview(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('editItemImage').src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
}

// Comments functionality
async function loadComments() {
    try {
        const response = await fetch(`${API_BASE_URL}?action=comment&product_id=${productId}`);
        if (!response.ok) throw new Error('Failed to fetch comments');

        const result = await response.json();
        if (result.success) {
            displayComments(result.data);
        }
    } catch (error) {
        showError('Failed to load comments');
    }
}

async function handleCommentSubmit(e) {
    e.preventDefault();
    const form = e.target;
    const commenterName = form.elements['commenter_name'].value.trim();
    const commentText = form.elements['comment_text'].value.trim();

    if (!commenterName || !commentText) {
        showError('Please fill in both name and comment fields');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}?action=comment`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                product_id: productId,
                commenter_name: commenterName,
                comment_text: commentText
            })
        });

        const result = await response.json();
        
        if (result.success) {
            form.reset();
            showSuccess('Comment added successfully');
            await loadComments(); // This will refresh the comments list
            bootstrap.Collapse.getInstance(document.getElementById('commentForm')).hide();
        } else {
            throw new Error(result.message || 'Failed to add comment');
        }
    } catch (error) {
        console.error('Comment error:', error);
        showError(error.message || 'Failed to add comment. Please try again.');
    }
}

function displayComments(comments) {
    const container = document.querySelector('.comments-container');
    if (!comments || comments.length === 0) {
        container.innerHTML = '<p class="text-muted">No comments yet. Be the first to comment!</p>';
        return;
    }

    container.innerHTML = comments.map(comment => `
        <div class="card mb-3">
            <div class="card-body">
                <h5 class="card-title">${escapeHtml(comment.name)}</h5>
                <p class="card-text text-break">${escapeHtml(comment.comment_text)}</p>
                <small class="text-muted">Posted on ${new Date(comment.created_at).toLocaleString()}</small>
            </div>
        </div>
    `).join('');
}

// Utility functions
function showError(message) {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-danger alert-dismissible fade show';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.querySelector('main').insertBefore(alertDiv, document.querySelector('section'));
    setTimeout(() => alertDiv.remove(), 5000);
}

function showSuccess(message) {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-success alert-dismissible fade show';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    document.querySelector('main').insertBefore(alertDiv, document.querySelector('section'));
    setTimeout(() => alertDiv.remove(), 5000);
}

function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

async function convertImageToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

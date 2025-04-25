// Get item ID from URL parameters
let currentItem = null;

function getItemDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const itemId = urlParams.get('id');
    
    // Get items from locStor
    const items = JSON.parse(localStorage.getItem('marketplaceItems')) || [];
    currentItem = items.find(item => item.id.toString() === itemId);

    if (currentItem) {
        updateItemDisplay(currentItem);
    } else {
        alert('Item not found!');
        window.location.href = 'StudentMarketplace.html';
    }
}

function updateItemDisplay(item) {
    document.querySelector('h2.card-title').textContent = item.title;
    document.querySelector('p.card-text:nth-of-type(1)').innerHTML = `<strong>Price:</strong> ${item.price}`;
    document.querySelector('p.card-text:nth-of-type(2)').innerHTML = `<strong>Description:</strong> ${item.description}`;
    document.querySelector('.img-fluid').src = item.imageData || 'images/loading.gif';
}

// Deleteing button function
function setupDeleteButton() {
    const deleteBtn = document.querySelector('.btn-danger');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to delete this item?')) {
                const items = JSON.parse(localStorage.getItem('marketplaceItems')) || [];
                const updatedItems = items.filter(item => item.id !== currentItem.id);
                localStorage.setItem('marketplaceItems', JSON.stringify(updatedItems));
                localStorage.removeItem(`comments_${currentItem.id}`); // Also remove comments
                window.location.href = 'StudentMarketplace.html';
            }
        });
    }
}

// Edit function
function setupEditButton() {
    const editBtn = document.querySelector('.btn-outline-secondary');
    if (editBtn) {
        editBtn.addEventListener('click', () => {
            const currentText = editBtn.textContent;
            
            if (currentText === 'Edit') {
                // Switch to edit mode
                makeContentEditable(true);
                editBtn.textContent = 'Save Changes';
                editBtn.classList.add('btn-success');
                editBtn.classList.remove('btn-outline-secondary');
            } else {
                // Save change
                if (saveChanges()) {
                    makeContentEditable(false);
                    editBtn.textContent = 'Edit';
                    editBtn.classList.remove('btn-success');
                    editBtn.classList.add('btn-outline-secondary');
                }
            }
        });
    }
}

function makeContentEditable(editable) {
    const title = document.querySelector('h2.card-title');
    const priceText = document.querySelector('p.card-text:nth-of-type(1)');
    const descText = document.querySelector('p.card-text:nth-of-type(2)');
    
    if (editable) {
        // Make title editable
        title.contentEditable = true;
        title.classList.add('form-control', 'mb-2', 'h2');
        
        // Replace price text with input
        const priceValue = currentItem.price.replace(' BHD', '');
        priceText.innerHTML = `
            <strong>Price:</strong>
            <div class="input-group mb-3">
                <input type="number" class="form-control" value="${priceValue}" step="0.01" min="0">
                <span class="input-group-text">BHD</span>
            </div>`;
        
        // Replace description with textarea
        descText.innerHTML = `
            <strong>Description:</strong>
            <textarea class="form-control mt-2">${currentItem.description}</textarea>`;
        
        // Add editing styles
        title.style.padding = '0.375rem';
        title.style.border = '1px solid #ced4da';
        title.style.borderRadius = '0.25rem';
    } else {
        // Remove editable state
        title.contentEditable = false;
        title.classList.remove('form-control', 'mb-2', 'h2');
        title.style.padding = '';
        title.style.border = '';
        title.style.borderRadius = '';
        
        // Update display
        updateItemDisplay(currentItem);
    }
}

function saveChanges() {
    const title = document.querySelector('h2.card-title').textContent.trim();
    const priceInput = document.querySelector('p.card-text:nth-of-type(1) input');
    const descTextarea = document.querySelector('p.card-text:nth-of-type(2) textarea');
    
    if (!title || !priceInput || !descTextarea) {
        alert('Error: Could not find all fields to save');
        return false;
    }

    if (!title || !priceInput.value || !descTextarea.value) {
        alert('Please fill out all fields');
        return false;
    }
    
    // Update current item
    currentItem.title = title;
    currentItem.price = priceInput.value + ' BHD';
    currentItem.description = descTextarea.value;
    
    // Update in localStor
    const items = JSON.parse(localStorage.getItem('marketplaceItems')) || [];
    const itemIndex = items.findIndex(item => item.id === currentItem.id);
    if (itemIndex !== -1) {
        items[itemIndex] = currentItem;
        localStorage.setItem('marketplaceItems', JSON.stringify(items));
        return true;
    }
    return false;
}

// Handle comment submission
function setupCommentForm() {
    const commentForm = document.querySelector('#commentForm form');
    if (commentForm) {
        commentForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = document.querySelector('#commenterName').value;
            const comment = document.querySelector('#commentText').value;
            
            if (!name || !comment) {
                alert('Please fill out both name and comment');
                return;
            }
            
            // Get existing comments or create new array
            const comments = JSON.parse(localStorage.getItem(`comments_${currentItem.id}`) || '[]');
            
            // Add new comment
            comments.unshift({
                name: name,
                comment: comment,
                date: new Date().toISOString()
            });
            
            // Save comments
            localStorage.setItem(`comments_${currentItem.id}`, JSON.stringify(comments));
            
            // Update comments display
            displayComments();
            
            // Reset form and collapse it
            commentForm.reset();
            const bsCollapse = bootstrap.Collapse.getInstance(document.querySelector('#commentForm'));
            if (bsCollapse) {
                bsCollapse.hide();
            }
        });
    }
}

// Display comments
function displayComments() {
    const commentsSection = document.querySelector('section.mt-5');
    const existingComments = commentsSection.querySelectorAll('.comment-box');
    existingComments.forEach(comment => comment.remove());
    
    const comments = JSON.parse(localStorage.getItem(`comments_${currentItem.id}`) || '[]');
    
    comments.forEach(comment => {
        const commentHTML = `
            <div class="comment-box">
                <h5>${comment.name}</h5>
                <p>${comment.comment}</p>
            </div>
        `;
        commentsSection.insertAdjacentHTML('beforeend', commentHTML);
    });
}

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    getItemDetails();
    setupDeleteButton();
    setupEditButton();
    setupCommentForm();
    displayComments();
});
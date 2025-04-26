// Mock API URL 
const apiUrl = "https://jsonplaceholder.typicode.com/posts";
document.addEventListener('DOMContentLoaded', () => {
    let currentItem = null;

    function getItemDetails() {
        const urlParams = new URLSearchParams(window.location.search);
        const itemId = urlParams.get('id');
        
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
        
        const imgElement = document.querySelector('.img-fluid');
        imgElement.src = item.imageData || item.image;
        imgElement.onerror = function() {
            this.src = '../images/marketplace.jpeg';
        };
    }

    function setupDeleteButton() {
        const deleteBtn = document.querySelector('.btn-danger');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => {
                if (confirm('Are you sure you want to delete this item?')) {
                    const items = JSON.parse(localStorage.getItem('marketplaceItems')) || [];
                    const updatedItems = items.filter(item => item.id !== currentItem.id);
                    localStorage.setItem('marketplaceItems', JSON.stringify(updatedItems));
                    window.location.href = 'StudentMarketplace.html';
                }
            });
        }
    }

    function setupEditButton() {
        const editBtn = document.querySelector('.btn-outline-secondary');
        if (editBtn) {
            editBtn.addEventListener('click', () => {
                const currentText = editBtn.textContent;
                
                if (currentText === 'Edit') {
                    makeContentEditable(true);
                    editBtn.textContent = 'Save Changes';
                    editBtn.classList.add('btn-success');
                    editBtn.classList.remove('btn-outline-secondary');
                } else {
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
        const imgElement = document.querySelector('.img-fluid');
        const imgContainer = imgElement.parentElement;
        
        if (editable) {
            title.contentEditable = true;
            title.classList.add('form-control', 'mb-2', 'h2');
            
            const priceValue = currentItem.price.replace(' BHD', '');
            priceText.innerHTML = `
                <strong>Price:</strong>
                <div class="input-group mb-3">
                    <input type="number" class="form-control" value="${priceValue}" step="0.01" min="0">
                    <span class="input-group-text">BHD</span>
                </div>`;
            
            descText.innerHTML = `
                <strong>Description:</strong>
                <textarea class="form-control mt-2 mb-3">${currentItem.description}</textarea>
                <strong>Change Image:</strong>
                <input type="file" class="form-control mt-2" id="imageInput" accept="image/*">`;

            const imageInput = document.getElementById('imageInput');
            imageInput.addEventListener('change', async (e) => {
                if (e.target.files && e.target.files[0]) {
                    try {
                        const newImageData = await handleImageUpload(e.target.files[0]);
                        imgElement.src = newImageData;
                        currentItem.imageData = newImageData;
                    } catch (error) {
                        alert(error.message || 'Error uploading image');
                    }
                }
            });
            
            title.style.padding = '0.375rem';
            title.style.border = '1px solid #ced4da';
            title.style.borderRadius = '0.25rem';
        } else {
            title.contentEditable = false;
            title.classList.remove('form-control', 'mb-2', 'h2');
            title.style.padding = '';
            title.style.border = '';
            title.style.borderRadius = '';
            
            updateItemDisplay(currentItem);
        }
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

    function saveChanges() {
        const title = document.querySelector('h2.card-title').textContent.trim();
        const priceInput = document.querySelector('p.card-text:nth-of-type(1) input');
        const descTextarea = document.querySelector('p.card-text:nth-of-type(2) textarea');
        
        if (!title || !priceInput?.value || !descTextarea?.value) {
            alert('Please fill out all fields');
            return false;
        }
        
        currentItem.title = title;
        currentItem.price = priceInput.value + ' BHD';
        currentItem.description = descTextarea.value;
        // Image data is already updated in the currentItem when file is selected
        
        const items = JSON.parse(localStorage.getItem('marketplaceItems')) || [];
        const itemIndex = items.findIndex(item => item.id === currentItem.id);
        if (itemIndex !== -1) {
            items[itemIndex] = currentItem;
            localStorage.setItem('marketplaceItems', JSON.stringify(items));
            return true;
        }
        return false;
    }

    // Setup Comment Form
    function setupCommentForm() {
        const commentForm = document.querySelector('#commentForm form');
        if (commentForm) {
            commentForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                const name = document.querySelector('#commenterName').value.trim();
                const comment = document.querySelector('#commentText').value.trim();
                
                if (!name || !comment) {
                    alert('Please fill out both name and comment');
                    return;
                }
                
                const comments = JSON.parse(localStorage.getItem(`comments_${currentItem.id}`) || '[]');
                comments.unshift({
                    name: name,
                    comment: comment,
                    date: new Date().toISOString()
                });
                
                localStorage.setItem(`comments_${currentItem.id}`, JSON.stringify(comments));
                displayComments();
                
                commentForm.reset();
                const bsCollapse = bootstrap.Collapse.getInstance(document.querySelector('#commentForm'));
                if (bsCollapse) {
                    bsCollapse.hide();
                }
            });
        }
    }

    function displayComments() {
        const commentsSection = document.querySelector('section.mt-5');
        const existingComments = commentsSection.querySelectorAll('.comment-box');
        existingComments.forEach(comment => comment.remove());
        
        const comments = JSON.parse(localStorage.getItem(`comments_${currentItem.id}`) || '[]');
        
        comments.forEach(comment => {
            commentsSection.insertAdjacentHTML('beforeend', `
                <div class="comment-box">
                    <h5>${comment.name}</h5>
                    <p>${comment.comment}</p>
                </div>
            `);
        });
    }

    // Initialize page
    getItemDetails();
    setupDeleteButton();
    setupEditButton();
    setupCommentForm();
    displayComments();
});
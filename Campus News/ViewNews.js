document.addEventListener('DOMContentLoaded', () => {
    // Retrieve the selected article ID from localStorage
    const articleId = localStorage.getItem('selectedArticleId');

    if (!articleId) {
        document.querySelector('main').innerHTML = '<p class="text-danger">No article selected.</p>';
        return;
    }

    // Use the full base URL for images from Replit
    const baseUrl = "";

    // Fetch the article data
    fetch('json/News.json?' + new Date().getTime())
        .then(response => response.json())
        .then(articles => {
            const article = articles.find(a => a.id == articleId);
            if (!article) throw new Error('Article not found');
            
            // Populate article details
            document.querySelector('.article-title').textContent = article.title;
            // Use full URL for image
            document.querySelector('.article-image').src = article.image ? baseUrl + article.image : baseUrl + 'Pic/Logo.png';
            document.querySelector('.article-meta .h5:nth-child(1)').textContent = `🗓️ ${article.date}`;
            document.querySelector('.article-meta .h5:nth-child(2)').textContent = `✍️ ${article.author}`;
            document.querySelector('.article-content .lead').innerHTML = article.content;

            // Show views count
            let viewsElem = document.querySelector('.article-meta .views-count');
            if (!viewsElem) {
              viewsElem = document.createElement('p');
              viewsElem.className = 'h6 mb-0 views-count';
              document.querySelector('.article-meta').appendChild(viewsElem);
            }
            viewsElem.textContent = `👁️ ${article.views} views`;
        })
        .catch(error => {
            console.error('Error:', error);
            document.querySelector('main').innerHTML = `<p class="text-danger">${error.message}</p>`;
        });

    // Increment views count when article is loaded
    if (articleId) {
        fetch('https://7c52feb7-4a7c-440b-af78-47bb633d14a6-00-2v8szsbn47wab.sisko.replit.dev/views.php', {
            method: 'POST',
            body: (() => {
                const fd = new FormData();
                fd.append('id', articleId);
                return fd;
            })()
        });
    }

    // Delete button handler
    const deleteButton = document.getElementById('deleteButton');
    if (deleteButton) {
        deleteButton.addEventListener('click', () => {
            showDeleteConfirmation(articleId);
        });
    }

    // On article load, also load comments
    if (articleId) loadComments(articleId);
});

function showDeleteConfirmation(articleId) {
    const modal = new bootstrap.Modal(document.getElementById('feedbackModal'));
    const modalBody = document.getElementById('feedbackModalBody');
    const confirmBtn = document.querySelector('.btn-confirm');
    const cancelBtn = document.querySelector('.btn-cancel');

    // Show confirmation dialog
    modalBody.textContent = 'Are you sure you want to delete this article?';
    confirmBtn.style.display = 'inline-block';
    cancelBtn.style.display = 'inline-block';
    confirmBtn.textContent = 'Delete';
    confirmBtn.classList.remove('btn-primary');
    confirmBtn.classList.add('btn-danger');
    
    // Clear previous event listeners
    const newConfirmBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
    
    const newCancelBtn = cancelBtn.cloneNode(true);
    cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);
    
    document.querySelector('.btn-confirm').onclick = async () => {
        document.querySelector('.btn-confirm').disabled = true;
        try {
            const formData = new FormData();
            formData.append('id', articleId);
            
            const response = await fetch('https://7c52feb7-4a7c-440b-af78-47bb633d14a6-00-2v8szsbn47wab.sisko.replit.dev/deleteNews.php', {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            
            if (result.success) {
modal.hide();
// Redirect to Campus News page after successful deletion
window.location.href = 'CampusNews.html?' + new Date().getTime();
} else {
throw new Error(result.message || 'Failed to delete article');
}
        } catch (error) {
            showFeedbackMessage(`Error: ${error.message}`);
            document.querySelector('.btn-confirm').disabled = false;
        }
    };
    
    modal.show();
}

function showFeedbackMessage(message) {
    const modal = new bootstrap.Modal(document.getElementById('feedbackModal'));
    const modalBody = document.getElementById('feedbackModalBody');
    const confirmBtn = document.querySelector('.btn-confirm');
    const cancelBtn = document.querySelector('.btn-cancel');

    modalBody.textContent = message;
    confirmBtn.style.display = 'none';
    cancelBtn.style.display = 'inline-block';
    cancelBtn.textContent = 'OK';
    
    // Clear previous event listeners
    const newCancelBtn = cancelBtn.cloneNode(true);
    cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);
    
    document.querySelector('.btn-cancel').onclick = () => {
        modal.hide();
    };
    
    modal.show();
}

async function loadComments(articleId) {
    const commentsList = document.getElementById('commentsList');
    commentsList.innerHTML = '<div>Loading comments...</div>';
    try {
        const response = await fetch('json/Comments.json?' + new Date().getTime());
        const comments = await response.json();
        const articleComments = comments.filter(c => c.articleId == articleId);
        if (articleComments.length === 0) {
            commentsList.innerHTML = '<div class="text-muted">No comments yet.</div>';
            return;
        }
        commentsList.innerHTML = '';
        articleComments.forEach(comment => {
            const commentBox = document.createElement('div');
            commentBox.className = 'comment-box mb-3 p-3 border rounded';
            commentBox.innerHTML = `
                <h5>${comment.author}</h5>
                <p class="comment-content" data-id="${comment.id}">${comment.content}</p>
                <small class="text-muted">${comment.date}</small><br>
                <button class="btn btn-outline-secondary btn-sm edit-comment mt-2" data-id="${comment.id}">Edit</button>
                <button class="btn btn-outline-danger btn-sm delete-comment mt-2" data-id="${comment.id}">Delete</button>
            `;
            commentsList.appendChild(commentBox);
        });
    } catch (error) {
        commentsList.innerHTML = '<div class="text-danger">Failed to load comments.</div>';
    }
}

// Add Comment
const addCommentForm = document.getElementById('addCommentForm');
if (addCommentForm) {
    addCommentForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const articleId = localStorage.getItem('selectedArticleId');
        const author = document.getElementById('commenterName').value.trim();
        const content = document.getElementById('commentText').value.trim();
        if (!author || !content) return;
        
        const formData = new FormData();
        formData.append('articleId', articleId);
        formData.append('author', author);
        formData.append('content', content);
        
        try {
            const response = await fetch('https://7c52feb7-4a7c-440b-af78-47bb633d14a6-00-2v8szsbn47wab.sisko.replit.dev/addComment.php', {
                method: 'POST',
                body: formData
            });
            const result = await response.json();
            if (result.success) {
                window.location.reload(); // Refresh the page after adding
            } else {
                showFeedbackMessage('Error: ' + (result.message || 'Failed to add comment'));
            }
        } catch (error) {
            showFeedbackMessage('An error occurred while adding the comment');
        }
    });
}

// Edit/Delete Comment Handlers
document.getElementById('commentsList').addEventListener('click', function(e) {
    const articleId = localStorage.getItem('selectedArticleId');
    
    if (e.target.classList.contains('delete-comment')) {
        const commentId = e.target.getAttribute('data-id');
        showDeleteCommentConfirmation(commentId);
    } else if (e.target.classList.contains('edit-comment')) {
        const commentId = e.target.getAttribute('data-id');
        const contentP = document.querySelector(`.comment-content[data-id="${commentId}"]`);
        const oldContent = contentP.textContent;
        showEditCommentModal(commentId, oldContent);
    }
});

function showDeleteCommentConfirmation(commentId) {
    const modal = new bootstrap.Modal(document.getElementById('feedbackModal'));
    const modalBody = document.getElementById('feedbackModalBody');
    const confirmBtn = document.querySelector('.btn-confirm');
    const cancelBtn = document.querySelector('.btn-cancel');

    // Show confirmation dialog
    modalBody.textContent = 'Are you sure you want to delete this comment?';
    confirmBtn.style.display = 'inline-block';
    cancelBtn.style.display = 'inline-block';
    confirmBtn.textContent = 'Delete';
    confirmBtn.classList.remove('btn-primary');
    confirmBtn.classList.add('btn-danger');
    
    // Clear previous event listeners
    const newConfirmBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
    
    const newCancelBtn = cancelBtn.cloneNode(true);
    cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);
    
    document.querySelector('.btn-confirm').onclick = async () => {
        document.querySelector('.btn-confirm').disabled = true;
        try {
            const formData = new FormData();
            formData.append('id', commentId);
            
            const response = await fetch('https://7c52feb7-4a7c-440b-af78-47bb633d14a6-00-2v8szsbn47wab.sisko.replit.dev/deleteComment.php', {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            
            if (result.success) {
                modal.hide();
                window.location.reload(); // Refresh the page after deletion
            } else {
                throw new Error(result.message || 'Failed to delete comment');
            }
        } catch (error) {
            showFeedbackMessage(`Error: ${error.message}`);
            document.querySelector('.btn-confirm').disabled = false;
        }
    };
    
    modal.show();
}

function showEditCommentModal(commentId, oldContent) {
    const modal = new bootstrap.Modal(document.getElementById('feedbackModal'));
    const modalBody = document.getElementById('feedbackModalBody');
    const confirmBtn = document.querySelector('.btn-confirm');
    const cancelBtn = document.querySelector('.btn-cancel');

    // Show edit dialog
    modalBody.innerHTML = `
        <div class="mb-3">
            <label for="editCommentText" class="form-label">Edit your comment:</label>
            <textarea class="form-control" id="editCommentText" rows="3">${oldContent}</textarea>
        </div>
    `;
    confirmBtn.style.display = 'inline-block';
    cancelBtn.style.display = 'inline-block';
    confirmBtn.textContent = 'Update';
    confirmBtn.classList.remove('btn-danger');
    confirmBtn.classList.add('btn-primary');
    
    // Clear previous event listeners
    const newConfirmBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
    
    const newCancelBtn = cancelBtn.cloneNode(true);
    cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);
    
    document.querySelector('.btn-confirm').onclick = async () => {
        const newContent = document.getElementById('editCommentText').value.trim();
        if (!newContent) {
            showFeedbackMessage('Comment cannot be empty');
            return;
        }
        
        document.querySelector('.btn-confirm').disabled = true;
        try {
            const formData = new FormData();
            formData.append('id', commentId);
            formData.append('content', newContent);
            
            const response = await fetch('https://7c52feb7-4a7c-440b-af78-47bb633d14a6-00-2v8szsbn47wab.sisko.replit.dev/editComment.php', {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            
            if (result.success) {
                modal.hide();
                window.location.reload(); // Refresh the page after editing
            } else {
                throw new Error(result.message || 'Failed to update comment');
            }
        } catch (error) {
            showFeedbackMessage(`Error: ${error.message}`);
            document.querySelector('.btn-confirm').disabled = false;
        }
    };
    
    modal.show();
}
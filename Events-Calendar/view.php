<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Event Details - UniHub</title>
    <link rel="icon" href="../images/Logo.png">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="styles.css">
    <script src="apiEC/config.js"></script>
</head>
<body>
    <!-- Header -->
    <header class="p-3 navbar navbar-expand-md navbar-dark bg-dark">
        <div class="container-fluid">
            <a class="navbar-brand" href="../index.html">
                <img src="Pics/Logo.png" alt="Logo" width="30" height="24">
            </a>
            <button class="navbar-toggler ms-auto" data-bs-toggle="collapse" data-bs-target="#navbarNavAltMarkup">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNavAltMarkup">
                <div class="navbar-nav mr-auto">
                    <a class="nav-link" href="../index.html">Home</a>
                    <a class="nav-link" href="../Campus News/Campus News.html">Campus News</a>
                    <a class="nav-link" href="../course-review2/Course-Review.html">Course Review</a>
                    <a class="nav-link active" href="Events-Calender.html">Events Calendar</a>
                    <a class="nav-link" href="../Phase1_Course-Notes/Course-Notes.html">Course Notes</a>
                    <a class="nav-link" href="../Phase1-ClubActivity/ClubActivity.html">Club Activities</a>
                    <a class="nav-link" href="../student-Marketplace/StudentMarketplace.html">Student Marketplace</a>
                </div>
            </div>
        </div>
    </header>

    <!-- Main Content -->
    <main class="container mt-4">
        <!-- Loading Indicator -->
        <div id="loadingIndicator" class="text-center d-none">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        </div>

        <!-- Error Container -->
        <div id="errorContainer" class="mt-3"></div>

        <!-- Action Buttons -->
        <div class="mb-3 d-flex gap-2">
            <a href="Events-Calender.php" class="btn btn-success">← Back to Events</a>
            <button id="editButton" class="btn btn-outline-secondary">Edit Event</button>
            <button id="deleteButton" class="btn btn-danger">Delete</button>
        </div>

        <!-- Event Details Section -->
        <section class="row">
            <!-- Event Image -->
            <div class="col-md-5">
                <div id="eventImage"></div>
                <div class="additional-details mt-3">
                    <button id="registerButton" class="btn btn-primary btn-lg w-100">Register for Event</button>
                </div>
            </div>

            <!-- Event Details -->
            <div class="col-md-7">
                <!-- View Mode -->
                <div id="viewMode">
                    <div class="event-header-container">
                        <h2 id="eventTitle" class="event-title"></h2>
                        <div class="event-meta">
                            <p id="eventDate"></p>
                            <p id="eventLocation"></p>
                            <p id="eventCategory"></p>
                        </div>
                    </div>

                    <div class="event-description mt-4">
                        <h4 class="about-title">About Event</h4>
                        <p id="eventDescription" class="lead"></p>
                    </div>
                </div>
                
                <!-- Edit Form -->
                <div id="editMode" class="d-none">
                    <form id="editForm" class="mt-3">
                        <div class="mb-3">
                            <label for="editTitle" class="form-label">Event Title:</label>
                            <input type="text" class="form-control" id="editTitle" name="title" required>
                        </div>
                        <div class="mb-3">
                            <label for="editDate" class="form-label">Event Date:</label>
                            <input type="datetime-local" class="form-control" id="editDate" name="date" required>
                        </div>
                        <div class="mb-3">
                            <label for="editLocation" class="form-label">Location:</label>
                            <input type="text" class="form-control" id="editLocation" name="location" required>
                        </div>
                        <div class="mb-3">
                            <label for="editCategory" class="form-label">Category:</label>
                            <select class="form-control" id="editCategory" name="category" required>
                                <option value="Workshop">Workshop</option>
                                <option value="Competition">Competition</option>
                                <option value="Talk">Talk</option>
                                <option value="Meetup">Meetup</option>
                                <option value="Social">Social</option>
                            </select>
                        </div>
                        <div class="mb-3">
                            <label for="editDescription" class="form-label">Description:</label>
                            <textarea class="form-control" id="editDescription" name="description" rows="4" required></textarea>
                        </div>
                        <div class="mb-3">
                            <label for="editImage" class="form-label">Event Image:</label>
                            <input type="file" class="form-control" id="editImage" name="image" accept="image/*">
                        </div>
                        <div class="d-flex gap-2">
                            <button type="submit" class="btn btn-success">Save Changes</button>
                            <button type="button" class="btn btn-danger" id="cancelEdit">Cancel</button>
                        </div>
                    </form>
                </div>
            </div>
        </section>

        <!-- Comments Section -->
        <section class="mb-5 mt-5">
            <h3 class="comment-header mb-4">Comments</h3>

            <!-- Add Comment Button -->
            <button class="btn btn-success mb-4" type="button" data-bs-toggle="collapse" data-bs-target="#commentForm" onclick="scrollToCommentForm()">
                Add a Comment
            </button>

            <!-- Comment Form -->
            <div class="collapse" id="commentForm">
                <div class="card mb-4">
                    <div class="card-body">
                        <h5 class="card-title">Add a Comment</h5>
                        <form id="addCommentForm">
                            <div class="mb-3">
                                <label for="commenterName" class="form-label">Your Name:</label>
                                <input type="text" class="form-control" id="commenterName" name="commenterName" placeholder="Enter your name" required>
                            </div>
                            <div class="mb-3">
                                <label for="commentText" class="form-label">Your Comment:</label>
                                <textarea class="form-control" id="commentText" name="commentText" rows="3" placeholder="Write your comment here..." required></textarea>
                            </div>
                            <button type="submit" class="btn btn-success w-100">Submit Comment</button>
                        </form>
                    </div>
                </div>
            </div>

            <!-- Comments Container -->
            <div id="commentsContainer"></div>
        </section>
    </main>

    <!-- Footer -->
    <footer class="text-center py-3 mt-5">
        &copy; 2025 UNIHUB. All rights reserved.
    </footer>

    <script>
        // DOM Elements
        const loadingIndicator = document.getElementById('loadingIndicator');
        const errorContainer = document.getElementById('errorContainer');
        const eventImage = document.getElementById('eventImage');
        const eventTitle = document.getElementById('eventTitle');
        const eventDate = document.getElementById('eventDate');
        const eventLocation = document.getElementById('eventLocation');
        const eventCategory = document.getElementById('eventCategory');
        const eventDescription = document.getElementById('eventDescription');
        const registerButton = document.getElementById('registerButton');
        const commentsContainer = document.getElementById('commentsContainer');
        const commentForm = document.getElementById('addCommentForm');
        const editButton = document.getElementById('editButton');
        const viewMode = document.getElementById('viewMode');
        const editMode = document.getElementById('editMode');
        const editForm = document.getElementById('editForm');
        const cancelEdit = document.getElementById('cancelEdit');
        const deleteButton = document.getElementById('deleteButton');

        let currentEvent = null;

        // Helper functions
        function showLoading() {
            loadingIndicator.classList.remove('d-none');
        }

        function hideLoading() {
            loadingIndicator.classList.add('d-none');
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

        function formatDate(date) {
            return new Date(date).toLocaleString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        }

        function formatDateForInput(date) {
            const d = new Date(date);
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            const hours = String(d.getHours()).padStart(2, '0');
            const minutes = String(d.getMinutes()).padStart(2, '0');
            return `${year}-${month}-${day}T${hours}:${minutes}`;
        }

        // Display comments
        function displayComments(comments) {
            if (!Array.isArray(comments)) {
                if (typeof comments === 'string') {
                    try {
                        comments = JSON.parse(comments);
                    } catch {
                        comments = [];
                    }
                } else if (!comments) {
                    comments = [];
                }
            }
            commentsContainer.innerHTML = comments.length === 0 
                ? '<p>No comments yet. Be the first to comment!</p>'
                : comments.map(comment => `
                    <div class="comment-box">
                        <h5>${comment.name}</h5>
                        <p class="text-muted small mb-2">Posted on ${new Date(comment.date).toLocaleString()}</p>
                        <p>${comment.text}</p>
                    </div>
                `).join('');
        }

        // Toggle edit mode
        function toggleEditMode(show) {
            if (show) {
                viewMode.classList.add('d-none');
                editMode.classList.remove('d-none');
                // Populate edit form
                document.getElementById('editTitle').value = currentEvent.title;
                document.getElementById('editDate').value = formatDateForInput(currentEvent.event_date);
                document.getElementById('editLocation').value = currentEvent.location;
                document.getElementById('editCategory').value = currentEvent.category;
                document.getElementById('editDescription').value = currentEvent.description;
            } else {
                viewMode.classList.remove('d-none');
                editMode.classList.add('d-none');
            }
        }

        // Update event display
        function updateEventDisplay() {
            eventImage.innerHTML = `<img src="apiEC/${currentEvent.image_path}" class="img-fluid rounded" alt="${currentEvent.title}">`;
            eventTitle.textContent = currentEvent.title;
            eventDate.innerHTML = `📅 Date: ${formatDate(currentEvent.event_date)}`;
            eventLocation.innerHTML = `📍 Location: ${currentEvent.location}`;
            eventCategory.innerHTML = `🏷️ Category: ${currentEvent.category}`;
            eventDescription.textContent = currentEvent.description;
            displayComments(currentEvent.comments || []);
        }

        // Get event details
        async function fetchEventDetails() {
            const urlParams = new URLSearchParams(window.location.search);
            const eventId = parseInt(urlParams.get('id'));

            if (!eventId) {
                showError('Event not found');
                return;
            }

            showLoading();

            try {
                const response = await fetch(`${config.apiBaseUrl}?action=get&id=${eventId}`);
                const data = await response.json();
                
                if (!response.ok) {
                    throw new Error(data.error || 'Failed to fetch event details');
                }

                currentEvent = data;
                updateEventDisplay();

                // Register button handler
                registerButton.addEventListener('click', async () => {
                    try {
                        const response = await fetch(`${config.apiBaseUrl}?action=update`, {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/x-www-form-urlencoded',
                            },
                            body: `id=${eventId}&popularity=1`
                        });

                        const data = await response.json();
                        
                        if (!response.ok) {
                            throw new Error(data.error || 'Failed to register for event');
                        }

                        showSuccess(`Successfully registered for ${data.title}!`);
                        registerButton.disabled = true;
                        registerButton.textContent = 'Registered';
                    } catch (error) {
                        console.error('Error:', error);
                        showError(error.message);
                    }
                });

            } catch (error) {
                console.error('Error:', error);
                showError('Failed to load event details. Please try again later.');
            } finally {
                hideLoading();
            }
        }

        // Edit button handler
        editButton.addEventListener('click', () => toggleEditMode(true));
        cancelEdit.addEventListener('click', () => toggleEditMode(false));

        // Edit form handler
        editForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(editForm);
            formData.append('id', currentEvent.id);
            showLoading();
            try {
                const response = await fetch(`${config.apiBaseUrl}?action=update`, {
                    method: 'POST',
                    body: formData
                });
                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data.error || 'Failed to update event');
                }
                currentEvent = data;
                toggleEditMode(false);
                updateEventDisplay();
                showSuccess('Event updated successfully!');
            } catch (error) {
                console.error('Error:', error);
                showError(error.message);
            } finally {
                hideLoading();
            }
        });

        // Comment form handler
        commentForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!currentEvent) {
                showError('Cannot add comment: Event not found');
                return;
            }
            const formData = new FormData(commentForm);
            const name = formData.get('commenterName');
            const text = formData.get('commentText');
            if (!name || !text) {
                showError('Please fill in all fields');
                return;
            }
            showLoading();
            try {
                // Fetch current comments
                let comments = currentEvent.comments || [];
                if (typeof comments === 'string') {
                    try { comments = JSON.parse(comments); } catch { comments = []; }
                }
                const newComment = { name, text, date: new Date() };
                comments.unshift(newComment);
                // Update event with new comments array
                const response = await fetch(`${config.apiBaseUrl}?action=update`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: `id=${currentEvent.id}&comments=${encodeURIComponent(JSON.stringify(comments))}`
                });
                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data.error || 'Failed to add comment');
                }
                currentEvent = data;
                displayComments(currentEvent.comments || []);
                commentForm.reset();
                const commentFormCollapse = bootstrap.Collapse.getInstance(document.getElementById('commentForm'));
                if (commentFormCollapse) commentFormCollapse.hide();
                showSuccess('Comment added successfully!');
            } catch (error) {
                console.error('Error:', error);
                showError(error.message);
            } finally {
                hideLoading();
            }
        });

        // Function to scroll to comment form
        function scrollToCommentForm() {
            setTimeout(() => {
                document.getElementById('commentForm').scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'center'
                });
            }, 200);
        }

        // Delete button handler
        deleteButton.addEventListener('click', async () => {
            if (confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
                showLoading();
                try {
                    const response = await fetch(`${config.apiBaseUrl}?action=delete&id=${currentEvent.id}`, {
                        method: 'DELETE'
                    });

                    const data = await response.json();
                    
                    if (!response.ok) {
                        throw new Error(data.error || 'Failed to delete event');
                    }

                    showSuccess('Event deleted successfully!');
                    // Redirect back to events page after short delay
                    setTimeout(() => {
                        window.location.href = 'Events-Calender.php';
                    }, 1500);
                } catch (error) {
                    console.error('Error:', error);
                    showError(error.message);
                } finally {
                    hideLoading();
                }
            }
        });

        // Initialize the page
        fetchEventDetails();
    </script>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
console.log("Script loaded!");

document.addEventListener('DOMContentLoaded', () => {
  console.log("DOM fully loaded");
  
  // Initialize elements
  const searchInput = document.querySelector('input[type="search"]');
  const filterDropdown = document.querySelector('.filter-dropdown .dropdown-menu');
  const sortDropdown = document.querySelector('.sort-dropdown .dropdown-menu');
  const reviewsContainer = document.querySelector('.row');
  const paginationContainer = document.querySelector('.pagination');
  const addReviewModal = document.getElementById('addReviewModal');
  const reviewForm = addReviewModal.querySelector('form');
  
  // Create error container
  const errorContainer = document.createElement('div');
  errorContainer.className = 'container mt-3';
  document.querySelector('main').prepend(errorContainer);

  // State Management
  let reviews = [];
  let currentPage = 1;
  const reviewsPerPage = 6;
  let currentFilter = 'all';
  let currentSort = 'newest';

  // Mock data for reviews
  const mockReviews = [
    {
      id: 1,
      title: "Intro to Computer Science",
      code: "COMP101",
      professor: "Prof. Ali",
      rating: 5,
      review: "This course transformed my understanding of programming. The professor was engaging and the materials were top-notch.",
      author: "Abdulrahman",
      date: "2023-10-15",
      likes: 24,
      comments: []
    },
    // ... (keep your other mock reviews exactly as they are)
  ];

  // Filter and sort reviews
  function applyFiltersAndSort() {
    const searchTerm = searchInput.value.toLowerCase();
    
    let filteredReviews = reviews.filter(review => {
      const matchesSearch = review.title.toLowerCase().includes(searchTerm) ||
                          review.review.toLowerCase().includes(searchTerm) ||
                          review.code.toLowerCase().includes(searchTerm);
      const matchesFilter = currentFilter === 'all' || 
                          review.code === currentFilter;
      return matchesSearch && matchesFilter;
    });

    // Sort reviews
    filteredReviews.sort((a, b) => {
      switch (currentSort) {
        case 'newest': return new Date(b.date) - new Date(a.date);
        case 'highest': return b.rating - a.rating;
        case 'code': return a.code.localeCompare(b.code);
        default: return new Date(b.date) - new Date(a.date);
      }
    });

    updatePagination(filteredReviews.length);
    displayReviews(filteredReviews);
  }

  // Display reviews with pagination
  function displayReviews(filteredReviews) {
    const startIndex = (currentPage - 1) * reviewsPerPage;
    const endIndex = startIndex + reviewsPerPage;
    const currentReviews = filteredReviews.slice(startIndex, endIndex);

    reviewsContainer.innerHTML = currentReviews.map(review => `
      <article class="col-md-4 mb-4">
        <div class="card h-100">
          <div class="card-body">
            <div class="d-flex justify-content-between mb-2">
              <h5 class="card-title">${review.title}</h5>
              <div class="rating-stars">${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}</div>
            </div>
            <h6 class="card-subtitle mb-2 text-muted">${review.code} • ${review.professor}</h6>
            <p class="card-text">${review.review}</p>
            <div class="d-flex justify-content-between align-items-center">
              <small class="text-muted">${review.author} • ${review.date}</small>
              <div>
                <button class="btn btn-sm btn-outline-success me-1" onclick="likeReview(${review.id})">👍 ${review.likes}</button>
                <button class="btn btn-sm btn-outline-primary" onclick="showComments(${review.id})">💬</button>
              </div>
            </div>
          </div>
        </div>
      </article>
    `).join('');
  }

  // Update pagination
  function updatePagination(totalReviews) {
    const totalPages = Math.ceil(totalReviews / reviewsPerPage);
    
    paginationContainer.innerHTML = totalPages <= 1 ? '' : `
      <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
        <a class="page-link" href="#" onclick="changePage(${currentPage - 1})">&laquo;</a>
      </li>
      ${Array.from({length: totalPages}, (_, i) => i + 1).map(page => `
        <li class="page-item ${page === currentPage ? 'active' : ''}">
          <a class="page-link" href="#" onclick="changePage(${page})">${page}</a>
        </li>
      `).join('')}
      <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
        <a class="page-link" href="#" onclick="changePage(${currentPage + 1})">&raquo;</a>
      </li>
    `;
  }

  // Event Handlers
  searchInput.addEventListener('input', () => {
    currentPage = 1;
    applyFiltersAndSort();
  });

  // Update filter dropdown items to use data attributes
  document.querySelectorAll('.filter-dropdown .dropdown-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      currentFilter = e.target.textContent.split(' ')[0]; // Get course code
      currentPage = 1;
      applyFiltersAndSort();
    });
  });

  // Update sort dropdown items to use data attributes
  document.querySelectorAll('.sort-dropdown .dropdown-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const sortText = e.target.textContent.toLowerCase();
      currentSort = sortText.includes('newest') ? 'newest' :
                   sortText.includes('highest') ? 'highest' :
                   sortText.includes('code') ? 'code' : 'newest';
      currentPage = 1;
      applyFiltersAndSort();
    });
  });

  // Review form handler
  reviewForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const formElements = reviewForm.elements;
    const newReview = {
      id: Date.now(),
      title: formElements['courseTitle'].value,
      code: formElements['courseCode'].value,
      professor: formElements['professorName'].value,
      rating: parseInt(formElements['rating'].value),
      review: formElements['review'].value,
      author: "You",
      date: new Date().toISOString().split('T')[0],
      likes: 0,
      comments: []
    };

    // Simple validation
    if (!newReview.title || !newReview.code || !newReview.professor || 
        isNaN(newReview.rating) || !newReview.review) {
      showError('Please fill in all fields correctly');
      return;
    }

    reviews.unshift(newReview);
    localStorage.setItem('reviews', JSON.stringify(reviews));
    
    reviewForm.reset();
    bootstrap.Modal.getInstance(addReviewModal).hide();
    currentPage = 1;
    currentSort = 'newest';
    applyFiltersAndSort();
    showSuccess('Review added successfully!');
  });

  // Helper functions
  window.showError = function(message) {
    errorContainer.innerHTML = `
      <div class="alert alert-danger alert-dismissible fade show" role="alert">
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
      </div>
    `;
  };

  window.showSuccess = function(message) {
    errorContainer.innerHTML = `
      <div class="alert alert-success alert-dismissible fade show" role="alert">
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
      </div>
    `;
  };

  window.changePage = function(page) {
    if (page < 1 || page > Math.ceil(reviews.length / reviewsPerPage)) return;
    currentPage = page;
    applyFiltersAndSort();
  };

  window.likeReview = function(reviewId) {
    const review = reviews.find(r => r.id === reviewId);
    if (review) {
      review.likes++;
      localStorage.setItem('reviews', JSON.stringify(reviews));
      applyFiltersAndSort();
    }
  };

  window.showComments = function(reviewId) {
    alert(`Showing comments for review ${reviewId}`);
  };

  // Fetch reviews from storage or mock data
  function fetchReviews() {
    try {
      const storedReviews = localStorage.getItem('reviews');
      reviews = storedReviews ? JSON.parse(storedReviews) : mockReviews;
      localStorage.setItem('reviews', JSON.stringify(reviews));
      applyFiltersAndSort();
    } catch (error) {
      console.error('Error loading reviews:', error);
      reviews = mockReviews;
      applyFiltersAndSort();
      showError('An error occurred while loading reviews. Please try again.');
    }
  }

  // Initialize
  fetchReviews();


  
}); 
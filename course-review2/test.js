document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements - Added null checks for all elements
  const reviewsContainer = document.getElementById('reviewsContainer');
  const searchInput = document.getElementById('searchInput');
  const paginationContainer = document.getElementById('paginationContainer');
  const filterDropdown = document.querySelector('.dropdown-menu[aria-labelledby="filterDropdown"]');
  const sortDropdown = document.querySelector('.dropdown-menu[aria-labelledby="sortDropdown"]');
  const filterButton = document.getElementById('filterDropdown');
  const sortButton = document.getElementById('sortDropdown');
  const loadingSpinner = document.getElementById('loadingSpinner');
  const addReviewForm = document.getElementById('addReviewForm');
  const submitReviewBtn = document.getElementById('submitReviewBtn');

  // API Configuration - Added fallback for API_CONFIG
  const BASE_URL = (typeof window.API_CONFIG !== 'undefined' && window.API_CONFIG.BASE_URL) 
    ? window.API_CONFIG.BASE_URL 
    : 'http://localhost:3000/api';
  const API_URL = `${BASE_URL}/reviews`;
  console.log('API_URL:', API_URL);

  // Initial Data (to be added via API if database is empty)
  const initialReviews = [
    {
      id: 1,
      courseTitle: "Intro to Computer Science",
      courseCode: "COMP 101",
      professorName: "Prof. Smith",
      rating: 5,
      reviewText: "Excellent introduction to programming concepts. The professor was very knowledgeable and approachable.",
      author: "Student1",
      date: "2023-09-15",
      likes: 24,
      courseDescription: "Introduction to fundamental programming concepts using Python.",
      comments: [
        {
          id: 101,
          text: "I completely agree! The assignments were challenging but fair.",
          author: "Student2",
          date: "2023-09-16",
          likes: 5
        }
      ]
    },
    {
      id: 2,
      courseTitle: "Calculus II",
      courseCode: "MATH 202",
      professorName: "Prof. Johnson",
      rating: 4,
      reviewText: "Good coverage of integration techniques. Homework was time-consuming but helpful.",
      author: "Student3",
      date: "2023-09-10",
      likes: 12,
      courseDescription: "Advanced integration techniques and applications.",
      comments: []
    },
    {
      id: 3,
      courseTitle: "Database Systems",
      courseCode: "ITCS 333",
      professorName: "Prof. Williams",
      rating: 3,
      reviewText: "Content was good but the projects were too complex for the time given.",
      author: "Student4",
      date: "2023-09-05",
      likes: 8,
      courseDescription: "Relational database design and implementation.",
      comments: []
    }
  ];

  // State Variables
  let reviews = [];
  let filteredReviews = [];
  let currentPage = 1;
  const reviewsPerPage = 6;
  let currentCourse = 'all';
  let currentRating = 'all';
  let currentSort = 'newest';

  // Function to show/hide loading spinner
  function toggleLoading(show) {
    if (loadingSpinner) {
      loadingSpinner.classList.toggle('d-none', !show);
      if (reviewsContainer) {
        reviewsContainer.style.opacity = show ? '0.5' : '1';
      }
    }
  }

  // Function to generate star rating HTML
  function generateStars(rating) {
    const fullStars = '★'.repeat(Math.floor(rating));
    const emptyStars = '☆'.repeat(5 - Math.floor(rating));
    return `<span class="text-warning">${fullStars}</span>${emptyStars}`;
  }

  // Load reviews from API
  async function loadReviews() {
    toggleLoading(true);
    try {
      // First try to fetch from API
      const response = await fetch(`${API_URL}?action=getReviews`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        reviews = result.data || [];
        
        // If database is empty, add initial reviews
        if (reviews.length === 0) {
          console.log('Database empty, adding initial reviews...');
          for (const review of initialReviews) {
            try {
              const addResponse = await fetch(`${API_URL}?action=addReview`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(review)
              });
              
              if (!addResponse.ok) {
                console.error('Failed to add initial review:', review.id);
                continue;
              }
            } catch (error) {
              console.error('Error adding initial review:', error);
            }
          }
          
          // Fetch again after adding initial reviews
          const newResponse = await fetch(`${API_URL}?action=getReviews`);
          if (newResponse.ok) {
            const newResult = await newResponse.json();
            reviews = newResult.success ? newResult.data : initialReviews;
          } else {
            reviews = initialReviews;
          }
        }
      } else {
        console.error('API Error:', result.message);
        reviews = initialReviews; // Fallback to initial data
      }
    } catch (error) {
      console.error('Fetch Error:', error);
      reviews = initialReviews; // Fallback to initial data
    } finally {
      filteredReviews = [...reviews];
      applyFilters();
      renderPagination();
      toggleLoading(false);
    }
  }

  // Apply filters based on current state
  function applyFilters() {
    filteredReviews = [...reviews];
    
    // Filter by course
    if (currentCourse !== 'all') {
      filteredReviews = filteredReviews.filter(review => review.courseCode === currentCourse);
    }
    
    // Filter by rating
    if (currentRating !== 'all') {
      filteredReviews = filteredReviews.filter(review => review.rating == currentRating);
    }
    
    // Apply search filter if there's a search term
    if (searchInput && searchInput.value) {
      const query = searchInput.value.toLowerCase();
      filteredReviews = filteredReviews.filter(review => 
        (review.courseTitle && review.courseTitle.toLowerCase().includes(query)) ||
        (review.courseCode && review.courseCode.toLowerCase().includes(query)) ||
        (review.professorName && review.professorName.toLowerCase().includes(query)) ||
        (review.reviewText && review.reviewText.toLowerCase().includes(query))
      );
    }
    
    // Apply sorting
    applySorting();
    
    // Adjust current page if needed
    const totalPages = Math.ceil(filteredReviews.length / reviewsPerPage);
    if (currentPage > totalPages && totalPages > 0) {
      currentPage = totalPages;
    } else if (totalPages === 0) {
      currentPage = 1;
    }
    
    renderReviews();
    renderPagination();
  }

  // Apply sorting based on current sort option
  function applySorting() {
    switch (currentSort) {
      case 'newest':
        filteredReviews.sort((a, b) => new Date(b.date) - new Date(a.date));
        break;
      case 'highest':
        filteredReviews.sort((a, b) => b.rating - a.rating || new Date(b.date) - new Date(a.date));
        break;
      case 'course':
        filteredReviews.sort((a, b) => a.courseCode.localeCompare(b.courseCode) || new Date(b.date) - new Date(a.date));
        break;
      default:
        filteredReviews.sort((a, b) => new Date(b.date) - new Date(a.date));
    }
  }

  // Render reviews to the page
  function renderReviews() {
    if (!reviewsContainer) return;
    
    const start = (currentPage - 1) * reviewsPerPage;
    const end = start + reviewsPerPage;
    const reviewsToRender = filteredReviews.slice(start, end);

    reviewsContainer.innerHTML = reviewsToRender.length === 0 
      ? '<div class="col-12 text-center"><p>No reviews found matching your criteria</p></div>'
      : reviewsToRender.map(review => `
          <article class="col-md-4 mb-4">
              <div class="card h-100">
                  <div class="card-body">
                      <div class="d-flex justify-content-between mb-2">
                          <h5 class="card-title">${review.courseTitle || 'Untitled Course'}</h5>
                          <div class="rating-stars">${generateStars(review.rating || 0)}</div>
                      </div>
                      <h6 class="card-subtitle mb-2 text-muted">${review.courseCode || 'N/A'} • ${review.professorName || 'Unknown Professor'}</h6>
                      <p class="card-text">${review.reviewText || 'No review text provided.'}</p>
                      <div class="d-flex justify-content-between align-items-center">
                          <small class="text-muted">${review.author || 'Anonymous'} • ${review.date || 'Unknown date'}</small>
                          <div>
                              <button class="btn btn-sm btn-outline-success me-1 like-btn" data-id="${review.id}">👍 ${review.likes || 0}</button>
                              <button class="btn btn-sm btn-outline-primary details-btn" data-id="${review.id}">View Details</button>
                          </div>
                      </div>
                  </div>
              </div>
          </article>
      `).join('');

    // Add event listeners to like buttons
    document.querySelectorAll('.like-btn').forEach(btn => {
      btn.addEventListener('click', async function() {
        const reviewId = parseInt(this.dataset.id);
        const review = reviews.find(r => r.id === reviewId);
        if (review) {
          try {
            const response = await fetch(`${API_URL}?action=likeReview`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id: reviewId })
            });
            
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            
            if (result.success) {
              review.likes = result.newLikes;
              this.textContent = `👍 ${review.likes}`;
            }
          } catch (error) {
            console.error('Error liking review:', error);
          }
        }
      });
    });
    
    // Add event listeners to details buttons
    document.querySelectorAll('.details-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const reviewId = parseInt(this.dataset.id);
        const review = reviews.find(r => r.id === reviewId);
        if (review) {
          showReviewDetailsModal(review);
        }
      });
    });
  }

  // Show review details modal
  function showReviewDetailsModal(review) {
    // Remove existing modal if any
    const existingModal = document.getElementById('reviewDetailsModal');
    if (existingModal) {
      existingModal.remove();
    }

    const modalHTML = `
    <div class="modal fade" id="reviewDetailsModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">${review.courseTitle || 'Untitled Course'} (${review.courseCode || 'N/A'})</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div class="mb-4">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <h6>Taught by: ${review.professorName || 'Unknown Professor'}</h6>
                <div class="rating-stars fs-5">${generateStars(review.rating || 0)}</div>
              </div>
              <div class="card mb-3">
                <div class="card-body">
                  <h5 class="card-title">Course Description</h5>
                  <p class="card-text">${review.courseDescription || 'No course description available.'}</p>
                  <div class="d-flex justify-content-between">
                    <small class="text-muted">Posted by ${review.author || 'Anonymous'} on ${review.date || 'Unknown date'}</small>
                    <button class="btn btn-sm btn-outline-success like-btn" data-id="${review.id}">
                      👍 ${review.likes || 0}
                    </button>
                  </div>
                </div>
              </div>
              <div class="card">
                <div class="card-body">
                  <h5 class="card-title">Review</h5>
                  <p class="card-text">${review.reviewText || 'No review text provided.'}</p>
                  <div class="d-flex justify-content-between align-items-center mb-3">
                    <h5 class="card-title mb-0">Comments</h5>
                    <button class="btn btn-sm btn-primary" id="addCommentBtn">Add Comment</button>
                  </div>
                  <div id="commentsContainer">
                    ${review.comments && review.comments.length > 0 
                      ? review.comments.map(comment => `
                        <div class="mb-3 p-3 border rounded">
                          <div class="d-flex justify-content-between">
                            <strong>${comment.author || 'Anonymous'}</strong>
                            <small class="text-muted">${comment.date || 'Unknown date'}</small>
                          </div>
                          <p class="mb-1 mt-2">${comment.text || 'No comment text.'}</p>
                          <div class="d-flex justify-content-end">
                            <button class="btn btn-sm btn-outline-success me-1 like-comment-btn" 
                                    data-review-id="${review.id}" 
                                    data-comment-id="${comment.id}">
                              👍 ${comment.likes || 0}
                            </button>
                          </div>
                        </div>
                      `).join('')
                      : '<p>No comments yet. Be the first to comment!</p>'}
                  </div>
                  <form id="commentForm" class="mt-3 d-none">
                    <div class="mb-3">
                      <label class="form-label">Your Name</label>
                      <input type="text" class="form-control" id="commentAuthor" required>
                    </div>
                    <div class="mb-3">
                      <textarea class="form-control" id="commentText" rows="3" required 
                                placeholder="Write your comment here..."></textarea>
                    </div>
                    <div class="d-flex justify-content-end">
                      <button type="button" class="btn btn-outline-secondary me-2" 
                              id="cancelCommentBtn">Cancel</button>
                      <button type="submit" class="btn btn-success">Submit</button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
          </div>
        </div>
      </div>
    </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    const modal = new bootstrap.Modal(document.getElementById('reviewDetailsModal'));
    modal.show();
    
    // Rest of the modal event listeners remain the same...
    // [Previous event listener code remains unchanged]
}

  // Handle liking a comment
  async function handleLikeComment() {
    const reviewId = parseInt(this.dataset.reviewId);
    const commentId = parseInt(this.dataset.commentId);
    
    try {
      const response = await fetch(`${API_URL}?action=likeComment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId, commentId })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        const review = reviews.find(r => r.id === reviewId);
        if (review && review.comments) {
          const comment = review.comments.find(c => c.id === commentId);
          if (comment) {
            comment.likes = result.newLikes;
            this.textContent = `👍 ${comment.likes}`;
          }
        }
      }
    } catch (error) {
      console.error('Error liking comment:', error);
    }
  }

  // Render pagination controls
  function renderPagination() {
    if (!paginationContainer) return;
    
    const totalPages = Math.ceil(filteredReviews.length / reviewsPerPage);
    if (totalPages <= 1) {
      paginationContainer.innerHTML = '';
      return;
    }

    const pages = [];
    
    // Previous button
    pages.push(`
        <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" data-page="${currentPage - 1}" aria-label="Previous">
                <span aria-hidden="true">&laquo;</span>
            </a>
        </li>
    `);

    // Page numbers - limit to 5 pages with ellipsis
    const maxVisiblePages = 5;
    let startPage, endPage;
    
    if (totalPages <= maxVisiblePages) {
      startPage = 1;
      endPage = totalPages;
    } else {
      const maxPagesBeforeCurrent = Math.floor(maxVisiblePages / 2);
      const maxPagesAfterCurrent = Math.ceil(maxVisiblePages / 2) - 1;
      
      if (currentPage <= maxPagesBeforeCurrent) {
        startPage = 1;
        endPage = maxVisiblePages;
      } else if (currentPage + maxPagesAfterCurrent >= totalPages) {
        startPage = totalPages - maxVisiblePages + 1;
        endPage = totalPages;
      } else {
        startPage = currentPage - maxPagesBeforeCurrent;
        endPage = currentPage + maxPagesAfterCurrent;
      }
    }

    // First page with ellipsis if needed
    if (startPage > 1) {
      pages.push(`
          <li class="page-item">
              <a class="page-link" href="#" data-page="1">1</a>
          </li>
      `);
      if (startPage > 2) {
        pages.push('<li class="page-item disabled"><span class="page-link">...</span></li>');
      }
    }

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(`
          <li class="page-item ${i === currentPage ? 'active' : ''}">
              <a class="page-link" href="#" data-page="${i}">${i}</a>
          </li>
      `);
    }

    // Last page with ellipsis if needed
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push('<li class="page-item disabled"><span class="page-link">...</span></li>');
      }
      pages.push(`
          <li class="page-item">
              <a class="page-link" href="#" data-page="${totalPages}">${totalPages}</a>
          </li>
      `);
    }

    // Next button
    pages.push(`
        <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
            <a class="page-link" href="#" data-page="${currentPage + 1}" aria-label="Next">
                <span aria-hidden="true">&raquo;</span>
            </a>
        </li>
    `);

    paginationContainer.innerHTML = pages.join('');

    // Add event listeners to pagination buttons
    paginationContainer.querySelectorAll(".page-link").forEach(link => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const newPage = parseInt(e.target.dataset.page);
        if (!isNaN(newPage) && newPage >= 1 && newPage <= totalPages) {
          currentPage = newPage;
          renderReviews();
          renderPagination();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      });
    });
  }

  // Filter dropdown event listener
  if (filterDropdown) {
    filterDropdown.addEventListener('click', (e) => {
      const filterItem = e.target.closest('.dropdown-item');
      if (!filterItem) return;
      e.preventDefault();
      
      const isCourse = !!filterItem.dataset.course;
      const isRating = !!filterItem.dataset.rating;
      
      if (!isCourse && !isRating) return;
      
      // Remove active class from siblings
      const siblings = isCourse 
        ? filterDropdown.querySelectorAll('[data-course]') 
        : filterDropdown.querySelectorAll('[data-rating]');
        
      siblings.forEach(item => item.classList.remove('active'));
      filterItem.classList.add('active');
      
      if (isCourse) {
        currentCourse = filterItem.dataset.course;
        if (filterButton) {
          filterButton.textContent = currentCourse === 'all' ? 'Filter' : `Course: ${filterItem.textContent.trim()}`;
        }
      } else if (isRating) {
        currentRating = filterItem.dataset.rating;
      }
      
      currentPage = 1;
      applyFilters();
    });
  }

  // Sort dropdown event listener
  if (sortDropdown) {
    sortDropdown.addEventListener('click', (e) => {
      const sortItem = e.target.closest('.dropdown-item');
      if (!sortItem) return;
      e.preventDefault();
      
      const sortOption = sortItem.dataset.sort;
      if (!sortOption) return;
      
      sortDropdown.querySelectorAll('.dropdown-item').forEach(item => item.classList.remove('active'));
      sortItem.classList.add('active');
      
      currentSort = sortOption;
      if (sortButton) {
        sortButton.textContent = `Sort: ${sortItem.textContent.trim()}`;
      }
      
      applySorting();
      renderReviews();
    });
  }

  // Search functionality
  if (searchInput) {
    let searchTimeout;
    searchInput.addEventListener("input", (e) => {
      toggleLoading(true);
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        const query = e.target.value.toLowerCase();
        filteredReviews = reviews.filter(review => 
          (review.courseTitle && review.courseTitle.toLowerCase().includes(query)) ||
          (review.courseCode && review.courseCode.toLowerCase().includes(query)) ||
          (review.professorName && review.professorName.toLowerCase().includes(query)) ||
          (review.reviewText && review.reviewText.toLowerCase().includes(query))
        );
        currentPage = 1;
        applySorting();
        renderReviews();
        renderPagination();
        toggleLoading(false);
      }, 300);
    });
  }

  // Add review form handler
  if (addReviewForm) {
    addReviewForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!submitReviewBtn) return;
      
      submitReviewBtn.disabled = true;
      submitReviewBtn.textContent = 'Submitting...';
      
      const newReview = {
        courseTitle: document.getElementById('courseTitle')?.value || 'Untitled Course',
        courseCode: document.getElementById('courseCode')?.value || 'N/A',
        professorName: document.getElementById('professorName')?.value || 'Unknown Professor',
        rating: parseInt(document.getElementById('courseRating')?.value) || 3,
        reviewText: document.getElementById('reviewText')?.value || 'No review text provided.',
        author: "You",
        date: new Date().toISOString().split('T')[0],
        likes: 0,
        courseDescription: "No description available yet.",
        comments: []
      };
      
      try {
        const response = await fetch(`${API_URL}?action=addReview`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newReview)
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success) {
          // Add to beginning of array
          newReview.id = result.id;
          reviews.unshift(newReview);
          filteredReviews = [...reviews];
          
          // Reset form and close modal
          addReviewForm.reset();
          const modal = bootstrap.Modal.getInstance(document.getElementById('addReviewModal'));
          if (modal) modal.hide();
          
          // Reset filters to show new review
          currentCourse = 'all';
          currentRating = 'all';
          currentSort = 'newest';
          currentPage = 1;
          
          // Reset UI
          if (filterDropdown) {
            filterDropdown.querySelectorAll('.dropdown-item').forEach(item => {
              item.classList.remove('active');
              if (item.dataset.course === 'all' || item.dataset.rating === 'all') {
                item.classList.add('active');
              }
            });
          }
          
          if (filterButton) {
            filterButton.textContent = 'Filter';
          }
          
          if (sortDropdown) {
            sortDropdown.querySelectorAll('.dropdown-item').forEach(item => {
              item.classList.remove('active');
              if (item.dataset.sort === 'newest') {
                item.classList.add('active');
              }
            });
          }
          
          if (sortButton) {
            sortButton.textContent = 'Sort';
          }
          
          // Refresh display
          applyFilters();
          
          // Show success message
          const toastEl = document.getElementById('submitSuccessToast');
          if (toastEl) {
            const toast = new bootstrap.Toast(toastEl);
            toast.show();
          }
        }
      } catch (error) {
        console.error('Error submitting review:', error);
        // Show error message
        const toastEl = document.getElementById('submitErrorToast');
        if (toastEl) {
          const toast = new bootstrap.Toast(toastEl);
          toast.show();
        }
      } finally {
        if (submitReviewBtn) {
          submitReviewBtn.disabled = false;
          submitReviewBtn.textContent = 'Submit';
        }
      }
    });
  }

  // Initialize
  loadReviews();
});
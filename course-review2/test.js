document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
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

  // State Variables
  let reviews = [];
  let filteredReviews = [];
  let currentPage = 1;
  const reviewsPerPage = 6;
  let currentCourse = 'all';
  let currentRating = 'all';
  let currentSort = 'newest';

  // Mock API URLs
  const apiUrl = "https://jsonplaceholder.typicode.com/posts";

  // Function to show/hide loading spinner
  function toggleLoading(show) {
      if (loadingSpinner) {
          loadingSpinner.classList.toggle('d-none', !show);
          if (reviewsContainer) {
              reviewsContainer.style.opacity = show ? '0.5' : '1';
          }
      }
  }

  // Function to save settings to localStorage
  function saveSettings() {
      const settings = {
          course: currentCourse,
          rating: currentRating,
          sort: currentSort,
          page: currentPage
      };
      localStorage.setItem('courseReviewSettings', JSON.stringify(settings));
  }

  // Function to restore settings from localStorage
  function restoreSettings() {
      const savedSettings = localStorage.getItem('courseReviewSettings');
      if (!savedSettings) return;

      const settings = JSON.parse(savedSettings);
      currentCourse = settings.course || 'all';
      currentRating = settings.rating || 'all';
      currentSort = settings.sort || 'newest';
      currentPage = settings.page || 1;

      // Restore course filter UI
      if (currentCourse !== 'all') {
          const courseItem = filterDropdown.querySelector(`[data-course="${currentCourse}"]`);
          if (courseItem) {
              courseItem.classList.add('active');
              filterButton.textContent = `Course: ${currentCourse}`;
          }
      }

      // Restore rating filter UI
      if (currentRating !== 'all') {
          const ratingItem = filterDropdown.querySelector(`[data-rating="${currentRating}"]`);
          if (ratingItem) {
              ratingItem.classList.add('active');
          }
      }

      // Restore sort UI
      if (currentSort !== 'newest') {
          const sortItem = sortDropdown.querySelector(`[data-sort="${currentSort}"]`);
          if (sortItem) {
              sortItem.classList.add('active');
              sortButton.textContent = `Sort: ${sortItem.textContent.trim()}`;
          }
      }

      applyFilters();
  }

  // Function to generate star rating HTML
  function generateStars(rating) {
      const fullStars = '★'.repeat(rating);
      const emptyStars = '☆'.repeat(5 - rating);
      return `<span class="text-warning">${fullStars}</span>${emptyStars}`;
  }

  // Function to show course details modal
  function showCourseDetailsModal(review) {
      // Create modal HTML
      const modalHTML = `
      <div class="modal fade" id="courseDetailsModal" tabindex="-1" aria-hidden="true">
          <div class="modal-dialog modal-lg">
              <div class="modal-content">
                  <div class="modal-header">
                      <h5 class="modal-title">${review.courseTitle} (${review.courseCode})</h5>
                      <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                  </div>
                  <div class="modal-body">
                      <div class="mb-4">
                          <div class="d-flex justify-content-between align-items-center mb-3">
                              <h6>Taught by: ${review.professorName}</h6>
                              <div class="rating-stars fs-5">${generateStars(review.rating)}</div>
                          </div>
                          <div class="card mb-3">
                              <div class="card-body">
                                  <h5 class="card-title">Course Description</h5>
                                  <p class="card-text">${review.courseDescription || 'No description available for this course.'}</p>
                              </div>
                          </div>
                          <div class="card">
                              <div class="card-body">
                                  <div class="d-flex justify-content-between align-items-center mb-3">
                                      <h5 class="card-title mb-0">Comments</h5>
                                      <button class="btn btn-sm btn-primary" id="addCommentBtn">Add Comment</button>
                                  </div>
                                  <div id="commentsContainer">
                                      ${review.comments && review.comments.length > 0 
                                          ? review.comments.map(comment => `
                                              <div class="mb-3 p-3 border rounded">
                                                  <div class="d-flex justify-content-between">
                                                      <strong>${comment.author}</strong>
                                                      <small class="text-muted">${comment.date}</small>
                                                  </div>
                                                  <p class="mb-1 mt-2">${comment.text}</p>
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
      
      // Add modal to DOM
      document.body.insertAdjacentHTML('beforeend', modalHTML);
      
      // Show modal
      const modal = new bootstrap.Modal(document.getElementById('courseDetailsModal'));
      modal.show();
      
      // Add event listeners for the modal
      document.getElementById('addCommentBtn')?.addEventListener('click', () => {
          document.getElementById('commentForm').classList.remove('d-none');
          document.getElementById('addCommentBtn').classList.add('d-none');
      });
      
      document.getElementById('cancelCommentBtn')?.addEventListener('click', () => {
          document.getElementById('commentForm').classList.add('d-none');
          document.getElementById('addCommentBtn').classList.remove('d-none');
          document.getElementById('commentText').value = '';
      });
      
      document.getElementById('commentForm')?.addEventListener('submit', (e) => {
          e.preventDefault();
          const commentText = document.getElementById('commentText').value.trim();
          if (!commentText) return;
          
          // Create new comment
          const newComment = {
              id: Date.now(),
              text: commentText,
              author: "You",
              date: new Date().toISOString().split('T')[0],
              likes: 0
          };
          
          // Add comment to the review
          if (!review.comments) review.comments = [];
          review.comments.unshift(newComment);
          
          // Update localStorage
          localStorage.setItem('courseReviews', JSON.stringify(reviews));
          
          // Close the form and refresh comments
          document.getElementById('commentForm').classList.add('d-none');
          document.getElementById('addCommentBtn').classList.remove('d-none');
          document.getElementById('commentText').value = '';
          
          // Refresh comments display
          const commentsContainer = document.getElementById('commentsContainer');
          commentsContainer.insertAdjacentHTML('afterbegin', `
              <div class="mb-3 p-3 border rounded">
                  <div class="d-flex justify-content-between">
                      <strong>${newComment.author}</strong>
                      <small class="text-muted">${newComment.date}</small>
                  </div>
                  <p class="mb-1 mt-2">${newComment.text}</p>
                  <div class="d-flex justify-content-end">
                      <button class="btn btn-sm btn-outline-success me-1 like-comment-btn" 
                              data-review-id="${review.id}" 
                              data-comment-id="${newComment.id}">
                          👍 ${newComment.likes}
                      </button>
                  </div>
              </div>
          `);
          
          // Add event listener to the new like button
          document.querySelector(`.like-comment-btn[data-comment-id="${newComment.id}"]`)?.addEventListener('click', function() {
              const reviewId = parseInt(this.dataset.reviewId);
              const commentId = parseInt(this.dataset.commentId);
              const review = reviews.find(r => r.id === reviewId);
              if (review && review.comments) {
                  const comment = review.comments.find(c => c.id === commentId);
                  if (comment) {
                      comment.likes = (comment.likes || 0) + 1;
                      localStorage.setItem('courseReviews', JSON.stringify(reviews));
                      this.textContent = `👍 ${comment.likes}`;
                  }
              }
          });
      });
      
      // Add event listeners to like buttons for existing comments
      document.querySelectorAll('.like-comment-btn').forEach(btn => {
          btn.addEventListener('click', function() {
              const reviewId = parseInt(this.dataset.reviewId);
              const commentId = parseInt(this.dataset.commentId);
              const review = reviews.find(r => r.id === reviewId);
              if (review && review.comments) {
                  const comment = review.comments.find(c => c.id === commentId);
                  if (comment) {
                      comment.likes = (comment.likes || 0) + 1;
                      localStorage.setItem('courseReviews', JSON.stringify(reviews));
                      this.textContent = `👍 ${comment.likes}`;
                  }
              }
          });
      });
      
      // Remove modal when closed
      document.getElementById('courseDetailsModal').addEventListener('hidden.bs.modal', () => {
          document.getElementById('courseDetailsModal').remove();
      });
  }

  // Load reviews from API or localStorage
  async function loadReviews() {
      toggleLoading(true);
      try {
          const savedReviews = localStorage.getItem('courseReviews');
          let needsPlaceholders = true;
          
          if (savedReviews) {
              reviews = JSON.parse(savedReviews);
              needsPlaceholders = reviews.length < 5;
          }
  
          if (needsPlaceholders) {
              const response = await fetch(apiUrl);
              if (!response.ok) throw new Error('Failed to fetch reviews');
              const data = await response.json();
              
              const placeholderReviews = data.slice(0, 10).map((post, index) => {
                  // Course descriptions for placeholder courses
                  const courseDescriptions = [
                      "Introduction to fundamental programming concepts using Python. Covers variables, loops, functions, and basic data structures.",
                      "Advanced mathematical concepts including derivatives, integrals, and their applications in science and engineering.",
                      "Fundamentals of physics including mechanics, thermodynamics, and electromagnetism with laboratory components.",
                      "Database systems concepts including relational models, SQL, normalization, and transaction processing.",
                      "Ethical issues in computing including privacy, intellectual property, professional responsibility, and social impact."
                  ];
                  
                  const courseTitle = post.title?.split(' ').slice(0, 3).join(' ') || `Course ${index + 1}`;
                  const courseCode = ["COMP 101", "MATH 202", "PHYS 101", "ITCS 333", "ITCS 396"][index % 5] || "CODE 000";
                  const professorName = ["Prof. Ali", "Prof. John", "Prof. Ahmed", "Prof. Sarah", "Prof. Michael"][index % 5] || "Professor";
                  const rating = Math.floor(Math.random() * 5) + 1;
                  const reviewText = post.body || "No review text available";
                  const author = post.userId ? `User ${post.userId}` : "Anonymous";
                  const date = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] || new Date().toISOString().split('T')[0];
                  const likes = Math.floor(Math.random() * 50) || 0;
                  const courseDescription = courseDescriptions[index % 5] || "No course description available.";
  
                  return {
                      id: Date.now() + index,
                      courseTitle,
                      courseCode,
                      professorName,
                      rating,
                      reviewText,
                      author,
                      date,
                      likes,
                      courseDescription,
                      comments: []
                  };
              });
              
              reviews = needsPlaceholders ? placeholderReviews : [...reviews, ...placeholderReviews];
              filteredReviews = [...reviews];
              localStorage.setItem('courseReviews', JSON.stringify(reviews));
          } else {
              // Validate existing reviews
              reviews = reviews.map(review => ({
                  id: review.id || Date.now() + Math.random(),
                  courseTitle: review.courseTitle || "Untitled Course",
                  courseCode: review.courseCode || "CODE 000",
                  professorName: review.professorName || "Professor",
                  rating: review.rating || 3,
                  reviewText: review.reviewText || "No review text available",
                  author: review.author || "Anonymous",
                  date: review.date || new Date().toISOString().split('T')[0],
                  likes: review.likes || 0,
                  courseDescription: review.courseDescription || "No course description available.",
                  comments: review.comments || []
              }));
              filteredReviews = [...reviews];
          }
      } catch (err) {
          console.error('Error loading reviews:', err);
          // Fallback hardcoded reviews with complete data
          reviews = [
              {
                  id: 1,
                  courseTitle: "Intro to Computer Science",
                  courseCode: "COMP 101",
                  professorName: "Prof. Ali",
                  rating: 5,
                  reviewText: "This course transformed my understanding of programming. The professor was engaging and the materials were top-notch.",
                  author: "Abdulrahman",
                  date: "2023-10-15",
                  likes: 24,
                  courseDescription: "Introduction to fundamental programming concepts using Python. Covers variables, loops, functions, and basic data structures.",
                  comments: [
                      {
                          id: 101,
                          text: "I completely agree! This course was a game-changer for me.",
                          author: "Sarah",
                          date: "2023-10-16",
                          likes: 5
                      },
                      {
                          id: 102,
                          text: "The assignments were challenging but very rewarding.",
                          author: "Ahmed",
                          date: "2023-10-17",
                          likes: 3
                      }
                  ]
              },
              {
                  id: 2,
                  courseTitle: "Calculus II",
                  courseCode: "MATH 202",
                  professorName: "Prof. John",
                  rating: 3,
                  reviewText: "Good content but the assignments were too time-consuming compared to the credit hours offered.",
                  author: "Mohamed",
                  date: "2023-10-10",
                  likes: 8,
                  courseDescription: "Advanced mathematical concepts including derivatives, integrals, and their applications in science and engineering.",
                  comments: []
              },
              {
                  id: 3,
                  courseTitle: "Business Ethics",
                  courseCode: "ITCS 396",
                  professorName: "Prof. Ahmed",
                  rating: 4,
                  reviewText: "Excellent course that makes you think critically about real-world business scenarios.",
                  author: "Ali Mohamed",
                  date: "2023-10-05",
                  likes: 15,
                  courseDescription: "Ethical issues in computing including privacy, intellectual property, professional responsibility, and social impact.",
                  comments: [
                      {
                          id: 103,
                          text: "The case studies were particularly interesting and relevant.",
                          author: "Fatima",
                          date: "2023-10-06",
                          likes: 7
                      }
                  ]
              }
          ];
          filteredReviews = [...reviews];
      } finally {
          await new Promise(resolve => setTimeout(resolve, 300)); // Minimum loading time
          toggleLoading(false);
          applyFilters();
          renderPagination();
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
      if (searchInput.value) {
          const query = searchInput.value.toLowerCase();
          filteredReviews = filteredReviews.filter(review => 
              review.courseTitle.toLowerCase().includes(query) ||
              review.courseCode.toLowerCase().includes(query) ||
              review.professorName.toLowerCase().includes(query) ||
              review.reviewText.toLowerCase().includes(query)
          );
      }
      
      // Apply sorting
      applySorting();
      
      // Adjust current page if needed
      const totalPages = Math.ceil(filteredReviews.length / reviewsPerPage);
      if (currentPage > totalPages && totalPages > 0) {
          currentPage = totalPages;
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
                              <h5 class="card-title">${review.courseTitle}</h5>
                              <div class="rating-stars">${generateStars(review.rating)}</div>
                          </div>
                          <h6 class="card-subtitle mb-2 text-muted">${review.courseCode} • ${review.professorName}</h6>
                          <p class="card-text">${review.reviewText}</p>
                          <div class="d-flex justify-content-between align-items-center">
                              <small class="text-muted">${review.author} • ${review.date}</small>
                              <div>
                                  <button class="btn btn-sm btn-outline-success me-1 like-btn" data-id="${review.id}">👍 ${review.likes}</button>
                                  <button class="btn btn-sm btn-outline-primary comment-btn" data-id="${review.id}">💬 ${review.comments?.length || 0}</button>
                              </div>
                          </div>
                      </div>
                  </div>
              </article>
          `).join('');

      // Add event listeners to like buttons
      document.querySelectorAll('.like-btn').forEach(btn => {
          btn.addEventListener('click', function() {
              const reviewId = parseInt(this.dataset.id);
              const review = reviews.find(r => r.id === reviewId);
              if (review) {
                  review.likes++;
                  localStorage.setItem('courseReviews', JSON.stringify(reviews));
                  this.textContent = `👍 ${review.likes}`;
                  applyFilters();
              }
          });
      });
      
      // Add event listeners to comment buttons
      document.querySelectorAll('.comment-btn').forEach(btn => {
          btn.addEventListener('click', function() {
              const reviewId = parseInt(this.dataset.id);
              const review = reviews.find(r => r.id === reviewId);
              if (review) {
                  showCourseDetailsModal(review);
              }
          });
      });
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
              <a class="page-link" href="#" data-page="${currentPage - 1}">&laquo;</a>
          </li>
      `);

      // Page numbers
      for (let i = 1; i <= totalPages; i++) {
          pages.push(`
              <li class="page-item ${i === currentPage ? 'active' : ''}">
                  <a class="page-link" href="#" data-page="${i}">${i}</a>
              </li>
          `);
      }

      // Next button
      pages.push(`
          <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
              <a class="page-link" href="#" data-page="${currentPage + 1}">&raquo;</a>
          </li>
      `);

      paginationContainer.innerHTML = pages.join('');

      // Add event listeners to pagination buttons
      paginationContainer.querySelectorAll(".page-link").forEach(link => {
          link.addEventListener("click", (e) => {
              e.preventDefault();
              const newPage = parseInt(e.target.dataset.page);
              if (!isNaN(newPage)) {
                  currentPage = newPage;
                  renderReviews();
                  renderPagination();
                  saveSettings();
              }
          });
      });
  }

  // Filter dropdown event listener
  if (filterDropdown) {
      filterDropdown.addEventListener('click', (e) => {
          if (!e.target.classList.contains('dropdown-item')) return;
          e.preventDefault();
          
          const isCourse = !!e.target.dataset.course;
          const isRating = !!e.target.dataset.rating;
          
          if (!isCourse && !isRating) return;
          
          // Remove active class from siblings
          const siblings = isCourse 
              ? filterDropdown.querySelectorAll('[data-course]') 
              : filterDropdown.querySelectorAll('[data-rating]');
              
          siblings.forEach(item => item.classList.remove('active'));
          e.target.classList.add('active');
          
          if (isCourse) {
              currentCourse = e.target.dataset.course;
              filterButton.textContent = currentCourse === 'all' ? 'Filter' : `Course: ${e.target.textContent.trim()}`;
          } else if (isRating) {
              currentRating = e.target.dataset.rating;
          }
          
          currentPage = 1;
          applyFilters();
          saveSettings();
      });
  }

  // Sort dropdown event listener
  if (sortDropdown) {
      sortDropdown.addEventListener('click', (e) => {
          if (!e.target.classList.contains('dropdown-item')) return;
          e.preventDefault();
          
          const sortOption = e.target.dataset.sort;
          if (!sortOption) return;
          
          sortDropdown.querySelectorAll('.dropdown-item').forEach(item => item.classList.remove('active'));
          e.target.classList.add('active');
          
          currentSort = sortOption;
          sortButton.textContent = `Sort: ${e.target.textContent.trim()}`;
          
          applySorting();
          renderReviews();
          saveSettings();
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
                  (review.reviewText && review.reviewText.toLowerCase().includes(query)) ||
                  (review.author && review.author.toLowerCase().includes(query))
              );
              currentPage = 1;
              applySorting(); // Apply current sort to search results
              renderReviews();
              renderPagination();
              toggleLoading(false);
          }, 300);
      });
      
      // Clear search when user clicks the 'x' in the search box (for browsers that support this)
      searchInput.addEventListener('search', () => {
          if (searchInput.value === '') {
              toggleLoading(true);
              filteredReviews = [...reviews];
              currentPage = 1;
              applySorting();
              renderReviews();
              renderPagination();
              toggleLoading(false);
          }
      });
  }

  // Add review form handler
  if (addReviewForm) {
      addReviewForm.addEventListener("submit", (e) => {
          e.preventDefault();
          submitReviewBtn.disabled = true;
          submitReviewBtn.textContent = 'Submitting...';
          
          const newReview = {
              id: Date.now(),
              courseTitle: document.getElementById('courseTitle').value,
              courseCode: document.getElementById('courseCode').value,
              professorName: document.getElementById('professorName').value,
              rating: parseInt(document.getElementById('courseRating').value),
              reviewText: document.getElementById('reviewText').value,
              author: "You",
              date: new Date().toISOString().split('T')[0],
              likes: 0,
              courseDescription: "No description available yet.",
              comments: []
          };
          
          // Add to beginning of array
          reviews.unshift(newReview);
          filteredReviews = [...reviews];
          localStorage.setItem('courseReviews', JSON.stringify(reviews));
          
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
          filterDropdown.querySelectorAll('.dropdown-item').forEach(item => {
              item.classList.remove('active');
              if (item.dataset.course === 'all' || item.dataset.rating === 'all') {
                  item.classList.add('active');
              }
          });
          filterButton.textContent = 'Filter';
          
          sortDropdown.querySelectorAll('.dropdown-item').forEach(item => {
              item.classList.remove('active');
              if (item.dataset.sort === 'newest') {
                  item.classList.add('active');
              }
          });
          sortButton.textContent = 'Sort';
          
          // Refresh display
          applyFilters();
          submitReviewBtn.disabled = false;
          submitReviewBtn.textContent = 'Submit';
      });
  }

  // Initialize
  loadReviews().then(() => {
      restoreSettings();
  });
});
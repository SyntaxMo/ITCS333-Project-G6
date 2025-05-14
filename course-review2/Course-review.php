<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Course Reviews</title>
    <!-- Bootstrap CSS -->
    <link href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.3/css/bootstrap.min.css" rel="stylesheet">
    <link href="Style.Css" rel="stylesheet">
    <script defer src="https://kit.fontawesome.com/387937a7f8.js" crossorigin="anonymous"></script>
    <script defer src="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.3/js/bootstrap.bundle.min.js"></script>
</head>
<body>
<!-- Header -->
<header class="p-3 navbar navbar-expand-md navbar-dark bg-dark">
    <div class="container-fluid">
        <a class="navbar-brand" href="../index.php">
            <img src="Logo.png" alt="Logo" width="30" height="24">
        </a>
        <button class="navbar-toggler ms-auto" data-bs-toggle="collapse" data-bs-target="#navbarNavAltMarkup">
            <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNavAltMarkup">
            <div class="navbar-nav mr-auto">
                <a class="nav-link" href="../index.php">Home</a>
                <a class="nav-link" href="../Campus News/Campus News.php">Campus News</a>
                <a class="nav-link active" href="../course-review2/Course-Review.php">Course Review</a>
                <a class="nav-link" href="../Events Calendar/Events-Calender.php">Events Calendar</a>
                <a class="nav-link" href="../Phase1_Course-Notes/Course-Notes.php">Course Notes</a>
                <a class="nav-link" href="../Phase1-ClubActivities/Phase1-ClubActivity/ClubActivity.php">Club Activities</a>
                <a class="nav-link" href="../studente Marketplace/StudentMarketplace.php">Student Marketplace</a>
            </div>
        </div>
    </div>
</header>

<!-- Main Content -->
<main class="container mt-4">
    <!-- Search & Filters -->
    <section class="mb-4">
        <div class="d-flex justify-content-start align-items-center w-100" style="flex-wrap: nowrap;">
            <input type="search" id="searchInput" class="form-control" placeholder="Search reviews..."
                   style="border-radius: 0.375rem 0 0 0.375rem; border-right: none;">

            <!-- Filter Dropdown -->
            <div class="dropdown flex-shrink-0" style="margin-left: -1px;">
                <button class="btn btn-outline-secondary dropdown-toggle h-100" type="button"
                        id="filterDropdown" data-bs-toggle="dropdown" style="border-radius: 0; border-left: none; border-right: none;">
                    Filter
                </button>
                <ul class="dropdown-menu" aria-labelledby="filterDropdown">
                    <li><h6 class="dropdown-header">Courses</h6></li>
                    <li><a class="dropdown-item" href="#" data-course="all">All Courses</a></li>
                    <li><a class="dropdown-item" href="#" data-course="COMP 101">COMP 101</a></li>
                    <li><a class="dropdown-item" href="#" data-course="MATH 202">MATH 202</a></li>
                    <li><a class="dropdown-item" href="#" data-course="PHYS 101">PHYS 101</a></li>
                    <li><a class="dropdown-item" href="#" data-course="ITCS 333">ITCS 333</a></li>
                    <li><a class="dropdown-item" href="#" data-course="ITCS 396">ITCS 396</a></li>
                    <li><hr class="dropdown-divider"></li>
                    <li><h6 class="dropdown-header">Rating</h6></li>
                    <li><a class="dropdown-item" href="#" data-rating="all">All Ratings</a></li>
                    <li><a class="dropdown-item" href="#" data-rating="5">★★★★★ (5/5)</a></li>
                    <li><a class="dropdown-item" href="#" data-rating="4">★★★★☆ (4/5)</a></li>
                    <li><a class="dropdown-item" href="#" data-rating="3">★★★☆☆ (3/5)</a></li>
                    <li><a class="dropdown-item" href="#" data-rating="2">★★☆☆☆ (2/5)</a></li>
                    <li><a class="dropdown-item" href="#" data-rating="1">★☆☆☆☆ (1/5)</a></li>
                </ul>
            </div>

            <!-- Sort Dropdown -->
            <div class="dropdown flex-shrink-0" style="margin-left: -1px;">
                <button class="btn btn-outline-secondary dropdown-toggle h-100" type="button"
                        id="sortDropdown" data-bs-toggle="dropdown" style="border-radius: 0; border-left: none; border-right: none;">
                    Sort
                </button>
                <ul class="dropdown-menu" aria-labelledby="sortDropdown">
                    <li><a class="dropdown-item" href="#" data-sort="newest">Newest First</a></li>
                    <li><a class="dropdown-item" href="#" data-sort="highest">Highest Rated</a></li>
                    <li><a class="dropdown-item" href="#" data-sort="course">Course Code</a></li>
                </ul>
            </div>

            <!-- Add New Button -->
            <button class="btn btn-primary flex-shrink-0" data-bs-toggle="modal"
                    data-bs-target="#addReviewModal" type="button"
                    style="border-radius: 0 0.375rem 0.375rem 0; margin-left: -1px; border-left: none;">
                Add Review
            </button>
        </div>
    </section>

    <!-- Reviews Grid -->
    <section>
        <h3>Course Reviews:</h3>
        <!-- Loading Spinner -->
        <div id="loadingSpinner" class="text-center d-none">
            <div class="spinner-border text-success" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-2">Loading reviews...</p>
        </div>
        <div class="row" id="reviewsContainer">
            <!-- Reviews will be loaded here dynamically -->
        </div>
    </section>

    <!-- Pagination -->
    <section class="mt-4">
        <nav>
            <ul class="pagination justify-content-center" id="paginationContainer">
                <!-- Pagination will be loaded here dynamically -->
            </ul>
        </nav>
    </section>
</main>

<!-- Add Review Modal -->
<div class="modal fade" id="addReviewModal" tabindex="-1">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title">Add New Course Review</h5>
                <button class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <form id="addReviewForm" action="process_review.php" method="POST">
                    <div class="mb-3">
                        <label class="form-label">Course Title</label>
                        <input type="text" class="form-control" id="courseTitle" name="courseTitle" required>
                    </div>
                    <div class="row g-3">
                        <div class="col-md-6">
                            <label class="form-label">Course Code</label>
                            <input type="text" class="form-control" id="courseCode" name="courseCode" placeholder="e.g., COMP 101" required>
                        </div>
                        <div class="col-md-6">
                            <label class="form-label">Professor Name</label>
                            <input type="text" class="form-control" id="professorName" name="professorName" required>
                        </div>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Rating</label>
                        <select class="form-select" id="courseRating" name="courseRating" required>
                            <option value="">Select rating</option>
                            <option value="5">★★★★★ (5/5)</option>
                            <option value="4">★★★★☆ (4/5)</option>
                            <option value="3">★★★☆☆ (3/5)</option>
                            <option value="2">★★☆☆☆ (2/5)</option>
                            <option value="1">★☆☆☆☆ (1/5)</option>
                        </select>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">Review</label>
                        <textarea class="form-control" id="reviewText" name="reviewText" rows="3" required></textarea>
                    </div>
                    <div class="d-grid gap-2">
                        <button type="submit" class="btn btn-success" id="submitReviewBtn">Submit</button>
                        <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>

<!-- Footer -->
<footer class="text-center py-3 mt-5">
    &copy; <?php echo date("Y"); ?> UNIHUB. Course Review Module
</footer>
<script src="config.js"></script>
<script src="test.js"></script>
</body>
</html> 
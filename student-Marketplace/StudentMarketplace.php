<?php 
// No need for database connection anymore as we're using the API
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>UniHub</title>
    <link rel="icon" href="images/Logo.png">

    <!-- Bootstrap CSS -->
    <link href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.3/css/bootstrap.min.css" rel="stylesheet">
    <link href="style.css" rel="stylesheet">
</head>


<body>

<!-- Header -->

<!-- Navigation menu -->
<header class="p-3 navbar navbar-expand-md navbar-dark bg-dark">
    <div class="container-fluid">
        <a class="navbar-brand" href="../index.html">
            <img src="images/Logo.png" alt="Logo" width="30" height="24">
        </a>
        <button class="navbar-toggler ms-auto" data-bs-toggle="collapse" data-bs-target="#navbarNavAltMarkup">
            <span class="navbar-toggler-icon"></span>
        </button>
        
        <div class="collapse navbar-collapse" id="navbarNavAltMarkup">
            <div class="navbar-nav mr-auto">
                <a class="nav-link" href="../index.html">Home</a>
                <a class="nav-link" href="../Campus News/Campus News.php">Campus News</a>
                <a class="nav-link" href="../course-review2/Course-Review.php">Course Review</a>
                <a class="nav-link" href="../Events Calendar/Events-Calender.php">Events Calendar</a>
                <a class="nav-link" href="../Phase1_Course-Notes/Course-Notes.php">Course Notes</a>
                <a class="nav-link" href="../Phase1-ClubActivity/ClubActivity.php">Club Activities</a>
                <a class="nav-link active" href="StudentMarketplace.php">Student Marketplace</a>
            </div>
        </div>
    </div>
</header>

<!-- Main Content -->
    <main class="container mt-4"> 
        <!-- Search, Filter, and Sort Section -->
        <section class="mb-4">
            <div class="d-flex justify-content-start align-items-center w-100" style="flex-wrap: nowrap;">
                <!-- Search Bar (Left corners not rounded) -->
                <input type="search" id="search-input" class="form-control" placeholder="Search marketplace..." style="border-radius: 0.375rem 0 0 0.375rem; min-width: 120px; border-right: none;">

                <!-- Filter Dropdown (No rounded corners) -->
                <div class="dropdown flex-shrink-0" style="margin-left: -1px;">
                    <button class="btn btn-outline-secondary dropdown-toggle h-100" type="button" id="filterDropdown" data-bs-toggle="dropdown" style="border-radius: 0; border-left: none; border-right: none;">
                        Filter
                    </button>
                    <ul class="dropdown-menu" aria-labelledby="filterDropdown">
                        <!-- Category Header and Options -->
                        <li><h6 class="dropdown-header">Category</h6></li>
                        <li><a class="dropdown-item" href="#" data-category="all">All Categories</a></li>
                        <li><a class="dropdown-item" href="#" data-category="Books">Books</a></li>
                        <li><a class="dropdown-item" href="#" data-category="Electronics">Electronics</a></li>
                        <li><a class="dropdown-item" href="#" data-category="Clothing">Clothing</a></li>
                        <li><a class="dropdown-item" href="#" data-category="Furniture">Furniture</a></li>
                        <li><a class="dropdown-item" href="#" data-category="Accessories">Accessories</a></li>
                        <li><a class="dropdown-item" href="#" data-category="Sports Equipment">Sports Equipment</a></li>
                        <li><a class="dropdown-item" href="#" data-category="Others">Others</a></li>
                        <li><hr class="dropdown-divider"></li>
                        
                        <!-- Price Range Header and Options -->
                        <li><h6 class="dropdown-header">Price Range</h6></li>
                        <li><a class="dropdown-item" href="#" data-price-range="all">All Prices</a></li>
                        <li><a class="dropdown-item" href="#" data-price-range="0-50">0 - 50 BHD</a></li>
                        <li><a class="dropdown-item" href="#" data-price-range="50-100">50 - 100 BHD</a></li>
                        <li><a class="dropdown-item" href="#" data-price-range="100-200">100 - 200 BHD</a></li>
                        <li><a class="dropdown-item" href="#" data-price-range="200-500">200 - 500 BHD</a></li>
                        <li><a class="dropdown-item" href="#" data-price-range="500+">500+ BHD</a></li>
                    </ul>
                </div>
                
             

                <!-- Sort Dropdown (No rounded corners) -->
                <div class="dropdown flex-shrink-0" style="margin-left: -1px;">
                    <button class="btn btn-outline-secondary dropdown-toggle h-100" type="button" data-bs-toggle="dropdown"  style="border-radius: 0; border-left: none; border-right: none;">
                        Sort
                    </button>
                    <ul class="dropdown-menu" aria-labelledby="sortDropdown">
                        <li><a class="dropdown-item" href="#" data-sort="price-low-high">Price Low-High</a></li>
                        <li><a class="dropdown-item" href="#" data-sort="price-high-low">Price High-Low</a></li>
                        <li><a class="dropdown-item" href="#" data-sort="newest">Newest</a></li>
                    </ul>
                </div>
        
                <!-- Add New Item Button (Right corner rounded) -->
                <button class="btn btn-primary flex-shrink-0" data-bs-toggle="collapse" data-bs-target="#addItemForm" type="button" style="border-radius: 0 0.375rem 0.375rem 0;  margin-left: -1px; border-left: none;">
                    Add New Item
                </button>
            </div>
        </section>

<!-- Form for Adding New Items -->
    <section id="addItemForm" class="collapse mt-3">
        <div class="card">
            <div class="card-body">
                <h3 class="card-title">Add a New Item</h3>
                <form id="addNewItemForm">
                    <div class="mb-3">
                        <label for="itemName" class="form-label">Item Name:</label>
                        <input type="text" placeholder="Enter item name" class="form-control" id="itemName" name="itemName" required>
                    </div>

                    <div class="mb-3">
                        <label for="itemDescription" class="form-label">Description:</label>
                        <textarea class="form-control" placeholder="write a short discription of the item" id="itemDescription" name="itemDescription" rows="3" required></textarea>
                    </div>

                    <div class="mb-3">
                        <label for="itemCategory" class="form-label">Category:</label>
                        <select class="form-control" id="itemCategory" name="itemCategory" required>
                            <option value="" disabled selected>Select Category</option>
                            <option value="1">Books</option>
                            <option value="2">Electronics</option>
                            <option value="3">Clothing</option>
                            <option value="4">Furniture</option>
                            <option value="5">Accessories</option>
                            <option value="6">Sports Equipment</option>
                            <option value="7">Others</option>
                        </select>
                    </div>

                    <div class="mb-3">
                        <label for="itemPrice" class="form-label">Price:</label>
                        <input type="number" placeholder="123BHD" class="form-control" id="itemPrice" name="itemPrice" min="0" step="0.01" required>
                    </div>

                    <div class="mb-3">
                        <label for="itemImage" class="form-label">Upload Image:</label>
                        <input type="file" class="form-control" id="itemImage" name="itemImage" required>
                    </div>

                    <div class="mb-3">
                    <button type="button" class="btn btn-success w-100" id="submitItemButton">Submit Item</button>
                    </div>

                    <div class="mb-3">
                    <button type="button" class="btn btn-danger w-100" data-bs-toggle="collapse" data-bs-target="#addItemForm">Cancel</button>
                    </div>
                    
                </form>
            </div>
        </div>
    </section>

<!-- Marketplace Items -->
    <section>
        <h3>Items for Sale:</h3>
        <!-- Add loading spinner -->
        <div id="loadingSpinner" class="text-center d-none">
            <div class="spinner-border text-success" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-2">Loading items...</p>
        </div>
        <div class="row">
            <!-- Items will be dynamically rendered here -->
        </div>
    </section>

<!-- Pagination -->
    <section class="mt-4">
        <nav>
            <ul class="pagination justify-content-center">
                <!-- Pagination will be dynamically rendered here -->
            </ul>
        </nav>
    </section>
</main>

<footer class="text-center py-3 mt-5">
    &copy; 2025 UNIHUB. All rights reserved.
</footer>
    <!-- JavaScript dependencies -->
    <script src="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.3/js/bootstrap.bundle.min.js"></script>
    <script src="config.js"></script>
    <script src="index.js"></script>
</body>
</html>

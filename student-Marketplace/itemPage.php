<?php
// No need for database connection anymore as we're using the API
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>UniHub - Item Details</title>
    <link rel="icon" href="images/Logo.png">

    <!-- Bootstrap CSS -->
    <link href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.3/css/bootstrap.min.css" rel="stylesheet">
    <link href="style.css" rel="stylesheet">
</head>
<body>

<!-- Navigation menu -->
<header class="p-3 navbar navbar-expand-md navbar-dark bg-dark">
    <div class="container-fluid">
        <a class="navbar-brand" href="#">
            <img src="images/Logo.png" alt="Logo" width="30" height="24">
        </a>
        <button class="navbar-toggler ms-auto" data-bs-toggle="collapse" data-bs-target="#navbarNavAltMarkup">
            <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNavAltMarkup">
            <div class="navbar-nav mr-auto">
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

<main class="container mt-4">

    <!-- Back, Edit, and Delete Buttons -->
    <div class="mb-3 d-flex gap-2">
        <a href="StudentMarketplace.php" class="btn btn-success">Back to Marketplace</a>
        <button class="btn btn-outline-secondary" onclick="toggleEditMode(true)">Edit</button>
        <button class="btn btn-danger" onclick="handleDelete()">Delete</button>
    </div>

    <!-- Item Details Section -->
    <section id="item-details" class="row align-items-start">
        <!-- Image Section -->
        <div class="col-md-5">
            <img id="itemImage" class="img-fluid rounded" alt="Item Image" width="500px">
        </div>
        <!-- Details Section -->
        <div class="col-md-7">
            <br><h2 id="itemName" class="card-title"></h2>
            <p class="card-text"><strong>Price: </strong><span id="itemPrice"></span></p>
            <p class="card-text"><strong>Description: </strong><span id="itemDescription"></span></p>
        </div>
    </section>

    <!-- Edit Form Section -->
    <section id="edit-form" style="display: none;">
        <div class="col-12">
            <h3>Edit Item</h3>
            <form id="editItemForm" class="card p-3">
                <div class="mb-3">
                    <label for="itemNameInput" class="form-label">Item Name</label>
                    <input type="text" class="form-control" id="itemNameInput" name="name" required>
                </div>
                <div class="mb-3">
                    <label for="itemPriceInput" class="form-label">Price (BHD)</label>
                    <input type="number" class="form-control" id="itemPriceInput" name="price" step="0.01" required>
                </div>
                <div class="mb-3">
                    <label for="itemDescriptionInput" class="form-label">Description</label>
                    <textarea class="form-control" id="itemDescriptionInput" name="description" rows="3" required></textarea>
                </div>
                <div class="mb-3">
                    <label for="itemImageInput" class="form-label">New Image (optional)</label>
                    <input type="file" class="form-control" id="itemImageInput" name="image" accept="image/*">
                    <img id="editItemImage" class="mt-2 img-fluid rounded" style="max-height: 200px;">
                </div>
                <div class="d-flex gap-2">
                    <button type="submit" class="btn btn-primary">Save Changes</button>
                    <button type="button" class="btn btn-secondary" onclick="toggleEditMode(false)">Cancel</button>
                </div>
            </form>
        </div>
    </section>

    <!-- Comments Section -->
    <section class="mt-5">
        <h3>Comments</h3>
        <button class="btn btn-success mt-3 mb-3" type="button" data-bs-toggle="collapse" data-bs-target="#commentForm">
            Add a Comment
        </button>

        <div class="collapse" id="commentForm">
            <div class="card mb-4">
                <div class="card-body">
                    <h5 class="card-title">Add a Comment</h5>
                    <form>
                        <div class="mb-3">
                            <label for="commenterName" class="form-label">Your Name:</label>
                            <input type="text" class="form-control" id="commenterName" name="commenter_name" required>
                        </div>
                        <div class="mb-3">
                            <label for="commentText" class="form-label">Your Comment:</label>
                            <textarea class="form-control" id="commentText" name="comment_text" rows="3" required></textarea>
                        </div>
                        <button type="submit" class="btn btn-success w-100">Submit Comment</button>
                    </form>
                </div>
            </div>
        </div>

        <!-- Comments Container -->
        <div class="comments-container mt-4">
            <!-- Comments will be loaded here -->
        </div>
    </section>
</main>

<footer class="text-center py-3 mt-5">
    &copy; 2025 UNIHUB. All rights reserved.
</footer>

<!-- JavaScript dependencies -->
<script src="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.3/js/bootstrap.bundle.min.js"></script>
<script src="config.js"></script>
<script src="itemPage.js"></script>

</body>
</html>
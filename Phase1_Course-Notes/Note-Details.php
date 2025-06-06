<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>UniHub - Note Details</title>
    <link rel="icon" href="images/Logo.png">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.3/css/bootstrap.min.css" rel="stylesheet">
    <link href="Style.css" rel="stylesheet">
</head>
<body>
  <header class="p-3 navbar navbar-expand-md navbar-dark bg-dark">
        <div class="container-fluid">
            <a class="navbar-brand" href="https://syntaxmo.github.io/ITCS333-Project-G6/index.html">
                <img src="https://syntaxmo.github.io/ITCS333-Project-G6/images/Logo.png" alt="Logo" width="30" height="24">
            </a>
            <button class="navbar-toggler ms-auto" data-bs-toggle="collapse" data-bs-target="#navbarNavAltMarkup">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarNavAltMarkup">
                <div class="navbar-nav mr-auto">
                    <a class="nav-link " href="https://syntaxmo.github.io/ITCS333-Project-G6/index.html">Home</a>
                    <a class="nav-link" href="https://syntaxmo.github.io/ITCS333-Project-G6/Campus News/CampusNews.html">Campus News</a>
                    <a class="nav-link" href="https://d5fad21c-f428-429a-9bb1-2ac8b3537d7d-00-1ca4huywajoo5.pike.replit.dev/Course-review.php">Course Review</a>
                    <a class="nav-link" href="https://72550fef-bf50-419e-a582-64ecf4d18546-00-1dq0623xo0z6m.pike.replit.dev/Events-Calendar/Events-Calender.php">Events Calendar</a>
                    <a class="nav-link active" href="https://63d98e1d-18eb-45d2-a341-3e5b80497860-00-2allsb7etny4v.pike.replit.dev/Phase1_Course-Notes/Course-Notes.php">Course Notes</a>
                    <a class="nav-link" href="https://72550fef-bf50-419e-a582-64ecf4d18546-00-1dq0623xo0z6m.pike.replit.dev/ClubActivity/ClubActivity.php">Club Activities</a>
                    <a class="nav-link" href="https://72550fef-bf50-419e-a582-64ecf4d18546-00-1dq0623xo0z6m.pike.replit.dev/student-Marketplace/StudentMarketplace.php">Student Marketplace</a>
                </div>
            </div>
        </div>
    </header>

<main class="container mt-4 note-details-page">
    <div class="mb-3 d-flex gap-2">
        <a href="Course-Notes.php" class="btn btn-success">← Back to Notes</a>
        <button class="btn btn-outline-secondary" id="editBtn">Edit</button>
        <button class="btn btn-danger" id="deleteBtn">Delete</button>
    </div>

    <section class="card mb-4">
        <div class="card-body">
            <h2 class="card-title mb-4" id="noteTitle"></h2>
            <div class="row">
                <div class="col-md-8">
                    <p class="fs-5"><strong>Course:</strong> <span data-course></span></p>
                    <p class="fs-5"><strong>Type:</strong> <span data-type class="badge bg-warning"></span></p>
                    <div class="mt-4">
                        <h5 class="mb-3">Content Overview:</h5>
                        <ul class="list-group" id="contentList"></ul>
                    </div>
                </div>
                <div class="col-md-4">
                    <div class="card shadow-sm">
                        <div class="card-body">
                            <h5 class="card-title mb-3">Note Metadata</h5>
                            <ul class="list-group list-group-flush">
                                <li class="list-group-item d-flex justify-content-between">
                                    <span>Upload Date:</span>
                                    <span data-date></span>
                                </li>
                                <li class="list-group-item d-flex justify-content-between">
                                    <span>Downloads:</span>
                                    <span data-downloads></span>
                                </li>
                                <li class="list-group-item d-flex justify-content-between">
                                    <span>File Size:</span>
                                    <span data-size></span>
                                </li>
                            </ul>
                            <button class="btn btn-primary w-100 mt-3">
                                <i class="bi bi-download"></i> Download PDF
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <section class="mb-5">
        <h3 class="mb-4">Comments (<span id="commentCount">0</span>)</h3>
        <button class="btn btn-success mb-4" type="button" data-bs-toggle="collapse" data-bs-target="#commentForm">
            Add a Comment
        </button>
        <div class="collapse" id="commentForm">
            <div class="card mb-4">
                <div class="card-body">
                    <h5 class="card-title">New Comment</h5>
                    <form id="commentForm">
                        <div class="mb-3">
                            <label class="form-label">Your Name:</label>
                            <input type="text" name="name" class="form-control" required>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Comment:</label>
                            <textarea class="form-control" name="comment" rows="3" required></textarea>
                        </div>
                        <button class="btn btn-success">Comment</button>
                    </form>
                </div>
            </div>
        </div>
        <div id="commentsContainer"></div>
    </section>
    <footer class="text-center py-3 mt-5">
        &copy; 2025 UNIHUB. All rights reserved
    </footer>
</main>

<script src="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.3/js/bootstrap.bundle.min.js"></script>
 
<script src="config.js"></script>
<script src="index.js"></script>


</body>
</html>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>UniHub - Course Notes</title>
    <link rel="icon" href="../images/Logo.png">
    <!-- Bootstrap CSS -->
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
                    <a class="nav-link active" href="https://syntaxmo.github.io/ITCS333-Project-G6/index.html">Home</a>
                    <a class="nav-link" href="https://syntaxmo.github.io/ITCS333-Project-G6/Campus News/CampusNews.html">Campus News</a>
                    <a class="nav-link" href="https://d5fad21c-f428-429a-9bb1-2ac8b3537d7d-00-1ca4huywajoo5.pike.replit.dev/Course-review.php">Course Review</a>
                    <a class="nav-link" href="https://72550fef-bf50-419e-a582-64ecf4d18546-00-1dq0623xo0z6m.pike.replit.dev/Events-Calendar/Events-Calender.php">Events Calendar</a>
                    <a class="nav-link" href="https://63d98e1d-18eb-45d2-a341-3e5b80497860-00-2allsb7etny4v.pike.replit.dev/Phase1_Course-Notes/Course-Notes.php">Course Notes</a>
                    <a class="nav-link" href="https://72550fef-bf50-419e-a582-64ecf4d18546-00-1dq0623xo0z6m.pike.replit.dev/ClubActivity/ClubActivity.php">Club Activities</a>
                    <a class="nav-link" href="https://72550fef-bf50-419e-a582-64ecf4dhttps://72550fef-bf50-419e-a582-64ecf4d18546-00-1dq0623xo0z6m.pike.replit.dev/student-Marketplace/StudentMarketplace.php">Student Marketplace</a>
                </div>
            </div>
        </div>
    </header>

<main class="container mt-4 course-notes-page">
    <section class="mb-4">
        <div class="d-flex justify-content-start align-items-center w-100" style="flex-wrap: nowrap;">
            <input type="search" class="form-control" placeholder="Search notes..." id="searchInput">
            <div class="dropdown flex-shrink-0" style="margin-left: -1px;">
                <button class="btn btn-outline-secondary dropdown-toggle h-100" type="button"
                        data-bs-toggle="dropdown" style="border-radius: 0; border-left: none;">
                    Filter
                </button>
                <ul class="dropdown-menu">
                    <li><h6 class="dropdown-header">Courses</h6></li>
                    <li><a class="dropdown-item" href="#">COMP 101</a></li>
                    <li><a class="dropdown-item" href="#">MATH 202</a></li>
                    <li><a class="dropdown-item" href="#">PHYS 101</a></li>
                    <li><a class="dropdown-item" href="#">ITCS 333</a></li>
                </ul>
            </div>
            <div class="dropdown flex-shrink-0" style="margin-left: -1px;">
                <button class="btn btn-outline-secondary dropdown-toggle h-100" type="button"
                        data-bs-toggle="dropdown" style="border-radius: 0; border-left: none;">
                    Sort
                </button>
                <ul class="dropdown-menu">
                    <li><a class="dropdown-item" href="#">Newest First</a></li>
                    <li><a class="dropdown-item" href="#">Course Code</a></li>
                </ul>
            </div>
            <button class="btn btn-primary flex-shrink-0" data-bs-toggle="modal"
                    data-bs-target="#uploadModal" type="button">
                Add Notes
            </button>
        </div>
    </section>

    <section>
        <h3>Available Notes:</h3>
        <div class="row" id="notesContainer"></div>
    </section>

    <div class="modal fade" id="uploadModal">
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Upload New Notes</h5>
                    <button class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <form id="uploadForm">
                        <div class="mb-3">
                            <label class="form-label">Title</label>
                            <input type="text" name="title" class="form-control" required>
                        </div>
                        <div class="row g-3">
                            <div class="col-md-6">
                                <label class="form-label">Course Code</label>
                                <input type="text" name="courseCode" class="form-control" required>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label">Note Type</label>
                                <select class="form-select" name="type" required>
                                    <option>Lecture Notes</option>
                                    <option>Lab Manual</option>
                                    <option>Exam Prep</option>
                                </select>
                            </div>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Description</label>
                            <textarea class="form-control" name="description" rows="3"></textarea>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Upload PDF (Optional)</label>
                            <input type="file" class="form-control" accept=".pdf">
                        </div>
                        <div class="d-grid gap-2">
                            <button type="submit" class="btn btn-success">Upload</button>
                            <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancel</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>

    <footer class="text-center py-3 mt-5">
        &copy; 2025 UNIHUB. All rights reserved
    </footer>
</main>

<script src="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.3/js/bootstrap.bundle.min.js"></script>

<script src="config.js"></script>
<script src="index.js"></script>


</body>
</html>
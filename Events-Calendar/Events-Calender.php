<!DOCTYPE html>
<html>
    <head>
       <meta charset="UTF-8">
       <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>UniHub</title>
        <link rel="icon" href="../images/Logo.png">

        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">

        <link rel="stylesheet" href="styles.css">
        <script defer src="https://kit.fontawesome.com/387937a7f8.js" crossorigin="anonymous"></script>
        <script defer src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
        <script src="apiEC/config.js"></script>
    </head>
    <body>
    <!-- Loading Indicator -->
    <!--
    <div id="pageLoadingIndicator" class="loading-container">
        <div class="text-center">
            <div class="loading-spinner"></div>
            <p class="loading-text">Loading Events...</p>
        </div>
    </div>
    -->

<!-- Header -->

  <!-- Navigation menu -->
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
                <a class="nav-link active" href="../Events Calendar/Events-Calender.html">Events Calendar</a>
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

    <!-- Search, Filter, and Sort Section -->
    <section class="mb-4">
      <div class="d-flex justify-content-start align-items-center w-100 filter-bar">
        <input type="search" class="form-control search-input" placeholder="Search Events...">
  
        <div class="dropdown flex-shrink-0 filter-dropdown">
          <button class="btn btn-outline-secondary dropdown-toggle h-100" type="button" data-bs-toggle="dropdown">
            Filter
          </button>
          <ul class="dropdown-menu" aria-labelledby="filterDropdown">
            <li><h6 class="dropdown-header">Event Type</h6></li>
            <li><a class="dropdown-item" href="#">Workshop</a></li>
            <li><a class="dropdown-item" href="#">Competition</a></li>
            <li><a class="dropdown-item" href="#">Talk</a></li>
            <li><a class="dropdown-item" href="#">Meetup</a></li>
            <li><a class="dropdown-item" href="#">Social</a></li>
            <li><a class="dropdown-item" href="#">All</a></li>
          </ul>
        </div>
  
        <div class="dropdown flex-shrink-0 sort-dropdown">
          <button class="btn btn-outline-secondary dropdown-toggle h-100" type="button" data-bs-toggle="dropdown">
            Sort
          </button>
          <ul class="dropdown-menu" aria-labelledby="sortDropdown">
            <li><a class="dropdown-item" href="#">Newest</a></li>
            <li><a class="dropdown-item" href="#">Popular</a></li>
          </ul>
        </div>
  
        <button class="btn btn-primary flex-shrink-0 add-button" data-bs-toggle="collapse" data-bs-target="#addItemForm" type="button">
          Add New Event
        </button>
      </div>
    </section>
  
    <!-- Form for Adding Events -->
    <section id="addItemForm" class="collapse mt-3" tabindex="-1">
      <div class="card">
        <div class="card-body">
          <h3 class="card-title">Add a New Event</h3>
          <form id="eventForm">
            <div class="mb-3">
              <label for="eventName" class="form-label">Event Title:</label>
              <input type="text" placeholder="Enter Event name" class="form-control" id="eventName" name="title" required>
            </div>

            <div class="mb-3">
                <label for="editDate" class="form-label">Event Date:</label>
                <input type="datetime-local" class="form-control" id="editDate" name="event_date" required>
            </div>

            <div class="mb-3">
                <label for="eventLocation" class="form-label">Event Location:</label> 
                <input type="text" placeholder="Room 000, XX Building"
                class="form-control" id="eventLocation" name="location" required>
            </div>

            <div class="mb-3">
              <label for="eventDescription" class="form-label">Description:</label>
              <textarea class="form-control" placeholder="Write a short description of the event" id="eventDescription" name="description" rows="3" required></textarea>
            </div>
  
            <div class="mb-3">
              <label for="eventCategory" class="form-label">Category:</label>
              <select class="form-control" id="eventCategory" name="category" required>
                <option value="" disabled selected>Select Event Type</option>
                <option value="Workshop">Workshop</option>
                <option value="Competition">Competition</option>
                <option value="Talk">Talk</option>
                <option value="Meetup">Meetup</option>
                <option value="Social">Social</option>
                <option value="Others">Others</option>
              </select>
            </div>
  
            <div class="mb-3">
              <label for="eventImage" class="form-label">Upload Poster:</label>
              <input type="file" class="form-control" id="eventImage" name="image" accept="image/jpeg, image/png, .jpg, .jpeg, .png" required>
            </div>
  
            <div class="mb-3">
              <button type="submit" class="btn btn-success w-100">Submit Event</button>
            </div>
  
            <div class="mb-3">
              <button type="button" class="btn btn-danger w-100" data-bs-toggle="collapse" data-bs-target="#addItemForm">Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </section>

    <!-- Error Alert Container -->
    <div id="errorContainer" class="mt-3"></div>

    <!-- Events Section -->
    <div class="container mt-5 Event-Section">
        <h2>Upcoming Events</h2>
        <div id="eventsContainer" class="row">
            <!-- Events will be loaded here dynamically -->
        </div>
    </div>

    <!-- Pagination -->
    <nav aria-label="Page navigation" class="mt-3">
        <ul class="pagination justify-content-center">
            <!-- Pagination will be loaded dynamically -->
        </ul>
    </nav>
</main>
  

<!--Footer-->

<footer class="text-center py-3 mt-5">
    &copy; 2025 UNIHUB. All rights reserved.
</footer>

 <script src="index.js"></script>

    </body>
</html>
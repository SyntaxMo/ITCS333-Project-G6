document.addEventListener("DOMContentLoaded", () => {
  const itemsPerPage = 3; // Number of activities per page
  const activities = document.querySelectorAll(".card"); // Select all activity cards
  const paginationLinks = document.querySelectorAll(".pagination .page-link");

  function showPage(page) {
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;

    // Hide all activities
    activities.forEach((activity, index) => {
      activity.style.display = index >= start && index < end ? "block" : "none";
    });
  }

  // Event listeners for pagination
  paginationLinks.forEach((link, index) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const page = index + 1; // Page number based on index
      showPage(page);

      // Toggle active class
      paginationLinks.forEach((link) => link.parentElement.classList.remove("active"));
      link.parentElement.classList.add("active");
    });
  });

  // Show the first page by default
  showPage(1);

  // Edit button functionality
  const editButton = document.getElementById("edit-btn");
  const editForm = document.getElementById("editActivityForm");
  const activityDetails = document.querySelector(".card-body");

  if (editButton) {
    editButton.addEventListener("click", () => {
      // Extract current activity details
      const title = activityDetails.querySelector(".card-title").textContent;
      const host = activityDetails.querySelector(".card-text strong:nth-of-type(1)").nextSibling.textContent.trim();
      const location = activityDetails.querySelector(".card-text strong:nth-of-type(2)").nextSibling.textContent.trim();
      const datetime = activityDetails.querySelector(".card-text strong:nth-of-type(3)").nextSibling.textContent.trim();
      const description = activityDetails.querySelector(".card-text strong:nth-of-type(4)").nextSibling.textContent.trim();

      // Populate the edit form
      document.getElementById("editActivityName").value = title;
      document.getElementById("editClub").value = host;
      document.getElementById("editDatetime").value = datetime;
      document.getElementById("editActivityDescription").value = description;

      // Show the edit form
      editForm.classList.add("show");
    });
  }

  // Handle form submission
  const editFormElement = document.querySelector("#editActivityForm form");
  if (editFormElement) {
    editFormElement.addEventListener("submit", (e) => {
      e.preventDefault();

      // Get updated values
      const updatedTitle = document.getElementById("editActivityName").value;
      const updatedHost = document.getElementById("editClub").value;
      const updatedDatetime = document.getElementById("editDatetime").value;
      const updatedDescription = document.getElementById("editActivityDescription").value;
      const updatedLocation = document.getElementById("editLocation").value;

      // Update the activity details
      activityDetails.querySelector(".card-title").textContent = updatedTitle;
      activityDetails.querySelector(".card-text strong:nth-of-type(1)").nextSibling.textContent = ` ${updatedHost}`;
      activityDetails.querySelector(".card-text strong:nth-of-type(3)").nextSibling.textContent = ` ${updatedDatetime}`;
      activityDetails.querySelector(".card-text strong:nth-of-type(4)").nextSibling.textContent = ` ${updatedDescription}`;

      // Hide the edit form
      editForm.classList.remove("show");
    });
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const wordFilter = document.getElementById("searchInput");
  const activityCards = document.querySelectorAll(".card");

  wordFilter.addEventListener("input", () => {
      const filterResult = wordFilter.value.toLowerCase();

      activityCards.forEach((card) => {
          const cardText = card.textContent.toLowerCase();
          if (cardText.includes(filterResult)) {
              card.style.display = "block";
          } else {
              card.style.display = "none";
          }
      });
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const clubFilter = document.getElementById("clubsFilter");
  const activityCards = document.querySelectorAll(".card");

  clubFilter.addEventListener("click", (event) => {
    const filterKey = event.target.textContent.toLowerCase().trim();

    activityCards.forEach((card) => {
      const cardClub = card.textContent.toLowerCase().trim();
      if (cardClub == filterKey)
        card.style.display = "block";
      else 
        card.style.display = "none";
      
    });
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const sortDropdown = document.querySelector(".dropdown-menu[aria-labelledby='sortDropdown']");
  const activityCards = document.querySelectorAll(".card");

  sortDropdown.addEventListener("click", (event) => {
    const sortValue = event.target.textContent.trim();

    const sortedCards = Array.from(activityCards).sort((a, b) => {
      const dateA = new Date(a.querySelector(".card-text strong:nth-of-type(3)").nextElementSibling.textContent.trim());
      const dateB = new Date(b.querySelector(".card-text strong:nth-of-type(3)").nextElementSibling.textContent.trim());

      if (sortValue === "Live Now") {
        return dateA <= new Date() && dateB > new Date() ? -1 : 1;
      } else if (sortValue === "Today") {
        const today = new Date();
        return dateA.toDateString() === today.toDateString() ? -1 : 1;
      } else if (sortValue === "This Week") {
        const now = new Date();
        const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        return dateA >= weekStart && dateA <= weekEnd ? -1 : 1;
      } else if (sortValue === "This Month") {
        const now = new Date();
        return dateA.getMonth() === now.getMonth() && dateA.getFullYear() === now.getFullYear() ? -1 : 1;
      }
      return 0;
    });

    const container = document.querySelector(".row");
    container.innerHTML = "";
    sortedCards.forEach((card) => container.appendChild(card));
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const commentForm = document.querySelector("#commentForm form");
  const commenterNameInput = document.getElementById("commenterName");
  const commentTextInput = document.getElementById("commentText");
  const commentsSection = document.querySelector(".mt-5");

  commentForm.addEventListener("submit", (e) => {
    e.preventDefault();

    // Get the input values
    const commenterName = commenterNameInput.value.trim();
    const commentText = commentTextInput.value.trim();

    if (commenterName && commentText) {
      // Create a new comment box
      const newCommentBox = document.createElement("div");
      newCommentBox.classList.add("comment-box");

      const commenterNameElement = document.createElement("h5");
      commenterNameElement.textContent = commenterName;

      const commentTextElement = document.createElement("p");
      commentTextElement.textContent = commentText;

      newCommentBox.appendChild(commenterNameElement);
      newCommentBox.appendChild(commentTextElement);

      // Append the new comment to the comments section
      commentsSection.appendChild(newCommentBox);

      // Clear the form inputs
      commenterNameInput.value = "";
      commentTextInput.value = "";

      // Collapse the form
      const collapseElement = document.getElementById("commentForm");
      const bootstrapCollapse = bootstrap.Collapse.getInstance(collapseElement);
      bootstrapCollapse.hide();
    }
  });
});
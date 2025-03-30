/* Close the navigation sidebar */
function closeNavBar(){
  document.getElementById("the-side-bar").style.width = "0rem";
  document.getElementById("the-side-bar").style.height = "0%";
}

/* Open the navigation sidebar */
function openNavBar(){
  document.getElementById("the-side-bar").style.width="13rem";
  document.getElementById("the-side-bar").style.height = "100%";
}

function openFilter(){
  document.getElementById("filter-form").style.width="18rem"
  document.getElementById("filter-form").style.height="16.5rem"
}

function closeFilter(){
  document.getElementById("filter-form").style.width="0rem"
  document.getElementById("filter-form").style.height="0rem"
}

function openScheduleActivity(){
  document.getElementById("Schedule-activity").style.width="24rem"
  document.getElementById("Schedule-activity").style.height="28.2rem"
}

function closeScheduleActivity(){
  document.getElementById("Schedule-activity").style.width="0rem"
  document.getElementById("Schedule-activity").style.height="0rem"
}

function closeEditActivity(){
  document.getElementById("edit-activity").style.width="0rem"
  document.getElementById("edit-activity").style.height="0rem"
}

function openEditActivity(){
  document.getElementById("edit-activity").style.width="24rem"
  document.getElementById("edit-activity").style.height="28.2rem"
}
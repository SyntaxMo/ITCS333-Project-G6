/* Close the navigation sidebar */
function closeNavBar(){
  document.getElementById("the-side-bar").style.width = "0px";
  document.getElementById("the-side-bar").style.height = "0%";
}

/* Open the navigation sidebar */
function openNavBar(){
  document.getElementById("the-side-bar").style.width="250px";
  document.getElementById("the-side-bar").style.height = "100%";
}

function openFilter(){
  document.getElementById("filter-form").style.width="250px"
  document.getElementById("filter-form").style.height="200px"
}

function closeFilter(){
  document.getElementById("filter-form").style.width="0px"
  document.getElementById("filter-form").style.height="0px"
}

function openScheduleActivity(){
  document.getElementById("Schedule-activity").style.width="450px"
  document.getElementById("Schedule-activity").style.height="350px"
}

function closeScheduleActivity(){
  document.getElementById("Schedule-activity").style.width="0px"
  document.getElementById("Schedule-activity").style.height="0px"
}
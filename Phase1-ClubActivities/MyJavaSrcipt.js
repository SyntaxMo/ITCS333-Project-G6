/* Close the navigation sidebar */
function closeNavBar(){
  document.getElementById("the-side-bar").style.width = "0rem";
  document.getElementById("the-side-bar").style.height = "0%";
}

/* Open the navigation sidebar */
function openNavBar(){
  document.getElementById("the-side-bar").style.width="13em";
  document.getElementById("the-side-bar").style.height = "100%";
}

function openFilter(){
  document.getElementById("filter-form").style.width="18rem"
  document.getElementById("filter-form").style.height="15rem"
}

function closeFilter(){
  document.getElementById("filter-form").style.width="0rem"
  document.getElementById("filter-form").style.height="0rem"
}

function openScheduleActivity(){
  document.getElementById("Schedule-activity").style.width="23rem"
  document.getElementById("Schedule-activity").style.height="24rem"
}

function closeScheduleActivity(){
  document.getElementById("Schedule-activity").style.width="0px"
  document.getElementById("Schedule-activity").style.height="0px"
}
function checkViewport() { return window.innerWidth || document.documentElement.clientWidth;}
/* Close the navigation sidebar */
function closeNavBar(){
  document.getElementById("the-side-bar").style.width = "0rem";
  document.getElementById("the-side-bar").style.height = "0%";
}

/* Open the navigation sidebar */
function openNavBar(){
 if(checkViewport() > 599 && checkViewport() < 769){
  document.getElementById("the-side-bar").style.width="18rem";
  document.getElementById("the-side-bar").style.height = "100%";
 }
  else if(checkViewport() >= 769 ){
    document.getElementById("the-side-bar").style.width="22rem";
  document.getElementById("the-side-bar").style.height = "100%";
  }
 
 else{
  document.getElementById("the-side-bar").style.width="13rem";
  document.getElementById("the-side-bar").style.height = "100%";
 }
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
  if(checkViewport() >= 769){
    document.getElementById("Schedule-activity").style.width="24rem"
    document.getElementById("Schedule-activity").style.height="29rem"
  }
  else{
    document.getElementById("Schedule-activity").style.width="24rem"
    document.getElementById("Schedule-activity").style.height="28.2rem"
  }
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
  if(checkViewport() >= 769){
    document.getElementById("edit-activity").style.width="24rem"
    document.getElementById("edit-activity").style.height="29rem"
  }
  else{
    document.getElementById("edit-activity").style.width="24rem"
    document.getElementById("edit-activity").style.height="28.2rem"
  }
}

function toggleCardPrio(){
  document.getElementById('edit-activity').classList.add('z-prio')
  document.getElementById('Schedule-activity').classList.add('z-prio')
}
/* Close the navigation sidebar */
function closeMenu(){
  document.getElementById("TheSideBar").style.width = "0px";
  document.getElementById("TheSideBar").style.height = "0%";
}

/* Open the navigation sidebar */
function openMenu(){
  document.getElementById("TheSideBar").style.width="250px";
  document.getElementById("TheSideBar").style.height = "100%";
}

function openFilter(){
  document.getElementById("filterForm").style.width="250px"
  document.getElementById("filterForm").style.height="200px"
}

function closeFilter(){
  document.getElementById("filterForm").style.width="0px"
  document.getElementById("filterForm").style.height="0px"
}
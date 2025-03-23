/* Close the navigation sidebar */
function closeMenu(){
  document.getElementById("the-side-bar").style.width = "0px";
  document.getElementById("the-side-bar").style.height = "0%";
}

/* Open the navigation sidebar */
function openMenu(){
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
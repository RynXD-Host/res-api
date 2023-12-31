const body = document.querySelector("body"),
 nav = document.querySelector("nav"),
 sidebarOpen = document.querySelector(".sidebarOpen"),
 siderbarClose = document.querySelector(".siderbarClose");

sidebarOpen.addEventListener("click", () => {
 nav.classList.add("active");
});
body.addEventListener("click", e => {
 let clickedElm = e.target;
 if (!clickedElm.classList.contains("sidebarOpen") && !clickedElm.classList.contains("menu")) {
  nav.classList.remove("active");
 }
});
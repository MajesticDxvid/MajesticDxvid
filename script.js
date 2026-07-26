document.getElementById("year").textContent = new Date().getFullYear();

function openVideo(videoId) {
  const modal = document.getElementById("videoModal");
  const frame = document.getElementById("videoFrame");

  frame.src = "https://www.youtube.com/embed/" + videoId + "?autoplay=1";
  modal.classList.add("show");
}

function closeVideo() {
  const modal = document.getElementById("videoModal");
  const frame = document.getElementById("videoFrame");

  frame.src = "";
  modal.classList.remove("show");
}

function openModel(src) {
  document.getElementById("modelFrame").src = src;
  document.getElementById("modelModal").classList.add("show");
}

function closeModel() {
  document.getElementById("modelModal").classList.remove("show");
}

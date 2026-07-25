document.getElementById("year").textContent = new Date().getFullYear();
function openVideo(videoId) {
  const modal = document.getElementById("videoModal");
  const frame = document.getElementById("videoFrame");

  frame.src = "https://www.youtube.com/embed/" + videoId + "?autoplay=1";
  modal.style.display = "flex";
}

function closeVideo() {
  const modal = document.getElementById("videoModal");
  const frame = document.getElementById("videoFrame");

  frame.src = "";
  modal.style.display = "none";
}

document.getElementById("year").textContent = new Date().getFullYear();

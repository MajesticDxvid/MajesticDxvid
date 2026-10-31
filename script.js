document.getElementById("year").textContent = new Date().getFullYear();

/* --------------------------------------------------
   CONTENT — edit these lists to change the carousels
-------------------------------------------------- */

// Recent edits. "id" is the part after watch?v= in the YouTube link.
// Leave "img" out to use the video's YouTube thumbnail automatically.
const edits = [
  { id: "8snYsSEbfJQ", title: "This is Minecraft's Most Feared SMP" },
  { id: "kT6ra5Wn0AA", title: "How to Join The Aquatic SMP" },
  { id: "QjRkY7D1uGE", title: "Minecraft's next biggest server!" },
  { id: "4ZuT14-hZmQ", title: "How To Join Ping SMP" },
  { id: "nMMHokzBlFU", title: "We Made the SMP We ALWAYS WANTED" },
  { id: "-3_D7FKgdk0", title: "Mobs SMP Vid Prog", img: "images/G Spear.png" },
  { id: "YxnhmgRzfX8", title: "Yet Another Spear Mace Video", img: "images/image42.png" },
  { id: "5ieu8j_g48g", title: "Mobs SMP Promo Finished", img: "images/image43.png" }
];

// Recent thumbnails (images in the images folder).
const thumbnails = [
  "images/thumb-01.jpg",
  "images/thumb-02.jpg",
  "images/thumb-03.jpg",
  "images/thumb-04.jpg",
  "images/thumb-05.jpg",
  "images/thumb-06.jpg",
  "images/thumb-07.jpg",
  "images/thumb-08.jpg",
  "images/thumb-09.jpg",
  "images/thumb-10.jpg",
  "images/thumb-11.jpg",
  "images/thumb-12.jpg",
  "images/thumb-13.jpg",
  "images/thumb-14.jpg"
];

// Recent models (images in the images folder).
const models = [
  "images/golden-axe.png",
  "images/crystal-sword.png",
  "images/pink-axe.png",
  "images/void-sword.png",
  "images/knife.png",
  "images/Aquatic.png",
  "images/midassword.png",
  "images/aquaticspear.png",
  "images/VIP sword.png"
];

/* --------------------------------------------------
   BUILD CAROUSEL ITEMS
-------------------------------------------------- */
function makeItem(imgSrc, alt, onClick, fallbackSrc) {
  const item = document.createElement("button");
  item.type = "button";
  item.className = "carousel-item";
  item.setAttribute("aria-label", alt);

  const img = document.createElement("img");
  img.src = imgSrc;
  img.alt = alt;
  img.loading = "eager";
  img.draggable = false;
  if (fallbackSrc) {
    img.addEventListener("error", function onErr() {
      img.removeEventListener("error", onErr);
      img.src = fallbackSrc;
    });
  }

  item.appendChild(img);
  item.addEventListener("click", onClick);
  return item;
}

const editsTrack = document.getElementById("editsTrack");
edits.forEach((v) => {
  const thumb = "https://i.ytimg.com/vi/" + v.id + "/maxresdefault.jpg";
  const backup = "https://i.ytimg.com/vi/" + v.id + "/hqdefault.jpg";
  editsTrack.appendChild(
    makeItem(v.img || thumb, v.title, () => openVideo(v.id), v.img ? null : backup)
  );
});

const thumbsTrack = document.getElementById("thumbsTrack");
thumbnails.forEach((src) => {
  thumbsTrack.appendChild(makeItem(src, "Thumbnail", () => openModel(src)));
});

const modelsTrack = document.getElementById("modelsTrack");
models.forEach((src) => {
  modelsTrack.appendChild(makeItem(src, "Minecraft model", () => openModel(src)));
});

/* --------------------------------------------------
   SEAMLESS CAROUSEL
   Slides continuously, loops without jumping,
   and pauses while the mouse is over it.
-------------------------------------------------- */
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const carousels = [];

document.querySelectorAll(".carousel-container").forEach((container) => {
  const track = container.querySelector(".carousel-track");
  const originals = Array.from(track.children);
  if (!originals.length) return;

  const state = {
    container,
    track,
    count: originals.length,
    speed: Number(container.dataset.speed) || 60, // pixels per second
    offset: 0,
    setWidth: 0,
    hovered: false,
    dragging: false,
    slider: null
  };

  // Scroll bar under the carousel
  const bar = document.createElement("input");
  bar.type = "range";
  bar.className = "carousel-scroll";
  bar.min = "0";
  bar.max = "1000";
  bar.step = "1";
  bar.value = "0";
  bar.setAttribute(
    "aria-label",
    "Scroll through " +
      (track.id === "modelsTrack" ? "models" : track.id === "thumbsTrack" ? "thumbnails" : "videos")
  );
  container.after(bar);
  state.slider = bar;

  const setFromBar = () => {
    state.offset = (Number(bar.value) / 1000) * state.setWidth;
    applyOffset(state);
  };
  bar.addEventListener("input", () => {
    state.dragging = true;
    setFromBar();
  });
  bar.addEventListener("pointerdown", () => (state.dragging = true));
  bar.addEventListener("pointerup", () => (state.dragging = false));
  bar.addEventListener("change", () => (state.dragging = false));
  bar.addEventListener("mouseenter", () => (state.hovered = true));
  bar.addEventListener("mouseleave", () => (state.hovered = false));

  // Trackpad / shift + mouse-wheel sideways scrolling
  container.addEventListener(
    "wheel",
    (e) => {
      const dx = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.shiftKey ? e.deltaY : 0;
      if (!dx) return;
      e.preventDefault();
      nudge(state, dx);
    },
    { passive: false }
  );

  // Swipe / drag on phones and touchscreens
  let startX = null;
  let moved = false;
  container.addEventListener("pointerdown", (e) => {
    if (e.pointerType === "mouse") return;
    startX = e.clientX;
    moved = false;
    state.dragging = true;
  });
  container.addEventListener("pointermove", (e) => {
    if (startX === null) return;
    const dx = startX - e.clientX;
    if (Math.abs(dx) > 4) moved = true;
    startX = e.clientX;
    nudge(state, dx);
  });
  const endDrag = () => {
    startX = null;
    state.dragging = false;
  };
  container.addEventListener("pointerup", endDrag);
  container.addEventListener("pointercancel", endDrag);
  // Don't open a video if the visitor was swiping
  container.addEventListener(
    "click",
    (e) => {
      if (moved) {
        e.stopPropagation();
        e.preventDefault();
        moved = false;
      }
    },
    true
  );

  // Add copies of the whole set so there is never a gap at the end.
  function fill() {
    // remove old copies
    Array.from(track.children).slice(state.count).forEach((el) => el.remove());
    measure();
    if (!state.setWidth) return;
    const copies = Math.max(2, Math.ceil(container.offsetWidth / state.setWidth) + 1);
    for (let i = 0; i < copies; i++) {
      originals.forEach((el) => {
        const copy = el.cloneNode(true);
        copy.setAttribute("aria-hidden", "true");
        copy.tabIndex = -1;
        const i2 = originals.indexOf(el);
        copy.addEventListener("click", () => originals[i2].click());
        track.appendChild(copy);
      });
    }
  }

  // Width of one full set, including the gap before the next set.
  function measure() {
    const items = track.children;
    if (items.length > state.count) {
      state.setWidth = items[state.count].offsetLeft - items[0].offsetLeft;
    } else {
      const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      state.setWidth = track.scrollWidth + gap;
    }
  }

  container.addEventListener("mouseenter", () => (state.hovered = true));
  container.addEventListener("mouseleave", () => (state.hovered = false));
  container.addEventListener("focusin", () => (state.hovered = true));
  container.addEventListener("focusout", () => (state.hovered = false));

  // Re-measure once images have loaded and when the window resizes.
  track.querySelectorAll("img").forEach((img) => {
    if (!img.complete) img.addEventListener("load", () => measure(), { once: true });
  });
  window.addEventListener("resize", () => {
    fill();
    state.offset = state.offset % (state.setWidth || 1);
  });

  fill();
  carousels.push(state);
});

function applyOffset(c) {
  if (c.setWidth <= 0) return;
  c.offset = ((c.offset % c.setWidth) + c.setWidth) % c.setWidth;
  c.track.style.transform = "translate3d(" + -c.offset + "px, 0, 0)";
  if (c.slider && !c.dragging) {
    c.slider.value = String(Math.round((c.offset / c.setWidth) * 1000));
  }
}

function nudge(c, dx) {
  c.offset += dx;
  applyOffset(c);
}

function modalOpen() {
  return document.querySelector(".video-modal.show") !== null;
}

let lastTime = performance.now();
function tick(now) {
  const dt = Math.min(0.05, (now - lastTime) / 1000);
  lastTime = now;

  carousels.forEach((c) => {
    if (!c.hovered && !c.dragging && !modalOpen() && !reduceMotion && c.setWidth > 0) {
      c.offset += c.speed * dt;
      applyOffset(c);
    }
  });

  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);

/* --------------------------------------------------
   POPUPS
-------------------------------------------------- */
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

// Close popups with Escape or by clicking the dark background.
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeVideo();
    closeModel();
  }
});
document.getElementById("videoModal").addEventListener("click", (e) => {
  if (e.target.id === "videoModal") closeVideo();
});
document.getElementById("modelModal").addEventListener("click", (e) => {
  if (e.target.id === "modelModal") closeModel();
});

/* --------------------------------------------------
   COPY DISCORD USERNAME
-------------------------------------------------- */
const copyBtn = document.getElementById("copyDiscord");
const copyHint = document.getElementById("copyHint");
const contactNote = document.getElementById("contactNote");

copyBtn.addEventListener("click", async () => {
  const user = copyBtn.dataset.user;
  let copied = false;

  try {
    await navigator.clipboard.writeText(user);
    copied = true;
  } catch (err) {
    // Fallback for older browsers
    const temp = document.createElement("textarea");
    temp.value = user;
    temp.style.position = "fixed";
    temp.style.opacity = "0";
    document.body.appendChild(temp);
    temp.select();
    try {
      copied = document.execCommand("copy");
    } catch (e) {
      copied = false;
    }
    temp.remove();
  }

  if (copied) {
    copyBtn.classList.add("copied");
    copyHint.textContent = "copied!";
    contactNote.innerHTML =
      "Copied! Open Discord, go to <b>Add Friend</b> and paste <b>" + user + "</b>.";
  } else {
    copyHint.textContent = "select & copy";
    contactNote.innerHTML = "Add me on Discord: <b>" + user + "</b>";
  }

  clearTimeout(copyBtn._reset);
  copyBtn._reset = setTimeout(() => {
    copyBtn.classList.remove("copied");
    copyHint.textContent = "click to copy";
  }, 2500);
});

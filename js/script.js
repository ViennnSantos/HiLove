/* =========================================================
   CONFIG
========================================================= */
const CORRECT_PASSWORD = "092319";
const RELATIONSHIP_START = new Date(2019, 8, 23, 0, 0, 0); // Sept 23, 2019, 12:00 AM (month is 0-indexed)

/* =========================================================
   LOADING SCREEN
========================================================= */
window.addEventListener("load", () => {
  const loader = document.getElementById("loading-screen");
  setTimeout(() => loader.classList.add("hide"), 900);
});

/* =========================================================
   PASSWORD GATE
========================================================= */
const gate = document.getElementById("gate");
const gateForm = document.getElementById("gate-form");
const gateInput = document.getElementById("gate-input");
const gateError = document.getElementById("gate-error");
const site = document.getElementById("site");

gateInput.addEventListener("input", () => {
  gateInput.value = gateInput.value.replace(/[^0-9]/g, "").slice(0, 6);
});

gateForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const value = gateInput.value.trim();

  if (value === CORRECT_PASSWORD) {
    gateError.classList.remove("show");
    gate.classList.add("unlocking");
    site.hidden = false;
    document.body.style.overflow = "auto";
    startTimer();
    initPetals();
    setTimeout(() => { gate.style.display = "none"; }, 850);
  } else {
    gateError.textContent = "Oops... that's not our special day. ❤️";
    gateError.classList.remove("show");
    void gateError.offsetWidth; // restart animation
    gateError.classList.add("show");
    gateInput.value = "";
    gateInput.focus();
  }
});

/* =========================================================
   LIVE RELATIONSHIP TIMER
========================================================= */
function startTimer() {
  updateTimer();
  setInterval(updateTimer, 1000);
}

function updateTimer() {
  const now = new Date();

  let years = now.getFullYear() - RELATIONSHIP_START.getFullYear();
  let months = now.getMonth() - RELATIONSHIP_START.getMonth();
  let days = now.getDate() - RELATIONSHIP_START.getDate();
  let hours = now.getHours() - RELATIONSHIP_START.getHours();
  let minutes = now.getMinutes() - RELATIONSHIP_START.getMinutes();
  let seconds = now.getSeconds() - RELATIONSHIP_START.getSeconds();

  if (seconds < 0) { seconds += 60; minutes--; }
  if (minutes < 0) { minutes += 60; hours--; }
  if (hours < 0) { hours += 24; days--; }
  if (days < 0) {
    const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    days += prevMonth.getDate();
    months--;
  }
  if (months < 0) { months += 12; years--; }

  setText("t-years", years);
  setText("t-months", months);
  setText("t-days", days);
  setText("t-hours", hours);
  setText("t-mins", minutes);
  setText("t-secs", seconds);
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

/* =========================================================
   PAGE NAVIGATION
========================================================= */
const pages = Array.from(document.querySelectorAll(".page"));
const dots = Array.from(document.querySelectorAll(".dot"));
const nextBtn = document.getElementById("next-btn");
const prevBtn = document.getElementById("prev-btn");
let currentPage = 0;

function goToPage(index) {
  if (index < 0 || index >= pages.length || index === currentPage) return;
  const direction = index > currentPage ? "forward" : "back";

  pages[currentPage].classList.remove("active");
  pages[currentPage].classList.add(direction === "forward" ? "leaving-back" : "");

  currentPage = index;

  pages.forEach((p, i) => {
    p.classList.remove("leaving-back");
    p.classList.toggle("active", i === currentPage);
  });

  dots.forEach((d, i) => d.classList.toggle("active", i === currentPage));

  prevBtn.classList.toggle("hidden", currentPage === 0);

  if (currentPage === pages.length - 1) {
    nextBtn.classList.add("hidden");
  } else {
    nextBtn.classList.remove("hidden");
    nextBtn.querySelector(".next-label").textContent = "Next";
  }

  // restart text-in animations
  const textEls = pages[currentPage].querySelectorAll(".page-text p");
  textEls.forEach((p) => {
    p.style.animation = "none";
    void p.offsetWidth;
    p.style.animation = "";
  });
}

nextBtn.addEventListener("click", () => goToPage(currentPage + 1));
prevBtn.addEventListener("click", () => goToPage(currentPage - 1));
dots.forEach((dot) => {
  dot.addEventListener("click", () => goToPage(parseInt(dot.dataset.page, 10)));
});

// keyboard navigation
document.addEventListener("keydown", (e) => {
  if (site.hidden) return;
  if (e.key === "ArrowRight") goToPage(currentPage + 1);
  if (e.key === "ArrowLeft") goToPage(currentPage - 1);
});

/* =========================================================
   MUSIC TOGGLE
========================================================= */
const musicBtn = document.getElementById("music-toggle");
const bgMusic = document.getElementById("bg-music");
let isPlaying = false;

musicBtn.addEventListener("click", () => {
  if (!isPlaying) {
    bgMusic.play().catch(() => {
      // audio file not yet added — fail gracefully
      console.info("Add your song file at audio/our-song.mp3 to enable playback.");
    });
    musicBtn.classList.add("playing");
    musicBtn.querySelector(".music-icon").textContent = "⏸";
    musicBtn.querySelector(".music-text").textContent = "Pause";
    musicBtn.setAttribute("aria-pressed", "true");
    isPlaying = true;
  } else {
    bgMusic.pause();
    musicBtn.classList.remove("playing");
    musicBtn.querySelector(".music-icon").textContent = "♪";
    musicBtn.querySelector(".music-text").textContent = "Play Our Song";
    musicBtn.setAttribute("aria-pressed", "false");
    isPlaying = false;
  }
});

/* =========================================================
   FLOATING PETALS + HEARTS + GLOWING PARTICLES
========================================================= */
const canvas = document.getElementById("petal-canvas");
const ctx = canvas.getContext("2d");
let particles = [];
let petalsRunning = false;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function initPetals() {
  if (petalsRunning || reduceMotion) return;
  petalsRunning = true;

  const types = ["petal", "heart", "glow"];
  const count = window.innerWidth < 640 ? 16 : 26;

  for (let i = 0; i < count; i++) {
    particles.push(makeParticle(types[i % types.length], true));
  }
  requestAnimationFrame(animateParticles);
}

function makeParticle(type, randomY) {
  return {
    type,
    x: Math.random() * canvas.width,
    y: randomY ? Math.random() * canvas.height : -20,
    size: type === "glow" ? 3 + Math.random() * 4 : 8 + Math.random() * 10,
    speedY: 0.25 + Math.random() * 0.5,
    speedX: (Math.random() - 0.5) * 0.5,
    sway: Math.random() * Math.PI * 2,
    swaySpeed: 0.008 + Math.random() * 0.012,
    rotation: Math.random() * 360,
    rotationSpeed: (Math.random() - 0.5) * 0.6,
    opacity: 0.25 + Math.random() * 0.35,
  };
}

function drawPetal(p) {
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate((p.rotation * Math.PI) / 180);
  ctx.globalAlpha = p.opacity;
  ctx.fillStyle = "#F0BFCB";
  ctx.beginPath();
  ctx.ellipse(0, 0, p.size / 2, p.size / 3.2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawHeart(p) {
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate((p.rotation * Math.PI) / 180);
  ctx.globalAlpha = p.opacity;
  ctx.scale(p.size / 20, p.size / 20);
  ctx.fillStyle = "#D98A9A";
  ctx.beginPath();
  ctx.moveTo(0, 4);
  ctx.bezierCurveTo(-6, -4, -12, 2, 0, 12);
  ctx.bezierCurveTo(12, 2, 6, -4, 0, 4);
  ctx.fill();
  ctx.restore();
}

function drawGlow(p) {
  ctx.save();
  ctx.globalAlpha = p.opacity * 0.6;
  const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3);
  gradient.addColorStop(0, "rgba(255,224,210,0.9)");
  gradient.addColorStop(1, "rgba(255,224,210,0)");
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  particles.forEach((p) => {
    p.sway += p.swaySpeed;
    p.y += p.speedY;
    p.x += p.speedX + Math.sin(p.sway) * 0.4;
    p.rotation += p.rotationSpeed;

    if (p.y > canvas.height + 20) {
      Object.assign(p, makeParticle(p.type, false));
    }
    if (p.x > canvas.width + 20) p.x = -20;
    if (p.x < -20) p.x = canvas.width + 20;

    if (p.type === "petal") drawPetal(p);
    else if (p.type === "heart") drawHeart(p);
    else drawGlow(p);
  });

  requestAnimationFrame(animateParticles);
}
document.querySelector("#year").textContent = new Date().getFullYear();

const cursorGrid = document.querySelector(".cursor-grid");
let lastCursorTile = 0;
if (matchMedia("(pointer:fine)").matches && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
  window.addEventListener("pointermove", (event) => {
    const now = performance.now();
    if (now - lastCursorTile < 55) return;
    lastCursorTile = now;
    const tile = document.createElement("span");
    tile.className = "cursor-tile";
    const offsetX = (Math.random() - .5) * 70;
    const offsetY = -18 - Math.random() * 34;
    tile.style.left = `${event.clientX + (Math.random() - .5) * 28}px`;
    tile.style.top = `${event.clientY + (Math.random() - .5) * 28}px`;
    tile.style.setProperty("--float-x", `${offsetX}px`);
    tile.style.setProperty("--float-y", `${offsetY}px`);
    cursorGrid.appendChild(tile);
    window.setTimeout(() => tile.remove(), 950);
  }, { passive: true });
}

const menuButton = document.querySelector(".menu-button");
const nav = document.querySelector(".nav");
menuButton.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  menuButton.setAttribute("aria-expanded", String(open));
});
document.querySelectorAll(".nav a").forEach((link) => {
  link.addEventListener("click", () => {
    nav.classList.remove("open");
    menuButton.setAttribute("aria-expanded", "false");
  });
});

document.querySelectorAll(".filter").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".filter").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    const category = button.dataset.filter;
    document.querySelectorAll(".project-card").forEach((card) => {
      card.classList.toggle("hidden", category !== "all" && card.dataset.category !== category);
    });
  });
});

document.querySelector(".copy-button").addEventListener("click", async (event) => {
  const status = document.querySelector(".copy-status");
  try {
    await navigator.clipboard.writeText(event.currentTarget.dataset.email);
    status.textContent = "Email copied.";
  } catch {
    status.textContent = "maknunsifat2002@gmail.com";
  }
});

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: .12 });
document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));

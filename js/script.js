const body = document.body;
const menuToggle = document.querySelector(".menu-toggle");
const nav = document.querySelector(".site-nav");
const navLinks = Array.from(document.querySelectorAll(".site-nav a"));
const filterButtons = Array.from(document.querySelectorAll(".filter-btn"));
const projectCards = Array.from(document.querySelectorAll(".project-card"));
const revealElements = Array.from(document.querySelectorAll(".reveal"));
const skillFills = Array.from(document.querySelectorAll(".skill-fill"));
const contactForm = document.getElementById("contact-form");
const formStatus = document.querySelector(".form-status");
const year = document.getElementById("year");
const cursorGlow = document.querySelector(".cursor-glow");

if (year) {
  year.textContent = new Date().getFullYear();
}

if (menuToggle && nav) {
  menuToggle.addEventListener("click", () => {
    const expanded = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!expanded));
    nav.classList.toggle("open");
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
    });
  });
}

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  },
  { threshold: 0.15 },
);

revealElements.forEach((element) => sectionObserver.observe(element));

const skillObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      skillFills.forEach((fill) => {
        const width = fill.getAttribute("data-width");
        fill.style.width = `${width}%`;
      });

      observer.disconnect();
    });
  },
  { threshold: 0.3 },
);

const skillSection = document.getElementById("skills");
if (skillSection) {
  skillObserver.observe(skillSection);
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.getAttribute("data-filter");

    filterButtons.forEach((btn) => btn.classList.remove("active"));
    button.classList.add("active");

    projectCards.forEach((card) => {
      const category = card.getAttribute("data-category");
      const shouldShow = filter === "all" || category === filter;
      card.style.display = shouldShow ? "flex" : "none";
    });
  });
});

const navSectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      const id = entry.target.getAttribute("id");
      navLinks.forEach((link) => {
        const active = link.getAttribute("href") === `#${id}`;
        link.classList.toggle("active", active);
      });
    });
  },
  { threshold: 0.5 },
);

const sections = Array.from(document.querySelectorAll("main section[id]"));
sections.forEach((section) => navSectionObserver.observe(section));

if (contactForm && formStatus) {
  contactForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = document.getElementById("name").value.trim();

    if (!name) {
      formStatus.textContent = "Please enter your name before submitting.";
      return;
    }

    formStatus.textContent = `Thanks ${name}, your message has been captured.`;
    contactForm.reset();
  });
}

if (cursorGlow) {
  window.addEventListener("pointermove", (event) => {
    cursorGlow.style.left = `${event.clientX}px`;
    cursorGlow.style.top = `${event.clientY}px`;
  });
}

// Lightweight canvas particle field for ambient futuristic motion.
const canvas = document.getElementById("particle-canvas");
if (canvas) {
  const ctx = canvas.getContext("2d");
  const particles = [];
  const particleCount = Math.min(80, Math.floor(window.innerWidth / 16));

  const resizeCanvas = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };

  const makeParticle = () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: Math.random() * 1.8 + 0.4,
    vx: (Math.random() - 0.5) * 0.28,
    vy: (Math.random() - 0.5) * 0.28,
    alpha: Math.random() * 0.6 + 0.2,
  });

  const initParticles = () => {
    particles.length = 0;
    for (let i = 0; i < particleCount; i += 1) {
      particles.push(makeParticle());
    }
  };

  const draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach((p, idx) => {
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

      ctx.beginPath();
      ctx.fillStyle = `rgba(215, 109, 255, ${p.alpha})`;
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();

      for (let j = idx + 1; j < particles.length; j += 1) {
        const p2 = particles[j];
        const dx = p.x - p2.x;
        const dy = p.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) {
          const opacity = (1 - dist / 100) * 0.18;
          ctx.beginPath();
          ctx.strokeStyle = `rgba(200, 96, 255, ${opacity})`;
          ctx.lineWidth = 1;
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      }
    });

    requestAnimationFrame(draw);
  };

  resizeCanvas();
  initParticles();
  draw();

  window.addEventListener("resize", () => {
    resizeCanvas();
    initParticles();
  });
}

body.classList.add("js-ready");

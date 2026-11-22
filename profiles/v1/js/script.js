/* Edit this object to update the portfolio without changing the layout. */
const data = {
  email: "maknunsifat2002@gmail.com",
  research: [
    { status: "Ongoing", title: "Final Year Design Project: PackagePolice", meta: "United International University (UIU) · Supervisor: Dr. Al-Sakib Khan Pathan", text: "ML-based VS Code extension that detects malicious npm and PyPI packages before installation, using multi-signal risk scoring and typosquatting detection. Conducted the literature review and gap analysis of related work on malicious-package detection." },
    { status: "Submitted", title: "Layer by Layer: An Empirical Ablation of Replay Defenses in a Signed Banking API", meta: "Submitted to a conference", text: "Evaluated request signatures, timestamp windows, single-use nonces and idempotency keys across all 16 layer configurations and 11 attack scenarios. Showed why successful-request-only idempotency fails against failed replays, and that nonce retention must cover both past and future tolerance windows." },
    { status: "In progress", title: "Carbon-Aware Edge Intelligence", meta: "Multi-Objective Scheduling for Sustainable Water-Quality Monitoring", text: "A lightweight rule-based scheduler for low-cost ESP32 nodes that chooses local TinyML inference, delayed buffering or cloud upload using anomaly probability, battery level and grid carbon intensity." }
  ],
  experience: [
    ["Oct 2026 — Present", "Co-Head of Academic Growth & Development", "UIU App Forum", ["Lead academic workshops, team management initiatives, and peer mentorship programs to build software and application development skills among students."]],
    ["Feb 2026 — Present", "Robotics and Project Showcase Specialist", "UIU Robotics", ["Spearhead project management, technical showcases, and event management for university robotics initiatives and inter-university competitions."]],
    ["Sep 2025 — Present", "R&D Team Lead, ROV Pilot & Electrical Member", "UIU Mariner", ["Lead the R&D team: study earlier teams' designs and technical documentation to extract key findings, lessons learned, and reusable approaches for our vehicle.", "Compare and evaluate candidate components and subsystems to decide which are most suitable, turning the findings into concrete design decisions for the team.", "Serve as primary ROV Pilot and core electrical team member; contribute to embedded systems design, sensor integration, and electronics troubleshooting."]],
    ["Aug 2025 — Present", "Undergraduate Teaching Assistant", "United International University (UIU)", ["Assist faculty in conducting laboratory sessions, evaluating assignments, and mentoring undergraduate CSE students.", "Guide student groups in project planning, code debugging, and hardware-software integration."]]
  ],
  projects: [
    ["KrishiBondhu","Champion, Build with Gemma @Bangladesh Hybrid Hackathon '26.","AI-powered agricultural solution developed during the national hybrid hackathon.","software","https://github.com/SiFAT-07/GemmaAI-Comp","resources/poster.jpg"],
    ["Advyon","Champion, UIU CSE Project Show 2026.","Software system awarded first place at the departmental project showcase.","software","https://github.com/SiFAT-07/advyon-client","resources/advyon.jpg"],
    ["FinVision AI","Team project.","React Native (Expo) personal finance app for students with natural-language expense logging via an LLM API, receipt scanning (OCR), financial health score, and group expense splitting. Provider-agnostic AI layer switchable by configuration.","software","https://github.com/Team-Anton/Finvision-3.0","resources/profile.jpg"],
    ["ResQ","Champion, UIU CSE Project Show 2025.","Emergency response system designed and architected for CSE 251.","software","https://github.com/SiFAT-07/ResQ","resources/resq.jpg"],
    ["Fire Safety Map","1st Runner-Up, UIU CSE Project Show 2025.","Relational database and mapping platform for fire safety infrastructure.","software","https://github.com/SiFAT-07/Fire_Project","resources/dbms.jpg"],
    ["Req-U","2nd Runner-Up, UIU CSE Project Show 2025.","Embedded hardware and microcontroller system built for CSE 252.","robotics","https://youtu.be/ALNjF5psijo","resources/micro.jpg"],
    ["Assistive Gloves","2nd Runner-Up, UIU CSE Project Show 2024.","Arduino-based wearable assistive technology for blind and mute individuals using sensors and actuators.","robotics","https://github.com/SiFAT-07/Assistive-Gloves-For-Blind-And-Mute-Arduino-Project-","resources/Electronics.jpg"]
  ],
  awards: [["2026","South Asian Champion, Global Finalist & On-Field Competitor","MATE ROV World Championship 2026 [Explorer Class]"],["2026","Champion","Build with Gemma @Bangladesh Hybrid Hackathon '26"],["2025","1st Runner-Up","UIU CSE Fest 2025 (Robo-Soccer Segment, National Competition)"],["2026","1st Runner-Up","Rush Hour: Override 26 (Inter-University Robo-Soccer)"],["2025","1st Runner-Up","Rush Hour 25 (Inter-University Robo-Soccer)"],["2026","Champion","UIU CSE Project Show 2026"],["2025","Champion","UIU CSE Project Show 2025"],["2025","2nd Runner-Up","UIU Research & Innovation Week 2025"]],
  skills: { "Programming": ["C","C++","Java"], "Security & Data": ["API security (replay-defense analysis)","ML-based malicious-package detection","synthetic data generation (SDV)"], "Edge & IoT": ["ESP32","TinyML","Arduino","Raspberry Pi","Embedded Systems","Sensors & Actuators","simulation (Java)"], "Web, Mobile & DB": ["HTML","CSS","MySQL","React Native"], "Tools": ["Git","GitHub","Microsoft Excel","Autodesk Fusion 360 (Basic)"], "Soft Skills": ["Research & Technical Writing","Leadership","Team Management","Project Management","Event Management","Mentoring"], "Languages": ["English","Bangla","Hindi"] }
};

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const profileImage = $(".profile-chip img");
profileImage.addEventListener("error", () => { profileImage.style.display = "none"; $(".profile-chip .initials").style.display = "grid"; });

$("#research-grid").innerHTML = data.research.map((item) => `<article class="research-card card"><span class="status">${item.status}</span><h3>${item.title}</h3><p class="muted">${item.meta}</p><p class="detail">${item.text}</p><button class="expand" type="button" aria-expanded="false">Read abstract +</button></article>`).join("");
$("#experience-list").innerHTML = data.experience.map(([date, title, org, bullets]) => `<article class="experience-item"><span class="mono">${date}</span><h3>${title}</h3><p class="muted">${org}</p><ul>${bullets.map((bullet) => `<li>${bullet}</li>`).join("")}</ul></article>`).join("");
$("#project-grid").innerHTML = data.projects.map(([title, award, description, category, link, image]) => `<article class="project-card card" data-category="${category}" tabindex="0"><img class="project-image" src="${image}" alt="${title} project visual" loading="lazy" width="640" height="370"><span class="status">${award}</span><h3>${title}</h3><p>${description}</p><div class="project-footer"><span class="mono">${category === "robotics" ? "ROBOTICS / EMBEDDED" : "SOFTWARE"}</span><a href="${link}" target="_blank" rel="noopener noreferrer">Repository / demo ↗</a></div></article>`).join("");
$("#awards-list").innerHTML = data.awards.map(([year, award, title]) => `<div class="award"><span class="award-year">${year}</span><div><span class="award-badge">${award}</span> ${title}</div><span class="award-icon">✦</span></div>`).join("");
$("#skill-list").innerHTML = Object.entries(data.skills).map(([category, skills]) => `<details class="skill-group" open><summary>${category}</summary><div class="skill-items">${skills.map((skill) => `<button type="button" class="skill-chip" data-skill="${skill}">${skill}</button>`).join("")}</div></details>`).join("");

$$(".expand").forEach((button) => button.addEventListener("click", () => { const card = button.closest(".research-card"); const open = card.classList.toggle("open"); button.setAttribute("aria-expanded", String(open)); button.textContent = open ? "Collapse abstract −" : "Read abstract +"; }));
$$(".filter").forEach((button) => button.addEventListener("click", () => { $$(".filter").forEach((item) => item.classList.remove("active")); button.classList.add("active"); const filter = button.dataset.filter; $$(".project-card").forEach((card) => { card.hidden = filter !== "all" && card.dataset.category !== filter; }); }));

const themeButton = $(".theme-toggle");
try { const storedTheme = localStorage.getItem("portfolio-theme"); if (storedTheme) document.documentElement.dataset.theme = storedTheme; } catch { /* localStorage can be unavailable in private contexts. */ }
const updateThemeLabel = () => themeButton.setAttribute("aria-label", document.documentElement.dataset.theme === "light" ? "Switch to dark theme" : "Switch to light theme");
updateThemeLabel();
themeButton.addEventListener("click", () => { const theme = document.documentElement.dataset.theme === "light" ? "dark" : "light"; document.documentElement.dataset.theme = theme; updateThemeLabel(); try { localStorage.setItem("portfolio-theme", theme); } catch { /* Theme still applies for this session. */ } });

const menu = $(".menu-toggle"); const nav = $(".site-nav");
menu.addEventListener("click", () => { const open = menu.getAttribute("aria-expanded") === "true"; menu.setAttribute("aria-expanded", String(!open)); nav.classList.toggle("open", !open); });
$$(".site-nav a").forEach((link) => link.addEventListener("click", () => { menu.setAttribute("aria-expanded", "false"); nav.classList.remove("open"); }));
const observer = new IntersectionObserver((entries) => entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add("visible")), { threshold: .12 }); $$(".reveal").forEach((element) => observer.observe(element));
const sections = $$("main section[id]"); const navObserver = new IntersectionObserver((entries) => entries.forEach((entry) => { if (entry.isIntersecting) $$(".site-nav a").forEach((link) => link.classList.toggle("active", link.hash === `#${entry.target.id}`)); }), { rootMargin: "-35% 0px -55% 0px" }); sections.forEach((section) => navObserver.observe(section));
const progress = $(".scroll-progress"); window.addEventListener("descent:update", (event) => { progress.style.width = `${event.detail.scrollProgress * 100}%`; });
$("#year").textContent = new Date().getFullYear();
$("#copy-email").addEventListener("click", async () => { const status = $("#copy-status"); try { await navigator.clipboard.writeText(data.email); status.textContent = "Email copied to clipboard."; } catch { status.textContent = `Copy failed — email: ${data.email}`; } });

let pointerX = 0, pointerY = 0; addEventListener("pointermove", (event) => { pointerX = event.clientX / innerWidth - .5; pointerY = event.clientY / innerHeight - .5; const glow = $(".cursor-glow"); if (matchMedia("(pointer:fine)").matches) { glow.style.left = `${event.clientX}px`; glow.style.top = `${event.clientY}px`; } });
$$(".project-card,.research-card").forEach((card) => card.addEventListener("pointermove", (event) => { if (reduceMotion || !matchMedia("(pointer:fine)").matches) return; const rect = card.getBoundingClientRect(); card.style.transform = `perspective(700px) rotateX(${(event.clientY - rect.top - rect.height / 2) / -25}deg) rotateY(${(event.clientX - rect.left - rect.width / 2) / 25}deg) translateY(-4px)`; })); $$(".project-card,.research-card").forEach((card) => card.addEventListener("pointerleave", () => { card.style.transform = ""; }));

function createScene(canvas, skillScene = false) {
  if (!canvas) return;
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
    canvas.style.display = "none";
    canvas.parentElement.querySelector(skillScene ? ".constellation-fallback" : ".scene-fallback").style.display = "grid";
    return;
  }
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  } catch {
    canvas.style.display = "none";
    canvas.parentElement.querySelector(skillScene ? ".constellation-fallback" : ".scene-fallback").style.display = "grid";
    return;
  }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.7)); renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
  const scene = new THREE.Scene(); const camera = new THREE.PerspectiveCamera(42, canvas.clientWidth / canvas.clientHeight, .1, 100); camera.position.z = skillScene ? 8 : 6;
  scene.add(new THREE.AmbientLight(0x9ceff2, 2.2)); const light = new THREE.PointLight(0x4de4e6, 14, 20); light.position.set(3, 3, 4); scene.add(light);
  if (!skillScene) {
    const fillLight = new THREE.PointLight(0x2878ff, 10, 18);
    fillLight.position.set(-4, 1, 2);
    scene.add(fillLight);
    const warmLight = new THREE.PointLight(0xff9b58, 5, 14);
    warmLight.position.set(1, -3, -3);
    scene.add(warmLight);
  }
  const group = new THREE.Group(); scene.add(group);
  if (!skillScene) {
    const body = new THREE.Mesh(new THREE.BoxGeometry(2.8, 1.25, 1.45), new THREE.MeshStandardMaterial({ color: 0x12627a, metalness: .7, roughness: .25 })); group.add(body);
    const frame = new THREE.Mesh(new THREE.BoxGeometry(3.2, 1.55, 1.75), new THREE.MeshBasicMaterial({ color: 0x4de4e6, wireframe: true, transparent: true, opacity: .35 })); group.add(frame);
    const cameraEye = new THREE.Mesh(new THREE.SphereGeometry(.38, 20, 12), new THREE.MeshStandardMaterial({ color: 0x06121d, metalness: .7, roughness: .1 })); cameraEye.position.set(0, .05, -.86); group.add(cameraEye);
    [-1, 1].forEach((x) => [-1, 1].forEach((z) => { const thruster = new THREE.Mesh(new THREE.CylinderGeometry(.25, .25, .75, 16), new THREE.MeshStandardMaterial({ color: 0x8db6bf, metalness: .8 })); thruster.rotation.z = Math.PI / 2; thruster.position.set(x * 1.35, -.58, z * .5); group.add(thruster); }));
    const tube = new THREE.Mesh(new THREE.CylinderGeometry(.3, .3, 1.1, 16), new THREE.MeshStandardMaterial({ color: 0x8dd6df, metalness: .4, transparent: true, opacity: .8 })); tube.rotation.z = Math.PI / 2; tube.position.y = .75; group.add(tube);
  } else {
    const nodes = Object.values(data.skills).flat().slice(0, 25); nodes.forEach((name, index) => { const node = new THREE.Mesh(new THREE.SphereGeometry(.12 + (index % 3) * .035, 12, 8), new THREE.MeshStandardMaterial({ color: index % 2 ? 0x4de4e6 : 0x9ceff2, emissive: 0x0d525e, emissiveIntensity: 1.2 })); const angle = index * 2.4; node.position.set(Math.cos(angle) * (1.2 + index % 4 * .35), Math.sin(angle * 1.3) * 1.4, (index % 5 - 2) * .35); group.add(node); });
  }
  const bubbles = new THREE.Group(); for (let i = 0; i < 80; i++) { const bubble = new THREE.Mesh(new THREE.SphereGeometry(.012 + Math.random() * .035, 6, 6), new THREE.MeshBasicMaterial({ color: 0x76dce2, transparent: true, opacity: .4 })); bubble.position.set((Math.random() - .5) * 8, (Math.random() - .5) * 6, (Math.random() - .5) * 4); bubbles.add(bubble); } scene.add(bubbles);
  let dragging = false, lastX = 0, lastY = 0; canvas.addEventListener("pointerdown", (event) => { dragging = true; lastX = event.clientX; lastY = event.clientY; canvas.setPointerCapture(event.pointerId); }); canvas.addEventListener("pointerup", () => { dragging = false; }); canvas.addEventListener("pointermove", (event) => { if (dragging) { group.rotation.y += (event.clientX - lastX) * .008; group.rotation.x += (event.clientY - lastY) * .008; lastX = event.clientX; lastY = event.clientY; } });
  window.addEventListener("descent:update", (event) => { const { normalized, velocity } = event.detail; group.position.y = -normalized * 1.5; group.rotation.z = Math.max(-.12, Math.min(.12, velocity * .002)); light.intensity = 12 + normalized * 10; });
  let running = true; const visibility = new IntersectionObserver(([entry]) => { running = entry.isIntersecting && !document.hidden; }, { threshold: .05 }); if (canvas instanceof Element) visibility.observe(canvas); document.addEventListener("visibilitychange", () => { running = !document.hidden; });
  const resize = () => { renderer.setSize(canvas.clientWidth, canvas.clientHeight, false); camera.aspect = canvas.clientWidth / canvas.clientHeight; camera.updateProjectionMatrix(); }; addEventListener("resize", resize);
  const animate = (time) => { requestAnimationFrame(animate); if (!running) return; if (!dragging) { group.rotation.y += .002; group.rotation.x += (pointerY * .15 - group.rotation.x) * .01; } bubbles.rotation.y += .0005; renderer.render(scene, camera); }; animate(0);
}
const skillsCanvas = $("#skills-scene");
if (skillsCanvas) {
  const sceneObserver = new IntersectionObserver((entries, instance) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        createScene(entry.target, true);
        instance.unobserve(entry.target);
      }
    });
  }, { rootMargin: "200px" });
  sceneObserver.observe(skillsCanvas);
}
$$(".magnetic").forEach((button) => button.addEventListener("pointermove", (event) => {
  if (reduceMotion || !matchMedia("(pointer:fine)").matches) return;
  const rect = button.getBoundingClientRect();
  button.style.transform = `translate(${(event.clientX - rect.left - rect.width / 2) * .12}px, ${(event.clientY - rect.top - rect.height / 2) * .12}px)`;
}));
$$(".magnetic").forEach((button) => button.addEventListener("pointerleave", () => { button.style.transform = ""; }));

/* One source of truth for scroll depth, zones, gauge, readouts and background consumers. */
const DESCENT_CONFIG = {
  maxDepth: 11000,
  lerp: .085,
  gaugeTickEvery: 200,
  majorTickEvery: 1000,
  minFadeViewportRatio: .25,
  readouts: {
    surfaceTemperature: 28,
    deepTemperature: 1.5,
    thermoclineScale: 500,
    lightScale: 70
  },
  zones: [
    { id: "surface", name: "Surface", sectionSelector: "#hero", startDepth: 0, endDepth: 100, target: "hero" },
    { id: "sunlight", name: "Sunlight Zone", sectionSelector: "#awards", startDepth: 100, endDepth: 200, target: "awards" },
    { id: "twilight", name: "Twilight Zone", sectionSelector: "#experience", startDepth: 200, endDepth: 1000, target: "experience" },
    { id: "midnight", name: "Midnight Zone", sectionSelector: "#projects", startDepth: 1000, endDepth: 4000, target: "projects" },
    { id: "abyssal", name: "Abyssal Zone", sectionSelector: "#research", startDepth: 4000, endDepth: 6000, target: "research" },
    { id: "hadal", name: "Hadal Trench", sectionSelector: "#contact", startDepth: 6000, endDepth: 11000, target: "contact" }
  ],
  colors: {
    surface: { hue: 188, darkness: 0, accent: "#4de4e6" },
    deep: { hue: 218, darkness: .55, accent: "#62b9e8" },
    trench: { hue: 230, darkness: .92, accent: "#9b8cff" }
  }
};
window.DESCENT_CONFIG = DESCENT_CONFIG;

(() => {
  const gauge = document.querySelector("#depth-scale");
  const fill = document.querySelector("#depth-fill");
  if (!gauge || !fill) return;

  const $ = (selector) => document.querySelector(selector);
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const root = document.documentElement;
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const lerp = (a, b, amount) => a + (b - a) * amount;
  const smoothstep = (value) => value * value * (3 - 2 * value);
  const state = {
    scrollProgress: 0,
    targetDepth: 0,
    displayDepth: 0,
    currentZoneId: "surface",
    zoneProgress: 0,
    scrollVelocity: 0,
    gaugePosition: 0,
    raf: 0,
    lastScrollY: window.scrollY,
    lastZoneId: null,
    zoneMetrics: []
  };
  window.descentState = state;
  window.__DESCENT_STATE__ = state;

  const metrics = () => {
    const headerHeight = document.querySelector(".site-header")?.getBoundingClientRect().height || 0;
    const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    state.zoneMetrics = DESCENT_CONFIG.zones.map((zone, index) => {
      const element = document.querySelector(zone.sectionSelector);
      const rawStart = index === 0 ? 0 : (element?.getBoundingClientRect().top || 0) + window.scrollY - headerHeight;
      const lastZoneScrollRoom = index === DESCENT_CONFIG.zones.length - 1
        ? Math.min(window.innerHeight * .6, maxScroll * .25)
        : 0;
      const start = clamp(rawStart, 0, Math.max(0, maxScroll - lastZoneScrollRoom));
      const nextSelector = DESCENT_CONFIG.zones[index + 1]?.sectionSelector;
      const nextElement = nextSelector ? document.querySelector(nextSelector) : null;
      const end = index === DESCENT_CONFIG.zones.length - 1
        ? maxScroll
        : clamp((nextElement?.getBoundingClientRect().top || maxScroll) + window.scrollY - headerHeight, start + 1, maxScroll);
      zone.scrollStart = start;
      zone.scrollEnd = end;
      return { id: zone.id, start, end };
    });
    return maxScroll;
  };

  const zoneAtDepth = (depth) => DESCENT_CONFIG.zones.find((zone, index) => depth >= zone.startDepth && (depth < zone.endDepth || index === DESCENT_CONFIG.zones.length - 1)) || DESCENT_CONFIG.zones[0];
  const zoneAtScroll = (scrollY) => {
    let index = 0;
    state.zoneMetrics.forEach((metric, metricIndex) => { if (scrollY >= metric.start) index = metricIndex; });
    return DESCENT_CONFIG.zones[index];
  };
  const gaugePositionFor = (depth) => {
    const zone = zoneAtDepth(depth);
    const index = DESCENT_CONFIG.zones.indexOf(zone);
    const progress = clamp((depth - zone.startDepth) / Math.max(1, zone.endDepth - zone.startDepth), 0, 1);
    return (index + smoothstep(progress)) / DESCENT_CONFIG.zones.length * 100;
  };
  const readouts = (depth) => ({
    light: clamp(Math.round(Math.exp(-depth / DESCENT_CONFIG.readouts.lightScale) * 100), 0, 100),
    temperature: DESCENT_CONFIG.readouts.deepTemperature + (DESCENT_CONFIG.readouts.surfaceTemperature - DESCENT_CONFIG.readouts.deepTemperature) * Math.exp(-depth / DESCENT_CONFIG.readouts.thermoclineScale),
    pressure: 1 + depth / 10
  });
  const colorAt = (depth) => {
    const progress = depth / DESCENT_CONFIG.maxDepth;
    if (progress < .25) return { hue: lerp(DESCENT_CONFIG.colors.surface.hue, DESCENT_CONFIG.colors.deep.hue, progress / .25), darkness: lerp(0, DESCENT_CONFIG.colors.deep.darkness, progress / .25) };
    return { hue: lerp(DESCENT_CONFIG.colors.deep.hue, DESCENT_CONFIG.colors.trench.hue, (progress - .25) / .75), darkness: lerp(DESCENT_CONFIG.colors.deep.darkness, DESCENT_CONFIG.colors.trench.darkness, (progress - .25) / .75) };
  };

  const showToast = (zone, depth) => {
    return { zone, depth };
  };

  const render = () => {
    const zone = zoneAtDepth(state.displayDepth);
    const zoneIndex = DESCENT_CONFIG.zones.indexOf(zone);
    const zoneProgress = clamp((state.displayDepth - zone.startDepth) / Math.max(1, zone.endDepth - zone.startDepth), 0, 1);
    const reading = readouts(state.displayDepth);
    const color = colorAt(state.displayDepth);
    state.currentZoneId = zone.id;
    state.zoneProgress = zoneProgress;
    state.gaugePosition = gaugePositionFor(state.displayDepth);
    fill.style.height = `${(state.displayDepth / DESCENT_CONFIG.maxDepth * 100).toFixed(2)}%`;
    gauge.setAttribute("aria-valuenow", String(Math.round(state.displayDepth)));
    gauge.setAttribute("aria-valuetext", `${Math.round(state.displayDepth).toLocaleString()} meters, ${zone.name}`);
    $("#depth-zone-name").textContent = zone.name;
    $("#depth-value").textContent = `${Math.round(state.displayDepth).toLocaleString()} m`;
    $("#pressure-value").textContent = `${reading.pressure.toFixed(1)} atm`;
    $("#temperature-value").textContent = `${reading.temperature.toFixed(1)} °C`;
    $("#light-value").textContent = `${reading.light}% light`;
    root.style.setProperty("--ocean-progress", (state.displayDepth / DESCENT_CONFIG.maxDepth).toFixed(4));
    root.style.setProperty("--ocean-hue", color.hue.toFixed(1));
    root.style.setProperty("--ocean-darkness", color.darkness.toFixed(4));
    root.style.setProperty("--ocean-light", String(reading.light / 100));
    if (state.lastZoneId && state.lastZoneId !== zone.id) showToast(zone, state.displayDepth);
    state.lastZoneId = zone.id;
    const detail = {
      scrollProgress: state.scrollProgress,
      targetDepth: state.targetDepth,
      displayDepth: state.displayDepth,
      depth: state.displayDepth,
      currentZoneId: state.currentZoneId,
      zoneProgress: state.zoneProgress,
      scrollVelocity: state.scrollVelocity,
      velocity: state.scrollVelocity,
      normalized: state.displayDepth / DESCENT_CONFIG.maxDepth,
      gaugePosition: state.gaugePosition,
      light: reading.light,
      temperature: reading.temperature,
      pressure: reading.pressure,
      zoneIndex
    };
    window.__DESCENT_STATE__ = detail;
    window.dispatchEvent(new CustomEvent("descent:update", { detail }));
    renderDebug(detail);
  };

  const renderDebug = (detail) => {
    if (!window.location.search.includes("debug=1")) return;
    let panel = $("#descent-debug");
    if (!panel) {
      panel = document.createElement("pre");
      panel.id = "descent-debug";
      document.body.appendChild(panel);
    }
    panel.textContent = `scrollProgress ${detail.scrollProgress.toFixed(3)}\ntargetDepth ${detail.targetDepth.toFixed(1)}\ndisplayDepth ${detail.displayDepth.toFixed(1)}\nzone ${detail.currentZoneId}\nzoneProgress ${detail.zoneProgress.toFixed(3)}\ngauge ${detail.gaugePosition.toFixed(2)}%`;
    panel.dataset.video = JSON.stringify(window.__VIDEO_OPACITY__ || {});
  };

  const update = () => {
    state.raf = 0;
    const maxScroll = metrics();
    state.scrollProgress = clamp(window.scrollY / maxScroll, 0, 1);
    const scrollZone = zoneAtScroll(window.scrollY);
    const scrollMetric = state.zoneMetrics[DESCENT_CONFIG.zones.indexOf(scrollZone)];
    const rawProgress = clamp((window.scrollY - scrollMetric.start) / Math.max(1, scrollMetric.end - scrollMetric.start), 0, 1);
    state.targetDepth = scrollZone.startDepth + smoothstep(rawProgress) * (scrollZone.endDepth - scrollZone.startDepth);
    state.displayDepth = reduced ? state.targetDepth : lerp(state.displayDepth, state.targetDepth, DESCENT_CONFIG.lerp);
    state.scrollVelocity = window.scrollY - state.lastScrollY;
    state.lastScrollY = window.scrollY;
    render();
    if (!reduced && !document.hidden) state.raf = requestAnimationFrame(update);
  };

  const schedule = () => { if (!state.raf) state.raf = requestAnimationFrame(update); };
  const resizeObserver = new ResizeObserver(() => { metrics(); schedule(); });
  resizeObserver.observe(document.body);
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", () => { metrics(); schedule(); }, { passive: true });
  window.addEventListener("load", () => { metrics(); schedule(); });
  document.addEventListener("visibilitychange", () => { if (!document.hidden) schedule(); });
  metrics();
  state.targetDepth = 0;
  state.displayDepth = 0;
  state.lastZoneId = "surface";
  update();
})();

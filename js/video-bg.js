/* Video backgrounds consume only the shared descent:update state. */
const VIDEO_BACKGROUND_CONFIG = {
  fadeWidth: 80,
  minFadeViewportRatio: .25,
  holdLastClip: true,
  holdLastClipDarken: .78,
  holdLastClipSlowdown: .55,
  posterOnlyOnReducedMotion: true,
  lowPowerMaxCores: 4,
  slowConnectionTypes: ["slow-2g", "2g"],
  depthMax: 11000,
  zones: [
    { id: "surface", mp4: "resources/Surface.mp4", enabled: true, tint: "#5fe8e0", overlayOpacity: .16 },
    { id: "sunlight", mp4: "resources/Sunlight.mp4", enabled: true, tint: "#54cfe0", overlayOpacity: .2 },
    { id: "twilight", mp4: "resources/Twilight Zone.mp4", enabled: true, tint: "#3d8db6", overlayOpacity: .3 },
    { id: "midnight", mp4: "resources/Midnight Zone.mp4", enabled: true, tint: "#254f8f", overlayOpacity: .42 },
    { id: "abyssal", mp4: "resources/Abyssal Zone.mp4", enabled: true, tint: "#173d72", overlayOpacity: .52 },
    { id: "hadal", mp4: "resources/Hadal Trench.mp4", enabled: true, tint: "#37294d", overlayOpacity: .64 }
  ]
};
window.VIDEO_BACKGROUND_CONFIG = VIDEO_BACKGROUND_CONFIG;

(() => {
  const layerA = document.querySelector("#video-layer-a");
  const layerB = document.querySelector("#video-layer-b");
  const root = document.documentElement;
  const descentConfig = window.DESCENT_CONFIG;
  if (!layerA || !layerB || !descentConfig) return;

  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mobile = matchMedia("(max-width: 800px)").matches;
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const lowPower = mobile || (navigator.hardwareConcurrency || 8) <= VIDEO_BACKGROUND_CONFIG.lowPowerMaxCores;
  const posterOnly = (reduced && VIDEO_BACKGROUND_CONFIG.posterOnlyOnReducedMotion) || lowPower || connection?.saveData || VIDEO_BACKGROUND_CONFIG.slowConnectionTypes.includes(connection?.effectiveType);
  const layers = [layerA, layerB];
  const failed = new Set();
  const ready = new Set();
  const lerp = (a, b, amount) => a + (b - a) * amount;
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const smoothstep = (value) => value * value * (3 - 2 * value);
  const state = {
    displayDepth: window.__DESCENT_STATE__?.displayDepth || 0,
    velocity: 0,
    speed: 1,
    targetSpeed: 1,
    assigned: [null, null],
    pendingPlay: false,
    raf: 0
  };

  const zoneById = (id) => descentConfig.zones.find((zone) => zone.id === id);
  const enabledZones = () => VIDEO_BACKGROUND_CONFIG.zones
    .filter((zone) => zone.enabled && !failed.has(zone.id))
    .map((zone) => Object.assign(zone, zoneById(zone.id) || {}))
    .filter((zone) => Number.isFinite(zone.startDepth));
  const currentVideoIndex = (available) => {
    let index = 0;
    available.forEach((zone, zoneIndex) => {
      if (state.displayDepth >= zone.startDepth - VIDEO_BACKGROUND_CONFIG.fadeWidth) index = zoneIndex;
    });
    return index;
  };
  const sourceCandidates = (zone, extension) => {
    const normal = zone[extension];
    if (!normal) return [];
    if (!mobile) return [normal];
    const dot = normal.lastIndexOf(".");
    return [`${normal.slice(0, dot)}-720${normal.slice(dot)}`, normal];
  };
  const setPoster = (video, zone) => {
    if (!zone.poster) {
      video.removeAttribute("poster");
      video.style.backgroundImage = "";
      return;
    }
    video.poster = zone.poster;
    video.style.backgroundImage = `url("${zone.poster}")`;
    video.style.backgroundSize = "cover";
    video.style.backgroundPosition = "center";
  };
  const clearVideo = (video) => {
    video.pause();
    video.removeAttribute("src");
    video.querySelectorAll("source").forEach((source) => source.remove());
    video.load();
    video.style.opacity = "0";
    video.style.backgroundImage = "";
  };
  const failZone = (zone, error) => {
    if (failed.has(zone.id)) return;
    failed.add(zone.id);
    ready.delete(zone.id);
    console.warn(`[video-bg] Skipping ${zone.id}: enabled video failed to load. Check ${zone.mp4}, ${zone.webm}, and ${zone.poster}.`, error || "");
  };
  const loadZone = (slot, zone) => {
    if (!zone || failed.has(zone.id) || state.assigned[slot]?.id === zone.id) return;
    if (state.assigned[slot]) clearVideo(layers[slot]);
    state.assigned[slot] = zone;
    setPoster(layers[slot], zone);
    // A poster-only mode is useful only when a real poster exists.
    // The newly added zone clips intentionally use their MP4 as the fallback.
    if (posterOnly && zone.poster) {
      ready.add(zone.id);
      return;
    }
    sourceCandidates(zone, "webm").forEach((sourcePath) => {
      const source = document.createElement("source");
      source.src = sourcePath;
      source.type = "video/webm";
      layers[slot].appendChild(source);
    });
    sourceCandidates(zone, "mp4").forEach((sourcePath) => {
      const source = document.createElement("source");
      source.src = sourcePath;
      source.type = "video/mp4";
      layers[slot].appendChild(source);
    });
    layers[slot].oncanplay = () => {
      if (state.assigned[slot]?.id !== zone.id) return;
      ready.add(zone.id);
      layers[slot].play().catch(() => { state.pendingPlay = true; });
    };
    layers[slot].onerror = () => {
      if (state.assigned[slot]?.id === zone.id) failZone(zone, layers[slot].error);
    };
    layers[slot].load();
  };
  const retryPlayback = () => {
    if (posterOnly) return;
    state.pendingPlay = false;
    layers.forEach((video) => video.play().catch(() => { state.pendingPlay = true; }));
  };
  window.addEventListener("pointerdown", retryPlayback, { passive: true });
  window.addEventListener("keydown", retryPlayback, { passive: true });

  const fadeDepthWidth = (zone) => {
    const spanDepth = Math.max(1, zone.endDepth - zone.startDepth);
    const spanPixels = Math.max(1, (zone.scrollEnd || window.innerHeight) - (zone.scrollStart || 0));
    const minDepthWidth = spanDepth * (window.innerHeight * VIDEO_BACKGROUND_CONFIG.minFadeViewportRatio) / spanPixels;
    return Math.max(VIDEO_BACKGROUND_CONFIG.fadeWidth, minDepthWidth);
  };
  const zoneWeight = (zone, depth, available, index) => {
    const previous = available[index - 1];
    const next = available[index + 1];
    const width = Math.min(fadeDepthWidth(zone), Math.max(1, zone.endDepth - zone.startDepth) / 2);
    let weight = previous
      ? smoothstep(clamp((depth - (zone.startDepth - width)) / (width * 2), 0, 1))
      : 1;
    if (next) {
      weight *= 1 - smoothstep(clamp((depth - (next.startDepth - width)) / (width * 2), 0, 1));
    } else if (depth > zone.endDepth) {
      if (!VIDEO_BACKGROUND_CONFIG.holdLastClip) return 0;
      weight *= 1 - smoothstep(clamp((depth - zone.endDepth) / Math.max(1, VIDEO_BACKGROUND_CONFIG.depthMax - zone.endDepth)) * VIDEO_BACKGROUND_CONFIG.holdLastClipDarken);
    }
    return clamp(weight, 0, 1);
  };
  const updateAssignments = (available, currentIndex) => {
    const nearBoundary = currentIndex > 0 && state.displayDepth < available[currentIndex].startDepth + fadeDepthWidth(available[currentIndex]);
    const adjacentIndex = nearBoundary ? currentIndex - 1 : Math.min(currentIndex + 1, available.length - 1);
    const desired = [available[currentIndex]];
    if (available[adjacentIndex] && adjacentIndex !== currentIndex) desired.push(available[adjacentIndex]);

    desired.forEach((zone) => {
      if (state.assigned.some((assigned) => assigned?.id === zone.id)) return;
      const emptySlot = state.assigned.findIndex((assigned) => !assigned);
      const replaceableSlot = state.assigned.findIndex((assigned) => assigned && !desired.some((item) => item.id === assigned.id));
      const slot = emptySlot >= 0 ? emptySlot : replaceableSlot;
      if (slot >= 0) loadZone(slot, zone);
    });

    layers.forEach((video, slot) => {
      const assigned = state.assigned[slot];
      if (assigned && !desired.some((zone) => zone.id === assigned.id)) {
        clearVideo(video);
        state.assigned[slot] = null;
      }
    });
  };

  const apply = () => {
    const available = enabledZones();
    if (!available.length) return;
    const index = currentVideoIndex(available);
    updateAssignments(available, index);
    const current = available[index];
    const nearBoundary = index > 0 && state.displayDepth < current.startDepth + fadeDepthWidth(current);
    const adjacentIndex = nearBoundary ? index - 1 : Math.min(index + 1, available.length - 1);
    const adjacent = available[adjacentIndex];
    const currentWeight = ready.has(current.id) ? zoneWeight(current, state.displayDepth, available, index) : 0;
    const adjacentWeight = adjacent && adjacent !== current && ready.has(adjacent.id) ? zoneWeight(adjacent, state.displayDepth, available, adjacentIndex) : 0;
    const readyWeightTotal = currentWeight + adjacentWeight;
    const currentOpacity = readyWeightTotal
      ? currentWeight / readyWeightTotal
      : ready.has(current.id) ? 1 : 0;
    const adjacentOpacity = readyWeightTotal
      ? adjacentWeight / readyWeightTotal
      : !ready.has(current.id) && adjacent && ready.has(adjacent.id) ? 1 : 0;
    layers.forEach((video, slot) => {
      const zone = state.assigned[slot];
      const opacity = zone?.id === current.id ? currentOpacity : zone?.id === adjacent?.id ? adjacentOpacity : 0;
      video.style.opacity = String(opacity);
      video.playbackRate = zone?.id === current.id && !adjacent && state.displayDepth > current.endDepth
        ? lerp(1, VIDEO_BACKGROUND_CONFIG.holdLastClipSlowdown, clamp((state.displayDepth - current.endDepth) / (VIDEO_BACKGROUND_CONFIG.depthMax - current.endDepth)))
        : state.speed;
      if (opacity > .01 && !posterOnly) video.play().catch(() => { state.pendingPlay = true; });
    });
    const active = adjacentOpacity > currentOpacity ? adjacent : current;
    const darkness = clamp(state.displayDepth / VIDEO_BACKGROUND_CONFIG.depthMax, 0, 1);
    const lightDarkness = (100 - (state.light || 0)) / 100;
    root.style.setProperty("--video-tint", active?.tint || "#4de4e6");
    root.style.setProperty("--video-overlay", String(clamp((active?.overlayOpacity || .2) + .22 + lightDarkness * .28 + darkness * .16, 0, .9)));
    root.style.setProperty("--video-vignette", String(.24 + darkness * .36));
    root.style.setProperty("--video-saturation", String(1.05 - darkness * .25));
    root.style.setProperty("--video-brightness", String(1 - darkness * .38));
    window.__VIDEO_OPACITY__ = { [current.id]: Number(currentOpacity.toFixed(3)), ...(adjacent && adjacent !== current ? { [adjacent.id]: Number(adjacentOpacity.toFixed(3)) } : {}) };
    const debug = document.querySelector("#descent-debug");
    if (debug) {
      debug.dataset.video = JSON.stringify(window.__VIDEO_OPACITY__);
      debug.textContent = `${debug.textContent.split("\nvideo ")[0]}\nvideo ${JSON.stringify(window.__VIDEO_OPACITY__)}`;
    }
  };
  const frame = () => {
    state.raf = 0;
    state.speed = lerp(state.speed, state.targetSpeed, .08);
    apply();
    if (!document.hidden) state.raf = requestAnimationFrame(frame);
  };
  window.addEventListener("descent:update", (event) => {
    state.displayDepth = event.detail.displayDepth;
    state.velocity = event.detail.scrollVelocity;
    state.light = event.detail.light;
    state.targetSpeed = 1 + clamp(Math.abs(state.velocity) / 75, 0, .5);
    if (!state.raf && !document.hidden) state.raf = requestAnimationFrame(frame);
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) layers.forEach((video) => video.pause());
    else if (!state.raf) state.raf = requestAnimationFrame(frame);
  });
  window.addEventListener("beforeunload", () => layers.forEach(clearVideo));
  apply();
  state.raf = requestAnimationFrame(frame);
})();

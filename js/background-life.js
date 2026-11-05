/* Procedural underwater life. Ranges, colors, counts, speeds and intensity live here. */
const BACKGROUND_LIFE_CONFIG = {
  intensity: .72,
  ranges: {
    surface: [0, 100],
    sunlight: [100, 200],
    twilight: [200, 1000],
    midnight: [1000, 4000],
    abyssal: [4000, 6000],
    hadal: [6000, 11000]
  },
  colors: {
    surface: "#8df5ed",
    sunlight: "#70d7e8",
    twilight: "#4b9fc2",
    midnight: "#52d9df",
    abyssal: "#7be7e6",
    hadal: "#e79762"
  },
  particles: { desktop: 260, mobile: 70, lowPower: 95 },
  lowPowerMaxCores: 4,
  speed: { base: 1, scroll: 2.8, current: .35, event: 3.2 },
  eventsPerMinute: .7,
  dprMax: 1.5
};

(() => {
  const canvas = document.querySelector("#descent-atmosphere");
  const config = BACKGROUND_LIFE_CONFIG;
  const depthConfig = window.DESCENT_CONFIG;
  if (!canvas || !depthConfig) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mobile = matchMedia("(max-width: 800px)").matches;
  const lowPower = mobile || (navigator.hardwareConcurrency || 8) <= (config.lowPowerMaxCores || 4);
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const lerp = (a, b, amount) => a + (b - a) * amount;
  const random = (min, max) => min + Math.random() * (max - min);
  const fade = (depth, [start, end]) => clamp((depth - start) / Math.max(1, end - start), 0, 1);
  const band = (depth, range, feather = .18) => {
    const [start, end] = range;
    const inFade = fade(depth, [start, start + (end - start) * feather]);
    const outFade = 1 - fade(depth, [end - (end - start) * feather, end]);
    return Math.min(inFade, outFade);
  };
  const color = (hex, alpha) => {
    const value = hex.replace("#", "");
    const red = parseInt(value.slice(0, 2), 16);
    const green = parseInt(value.slice(2, 4), 16);
    const blue = parseInt(value.slice(4, 6), 16);
    return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
  };

  const state = {
    depth: window.__DESCENT_STATE__?.depth || 0,
    normalized: window.__DESCENT_STATE__?.normalized || 0,
    velocity: 0,
    smoothDepth: window.__DESCENT_STATE__?.depth || 0,
    smoothVelocity: 0,
    mouseX: 0,
    mouseY: 0,
    smoothMouseX: 0,
    smoothMouseY: 0,
    event: null,
    nextEvent: performance.now() + random(4000, 11000),
    raf: 0,
    width: 0,
    height: 0
  };

  const count = lowPower ? (mobile ? config.particles.mobile : config.particles.lowPower) : config.particles.desktop;
  const particles = Array.from({ length: count }, () => ({
    x: Math.random(), y: Math.random(), size: random(.4, 2.2), speed: random(.1, .7), phase: random(0, Math.PI * 2)
  }));
  const fish = Array.from({ length: lowPower ? 0 : 7 }, () => ({ x: random(-.2, 1), y: random(.15, .75), speed: random(.00003, .00009), scale: random(.45, 1.1) }));
  const jellies = Array.from({ length: lowPower ? 0 : 4 }, () => ({ x: random(.1, .9), y: random(.2, .8), phase: random(0, 7), speed: random(.0001, .00025) }));

  const resize = () => {
    const ratio = Math.min(window.devicePixelRatio || 1, BACKGROUND_LIFE_CONFIG.dprMax);
    state.width = window.innerWidth;
    state.height = window.innerHeight;
    canvas.width = state.width * ratio;
    canvas.height = state.height * ratio;
    canvas.style.width = `${state.width}px`;
    canvas.style.height = `${state.height}px`;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  };

  const drawFish = (fishItem, time, alpha) => {
    const x = ((fishItem.x + time * fishItem.speed) % 1.25 - .12) * state.width;
    const y = fishItem.y * state.height + state.smoothMouseY * 12 * fishItem.scale;
    const size = 22 * fishItem.scale;
    ctx.fillStyle = color(config.colors.surface, alpha);
    ctx.beginPath();
    ctx.ellipse(x, y, size, size * .32, 0, 0, Math.PI * 2);
    ctx.moveTo(x - size, y);
    ctx.lineTo(x - size * 1.55, y - size * .6);
    ctx.lineTo(x - size * 1.55, y + size * .6);
    ctx.fill();
  };

  const drawJelly = (jelly, time, alpha) => {
    const x = jelly.x * state.width + state.smoothMouseX * 20;
    const y = jelly.y * state.height + Math.sin(time * jelly.speed + jelly.phase) * 35;
    const pulse = 1 + Math.sin(time * .0015 + jelly.phase) * .12;
    ctx.strokeStyle = color(config.colors.midnight, alpha * .7);
    ctx.fillStyle = color(config.colors.midnight, alpha);
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(x, y, 16 * pulse, Math.PI, 0);
    ctx.fill();
    for (let index = 0; index < 4; index++) {
      ctx.beginPath();
      ctx.moveTo(x - 12 + index * 8, y);
      ctx.quadraticCurveTo(x - 18 + index * 12, y + 28, x - 10 + index * 9, y + 52);
      ctx.stroke();
    }
  };

  const drawRays = (time, alpha) => {
    ctx.save();
    ctx.translate(state.smoothMouseX * 12, 0);
    ctx.strokeStyle = color(config.colors.surface, alpha);
    ctx.lineWidth = 2;
    for (let index = 0; index < 6; index++) {
      const x = index * state.width / 5 + Math.sin(time * .0002 + index) * 35;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + 150, state.height * .72);
      ctx.stroke();
    }
    ctx.restore();
  };

  const drawCaustics = (time, alpha) => {
    ctx.strokeStyle = color(config.colors.surface, alpha);
    ctx.lineWidth = 1;
    for (let row = 0; row < 7; row++) {
      ctx.beginPath();
      for (let x = 0; x <= state.width; x += 20) {
        const y = state.height * .08 + row * 22 + Math.sin(x * .018 + time * .0005 + row) * 8;
        if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
  };

  const drawShadow = (time, alpha) => {
    const x = ((time * .000012) % 1.35 - .2) * state.width;
    const y = state.height * .3;
    ctx.fillStyle = color("#07131f", alpha);
    ctx.beginPath();
    ctx.ellipse(x, y, 150, 25, 0, 0, Math.PI * 2);
    ctx.moveTo(x - 100, y);
    ctx.lineTo(x - 170, y - 28);
    ctx.lineTo(x - 150, y + 28);
    ctx.fill();
  };

  const drawSnow = (time, intensity, alpha) => {
    particles.forEach((particle) => {
      const streak = Math.min(7, Math.abs(state.smoothVelocity) * .08 * config.speed.scroll);
      particle.y += particle.speed * .00025 * (1 + intensity * config.speed.current);
      if (particle.y > 1.05) particle.y = -.05;
      const x = particle.x * state.width + Math.sin(time * .0002 + particle.phase) * 10 + state.smoothMouseX * 10;
      const y = particle.y * state.height;
      ctx.strokeStyle = color(config.colors.twilight, alpha);
      ctx.lineWidth = particle.size;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x - state.smoothVelocity * .2, y + streak + particle.size);
      ctx.stroke();
    });
  };

  const drawAbyss = (time, alpha) => {
    const x = state.width * (.72 + Math.sin(time * .00008) * .08);
    const y = state.height * .58;
    const glow = ctx.createRadialGradient(x, y, 0, x, y, 90);
    glow.addColorStop(0, color(config.colors.abyssal, alpha));
    glow.addColorStop(1, color(config.colors.abyssal, 0));
    ctx.fillStyle = glow;
    ctx.fillRect(x - 90, y - 90, 180, 180);
    ctx.strokeStyle = color(config.colors.abyssal, alpha * .4);
    ctx.beginPath();
    ctx.arc(x, y, (time % 3500) / 18, 0, Math.PI * 2);
    ctx.stroke();
  };

  const drawHadal = (time, alpha) => {
    ctx.fillStyle = color("#050b15", alpha * .8);
    ctx.beginPath();
    ctx.moveTo(0, state.height);
    for (let x = 0; x <= state.width; x += 35) ctx.lineTo(x, state.height * (.8 + Math.sin(x * .008) * .04));
    ctx.lineTo(state.width, state.height);
    ctx.fill();
    const vent = ctx.createLinearGradient(0, state.height, 0, state.height * .65);
    vent.addColorStop(0, color(config.colors.hadal, alpha * .35));
    vent.addColorStop(1, color(config.colors.hadal, 0));
    ctx.fillStyle = vent;
    ctx.fillRect(state.width * .42, state.height * .62, 70, state.height * .38);
    for (let index = 0; index < 10; index++) {
      const x = state.width * .45 + Math.sin(time * .0003 + index) * 25;
      const y = state.height * (.78 - ((time * .00003 + index * .07) % .3));
      ctx.fillStyle = color(config.colors.hadal, alpha * .5);
      ctx.beginPath();
      ctx.arc(x, y, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const maybeEvent = (time, depth) => {
    if (time < state.nextEvent) return;
    state.nextEvent = time + 60000 / config.eventsPerMinute * random(.6, 1.4);
    state.event = { started: time, type: depth < 200 ? "shadow" : depth < 4000 ? "jelly" : "ping" };
  };

  const draw = (time) => {
    if (document.hidden) return;
    const depth = state.smoothDepth;
    const intensity = config.intensity;
    const surface = band(depth, config.ranges.surface);
    const sunlight = band(depth, config.ranges.sunlight);
    const twilight = band(depth, config.ranges.twilight);
    const midnight = band(depth, config.ranges.midnight);
    const abyssal = band(depth, config.ranges.abyssal);
    const hadal = band(depth, config.ranges.hadal);
    const velocityBoost = clamp(Math.abs(state.smoothVelocity) * .035, 0, 1);
    ctx.clearRect(0, 0, state.width, state.height);
    if (surface || sunlight) {
      drawRays(time, (surface * .055 + sunlight * .035) * intensity);
      drawCaustics(time, surface * .035 * intensity);
      fish.forEach((fishItem) => drawFish(fishItem, time, (surface * .12 + sunlight * .04) * intensity));
      if (sunlight) drawShadow(time, sunlight * .035 * intensity);
    }
    if (twilight || midnight || abyssal || hadal) drawSnow(time, Math.max(twilight, midnight, abyssal, hadal), (.035 + Math.max(twilight, midnight, abyssal, hadal) * .07) * intensity);
    if (midnight) jellies.forEach((jelly) => drawJelly(jelly, time, (midnight * .08 + velocityBoost * .15) * intensity));
    if (abyssal) drawAbyss(time, abyssal * .11 * intensity);
    if (hadal) drawHadal(time, hadal * .12 * intensity);
    maybeEvent(time, depth);
    if (state.event && time - state.event.started < 2200) {
      const eventAlpha = (1 - (time - state.event.started) / 2200) * .12 * intensity;
      if (state.event.type === "shadow") drawShadow(time, eventAlpha);
      if (state.event.type === "jelly" && !lowPower) drawJelly(jellies[0], time, eventAlpha);
      if (state.event.type === "ping") drawAbyss(time, eventAlpha);
    } else if (state.event) state.event = null;
    state.raf = requestAnimationFrame(frame);
  };

  const frame = (time) => {
    state.smoothDepth = state.depth;
    state.smoothVelocity = lerp(state.smoothVelocity, state.velocity, .08);
    state.smoothMouseX = lerp(state.smoothMouseX, state.mouseX, .04);
    state.smoothMouseY = lerp(state.smoothMouseY, state.mouseY, .04);
    draw(time);
  };

  window.addEventListener("descent:update", (event) => {
    state.depth = event.detail.depth;
    state.normalized = event.detail.normalized;
    state.velocity = event.detail.velocity;
  });
  window.addEventListener("pointermove", (event) => {
    if (matchMedia("(pointer:fine)").matches) {
      state.mouseX = event.clientX / window.innerWidth - .5;
      state.mouseY = event.clientY / window.innerHeight - .5;
    }
  }, { passive: true });
  window.addEventListener("resize", resize, { passive: true });
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden && !state.raf) state.raf = requestAnimationFrame(frame);
  });
  resize();
  if (reduced) {
    state.smoothDepth = state.depth;
    ctx.clearRect(0, 0, state.width, state.height);
  } else {
    state.raf = requestAnimationFrame(frame);
  }
})();

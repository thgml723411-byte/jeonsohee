type Drop = { x: number; y: number; vx: number; vy: number };
type Splash = Drop & { life: number };
type Drip = { x: number; y: number; vy: number };

const PIXEL_SIZE = 2;
const FRAME_INTERVAL = 1000 / 30;
const BAYER8 = [
  0, 48, 12, 60, 3, 51, 15, 63, 32, 16, 44, 28, 35, 19, 47, 31,
  8, 56, 4, 52, 11, 59, 7, 55, 40, 24, 36, 20, 43, 27, 39, 23,
  2, 50, 14, 62, 1, 49, 13, 61, 34, 18, 46, 30, 33, 17, 45, 29,
  10, 58, 6, 54, 9, 57, 5, 53, 42, 26, 38, 22, 41, 25, 37, 21,
];

/** Pixel rain, text collisions, edge splashes, pools and drips from the supplied demo. */
export function createCurtainRain(canvas: HTMLCanvasElement, section: HTMLElement) {
  const outputContext = canvas.getContext("2d");
  const scene = document.createElement("canvas");
  const sceneContext = scene.getContext("2d", { willReadFrequently: true });
  const textMask = document.createElement("canvas");
  const maskContext = textMask.getContext("2d", { willReadFrequently: true });
  if (!outputContext || !sceneContext || !maskContext) return;
  const ctx = outputContext;
  const paint = sceneContext;
  const text = maskContext;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  const surfaces = Array.from(section.querySelectorAll<HTMLElement>("h2, [data-rain-surface]"));
  let width = 1;
  let height = 1;
  let groundY = 0;
  let mask = new Uint8Array(0);
  let ledges = new Uint8Array(0);
  let pools = new Float32Array(0);
  let neighbors = new Int32Array(0);
  let slopes = new Uint8Array(0);
  let ledgeIndices: number[] = [];
  let textEdges: { index: number; angle: number }[] = [];
  let rain: Drop[] = [];
  const splashes: Splash[] = [];
  const drips: Drip[] = [];
  let cream = "#e2d8c9";
  let blue = "#4a85c0";
  let frame = 0;
  let lastPaint = 0;
  let edgeAccumulator = 0;
  let visible = false;
  let disposed = false;
  let settleTimer = 0;

  const solid = (x: number, y: number) => {
    if (x < 0 || y < 0 || x >= width || y >= height) return false;
    return mask[Math.floor(y) * width + Math.floor(x)] === 1;
  };

  const surfaceIndex = (x: number, y: number) => {
    const column = Math.max(0, Math.min(width - 1, Math.floor(x)));
    let row = Math.max(0, Math.min(height - 1, Math.floor(y)));
    while (row < height && !solid(column, row)) row++;
    if (row >= height) return -1;
    while (row > 0 && solid(column, row - 1)) row--;
    const index = row * width + column;
    return ledges[index] ? index : -1;
  };

  const rebuildMask = () => {
    if (disposed) return;
    text.clearRect(0, 0, width, height);
    text.fillStyle = "#fff";
    text.textAlign = "center";
    text.textBaseline = "alphabetic";
    const sectionBounds = section.getBoundingClientRect();
    for (const element of surfaces) {
      const bounds = element.getBoundingClientRect();
      const style = getComputedStyle(element);
      const fontSize = parseFloat(style.fontSize) / PIXEL_SIZE;
      text.font = `${style.fontStyle} ${style.fontWeight} ${fontSize}px ${style.fontFamily}`;
      const value = element.textContent?.trim() || "";
      const availableWidth = bounds.width / PIXEL_SIZE;
      const lines: string[] = [];
      for (const word of value.split(/\s+/)) {
        const last = lines.length - 1;
        const candidate = last >= 0 ? `${lines[last]} ${word}` : word;
        if (last >= 0 && text.measureText(candidate).width <= availableWidth) lines[last] = candidate;
        else lines.push(word);
      }
      const x = (bounds.left - sectionBounds.left + bounds.width / 2) / PIXEL_SIZE;
      const lineHeight = bounds.height / PIXEL_SIZE / Math.max(lines.length, 1);
      lines.forEach((line, index) => {
        const metrics = text.measureText(line);
        const ascent = metrics.actualBoundingBoxAscent || fontSize * 0.8;
        const descent = metrics.actualBoundingBoxDescent || fontSize * 0.2;
        const y = (bounds.top - sectionBounds.top) / PIXEL_SIZE + lineHeight * (index + 0.5) + (ascent - descent) / 2;
        text.fillText(line, x, y, availableWidth);
      });
    }
    groundY = Math.max(0, height - Math.ceil(48 / PIXEL_SIZE));
    text.fillRect(0, groundY, width, height - groundY);
    const pixels = text.getImageData(0, 0, width, height).data;
    mask = new Uint8Array(width * height);
    ledges = new Uint8Array(width * height);
    pools = new Float32Array(width * height);
    neighbors = new Int32Array(width * height).fill(-1);
    slopes = new Uint8Array(width * height);
    ledgeIndices = [];
    textEdges = [];
    splashes.length = drips.length = 0;
    for (let index = 0; index < mask.length; index++) mask[index] = pixels[index * 4 + 3] > 127 ? 1 : 0;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (!solid(x, y)) continue;
        const index = y * width + x;
        if (!solid(x, y - 1)) { ledges[index] = 1; ledgeIndices.push(index); }
        if (y >= groundY) continue;
        if (!solid(x, y - 1)) textEdges.push({ index, angle: -Math.PI / 2 });
        if (!solid(x, y + 1)) textEdges.push({ index, angle: Math.PI / 2 });
        if (!solid(x - 1, y)) textEdges.push({ index, angle: Math.PI });
        if (!solid(x + 1, y)) textEdges.push({ index, angle: 0 });
      }
    }
    for (const index of ledgeIndices) {
      const x = index % width;
      const y = Math.floor(index / width);
      let bestScore = -Infinity;
      for (const [dx, dy] of [[1, 1], [1, 0], [0, 1], [2, 1], [2, 0], [-1, 1]]) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
        const next = ny * width + nx;
        const score = dy * 10 + (dx > 0 ? 1 : 0) - Math.abs(dx) * 0.2;
        if (ledges[next] && score > bestScore) {
          neighbors[index] = next;
          slopes[index] = dy;
          bestScore = score;
        }
      }
    }
  };

  const resetDrop = (drop: Drop, initial = false) => {
    drop.x = Math.random() * (width + 30) - 30;
    drop.y = initial ? Math.random() * groundY : -4 - Math.random() * 20;
    const speed = (0.75 + Math.random() * 0.8) / PIXEL_SIZE;
    drop.vx = speed * 0.06;
    drop.vy = speed;
  };

  const splash = (x: number, y: number, count: number, angle = -Math.PI / 2, speed = 0.55) => {
    for (let i = 0; i < count && splashes.length < 280; i++) {
      const direction = angle + (Math.random() - 0.5) * Math.PI * 0.7;
      const velocity = speed * (0.7 + Math.random() * 0.6);
      splashes.push({ x, y, vx: Math.cos(direction) * velocity, vy: Math.sin(direction) * velocity, life: 1 });
    }
  };

  const draw = (step: number) => {
    paint.clearRect(0, 0, width, height);
    paint.save();
    paint.beginPath();
    paint.rect(0, 0, width, groundY);
    paint.clip();
    paint.lineWidth = 0.75;
    paint.strokeStyle = cream;
    paint.globalAlpha = 0.65;
    paint.beginPath();
    for (const drop of rain) {
      const nx = drop.x + drop.vx * step;
      const ny = drop.y + drop.vy * step;
      if (step > 0 && solid(nx, ny)) {
        const index = surfaceIndex(nx, ny);
        if (index >= 0) {
          pools[index] = Math.min(pools[index] + 2, 12);
          splash(index % width, Math.floor(index / width) - 0.5, 2 + Math.floor(Math.random() * 2));
        }
        resetDrop(drop);
      } else {
        paint.moveTo(drop.x - drop.vx * 2.5, drop.y - drop.vy * 2.5);
        paint.lineTo(drop.x, drop.y);
        drop.x = nx; drop.y = ny;
        if (drop.y > height + 5 || drop.x > width + 5) resetDrop(drop);
      }
    }
    paint.stroke();

    edgeAccumulator += 4 * step / 60;
    while (edgeAccumulator >= 1 && textEdges.length > 0) {
      edgeAccumulator--;
      const edge = textEdges[Math.floor(Math.random() * textEdges.length)];
      const x = edge.index % width;
      const y = Math.floor(edge.index / width);
      splash(x + Math.cos(edge.angle), y + Math.sin(edge.angle), 2, edge.angle, 0.25);
      if (ledges[edge.index]) pools[edge.index] += 0.4;
    }
    paint.strokeStyle = blue;
    paint.globalAlpha = 0.9;
    paint.beginPath();
    for (let i = splashes.length - 1; i >= 0; i--) {
      const particle = splashes[i];
      const x = particle.x; const y = particle.y;
      particle.vy += 0.025 * step;
      particle.vx *= Math.pow(0.98, step);
      particle.x += particle.vx * step;
      particle.y += particle.vy * step;
      particle.life -= 0.012 * step;
      paint.moveTo(x, y); paint.lineTo(particle.x, particle.y);
      if (particle.life <= 0 || solid(particle.x, particle.y) || particle.y >= groundY) splashes.splice(i, 1);
    }
    paint.stroke();

    paint.fillStyle = cream;
    for (const index of ledgeIndices) {
      let amount = pools[index] * Math.pow(0.978, step);
      if (amount < 0.01) { pools[index] = 0; continue; }
      const next = neighbors[index];
      if (next >= 0) {
        const flow = Math.min(amount * 0.8, amount * (1 - Math.pow(0.88, step)) * (1 + slopes[index] * 2));
        amount -= flow; pools[next] = Math.min(pools[next] + flow, 12);
      }
      if (amount > 2 && Math.random() < 0.01 * step && drips.length < 100 && index / width < groundY) {
        drips.push({ x: index % width, y: Math.floor(index / width) - 0.5, vy: 0.1 });
        amount -= 0.8;
      }
      pools[index] = amount;
      paint.globalAlpha = Math.min(1, amount * 0.35);
      paint.fillRect(index % width, Math.floor(index / width) - 0.5, 1, 1);
    }
    paint.strokeStyle = cream;
    paint.globalAlpha = 0.8;
    paint.beginPath();
    for (let i = drips.length - 1; i >= 0; i--) {
      const drip = drips[i];
      const previous = drip.y;
      drip.vy += 0.04 * step;
      drip.y += drip.vy * step;
      paint.moveTo(drip.x, previous); paint.lineTo(drip.x, drip.y);
      if (solid(drip.x, drip.y + 0.75)) {
        const index = surfaceIndex(drip.x, drip.y + 0.75);
        if (index >= 0) pools[index] = Math.min(pools[index] + 1, 12);
        drips.splice(i, 1);
      } else if (drip.y > groundY) drips.splice(i, 1);
    }
    paint.stroke();
    paint.restore();

    // Ordered 1-bit dithering with a transparent background preserves the page gradient.
    const image = paint.getImageData(0, 0, width, height);
    const pixels = image.data;
    const packed = new Uint32Array(pixels.buffer);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = y * width + x;
        const alpha = index * 4 + 3;
        const threshold = (BAYER8[((y & 7) << 3) | (x & 7)] + 0.5) * 255 / 64;
        if (pixels[alpha] <= threshold) packed[index] = 0;
        else pixels[alpha] = 255;
      }
    }
    paint.putImageData(image, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(scene, 0, 0, canvas.width, canvas.height);
  };

  const tick = (now: number) => {
    frame = 0;
    if (disposed || !visible || document.hidden || reduced.matches) return;
    if (lastPaint === 0 || now - lastPaint >= FRAME_INTERVAL) {
      const step = lastPaint === 0 ? 1 : Math.min((now - lastPaint) / (1000 / 60), 3);
      lastPaint = now;
      draw(step);
    }
    frame = requestAnimationFrame(tick);
  };

  const syncAnimation = () => {
    cancelAnimationFrame(frame);
    frame = 0;
    lastPaint = 0;
    if (disposed || !visible || document.hidden) return;
    if (reduced.matches) draw(0);
    else frame = requestAnimationFrame(tick);
  };

  const resize = () => {
    if (disposed) return;
    const bounds = section.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    width = Math.max(1, Math.ceil(bounds.width / PIXEL_SIZE));
    height = Math.max(1, Math.ceil(bounds.height / PIXEL_SIZE));
    canvas.width = Math.round(bounds.width * dpr);
    canvas.height = Math.round(bounds.height * dpr);
    scene.width = textMask.width = width;
    scene.height = textMask.height = height;
    const palette = getComputedStyle(section);
    cream = palette.getPropertyValue("--color-foreground").trim() || cream;
    blue = palette.getPropertyValue("--color-accent").trim() || blue;
    rebuildMask();
    const count = Math.max(70, Math.min(220, Math.round(bounds.width * bounds.height * 0.00016)));
    rain = Array.from({ length: count }, () => {
      const drop = { x: 0, y: 0, vx: 0, vy: 0 };
      resetDrop(drop, true);
      return drop;
    });
    edgeAccumulator = 0;
    draw(0);
    syncAnimation();
  };

  resize();
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(section);
  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    window.clearTimeout(settleTimer);
    if (visible) {
      rebuildMask();
      // Rebuild once the existing heading reveal finishes moving into place.
      settleTimer = window.setTimeout(() => { rebuildMask(); if (reduced.matches) draw(0); }, 1200);
    }
    syncAnimation();
  }, { threshold: 0.08 });
  observer.observe(section);
  document.addEventListener("visibilitychange", syncAnimation);
  reduced.addEventListener("change", syncAnimation);
  document.fonts.ready.then(() => { if (!disposed) resize(); });

  return () => {
    disposed = true;
    cancelAnimationFrame(frame);
    window.clearTimeout(settleTimer);
    resizeObserver.disconnect();
    observer.disconnect();
    document.removeEventListener("visibilitychange", syncAnimation);
    reduced.removeEventListener("change", syncAnimation);
    scene.width = scene.height = textMask.width = textMask.height = 0;
  };
}

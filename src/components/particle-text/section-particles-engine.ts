type TextParticle = {
  x: number; y: number; tx: number; ty: number;
  vx: number; vy: number; color: string;
};
type DustParticle = { x: number; y: number; vx: number; vy: number; size: number; color: string };

export function startSectionParticles(
  section: HTMLElement,
  canvas: HTMLCanvasElement,
  background: HTMLCanvasElement | null,
) {
  const context = canvas.getContext("2d");
  if (!context) return;
  const ctx = context;
  const bg = background?.getContext("2d");
  const mask = document.createElement("canvas");
  const maskContext = mask.getContext("2d", { willReadFrequently: true });
  if (!maskContext) return;
  const maskCtx = maskContext;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  let width = 1, height = 1, frame = 0, last = 0, visible = false, disposed = false;
  let particles: TextParticle[] = [];
  let dust: DustParticle[] = [];
  let active: HTMLElement | null = null;
  let activeText = "";
  let originalOpacity = "";
  let originX = 0, originY = 0;
  let hovering = false;
  const pointer = { x: -10000, y: -10000, inside: false };

  const restoreText = () => {
    if (active) active.style.opacity = originalOpacity;
    active?.removeAttribute("data-particle-active");
    active = null;
    particles = [];
    hovering = false;
    ctx.clearRect(0, 0, width, height);
  };

  // Rasterize actual character positions so wrapped text keeps its existing layout.
  // Sampling only happens when a label is entered, never for the entire section.
  const prepareText = (element: HTMLElement) => {
    restoreText();
    const bounds = element.getBoundingClientRect();
    if (bounds.width < 1 || bounds.height < 1) return;
    const sectionBounds = section.getBoundingClientRect();
    const padding = 3;
    mask.width = Math.ceil(bounds.width) + padding * 2;
    mask.height = Math.ceil(bounds.height) + padding * 2;
    if (mask.width * mask.height > 2000000) return;
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    const range = document.createRange();
    const colors: { y: number; color: string }[] = [];
    let node: Node | null;
    while ((node = walker.nextNode())) {
      const style = window.getComputedStyle(node.parentElement!);
      const fontSize = Number.parseFloat(style.fontSize);
      maskCtx.font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
      maskCtx.fillStyle = style.color;
      maskCtx.textBaseline = "alphabetic";
      const metrics = maskCtx.measureText("Mg");
      const ascent = metrics.fontBoundingBoxAscent || fontSize * 0.8;
      const descent = metrics.fontBoundingBoxDescent || fontSize * 0.2;
      let offset = 0;
      for (const sourceCharacter of Array.from(node.textContent || "")) {
        range.setStart(node, offset);
        offset += sourceCharacter.length;
        range.setEnd(node, offset);
        const character = style.textTransform === "uppercase" ? sourceCharacter.toUpperCase()
          : style.textTransform === "lowercase" ? sourceCharacter.toLowerCase() : sourceCharacter;
        if (!character.trim()) continue;
        const rect = range.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) continue;
        const x = rect.left - bounds.left + padding;
        const y = rect.top - bounds.top + padding;
        // Perspective can scale ticket text; fit each glyph to its rendered box.
        const scaleY = rect.height / (ascent + descent);
        const glyphWidth = maskCtx.measureText(character).width || rect.width;
        maskCtx.save();
        if (style.writingMode === "vertical-rl") {
          // The ticket's Admit One label runs vertically and is turned 180 degrees.
          maskCtx.translate(x + rect.width / 2, y + rect.height / 2);
          maskCtx.rotate(-Math.PI / 2);
          maskCtx.scale(rect.height / glyphWidth, rect.width / (ascent + descent));
          maskCtx.fillText(character, -glyphWidth / 2, (ascent - descent) / 2);
        } else {
          maskCtx.translate(x, y);
          maskCtx.scale(rect.width / glyphWidth, scaleY);
          maskCtx.fillText(character, 0, ascent);
        }
        maskCtx.restore();
        colors.push({ y: y + rect.height / 2, color: style.color });
      }
    }
    const image = maskCtx.getImageData(0, 0, mask.width, mask.height).data;
    const step = Math.max(1.5, Math.sqrt(mask.width * mask.height / 12000));
    originX = bounds.left - sectionBounds.left - padding;
    originY = bounds.top - sectionBounds.top - padding;
    for (let y = 0; y < mask.height; y += step) {
      const rowColor = colors.reduce((best, current) =>
        Math.abs(current.y - y) < Math.abs(best.y - y) ? current : best,
      colors[0] || { y: 0, color: window.getComputedStyle(element).color }).color;
      for (let x = 0; x < mask.width; x += step) {
        if (image[(Math.floor(y) * mask.width + Math.floor(x)) * 4 + 3] < 90) continue;
        particles.push({ x, y, tx: x, ty: y, vx: 0, vy: 0, color: rowColor });
      }
    }
    if (particles.length === 0) return;
    active = element;
    activeText = element.textContent || "";
    originalOpacity = element.style.opacity;
    active.style.opacity = "0";
    active.setAttribute("data-particle-active", "");
    hovering = true;
  };

  const paintText = (step: number) => {
    ctx.clearRect(0, 0, width, height);
    if (!active) return;
    if (!active.isConnected || active.closest("[inert]") || active.textContent !== activeText) {
      restoreText();
      return;
    }
    // Follow hover transforms on the tickets without moving their DOM content.
    const rect = active.getBoundingClientRect();
    const sectionBounds = section.getBoundingClientRect();
    originX = rect.left - sectionBounds.left - 3;
    originY = rect.top - sectionBounds.top - 3;
    const mx = hovering ? pointer.x - originX : -10000;
    const my = hovering ? pointer.y - originY : -10000;
    let movement = 0;
    for (const p of particles) {
      let ax = (p.tx - p.x) * 0.086;
      let ay = (p.ty - p.y) * 0.086;
      const dx = p.x - mx, dy = p.y - my;
      const distance = Math.hypot(dx, dy);
      const radius = Math.min(85, Math.max(32, rect.height * 1.1));
      if (distance < radius) {
        const force = (1 - distance / radius) * 5.5;
        const angle = distance > 0.1 ? Math.atan2(dy, dx) : Math.random() * Math.PI * 2;
        ax += Math.cos(angle) * force;
        ay += Math.sin(angle) * force;
      }
      p.vx = (p.vx + ax * step) * Math.pow(0.855, step);
      p.vy = (p.vy + ay * step) * Math.pow(0.855, step);
      p.x += p.vx * step;
      p.y += p.vy * step;
      movement = Math.max(movement, Math.abs(p.x - p.tx) + Math.abs(p.y - p.ty));
      ctx.fillStyle = p.color;
      ctx.fillRect(originX + p.x, originY + p.y, 1.35, 1.35);
    }
    if (!hovering && movement < 0.3) restoreText();
  };

  const paintBackground = (step: number, now: number) => {
    if (!bg) return;
    // Transparent trails preserve the section's gradient under the source's dust.
    bg.globalCompositeOperation = "destination-out";
    bg.fillStyle = "rgba(0,0,0,0.2)";
    bg.fillRect(0, 0, width, height);
    bg.globalCompositeOperation = "lighter";
    for (const p of dust) {
      let ax = Math.sin((p.y + now * 0.00018) * 0.006) * 0.018;
      let ay = Math.cos((p.x + now * 0.00021) * 0.006) * 0.018;
      const dx = p.x - pointer.x, dy = p.y - pointer.y;
      const distance = Math.hypot(dx, dy);
      if (pointer.inside && distance < 118 && distance > 0) {
        const force = (1 - distance / 118) * 1.8;
        ax += dx / distance * force;
        ay += dy / distance * force;
      }
      p.vx = (p.vx + ax * step) * Math.pow(0.962, step);
      p.vy = (p.vy + ay * step) * Math.pow(0.962, step);
      p.x = (p.x + p.vx * step + width) % width;
      p.y = (p.y + p.vy * step + height) % height;
      bg.fillStyle = p.color;
      bg.fillRect(p.x, p.y, p.size, p.size);
    }
  };

  const tick = (now: number) => {
    frame = 0;
    if (!visible || document.hidden || reducedMotion.matches) return;
    const step = last ? Math.min((now - last) / (1000 / 60), 2) : 1;
    last = now;
    paintBackground(step, now);
    paintText(step);
    if (bg || active) frame = requestAnimationFrame(tick);
  };
  const schedule = () => {
    if (!frame && visible && !document.hidden && !reducedMotion.matches && (bg || active)) {
      last = 0;
      frame = requestAnimationFrame(tick);
    }
  };
  const sync = () => {
    cancelAnimationFrame(frame);
    frame = 0;
    if (!visible || reducedMotion.matches || document.hidden || !finePointer.matches) restoreText();
    schedule();
  };
  const resize = () => {
    restoreText();
    width = Math.max(1, section.clientWidth);
    height = Math.max(1, section.clientHeight);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (background && bg) {
      background.width = canvas.width;
      background.height = canvas.height;
      bg.setTransform(dpr, 0, 0, dpr, 0, 0);
      dust = Array.from({ length: Math.min(2200, Math.floor(width * height / 500)) }, () => ({
        x: Math.random() * width, y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
        size: 0.8 + Math.random() * 0.7,
        color: `hsla(${188 + Math.random() * 145}, 90%, 72%, ${0.18 + Math.random() * 0.3})`,
      }));
      paintBackground(0, 0);
    }
    schedule();
  };
  const move = (event: PointerEvent) => {
    const bounds = section.getBoundingClientRect();
    pointer.x = event.clientX - bounds.left;
    pointer.y = event.clientY - bounds.top;
    pointer.inside = true;
    if (!finePointer.matches || reducedMotion.matches || event.pointerType === "touch" || event.buttons) return;
    const element = event.target instanceof Element
      ? event.target.closest<HTMLElement>("[data-particle-text]") : null;
    if (element && !element.closest("[inert]")) {
      if (element !== active) prepareText(element);
      hovering = true;
    } else hovering = false;
    schedule();
  };
  const leave = () => { pointer.inside = false; hovering = false; schedule(); };
  const reset = () => { pointer.inside = false; restoreText(); };

  resize();
  const sizes = new ResizeObserver(resize);
  sizes.observe(section);
  const visibility = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    sync();
  }, { threshold: 0.01 });
  visibility.observe(section);
  section.addEventListener("pointermove", move, { passive: true });
  section.addEventListener("pointerleave", leave);
  section.addEventListener("pointerdown", reset);
  window.addEventListener("scroll", reset, { passive: true, capture: true });
  document.addEventListener("visibilitychange", sync);
  reducedMotion.addEventListener("change", sync);
  finePointer.addEventListener("change", sync);
  void document.fonts.ready.then(() => { if (!disposed) resize(); });

  return () => {
    disposed = true;
    cancelAnimationFrame(frame);
    restoreText();
    sizes.disconnect();
    visibility.disconnect();
    section.removeEventListener("pointermove", move);
    section.removeEventListener("pointerleave", leave);
    section.removeEventListener("pointerdown", reset);
    window.removeEventListener("scroll", reset, true);
    document.removeEventListener("visibilitychange", sync);
    reducedMotion.removeEventListener("change", sync);
    finePointer.removeEventListener("change", sync);
  };
}

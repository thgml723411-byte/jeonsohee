type ParticleTextElements = {
  canvas: HTMLCanvasElement;
  input: HTMLInputElement;
  hint: HTMLDivElement;
  save: HTMLButtonElement;
};

// All browser resources belong to this instance and are released on unmount.
export function startParticleText({ canvas: cvs, input, hint: hintEl, save }: ParticleTextElements) {
  const context = cvs.getContext('2d', { alpha: false });
  if (!context) return;
  const ctx = context;

  const off = document.createElement('canvas');
  const offContext = off.getContext('2d', { willReadFrequently: true });
  if (!offContext) return;
  const octx = offContext;

  let W = 0, H = 0, DPR = 1;

  let MAX = 0;
  let px = new Float32Array(0), py = new Float32Array(0);
  let vx = new Float32Array(0), vy = new Float32Array(0);
  let tx = new Float32Array(0), ty = new Float32Array(0);
  let live = new Uint8Array(0), bucket = new Uint8Array(0);
  let order = new Int32Array(0);

  const BUCKETS = 40;
  const COLORS: string[] = [];
  for (let i = 0; i < BUCKETS; i++) {
    const hue = 188 + (i / (BUCKETS - 1)) * 145;
    COLORS.push(`hsl(${hue.toFixed(0)} 100% ${62 + (i % 3) * 4}%)`);
  }
  const DUST = 'rgba(120,150,210,.5)';

  function allocate() {
    MAX = Math.max(3000, Math.min(14000, Math.floor((W * H) / 92)));
    px = new Float32Array(MAX); py = new Float32Array(MAX);
    vx = new Float32Array(MAX); vy = new Float32Array(MAX);
    tx = new Float32Array(MAX); ty = new Float32Array(MAX);
    live = new Uint8Array(MAX);
    bucket = new Uint8Array(MAX);
    order = new Int32Array(MAX);
    for (let i = 0; i < MAX; i++) {
      px[i] = Math.random() * W;
      py[i] = Math.random() * H;
      vx[i] = vy[i] = 0;
      order[i] = i;
    }
  }

  function wrap(str: string) {
    if (str.length <= 14) return [str];
    const rows = Math.min(3, Math.ceil(str.length / 14));
    const maxChars = Math.ceil(str.length / rows);
    const words = str.split(/\s+/).filter(Boolean);
    const lines: string[] = [];
    let cur = '';
    for (const w of words) {
      if (!cur) cur = w;
      else if ((cur + ' ' + w).length <= maxChars) cur += ' ' + w;
      else { lines.push(cur); cur = w; }
    }
    if (cur) lines.push(cur);
    return lines.slice(0, 3);
  }

  function setText(str: string) {
    str = (str || '').trim().toUpperCase() || '·';
    const lines = wrap(str);

    off.width = Math.max(1, Math.floor(W));
    off.height = Math.max(1, Math.floor(H));
    octx.clearRect(0, 0, off.width, off.height);
    octx.fillStyle = '#fff';
    octx.textAlign = 'center';
    octx.textBaseline = 'middle';

    const longest = lines.reduce((a, b) => (a.length > b.length ? a : b), '');
    const font = (size: number) => `900 ${size}px "Arial Black","Helvetica Neue",Impact,system-ui,sans-serif`;

    let lo = 8, hi = 460;
    for (let k = 0; k < 22; k++) {
      const mid = (lo + hi) / 2;
      octx.font = font(mid);
      const fitsWide = octx.measureText(longest).width <= W * 0.86;
      const fitsTall = mid * 1.06 * lines.length <= H * 0.55;
      if (fitsWide && fitsTall) lo = mid; else hi = mid;
    }

    octx.font = font(lo);
    const lh = lo * 1.04;
    const y0 = H / 2 - (lh * (lines.length - 1)) / 2;
    lines.forEach((line, i) => octx.fillText(line, W / 2, y0 + i * lh));

    const img = octx.getImageData(0, 0, off.width, off.height).data;
    const rowW = off.width;

    let step = 2;
    let pts: number[] = [];
    for (let attempt = 0; attempt < 9; attempt++) {
      const found: number[] = [];
      for (let y = 0; y < off.height; y += step) {
        for (let x = 0; x < rowW; x += step) {
          if (img[(y * rowW + x) * 4 + 3] > 128) found.push(x, y);
        }
      }
      pts = found;
      if (found.length / 2 <= MAX) break;
      step++;
    }

    const n = pts.length / 2;
    for (let i = n - 1; i > 0; i--) {
      const j = (Math.random() * (i + 1)) | 0;
      let t = pts[i * 2]; pts[i * 2] = pts[j * 2]; pts[j * 2] = t;
      t = pts[i * 2 + 1]; pts[i * 2 + 1] = pts[j * 2 + 1]; pts[j * 2 + 1] = t;
    }

    for (let i = 0; i < MAX; i++) {
      if (i < n) {
        tx[i] = pts[i * 2];
        ty[i] = pts[i * 2 + 1];
        live[i] = 1;
        bucket[i] = Math.min(BUCKETS - 1, ((tx[i] / W) * BUCKETS) | 0);
        vx[i] += (Math.random() - 0.5) * 3;
        vy[i] += (Math.random() - 0.5) * 3;
      } else {
        if (live[i]) {
          const a = Math.random() * 6.283;
          const s = 1.6 + Math.random() * 3.4;
          vx[i] = Math.cos(a) * s;
          vy[i] = Math.sin(a) * s;
        }
        live[i] = 0;
        bucket[i] = 255;
      }
    }

    const idx = Array.from({ length: MAX }, (_, i) => i);
    idx.sort((a, b) => bucket[a] - bucket[b]);
    for (let i = 0; i < MAX; i++) order[i] = idx[i];
  }

  const M = { x: -9999, y: -9999, on: false };

  function pointer(e: PointerEvent) {
    M.x = e.clientX;
    M.y = e.clientY;
    M.on = true;
    hideHint();
  }

  function leave() { M.on = false; }
  function release(e: PointerEvent) { if (e.pointerType !== 'mouse') leave(); }
  cvs.addEventListener('pointermove', pointer, { passive: true });
  cvs.addEventListener('pointerleave', leave);
  cvs.addEventListener('pointerup', release);
  cvs.addEventListener('pointercancel', leave);

  function boom(x: number, y: number) {
    for (let i = 0; i < MAX; i++) {
      const dx = px[i] - x, dy = py[i] - y;
      const d2 = dx * dx + dy * dy + 260;
      const f = 26000 / d2;
      vx[i] += dx * f * 0.05;
      vy[i] += dy * f * 0.05;
    }
    hideHint();
  }

  function detonate(e: PointerEvent) {
    boom(e.clientX, e.clientY);
  }
  cvs.addEventListener('pointerdown', detonate);

  let hintOff = false;
  let hintTimer: ReturnType<typeof setTimeout> | undefined;
  hintEl.style.opacity = "";
  function hideHint() {
    if (hintOff) return;
    hintOff = true;
    hintTimer = setTimeout(() => { hintEl.style.opacity = "0"; }, 1400);
  }

  let typed = false;
  function updateText(e: Event) {
    if (e instanceof InputEvent && e.isComposing) return;
    typed = true;
    setText(input.value);
    hideHint();
  }
  input.addEventListener('input', updateText);
  input.addEventListener('compositionend', updateText);

  function savePng() {
    const a = document.createElement('a');
    a.download = 'particles.png';
    a.href = cvs.toDataURL('image/png');
    a.click();
  }
  save.addEventListener('click', savePng);

  const REEL = ['HELLO', 'TYPE ANYTHING', 'YOUR NAME HERE', 'MADE WITH MATH'];
  let reelAt = 0, reelT = 0;

  function resize() {
    DPR = Math.min(devicePixelRatio || 1, 2);
    W = innerWidth;
    H = innerHeight;
    cvs.width = Math.floor(W * DPR);
    cvs.height = Math.floor(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.fillStyle = '#05060d';
    ctx.fillRect(0, 0, W, H);
    allocate();
    setText(typed ? input.value : REEL[reelAt]);
  }
  window.addEventListener('resize', resize);

  const SPRING = 0.086;
  const DAMP = 0.855;
  const DAMP_DUST = 0.962;
  const RAD = 118, RAD2 = RAD * RAD;

  let last = performance.now();
  let frameId = 0;

  function frame(now: number) {
    const dt = Math.min(50, now - last);
    last = now;

    if (!typed) {
      reelT += dt;
      if (reelT > 3600) {
        reelT = 0;
        reelAt = (reelAt + 1) % REEL.length;
        setText(REEL[reelAt]);
      }
    }

    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = 'rgba(5,6,13,0.20)';
    ctx.fillRect(0, 0, W, H);

    const mx = M.on ? M.x : -99999;
    const my = M.on ? M.y : -99999;

    for (let i = 0; i < MAX; i++) {
      let x = px[i], y = py[i];
      let ax = 0, ay = 0;

      if (live[i]) {
        ax += (tx[i] - x) * SPRING;
        ay += (ty[i] - y) * SPRING;
        ax += (Math.random() - 0.5) * 0.11;
        ay += (Math.random() - 0.5) * 0.11;
      } else {
        ax += Math.sin((y + now * 0.00018) * 0.006) * 0.018;
        ay += Math.cos((x + now * 0.00021) * 0.006) * 0.018;
      }

      const dx = x - mx, dy = y - my;
      const d2 = dx * dx + dy * dy;
      if (d2 < RAD2) {
        const d = Math.sqrt(d2) || 1;
        const f = (1 - d / RAD) * 4.3;
        ax += (dx / d) * f;
        ay += (dy / d) * f;
      }

      const damp = live[i] ? DAMP : DAMP_DUST;
      const nvx = (vx[i] + ax) * damp;
      const nvy = (vy[i] + ay) * damp;
      vx[i] = nvx;
      vy[i] = nvy;
      x += nvx;
      y += nvy;

      if (!live[i]) {
        if (x < -20) x = W + 20; else if (x > W + 20) x = -20;
        if (y < -20) y = H + 20; else if (y > H + 20) y = -20;
      }

      px[i] = x;
      py[i] = y;
    }

    ctx.globalCompositeOperation = 'lighter';
    let cur = -1;
    for (let k = 0; k < MAX; k++) {
      const i = order[k];
      const b = bucket[i];
      if (b !== cur) {
        cur = b;
        ctx.fillStyle = b === 255 ? DUST : COLORS[b];
      }
      const sp = Math.abs(vx[i]) + Math.abs(vy[i]);
      const s = sp > 0.6 ? 1.15 + (sp > 5 ? 1.6 : sp * 0.32) : 1.15;
      ctx.fillRect(px[i], py[i], s, s);
    }

    frameId = requestAnimationFrame(frame);
  }

  resize();
  frameId = requestAnimationFrame(frame);

  return () => {
    cancelAnimationFrame(frameId);
    if (hintTimer !== undefined) clearTimeout(hintTimer);
    window.removeEventListener('resize', resize);
    cvs.removeEventListener('pointermove', pointer);
    cvs.removeEventListener('pointerleave', leave);
    cvs.removeEventListener('pointerup', release);
    cvs.removeEventListener('pointercancel', leave);
    cvs.removeEventListener('pointerdown', detonate);
    input.removeEventListener('input', updateText);
    input.removeEventListener('compositionend', updateText);
    save.removeEventListener('click', savePng);
  };
}

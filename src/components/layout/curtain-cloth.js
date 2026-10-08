import * as THREE from "three";

const IMAGE = "/images/Cinemastyle%20textile%20curtain%20banner%20with%20spot%20light%20effect%20_%20Free%20Vector.jpg";
const DURATION = 6.25;

// Each photograph half stays one continuous, subdivided sheet of fabric.
const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uSide;
  varying vec2 vPhotoUv;
  varying float vLight;

  void main() {
    float edge = uv.x;
    float drop = 1.0 - uv.y;
    float sideDelay = uSide > 0.0 ? 0.065 : 0.0;
    // The rail leads; the hem follows with a curved trailing edge.
    float localTime = uTime - 0.7 - sideDelay - drop * 0.26;
    float progress = clamp(localTime / 3.85, 0.0, 1.0);
    float pull = progress * progress * progress * (progress * (progress * 6.0 - 15.0) + 10.0);
    float width = mix(1.002, 0.075, pull);
    float loose = pow(drop, 1.35);
    float energy = sin(pull * 3.14159265);
    float phase = edge * 50.265 + drop * 4.0 - uTime * 3.0 + uSide * 0.7;

    // A traveling ripple and a slower damped swing give the cloth inertia.
    float ripple = sin(phase) * (0.001 + 0.0065 * energy);
    float swing = sin(localTime * 2.6 - drop * 1.6)
      * 0.022 * energy * loose;
    float flutter = sin(uTime * 1.8 - drop * 2.0 + uSide)
      * 0.0015 * loose * sin(edge * 3.14159265);
    float gathered = 1.0 - edge * width;
    float exit = smoothstep(5.15, 6.2, uTime) * 0.22;

    vec3 cloth = vec3(
      uSide * (gathered + exit + swing * edge + ripple * loose * sin(edge * 3.14159265) + flutter),
      position.y * 1.04 + sin(phase - 0.6) * 0.008 * energy * pow(drop, 5.0),
      0.0
    );
    vPhotoUv = vec2(uSide < 0.0 ? edge * 0.5 : 1.0 - edge * 0.5, uv.y);
    vLight = 1.0 + cos(phase) * (0.03 + 0.10 * energy)
      - pull * 0.15 + sin(localTime * 2.6 - drop * 1.6) * 0.02 * loose * energy;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(cloth, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform sampler2D uPhoto;
  uniform vec2 uPhotoScale;
  uniform vec3 uFabricColor;
  varying vec2 vPhotoUv;
  varying float vLight;

  void main() {
    vec2 photoUv = (vPhotoUv - 0.5) * uPhotoScale + 0.5;
    vec3 photo = texture2D(uPhoto, photoUv).rgb;
    float luminance = dot(photo, vec3(0.2126, 0.7152, 0.0722));
    vec3 blueFabric = luminance * uFabricColor;
    gl_FragColor = vec4(blueFabric * vLight, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;

/** @param {HTMLCanvasElement} canvas @param {() => void} onComplete */
export function createCurtainCloth(canvas, onComplete) {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  } catch {
    return () => {};
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.setClearColor(0x000000, 0);
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
  camera.position.z = 2;
  const geometry = new THREE.PlaneGeometry(1, 2, 80, 40);
  const materials = [];
  const photoScale = new THREE.Vector2(1, 1);
  const fabricColor = new THREE.Color(getComputedStyle(canvas).getPropertyValue("--color-neptune").trim() || "#3971a8");
  // Normalize in linear color space so the photo retains the site's blue tint.
  fabricColor.multiplyScalar(1 / (fabricColor.r * 0.2126 + fabricColor.g * 0.7152 + fabricColor.b * 0.0722));
  let texture;
  let disposed = false;
  let observer;

  const resize = () => {
    const width = Math.max(canvas.clientWidth, 1);
    const height = Math.max(canvas.clientHeight, 1);
    renderer.setSize(width, height, false);
    if (texture?.image) {
      const viewportAspect = width / height;
      const imageAspect = texture.image.width / texture.image.height;
      // Match CSS background-size: cover, including portrait screens.
      photoScale.set(Math.min(1, viewportAspect / imageAspect), Math.min(1, imageAspect / viewportAspect));
    }
  };

  new THREE.TextureLoader().load(IMAGE, (loaded) => {
    if (disposed) {
      loaded.dispose();
      return;
    }
    texture = loaded;
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;

    for (const side of [-1, 1]) {
      const material = new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uSide: { value: side },
          uPhoto: { value: texture },
          uPhotoScale: { value: photoScale },
          uFabricColor: { value: fabricColor },
        },
        vertexShader,
        fragmentShader,
        side: THREE.DoubleSide,
        depthTest: false,
        depthWrite: false,
      });
      materials.push(material);
      scene.add(new THREE.Mesh(geometry, material));
    }

    resize();
    observer = new ResizeObserver(resize);
    observer.observe(canvas);
    const started = performance.now();
    renderer.render(scene, camera);
    canvas.dataset.ready = "true";
    renderer.setAnimationLoop((now) => {
      if (disposed) return;
      const elapsed = (now - started) / 1000;
      if (elapsed >= DURATION) {
        renderer.setAnimationLoop(null);
        onComplete();
        return;
      }
      for (const material of materials) material.uniforms.uTime.value = elapsed;
      renderer.render(scene, camera);
    });
  }, undefined, () => {
    // Leave the CSS opening visible when the image cannot be loaded.
  });

  return () => {
    disposed = true;
    renderer.setAnimationLoop(null);
    observer?.disconnect();
    geometry.dispose();
    for (const material of materials) material.dispose();
    texture?.dispose();
    renderer.dispose();
    delete canvas.dataset.ready;
  };
}

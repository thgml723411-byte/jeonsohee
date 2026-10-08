/*!
 * Adapted from Pile of Hearts #1: https://codepen.io/wakana-k/pen/KwpjGpO
 * Heart model by WakanaY.K. Commercial use is not permitted.
 */
import * as THREE from "three";
import { OBJLoader } from "three/addons/loaders/OBJLoader.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { mergeVertices } from "three/addons/utils/BufferGeometryUtils.js";
import { createHeartPhysics, loadAmmo } from "./ammo-physics";

export async function createHeartsScene(container, canvas, signal) {
  const [Ammo, modelText] = await Promise.all([
    loadAmmo(),
    fetch("/models/hearts/heart.obj", { signal }).then((response) => {
      if (!response.ok) throw new Error("Could not load the heart model");
      return response.text();
    }),
  ]);
  if (signal.aborted) return null;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.setClearColor(0x000000, 0);
  renderer.setSize(1, 1, false);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  const scene = new THREE.Scene();
  const room = new RoomEnvironment();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const environment = pmrem.fromScene(room, 0.04);
  scene.environment = environment.texture;
  room.dispose();
  pmrem.dispose();
  scene.add(new THREE.HemisphereLight(0xffffff, 0x87596d, 2.4));
  const key = new THREE.DirectionalLight(0xffffff, 3);
  key.position.set(-3, 6, 8);
  scene.add(key);
  const camera = new THREE.OrthographicCamera(-4, 4, 5, -5, 0.1, 40);
  camera.position.set(0, 0, 14);

  const model = new OBJLoader().parse(modelText);
  const source = model.children.find((child) => child.isMesh).geometry;
  const geometry = mergeVertices(source);
  geometry.computeVertexNormals();
  geometry.computeBoundingBox();
  const size = geometry.boundingBox.getSize(new THREE.Vector3());
  geometry.center();
  const scale = 0.58 / Math.max(size.x, size.y, size.z);
  geometry.scale(scale, scale, scale);
  model.traverse((child) => {
    if (child.isMesh) {
      child.geometry.dispose();
      const materials = Array.isArray(child.material) ? child.material : [child.material];
      materials.forEach((material) => material.dispose());
    }
  });

  const materials = ["deeppink", "pink", "pink"].map((color) => new THREE.MeshPhysicalMaterial({
    color, metalness: 0.38, roughness: 0.22, clearcoat: 1, clearcoatRoughness: 0.15,
  }));
  const physics = createHeartPhysics(Ammo, geometry);
  const hearts = [];
  let height = 10;
  let elapsed = 0;
  let nextHeart = 0;
  let frame = 0;
  let lastTime = 0;
  let running = false;
  let disposed = false;

  function resize() {
    const width = container.clientWidth;
    const pixels = container.clientHeight;
    if (!width || !pixels) return;
    height = 8 * pixels / width;
    camera.top = height / 2;
    camera.bottom = -height / 2;
    camera.updateProjectionMatrix();
    renderer.setSize(width, pixels, false);
    const headGap = container.parentElement.getBoundingClientRect().top - container.getBoundingClientRect().top;
    physics.setBounds(height, height / 2 - 8 * headGap / width);
    renderer.render(scene, camera);
  }

  function animate(now) {
    if (!running || disposed) return;
    const delta = lastTime ? Math.min((now - lastTime) / 1000, 0.05) : 0;
    lastTime = now;
    elapsed += delta;
    if (elapsed >= nextHeart && hearts.length < 36) {
      const mesh = new THREE.Mesh(geometry, materials[hearts.length % materials.length]);
      mesh.position.set(0, height / 2 - 0.3, 0);
      scene.add(mesh);
      const heart = physics.addHeart(mesh, hearts.length % 2 ? 1 : -1);
      heart.born = elapsed;
      hearts.push(heart);
      nextHeart = elapsed + 0.3;
    }
    physics.step(delta);
    for (const heart of hearts) {
      if (elapsed - heart.born > 13 || Math.abs(heart.mesh.position.x) > 4.2 || heart.mesh.position.y < -height / 2 - 1) {
        physics.resetHeart(heart, height / 2 - 0.3);
        heart.born = elapsed;
      }
    }
    canvas.dataset.hearts = String(hearts.length);
    renderer.render(scene, camera);
    frame = requestAnimationFrame(animate);
  }

  const observer = new ResizeObserver(resize);
  observer.observe(container);
  resize();

  return {
    setRunning(value) {
      if (disposed || running === value) return;
      running = value;
      lastTime = 0;
      if (running) frame = requestAnimationFrame(animate);
      else cancelAnimationFrame(frame);
      container.dataset.state = running ? "playing" : "paused";
    },
    dispose() {
      disposed = true;
      running = false;
      cancelAnimationFrame(frame);
      observer.disconnect();
      physics.dispose();
      geometry.dispose();
      materials.forEach((material) => material.dispose());
      environment.dispose();
      scene.clear();
      renderer.dispose();
      renderer.forceContextLoss();
    },
  };
}

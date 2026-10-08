let ammoPromise;

export function loadAmmo() {
  if (!ammoPromise) {
    ammoPromise = new Promise((resolve, reject) => {
      if (window.Ammo) return resolve(window.Ammo);
      const script = document.createElement("script");
      script.src = "/vendor/ammo/ammo.wasm.js";
      script.async = true;
      script.onload = () => resolve(window.Ammo);
      script.onerror = () => {
        script.remove();
        reject(new Error("Could not load Ammo.js"));
      };
      document.head.appendChild(script);
    }).then((factory) => factory({
      locateFile: (file) => `/vendor/ammo/${file}`,
    })).catch((error) => {
      ammoPromise = undefined;
      throw error;
    });
  }
  return ammoPromise;
}

/** The supplied convex-hull physics, stepped by the scene's animation frame. */
export function createHeartPhysics(Ammo, geometry) {
  const owned = [];
  const own = (object) => { owned.push(object); return object; };
  const config = own(new Ammo.btDefaultCollisionConfiguration());
  const dispatcher = own(new Ammo.btCollisionDispatcher(config));
  const broadphase = own(new Ammo.btDbvtBroadphase());
  const solver = own(new Ammo.btSequentialImpulseConstraintSolver());
  const world = own(new Ammo.btDiscreteDynamicsWorld(dispatcher, broadphase, solver, config));
  const vector = own(new Ammo.btVector3(0, -6, 0));
  const transform = own(new Ammo.btTransform());
  world.setGravity(vector);

  const heartShape = own(new Ammo.btConvexHullShape());
  const positions = geometry.getAttribute("position");
  // OBJ faces duplicate vertices; a bounded sample is enough for these small hearts.
  const stride = Math.max(1, Math.floor(positions.count / 240));
  for (let index = 0; index < positions.count; index += stride) {
    vector.setValue(positions.getX(index), positions.getY(index), positions.getZ(index));
    heartShape.addPoint(vector, false);
  }
  heartShape.recalcLocalAabb();
  heartShape.setMargin(0.008);
  const bodies = [];
  const hearts = [];

  function addBody(shape, mass, position, quaternion = { x: 0, y: 0, z: 0, w: 1 }) {
    transform.setIdentity();
    vector.setValue(position.x, position.y, position.z);
    transform.setOrigin(vector);
    const rotation = new Ammo.btQuaternion(quaternion.x, quaternion.y, quaternion.z, quaternion.w);
    transform.setRotation(rotation);
    Ammo.destroy(rotation);
    const motion = own(new Ammo.btDefaultMotionState(transform));
    vector.setValue(0, 0, 0);
    if (mass) shape.calculateLocalInertia(mass, vector);
    const info = new Ammo.btRigidBodyConstructionInfo(mass, motion, shape, vector);
    const body = own(new Ammo.btRigidBody(info));
    Ammo.destroy(info);
    body.setFriction(0.55);
    body.setRestitution(0.25);
    body.setDamping(0.08, 0.18);
    world.addRigidBody(body);
    bodies.push(body);
    return body;
  }

  function box(width, height, depth, position) {
    vector.setValue(width / 2, height / 2, depth / 2);
    const shape = own(new Ammo.btBoxShape(vector));
    return addBody(shape, 0, position);
  }

  const headShape = own(new Ammo.btSphereShape(0.7));
  const head = addBody(headShape, 0, { x: 0, y: 0, z: 0 });
  const floor = box(8, 0.16, 4, { x: 0, y: -6, z: 0 });

  function move(body, x, y, z, quaternion) {
    transform.setIdentity();
    vector.setValue(x, y, z);
    transform.setOrigin(vector);
    if (quaternion) {
      const rotation = new Ammo.btQuaternion(quaternion.x, quaternion.y, quaternion.z, quaternion.w);
      transform.setRotation(rotation);
      Ammo.destroy(rotation);
    }
    body.setWorldTransform(transform);
    body.getMotionState().setWorldTransform(transform);
    world.updateSingleAabb(body);
  }

  return {
    setBounds(height, headY) {
      move(head, 0, headY - 0.7, 0);
      move(floor, 0, -height / 2 + 0.06, 0);
    },
    addHeart(mesh, direction) {
      const body = addBody(heartShape, 0.4, mesh.position, mesh.quaternion);
      vector.setValue(1, 1, 0);
      body.setLinearFactor(vector);
      const heart = { mesh, body, direction };
      hearts.push(heart);
      this.resetHeart(heart, mesh.position.y);
      return heart;
    },
    resetHeart(heart, y) {
      heart.mesh.rotation.set(Math.random() * 0.4 - 0.2, Math.random() * 0.8 - 0.4, Math.random() - 0.5);
      move(heart.body, heart.direction * (0.12 + Math.random() * 0.2), y, 0, heart.mesh.quaternion);
      vector.setValue(heart.direction * (0.35 + Math.random() * 0.25), -0.15, 0);
      heart.body.setLinearVelocity(vector);
      vector.setValue(Math.random() - 0.5, Math.random() - 0.5, heart.direction * 0.6);
      heart.body.setAngularVelocity(vector);
      heart.body.clearForces();
      heart.body.activate();
    },
    step(delta) {
      world.stepSimulation(delta, 4, 1 / 60);
      for (const { body, mesh } of hearts) {
        body.getMotionState().getWorldTransform(transform);
        const origin = transform.getOrigin();
        const rotation = transform.getRotation();
        mesh.position.set(origin.x(), origin.y(), origin.z());
        mesh.quaternion.set(rotation.x(), rotation.y(), rotation.z(), rotation.w());
      }
    },
    dispose() {
      for (const body of bodies) world.removeRigidBody(body);
      for (const resource of owned.reverse()) Ammo.destroy(resource);
      hearts.length = 0;
      bodies.length = 0;
    },
  };
}

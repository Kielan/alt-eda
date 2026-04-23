class RoutingEngine {
  constructor(scene) {
    this.scene = scene;
    // --- single source of truth ---
    this.points = [];
    this.mode = "manhattan"; // "manhattan" | "45deg"
    this.lockedAxis = null;
    // rendering
    this.group = new THREE.Group();
    this.material = new THREE.MeshStandardMaterial({
      color: 0xffaa00,
      emissive: 0xff6600,
      emissiveIntensity: 0.3
    });
    this.width = 0.6;
    this.scene.add(this.group);
  }
  // public API
  start(point) {
    this.points = [point.clone()];
    this.lockedAxis = null;
    this.redraw([]);
  }
  addPoint(point) {
    this.points.push(point.clone());
  }
  updateCursor(cursor) {
    if (this.points.length === 0) return;
    const last = this.points[this.points.length - 1];
    const corner = this.solveCorner(last, cursor);
    const preview = [
      ...this.points,
      corner,
      cursor.clone()
    ];
    this.redraw(preview);
  }
  finish() {
    const result = [...this.points];
    this.clear();
    return result;
  }
  clear() {
    this.group.clear();
    this.points = [];
    this.lockedAxis = null;
  }
  setMode(mode) {
    this.mode = mode;
  }
  // core routing logic
  solveCorner(a, b) {
    if (this.mode === "manhattan") {
      return new THREE.Vector3(b.x, a.y, a.z);
    }
    if (this.mode === "45deg") {
      const dx = b.x - a.x;
      const dz = b.z - a.z;
      const dist = Math.min(Math.abs(dx), Math.abs(dz));
      return new THREE.Vector3(
        a.x + Math.sign(dx) * dist,
        a.y,
        a.z + Math.sign(dz) * dist
      );
    }
    return b;
  }
  applyAxisLock(start, current) {
    // lazy lock (only computed once per route)
    if (!this.lockedAxis) {
      const dx = Math.abs(current.x - start.x);
      const dz = Math.abs(current.z - start.z);
      this.lockedAxis = dx > dz ? "x" : "z";
    }
    if (this.lockedAxis === "x") {
      current.z = start.z;
    } else {
      current.x = start.x;
    }
    return current;
  }
  // rendering
  redraw(points) {
    this.group.clear();
    if (points.length < 2) return;
    for (let i = 0; i < points.length - 1; i++) {
      const a = points[i];
      const b = points[i + 1];
      const seg = this.createSegment(a, b);
      this.group.add(seg);
    }
  }
  createSegment(a, b) {
    const length = a.distanceTo(b);
    const geo = new THREE.BoxGeometry(this.width, 0.05, length);
    const mesh = new THREE.Mesh(geo, this.material);
    const mid = new THREE.Vector3()
      .addVectors(a, b)
      .multiplyScalar(0.5);
    mesh.position.copy(mid);
    mesh.lookAt(b);
    mesh.rotateX(Math.PI / 2);
    return mesh;
  }
}
//USAGE
//const router = new RoutingEngine(scene);
/** UPDATED EVENT HANDLING
window.addEventListener("mousedown", (e) => {
  const p = snapToGrid(getMousePoint(e, camera));
  if (router.points.length === 0) {
    router.start(p);
  } else {
    router.addPoint(p);
  }
});
window.addEventListener("mousemove", (e) => {
  const p = snapToGrid(getMousePoint(e, camera));
  router.updateCursor(p);
});
window.addEventListener("dblclick", () => {
  const final = router.finish();
  console.log("Final trace:", final);
});
**/
/**
Before
Multiple competing state holders:

tracePreview.points
lockedAxis global variable
external routing flags
duplicated preview logic

After
Everything derived from exactly ONE truth:
router.points
**/

import * as THREE from "three"

export class SelectionManager {
  raycaster = new THREE.Raycaster()
  mouse = new THREE.Vector2()
  camera: THREE.Camera
  scene: THREE.Scene
  selected: any = null
  constructor(camera: THREE.Camera, scene: THREE.Scene) {
    this.camera = camera
    this.scene = scene
  }
  pick(event: MouseEvent) {
    this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1
    this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1
    this.raycaster.setFromCamera(this.mouse, this.camera)
    const hits = this.raycaster.intersectObjects(
      this.scene.children,
      true
    )
    if (hits.length === 0) return null
    const obj = hits[0].object
    // 🔥 detect pad
    if (obj.userData.pad) {
      this.select(obj.userData.pad)
      return obj.userData.pad
    }
    return null
  }
  select(obj: any) {
    if (this.selected) {
      this.clearSelection(this.selected)
    }
    this.selected = obj
    // highlight
    if (obj.mesh) {
      obj.mesh.material.emissive.set(0x00ff00)
    }
  }
  clearSelection(obj: any) {
    if (obj.mesh) {
      obj.mesh.material.emissive.set(0x000000)
    }
  }
}

const selector = new SelectionManager(camera, scene)
window.addEventListener("mousedown", (e) => {
  const picked = selector.pick(e)
  if (picked) {
    console.log("Selected pad:", picked.id)
    // 🔥 start routing from this pad
    if (picked.net) {
      startRoutingFromPad(picked)
    }
  }
})


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

  pick(e: MouseEvent) {
    this.mouse.x = (e.clientX/window.innerWidth)*2-1
    this.mouse.y = -(e.clientY/window.innerHeight)*2+1
    this.raycaster.setFromCamera(this.mouse, this.camera)
    const hits = this.raycaster.intersectObjects(this.scene.children, true)
    if (!hits.length) return null
    const obj = hits[0].object
    if (obj.userData.pad) return obj.userData.pad
    if (obj.parent?.userData.component) return obj.parent.userData.component
    return null
  }
}

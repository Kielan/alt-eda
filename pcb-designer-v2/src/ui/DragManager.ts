
import * as THREE from "three"

export class DragManager {
  dragging: any = null
  plane = new THREE.Plane(new THREE.Vector3(0,1,0),0)
  raycaster = new THREE.Raycaster()
  mouse = new THREE.Vector2()
  camera: THREE.Camera

  constructor(camera: THREE.Camera) {
    this.camera = camera
  }

  start(obj: any) {
    if (obj.group) this.dragging = obj
  }

  update(e: MouseEvent) {
    if (!this.dragging) return
    this.mouse.x = (e.clientX/window.innerWidth)*2-1
    this.mouse.y = -(e.clientY/window.innerHeight)*2+1
    this.raycaster.setFromCamera(this.mouse, this.camera)
    const p = new THREE.Vector3()
    this.raycaster.ray.intersectPlane(this.plane, p)
    // snap
    p.x = Math.round(p.x/1)*1
    p.z = Math.round(p.z/1)*1
    this.dragging.group.position.copy(p)
  }

  stop() {
    this.dragging = null
  }
}

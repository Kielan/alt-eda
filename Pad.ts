import * as THREE from "three"
import { Net } from "../net/Net"

export class Pad {
  id: string
  position: THREE.Vector3
  mesh: THREE.Mesh
  net: Net | null = null
  constructor(id: string, position: THREE.Vector3, size: number) {
    this.id = id
    this.position = position
    const geo = new THREE.CircleGeometry(size, 16)
    const mat = new THREE.MeshStandardMaterial({ color: 0xaaaaaa })
    this.mesh = new THREE.Mesh(geo, mat)
    this.mesh.rotation.x = -Math.PI / 2
    this.mesh.position.copy(position)
    // 🔥 IMPORTANT: link back to object
    this.mesh.userData.pad = this
  }
  connect(net: Net) {
    this.net = net
    net.pads.add(this)

    // color feedback
    this.mesh.material.color.set(net.color)
  }
}

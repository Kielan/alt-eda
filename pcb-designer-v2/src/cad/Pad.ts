
import * as THREE from "three"

export class Pad {
  id: string
  mesh: THREE.Mesh
  net: any = null

  constructor(id: string, pos: THREE.Vector3, size: number) {
    const geo = new THREE.CircleGeometry(size, 16)
    const mat = new THREE.MeshStandardMaterial({ color: 0xaaaaaa })
    this.mesh = new THREE.Mesh(geo, mat)
    this.mesh.rotation.x = -Math.PI/2
    this.mesh.position.copy(pos)
    this.mesh.userData.pad = this
    this.id = id
  }

  connect(net: any) {
    this.net = net
    net.pads.add(this)
    this.mesh.material.color.set(net.color)
  }
}

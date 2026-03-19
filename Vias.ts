import * as THREE from "three"

interface ViaParams {
  x: number
  y: number
  drill: number
  diameter: number
  startLayer: number
  endLayer: number
}

export function createVia(p: ViaParams) {
  const group = new THREE.Group()
  const copper = new THREE.CylinderGeometry(
    p.diameter/2,
    p.diameter/2,
    0.1,
    32
  )
  const copperMesh = new THREE.Mesh(
    copper,
    new THREE.MeshStandardMaterial({color:0xffaa00})
  )
  copperMesh.rotation.x = Math.PI/2
  group.add(copperMesh)
  group.position.set(p.x,0,p.y)
  return group
}

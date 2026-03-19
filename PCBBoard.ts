import * as THREE from "three"

export class PCBBoard {
    mesh: THREE.Mesh
    constructor(width = 100, height = 80, thickness = 1.6) {
        const geo = new THREE.BoxGeometry(
            width,
            thickness,
            height
        )
        const mat = new THREE.MeshStandardMaterial({
            color: 0x0f6a2f
        })
        this.mesh = new THREE.Mesh(geo, mat)
        this.mesh.position.y = thickness / 2
    }
}

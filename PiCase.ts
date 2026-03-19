import * as THREE from "three"

export function createPiCase() {
    const outer = new THREE.BoxGeometry(100, 30, 70)
    const inner = new THREE.BoxGeometry(92, 26, 62)

    const outerMesh = new THREE.Mesh(
        outer,
        new THREE.MeshStandardMaterial({
            color: 0x111111,
            metalness: .2,
            roughness: .8
        })
    )

    const innerMesh = new THREE.Mesh(inner)

    innerMesh.position.y = 2

    // boolean difference later
    outerMesh.position.y = 15

    return outerMesh
}

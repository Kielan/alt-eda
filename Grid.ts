import * as THREE from "three"

export function createGrid() {
    const size = 2000
    const divisions = 200
    const grid = new THREE.GridHelper(
        size,
        divisions,
        0x00ffaa,
        0x004444
    )
    grid.material.opacity = 0.3
    grid.material.transparent = true

    return grid
}

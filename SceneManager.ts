import * as THREE from "three";

export class SceneManager {
    scene: THREE.Scene
    camera: THREE.PerspectiveCamera
    renderer: THREE.WebGLRenderer

    constructor(container: HTMLElement) {
        this.scene = new THREE.Scene()
        this.scene.background = new THREE.Color(0x000000)

        this.camera = new THREE.PerspectiveCamera(
            60,
            window.innerWidth / window.innerHeight,
            0.1,
            10000
        )

        this.camera.position.set(0, 200, 200)

        this.renderer = new THREE.WebGLRenderer({ antialias: true })
        this.renderer.setSize(window.innerWidth, window.innerHeight)

        container.appendChild(this.renderer.domElement)

        const light = new THREE.HemisphereLight(0xffffff, 0x444444, 1)
        this.scene.add(light)

        this.animate()
    }

    animate = () => {
        requestAnimationFrame(this.animate)
        this.renderer.render(this.scene, this.camera)
    }
}

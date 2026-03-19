import * as THREE from "three"

export class TracePreview {
    scene: THREE.Scene
    mesh: THREE.Mesh | null = null
    points: THREE.Vector3[] = []
    width: number = 0.6
    material = new THREE.MeshStandardMaterial({
        color: 0xff5500,
        emissive: 0xff2200,
        emissiveIntensity: 0.5
    })
    constructor(scene: THREE.Scene) {
        this.scene = scene
    }
    start(point: THREE.Vector3) {
        this.points = [point.clone()]
    }
    addPoint(point: THREE.Vector3) {
        this.points.push(point.clone())
    }
    updateCursor(point: THREE.Vector3) {
        if (this.points.length === 0) return

        const previewPoints = [...this.points, point.clone()]
        this.draw(previewPoints)

    }
    finish() {
        const finalPoints = [...this.points]
        this.clear()
        return finalPoints
    }
    clear() {
        if (this.mesh) {
            this.scene.remove(this.mesh)
            this.mesh.geometry.dispose()
            this.mesh = null
        }
        this.points = []
    }
    private draw(points: THREE.Vector3[]) {
        if (this.mesh) {
            this.scene.remove(this.mesh)
            this.mesh.geometry.dispose()
        }

        if (points.length < 2) return

        const curve = new THREE.CatmullRomCurve3(points)
        const geometry = new THREE.TubeGeometry(
            curve,
            points.length * 10,
            this.width / 2,
            8,
            false
        )
        this.mesh = new THREE.Mesh(geometry, this.material)
        this.scene.add(this.mesh)
    }
}

const raycaster = new THREE.Raycaster()
const mouse = new THREE.Vector2()

function getMousePoint(event: MouseEvent, camera: THREE.Camera) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1
    raycaster.setFromCamera(mouse, camera)
    const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)
    const point = new THREE.Vector3()
    raycaster.ray.intersectPlane(plane, point)

    return point
}

function snapToGrid(v: THREE.Vector3, grid = 1) {
    v.x = Math.round(v.x / grid) * grid
    v.z = Math.round(v.z / grid) * grid

    return v
}

const tracePreview = new TracePreview(scene)

let routing = false

window.addEventListener("mousedown", (e) => {
    const p = snapToGrid(getMousePoint(e, camera))
    if (!routing) {
        tracePreview.start(p)
        routing = true
    } else {
        tracePreview.addPoint(p)
    }
})

window.addEventListener("mousemove", (e) => {
    if (!routing) return
    const p = snapToGrid(getMousePoint(e, camera))
    tracePreview.updateCursor(p)
})

window.addEventListener("dblclick", () => {
    if (!routing) return
    const final = tracePreview.finish()
    // TODO: convert to real trace object
    console.log("Final trace:", final)
    routing = false
})

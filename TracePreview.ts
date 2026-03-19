import * as THREE from "three"

type RoutingMode = "manhattan" | "45deg"

function solveCorner(a: THREE.Vector3, b: THREE.Vector3, mode: RoutingMode) {
    if (mode === "manhattan") {
        // 90° routing (L-shape)
        return new THREE.Vector3(b.x, a.y, a.z)
    }
    if (mode === "45deg") {
        const dx = b.x - a.x
        const dz = b.z - a.z
        const dist = Math.min(Math.abs(dx), Math.abs(dz))
        return new THREE.Vector3(
            a.x + Math.sign(dx) * dist,
            a.y,
            a.z + Math.sign(dz) * dist
        )
    }
    return b
}

let lockedAxis: "x" | "z" | null = null

function applyAxisLock(start: THREE.Vector3, current: THREE.Vector3) {

    if (!lockedAxis) {
        const dx = Math.abs(current.x - start.x)
        const dz = Math.abs(current.z - start.z)

        lockedAxis = dx > dz ? "x" : "z"
    }

    if (lockedAxis === "x") {
        current.z = start.z
    } else {
        current.x = start.x
    }

    return current
}

window.addEventListener("keydown", (e) => {
    if (e.key === "v") {
        const last = tracePreview.points.at(-1)
        if (!last) return
        createVia({
            x: last.x,
            y: last.z,
            drill: 0.3,
            diameter: 0.6,
            startLayer: 0,
            endLayer: 1
        })
        // switch layer
        currentLayer = currentLayer === 0 ? 1 : 0
    }
})

export class TracePreview {
    scene: THREE.Scene
    group = new THREE.Group()
    points: THREE.Vector3[] = []
    width = 0.6
    mode: RoutingMode = "manhattan"
    material = new THREE.MeshStandardMaterial({
        color: 0xffaa00,
        emissive: 0xff6600,
        emissiveIntensity: 0.3
    })
    constructor(scene: THREE.Scene) {
        this.scene = scene
        this.scene.add(this.group)
    }
    start(p: THREE.Vector3) {
        this.points = [p.clone()]
    }
    addPoint(p: THREE.Vector3) {
        this.points.push(p.clone())
    }
    updateCursor(cursor: THREE.Vector3) {
        if (this.points.length === 0) return
        const last = this.points[this.points.length - 1]
        const corner = solveCorner(last, cursor, this.mode
        const previewPoints = [
            ...this.points,
            corner,
            cursor.clone()
        ]

        this.draw(previewPoints)
    }
    finish() {
        const result = [...this.points]
        this.clear()
        return result
    }
    clear() {
        this.group.clear()
        this.points = []
    }
    private draw(points: THREE.Vector3[]) {
        this.group.clear()
        for (let i = 0; i < points.length - 1; i++) {
            const a = points[i]
            const b = points[i + 1]
            const segment = this.createSegment(a, b)
            this.group.add(segment)
        }
    }

    private createSegment(a: THREE.Vector3, b: THREE.Vector3) {

        const length = a.distanceTo(b)

        const geo = new THREE.BoxGeometry(this.width, 0.05, length)

        const mesh = new THREE.Mesh(geo, this.material)

        const mid = new THREE.Vector3().addVectors(a, b).multiplyScalar(0.5)

        mesh.position.copy(mid)

        mesh.lookAt(b)

        mesh.rotateX(Math.PI / 2)

        return mesh
    }
}

window.addEventListener("keydown", (e) => {

    if (e.key === "v") {

        const last = tracePreview.points.at(-1)

        if (!last) return

        createVia({
            x: last.x,
            y: last.z,
            drill: 0.3,
            diameter: 0.6,
            startLayer: 0,
            endLayer: 1
        })

        // switch layer
        currentLayer = currentLayer === 0 ? 1 : 0
    }

})

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

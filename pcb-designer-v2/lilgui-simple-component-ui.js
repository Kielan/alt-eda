import * as THREE from "three"
import GUI from "lil-gui"

/* =====================================================
   SECTION 1 — BASIC THREE.JS PCB SCENE
===================================================== */

const scene = new THREE.Scene()
scene.background = new THREE.Color(0x000000)

const camera = new THREE.PerspectiveCamera(60, innerWidth/innerHeight, 0.1, 1000)
camera.position.set(0, 120, 120)

const renderer = new THREE.WebGLRenderer({ antialias: true })
renderer.setSize(innerWidth, innerHeight)
document.body.appendChild(renderer.domElement)

const light = new THREE.HemisphereLight(0xffffff, 0x444444, 1)
scene.add(light)

// PCB board
const boardGeo = new THREE.BoxGeometry(200, 2, 150)
const boardMat = new THREE.MeshStandardMaterial({ color: 0x0b3d2e })
const board = new THREE.Mesh(boardGeo, boardMat)
scene.add(board)

/* =====================================================
   SECTION 2 — SIMPLE COMPONENT SYSTEM
===================================================== */

type Pad = {
  mesh: THREE.Mesh
}

type Component = {
  name: string
  group: THREE.Group
  pads: Pad[]
}

const components: Component[] = []

function createCapacitor(): Component {

  const group = new THREE.Group()

  const body = new THREE.Mesh(
    new THREE.BoxGeometry(6, 2, 3),
    new THREE.MeshStandardMaterial({ color: 0xcccccc })
  )
  body.position.y = 1
  group.add(body)

  const pads: Pad[] = []

  const padGeo = new THREE.CircleGeometry(1, 16)
  const padMat = new THREE.MeshStandardMaterial({ color: 0xffaa00 })

  const p1 = new THREE.Mesh(padGeo, padMat)
  p1.rotation.x = -Math.PI/2
  p1.position.set(-4, 0.1, 0)
  group.add(p1)

  const p2 = new THREE.Mesh(padGeo, padMat)
  p2.rotation.x = -Math.PI/2
  p2.position.set(4, 0.1, 0)
  group.add(p2)

  pads.push({ mesh: p1 }, { mesh: p2 })

  return { name: "Capacitor", group, pads }
}

let placingComponent: Component | null = null

window.addEventListener("click", (e) => {

  if (!placingComponent) return

  const rect = renderer.domElement.getBoundingClientRect()

  const mouse = new THREE.Vector2(
    ((e.clientX - rect.left) / rect.width) * 2 - 1,
    -((e.clientY - rect.top) / rect.height) * 2 + 1
  )

  const raycaster = new THREE.Raycaster()
  raycaster.setFromCamera(mouse, camera)

  const intersects = raycaster.intersectObject(board)

  if (intersects.length) {

    const p = intersects[0].point

    placingComponent.group.position.set(p.x, 1, p.z)
    scene.add(placingComponent.group)

    components.push(placingComponent)
    placingComponent = null
  }
})

/* =====================================================
   SECTION 3 — LIL-GUI COMPONENT LIBRARY PANEL
===================================================== */

const gui = new GUI({ title: "Components", width: 520 })
document.body.appendChild(gui.domElement)

// style like Altium
gui.domElement.style.background = "#2b2b2b"
gui.domElement.style.color = "#ddd"
gui.domElement.style.fontFamily = "Segoe UI"
gui.domElement.style.fontSize = "12px"

// container (multi-column hack)
const container = document.createElement("div")
container.style.display = "flex"
container.style.height = "500px"
container.style.background = "#2e2e2e"
gui.domElement.appendChild(container)

/* -------- LEFT: Categories -------- */

const categories = document.createElement("div")
categories.style.width = "140px"
categories.style.borderRight = "1px solid #444"

categories.innerHTML = `
<div style="padding:6px;font-weight:bold;">Categories</div>
<ul style="list-style:none;padding:0;">
  <li data-cat="passive">Resistors</li>
  <li data-cat="passive">Capacitors</li>
  <li data-cat="ic">ICs</li>
  <li data-cat="conn">Connectors</li>
</ul>
`

container.appendChild(categories)

/* -------- MIDDLE: Filters -------- */

const filters = document.createElement("div")
filters.style.width = "160px"
filters.style.borderRight = "1px solid #444"

filters.innerHTML = `
<div style="padding:6px;font-weight:bold;">Filters</div>
<label><input type="checkbox"/> 1uF</label><br/>
<label><input type="checkbox"/> 10uF</label><br/>
<label><input type="checkbox"/> 100nF</label>
`

container.appendChild(filters)

/* -------- LIST -------- */

const list = document.createElement("div")
list.style.flex = "1"
list.style.overflow = "auto"

list.innerHTML = `
<div style="padding:6px;font-weight:bold;">Components</div>
<ul id="compList" style="list-style:none;padding:0;">
  <li data-name="Capacitor">C_0603_1uF</li>
  <li data-name="Capacitor">C_0402_100nF</li>
</ul>
`

container.appendChild(list)

/* -------- PREVIEW -------- */

const preview = document.createElement("div")
preview.style.width = "180px"
preview.style.borderLeft = "1px solid #444"
preview.style.padding = "6px"

preview.innerHTML = `
<div style="font-weight:bold;">Preview</div>
<div id="previewBox" style="height:120px;background:#111;margin-top:6px;"></div>
<div id="previewText" style="margin-top:6px;">Select a component</div>
`

container.appendChild(preview)

/* =====================================================
   SECTION 4 — INTERACTION (LIKE ALTIUM PANEL)
===================================================== */

const compList = list.querySelector("#compList")!

compList.addEventListener("click", (e: any) => {

  if (e.target.tagName !== "LI") return

  const name = e.target.dataset.name

  // preview update
  ;(document.getElementById("previewText")!).innerText = name

  // create component
  if (name === "Capacitor") {
    placingComponent = createCapacitor()
  }
})

/* =====================================================
   SECTION 5 — ANIMATION LOOP
===================================================== */

function animate() {
  requestAnimationFrame(animate)
  renderer.render(scene, camera)
}
animate()

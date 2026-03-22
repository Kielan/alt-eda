# Build an expanded project with dragging, snapping, rotation, and a simple netlist importer, then zip it.

import os, zipfile, textwrap

base = "/mnt/data/pcb-designer-v2"
os.makedirs(base, exist_ok=True)

def write(path, content):
    full = os.path.join(base, path)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    with open(full, "w") as f:
        f.write(textwrap.dedent(content))

# package.json
write("package.json", """
{
  "name": "pcb-designer",
  "version": "0.0.1",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "three": "^0.161.0"
  },
  "devDependencies": {
    "typescript": "^5.4.0",
    "vite": "^5.1.0"
  }
}
""")

# index.html
write("index.html", """
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>PCB Designer</title>
    <style>
      body { margin: 0; overflow: hidden; }
      #ui { position: absolute; top: 10px; left: 10px; color: white; }
    </style>
  </head>
  <body>
    <div id="ui">Click pads to select. Drag components. Press R to rotate.</div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
""")

# Net system
write("src/net/Net.ts", """
export class Net {
  id: string
  color: number
  pads = new Set<any>()

  constructor(id: string, color: number) {
    this.id = id
    this.color = color
  }
}
""")

write("src/net/NetManager.ts", """
import { Net } from "./Net"

export class NetManager {
  nets = new Map<string, Net>()

  createNet(name: string) {
    const net = new Net(name, Math.random() * 0xffffff)
    this.nets.set(name, net)
    return net
  }

  get(name: string) {
    return this.nets.get(name)
  }
}
""")

# Pad
write("src/cad/Pad.ts", """
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
""")

# Footprint
write("src/cad/Footprint.ts", """
import * as THREE from "three"

export interface PadShape {
  position: THREE.Vector3
  size: number
}

export class Footprint {
  name: string
  pads: PadShape[]

  constructor(name: string, pads: PadShape[]) {
    this.name = name
    this.pads = pads
  }
}
""")

# Component
write("src/cad/Component.ts", """
import * as THREE from "three"
import { Footprint } from "./Footprint"
import { Pad } from "./Pad"

export class Component {
  group = new THREE.Group()
  pads: Pad[] = []

  constructor(fp: Footprint, pos: THREE.Vector3) {
    let i = 0
    for (const p of fp.pads) {
      const pad = new Pad("pad_"+i++, p.position.clone(), p.size)
      this.pads.push(pad)
      this.group.add(pad.mesh)
    }
    this.group.position.copy(pos)
    this.group.userData.component = this
  }
}
""")

# Selection
write("src/ui/SelectionManager.ts", """
import * as THREE from "three"

export class SelectionManager {
  raycaster = new THREE.Raycaster()
  mouse = new THREE.Vector2()
  camera: THREE.Camera
  scene: THREE.Scene
  selected: any = null

  constructor(camera: THREE.Camera, scene: THREE.Scene) {
    this.camera = camera
    this.scene = scene
  }

  pick(e: MouseEvent) {
    this.mouse.x = (e.clientX/window.innerWidth)*2-1
    this.mouse.y = -(e.clientY/window.innerHeight)*2+1
    this.raycaster.setFromCamera(this.mouse, this.camera)
    const hits = this.raycaster.intersectObjects(this.scene.children, true)
    if (!hits.length) return null
    const obj = hits[0].object
    if (obj.userData.pad) return obj.userData.pad
    if (obj.parent?.userData.component) return obj.parent.userData.component
    return null
  }
}
""")

# Drag manager
write("src/ui/DragManager.ts", """
import * as THREE from "three"

export class DragManager {
  dragging: any = null
  plane = new THREE.Plane(new THREE.Vector3(0,1,0),0)
  raycaster = new THREE.Raycaster()
  mouse = new THREE.Vector2()
  camera: THREE.Camera

  constructor(camera: THREE.Camera) {
    this.camera = camera
  }

  start(obj: any) {
    if (obj.group) this.dragging = obj
  }

  update(e: MouseEvent) {
    if (!this.dragging) return
    this.mouse.x = (e.clientX/window.innerWidth)*2-1
    this.mouse.y = -(e.clientY/window.innerHeight)*2+1
    this.raycaster.setFromCamera(this.mouse, this.camera)
    const p = new THREE.Vector3()
    this.raycaster.ray.intersectPlane(this.plane, p)
    // snap
    p.x = Math.round(p.x/1)*1
    p.z = Math.round(p.z/1)*1
    this.dragging.group.position.copy(p)
  }

  stop() {
    this.dragging = null
  }
}
""")

# Netlist importer
write("src/io/NetlistImporter.ts", """
import { NetManager } from "../net/NetManager"

export function importSimpleNetlist(data: any, components: any[], netManager: NetManager) {
  for (const netDef of data.nets) {
    const net = netManager.createNet(netDef.name)
    for (const ref of netDef.pads) {
      const comp = components.find(c => c.ref === ref.comp)
      if (!comp) continue
      const pad = comp.pads[ref.pad]
      if (pad) pad.connect(net)
    }
  }
}
""")

# main
write("src/main.ts", """
import * as THREE from "three"
import { Footprint } from "./cad/Footprint"
import { Component } from "./cad/Component"
import { SelectionManager } from "./ui/SelectionManager"
import { DragManager } from "./ui/DragManager"
import { NetManager } from "./net/NetManager"
import { importSimpleNetlist } from "./io/NetlistImporter"

const scene = new THREE.Scene()
scene.background = new THREE.Color(0x000000)

const camera = new THREE.PerspectiveCamera(60, innerWidth/innerHeight, 0.1, 1000)
camera.position.set(0,100,100)

const renderer = new THREE.WebGLRenderer()
renderer.setSize(innerWidth, innerHeight)
document.body.appendChild(renderer.domElement)

const light = new THREE.HemisphereLight(0xffffff,0x444444,1)
scene.add(light)

// footprint
const fp = new Footprint("R", [
  { position: new THREE.Vector3(-2,0,0), size: 1 },
  { position: new THREE.Vector3(2,0,0), size: 1 }
])

// components
const c1:any = new Component(fp, new THREE.Vector3(-10,0,0))
c1.ref = "R1"
const c2:any = new Component(fp, new THREE.Vector3(10,0,0))
c2.ref = "R2"

scene.add(c1.group)
scene.add(c2.group)

const components = [c1, c2]

// systems
const selector = new SelectionManager(camera, scene)
const dragger = new DragManager(camera)
const netManager = new NetManager()

// sample netlist
importSimpleNetlist({
  nets:[
    {name:"NET1", pads:[{comp:"R1", pad:0},{comp:"R2", pad:1}]}
  ]
}, components, netManager)

window.addEventListener("mousedown", e=>{
  const picked = selector.pick(e)
  if (!picked) return
  if (picked.group) dragger.start(picked)
})

window.addEventListener("mousemove", e=>{
  dragger.update(e)
})

window.addEventListener("mouseup", ()=>{
  dragger.stop()
})

window.addEventListener("keydown", e=>{
  if (e.key==="r" && selector.selected?.group) {
    selector.selected.group.rotation.y += Math.PI/2
  }
})

function animate(){
  requestAnimationFrame(animate)
  renderer.render(scene,camera)
}
animate()
""")

# zip it
zip_path = "/mnt/data/pcb-designer-v2.zip"
with zipfile.ZipFile(zip_path, "w") as z:
    for root, dirs, files in os.walk(base):
        for f in files:
            full = os.path.join(root, f)
            z.write(full, os.path.relpath(full, base))

zip_path

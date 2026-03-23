
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

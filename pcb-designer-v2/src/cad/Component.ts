
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

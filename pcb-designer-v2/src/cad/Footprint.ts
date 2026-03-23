
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

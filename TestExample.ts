const c1: any = new Component(fp, new THREE.Vector3(-10,0,0))
c1.ref = "R1"
const c2: any = new Component(fp, new THREE.Vector3(10,0,0))
c2.ref = "R2"
importSimpleNetlist({
  nets: [
    {
      name: "NET1",
      pads: [
        { comp: "R1", pad: 0 },
        { comp: "R2", pad: 1 }
      ]
    }
  ]
}, components, netManager)

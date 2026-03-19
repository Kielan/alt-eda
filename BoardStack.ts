const stack = [
 {name:"topCopper", z:0.8},
 {name:"substrate", z:0},
 {name:"bottomCopper", z:-0.8}
]

function copperLayer(shape){
  const geo = new THREE.ExtrudeGeometry(shape,{
     depth:0.05,
     bevelEnabled:false
  })

  return new THREE.Mesh(
     geo,
     new THREE.MeshStandardMaterial({
        color:0xffa000,
        metalness:.8
     })
  )
}

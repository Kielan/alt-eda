interface Trace {
  width: number
  layer: number
  points: THREE.Vector2[]
}

function createTrace(trace: Trace) {
  const curve = new THREE.CatmullRomCurve3(
    trace.points.map(p => new THREE.Vector3(p.x,0,p.y))
  )
  const geo = new THREE.TubeGeometry(
    curve,
    64,
    trace.width/2,
    8,
    false
  )
  return new THREE.Mesh(
    geo,
    new THREE.MeshStandardMaterial({color:0xff8800})
  )
}

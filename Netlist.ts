export class Net {

    id: string
    color: number

    pads: Set<Pad> = new Set()
    traces: Set<Trace> = new Set()
    vias: Set<Via> = new Set()

    constructor(id: string, color: number) {
        this.id = id
        this.color = color
    }

}

export class Pad {

    id: string
    position: THREE.Vector3
    net: Net | null = null

    constructor(id: string, position: THREE.Vector3) {
        this.id = id
        this.position = position
    }

    connect(net: Net) {
        this.net = net
        net.pads.add(this)
    }

}

export class Trace {

    id: string
    net: Net
    points: THREE.Vector3[]
    width: number

    constructor(id: string, net: Net, points: THREE.Vector3[], width: number) {

        this.id = id
        this.net = net
        this.points = points
        this.width = width

        net.traces.add(this)
    }

}

export class Via {

    position: THREE.Vector3
    net: Net

    constructor(position: THREE.Vector3, net: Net) {
        this.position = position
        this.net = net

        net.vias.add(this)
    }

}

export class NetManager {

    nets: Map<string, Net> = new Map()

    createNet(name: string) {

        const color = Math.random() * 0xffffff

        const net = new Net(name, color)
        this.nets.set(name, net)

        return net
    }

    getNet(name: string) {
        return this.nets.get(name)
    }

}

function startRoutingFromPad(pad: Pad) {

    const net = pad.net

    if (!net) {
        console.warn("Pad has no net")
        return
    }

    currentNet = net

    tracePreview.material.color.set(net.color)

    tracePreview.start(pad.position)

}

function finishTrace(points: THREE.Vector3[]) {

    if (!currentNet) return

    const trace = new Trace(
        crypto.randomUUID(),
        currentNet,
        points,
        0.6
    )

    pcb.traces.push(trace)

}

function tryConnectToPad(endPoint: THREE.Vector3, pads: Pad[]) {

    const hit = pads.find(p =>
        p.position.distanceTo(endPoint) < 1
    )

    if (!hit) return

    if (hit.net && currentNet && hit.net !== currentNet) {

        mergeNets(currentNet, hit.net)
    }

}

function mergeNets(a: Net, b: Net) {

    for (const pad of b.pads) {
        pad.net = a
        a.pads.add(pad)
    }

    for (const trace of b.traces) {
        trace.net = a
        a.traces.add(trace)
    }

    for (const via of b.vias) {
        via.net = a
        a.vias.add(via)
    }

}

function highlightNet(net: Net) {

    for (const trace of net.traces) {
        trace.mesh.material.emissive.set(0xffff00)
    }

}

function createRatsnest(net: Net) {

    const pads = [...net.pads]

    for (let i = 0; i < pads.length - 1; i++) {

        const a = pads[i].position
        const b = pads[i + 1].position

        drawLine(a, b)
    }

}

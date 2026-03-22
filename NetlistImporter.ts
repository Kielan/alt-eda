export function importSimpleNetlist(
  data: any,
  components: any[],
  netManager: NetManager
) {
  for (const netDef of data.nets) {
    const net = netManager.createNet(netDef.name)
    for (const ref of netDef.pads) {
      const comp = components.find(c => c.ref === ref.comp)
      if (!comp) continue
      const pad = comp.pads[ref.pad]
      if (pad) {
        pad.connect(net)
      }
    }
  }
}

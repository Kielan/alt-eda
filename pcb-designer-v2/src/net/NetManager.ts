
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

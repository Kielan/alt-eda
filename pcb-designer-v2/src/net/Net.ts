
export class Net {
  id: string
  color: number
  pads = new Set<any>()

  constructor(id: string, color: number) {
    this.id = id
    this.color = color
  }
}

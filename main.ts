import { SceneManager } from "./scene/SceneManager"
import { createGrid } from "./scene/Grid"
import { PCBBoard } from "./scene/PCBBoard"

const app = document.getElementById("app")!

const sceneManager = new SceneManager(app)

const grid = createGrid()
sceneManager.scene.add(grid)

const pcb = new PCBBoard(85, 56, 1.6)
sceneManager.scene.add(pcb.mesh)

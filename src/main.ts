import App from '../lib/main'
import './index.css'

const canvas = document.querySelector('#app-container') as HTMLCanvasElement
const app = new App(canvas)
// //@ts-ignore
window.MITHR_APP = app

await app.init()
app.setTopping('/flag/models/palka_1.glb')
app.setCanvas('/flag/canvas/1.png')
app.setPattern('/flag/patterns/1.png', 0xff0000)

import App from '../lib/main'
import './index.css'

const canvas = document.querySelector('#app-container') as HTMLCanvasElement
const app = new App(canvas)
// window.MITH_APP = app
// this.textures = await Promise.all([
//     textureLoader.loadAsync('/flag/canvas/1.png'),
//     textureLoader.loadAsync('/flag/patterns/3.png'),
//     textureLoader.loadAsync('/flag/decorPrimary/bear.png'),
//     textureLoader.loadAsync('/flag/decorSecondary/1.png'),
//     createTextTexture('test'),
// ])
// this.texColors = {
//     pattern: 0xff0000,
//     decorPrimary: 0x00ff00,
//     decorSecondary: 0x0000ff,
//     decorText: 0x00ffff
// }

await app.init()
app.setTopping('/flag/models/palka_1.glb')
app.setCanvas('/flag/canvas/1.png')
app.setPattern('/flag/patterns/1.png', 0xff0000)

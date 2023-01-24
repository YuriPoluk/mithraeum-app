import App from '../lib/main'
import './index.css'

const canvas = document.querySelector('#app-container') as HTMLCanvasElement
new App(canvas)
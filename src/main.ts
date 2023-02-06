import App from '../lib/main'
import './index.css'

const canvas = document.querySelector('#app-container') as HTMLCanvasElement
(window as any).MITHR_APP = new App(canvas)
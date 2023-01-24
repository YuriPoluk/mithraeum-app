import { WebGLRenderer } from 'three';
import AppScene from './scene/AppScene';
import FramesLimiter from './utils/FramesLimiter';
import LoginScene from './scene/LoginScene'


const APP_MAX_FPS = 60

export default class App {
    private renderer: WebGLRenderer;
    private invalidated = false
    private framesLimiter: FramesLimiter
    private currentScene!: AppScene

    constructor(container: HTMLCanvasElement) {
        this.framesLimiter = new FramesLimiter(APP_MAX_FPS);

        this.renderer = new WebGLRenderer({
            canvas: container,
            antialias: true,
            // powerPreference: "low-power",
          });

        this.renderer.setPixelRatio(window.devicePixelRatio);

        this.setScene(new LoginScene(this.renderer))
        this.onResize()
        this.render()

    }

    setScene(scene: AppScene) {
        this.currentScene = scene
    }

    onResize() {
        const { width, height } = this.renderer.domElement.getBoundingClientRect();

        this.renderer.setSize(width, height, false);    
        if (this.currentScene) {
          this.currentScene.resize(width, height);
        }
    }

    dispose() {
        this.invalidated = true
        this.renderer.dispose()
    }

    private render() {
        if (this.invalidated) {
          return;
        }
    
        if (this.framesLimiter.canExecute()) {
            this.render();
            this.currentScene?.render(this.framesLimiter.deltaTime);
        }
    
        requestAnimationFrame(() => {
          this.render();
        });


    }
}
import { WebGL1Renderer, WebGLRenderer } from 'three';
import FramesLimiter from './utils/FramesLimiter';
import LoginScene from './scene/LoginScene'

const APP_MAX_FPS = 60

export default class App {
  private renderer: WebGLRenderer;
  private invalidated = false
  private framesLimiter: FramesLimiter
  private currentScene!: LoginScene

  constructor(container: HTMLCanvasElement) {
    this.framesLimiter = new FramesLimiter(APP_MAX_FPS);

    this.renderer = new WebGL1Renderer({
      canvas: container,
      antialias: true,
      powerPreference: "high-performance",
      logarithmicDepthBuffer: true
    });

    this.renderer.setPixelRatio(window.devicePixelRatio);

    this.setScene(new LoginScene(this.renderer))
    this.onResize()
    this.render()

    addEventListener("resize", this.onResize.bind(this));
  }

  setScene(scene: LoginScene) {
    this.currentScene = scene
  }

  onResize() {
    const { width, height } = this.renderer.domElement.getBoundingClientRect();

    this.renderer.setSize(width, height, false);    
    if (this.currentScene) {
      this.currentScene.resize(width, height);
    }
  }

  private render() {
    if (this.invalidated) {
      return;
    }
      
    if (this.framesLimiter.canExecute()) {
      this.currentScene?.render(this.framesLimiter.deltaTime);
    }
      
    requestAnimationFrame(() => {
      this.render();
    });


  }

  // API

  async init() {
    await this.currentScene.initScene()
  }

  dispose() {
    this.invalidated = true
    this.currentScene.dispose()
    this.renderer.clear()
    this.renderer.dispose()
  }

  setTopping(path: string) {
    this.currentScene.setTopping(path)
  }

  async setCanvas(path: string) {
    this.currentScene.setCanvas(path)
  }

  async setPattern(path?: string, color?: string | number) {
      this.currentScene.setPattern(path, color)
  }

  async setDecorPrimary(path?: string, color?: string | number) {
      this.currentScene.setDecorPrimary(path, color)
  }

  async setDecorSecondary(path?: string, color?: string | number) {
      this.currentScene.setDecorSecondary(path, color)
  }

  async setDecorText(text?: string, color?: string | number) {
      this.currentScene.setDecorText(text, color)
  }

  setZoom(z: boolean) {
      this.currentScene.setZoom(z)
  }

  setFog(f: boolean) {
    this.currentScene.setFog(f)
  }
}
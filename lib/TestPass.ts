import { Pass, FullScreenQuad } from 'three/examples/jsm/postprocessing/Pass.js';
import { CopyShader } from 'three/examples/jsm/shaders/CopyShader.js';
import {
	NoBlending,
	ShaderMaterial,
	UniformsUtils,
    WebGLRenderTarget,
    WebGLRenderer,
    Material,
} from 'three';

export default class TestPass extends Pass {

    enabled = true
    needsSwap = false
    clear = true
    renderToScreen = false
    copyUniforms: any
    materialCopy: ShaderMaterial
    fsQuad: FullScreenQuad
    materials: Material[] = []

    constructor(materials: Material[]) {
        super()

        const copyShader = CopyShader;

        this.copyUniforms = UniformsUtils.clone( copyShader.uniforms );
        this.copyUniforms[ 'opacity' ].value = 1.0;

        this.materialCopy = new ShaderMaterial( {
            uniforms: this.copyUniforms,
            vertexShader: copyShader.vertexShader,
            fragmentShader: copyShader.fragmentShader,
            blending: NoBlending,
            depthTest: false,
            depthWrite: false,
            transparent: true
        } );
   
        this.enabled = true;
        this.needsSwap = false;

        this.fsQuad = new FullScreenQuad();
        this.materials = materials
    }

    setSize(width: number, height: number): void {

    }

    render(
        renderer: WebGLRenderer,
        writeBuffer: WebGLRenderTarget,
        readBuffer: WebGLRenderTarget,
    ): void {
        if ( this.renderToScreen ) {
            // this.materials.forEach(m => {
            //     m.transparent = true
            //     m.needsUpdate = true
            // })
			this.fsQuad.material = this.materialCopy;
			this.copyUniforms[ 'tDiffuse' ].value = readBuffer.texture;
			renderer.setRenderTarget( null );
			this.fsQuad.render( renderer );

		}
    }

    dispose(): void {}
}


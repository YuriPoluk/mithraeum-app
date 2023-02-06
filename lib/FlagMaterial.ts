import { Color, DoubleSide, ShaderMaterial, Texture, UniformsUtils, UniformsLib } from "three"


type FlagTexturesColors = {
    canvas: string | number,
    decorPrimary: string | number,
    decorSecondary: string | number,
    decorText: string | number
}
export default class FlagMaterial extends ShaderMaterial {
    constructor (textures: Texture[], colors: FlagTexturesColors) {

        super({
            ...flagShader,
            transparent: true,
            side: DoubleSide,
            lights: true
        })

        this.setTextures(textures, colors)
    }

    setTextures(textures: Texture[], colors: FlagTexturesColors) {
        this.uniforms.u_flag_textures.value = textures
        this.uniforms.u_canvas_color.value = new Color(colors.canvas)
        this.uniforms.u_decor_primary_color.value = new Color(colors.decorPrimary)
        this.uniforms.u_decor_secondary_color.value = new Color(colors.decorSecondary)
        this.uniforms.u_decor_text_color.value = new Color(colors.decorText)
    }
}

const emptyTextures = [new Texture(), new Texture(), new Texture(), new Texture(), new Texture()]

const flagShader = {
    uniforms: UniformsUtils.merge([
        UniformsLib.lights,
        {
            u_flag_textures: {},
            u_canvas_color: {},
            u_decor_primary_color: {},
            u_decor_secondary_color: {},
            u_decor_text_color: {},
        }
      ]),
    vertexShader: `
        varying vec2 v_uv;

        void main()
        {
            v_uv = uv;
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            gl_Position = projectionMatrix * mvPosition;
        }
    `,
    fragmentShader: `
        #ifdef GL_ES
        precision highp float;
        #endif

        uniform sampler2D u_flag_textures[5];
        uniform vec3 u_canvas_color;
        uniform vec3 u_decor_primary_color;
        uniform vec3 u_decor_secondary_color;
        uniform vec3 u_decor_text_color;

        varying vec2 v_uv;

        vec3 blendColors(vec3 srcColor, vec3 dstColor, float blendFactor) {
            return vec3(
                ((dstColor.r - srcColor.r) * blendFactor) + srcColor.r,
                ((dstColor.g - srcColor.g) * blendFactor) + srcColor.r,
                ((dstColor.b - srcColor.b) * blendFactor) + srcColor.r
            );
        }

        vec4 paintTexture(vec4 srcTex, vec3 color) {
            return vec4(color, srcTex.a);
        }

        void main(void) {
            vec3 c;
            vec2 uvs = v_uv;
            vec4 canvas = texture2D(u_flag_textures[0], uvs);
            vec4 texture = texture2D(u_flag_textures[1], uvs);
            vec3 textureColorBlend =  blendColors(texture.rgb, u_canvas_color, 0.20);
            vec3 textureColorMult = texture.rgb * u_canvas_color.rgb;

            vec4 decorPrimary = texture2D(u_flag_textures[2], uvs);
            vec4 decorPrimaryColored = paintTexture(decorPrimary, u_decor_primary_color);

            vec4 decorSecondary = texture2D(u_flag_textures[3], uvs);
            vec4 decorSecondaryColored = paintTexture(decorSecondary, u_decor_secondary_color);

            vec4 decorText = texture2D(u_flag_textures[4], uvs);
            vec4 decorTextColored = paintTexture(decorText, u_decor_text_color);
            
            c = (decorText.rgb * decorText.a + decorSecondaryColored.rgb * decorSecondaryColored.a + decorPrimaryColored.rgb * decorPrimaryColored.a) + 
                canvas.rgb * textureColorMult * canvas.a * ((1.0 - decorPrimaryColored.a) * (1.0 - decorSecondaryColored.a) * (1.0 - decorText.a));
            gl_FragColor = vec4(c, canvas.a);
        }
    `
}
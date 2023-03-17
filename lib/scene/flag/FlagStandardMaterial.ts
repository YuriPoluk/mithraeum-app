import { Color, DoubleSide, ShaderMaterial, Texture, UniformsUtils, UniformsLib, ShaderLib, Shader } from "three"


export type FlagTexturesColors = {
    pattern: string | number,
    decorPrimary: string | number,
    decorSecondary: string | number,
    decorText: string | number
}
export default class FlagStandardMaterial extends ShaderMaterial {
    constructor (textures: Texture[], colors: FlagTexturesColors) {


        let standard = ShaderLib['standard'];
        const flagFragment = patchStandardFragmentShader(standard.fragmentShader)

        super({
          lights: true,
          side: DoubleSide,
          transparent: true,
          fragmentShader: flagFragment,
          vertexShader: standard.vertexShader,
          uniforms: UniformsUtils.merge([
            UniformsLib.lights,
            UniformsLib.common,
            UniformsUtils.clone(standard.uniforms),
            {
                u_flag_textures: {},
                u_canvas_color: {},
                u_decor_primary_color: {},
                u_decor_secondary_color: {},
                u_decor_text_color: {},
            }
          ])
        });

        this.extensions.derivatives = true
        this.defines = {
            USE_UV: ' '
        }

        this.setUniforms(textures, colors)
    }

    setUniforms(textures: Texture[], colors: FlagTexturesColors) {
        this.uniforms.diffuse.value = new Color(0xffff00) 
        this.uniforms.roughness.value = 1
        this.uniforms.metalness.value = 0 

        this.uniforms.u_flag_textures.value = textures
        this.uniforms.u_canvas_color.value = new Color(colors.pattern)
        this.uniforms.u_decor_primary_color.value = new Color(colors.decorPrimary)
        this.uniforms.u_decor_secondary_color.value = new Color(colors.decorSecondary)
        this.uniforms.u_decor_text_color.value = new Color(colors.decorText)
    }
}

function patchStandardFragmentShader(standardFragShader: string) {
    const flagFragShader = standardFragShader
        .replace('#include <clipping_planes_pars_fragment>', '#include <clipping_planes_pars_fragment>' + myFlagFragShader)
        .replace('vec4 diffuseColor = vec4( diffuse, opacity )', 'vec4 diffuseColor = flagMap()')

    return flagFragShader
}

var myFlagFragShader = `
uniform mediump sampler2D u_flag_textures[5];
uniform vec3 u_canvas_color;
uniform vec3 u_decor_primary_color;
uniform vec3 u_decor_secondary_color;
uniform vec3 u_decor_text_color;

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

vec4 flagMap(void) {
    vec3 c;
    vec2 uvs = vUv;
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
    return vec4(c, canvas.a);
}
`
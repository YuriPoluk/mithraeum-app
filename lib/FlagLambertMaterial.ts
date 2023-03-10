import { Color, DoubleSide, ShaderMaterial, Texture, UniformsUtils, UniformsLib, ShaderLib } from "three"


export type FlagTexturesColors = {
    pattern: string | number,
    decorPrimary: string | number,
    decorSecondary: string | number,
    decorText: string | number
}
export default class FlagLambertMaterial extends ShaderMaterial {
    constructor (textures: Texture[], colors: FlagTexturesColors) {

        super({
            ...flagShader,
            transparent: true,
            side: DoubleSide,
            lights: true
        })

        this.defines.USE_UV = ' '
        this.defines.USE_MAP = ' '
        this.uniforms.reflectii

        this.setUniforms(textures, colors)
    }

    setUniforms(textures: Texture[], colors: FlagTexturesColors) {
        this.uniforms.u_flag_textures.value = textures
        this.uniforms.u_canvas_color.value = new Color(colors.pattern)
        this.uniforms.u_decor_primary_color.value = new Color(colors.decorPrimary)
        this.uniforms.u_decor_secondary_color.value = new Color(colors.decorSecondary)
        this.uniforms.u_decor_text_color.value = new Color(colors.decorText)
    }
}

const flagShader = {
    uniforms: UniformsUtils.merge([
        ShaderLib.lambert.uniforms,
        UniformsLib.lights,
        UniformsLib.common,
        {
            u_flag_textures: {},
            u_canvas_color: {},
            u_decor_primary_color: {},
            u_decor_secondary_color: {},
            u_decor_text_color: {},
        }
      ]),
      vertexShader: /* glsl */`
        #define LAMBERT
        varying vec3 vViewPosition;
        #include <common>
        #include <uv_pars_vertex>
        #include <uv2_pars_vertex>
        #include <displacementmap_pars_vertex>
        #include <envmap_pars_vertex>
        #include <color_pars_vertex>
        #include <fog_pars_vertex>
        #include <normal_pars_vertex>
        #include <morphtarget_pars_vertex>
        #include <skinning_pars_vertex>
        #include <shadowmap_pars_vertex>
        #include <logdepthbuf_pars_vertex>
        #include <clipping_planes_pars_vertex>
        void main() {
            #include <uv_vertex>
            #include <uv2_vertex>
            #include <color_vertex>
            #include <morphcolor_vertex>
            #include <beginnormal_vertex>
            #include <morphnormal_vertex>
            #include <skinbase_vertex>
            #include <skinnormal_vertex>
            #include <defaultnormal_vertex>
            #include <normal_vertex>
            #include <begin_vertex>
            #include <morphtarget_vertex>
            #include <skinning_vertex>
            #include <displacementmap_vertex>
            #include <project_vertex>
            #include <logdepthbuf_vertex>
            #include <clipping_planes_vertex>
            vViewPosition = - mvPosition.xyz;
            #include <worldpos_vertex>
            #include <envmap_vertex>
            #include <shadowmap_vertex>
            #include <fog_vertex>
        }
      `,
      fragmentShader: /* glsl */`
        #define LAMBERT
        uniform vec3 diffuse;
        uniform vec3 emissive;
        uniform float opacity;
        #include <common>
        #include <packing>
        #include <dithering_pars_fragment>
        #include <color_pars_fragment>
        #include <uv_pars_fragment>
        #include <uv2_pars_fragment>
        #include <map_pars_fragment>
        #include <alphamap_pars_fragment>
        #include <alphatest_pars_fragment>
        #include <aomap_pars_fragment>
        #include <lightmap_pars_fragment>
        #include <emissivemap_pars_fragment>
        #include <envmap_common_pars_fragment>
        #include <envmap_pars_fragment>
        #include <fog_pars_fragment>
        #include <bsdfs>
        #include <lights_pars_begin>
        #include <normal_pars_fragment>
        #include <lights_lambert_pars_fragment>
        #include <shadowmap_pars_fragment>
        #include <bumpmap_pars_fragment>
        #include <normalmap_pars_fragment>
        #include <specularmap_pars_fragment>
        #include <logdepthbuf_pars_fragment>
        #include <clipping_planes_pars_fragment>

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

        void main() {
            #include <clipping_planes_fragment>
            vec4 diffuseColor = vec4( diffuse, opacity );
            ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
            vec3 totalEmissiveRadiance = emissive;
            #include <logdepthbuf_fragment>
            #include <map_fragment>
            diffuseColor = flagMap();
            // diffuseColor = texture2D(u_flag_textures[2], vUv);
            #include <color_fragment>
            #include <alphamap_fragment>
            #include <alphatest_fragment>
            #include <specularmap_fragment>
            #include <normal_fragment_begin>
            #include <normal_fragment_maps>
            #include <emissivemap_fragment>
            // accumulation
            #include <lights_lambert_fragment>
            #include <lights_fragment_begin>
            #include <lights_fragment_maps>
            #include <lights_fragment_end>
            // modulation
            #include <aomap_fragment>
            vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
            #include <envmap_fragment>
            #include <output_fragment>
            #include <tonemapping_fragment>
            #include <encodings_fragment>
            #include <fog_fragment>
            #include <premultiplied_alpha_fragment>
            #include <dithering_fragment>
            // gl_FragColor = diffuseColor;
        }
      `
}
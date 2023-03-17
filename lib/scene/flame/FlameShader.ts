import { Vector4 } from "three";

export const FireShader = {

    defines: {
        "ITERATIONS"    : "20",
        "OCTIVES"       : "3"
    },

    uniforms: {
        "fireTex"       : { type : "t",     value : null },
        "color"         : { type : "c",     value : null },
        "time"          : { type : "f",     value : 0.0 },
        "seed"          : { type : "f",     value : 0.0 },
        "invModelMatrix": { type : "m4",    value : null },
        "scale"         : { type : "v3",    value : null },

        "noiseScale"    : { type : "v4",    value : new Vector4(1, 2, 1, 0.3) },
        "magnitude"     : { type : "f",     value : 1.3 },
        "lacunarity"    : { type : "f",     value : 2.0 },
        "gain"          : { type : "f",     value : 0.5 }
    },

    vertexShader: [
        "#include <fog_pars_vertex>",
        "#include <common>",
        "#include <logdepthbuf_pars_vertex>",


        "varying vec3 vWorldPos;",
        "void main() {",

            "#include <begin_vertex>",
            "#include <project_vertex>",
            "#include <fog_vertex>",
            "#include <color_pars_vertex>",

            "gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);",
            "vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;",
            "#include <logdepthbuf_vertex>",
        "}"
    ].join("\n"),

    fragmentShader: [
        "uniform vec3 color;",
        "uniform float time;",
        "uniform float seed;",
        "uniform mat4 invModelMatrix;",
        "uniform vec3 scale;",

        "uniform vec4 noiseScale;",
        "uniform float magnitude;",
        "uniform float lacunarity;",
        "uniform float gain;",

        "uniform sampler2D fireTex;",

        "varying vec3 vWorldPos;",

        "#include <common>",
        "#include <fog_pars_fragment>",
        "#include <logdepthbuf_pars_fragment>",

        "float turbulence(vec3 p) {",
            "float sum = 0.0;",
            "float freq = 1.0;",
            "float amp = 1.0;",
            
            "for(int i = 0; i < OCTIVES; i++) {",
                "sum += abs(snoise(p * freq)) * amp;",
                "freq *= lacunarity;",
                "amp *= gain;",
            "}",

            "return sum;",
        "}",

        "vec4 samplerFire (vec3 p, vec4 scale) {",
            "vec2 st = vec2(sqrt(dot(p.xz, p.xz)), p.y);",

            "if(st.x <= 0.0 || st.x >= 1.0 || st.y <= 0.0 || st.y >= 1.0) return vec4(0.0);",

            "p.y -= (seed + time) * scale.w;",
            "p *= scale.xyz;",

            "st.y += sqrt(st.y) * magnitude * turbulence(p);",

            "if(st.y <= 0.0 || st.y >= 1.0) return vec4(0.0);",
           
            "return texture2D(fireTex, st);",
        "}",

        "vec3 localize(vec3 p) {",
            "return (invModelMatrix * vec4(p, 1.0)).xyz;",
        "}",

        "void main() {",
            "vec3 rayPos = vWorldPos;",
            "vec3 rayDir = normalize(rayPos - cameraPosition);",
            "float rayLen = 0.0288 * length(scale.xyz);",

            "vec4 col = vec4(0.0);",

            "for(int i = 0; i < ITERATIONS; i++) {",
                "rayPos += rayDir * rayLen;",

                "vec3 lp = localize(rayPos);",

                "lp.y += 0.5;",
                "lp.xz *= 2.0;",
                "col += samplerFire(lp, noiseScale);",
            "}",

            "col.a = col.r;",

            "gl_FragColor = col;",
            "#include <fog_fragment>",
            "#include <logdepthbuf_fragment>",
        "}",

	].join("\n")

};
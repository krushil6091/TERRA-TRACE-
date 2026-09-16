import { Renderer, Program, Mesh, Color, Triangle } from 'ogl';
import { useEffect, useRef } from 'react';
import { isWebGLSupported, prefersReducedMotion } from '../lib/accessibility';

const VERT = `#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const FRAG = `#version 300 es
precision highp float;

uniform float uTime;
uniform float uAmplitude;
uniform vec3 uColorStops[3];
uniform vec2 uResolution;
uniform float uBlend;

out vec4 fragColor;

vec3 permute(vec3 x) {
  return mod(((x * 34.0) + 1.0) * x, 289.0);
}

float snoise(vec2 v){
  const vec4 C = vec4(
      0.211324865405187, 0.366025403784439,
      -0.577350269189626, 0.024390243902439
  );
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod(i, 289.0);

  vec3 p = permute(
      permute(i.y + vec3(0.0, i1.y, 1.0))
    + i.x + vec3(0.0, i1.x, 1.0)
  );

  vec3 m = max(
      0.5 - vec3(
          dot(x0, x0),
          dot(x12.xy, x12.xy),
          dot(x12.zw, x12.zw)
      ), 
      0.0
  );
  m = m * m;
  m = m * m;

  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);

  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

struct ColorStop {
  vec3 color;
  float position;
};

#define COLOR_RAMP(colors, factor, finalColor) {              \
  int index = 0;                                            \
  for (int i = 0; i < 2; i++) {                               \
     ColorStop currentColor = colors[i];                    \
     bool isInBetween = currentColor.position <= factor;    \
     index = int(mix(float(index), float(i), float(isInBetween))); \
  }                                                         \
  ColorStop currentColor = colors[index];                   \
  ColorStop nextColor = colors[index + 1];                  \
  float range = nextColor.position - currentColor.position; \
  float lerpFactor = (factor - currentColor.position) / range; \
  finalColor = mix(currentColor.color, nextColor.color, lerpFactor); \
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  
  ColorStop colors[3];
  colors[0] = ColorStop(uColorStops[0], 0.0);
  colors[1] = ColorStop(uColorStops[1], 0.5);
  colors[2] = ColorStop(uColorStops[2], 1.0);
  
  vec3 rampColor;
  COLOR_RAMP(colors, uv.x, rampColor);
  
  float height = snoise(vec2(uv.x * 1.5 + uTime * 0.05, uTime * 0.08)) * 0.5 * uAmplitude;
  height = exp(height);
  height = (uv.y * 1.8 - height + 0.3);
  float intensity = 0.4 * height;
  
  float midPoint = 0.15;
  float auroraAlpha = smoothstep(midPoint - uBlend * 0.6, midPoint + uBlend * 0.6, intensity);
  
  vec3 auroraColor = intensity * rampColor;
  
  // Alpha multiplier increased to 0.42 to ensure distinct white band clarity
  fragColor = vec4(auroraColor * auroraAlpha * 0.42, auroraAlpha * 0.42);
}
`;

interface AuroraProps {
  colorStops?: string[];
  amplitude?: number;
  blend?: number;
  time?: number;
  speed?: number;
}

export default function Aurora(props: AuroraProps) {
  const { 
    colorStops = ['#FF9933', '#FFFFFF', '#138808'], 
    amplitude = 0.4, 
    blend = 0.7 
  } = props;
  const propsRef = useRef(props);
  propsRef.current = props;

  const ctnDom = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctn = ctnDom.current;
    if (!ctn) return;

    // Check reduce motion preference: skip WebGL if reduced motion requested
    if (prefersReducedMotion()) {
      console.log('[Aurora] prefers-reduced-motion active — rendering static fallback gradient only.');
      return;
    }

    if (!isWebGLSupported()) {
      console.warn('[Aurora] WebGL not supported — rendering static CSS fallback.');
      return;
    }

    let renderer: Renderer | null = null;
    let program: Program | null = null;
    let mesh: Mesh | null = null;
    let animateId = 0;
    let isContextLost = false;
    let isPaused = false;

    const initGL = () => {
      try {
        renderer = new Renderer({
          alpha: true,
          premultipliedAlpha: true,
          antialias: true
        });
        const gl = renderer.gl;
        gl.clearColor(0, 0, 0, 0);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        
        gl.canvas.style.position = 'absolute';
        gl.canvas.style.top = '0';
        gl.canvas.style.left = '0';
        gl.canvas.style.width = '100%';
        gl.canvas.style.height = '100%';
        gl.canvas.style.pointerEvents = 'none';
        gl.canvas.style.backgroundColor = 'transparent';
        gl.canvas.style.opacity = '1';

        const geometry = new Triangle(gl);
        if (geometry.attributes.uv) {
          delete geometry.attributes.uv;
        }

        const colorStopsArray = colorStops.map(hex => {
          const c = new Color(hex);
          return [c.r, c.g, c.b];
        });

        program = new Program(gl, {
          vertex: VERT,
          fragment: FRAG,
          uniforms: {
            uTime: { value: 0 },
            uAmplitude: { value: amplitude },
            uColorStops: { value: colorStopsArray },
            uResolution: { value: [ctn.offsetWidth || window.innerWidth, ctn.offsetHeight || window.innerHeight] },
            uBlend: { value: blend }
          }
        });

        mesh = new Mesh(gl, { geometry, program });
        ctn.appendChild(gl.canvas);

        const handleContextLost = (e: Event) => {
          e.preventDefault();
          isContextLost = true;
          if (animateId) {
            cancelAnimationFrame(animateId);
            animateId = 0;
          }
          console.warn('[Aurora] WebGL context lost — pausing animation.');
        };

        const handleContextRestored = () => {
          isContextLost = false;
          console.log('[Aurora] WebGL context restored — reinitializing.');
          cleanup();
          initGL();
        };

        gl.canvas.addEventListener('webglcontextlost', handleContextLost);
        gl.canvas.addEventListener('webglcontextrestored', handleContextRestored);

        const resizeObserver = new ResizeObserver((entries) => {
          for (const entry of entries) {
            const { width, height } = entry.contentRect;
            if (width === 0 || height === 0) continue;
            if (renderer) renderer.setSize(width, height);
            if (program) {
              program.uniforms.uResolution.value = [width, height];
            }
          }
        });
        resizeObserver.observe(ctn);

        const update = (t: number) => {
          if (isContextLost || isPaused) return;
          animateId = requestAnimationFrame(update);
          if (!program || !renderer || !mesh) return;

          const { time = t * 0.01, speed = 0.25 } = propsRef.current;
          program.uniforms.uTime.value = time * speed * 0.1;
          program.uniforms.uAmplitude.value = propsRef.current.amplitude ?? amplitude;
          program.uniforms.uBlend.value = propsRef.current.blend ?? blend;
          const stops = propsRef.current.colorStops ?? colorStops;
          program.uniforms.uColorStops.value = stops.map(hex => {
            const c = new Color(hex);
            return [c.r, c.g, c.b];
          });
          renderer.render({ scene: mesh });
        };

        // Page Visibility API handler to pause when tab is hidden and save GPU/CPU cycles
        const handleVisibilityChange = () => {
          if (document.hidden) {
            isPaused = true;
            if (animateId) {
              cancelAnimationFrame(animateId);
              animateId = 0;
            }
          } else {
            isPaused = false;
            if (!animateId && !isContextLost && renderer) {
              animateId = requestAnimationFrame(update);
            }
          }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        // Start animation if page is currently visible
        if (!document.hidden) {
          animateId = requestAnimationFrame(update);
        }

        (ctn as any).__auroraCleanup = () => {
          if (animateId) {
            cancelAnimationFrame(animateId);
            animateId = 0;
          }
          document.removeEventListener('visibilitychange', handleVisibilityChange);
          resizeObserver.disconnect();
          gl.canvas.removeEventListener('webglcontextlost', handleContextLost);
          gl.canvas.removeEventListener('webglcontextrestored', handleContextRestored);
          if (ctn && gl.canvas.parentNode === ctn) {
            ctn.removeChild(gl.canvas);
          }
          gl.getExtension('WEBGL_lose_context')?.loseContext();
        };
      } catch (err) {
        console.error('[Aurora] WebGL initialization failed:', err);
      }
    };

    initGL();

    const cleanup = () => {
      (ctn as any).__auroraCleanup?.();
    };

    return cleanup;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amplitude]);

  // Static fallback gradient with Indian tricolor ambient tones
  const fallbackBackground = `linear-gradient(135deg, rgba(255, 153, 51, 0.22) 0%, rgba(255, 255, 255, 0.18) 50%, rgba(19, 136, 8, 0.22) 100%), #0B1F3A`;

  return (
    <div
      ref={ctnDom}
      className="aurora-container"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        background: fallbackBackground,
      }}
    />
  );
}

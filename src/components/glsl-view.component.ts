
import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-glsl-view',
  standalone: true,
  template: `
    <div class="relative w-full h-full overflow-hidden rounded-xl border border-white/10 bg-black shadow-2xl">
      <canvas #canvas class="block w-full h-full"></canvas>
      <div class="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 text-xs text-white/70 rounded border border-white/10 mono">
        VIEWPORT: RENDER_PREVIEW_01
      </div>
      <div class="absolute top-4 right-4 flex gap-2">
         <div class="h-2 w-2 rounded-full bg-red-500 animate-pulse"></div>
         <span class="text-[10px] text-red-400 mono tracking-widest">LIVE</span>
      </div>
    </div>
  `
})
export class GlslViewComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  private gl: WebGLRenderingContext | null = null;
  private animationFrameId: number = 0;
  private program: WebGLProgram | null = null;
  private startTime: number = 0;

  ngAfterViewInit() {
    this.initWebGL();
  }

  ngOnDestroy() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  private initWebGL() {
    const canvas = this.canvasRef.nativeElement;
    // Set explicit size for high DPI
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    this.gl = canvas.getContext('webgl');
    if (!this.gl) return;

    const vsSource = `
      attribute vec4 position;
      void main() {
        gl_Position = position;
      }
    `;

    // Photorealistic-ish abstract shader
    const fsSource = `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;

      // Simple hash
      float hash(float n) { return fract(sin(n) * 43758.5453123); }

      // 3D Noise
      float noise(vec3 x) {
          vec3 p = floor(x);
          vec3 f = fract(x);
          f = f * f * (3.0 - 2.0 * f);
          float n = p.x + p.y * 57.0 + 113.0 * p.z;
          return mix(mix(mix(hash(n + 0.0), hash(n + 1.0), f.x),
                         mix(hash(n + 57.0), hash(n + 58.0), f.x), f.y),
                     mix(mix(hash(n + 113.0), hash(n + 114.0), f.x),
                         mix(hash(n + 170.0), hash(n + 171.0), f.x), f.y), f.z);
      }

      // Map function for raymarching
      float map(vec3 p) {
          float d = length(p) - 1.0; // Sphere
          d += 0.1 * sin(10.0 * p.x) * sin(10.0 * p.y) * sin(10.0 * p.z + u_time * 2.0); // Distortion
          return d;
      }

      void main() {
          vec2 uv = (gl_FragCoord.xy * 2.0 - u_resolution) / min(u_resolution.x, u_resolution.y);
          
          vec3 ro = vec3(0.0, 0.0, -3.0); // Ray origin
          vec3 rd = normalize(vec3(uv, 1.0)); // Ray direction
          
          float t = 0.0;
          for(int i = 0; i < 64; i++) {
              vec3 p = ro + rd * t;
              float d = map(p);
              if(d < 0.001) break;
              t += d;
              if(t > 10.0) break;
          }
          
          vec3 col = vec3(0.05, 0.05, 0.08); // Background
          
          if(t < 10.0) {
              vec3 p = ro + rd * t;
              vec3 normal = normalize(vec3(
                  map(p + vec3(0.001, 0, 0)) - map(p - vec3(0.001, 0, 0)),
                  map(p + vec3(0, 0.001, 0)) - map(p - vec3(0, 0.001, 0)),
                  map(p + vec3(0, 0, 0.001)) - map(p - vec3(0, 0, 0.001))
              ));
              
              vec3 light = normalize(vec3(sin(u_time), 1.0, cos(u_time)));
              float diff = max(dot(normal, light), 0.0);
              float amb = 0.1;
              
              // Iridescence / Material
              vec3 baseColor = 0.5 + 0.5 * cos(u_time * 0.5 + p.xyx + vec3(0, 2, 4));
              col = baseColor * (diff + amb);
              
              // Rim light
              float rim = 1.0 - max(dot(normal, -rd), 0.0);
              col += vec3(0.5, 0.8, 1.0) * pow(rim, 3.0);
          }

          // Scanlines
          col *= 0.9 + 0.1 * sin(gl_FragCoord.y * 2.0);
          
          gl_FragColor = vec4(col, 1.0);
      }
    `;

    const vertexShader = this.createShader(this.gl.VERTEX_SHADER, vsSource);
    const fragmentShader = this.createShader(this.gl.FRAGMENT_SHADER, fsSource);

    if (!vertexShader || !fragmentShader) return;

    this.program = this.gl.createProgram();
    if (!this.program) return;

    this.gl.attachShader(this.program, vertexShader);
    this.gl.attachShader(this.program, fragmentShader);
    this.gl.linkProgram(this.program);

    if (!this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS)) {
      console.error('Shader program link failed:', this.gl.getProgramInfoLog(this.program));
      return;
    }

    const positionAttributeLocation = this.gl.getAttribLocation(this.program, 'position');
    const positionBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, positionBuffer);
    const positions = [
      -1, -1,
       1, -1,
      -1,  1,
      -1,  1,
       1, -1,
       1,  1,
    ];
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(positions), this.gl.STATIC_DRAW);

    this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height);
    this.gl.useProgram(this.program);
    this.gl.enableVertexAttribArray(positionAttributeLocation);
    this.gl.vertexAttribPointer(positionAttributeLocation, 2, this.gl.FLOAT, false, 0, 0);

    this.startTime = Date.now();
    this.render();
  }

  private createShader(type: number, source: string): WebGLShader | null {
    if (!this.gl) return null;
    const shader = this.gl.createShader(type);
    if (!shader) return null;
    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);
    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      console.error('Shader compile failed:', this.gl.getShaderInfoLog(shader));
      this.gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  private render = () => {
    if (!this.gl || !this.program) return;
    
    const time = (Date.now() - this.startTime) * 0.001;
    const uTimeLocation = this.gl.getUniformLocation(this.program, 'u_time');
    const uResolutionLocation = this.gl.getUniformLocation(this.program, 'u_resolution');

    this.gl.uniform1f(uTimeLocation, time);
    this.gl.uniform2f(uResolutionLocation, this.gl.canvas.width, this.gl.canvas.height);

    this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
    this.animationFrameId = requestAnimationFrame(this.render);
  }
}

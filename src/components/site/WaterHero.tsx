"use client";

import { useEffect, useRef } from "react";

const VERT = `
attribute vec2 a_pos;
varying vec2 v_uv;
void main(){ v_uv = a_pos * 0.5 + 0.5; gl_Position = vec4(a_pos, 0.0, 1.0); }
`;

const FRAG = `
precision highp float;
varying vec2 v_uv;
uniform sampler2D u_tex;
uniform float u_time;
uniform vec2 u_mouse;
uniform float u_hover;
uniform vec2 u_canvas;
uniform vec2 u_image;
uniform float u_hasImage;

float hash(vec2 p){
  p = fract(p * vec2(123.34, 345.45));
  p += dot(p, p + 34.345);
  return fract(p.x * p.y);
}
float noise(vec2 p){
  vec2 i = floor(p); vec2 f = fract(p);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
}
float fbm(vec2 p){
  float v = 0.0; float a = 0.5;
  for(int i = 0; i < 3; i++){ v += a * noise(p); p *= 2.0; a *= 0.5; }
  return v;
}

vec2 coverUV(vec2 p){
  float rs = u_canvas.x / u_canvas.y;
  float ri = u_image.x / u_image.y;
  vec2 ns = rs < ri ? vec2(u_image.x * u_canvas.y / u_image.y, u_canvas.y)
                    : vec2(u_canvas.x, u_image.y * u_canvas.x / u_image.x);
  vec2 off = (rs < ri ? vec2((ns.x - u_canvas.x) * 0.5, 0.0)
                      : vec2(0.0, (ns.y - u_canvas.y) * 0.5)) / ns;
  return p * u_canvas / ns + off;
}

// content shown ABOVE the water line
vec3 scene(vec2 p){
  if (u_hasImage > 0.5){
    return texture2D(u_tex, coverUV(p)).rgb;
  }
  float aspect = u_canvas.x / u_canvas.y;
  vec3 top = vec3(0.055, 0.04, 0.035);
  vec3 hor = vec3(0.30, 0.12, 0.07);
  vec3 col = mix(top, hor, smoothstep(1.0, 0.42, p.y));
  // glowing orb (unseen-style sphere) in brand color
  vec2 orb = vec2(0.66, 0.62);
  float d = distance(vec2(p.x * aspect, p.y), vec2(orb.x * aspect, orb.y));
  col += vec3(0.98, 0.5, 0.28) * smoothstep(0.16, 0.0, d) * 0.9;
  col += vec3(0.855, 0.306, 0.165) * smoothstep(0.55, 0.05, d) * 0.18;
  // drifting ambient light
  col += vec3(0.855, 0.306, 0.165) * fbm(p * 3.0 + vec2(0.0, u_time * 0.05)) * 0.06;
  return col;
}

void main(){
  vec2 p = v_uv;
  float horizon = 0.4;
  vec3 col;

  if (p.y > horizon){
    col = scene(p);
  } else {
    float depth = (horizon - p.y) / horizon;               // 0 at surface -> 1 at bottom
    vec2 rp = vec2(p.x, horizon + (horizon - p.y));         // mirror across horizon

    // layered ripples, stronger with depth
    float r = sin(p.x * 16.0 + u_time * 1.6 + depth * 11.0) * 0.004 * (0.4 + depth);
    r += (fbm(vec2(p.x * 6.0, u_time * 0.4 + depth * 3.0)) - 0.5) * 0.022 * depth;
    float md = distance(p, u_mouse);
    r += sin(md * 30.0 - u_time * 3.0) * smoothstep(0.3, 0.0, md) * (0.008 + u_hover * 0.012);
    rp.x += r;
    rp.y += r * 0.4;

    col = scene(rp);
    vec3 water = vec3(0.09, 0.045, 0.032);
    col = mix(col, water, depth * 0.55);
    col *= 1.0 - depth * 0.30;
    // bright surface line just under the horizon
    col += vec3(0.95, 0.42, 0.22) * smoothstep(0.035, 0.0, horizon - p.y) * 0.35;
  }

  col *= 1.0 - distance(v_uv, vec2(0.5)) * 0.5;             // vignette
  gl_FragColor = vec4(col, 1.0);
}
`;

export default function WaterHero({
  src,
  className,
}: {
  src?: string | null;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl", { antialias: false, alpha: false });
    if (!gl) return;

    const compile = (type: number, s: string) => {
      const sh = gl.createShader(type)!;
      gl.shaderSource(sh, s);
      gl.compileShader(sh);
      return sh;
    };
    const program = gl.createProgram()!;
    gl.attachShader(program, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW
    );
    const aPos = gl.getAttribLocation(program, "a_pos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const u = {
      tex: gl.getUniformLocation(program, "u_tex"),
      time: gl.getUniformLocation(program, "u_time"),
      mouse: gl.getUniformLocation(program, "u_mouse"),
      hover: gl.getUniformLocation(program, "u_hover"),
      canvas: gl.getUniformLocation(program, "u_canvas"),
      image: gl.getUniformLocation(program, "u_image"),
      hasImage: gl.getUniformLocation(program, "u_hasImage"),
    };

    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    const imageSize = { w: 1, h: 1 };
    let hasImage = 0;
    if (src) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        imageSize.w = img.naturalWidth;
        imageSize.h = img.naturalHeight;
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
        hasImage = 1;
      };
      img.src = src;
    }

    const mouse = { x: 0.5, y: 0.6, tx: 0.5, ty: 0.6, h: 0, th: 0 };
    const onMove = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect();
      mouse.tx = (e.clientX - r.left) / r.width;
      mouse.ty = 1 - (e.clientY - r.top) / r.height;
      mouse.th = 1;
    };
    const onLeave = () => (mouse.th = 0);
    window.addEventListener("mousemove", onMove);
    canvas.addEventListener("mouseleave", onLeave);

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.75);

    const resize = () => {
      const w = Math.max(1, Math.floor(canvas.clientWidth * dpr));
      const h = Math.max(1, Math.floor(canvas.clientHeight * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
    };

    let raf = 0;
    const start = performance.now();
    const render = (now: number) => {
      raf = requestAnimationFrame(render);
      resize();
      mouse.x += (mouse.tx - mouse.x) * 0.06;
      mouse.y += (mouse.ty - mouse.y) * 0.06;
      mouse.h += (mouse.th - mouse.h) * 0.05;
      gl.uniform1i(u.tex, 0);
      gl.uniform1f(u.time, reduce ? 0 : (now - start) / 1000);
      gl.uniform2f(u.mouse, mouse.x, mouse.y);
      gl.uniform1f(u.hover, mouse.h);
      gl.uniform2f(u.canvas, canvas.width, canvas.height);
      gl.uniform2f(u.image, imageSize.w, imageSize.h);
      gl.uniform1f(u.hasImage, hasImage);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };
    raf = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      canvas.removeEventListener("mouseleave", onLeave);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, [src]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={className}
      style={{ width: "100%", height: "100%", display: "block" }}
    />
  );
}

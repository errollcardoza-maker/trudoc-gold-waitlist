'use client';

import { useEffect, useRef } from 'react';
import { PARTICLE_FRAG } from './particleShader';

/** Live particle figure for the results preview tiles (body = Biological age, heart = 10-year risk), the
 *  same engine the app uses (prototype `ParticleSubject`, pxScale 300, motionSpeed .22). The canvas is a
 *  375 × 520 stage placed and scaled by CSS (.lp-pc). It starts when the card scrolls into view, renders only
 *  while visible, and swirls in over 2.8s. Under reduced motion it barely drifts. */
const VERT = 'attribute vec2 aPos;void main(){gl_Position=vec4(aPos,0.,1.);}';
const DENS = { body: '/assets/lp/particles/body-density.png', heart: '/assets/lp/particles/heart-density.png' };
const IMG: Record<string, Promise<HTMLImageElement>> = {};
const loadImage = (src: string) =>
  (IMG[src] ??= new Promise((res) => {
    const im = new Image();
    im.onload = () => im.decode().catch(() => {}).then(() => res(im));
    im.src = src;
  }));

export function ParticleTile({ kind }: { kind: 'body' | 'heart' }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const box = ref.current;
    if (!box) return;
    // A fresh canvas per mount: a context released on unmount can't be reused.
    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'display:block;width:100%;height:100%;';
    box.appendChild(canvas);
    const gl = canvas.getContext('webgl', { antialias: true, premultipliedAlpha: true, alpha: true });
    if (!gl) {
      canvas.remove();
      return;
    }
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const mk = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, mk(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, mk(gl.FRAGMENT_SHADER, PARTICLE_FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'aPos');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const u = (n: string) => gl.getUniformLocation(prog, n);

    let dead = false;
    const loadTex = (unit: number, src: string, uni: string) => {
      const tex = gl.createTexture();
      gl.activeTexture(gl.TEXTURE0 + unit);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 255]));
      for (const [k, v] of [[gl.TEXTURE_MIN_FILTER, gl.LINEAR], [gl.TEXTURE_MAG_FILTER, gl.LINEAR], [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE]])
        gl.texParameteri(gl.TEXTURE_2D, k, v);
      gl.uniform1i(u(uni), unit);
      loadImage(src).then((im) => {
        if (dead) return;
        gl.activeTexture(gl.TEXTURE0 + unit);
        gl.bindTexture(gl.TEXTURE_2D, tex);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, im);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
        gl.activeTexture(gl.TEXTURE0);
      });
    };
    loadTex(0, DENS.body, 'uDens');
    loadTex(1, DENS.heart, 'uHeart');

    // The stage is shown at about a third of its size on mobile, so this resolution keeps specks crisp.
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(375 * dpr);
    canvas.height = Math.round(520 * dpr);
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(u('uRes'), canvas.width, canvas.height);
    gl.uniform1f(u('uZoom'), kind === 'heart' ? 1 : 0);
    gl.uniform1f(u('uPx'), 300 * dpr);
    gl.uniform1f(u('uTint'), 0);
    gl.uniform1f(u('uGray'), 0);

    let raf = 0, visible = false, started = 0, last = 0, t = 10, beat = 0;
    const frame = (now: number) => {
      raf = 0;
      if (dead || !visible) return;
      const dt = Math.min((now - (last || now)) / 1000, 0.05);
      last = now;
      t += dt * (reduced ? 0.15 : 0.22);
      beat += dt;
      gl.uniform1f(u('uTime'), t);
      gl.uniform1f(u('uBeat'), beat);
      gl.uniform1f(u('uReveal'), reduced ? 1 : Math.min((now - started) / 2800, 1));
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      raf = requestAnimationFrame(frame);
    };
    const io = new IntersectionObserver(
      ([en]) => {
        visible = en.isIntersecting;
        if (visible && !raf) {
          if (!started) started = performance.now();
          last = 0;
          raf = requestAnimationFrame(frame);
        }
      },
      { threshold: 0.2 },
    );
    io.observe(box.closest('.lp-tl-card') ?? box);
    return () => {
      dead = true;
      io.disconnect();
      cancelAnimationFrame(raf);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      canvas.remove();
    };
  }, [kind]);

  return <span ref={ref} className={`lp-pc ${kind}`} aria-hidden="true" />;
}

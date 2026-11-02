'use client';

/* eslint-disable @next/next/no-img-element -- the art image is also read back into canvases */
import { useEffect, useRef } from 'react';
import { footer } from '@/lib/content';

/** Translucent figure + its arm, as soft-edged rectangles in image uv (x0, y0, x1, y1, edge softness). */
const FOOT_STILL = [[0.333, 0.15, 0.484, 0.62, 0.012], [0.38, 0.222, 0.5, 0.282, 0.01]];
function stillMask(u: number, v: number) {
  let m = 0;
  for (const [x0, y0, x1, y1, s] of FOOT_STILL) {
    const sx = Math.min(1, Math.max(0, (u - x0 + s) / (2 * s))) * Math.min(1, Math.max(0, (x1 + s - u) / (2 * s)));
    const sy = Math.min(1, Math.max(0, (v - y0 + s) / (2 * s))) * Math.min(1, Math.max(0, (y1 + s - v) / (2 * s)));
    m = Math.max(m, sx * sy);
  }
  return m;
}

const VS = 'attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}';
const FS = `precision highp float;
uniform sampler2D D;uniform vec2 R;uniform vec2 B;uniform float S,t,am;
#define TAU 6.2831853
float hash(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),u.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),u.x),u.y);}
float fbm(vec2 p){float v=0.,a=.5;mat2 m=mat2(1.6,1.2,-1.2,1.6);for(int i=0;i<4;i++){v+=a*noise(p);p=m*p+vec2(1.7,9.2);a*=.5;}return v;}
float dens(vec2 P){vec2 uv=P/B;if(uv.x<0.||uv.y<0.||uv.x>1.||uv.y>1.)return 0.;return texture2D(D,uv).r;}
float layer(vec2 P,float gs,vec2 vel,float seed,float lo,float hi,float rad){
  vec2 gp=P-t*vel;vec2 cid=floor(gp/gs);
  float h=hash(cid+seed),h2=hash(cid+seed+7.3),h3=hash(cid+seed+13.1);
  vec2 c=(cid+.5+(vec2(h2,h3)-.5)*.6+.12*vec2(sin(t*1.1+h*TAU),cos(t*.9+h2*TAU)))*gs;
  float d=smoothstep(lo,hi,dens(c+t*vel));
  float pr=rad*(.6+.7*h3*h3);
  float dotM=smoothstep(pr,pr*.3,length(gp-c)/gs);
  float tw=.68+.32*sin(t*(1.2+h2*2.)+h*TAU);
  float exists=step(h+.004,d)*smoothstep(h3*.55,h3*.55+.35,am);
  return dotM*exists*tw*(.55+.7*d)*(1.+.6*step(.93,h3));
}
void main(){
  vec2 P=vec2(gl_FragCoord.x,R.y-gl_FragCoord.y)/S;
  float amE=1.-pow(1.-clamp(am,0.,1.),3.);
  if(amE<.999)P+=(vec2(fbm(P*.035+vec2(3.1,t*.1)),fbm(P*.035+vec2(9.7,-t*.1)))-.5)*60.*pow(1.-amE,1.6);
  float g=smoothstep(.55*B.y,.68*B.y,P.y);
  float up=layer(P,1.55,vec2(0.,-4.),0.,.025,.32,.36)+layer(P,.95,vec2(0.,-2.5),31.7,.14,.6,.34)*.9;
  float side=layer(P,1.5,vec2(6.,0.),5.,.025,.32,.36)+layer(P,.9,vec2(3.5,0.),19.3,.14,.6,.34)*.9;
  float lum=mix(up,side,g);
  float glow=smoothstep(.04,.8,dens(P))*.12*smoothstep(.45,1.,am);
  float la=clamp(lum*1.8,0.,1.),A=clamp(la+glow,0.,1.);
  gl_FragColor=vec4(vec3(.36,.2,.08)*A,A);}`;

/** Live particle version of the footer art: the translucent figure stays the original image; the particle
 *  figure and ground are re-drawn as drifting, twinkling specks that swirl in the first time the footer shows.
 *  Renders only while visible. The plain image stays as the fallback (no WebGL, reduced motion). */
function useFooterParticles(box: React.RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const el = box.current;
    if (!el || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const img = el.querySelector('img')!, cv = el.querySelector<HTMLCanvasElement>('canvas.cv')!, still = el.querySelector<HTMLCanvasElement>('canvas.still')!;
    const gl = cv.getContext('webgl', { premultipliedAlpha: true, antialias: false, alpha: true });
    if (!gl) return;
    const sh = (type: number, src: string) => {
      const x = gl.createShader(type)!;
      gl.shaderSource(x, src);
      gl.compileShader(x);
      return x;
    };
    const pr = gl.createProgram()!;
    gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS));
    gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return;
    gl.useProgram(pr);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(pr, 'a');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    const U = (n: string) => gl.getUniformLocation(pr, n);

    let raf = 0, visible = false, ready = false, dead = false, revealAt = 0, last = 0;
    const t0 = performance.now();
    const frame = (now: number) => {
      raf = 0;
      if (dead || !visible) return;
      if (now - last > 16) {
        last = now;
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.uniform1f(U('t'), 10 + ((now - t0) / 1000) * 0.6);
        gl.uniform1f(U('am'), revealAt ? Math.min(1, (now - revealAt) / 2600) : 0);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      }
      raf = requestAnimationFrame(frame);
    };
    const start = () => {
      if (ready && visible && !raf) raf = requestAnimationFrame(frame);
    };
    const setup = () => {
      if (dead) return;
      const W = el.clientWidth, H = el.clientHeight, k = W > 600 ? 2 : 3; // dense enough for round, crisp specks
      cv.width = Math.round(W * k);
      cv.height = Math.round(H * k);
      gl.viewport(0, 0, cv.width, cv.height);
      // Density map: the image's light at half size, softly blurred, translucent figure removed, edges faded
      const dw = Math.round(img.naturalWidth / 2), dh = Math.round(img.naturalHeight / 2);
      const dc = document.createElement('canvas');
      dc.width = dw;
      dc.height = dh;
      const dx = dc.getContext('2d', { willReadFrequently: true })!;
      dx.filter = 'blur(0.8px)';
      dx.drawImage(img, 0, 0, dw, dh);
      const dd = dx.getImageData(0, 0, dw, dh), px = dd.data;
      for (let y = 0; y < dh; y++)
        for (let x = 0; x < dw; x++) {
          const i = (y * dw + x) * 4, u = x / dw, v = y / dh;
          const edge = Math.min(1, u / 0.12, (1 - u) / 0.2, v / 0.1, (1 - v) / 0.16);
          const L = px[i + 3] * (1 - stillMask(u, v)) * Math.max(0, edge); // the ink art's opacity is its brightness
          px[i] = px[i + 1] = px[i + 2] = L;
        }
      dx.putImageData(dd, 0, 0);
      const tex = gl.createTexture();
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      for (const [a, b] of [[gl.TEXTURE_MIN_FILTER, gl.LINEAR], [gl.TEXTURE_MAG_FILTER, gl.LINEAR], [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE]])
        gl.texParameteri(gl.TEXTURE_2D, a, b);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, dc);
      gl.uniform1i(U('D'), 0);
      gl.uniform2f(U('R'), cv.width, cv.height);
      gl.uniform2f(U('B'), W, H);
      gl.uniform1f(U('S'), k);
      // Translucent figure: the art's own pixels, cut out with a soft edge, drawn once
      still.width = Math.round(W * 2);
      still.height = Math.round(H * 2);
      const sx = still.getContext('2d', { willReadFrequently: true })!;
      sx.drawImage(img, 0, 0, still.width, still.height);
      const sd = sx.getImageData(0, 0, still.width, still.height), sp = sd.data;
      for (let y = 0; y < still.height; y++)
        for (let x = 0; x < still.width; x++) {
          const i = (y * still.width + x) * 4, m = stillMask(x / still.width, y / still.height);
          // Keep only the figure itself: its soft halo and everything outside the cut-out become transparent.
          const a = sp[i + 3] / 255, lit = Math.min(1, Math.max(0, (a - 0.16) / 0.3));
          sp[i + 3] = Math.round(255 * a * m * lit);
        }
      sx.putImageData(sd, 0, 0);
      ready = true;
      el.classList.add('live');
      start();
    };
    if (img.complete && img.naturalWidth) setup();
    else img.addEventListener('load', setup, { once: true });
    const io = new IntersectionObserver(
      ([en]) => {
        visible = en.isIntersecting;
        if (visible) {
          if (!revealAt) revealAt = performance.now();
          start();
        }
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => {
      dead = true;
      io.disconnect();
      if (raf) cancelAnimationFrame(raf);
      el.classList.remove('live');
    };
  }, [box]);
}

export function Footer() {
  const end = useRef<HTMLDivElement>(null);
  const art = useRef<HTMLDivElement>(null);
  useFooterParticles(art);

  // Tagline fades in when 35% of the footer is in view, and back out when it leaves
  useEffect(() => {
    const el = end.current;
    if (!el) return;
    const io = new IntersectionObserver(([en]) => el.classList.toggle('show', en.isIntersecting), { threshold: 0.35 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <footer>
      <div className="lp-end" ref={end}>
        <div className="lp-end-art" ref={art} aria-hidden="true">
          <img src="/assets/lp/footer-figures-ink.webp" alt="" width={1672} height={941} loading="lazy" decoding="async" />
          <canvas className="still" />
          <canvas className="cv" />
        </div>
        <p className="lp-end-tag">
          {footer.tagline[0]}
          <br />
          {footer.tagline[1]}
        </p>
      </div>
      <div className="lp-contact">
        <div className="lp-wrap">
          <span className="h">Contact</span>
          <div className="rows">
            <a href={footer.phone.href}>{footer.phone.label}</a>
            <a href={footer.email.href}>{footer.email.label}</a>
            <span>{footer.address}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

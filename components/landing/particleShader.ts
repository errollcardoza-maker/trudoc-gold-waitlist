// Biological age / heart particle shader, ported unchanged from the handoff prototype (reference/source/js/particles.js).
// Do not retune constants here; layout is set by the caller (pxScale, canvas box). Only change: the output is
// premultiplied (colour × alpha) so mobile Safari composites it correctly.
export const PARTICLE_FRAG = `
precision highp float;
uniform vec2 uRes;uniform float uTime;uniform float uBeat;uniform float uZoom;uniform float uReveal;uniform float uTint;uniform float uPx;uniform sampler2D uDens;uniform sampler2D uHeart;uniform float uGray;
#define TAU 6.2831853
float hash(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);
 return mix(mix(hash(i),hash(i+vec2(1.,0.)),u.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),u.x),u.y);}
float fbm(vec2 p){float v=0.,a=.5;mat2 m=mat2(1.6,1.2,-1.2,1.6);for(int i=0;i<4;i++){v+=a*noise(p);p=m*p+vec2(1.7,9.2);a*=.5;}return v;}
vec3 tint(vec3 c){return mix(c,vec3(c.r*.6+c.b*.45,c.g*.55,c.b),uTint);}
const vec2 H=vec2(.045,-.11);
float beatEnv(float x){float a=smoothstep(0.,.05,x)*exp(-x*7.);float b=smoothstep(.27,.32,x)*exp(-max(x-.3,0.)*7.);return a+.5*b;}
vec2 heartUV(vec2 w,float env){
 vec2 Hc=H+vec2(-sin(.38),cos(.38))*.2*.05;
 vec2 q=w-Hc;float a=.1;q=mat2(cos(a),-sin(a),sin(a),cos(a))*q;
 return q/(.128*(1.+.05*env))+.5;
}
vec3 heartField(vec2 w,float env){
 vec2 uv=heartUV(w,env);
 if(uv.x<0.||uv.y<0.||uv.x>1.||uv.y>1.)return vec3(0.);
 vec4 tx=texture2D(uHeart,uv);
 return vec3(tx.r,tx.g,0.);
}
float bodyD(vec2 w,float zE){
 float T=texture2D(uDens,(w-vec2(0.,-.07))/1.3+.5).r;
 float tz=length((w-vec2(0.,-.005))/vec2(.17,.11));
 float tzF=mix(mix(.35,1.,smoothstep(.5,1.,tz)),1.,zE);
 return (smoothstep(.1,.8,T)*.92+smoothstep(.04,.14,T)*.11)*tzF*(1.-.5*zE);
}
void main(){
 vec2 p=(gl_FragCoord.xy-.5*uRes)/uPx;
 float t=uTime;
 float z=clamp(uZoom,0.,1.);
 float zE=z*z*(3.-2.*z);
 float s=exp(mix(0.,log(6.),zE));
 vec2 Hc=H+vec2(-sin(.38),cos(.38))*.2*.05;
 vec2 cam=mix(vec2(0.),Hc,zE);
 vec2 anchor=vec2(0.,mix(.16,.12,zE));
 float am=clamp(uReveal,0.,1.);float amE=1.-pow(1.-am,3.);
 vec2 sw=(vec2(fbm(p*2.6+vec2(3.1,t*.1)),fbm(p*2.6+vec2(9.7,-t*.1)))-.5)*.9*pow(1.-amE,1.6);
 vec2 ps=p+sw;
 vec2 wp=cam+(ps-anchor)/s;
 float bx=fract(uBeat/1.5);float env=beatEnv(bx);
 float hv=smoothstep(.12,.75,z);
 float gs=.0036;
 float colI=floor(ps.x/gs);
 float spd=(.012+.014*hash(vec2(colI,1.7)))*(1.-.7*zE);
 vec2 gp=vec2(ps.x,ps.y-t*spd);
 vec2 cid=floor(gp/gs);
 float h=hash(cid),h2=hash(cid+7.3),h3=hash(cid+13.1);
 vec2 c=(cid+.5+(vec2(h2,h3)-.5)*.6+.1*vec2(sin(t*1.1+h*TAU),cos(t*.9+h2*TAU)))*gs;
 vec2 cpos=c+vec2(0.,t*spd);
 vec2 wc=cam+(cpos-anchor)/s;
 float Db=bodyD(wc,zE);
 vec3 hf=heartField(wc,env);
 float Dh=(smoothstep(.03,.6,hf.x)*.75+smoothstep(.1,.6,hf.y)*.1)*hv;
 float tz2=length((cpos-vec2(0.,.12))/vec2(.2,.125));
 float D=min(.97,max(Db,Dh))*mix(1.,mix(.3,1.,smoothstep(.5,1.,tz2)),zE);
 float pd=length(gp-c)/gs;
 float pr=.4*(.6+.7*h3*h3);
 float dotM=smoothstep(pr,pr*.3,pd);
 float tw=.72+.28*sin(t*(1.2+h2*2.)+h*TAU);
 float exists=step(h+.004,D)*smoothstep(h3*.55,h3*.55+.35,am);
 float hd=length(wc-H);
 float rip=exp(-abs(hd-bx*.5)*38.)*(1.-bx)*hv;
 float heartMix=clamp(Dh*1.3,0.,1.);
 float lum=dotM*exists*tw*(1.+.6*step(.93,h3))*(.55+.6*D)*(1.+heartMix*env*1.2+rip*1.6);
 float gs2=.0019;
 vec2 gp2=vec2(ps.x,ps.y-t*.004);
 vec2 cid2=floor(gp2/gs2);
 float k1=hash(cid2+31.7),k2=hash(cid2+5.9),k3=hash(cid2+19.3);
 vec2 c2=(cid2+.5+(vec2(k2,k3)-.5)*.7+.12*vec2(sin(t*1.3+k1*TAU),cos(t*1.1+k2*TAU)))*gs2;
 vec2 wc2=cam+(c2+vec2(0.,t*.004)-anchor)/s;
 vec3 hf2=heartField(wc2,env);
 float D2=(smoothstep(.06,.65,hf2.x)*.97+smoothstep(.2,.7,hf2.y)*.05)*hv*mix(1.,mix(.3,1.,smoothstep(.5,1.,length((c2-vec2(0.,.12))/vec2(.2,.125)))),zE);
 float pr2=.36*(.6+.6*k3*k3);
 float dot2m=smoothstep(pr2,pr2*.25,length(gp2-c2)/gs2)*step(k1+.004,D2);
 float lum2=dot2m*(.7+.3*sin(t*(1.5+k2*2.)+k1*TAU))*(.35+.9*hf2.x)*(1.+env*1.1+rip*1.4);
 lum=max(lum,lum2);
 heartMix=max(heartMix,clamp(D2*1.5,0.,1.)*step(.001,lum2));
 float T=texture2D(uDens,(wp-vec2(0.,-.07))/1.3+.5).r;
 vec3 hpx=heartField(wp,env);
 float hglow=(hpx.y*hpx.y*.32+hpx.x*.25)*hv*(.45+1.1*env);
 float bglow=T*T*.45*(1.-.6*zE)*smoothstep(.45,1.,am);
 float side=smoothstep(.2,-.3,p.x);
 vec3 pc=mix(vec3(.94,.96,1.),vec3(.5,.66,1.),side*.75);
 vec3 rose=vec3(1.,.42,.52);
 vec3 partC=tint(mix(pc,mix(rose,vec3(1.,.85,.88),.35*env),heartMix));
 vec3 glowC=mix(tint(vec3(.22,.4,1.)),rose,clamp(hglow/max(hglow+bglow,1e-3),0.,1.));
 float la=clamp(lum*1.7,0.,1.);
 float ga=clamp(hglow+bglow,0.,.85);
 float A=clamp(la+ga,0.,1.);
 vec3 col=mix(glowC,partC,la/max(la+ga,1e-3));
 col+=(hash(gl_FragCoord.xy+fract(t))-.5)/255.;
 float gL=dot(col,vec3(.299,.587,.114));
 col=mix(col,vec3(gL)*vec3(.9,.93,1.)*1.12,uGray);   // unlit (unknown score): cool grey stipple
 gl_FragColor=vec4(clamp(col,0.,1.)*A,A);   // premultiplied: Safari shows straight-alpha canvases as opaque
}`;

// A full classical guitar in "player view": what you see looking down at the guitar in your lap.
// String 6 on top, headstock on the left. 1 unit ≈ 0.65 mm, nut→saddle = 1000 units.
// Both hands are drawn and animated from the same events the audio plays.
const GX={nut:150,L:1000,y:220,W:1410,fbEnd:836};
const gfx=n=>GX.nut+GX.L*(1-Math.pow(2,-n/12));   // fret wire x
const gfm=n=>n<=0?GX.nut-17:(gfx(n-1)+gfx(n))/2;  // middle of fret n
const gsp=x=>12+(x-GX.nut)/GX.L*4.5;               // string spacing grows toward the bridge
const gsy=(s,x)=>GX.y+(3.5-s)*gsp(x);
const ghalf=x=>2.5*gsp(x)+9;
const GBR=GX.nut+GX.L;
const GBODY="M640,220 C640,110 690,70 770,70 C850,70 880,104 940,104 C1000,104 1040,34 1180,34 C1330,34 1394,120 1394,220 C1394,320 1330,406 1180,406 C1040,406 1000,336 940,336 C880,336 850,370 770,370 C690,370 640,330 640,220Z";
const GC={top:"#E6C38A",grain:"#B8894A",bind:"#F3E6CB",board:"#3A2618",neck:"#8C5B34",head:"#5B3920",fret:"#D9D8D2",nut:"#F2ECDD",hole:"#1C130D",ros:"#6B4A2B",nylon:"#F4EFE3",wound:"#CFCBC2",glow:"#FFD86B",skin:"#EBC2A2",skinL:"#AE7A58"};
const pluckCurve=t=>t<0||t>1.2?0:t<.05?t/.05:Math.exp(-(t-.05)/.11);
// right hand: knuckle positions and the x where each finger meets the strings
const RK={p:[994,110],i:[958,140],m:[984,146],a:[1009,149],c:[1032,150]};
const RX={p:915,i:952,m:979,a:1005,c:1030};

function gStatic(id,mir){
  const tf=x=>mir?` transform="translate(${2*x},0) scale(-1,1)"`:"";
  const top=x=>GX.y-ghalf(x),bot=x=>GX.y+ghalf(x),e=GX.fbEnd;
  let s=`<defs><clipPath id="${id}-b"><path d="${GBODY}"/></clipPath></defs><path d="${GBODY}" fill="${GC.top}"/>`;
  s+=`<g clip-path="url(#${id}-b)" stroke="${GC.grain}" stroke-width="1.3" opacity=".2">`;
  for(let y=38;y<=404;y+=10)s+=`<line x1="630" y1="${y}" x2="1400" y2="${y+(y%7)-3}"/>`;
  s+=`</g><path d="${GBODY}" fill="none" stroke="${GC.bind}" stroke-width="7"/>`;
  s+=`<circle cx="895" cy="${GX.y}" r="76" fill="none" stroke="${GC.ros}" stroke-width="14"/><circle cx="895" cy="${GX.y}" r="76" fill="none" stroke="#D2A462" stroke-width="3" stroke-dasharray="4 3"/><circle cx="895" cy="${GX.y}" r="61" fill="${GC.hole}"/>`;
  s+=`<rect x="1134" y="140" width="62" height="160" rx="9" fill="${GC.board}"/><rect x="1146" y="148" width="6" height="144" rx="2" fill="${GC.nut}"/>`;
  const h0=ghalf(GX.nut);
  s+=`<path d="M24,152 L${GX.nut},${GX.y-h0-4} L${GX.nut},${GX.y+h0+4} L24,288 Q10,220 24,152Z" fill="${GC.head}"/>`;
  s+=`<rect x="40" y="184" width="94" height="14" rx="7" fill="${GC.hole}"/><rect x="40" y="242" width="94" height="14" rx="7" fill="${GC.hole}"/>`;
  [58,87,116].forEach(x=>{s+=`<rect x="${x-9}" y="130" width="18" height="26" rx="7" fill="#E8E1CF"/><rect x="${x-9}" y="284" width="18" height="26" rx="7" fill="#E8E1CF"/><rect x="${x-3}" y="152" width="6" height="36" fill="#B9B3A3"/><rect x="${x-3}" y="252" width="6" height="36" fill="#B9B3A3"/>`});
  s+=`<path d="M${GX.nut},${top(GX.nut)-4} L700,${top(700)-4} L700,${bot(700)+4} L${GX.nut},${bot(GX.nut)+4}Z" fill="${GC.neck}"/>`;
  s+=`<path d="M${GX.nut},${top(GX.nut)} L${e},${top(e)} L${e},${bot(e)} L${GX.nut},${bot(GX.nut)}Z" fill="${GC.board}"/>`;
  for(let n=1;n<=19;n++){const x=gfx(n);s+=`<line x1="${x}" y1="${top(x)}" x2="${x}" y2="${bot(x)}" stroke="${GC.fret}" stroke-width="2.4"/>`}
  [5,7,9,15].forEach(n=>s+=`<circle cx="${gfm(n)}" cy="${GX.y}" r="3.6" fill="#CDBFA6" opacity=".6"/>`);
  s+=`<circle cx="${gfm(12)}" cy="${GX.y-22}" r="3.6" fill="#CDBFA6" opacity=".6"/><circle cx="${gfm(12)}" cy="${GX.y+22}" r="3.6" fill="#CDBFA6" opacity=".6"/>`;
  s+=`<rect x="${GX.nut-6}" y="${top(GX.nut)-1}" width="7" height="${2*h0+2}" fill="${GC.nut}"/>`;
  const post={6:[58,191],5:[87,191],4:[116,191],3:[116,249],2:[87,249],1:[58,249]};
  for(let st=1;st<=6;st++){const [px,py]=post[st];s+=`<line x1="${GX.nut}" y1="${gsy(st,GX.nut)}" x2="${px}" y2="${py}" stroke="${st>3?GC.wound:GC.nylon}" stroke-width="${.9+(st-1)*.35}"/>`}
  [1,3,5,7,9,12,15].forEach(n=>{const x=gfm(n);s+=`<text x="${x}" y="${top(x)-10}" text-anchor="middle" font-size="14" font-family="IBM Plex Mono,monospace" fill="#9A8A74"${tf(x)}>${n}</text>`});
  return s;
}
function gDyn(mir){
  const tf=(x)=>mir?` transform="translate(${2*x},0) scale(-1,1)"`:"";
  let s=`<g class="gstr">`+[6,5,4,3,2,1].map(st=>`<path data-s="${st}" fill="none" stroke-width="${.9+(st-1)*.35}"/>`).join("")+`</g><g class="gmk"></g>`;
  s+=`<ellipse class="gth" rx="30" ry="12" fill="none" stroke="${GC.skinL}" stroke-width="3" stroke-dasharray="6 5" opacity=".8"/>`;
  s+=`<g class="glh"><path class="gwr" fill="${GC.skin}" stroke="${GC.skinL}" stroke-width="2.5"/>`;
  [4,3,2,1].forEach(g=>s+=`<g class="gf" data-g="${g}"><path class="o" fill="none" stroke="${GC.skinL}" stroke-width="21" stroke-linecap="round" stroke-linejoin="round"/><path class="i" fill="none" stroke="${GC.skin}" stroke-width="17" stroke-linecap="round" stroke-linejoin="round"/><circle class="ct" r="12" fill="none" stroke="var(--f${g})" stroke-width="3.5"/><ellipse class="nl" rx="6.5" ry="7.5" fill="var(--f${g})" stroke="#fff" stroke-width="1.5"/></g>`);
  s+=`</g><g class="grh"><path d="M1270,-60 L1150,-60 L996,74 L1064,100Z" fill="${GC.skin}" stroke="${GC.skinL}" stroke-width="2.5"/>`;
  s+=`<path d="M986,72 Q1052,58 1070,98 L1046,154 Q990,166 944,148 L960,98Z" fill="${GC.skin}" stroke="${GC.skinL}" stroke-width="2.5"/>`;
  ["c","a","m","i","p"].forEach(k=>{const w=k==="p"?22:19;s+=`<g class="grf" data-k="${k}"><path class="o" fill="none" stroke="${GC.skinL}" stroke-width="${w}" stroke-linecap="round"/><path class="i" fill="none" stroke="${GC.skin}" stroke-width="${w-4}" stroke-linecap="round"/></g>`});
  [["p",1004,104],["i",958,128],["m",984,132],["a",1009,135]].forEach(([k,x,y])=>s+=`<text class="gl" data-k="${k}" x="${x}" y="${y}" text-anchor="middle" font-size="15" font-weight="700" font-family="IBM Plex Mono,monospace" fill="#7A4E32"${tf(x)}>${k}</text>`);
  return s+`</g>`;
}

class GuitarView{
  constructor(host){
    this.host=host;this.id="g"+Math.random().toString(36).slice(2,8);
    this.mode=matchMedia("(min-width:900px)").matches?"full":"left";this.mir=false;
    this.amp=new Array(7).fill(0);this.ph=new Array(7).fill(0);this.st=new Array(7).fill(GX.nut);
    this.tb=1;this.bx=gfm(1);this.bar=null;
    this.F={};[1,2,3,4].forEach(g=>{const x=gfm(g),y=gsy(1,x)+18;this.F[g]={x,y,tx:x,ty:y,pr:0,tp:0}});
    this.R={p:{s:5,t:-9},i:{s:3,t:-9},m:{s:2,t:-9},a:{s:1,t:-9},c:{s:1,t:-9}};this.sd={k:null,t:-9};
    this.loop=this.loop.bind(this);this.render();
  }
  render(){
    const m=this.mir,id=this.id;
    this.host.innerHTML=`<div class="pats gcams"><button class="chip" data-m="full">الجيتار كامل</button><button class="chip" data-m="left">زوم على الإيد الشمال</button><button class="chip gmirb">${m?"زي ما بتشوفه انت":"من قدّام (زي الأستاذ)"}</button></div>
    <div class="gstage"><svg class="gmain" viewBox="0 20 ${GX.W} 400" role="img" aria-label="الجيتار والإيدين وهم بيعزفوا"><g id="${id}"><g${m?` transform="translate(${GX.W},0) scale(-1,1)"`:""}>${gStatic(id,m)}${gDyn(m)}</g></g></svg>
    <svg class="grhv" viewBox="${m?GX.W-1230:810} 20 420 330" aria-hidden="true"><use href="#${id}"/></svg></div>`;
    const q=s=>this.host.querySelector(s);
    this.main=q(".gmain");this.stage=q(".gstage");this.wr=q(".gwr");this.th=q(".gth");this.mk=q(".gmk");this.rh=q(".grh");
    this.sp={};this.host.querySelectorAll(".gstr path").forEach(p=>this.sp[+p.dataset.s]=p);
    this.fg={};this.host.querySelectorAll(".gf").forEach(g=>this.fg[+g.dataset.g]={g,o:g.querySelector(".o"),i:g.querySelector(".i"),ct:g.querySelector(".ct"),nl:g.querySelector(".nl")});
    this.rf={};this.host.querySelectorAll(".grf").forEach(g=>this.rf[g.dataset.k]={o:g.querySelector(".o"),i:g.querySelector(".i")});
    this.gl={};this.host.querySelectorAll(".gl").forEach(t=>this.gl[t.dataset.k]=t);
    this.cam=null;
    this.host.querySelectorAll(".gcams [data-m]").forEach(b=>b.onclick=()=>{this.mode=b.dataset.m;this.cam=null;this.chips()});
    q(".gmirb").onclick=()=>{this.mir=!this.mir;this.render();if(this.lastE)this.show(this.lastE)};
    this.chips();this.wake();
  }
  // redraw only while something moves, so an idle guitar costs nothing
  wake(){this.hot=performance.now()/1000+1.4;if(!this.running){this.running=true;this.last=null;requestAnimationFrame(this.loop)}}
  chips(){
    this.host.querySelectorAll(".gcams [data-m]").forEach(b=>b.classList.toggle("on",b.dataset.m===this.mode));
    this.stage.classList.toggle("zoom",this.mode==="left");this.wake();
  }
  show(e){
    this.lastE=e;this.wake();
    const m={};let bar=null;
    if(e.c){const c=CH[e.c];c.f.forEach((f,i)=>{const g=c.g[i];if(g&&f>0&&!(c.barre&&g===1&&f===c.barre))m[g]=[6-i,f]});if(c.barre)bar=c}
    else (e.n||[]).forEach(([s,f,g])=>{if(g&&f>0)m[g]=[s,f]});
    let base=Infinity;Object.entries(m).forEach(([g,[,f]])=>base=Math.min(base,f-(g-1)));if(bar)base=Math.min(base,bar.barre);
    if(base<Infinity)this.tb=Math.max(1,base);
    this.bar=bar?{fr:bar.barre,bf:bar.bf}:null;
    this.st=new Array(7).fill(GX.nut);
    [1,2,3,4].forEach(g=>{const F=this.F[g];
      if(bar&&g===1){const w=gfx(bar.barre)-gfx(bar.barre-1);F.tx=gfx(bar.barre)-w*.3;F.ty=gsy(1,F.tx)+10;F.tp=.6;for(let s=1;s<=bar.bf;s++)this.st[s]=Math.max(this.st[s],gfx(bar.barre))}
      else if(m[g]){const [s,fr]=m[g],w=gfx(fr)-gfx(fr-1);F.tx=e.h?gfx(fr)-1:gfx(fr)-Math.min(15,w*.3);F.ty=gsy(s,F.tx);F.tp=e.h?.5:1;if(!e.h)this.st[s]=Math.max(this.st[s],gfx(fr))}
      else{F.tx=gfm(this.tb+g-1);F.ty=gsy(1,F.tx)+20;F.tp=0}});
    let mk="";const mx=GX.nut-26;
    if(e.c)CH[e.c].f.forEach((f,i)=>{const y=gsy(6-i,GX.nut);if(f<0)mk+=`<path d="M${mx-6},${y-6} L${mx+6},${y+6} M${mx+6},${y-6} L${mx-6},${y+6}" stroke="#E0533D" stroke-width="3.5" stroke-linecap="round"/>`;else if(f===0)mk+=`<circle cx="${mx}" cy="${y}" r="6.5" fill="none" stroke="#fff" stroke-width="2.5"/>`});
    else (e.n||[]).forEach(([s,f])=>{if(!f)mk+=`<circle cx="${mx}" cy="${gsy(s,GX.nut)}" r="7" fill="none" stroke="#fff" stroke-width="3"/>`});
    this.mk.innerHTML=mk;
  }
  hit(e){
    const T=performance.now()/1000;this.wake();
    if(e.c&&e.k){this.sd={k:e.k,t:T};const c=CH[e.c],big=(e.v||.28)>.2;for(let s=1;s<=6;s++)if(c.f[6-s]>=0&&(e.k==="D"||s<=4))this.vib(s,big?6:3.5)}
    (e.n||[]).forEach(([s,f,g,rh])=>{this.vib(s,e.sl?3:6);if(e.sl)return;let k=(rh||"")[0];if(k==="e")k="c";if(!"pimac".includes(k)||!k)k=s>=4?"p":({3:"i",2:"m",1:"a"})[s];this.R[k]={s,t:T}});
  }
  vib(s,a){this.amp[s]=a;this.ph[s]=Math.random()*6}
  loop(now){
    if(!this.host.isConnected){this.running=false;return}
    const dt=Math.min(.05,(now-(this.last||now))/1000);this.last=now;
    const k=1-Math.exp(-dt/.06),T=now/1000;
    this.bx+=(gfm(this.tb)-this.bx)*k;
    const K=g=>{const x=this.bx-14+(g-1)*27;return [x,GX.y+ghalf(x)+32]};
    [1,2,3,4].forEach(g=>{
      const F=this.F[g],E=this.fg[g];F.x+=(F.tx-F.x)*k*1.5;F.y+=(F.ty-F.y)*k*1.5;F.pr+=(F.tp-F.pr)*k*1.5;
      const [kx,ky]=K(g);let d=`M${kx},${ky} L${F.x},${F.y}`,tx=F.x,ty=F.y;
      if(g===1&&this.bar){ty=gsy(this.bar.bf,F.x)-9;d=`M${kx},${ky} L${F.x},${gsy(1,F.x)+10} L${F.x},${ty}`}
      E.o.setAttribute("d",d);E.i.setAttribute("d",d);E.nl.setAttribute("cx",tx);E.nl.setAttribute("cy",ty);
      E.ct.setAttribute("cx",F.x);E.ct.setAttribute("cy",F.y);E.ct.setAttribute("opacity",g===1&&this.bar?0:Math.max(0,F.pr-.1));
      E.g.setAttribute("opacity",(.5+.5*Math.min(1,F.pr*1.4)).toFixed(2));
    });
    const [k1x,k1y]=K(1),[k4x,k4y]=K(4);
    this.wr.setAttribute("d",`M${k1x-12},${k1y-8} L${k4x+12},${k4y-8} Q${k4x+36},${k4y+40} ${k4x+22},${k4y+88} L${k4x},500 L${k1x-130},500 L${k1x-46},${k1y+82} Q${k1x-42},${k1y+20} ${k1x-12},${k1y-8}Z`);
    this.th.setAttribute("cx",K(2)[0]+10);this.th.setAttribute("cy",GX.y);
    for(let s=1;s<=6;s++){
      this.amp[s]*=Math.exp(-dt/.55);const a=this.amp[s],x0=this.st[s],y0=gsy(s,x0),yb=gsy(s,GBR),off=a>.05?a*Math.sin(T*2*Math.PI*11+this.ph[s]):0;
      const p=this.sp[s];p.setAttribute("d",`M${GX.nut},${gsy(s,GX.nut)} L${x0},${y0} Q${(x0+GBR)/2},${(y0+yb)/2+off*2} ${GBR},${yb} L${GBR+38},${yb}`);
      p.setAttribute("stroke",a>.35?GC.glow:s>3?GC.wound:GC.nylon);
    }
    const sd=T-this.sd.t,D=this.sd.k==="D";let oy=0;
    if(this.sd.k&&sd<.8)oy=sd<.09?(D?-34+84*sd/.09:50-84*sd/.09):(D?50:-34)*Math.exp(-(sd-.09)/.12);
    this.rh.setAttribute("transform",`translate(0,${oy.toFixed(1)})`);
    for(const key in this.R){const r=this.R[key],[kx,ky]=RK[key],tx=RX[key],pc=pluckCurve(T-r.t);
      const ty=gsy(r.s,tx)+(key==="p"?-3+pc*18:(key==="c"?-8:3)-pc*18),d=`M${kx},${ky} L${tx},${ty}`;
      this.rf[key].o.setAttribute("d",d);this.rf[key].i.setAttribute("d",d);
      if(this.gl[key])this.gl[key].setAttribute("fill",pc>.15?"#1F6E5A":"#7A4E32");}
    let want;
    if(this.mode==="full")want=[0,20,GX.W,400];
    else{const sm=this.host.clientWidth<520,w=sm?470:640;let x=this.bx-(sm?170:250);x=Math.max(0,Math.min(GX.W-w,x));want=sm?[x,150,w,215]:[x,118,w,280]}
    if(!this.cam||this.cam[2]!==want[2])this.cam=want.slice();else this.cam=this.cam.map((v,i)=>v+(want[i]-v)*k*.8);
    const [cx,cy,cw,ch]=this.cam,vx=this.mir?GX.W-cx-cw:cx;
    this.main.setAttribute("viewBox",`${vx.toFixed(1)} ${cy} ${cw} ${ch}`);
    if(T<this.hot||this.amp.some(a=>a>.05))requestAnimationFrame(this.loop);else this.running=false;
  }
}

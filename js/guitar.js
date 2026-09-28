// Yamaha CM40 drawn to scale in "player view" (what you see looking down at the guitar in your lap):
// string 6 on top, headstock on the left. 650 mm scale = 1000 units, 52 mm nut, 19 frets,
// spruce top, nato neck, rosewood fingerboard. Both hands are jointed and animated from the
// same events the audio plays; a side view shows how each finger arches onto its string.
const GX={nut:150,L:1000,y:220,W:1410,fbEnd:836};
const gfx=n=>GX.nut+GX.L*(1-Math.pow(2,-n/12));   // fret wire x
const gfm=n=>n<=0?GX.nut-17:(gfx(n-1)+gfx(n))/2;  // middle of fret n
const gsp=x=>13+(x-GX.nut)/GX.L*4.8;               // 13 units ≈ 8.5 mm at the nut
const gsy=(s,x)=>GX.y+(3.5-s)*gsp(x);
const ghalf=x=>2.5*gsp(x)+8;                       // 52 mm neck at the nut
const GBR=GX.nut+GX.L;
const GBODY="M640,220 C640,110 690,70 770,70 C850,70 880,104 940,104 C1000,104 1040,34 1180,34 C1330,34 1394,120 1394,220 C1394,320 1330,406 1180,406 C1040,406 1000,336 940,336 C880,336 850,370 770,370 C690,370 640,330 640,220Z";
const GC={nylon:"#F7F3E8",wound:"#C4BDB0",wind:"#7E776B",glow:"#FFE08A"};
const SKIN={base:"#EDC3A1",lite:"#F7DCC4",line:"#9E6A4C"};
const STRW={1:1.3,2:1.6,3:2,4:2.2,5:2.6,6:3};
const FW={1:18,2:18.5,3:17.5,4:15.5};
const pluckCurve=t=>t<0||t>1.2?0:t<.05?t/.05:Math.exp(-(t-.05)/.11);
const RK={p:[994,106],i:[958,140],m:[984,146],a:[1009,149],c:[1032,150]};
const RX={p:915,i:952,m:979,a:1005,c:1030};
const rng=seed=>()=>(seed=(seed*16807)%2147483647)/2147483647;

function gDefs(id){
  const lg=(n,st,v=true)=>`<linearGradient id="${id}-${n}" x1="0" y1="0" x2="${v?0:1}" y2="${v?1:0}">${st.map(([o,c])=>`<stop offset="${o}" stop-color="${c}"/>`).join("")}</linearGradient>`;
  return `<defs>${lg("top",[[0,"#F3D7A2"],[.5,"#E5BF83"],[1,"#EECF95"]])}
  <radialGradient id="${id}-vig" cx=".56" cy=".5" r=".62"><stop offset=".68" stop-color="#3A2410" stop-opacity="0"/><stop offset="1" stop-color="#3A2410" stop-opacity=".3"/></radialGradient>
  ${lg("board",[[0,"#22150D"],[.5,"#3F2B1C"],[1,"#22150D"]])}${lg("neck",[[0,"#6A4122"],[.5,"#A46D40"],[1,"#6A4122"]])}
  ${lg("head",[[0,"#442915"],[.5,"#71482B"],[1,"#442915"]])}${lg("bone",[[0,"#FFFCF3"],[1,"#DCD1BA"]],false)}
  ${lg("bridge",[[0,"#22160E"],[.5,"#48331F"],[1,"#22160E"]])}${lg("gold",[[0,"#F2D68A"],[1,"#A9853A"]])}${lg("skin",[[0,SKIN.lite],[1,"#D9A27E"]])}
  <radialGradient id="${id}-hole" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#050302"/><stop offset=".85" stop-color="#1A110A"/><stop offset="1" stop-color="#3B2718"/></radialGradient>
  <clipPath id="${id}-b"><path d="${GBODY}"/></clipPath></defs>`;
}

function gStatic(id,mir){
  const u=n=>`url(#${id}-${n})`,tf=x=>mir?` transform="translate(${2*x},0) scale(-1,1)"`:"";
  const top=x=>GX.y-ghalf(x),bot=x=>GX.y+ghalf(x),e=GX.fbEnd,h0=ghalf(GX.nut),R=rng(7),R2=rng(11);
  let s=gDefs(id);
  s+=`<path d="${GBODY}" fill="#000" opacity=".35" transform="translate(4,10)"/><path d="${GBODY}" fill="${u("top")}"/>`;
  s+=`<g clip-path="${u("b")}" fill="none" stroke="#9C6B34">`;
  for(let y=36;y<=406;y+=4+R()*5){const dy=(R()-.5)*6;s+=`<path d="M630,${y.toFixed(1)} Q1010,${(y+dy).toFixed(1)} 1400,${(y+dy*.4).toFixed(1)}" stroke-width="${(.5+R()*1.2).toFixed(2)}" opacity="${(R()*.14+.03).toFixed(2)}"/>`}
  s+=`</g><path d="${GBODY}" fill="${u("vig")}"/><path d="${GBODY}" fill="none" stroke="#3B2413" stroke-width="10"/><path d="${GBODY}" fill="none" stroke="#F4EAD4" stroke-width="6"/>`;
  const hx=895,hy=GX.y;
  s+=`<circle cx="${hx}" cy="${hy}" r="90" fill="none" stroke="#3A2414" stroke-width="3"/>`;
  [[84,"#2F4F3E","3 2",5],[79,"#D8B169","2 2",4],[74,"#8A552A","4 2",5]].forEach(([r,c,da,w])=>s+=`<circle cx="${hx}" cy="${hy}" r="${r}" fill="none" stroke="#3A2414" stroke-width="${w+1}"/><circle cx="${hx}" cy="${hy}" r="${r}" fill="none" stroke="${c}" stroke-width="${w}" stroke-dasharray="${da}"/>`);
  s+=`<circle cx="${hx}" cy="${hy}" r="69" fill="none" stroke="#3A2414" stroke-width="2"/><circle cx="${hx}" cy="${hy}" r="64" fill="${u("hole")}"/>`;
  s+=`<rect x="1126" y="132" width="78" height="176" rx="12" fill="#000" opacity=".28" transform="translate(3,6)"/><rect x="1126" y="132" width="78" height="176" rx="12" fill="${u("bridge")}"/><rect x="1162" y="146" width="36" height="148" rx="5" fill="#5A3F28"/><rect x="1144" y="142" width="7" height="156" rx="2" fill="${u("bone")}"/>`;
  s+=`<path d="M22,148 L${GX.nut},${GX.y-h0-5} L${GX.nut},${GX.y+h0+5} L22,292 Q8,220 22,148Z" fill="${u("head")}"/>`;
  s+=`<rect x="34" y="150" width="104" height="6" rx="2" fill="${u("gold")}"/><rect x="34" y="284" width="104" height="6" rx="2" fill="${u("gold")}"/><rect x="40" y="182" width="96" height="18" rx="9" fill="#0E0906"/><rect x="40" y="240" width="96" height="18" rx="9" fill="#0E0906"/>`;
  [58,87,116].forEach(x=>{s+=`<rect x="${x-5}" y="181" width="10" height="20" rx="3" fill="#F2ECDD"/><rect x="${x-5}" y="239" width="10" height="20" rx="3" fill="#F2ECDD"/><rect x="${x-2}" y="114" width="4" height="38" fill="${u("gold")}"/><rect x="${x-2}" y="288" width="4" height="38" fill="${u("gold")}"/><ellipse cx="${x}" cy="108" rx="11" ry="14" fill="#F1E8D2" stroke="#BDB08F"/><ellipse cx="${x}" cy="332" rx="11" ry="14" fill="#F1E8D2" stroke="#BDB08F"/>`});
  s+=`<path d="M${GX.nut},${top(GX.nut)-5} L700,${top(700)-5} L700,${bot(700)+5} L${GX.nut},${bot(GX.nut)+5}Z" fill="${u("neck")}"/>`;
  s+=`<path d="M640,${top(640)} L${e},${top(e)} L${e},${bot(e)} L640,${bot(640)}Z" fill="#000" opacity=".25" transform="translate(2,8)"/>`;
  s+=`<path d="M${GX.nut},${top(GX.nut)} L${e},${top(e)} L${e},${bot(e)} L${GX.nut},${bot(GX.nut)}Z" fill="${u("board")}"/><g fill="none" stroke="#6A4A33">`;
  for(let i=0;i<14;i++){const f=R2();s+=`<path d="M${GX.nut},${(GX.y+(f-.5)*70).toFixed(1)} L${e},${(GX.y+(f-.5)*84).toFixed(1)}" stroke-width="${(.5+R2()).toFixed(2)}" opacity="${(.08+R2()*.12).toFixed(2)}"/>`}
  s+=`</g>`;
  for(let n=1;n<=19;n++){const x=gfx(n);s+=`<line x1="${x}" y1="${top(x)+1}" x2="${x}" y2="${bot(x)-1}" stroke="#8E8C86" stroke-width="3.6"/><line x1="${x-.7}" y1="${top(x)+1}" x2="${x-.7}" y2="${bot(x)-1}" stroke="#F5F5F0" stroke-width="1.1"/>`}
  [5,7,9,15].forEach(n=>s+=`<circle cx="${gfm(n)}" cy="${GX.y}" r="3.6" fill="#E4D6BC" opacity=".55"/>`);
  s+=`<circle cx="${gfm(12)}" cy="${GX.y-24}" r="3.6" fill="#E4D6BC" opacity=".55"/><circle cx="${gfm(12)}" cy="${GX.y+24}" r="3.6" fill="#E4D6BC" opacity=".55"/>`;
  s+=`<rect x="${GX.nut-7}" y="${top(GX.nut)-1}" width="8" height="${2*h0+2}" rx="1.5" fill="${u("bone")}"/>`;
  const post={6:[58,191],5:[87,191],4:[116,191],3:[116,249],2:[87,249],1:[58,249]};
  for(let st=1;st<=6;st++){const [px,py]=post[st];s+=`<line x1="${GX.nut}" y1="${gsy(st,GX.nut)}" x2="${px}" y2="${py}" stroke="${st>3?GC.wound:GC.nylon}" stroke-width="${STRW[st]}"/>`}
  [1,3,5,7,9,12,15].forEach(n=>{const x=gfm(n);s+=`<text x="${x}" y="${top(x)-10}" text-anchor="middle" font-size="14" font-family="IBM Plex Mono,monospace" fill="#A8977C"${tf(x)}>${n}</text>`});
  return s;
}

function gDyn(id,mir){
  const tf=x=>mir?` transform="translate(${2*x},0) scale(-1,1)"`:"";
  let s=`<g class="gstr">`+[6,5,4,3,2,1].map(st=>{const w=STRW[st],wd=st>3,c=wd?GC.wound:GC.nylon;return `<g data-s="${st}"><path class="sh" fill="none" stroke="#000" stroke-width="${w+.8}" opacity=".3" transform="translate(2,4)"/><path class="env" fill="${c}" opacity="0"/><path class="co" fill="none" stroke="${c}" stroke-width="${w}"/>${wd?`<path class="wd" fill="none" stroke="${GC.wind}" stroke-width="${(w*.75).toFixed(2)}" stroke-dasharray="1 1.4"/>`:`<path class="wd" fill="none" stroke="#fff" stroke-width=".5" opacity=".7"/>`}</g>`}).join("")+`</g><g class="gmk"></g>`;
  s+=`<ellipse class="gth" rx="30" ry="12" fill="none" stroke="${SKIN.base}" stroke-width="3" stroke-dasharray="6 5" opacity=".85"/>`;
  s+=`<g class="glh"><path class="gbk" fill="url(#${id}-skin)" stroke="${SKIN.line}" stroke-width="2.2"/><g class="gkn">${[1,2,3,4].map(()=>`<ellipse rx="11" ry="9" fill="${SKIN.lite}" stroke="${SKIN.line}" stroke-width=".8" opacity=".9"/>`).join("")}</g>`;
  [4,3,2,1].forEach(g=>s+=fingerSVG(`gf" data-g="${g}`,FW[g],`var(--f${g})`));
  s+=`</g><g class="grh"><path d="M1270,-60 L1150,-60 L996,70 L1066,98Z" fill="url(#${id}-skin)" stroke="${SKIN.line}" stroke-width="2.2"/>`;
  s+=`<path d="M984,70 Q1052,56 1072,98 L1048,156 Q990,168 942,150 L958,98Z" fill="url(#${id}-skin)" stroke="${SKIN.line}" stroke-width="2.2"/>`;
  s+=[["i",958,140],["m",984,146],["a",1009,149],["c",1032,150]].map(([,x,y])=>`<ellipse cx="${x}" cy="${y}" rx="10" ry="8" fill="${SKIN.lite}" stroke="${SKIN.line}" stroke-width=".8"/>`).join("");
  ["c","a","m","i","p"].forEach(k=>s+=fingerSVG(`grf" data-k="${k}`,k==="p"?20:k==="c"?14:16,null));
  [["p",1004,100],["i",958,126],["m",984,130],["a",1009,133]].forEach(([k,x,y])=>s+=`<text class="gl" data-k="${k}" x="${x}" y="${y}" text-anchor="middle" font-size="15" font-weight="700" font-family="IBM Plex Mono,monospace" fill="#7A4E32"${tf(x)}>${k}</text>`);
  return s+`</g>`;
}
function fingerSVG(cls,w,nail){
  return `<g class="${cls}"><ellipse class="sd" rx="10" ry="6" fill="#000"/><path class="o" fill="none" stroke="${SKIN.line}" stroke-width="${w+4}" stroke-linecap="round" stroke-linejoin="round"/><path class="i" fill="none" stroke="${SKIN.base}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/><path class="cr" fill="none" stroke="${SKIN.line}" stroke-width="1.3" opacity=".55"/><rect class="nl" x="-5.5" y="-7" width="11" height="13" rx="5" fill="${nail||"#F6E3D3"}" stroke="${nail?"#fff":SKIN.line}" stroke-width="${nail?1.6:.8}"/></g>`;
}
// knuckle → joint → joint → tip, bowed slightly so the finger reads as curved, not a stick
function placeFinger(E,kx,ky,tx,ty,bow,side,shadow){
  const dx=tx-kx,dy=ty-ky,L=Math.hypot(dx,dy)||1,ux=dx/L,uy=dy/L;let px=-uy,py=ux;if(px*side<0){px=-px;py=-py}
  const P=[kx+dx*.48+px*bow,ky+dy*.48+py*bow],D=[kx+dx*.8+px*bow*.55,ky+dy*.8+py*bow*.55];
  const d=`M${kx.toFixed(1)},${ky.toFixed(1)} L${P[0].toFixed(1)},${P[1].toFixed(1)} L${D[0].toFixed(1)},${D[1].toFixed(1)} L${tx.toFixed(1)},${ty.toFixed(1)}`;
  E.o.setAttribute("d",d);E.i.setAttribute("d",d);
  const c=(p,r)=>`M${(p[0]+px*r).toFixed(1)},${(p[1]+py*r).toFixed(1)} L${(p[0]-px*r).toFixed(1)},${(p[1]-py*r).toFixed(1)}`;
  E.cr.setAttribute("d",c(P,7)+" "+c(D,6));
  const ang=Math.atan2(ty-D[1],tx-D[0])*180/Math.PI-90;
  E.nl.setAttribute("transform",`translate(${(tx-ux*4).toFixed(1)},${(ty-uy*4).toFixed(1)}) rotate(${ang.toFixed(1)})`);
  if(shadow){E.sd.setAttribute("cx",tx+shadow[0]);E.sd.setAttribute("cy",ty+shadow[1]);E.sd.setAttribute("opacity",shadow[2])}else E.sd.setAttribute("opacity",0);
}
function ik2(ax,ay,bx,by,l1,l2){
  const dx=bx-ax,dy=by-ay,d=Math.min(Math.hypot(dx,dy),l1+l2-.01),a=Math.atan2(dy,dx),c=Math.acos(Math.max(-1,Math.min(1,(l1*l1+d*d-l2*l2)/(2*l1*d))));
  const p=ang=>[ax+l1*Math.cos(ang),ay+l1*Math.sin(ang)],p1=p(a+c),p2=p(a-c);return p1[1]<p2[1]?p1:p2;
}
// Cross-section of the neck at the hand: strings as dots, fingers arching down onto them
function sideSVG(m,bar,harm){
  const X=s=>82+(6-s)*24,by=112;  // ≈2.7 px per mm, so finger lengths stay true
  let s=`<rect width="360" height="236" fill="#0E1320"/><text x="180" y="22" text-anchor="middle" font-size="14" font-weight="700" fill="#DCCBAE">من الجنب: شوف قوس الأصابع</text>`;
  s+=`<path d="M66,${by+12} Q142,${by+100} 218,${by+12}Z" fill="#8C5B34"/><rect x="66" y="${by}" width="152" height="13" rx="3" fill="#3A2618"/>`;
  s+=`<ellipse cx="150" cy="${by+74}" rx="26" ry="14" fill="${SKIN.base}" stroke="${SKIN.line}" stroke-width="2"/><text x="150" y="${by+108}" text-anchor="middle" font-size="11" fill="#CDBFA6">الإبهام ورا الرقبة</text>`;
  
  const sy=st=>by-3-STRW[st];
  for(let st=1;st<=6;st++)s+=`<circle cx="${X(st)}" cy="${sy(st)}" r="${STRW[st]+1.6}" fill="${st>3?GC.wound:GC.nylon}"/><text x="${X(st)}" y="${by+30}" text-anchor="middle" font-size="10" fill="#8F826C" font-family="IBM Plex Mono,monospace">${st}</text>`;
  const fing=[],keys=Object.keys(m);
  // the whole hand comes round under the neck for the bass strings, so each finger keeps its arch
  const reach=keys.length?Math.min(...keys.map(g=>X(m[g][0]))):(bar?X(bar.bf):150),mcp=(g,tx)=>[Math.min(292,reach+118)+(g-1)*4,150+(g-1)*7];
  const mx=Math.min(292,reach+118);
  s+=`<path d="M${mx-16},236 L${mx-16},${162} Q${mx-10},${140} ${mx+22},${138} L360,138 L360,236Z" fill="${SKIN.base}" stroke="${SKIN.line}" stroke-width="2"/>`;
  if(bar)fing.push(`<path d="M272,160 Q250,${by-14} 226,${by-10} L${X(bar.bf)-8},${by-10}" fill="none" stroke="${SKIN.line}" stroke-width="18" stroke-linecap="round"/><path d="M272,160 Q250,${by-14} 226,${by-10} L${X(bar.bf)-8},${by-10}" fill="none" stroke="${SKIN.base}" stroke-width="14" stroke-linecap="round"/><circle cx="${X(bar.bf)-8}" cy="${by-10}" r="6" fill="var(--f1)" stroke="#fff" stroke-width="1.5"/>`);
  keys.sort((a,b)=>b-a).forEach(g=>{
    const [st]=m[g],tx=X(st),ty=sy(st)-STRW[st]-(harm?9:6),D=[tx+4,ty-48],M=mcp(g,tx),P=ik2(M[0],M[1],D[0],D[1],118,66),w=FW[g]*.72;
    const d=`M${M[0]},${M[1]} L${P[0].toFixed(1)},${P[1].toFixed(1)} L${D[0]},${D[1]} L${tx},${ty}`;
    fing.push(`<path d="${d}" fill="none" stroke="${SKIN.line}" stroke-width="${w+4}" stroke-linecap="round" stroke-linejoin="round"${harm?' opacity=".75"':""}/><path d="${d}" fill="none" stroke="${SKIN.base}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/><circle cx="${tx}" cy="${ty-2}" r="6" fill="var(--f${g})" stroke="#fff" stroke-width="1.5"/><text x="${P[0].toFixed(1)}" y="${(P[1]-12).toFixed(1)}" text-anchor="middle" font-size="12" font-weight="700" fill="var(--f${g})">${g}</text>`)});
  s+=fing.join("");
  s+=`<text x="180" y="226" text-anchor="middle" font-size="11" fill="#CDBFA6">${Object.keys(m).length||bar?(harm?"لمس خفيف فوق السلك بدون كبس":"طرف الإصبع واقف، وما بيلمس الوتر اللي جنبه"):"ولا إصبع كابس: كل الأوتار مفتوحة"}</text>`;
  return s;
}

class GuitarView{
  constructor(host){
    this.host=host;this.id="g"+Math.random().toString(36).slice(2,8);
    this.mode=matchMedia("(min-width:900px)").matches?"full":"left";this.mir=false;
    this.amp=new Array(7).fill(0);this.ph=new Array(7).fill(0);this.st=new Array(7).fill(GX.nut);
    this.tb=1;this.bx=gfm(1);this.bar=null;this.m={};this.harm=false;
    this.F={};[1,2,3,4].forEach(g=>{const x=gfm(g),y=gsy(1,x)+20;this.F[g]={x,y,tx:x,ty:y,pr:0,tp:0}});
    this.R={p:{s:5,t:-9},i:{s:3,t:-9},m:{s:2,t:-9},a:{s:1,t:-9},c:{s:1,t:-9}};this.sd={k:null,t:-9};
    this.loop=this.loop.bind(this);this.render();
  }
  render(){
    const m=this.mir,id=this.id;
    this.host.innerHTML=`<div class="pats gcams"><button class="chip" data-m="full">الجيتار كامل</button><button class="chip" data-m="left">زوم على الإيد الشمال</button><button class="chip gmirb">${m?"زي ما بتشوفه انت":"من قدّام (زي الأستاذ)"}</button></div>
    <div class="gstage"><svg class="gmain" viewBox="0 20 ${GX.W} 400" role="img" aria-label="الجيتار والإيدين وهم بيعزفوا"><g id="${id}"><g${m?` transform="translate(${GX.W},0) scale(-1,1)"`:""}>${gStatic(id,m)}${gDyn(id,m)}</g></g></svg>
    <div class="gsub"><svg class="gside" viewBox="0 0 360 236" role="img" aria-label="منظر جانبي للأصابع على الأوتار"></svg><svg class="grhv" viewBox="${m?GX.W-1230:810} 20 420 330" aria-hidden="true"><use href="#${id}"/></svg></div></div>`;
    const q=s=>this.host.querySelector(s);
    this.main=q(".gmain");this.stage=q(".gstage");this.bk=q(".gbk");this.kn=[...this.host.querySelectorAll(".gkn ellipse")];this.th=q(".gth");this.mk=q(".gmk");this.rh=q(".grh");this.side=q(".gside");
    const parts=g=>({g,sd:g.querySelector(".sd"),o:g.querySelector(".o"),i:g.querySelector(".i"),cr:g.querySelector(".cr"),nl:g.querySelector(".nl")});
    this.sp={};this.host.querySelectorAll(".gstr > g").forEach(g=>this.sp[+g.dataset.s]={sh:g.querySelector(".sh"),env:g.querySelector(".env"),co:g.querySelector(".co"),wd:g.querySelector(".wd")});
    this.fg={};this.host.querySelectorAll(".gf").forEach(g=>this.fg[+g.dataset.g]=parts(g));
    this.rf={};this.host.querySelectorAll(".grf").forEach(g=>this.rf[g.dataset.k]=parts(g));
    this.gl={};this.host.querySelectorAll(".gl").forEach(t=>this.gl[t.dataset.k]=t);
    this.cam=null;
    this.host.querySelectorAll(".gcams [data-m]").forEach(b=>b.onclick=()=>{this.mode=b.dataset.m;this.cam=null;this.chips()});
    q(".gmirb").onclick=()=>{this.mir=!this.mir;this.render();if(this.lastE)this.show(this.lastE)};
    this.side.innerHTML=sideSVG(this.m,this.bar,this.harm);
    this.chips();
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
    this.bar=bar?{fr:bar.barre,bf:bar.bf}:null;this.m=m;this.harm=!!e.h;
    this.st=new Array(7).fill(GX.nut);
    [1,2,3,4].forEach(g=>{const F=this.F[g];
      if(bar&&g===1){const w=gfx(bar.barre)-gfx(bar.barre-1);F.tx=gfx(bar.barre)-w*.3;F.ty=gsy(1,F.tx)+10;F.tp=1;for(let s=1;s<=bar.bf;s++)this.st[s]=Math.max(this.st[s],gfx(bar.barre))}
      else if(m[g]){const [s,fr]=m[g],w=gfx(fr)-gfx(fr-1);F.tx=e.h?gfx(fr)-1:gfx(fr)-Math.min(15,w*.3);F.ty=gsy(s,F.tx);F.tp=e.h?.5:1;if(!e.h)this.st[s]=Math.max(this.st[s],gfx(fr))}
      else{F.tx=gfm(this.tb+g-1);F.ty=gsy(1,F.tx)+22;F.tp=0}});
    let mk="";const mx=GX.nut-26;
    if(e.c)CH[e.c].f.forEach((f,i)=>{const y=gsy(6-i,GX.nut);if(f<0)mk+=`<path d="M${mx-6},${y-6} L${mx+6},${y+6} M${mx+6},${y-6} L${mx-6},${y+6}" stroke="#FF6A50" stroke-width="3.5" stroke-linecap="round"/>`;else if(f===0)mk+=`<circle cx="${mx}" cy="${y}" r="6.5" fill="none" stroke="#fff" stroke-width="2.5"/>`});
    else (e.n||[]).forEach(([s,f])=>{if(!f)mk+=`<circle cx="${mx}" cy="${gsy(s,GX.nut)}" r="7" fill="none" stroke="#fff" stroke-width="3"/>`});
    this.mk.innerHTML=mk;
    this.side.innerHTML=sideSVG(m,this.bar,this.harm);
  }
  hit(e){
    const T=performance.now()/1000;this.wake();
    if(e.c&&e.k){this.sd={k:e.k,t:T};const c=CH[e.c],big=(e.v||.28)>.2;for(let s=1;s<=6;s++)if(c.f[6-s]>=0&&(e.k==="D"||s<=4))this.vib(s,big?5:3)}
    (e.n||[]).forEach(([s,f,g,rh])=>{this.vib(s,e.sl?2.5:5);if(e.sl)return;let k=(rh||"")[0];if(k==="e")k="c";if(!k||!"pimac".includes(k))k=s>=4?"p":({3:"i",2:"m",1:"a"})[s];this.R[k]={s,t:T}});
  }
  vib(s,a){this.amp[s]=a;this.ph[s]=Math.random()*6}
  loop(now){
    if(!this.host.isConnected){this.running=false;return}
    const dt=Math.min(.05,(now-(this.last||now))/1000);this.last=now;
    const k=1-Math.exp(-dt/.06),T=now/1000;
    this.bx+=(gfm(this.tb)-this.bx)*k;
    const K=g=>{const x=this.bx-14+(g-1)*28;return [x,GX.y+ghalf(x)+26]};
    [1,2,3,4].forEach(g=>{
      const F=this.F[g],E=this.fg[g];F.x+=(F.tx-F.x)*k*1.5;F.y+=(F.ty-F.y)*k*1.5;F.pr+=(F.tp-F.pr)*k*1.5;
      const [kx,ky]=K(g);
      if(g===1&&this.bar){const x=F.x,ty=gsy(this.bar.bf,x)-8,d=`M${kx},${ky} L${x},${gsy(1,x)+12} L${x},${ty}`;
        E.o.setAttribute("d",d);E.i.setAttribute("d",d);E.cr.setAttribute("d","");E.nl.setAttribute("transform",`translate(${x},${ty+5}) rotate(180)`);E.sd.setAttribute("opacity",0)}
      else placeFinger(E,kx,ky,F.x,F.y,6,-1,F.pr>.5?[3,5,.32]:[10,14,.14]);
      E.g.setAttribute("opacity",(.55+.45*Math.min(1,F.pr*1.4)).toFixed(2));
    });
    const k1=K(1),k4=K(4);
    this.bk.setAttribute("d",`M${k1[0]-16},${k1[1]-4} L${k4[0]+14},${k4[1]-4} Q${k4[0]+38},${k4[1]+40} ${k4[0]+24},${k4[1]+92} L${k4[0]},500 L${k1[0]-132},500 L${k1[0]-48},${k1[1]+86} Q${k1[0]-44},${k1[1]+22} ${k1[0]-16},${k1[1]-4}Z`);
    this.kn.forEach((el,i)=>{const [x,y]=K(i+1);el.setAttribute("cx",x);el.setAttribute("cy",y)});
    this.th.setAttribute("cx",K(2)[0]+10);this.th.setAttribute("cy",GX.y);
    for(let s=1;s<=6;s++){
      this.amp[s]*=Math.exp(-dt/.6);const a=this.amp[s],x0=this.st[s],y0=gsy(s,x0),yb=gsy(s,GBR),S=this.sp[s];
      const d=`M${GX.nut},${gsy(s,GX.nut)} L${x0},${y0} L${GBR},${yb} L${GBR+38},${yb}`;
      S.co.setAttribute("d",d);S.sh.setAttribute("d",d);S.wd.setAttribute("d",d);
      if(a>.08){const A=a*(.82+.18*Math.sin(T*55+this.ph[s])),xm=(x0+GBR)/2,ym=(y0+yb)/2;
        S.env.setAttribute("d",`M${x0},${y0} Q${xm},${ym+A*2} ${GBR},${yb} Q${xm},${ym-A*2} ${x0},${y0}Z`);S.env.setAttribute("opacity",Math.min(.6,.12+a/9).toFixed(2));S.co.setAttribute("stroke",GC.glow)}
      else{S.env.setAttribute("opacity",0);S.co.setAttribute("stroke",s>3?GC.wound:GC.nylon)}
    }
    const sd=T-this.sd.t,D=this.sd.k==="D";let oy=0;
    if(this.sd.k&&sd<.8)oy=sd<.09?(D?-34+84*sd/.09:50-84*sd/.09):(D?50:-34)*Math.exp(-(sd-.09)/.12);
    this.rh.setAttribute("transform",`translate(0,${oy.toFixed(1)})`);
    for(const key in this.R){const r=this.R[key],[kx,ky]=RK[key],tx=RX[key],pc=pluckCurve(T-r.t);
      const ty=gsy(r.s,tx)+(key==="p"?-3+pc*18:(key==="c"?-8:3)-pc*18);
      placeFinger(this.rf[key],kx,ky,tx,ty,key==="p"?-5:3,1,null);
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

// Event builders and the running tab lane used by the player.
// Event: {d beats, c chord, k "D"/"U" strum, v volume, n [[string,fret,finger,rhLabel]], h harmonic, sl "h"/"p", rh label, lab chord label, sec section}

// ---------- event builders ----------
const cf=(c,s)=>{const f=CH[c].f[6-s];return f<0?0:f};
const alt=c=>BASS[c]===4?5:4;
function patEv(bars,items,secs={}){
  const ev=[];
  bars.forEach((b,bi)=>{let pos=0;items.forEach(([k,d,rh,v],i)=>{
    const c=b[Math.min(b.length-1,Math.floor(pos/4*b.length+1e-9))],prev=ev[ev.length-1];
    ev.push({d,c,k:k==="-"?null:k,rh,v,lab:(!prev||prev.c!==c)?c:null,sec:i===0?secs[bi]:null});pos+=d})});
  return ev;
}
const CNT=["1","&","2","&","3","&","4","&"];
const P=(slots,lab)=>slots.map((k,i)=>[k,.5,lab?lab[i]:CNT[i]]);
const P4=P(["D","-","D","-","D","-","D","-"]);
const PPOP=P(["D","-","D","U","-","U","D","U"]);
// Arabic rhythms: dum = strong down, tak = light, direction follows the pendulum
const rhy=p=>[...p].map((k,i)=>[k==="D"?"D":k==="T"?(i%2?"U":"D"):"-",.5,k==="D"?"دُم":k==="T"?"تَك":"",k==="D"?.34:.17]);
function arpEv(prog,pat,d=.5){
  const ev=[];
  prog.forEach((c,ci)=>pat.forEach(([s,rh],i)=>{const st=s==="B"?BASS[c]:s==="B2"?alt(c):s;ev.push({d,c,n:[[st,cf(c,st),0,rh]],lab:i===0&&(ci===0||prog[ci-1]!==c)?c:null})}));
  return ev;
}
const melEv=(list,d=1)=>list.map(([s,f,g,rh,dd,x])=>Object.assign({d:dd||d,n:[[s,f,g,rh]]},x||{}));
const alt_im=list=>list.map(([s,f],i)=>[s,f,f,i%2?"m":"i"]);
const upDown=list=>{const u=alt_im(list),dn=alt_im([...list].reverse().slice(1));return [...u,...dn.map((x,i)=>i===dn.length-1?[...x.slice(0,4),2]:x)]};

// ---------- lane (running tab under the fretboard) ----------
function laneSVG(EV,bar){
  let x=30,acc=0,s="";const xs=[],y0=36,sh=13,H=y0+5*sh+26;
  EV.forEach((e,k)=>{
    const w=Math.max(20,e.d*40),cx=x+w/2;xs.push([x,w]);
    if(e.lab)s+=`<text x="${x+2}" y="14" font-size="12" font-weight="700" fill="var(--accent)">${e.lab}</text>`;
    if(e.sec)s+=`<text x="${x+2}" y="27" font-size="10" fill="var(--muted)">${e.sec}</text>`;
    if(e.k&&e.c){const D=e.k==="D",b=y0+5*sh,sw=(e.v||.28)>.2?2.4:1.4;s+=`<path d="M${cx} ${D?y0:b} V${D?b:y0}" stroke="var(--muted)" stroke-width="${sw}"/><path d="${D?`M${cx-4} ${b-6} L${cx} ${b} L${cx+4} ${b-6}`:`M${cx-4} ${y0+6} L${cx} ${y0} L${cx+4} ${y0+6}`}" fill="none" stroke="var(--muted)" stroke-width="${sw}"/>`}
    (e.n||[]).forEach(([st,f])=>{const y=y0+(st-1)*sh;s+=`<rect x="${cx-9}" y="${y-7}" width="18" height="14" fill="var(--card)"/><text x="${cx}" y="${y+4}" text-anchor="middle" font-size="11.5" font-weight="600" class="tn">${e.h?"◇"+f:f}</text>`});
    if(e.sl)s+=`<text x="${cx-12}" y="${y0-6}" font-size="11" font-style="italic" fill="var(--accent)">${e.sl}</text>`;
    const rh=e.rh!=null?e.rh:(e.n&&e.n.map(n=>n[3]).filter(Boolean).join(""));
    if(rh)s+=`<text x="${cx}" y="${H-6}" text-anchor="middle" font-size="11" fill="var(--accent)">${rh}</text>`;
    x+=w;acc+=e.d;
    if(Math.abs(acc/bar-Math.round(acc/bar))<1e-6&&k<EV.length-1)s+=`<line x1="${x}" y1="${y0}" x2="${x}" y2="${y0+5*sh}" stroke="var(--muted)" stroke-width="1.2"/>`;
  });
  const Wd=x+10;let head=`<svg viewBox="0 0 ${Wd} ${H}" width="${Wd}" height="${H}"><rect class="hl" x="-99" y="${y0-10}" width="20" height="${5*sh+20}" rx="5" fill="var(--soft)"/>`;
  SNAME.forEach((n,k)=>{const y=y0+k*sh;head+=`<text x="8" y="${y+4}" font-size="10" class="tl">${n}</text><line x1="20" y1="${y}" x2="${Wd-4}" y2="${y}" stroke="var(--line)"/>`});
  return {s:head+s+"</svg>",xs};
}


// The hardest stretch of a track: `n` steps with the most pressed-fret travel, crowded notes and chord changes.
// ponytail: a plain difficulty heuristic, not a musical analysis; good enough to pre-select a practice loop.
function hardSec(EV,n=8){
  if(EV.length<n*2)return null;
  let pf=0,pc=null;const sc=EV.map(e=>{let v=0;
    if(e.c){v=(CH[e.c].barre?3:1)+(pc&&pc!==e.c?2:0);pc=e.c}
    else if(e.n){const fr=e.n.map(x=>x[1]).filter(f=>f>0),hi=fr.length?Math.max(...fr):pf;v=e.n.length+Math.abs(hi-pf)/2+(hi>5?1:0)+(e.sl?1:0)+(e.d<1?.5:0);pf=hi}
    return v});
  let best=0,bi=0,sum=0;sc.forEach((v,i)=>{sum+=v;if(i>=n)sum-=sc[i-n];if(i>=n-1&&sum>best){best=sum;bi=i-n+1}});
  return [bi,bi+n-1];
}

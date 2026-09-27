// The coach: a character who plays each piece while the fretboard shows every finger move.
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
    if(e.k&&e.c){const D=e.k==="D",b=y0+5*sh,sw=(e.v||.28)>.2?2.4:1.4;s+=`<path d="M${cx} ${D?y0:b} V${D?b:y0}" stroke="var(--ink)" stroke-width="${sw}"/><path d="${D?`M${cx-4} ${b-6} L${cx} ${b} L${cx+4} ${b-6}`:`M${cx-4} ${y0+6} L${cx} ${y0} L${cx+4} ${y0+6}`}" fill="none" stroke="var(--ink)" stroke-width="${sw}"/>`}
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

// ---------- the widget ----------
W.coach=(el,cfg)=>{
  const tracks=cfg.tracks;
  let ti=0,EV=[],N=0,i=0,t=null,pa=0,pStart=0,B=null,last={},lane=null;
  el.innerHTML=`${tracks.length>1?`<div class="pats">${tracks.map((tr,k)=>`<button class="chip${k?"":" on"}" data-k="${k}">${tr.n}</button>`).join("")}</div>`:""}
  <p class="meta tdesc" style="margin-bottom:8px"></p>
  <div class="coach"><div class="chwrap">${CHAR_SVG}</div><div class="cstage"><div class="chead"><b class="mono cnow"></b><span class="meta cnext"></span><span class="meta csec"></span></div><div class="fbwrap cfb"></div>
  <div class="legend">${[1,2,3,4].map(n=>`<span><i style="background:var(--f${n})"></i>${n} ${["سبابة","وسطى","بنصر","خنصر"][n-1]}</span>`).join("")}<span>○ وتر مفتوح</span><span>× لا تعزفه</span></div></div></div>
  <div class="tabwrap lane"></div>
  <div class="ctrl"><button class="btn play">▶ خلّيه يعزف</button><button class="btn ghost prv">خطوة لورا</button><button class="btn ghost nxt">خطوة لقدّام</button><label class="meta">السرعة <input type="range" class="rng" min="30" max="160"><b class="mono v"></b></label><label class="meta"><input type="checkbox" class="lp" checked> كرّر</label><label class="meta"><input type="checkbox" class="turn"> هو بيعزف وبعدين أنا</label></div>`;
  const $=q=>el.querySelector(q);
  const btn=$(".play"),rng=$(".rng"),v=$(".v"),lp=$(".lp"),turn=$(".turn"),fbEl=$(".cfb"),laneEl=$(".lane"),ch=$(".chwrap svg");
  const beatMs=()=>60000/+rng.value;

  const vibS=s=>{const l=fbEl.querySelector(`.str[data-s="${s}"]`);if(!l)return;l.classList.remove("vib");l.getBoundingClientRect();l.classList.add("vib")};
  const bubble=on=>ch.querySelector(".bub").setAttribute("opacity",on?1:0);

  const show=k=>{
    const e=EV[k];if(!e)return;
    const m={};let bar=null;
    if(e.c){const c=CH[e.c];c.f.forEach((f,idx)=>{const g=c.g[idx];if(g&&f>0&&!(c.barre&&g===1&&f===c.barre))m[g]=[6-idx,f]});if(c.barre)bar=c}
    else (e.n||[]).forEach(([s,f,g])=>{if(g&&f>0)m[g]=[s,f]});
    [1,2,3,4].forEach(n=>{const g=fbEl.querySelector(`.fg[data-f="${n}"]`),c=g.querySelector("circle");
      if(bar&&n===1){g.style.opacity=0;return}
      if(m[n]){last[n]=m[n];const [x,y]=B.pos(m[n][0],m[n][1],e.h);g.style.transform=`translate(${x}px,${y}px)`;g.style.opacity=1;c.setAttribute("fill",e.h?"var(--paper)":`var(--f${n})`);g.querySelector("text").setAttribute("fill",e.h?`var(--f${n})`:"var(--f-ink)")}
      else g.style.opacity=last[n]?.18:0});
    const br=fbEl.querySelector(".barre");
    if(bar){const [x,ya]=B.pos(1,bar.barre),[,yb]=B.pos(bar.bf,bar.barre);br.setAttribute("x",x-12);br.setAttribute("y",Math.min(ya,yb)-13);br.setAttribute("height",Math.abs(ya-yb)+26);br.setAttribute("opacity",1)}else br.setAttribute("opacity",0);
    let mk="";
    if(e.c)CH[e.c].f.forEach((f,idx)=>{const [x,y]=B.pos(6-idx,0);if(f<0)mk+=`<text x="${x}" y="${y+5}" text-anchor="middle" font-size="15" font-weight="700" fill="var(--bad)">×</text>`;else if(f===0)mk+=`<circle cx="${x}" cy="${y}" r="6" fill="none" stroke="var(--ink)" stroke-width="1.6"/>`});
    else (e.n||[]).forEach(([s,f])=>{if(!f){const [x,y]=B.pos(s,0);mk+=`<circle cx="${x}" cy="${y}" r="7" fill="none" stroke="var(--accent)" stroke-width="2.5"/>`}});
    fbEl.querySelector(".marks").innerHTML=mk;
    let r="";const Yr=s=>B.pos(s,0)[1],rx=B.rx;
    if(e.c&&e.k){const c=CH[e.c],top=[6,5,4,3,2,1].find(s=>c.f[6-s]>=0),D=e.k==="D",y1=D?Yr(top):Yr(1),y2=D?Yr(1):Yr(4),sw=(e.v||.28)>.2?4:2.5;
      r+=`<path d="M${rx} ${y1} V${y2}" stroke="var(--accent)" stroke-width="${sw}" stroke-linecap="round"/><path d="M${rx-8} ${y2+(D?-10:10)} L${rx} ${y2} L${rx+8} ${y2+(D?-10:10)}" fill="none" stroke="var(--accent)" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"/>`;
      if(e.rh)r+=`<text x="${rx-22}" y="${(y1+y2)/2+4}" text-anchor="middle" font-size="12" font-weight="700" fill="var(--accent)">${e.rh}</text>`}
    (e.n||[]).forEach(([s,f,g,l])=>{r+=dot(rx,Yr(s),l||"•","var(--ink)","var(--paper)",11)});
    fbEl.querySelector(".rh").innerHTML=r;
    let nm="";
    if(e.c)nm=e.c;else if(e.n){const [s,f]=e.n[0];if(e.h)nm="هارمونك";else{const n=noteOf(s,f);nm=NOTE_AR[n]?`${NOTE_AR[n]} · ${n}`:n}}
    $(".cnow").textContent=nm;
    let nx="";if(e.c)for(let j=k+1;j<N;j++){if(EV[j].c&&EV[j].c!==e.c){nx=EV[j].c;break}}
    $(".cnext").textContent=nx?"الجاي: "+nx:"";
    let sec="";for(let j=k;j>=0;j--)if(EV[j].sec){sec=EV[j].sec;break}
    $(".csec").textContent=sec;
    const [hx,hw]=lane.xs[k],hl=laneEl.querySelector(".hl");hl.setAttribute("x",hx);hl.setAttribute("width",hw);
    laneEl.scrollLeft=Math.max(0,hx-laneEl.clientWidth/2);
  };

  const sound=e=>{
    if(e.c&&e.k){strum(CH[e.c],e.k,e.v||.28);const c=CH[e.c];[1,2,3,4,5,6].forEach(s=>{if(c.f[6-s]>=0&&(e.k==="D"||s<=4))vibS(s)})}
    (e.n||[]).forEach(([s,f])=>{let fr=mf(OPEN_MIDI[s-1]+(e.h?0:f));if(e.h)fr*=({12:2,7:3,5:4})[f]||1;pluck(fr,0,e.h?3:1.8,e.sl?.3:.5,{cut:e.h?1500:2600});vibS(s)});
    if(!e.sl&&(e.k||e.n)){const ra=ch.querySelector(".ra");ra.style.transform=`rotate(${e.k==="U"?-9:e.k==="D"?11:4}deg)`;setTimeout(()=>ra.style.transform="",110)}
  };

  const stop=()=>{clearTimeout(t);t=null;btn.textContent="▶ خلّيه يعزف";bubble(false)};
  const tick=()=>{
    if(i>=N){if(lp.checked){i=0;pa=0;pStart=0}else{stop();return}}
    const e=EV[i];show(i);sound(e);
    const hd=ch.querySelector(".hd");hd.classList.add("bob");setTimeout(()=>hd.classList.remove("bob"),110);
    pa+=e.d;i++;
    const w=e.d*beatMs(),ph=tracks[ti].phrase||4;
    if(turn.checked&&pa>=ph-1e-6){pa=0;const ps=pStart;pStart=i;
      t=setTimeout(()=>{show(ps);bubble(true);const c=ac(),bm=beatMs()/1000;for(let b=0;b<ph;b++)click(c.currentTime+.02+b*bm,b===0);t=setTimeout(()=>{bubble(false);tick()},ph*beatMs())},w);return}
    t=setTimeout(tick,w);
  };

  const load=k=>{
    stop();ti=k;const tr=tracks[k];EV=tr.ev;N=EV.length;i=0;pa=0;pStart=0;last={};
    rng.value=tr.bpm||60;v.textContent=rng.value;$(".tdesc").innerHTML=tr.d||"";
    let mx=0;EV.forEach(e=>{(e.n||[]).forEach(n=>mx=Math.max(mx,n[1]));if(e.c)CH[e.c].f.forEach(f=>mx=Math.max(mx,f))});
    B=fbBase(Math.min(12,Math.max(4,mx+1)),{rh:true});
    fbEl.innerHTML=B.s+`<g class="marks"></g><rect class="barre" x="-99" y="0" width="24" height="10" rx="12" fill="var(--f1)" opacity="0"/>${[1,2,3,4].map(n=>`<g class="fg" data-f="${n}" style="opacity:0"><circle r="13" fill="var(--f${n})" stroke="var(--f${n})" stroke-width="3"/><text y="4.5" text-anchor="middle" font-size="13" font-weight="700" fill="var(--f-ink)" font-family="IBM Plex Mono,monospace">${n}</text></g>`).join("")}<g class="rh"></g></svg>`+FB_CAP;
    lane=laneSVG(EV,tr.bar||4);laneEl.innerHTML=lane.s;
    show(0);
  };

  if(tracks.length>1)el.querySelector(".pats").onclick=e=>{const b=e.target.closest(".chip");if(!b)return;el.querySelectorAll(".pats .chip").forEach(x=>x.classList.toggle("on",x===b));load(+b.dataset.k)};
  btn.onclick=()=>{if(t){stop();return}stopAll();if(i>=N)i=0;pa=0;pStart=i;btn.textContent="■ وقّف";tick()};
  $(".nxt").onclick=()=>{stop();if(i>=N)i=0;show(i);sound(EV[i]);i++};
  $(".prv").onclick=()=>{stop();i=Math.max(0,i-2);show(i);sound(EV[i]);i++};
  rng.oninput=()=>v.textContent=rng.value;
  STOP.add(()=>{if(t)stop()});
  load(0);
};

// ================= music core =================
const OPEN_MIDI=[64,59,55,50,45,40]; // string 1 (high e) .. string 6 (low E)
const NOTE_EN=["C","C#","D","D#","E","F","F#","G","G#","A","A#","B"];
const NOTE_AR={C:"دو",D:"ري",E:"مي",F:"فا",G:"صول",A:"لا",B:"سي"};
const mf=m=>440*Math.pow(2,(m-69)/12);
const noteOf=(s,f)=>NOTE_EN[(OPEN_MIDI[s-1]+f)%12];
const SNAME=["e","B","G","D","A","E"];

// chords: f/g arrays go string 6 → string 1. -1 mute, 0 open. g = finger. barre = fret, bf = barre from string
const CH={
  Em:{f:[0,2,2,0,0,0],g:[0,2,3,0,0,0],ar:"مي صغير"},
  Am:{f:[-1,0,2,2,1,0],g:[0,0,2,3,1,0],ar:"لا صغير"},
  E:{f:[0,2,2,1,0,0],g:[0,2,3,1,0,0],ar:"مي كبير"},
  A:{f:[-1,0,2,2,2,0],g:[0,0,1,2,3,0],ar:"لا كبير"},
  D:{f:[-1,-1,0,2,3,2],g:[0,0,0,1,3,2],ar:"ري كبير"},
  Dm:{f:[-1,-1,0,2,3,1],g:[0,0,0,2,3,1],ar:"ري صغير"},
  C:{f:[-1,3,2,0,1,0],g:[0,3,2,0,1,0],ar:"دو كبير"},
  G:{f:[3,2,0,0,0,3],g:[2,1,0,0,0,3],ar:"صول كبير"},
  Fmaj7:{f:[-1,-1,3,2,1,0],g:[0,0,3,2,1,0],ar:"فا سهل"},
  E7:{f:[0,2,0,1,0,0],g:[0,2,0,1,0,0],ar:"مي سابع"},
  F:{f:[1,3,3,2,1,1],g:[1,3,4,2,1,1],ar:"فا بار",barre:1,bf:6},
  Bm:{f:[-1,2,4,4,3,2],g:[0,1,3,4,2,1],ar:"سي صغير",barre:2,bf:5},
  B7:{f:[-1,2,1,2,0,2],g:[0,2,1,3,0,4],ar:"سي سابع"},
  "F#":{f:[2,4,4,3,2,2],g:[1,3,4,2,1,1],ar:"فا دييز (بار 2)",barre:2,bf:6},
  Gm:{f:[3,5,5,3,3,3],g:[1,3,4,1,1,1],ar:"صول صغير (بار 3)",barre:3,bf:6},
  H5:{f:[-1,-1,-1,5,5,5],g:[0,0,0,1,1,1],ar:"نص بار 5",barre:5,bf:3},
  H7:{f:[-1,-1,-1,7,7,7],g:[0,0,0,1,1,1],ar:"نص بار 7",barre:7,bf:3},
  H8:{f:[-1,-1,-1,8,8,8],g:[0,0,0,1,1,1],ar:"نص بار 8",barre:8,bf:3},
};
const BASS={"F#":6,Gm:6,Em:6,E:6,E7:6,G:6,F:6,Am:5,A:5,C:5,B7:5,Bm:5,D:4,Dm:4,Fmaj7:4,H5:3,H7:3,H8:3};

let ctx;
const ac=()=>{ctx=ctx||new (window.AudioContext||window.webkitAudioContext)();if(ctx.state==="suspended")ctx.resume();return ctx};
// Karplus-Strong: sounds like a plucked string, not a beep
function pluck(freq,when=0,dur=2.2,vol=.5,o={}){
  const c=ac(),sr=c.sampleRate,len=Math.floor(sr*dur),buf=c.createBuffer(1,len,sr),d=buf.getChannelData(0);
  const N=Math.round(sr/freq),ring=new Float32Array(N);
  for(let i=0;i<N;i++)ring[i]=Math.random()*2-1;
  for(let i=0,p=0;i<len;i++){const nx=(p+1)%N;d[i]=ring[p];ring[p]=.498*(ring[p]+ring[nx]);p=nx}
  const src=c.createBufferSource(),g=c.createGain(),lp=c.createBiquadFilter(),t0=c.currentTime+when;
  lp.type="lowpass";lp.frequency.value=o.cut||2600;g.gain.value=vol;
  src.buffer=buf;src.connect(lp).connect(g).connect(c.destination);
  if(o.vib){const l=c.createOscillator(),lg=c.createGain();l.frequency.value=5.5;lg.gain.value=.012;l.connect(lg).connect(src.playbackRate);l.start(t0+.25);l.stop(t0+dur)}
  src.start(t0);
}
// sampler.js swaps this for real nylon-guitar samples once they load
let playMidi=(m,when=0,vol=.5,o={})=>pluck(mf(m),when,o.dur||1.8,vol,o);
const playSF=(s,f,vol=.5)=>playMidi(OPEN_MIDI[s-1]+f,0,vol);
function strum(c,dir="D",vol=.28,when=0){
  const idx=dir==="D"?[0,1,2,3,4,5]:[5,4,3,2];let k=0;
  idx.forEach(i=>{const f=c.f[i];if(f>=0)playMidi(OPEN_MIDI[5-i]+f,when+k++*(dir==="D"?.014:.01),dir==="D"?vol:vol*.6)});
}
function click(t,accent){const c=ac(),o=c.createOscillator(),g=c.createGain();o.frequency.value=accent?1500:1000;g.gain.setValueAtTime(.35,t);g.gain.exponentialRampToValueAtTime(.001,t+.05);o.connect(g).connect(c.destination);o.start(t);o.stop(t+.06)}
const STOP=new Set();const stopAll=()=>STOP.forEach(f=>f());

// ================= drawing helpers =================
const T=(x,y,t,o="")=>`<text x="${x}" y="${y}" text-anchor="middle" font-size="13" fill="var(--ink)" ${o}>${t}</text>`;
const Tm=(x,y,t)=>`<text x="${x}" y="${y}" text-anchor="middle" font-size="11" fill="var(--muted)">${t}</text>`;
const L=(x1,y1,x2,y2)=>`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="var(--muted)" stroke-width="1" stroke-dasharray="3 3"/>`;
const dot=(x,y,t,bg,fg,r=11)=>`<circle cx="${x}" cy="${y}" r="${r}" fill="${bg}"/><text x="${x}" y="${y+4}" text-anchor="middle" font-size="11" font-weight="700" fill="${fg}" font-family="IBM Plex Mono,monospace">${t}</text>`;
const ICON_PLAY=`<svg viewBox="0 0 12 12"><path d="M2 1l9 5-9 5z"/></svg>`;

function chordSVG(c,hl=new Set()){
  const W=110,H=128,x0=18,dx=15,y0=26,dy=22,nf=4;
  let s=`<svg viewBox="0 0 ${W} ${H}" aria-hidden="true"><rect x="${x0}" y="${y0}" width="${dx*5}" height="${dy*nf}" fill="var(--wood)" opacity=".35"/>`;
  for(let i=0;i<6;i++)s+=`<line x1="${x0+i*dx}" y1="${y0}" x2="${x0+i*dx}" y2="${y0+dy*nf}" stroke="var(--ink)" stroke-width="${1.7-i*.17}"/>`;
  for(let j=0;j<=nf;j++)s+=`<line x1="${x0}" y1="${y0+j*dy}" x2="${x0+dx*5}" y2="${y0+j*dy}" stroke="var(--ink)" stroke-width="${j?1:4}"/>`;
  if(c.barre){const i0=6-c.bf,y=y0+(c.barre-1)*dy+dy/2;s+=`<rect x="${x0+i0*dx-7.5}" y="${y-7.5}" width="${(5-i0)*dx+15}" height="15" rx="7.5" fill="var(--f1)"/><text x="${x0+i0*dx}" y="${y+3.5}" text-anchor="middle" font-size="10" font-family="IBM Plex Mono,monospace" fill="var(--f-ink)">1</text>`}
  c.f.forEach((fr,i)=>{
    const x=x0+i*dx,g=c.g[i];
    if(fr<0)s+=`<text x="${x}" y="${y0-8}" text-anchor="middle" font-size="12" fill="var(--bad)">×</text>`;
    else if(fr===0)s+=`<circle cx="${x}" cy="${y0-12}" r="4" fill="none" stroke="var(--ink)" stroke-width="1.2"/>`;
    else if(!(c.barre&&g===1&&fr===c.barre)){const y=y0+(fr-1)*dy+dy/2;
      if(hl.has(i))s+=`<circle cx="${x}" cy="${y}" r="10.5" fill="none" stroke="var(--ink)" stroke-width="2.2"/>`;
      s+=`<circle cx="${x}" cy="${y}" r="7.5" fill="var(--f${g})"/><text x="${x}" y="${y+3.5}" text-anchor="middle" font-size="10" font-family="IBM Plex Mono,monospace" fill="var(--f-ink)">${g}</text>`}
  });
  return s+`<text x="${W/2+4}" y="${H-2}" text-anchor="middle" font-size="9.5" font-family="IBM Plex Mono,monospace" fill="var(--muted)">${c.f.map(v=>v<0?"x":v).join(" ")}</text></svg>`;
}

// Fretboard in "player view": the neck as you see it looking down at your guitar — string 6 on top.
function fbBase(F,o={}){
  const fw=F<=5?84:F<=8?62:50,x0=60,y0=28,sh=26,end=x0+F*fw,rx=end+(o.rh?40:0),Wd=rx+(o.rh?30:14),H=y0+5*sh+34;
  const Y=s=>y0+(6-s)*sh;
  let s=`<svg viewBox="0 0 ${Wd} ${H}" style="min-width:${Math.min(Wd,560)}px"><rect x="${x0}" y="${y0-12}" width="${F*fw}" height="${5*sh+24}" fill="var(--wood)" opacity=".4" rx="3"/>`;
  if(o.rh)s+=`<rect x="${end+10}" y="${y0-12}" width="${rx-end+12}" height="${5*sh+24}" rx="4" fill="var(--soft)"/><text x="${rx}" y="${H-6}" text-anchor="middle" font-size="10" fill="var(--muted)">يمين</text>`;
  [3,5,7,9,12].filter(m=>m<=F).forEach(m=>{const x=x0+(m-.5)*fw;s+=m===12?`<circle cx="${x}" cy="${y0+1.5*sh}" r="5" fill="var(--wood-line)"/><circle cx="${x}" cy="${y0+3.5*sh}" r="5" fill="var(--wood-line)"/>`:`<circle cx="${x}" cy="${y0+2.5*sh}" r="5" fill="var(--wood-line)"/>`});
  for(let n=0;n<=F;n++)s+=`<line x1="${x0+n*fw}" y1="${y0-12}" x2="${x0+n*fw}" y2="${y0+5*sh+12}" stroke="var(--ink)" stroke-width="${n?1.2:5}"/>`+(n?`<text x="${x0+(n-.5)*fw}" y="${H-6}" text-anchor="middle" font-size="11" font-family="IBM Plex Mono,monospace" fill="var(--muted)">${n}</text>`:"");
  for(let i=1;i<=6;i++){const y=Y(i);s+=`<line class="str" data-s="${i}" x1="${x0-30}" y1="${y}" x2="${o.rh?rx+16:end}" y2="${y}" stroke="var(--ink)" stroke-width="${.8+(i-1)*.35}"/><text x="10" y="${y+4}" font-size="10" fill="var(--muted)" font-family="IBM Plex Mono,monospace">${i}</text><text x="21" y="${y+4}" font-size="12" font-weight="600" fill="var(--ink)" font-family="IBM Plex Mono,monospace">${SNAME[i-1]}</text>`}
  const pos=(st,f,wire)=>[f?(wire?x0+f*fw-2:x0+(f-.5)*fw):x0-17,Y(st)];
  return {s,pos,rx,Wd,H,x0,fw,Y};
}
const hitRects=(B,F,strs)=>strs.map(i=>Array.from({length:F+1},(_,f)=>{const [x,y]=B.pos(i,f);return `<rect class="hit" data-s="${i}" data-f="${f}" x="${f?x-B.fw/2:x-17}" y="${y-13}" width="${f?B.fw:34}" height="26" fill="transparent"/>`}).join("")).join("");
const FB_CAP=`<p class="cap">الرقبة مرسومة زي ما بتشوفها وانت ماسك الجيتار وبتطلّع عليه: الوتر 6 (التخين) فوق، والعتبة عالشمال.</p>`;

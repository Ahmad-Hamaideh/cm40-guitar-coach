// Microphone: single-note pitch (YIN) and a pitch-class chroma for chords.
function yinPitch(buf,sr){
  let rms=0;for(let i=0;i<buf.length;i++)rms+=buf[i]*buf[i];rms=Math.sqrt(rms/buf.length);
  if(rms<.008)return -1;
  const half=buf.length>>1,d=new Float32Array(half);
  for(let t=1;t<half;t++){let s=0;for(let i=0;i<half;i++){const x=buf[i]-buf[i+t];s+=x*x}d[t]=s}
  let run=0;d[0]=1;for(let t=1;t<half;t++){run+=d[t];d[t]=run?d[t]*t/run:1}
  const minT=Math.floor(sr/1200);let tau=-1;
  for(let t=minT;t<half-1;t++){if(d[t]<.12){while(t+1<half-1&&d[t+1]<d[t])t++;tau=t;break}}
  if(tau<0)return -1;
  const a=d[tau-1],b=d[tau],c=d[tau+1],den=2*(2*b-c-a);
  return sr/(den?tau+(c-a)/den:tau);
}
function chromaOf(db,sr,n){
  const ch=new Array(12).fill(0);
  for(let k=1;k<db.length;k++){const f=k*sr/n;if(f<75||f>1400)continue;const mag=Math.pow(10,db[k]/20);const pc=((Math.round(12*Math.log2(f/440))+69)%12+12)%12;ch[pc]+=mag*mag}
  const mx=Math.max(...ch)||1;return ch.map(v=>v/mx);
}
const Mic={
  stream:null,an:null,buf:null,fbuf:null,cb:null,timer:null,
  async start(){
    if(this.an)return;
    const c=ac();
    this.stream=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:false,noiseSuppression:false,autoGainControl:false}});
    const src=c.createMediaStreamSource(this.stream);
    this.an=c.createAnalyser();this.an.fftSize=4096;this.an.smoothingTimeConstant=.3;src.connect(this.an);
    this.buf=new Float32Array(this.an.fftSize);this.fbuf=new Float32Array(this.an.frequencyBinCount);
  },
  listen(cb){this.cb=cb;clearInterval(this.timer);this.timer=setInterval(()=>this.tick(),50)},
  tick(){
    if(!this.cb||!this.an)return;
    const sr=ac().sampleRate;this.an.getFloatTimeDomainData(this.buf);
    let rms=0;for(let i=0;i<this.buf.length;i++)rms+=this.buf[i]*this.buf[i];rms=Math.sqrt(rms/this.buf.length);
    const hz=yinPitch(this.buf.subarray(0,2048),sr);
    this.an.getFloatFrequencyData(this.fbuf);
    this.cb({hz,rms,chroma:chromaOf(this.fbuf,sr,this.an.fftSize)});
  },
  stop(){clearInterval(this.timer);this.cb=null;if(this.stream){this.stream.getTracks().forEach(t=>t.stop());this.stream=null;this.an=null}}
};
const micHelp=err=>err&&err.name==="NotAllowedError"?"المتصفح منع المايكروفون. اسمحله من القفل جنب الرابط، وجرّب مرة ثانية.":"ما لقيت مايكروفون شغّال على هاد الجهاز.";

// Tuner that listens to your guitar
W.mtuner=el=>{
  const NAMES=[[6,"E",40],[5,"A",45],[4,"D",50],[3,"G",55],[2,"B",59],[1,"e",64]];
  el.innerHTML=`<div class="mt"><svg viewBox="0 0 240 120" class="mtg" aria-hidden="true">
    <path d="M20 110 A100 100 0 0 1 220 110" fill="none" stroke="var(--line)" stroke-width="10" stroke-linecap="round"/>
    <path d="M104 12 A100 100 0 0 1 136 12" fill="none" stroke="var(--good)" stroke-width="10"/>
    <line class="ndl" x1="120" y1="110" x2="120" y2="22" stroke="var(--ink)" stroke-width="3" stroke-linecap="round" style="transform-origin:120px 110px;transition:transform .12s"/>
    <circle cx="120" cy="110" r="6" fill="var(--ink)"/></svg>
    <div class="mtr"><b class="mono mtn">–</b><span class="meta mts">شغّل المايك واعزف وتر واحد</span></div></div>
    <div class="ctrl" style="justify-content:center"><button class="btn mgo">شغّل المايك</button></div>`;
  const ndl=el.querySelector(".ndl"),mtn=el.querySelector(".mtn"),mts=el.querySelector(".mts"),go=el.querySelector(".mgo");let on=false;
  go.onclick=async()=>{
    if(on){Mic.stop();on=false;go.textContent="شغّل المايك";mts.textContent="وقّفت المايك";return}
    try{await Mic.start()}catch(e){mts.textContent=micHelp(e);return}
    on=true;go.textContent="وقّف المايك";
    Mic.listen(({hz})=>{
      if(!el.isConnected){Mic.stop();return}
      if(hz<60||hz>1000){return}
      const midi=69+12*Math.log2(hz/440),str=NAMES.reduce((a,b)=>Math.abs(b[2]-midi)<Math.abs(a[2]-midi)?b:a);
      const cents=Math.round((midi-str[2])*100),cl=Math.max(-50,Math.min(50,cents));
      ndl.style.transform=`rotate(${cl*1.2}deg)`;mtn.textContent=`${str[1]} · وتر ${str[0]}`;
      mts.textContent=Math.abs(cents)<=5?"مزبوط ✓":cents<0?`واطي ${-cents} سنت: شدّ شوي`:`عالي ${cents} سنت: ارخي شوي`;
      mts.style.color=Math.abs(cents)<=5?"var(--good)":"var(--muted)";
    });
  };
};


// Per-device calibration, measured once by the wizard: how late this mic hears (lat, seconds) and the room noise.
const CAL=()=>{try{return JSON.parse(localStorage.getItem("cm40-cal"))||{}}catch(e){return {}}};
const noteName=m=>{const n=NOTE_EN[((m%12)+12)%12];return `${NOTE_AR[n]?NOTE_AR[n]+" · ":""}${n}${Math.floor(m/12)-1}`};
W.mcal=el=>{
  const c0=CAL();
  el.innerHTML=`<p class="meta calnow">${c0.lat!=null?`مضبوط من قبل: تأخير المايك ${Math.round(c0.lat*1000)} ملي ثانية.`:"لسا ما انضبط على هاد الجهاز."}</p>
  <ol class="calsteps"><li>حط الجهاز ٣٠–٥٠ سم عن الجيتار، والغرفة هادية.</li><li>بعد ما تضغط: اسكت ثانيتين.</li><li>بعدها ٤ طقات عدّ، وبعدين <b>اعزف الوتر ٦ مفتوح مع كل طقة</b>، ٨ مرات.</li></ol>
  <div class="ctrl"><button class="btn cgo">ابدأ الضبط</button></div><p class="wmsg cmsg"></p>`;
  const msg=el.querySelector(".cmsg"),go=el.querySelector(".cgo");
  go.onclick=async()=>{
    try{await Mic.start()}catch(err){msg.textContent=micHelp(err);return}
    go.disabled=true;const c=ac();msg.className="wmsg";msg.textContent="اسكت ثانيتين…";
    let n=0,s=0;await new Promise(res=>Mic.listen(r=>{s+=r.rms;if(++n>=40)res()}));
    const noise=Math.max(.004,s/n),thr=Math.max(.012,noise*2.5),sp=1;
    let t=c.currentTime+.3;const clicks=[];for(let b=0;b<12;b++){click(t,b%4===0);if(b>=4)clicks.push(t);t+=sp}
    msg.textContent="٤ عدّات، وبعدين اعزف الوتر ٦ مع كل طقة…";
    const hits=[];let prev=1,last=-9;
    await new Promise(res=>Mic.listen(r=>{const now=c.currentTime;
      if(r.rms>thr&&r.rms>prev*1.35&&now-last>.25){hits.push({t:now,e:0});last=now}prev=r.rms;
      // the attack counts only if low E (or its octave) follows it, so the metronome's own click is ignored
      const h=hits[hits.length-1];if(h&&now-h.t<.35&&r.hz>0&&Math.abs(((12*Math.log2(r.hz/mf(40))%12)+18)%12-6)<.5)h.e=1;
      if(now>t+.6)res()}));
    Mic.stop();go.disabled=false;
    const d=clicks.map(ct=>{const h=hits.filter(h=>h.e&&h.t>ct-.25&&h.t<ct+.5).sort((a,b)=>Math.abs(a.t-ct)-Math.abs(b.t-ct))[0];return h?h.t-ct:null}).filter(x=>x!=null).sort((a,b)=>a-b);
    if(d.length<5){msg.textContent=`سمعت ${d.length} من ٨ بس. تأكّد إنك بتعزف الوتر ٦ (الأتخن) مع الطقة، وقرّب الجهاز، وجرّب مرة ثانية.`;return}
    const lat=Math.min(.35,Math.max(0,d[d.length>>1]));
    localStorage.setItem("cm40-cal",JSON.stringify({lat,noise,d:new Date().toISOString().slice(0,10)}));
    msg.className="wmsg good";msg.textContent=`✓ انضبط. تأخير المايك: ${Math.round(lat*1000)} ملي ثانية · الضجة: ${noise<.01?"قليلة":noise<.03?"متوسطة":"عالية، الأحسن تتمرّن بمكان أهدى"}.`;
    el.querySelector(".calnow").textContent=`مضبوط: ${Math.round(lat*1000)} ملي ثانية.`};
};
// Live view of what the mic hears: note, loudness against the threshold, attacks, and a chord guess.
W.mhear=el=>{
  el.innerHTML=`<div class="hear"><b class="mono hn">–</b><span class="meta hc"></span>
  <div class="hbar"><i class="hl"></i><span class="ht" title="أقل من هيك بعتبره سكوت"></span></div><span class="hon">ضربة</span>
  <div class="hchr">${NOTE_EN.map(n=>`<div><i></i><small>${n}</small></div>`).join("")}</div><p class="meta hch"></p></div>
  <div class="ctrl"><button class="btn hgo">شغّل المايك</button></div>`;
  const q=s=>el.querySelector(s),bars=[...el.querySelectorAll(".hchr i")],go=q(".hgo");let on=false,prev=1;
  go.onclick=async()=>{
    if(on){Mic.stop();on=false;go.textContent="شغّل المايك";return}
    try{await Mic.start()}catch(err){q(".hc").textContent=micHelp(err);return}
    on=true;go.textContent="وقّف المايك";const thr=Math.max(.012,(CAL().noise||.005)*2.5);q(".ht").style.insetInlineStart=Math.min(100,thr/.2*100)+"%";
    Mic.listen(r=>{
      if(!el.isConnected){Mic.stop();return}
      const loud=r.rms>thr;q(".hl").style.width=Math.min(100,r.rms/.2*100)+"%";q(".hl").classList.toggle("on",loud);
      q(".hon").classList.toggle("on",loud&&r.rms>prev*1.35);prev=r.rms;
      if(loud&&r.hz>0){const m=69+12*Math.log2(r.hz/440),mr=Math.round(m);q(".hn").textContent=noteName(mr);q(".hc").textContent=`${Math.round((m-mr)*100)} سنت · ${Math.round(r.hz)} هرتز`}
      else if(!loud){q(".hn").textContent="–";q(".hc").textContent="ساكت (أو الصوت واطي كتير)"}
      bars.forEach((b,i)=>b.style.height=(loud?r.chroma[i]*100:0)+"%");
      if(loud){let best=null,bs=-9;Object.keys(CH).filter(k=>!/^H/.test(k)).forEach(k=>{const pcs=new Set();CH[k].f.forEach((f,i)=>{if(f>=0)pcs.add((OPEN_MIDI[5-i]+f)%12)});let sc=0;r.chroma.forEach((v,i)=>sc+=pcs.has(i)?v:-v*.6);if(sc>bs){bs=sc;best=k}});q(".hch").textContent=`إذا عم تعزف كورد، أقرب كورد: ${best}`}
    });
  };
};

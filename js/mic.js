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

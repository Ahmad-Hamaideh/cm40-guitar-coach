// Real nylon-guitar samples (FluidR3 GM, MIT licence), one file per MIDI note 40–86.
// Until a note's sample has loaded, playMidi falls back to the Karplus-Strong pluck.
const SAMPLES={};let sampLoading=null;
function loadSamples(){
  if(sampLoading)return sampLoading;
  const c=ac();
  sampLoading=Promise.all(Array.from({length:47},(_,i)=>i+40).map(m=>
    fetch(`samples/${m}.mp3`).then(r=>r.ok?r.arrayBuffer():Promise.reject(r.status))
      .then(b=>new Promise((ok,no)=>c.decodeAudioData(b,ok,no))).then(buf=>{SAMPLES[m]=buf}).catch(()=>{})));
  return sampLoading;
}
const karplus=playMidi;
playMidi=(m,when=0,vol=.5,o={})=>{
  const base=Math.round(m),buf=SAMPLES[base];
  if(!buf)return karplus(m,when,vol,o);
  const c=ac(),t0=c.currentTime+Math.max(0,when),dur=o.dur||2.6;
  const src=c.createBufferSource(),g=c.createGain(),lp=c.createBiquadFilter();
  src.buffer=buf;src.playbackRate.value=Math.pow(2,(m-base)/12);
  lp.type="lowpass";lp.frequency.value=o.cut||12000;
  g.gain.setValueAtTime(vol*1.5,t0);g.gain.setTargetAtTime(0,t0+dur,.25);
  let node=src.connect(lp);
  if(o.bright){const hs=c.createBiquadFilter();hs.type="highshelf";hs.frequency.value=2500;hs.gain.value=9;node=node.connect(hs)}
  node.connect(g).connect(c.destination);
  if(o.vib){const l=c.createOscillator(),lg=c.createGain();l.frequency.value=5.5;lg.gain.value=.01;l.connect(lg).connect(src.playbackRate);l.start(t0+.25);l.stop(t0+dur)}
  src.start(t0);src.stop(t0+dur+1.2);
};

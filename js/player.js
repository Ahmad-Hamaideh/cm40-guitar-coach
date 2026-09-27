// The lesson player. Sound is scheduled ahead on the audio clock; the guitar drawing reads the
// same timeline each frame, so hands and strings move exactly when you hear the note.
W.coach=(el,cfg)=>{
  const tracks=cfg.tracks;
  let ti=0,EV=[],N=0,lane=null,cur=0;
  let playing=false,idx=0,nextT=0,sched=null,vq=[],pa=0,pStart=0,A=null,B=null,abPick=0;
  let waitOn=false,steps=[],wi=0,hold=0;
  el.innerHTML=`${tracks.length>1?`<div class="pats trk">${tracks.map((tr,k)=>`<button class="chip${k?"":" on"}" data-k="${k}">${tr.n}</button>`).join("")}</div>`:""}
  <p class="meta tdesc"></p>
  <div class="chead"><b class="mono cnow"></b><span class="meta cnext"></span><span class="meta csec"></span><span class="cturn" hidden>دورك!</span></div>
  <div class="gvh"></div>
  <div class="legend">${[1,2,3,4].map(n=>`<span><i style="background:var(--f${n})"></i>${n} ${["سبابة","وسطى","بنصر","خنصر"][n-1]}</span>`).join("")}<span>الإصبع الباهت = مرفوع ومستنّي</span><span>○ وتر مفتوح · × لا تعزفه</span></div>
  <div class="tabwrap lane" title="اضغط على أي مكان بالتاب لتروح عليه"></div>
  <div class="ctrl"><button class="btn play">▶ خلّيه يعزف</button><button class="btn ghost prv">خطوة لورا</button><button class="btn ghost nxt">خطوة لقدّام</button><label class="meta">السرعة <input type="range" class="rng" min="30" max="160"><b class="mono v"></b></label></div>
  <div class="ctrl"><label class="meta"><input type="checkbox" class="cin" checked> عدّ قبل ما يبلّش</label><label class="meta"><input type="checkbox" class="lp" checked> كرّر</label><label class="meta"><input type="checkbox" class="turn"> هو بيعزف وبعدين أنا</label><button class="chip ab">حدّد مقطع (A–B)</button><button class="chip wait">المايك: بستنّاك</button></div>
  <p class="wmsg"></p>`;
  const $=q=>el.querySelector(q);
  const btn=$(".play"),rng=$(".rng"),v=$(".v"),lp=$(".lp"),turn=$(".turn"),cin=$(".cin"),laneEl=$(".lane"),turnEl=$(".cturn"),abB=$(".ab"),waitB=$(".wait"),wmsg=$(".wmsg");
  const gv=new GuitarView($(".gvh"));
  const spb=()=>60/+rng.value;

  const show=k=>{
    const e=EV[k];if(!e)return;cur=k;gv.show(e);
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
  const soundAt=(e,rel)=>{
    if(e.c&&e.k)strum(CH[e.c],e.k,e.v||.28,rel);
    (e.n||[]).forEach(([s,f])=>{let m=OPEN_MIDI[s-1]+(e.h?0:f);if(e.h)m+=({12:12,7:19,5:24})[f]||0;playMidi(m,rel,e.sl?.32:.5,e.h?{cut:4000,dur:3.5}:{})});
  };

  const stop=()=>{playing=false;clearInterval(sched);sched=null;vq=[];btn.textContent="▶ خلّيه يعزف";turnEl.hidden=true};
  const schedule=()=>{
    const c=ac(),lo=A??0,hi=B??N-1;
    while(playing&&nextT<c.currentTime+.15){
      if(idx>hi){if(lp.checked){idx=lo;pStart=idx;pa=0}else{vq.push({t:nextT,end:1});clearInterval(sched);sched=null;return}}
      const e=EV[idx];soundAt(e,nextT-c.currentTime);vq.push({t:nextT,i:idx});
      nextT+=e.d*spb();pa+=e.d;idx++;
      const ph=tracks[ti].phrase||4;
      if(turn.checked&&pa>=ph-1e-6){pa=0;vq.push({t:nextT,turn:pStart});for(let b=0;b<ph;b++)click(nextT+b*spb(),b===0);nextT+=ph*spb();vq.push({t:nextT,turnEnd:1});pStart=idx}
    }
  };
  const raf=()=>{
    if(!el.isConnected){stop();return}
    const now=ac().currentTime;
    while(vq.length&&vq[0].t<=now){const q=vq.shift();
      if(q.count)$(".cnow").textContent=q.count;
      else if(q.i!=null){show(q.i);gv.hit(EV[q.i])}
      else if(q.turn!=null){show(q.turn);turnEl.hidden=false}
      else if(q.turnEnd)turnEl.hidden=true;
      else if(q.end){stop();return}}
    if(playing)requestAnimationFrame(raf);
  };
  const play=()=>{
    stopAll();if(waitOn)endWait();loadSamples();
    const c=ac();playing=true;btn.textContent="■ وقّف";
    idx=cur>=N-1?0:cur;if(A!=null&&(idx<A||idx>B))idx=A;
    let t=c.currentTime+.15;
    if(cin.checked){const bb=tracks[ti].bar||4;for(let b=0;b<bb;b++){click(t,b===0);vq.push({t,count:bb-b});t+=spb()}}
    nextT=t;pa=0;pStart=idx;schedule();sched=setInterval(schedule,25);requestAnimationFrame(raf);
  };
  const step=d=>{stop();if(waitOn)endWait();const k=Math.max(0,Math.min(N-1,cur+d));show(k);soundAt(EV[k],0);gv.hit(EV[k])};

  // A–B section and seeking by clicking the tab
  const drawAB=()=>{const r=laneEl.querySelector(".abr");if(A==null){r.setAttribute("width",0);return}const x=lane.xs[A][0],e=lane.xs[B][0]+lane.xs[B][1];r.setAttribute("x",x);r.setAttribute("width",e-x)};
  laneEl.addEventListener("click",ev=>{
    const r=laneEl.querySelector("svg").getBoundingClientRect(),x=ev.clientX-r.left;
    const k=lane.xs.findIndex(([a,w])=>x>=a&&x<a+w);if(k<0)return;
    if(abPick===1){A=k;abPick=2;wmsg.textContent="هلأ اضغط على آخر المقطع بالتاب.";return}
    if(abPick===2){B=k;if(B<A)[A,B]=[B,A];abPick=0;abB.textContent="إلغاء المقطع";abB.classList.add("on");wmsg.textContent="المقطع رح يتكرّر لحاله.";drawAB();return}
    stop();show(k);
  });
  abB.onclick=()=>{if(A!=null||abPick){A=B=null;abPick=0;abB.textContent="حدّد مقطع (A–B)";abB.classList.remove("on");wmsg.textContent="";drawAB();return}abPick=1;wmsg.textContent="اضغط على أول المقطع الصعب بالتاب اللي تحت الجيتار."};

  // Wait mode: listen through the microphone and move on only when you play the right thing
  const buildSteps=()=>{const st=[];EV.forEach((e,k)=>{if(e.c&&e.k){if(!st.length||EV[st[st.length-1]].c!==e.c)st.push(k)}else if(e.n&&!e.sl)st.push(k)});return st};
  const expect=k=>{const e=EV[k];
    if(e.c){const pcs=new Set();CH[e.c].f.forEach((f,i)=>{if(f>=0)pcs.add((OPEN_MIDI[5-i]+f)%12)});return {chord:e.c,pcs}}
    const [s,f]=e.n[0];let m=OPEN_MIDI[s-1]+(e.h?0:f);if(e.h)m+=({12:12,7:19,5:24})[f]||0;return {midi:m,s,f,h:e.h}};
  const wText=x=>x.chord?`اعزف كورد <b>${x.chord}</b> (ضربة وحدة لتحت، وخلّيه يرنّ)`:`اعزف <b>${NOTE_AR[NOTE_EN[x.midi%12]]||NOTE_EN[x.midi%12]}</b> على الوتر ${x.s}${x.h?`، هارمونك فوق فريت ${x.f}`:x.f?`، فريت ${x.f}`:"، مفتوح"}`;
  const showStep=()=>{const k=steps[wi];show(k);hold=0;wmsg.className="wmsg";wmsg.innerHTML=`<span class="mono">${wi+1}/${steps.length}</span> ${wText(expect(k))}. <span class="meta">أنا سامعك.</span>`};
  const onMic=r=>{
    if(!el.isConnected){endWait();return}if(hold<0)return;
    const x=expect(steps[wi]);let ok=false;
    if(x.midi!=null){if(r.hz>0){const d=12*Math.log2(r.hz/mf(x.midi)),dd=Math.abs(d-12*Math.round(d/12));ok=dd<.5&&Math.abs(d)<12.5}}
    else if(r.rms>.015){const ch=r.chroma,top=[...ch.keys()].sort((a,b)=>ch[b]-ch[a]).slice(0,3),hit=top.filter(p=>x.pcs.has(p)).length;ok=hit===3||(hit===2&&x.pcs.has(top[0]))}
    hold=ok?hold+1:0;
    if(hold>=3){gv.hit(EV[steps[wi]]);hold=-1;wmsg.className="wmsg good";wmsg.textContent="✓ صح!";setTimeout(()=>{if(!waitOn)return;wi=(wi+1)%steps.length;showStep()},450)}
  };
  const endWait=()=>{Mic.stop();waitOn=false;waitB.classList.remove("on");waitB.textContent="المايك: بستنّاك";wmsg.className="wmsg";wmsg.textContent=""};
  waitB.onclick=async()=>{
    if(waitOn){endWait();return}
    stopAll();
    try{await Mic.start()}catch(err){wmsg.textContent=micHelp(err);return}
    waitOn=true;waitB.classList.add("on");waitB.textContent="وقّف الانتظار";
    steps=buildSteps();wi=Math.max(0,steps.findIndex(k=>k>=cur));showStep();Mic.listen(onMic);
  };

  const load=k=>{
    stop();if(waitOn)endWait();ti=k;const tr=tracks[k];EV=tr.ev;N=EV.length;cur=0;A=B=null;abPick=0;abB.textContent="حدّد مقطع (A–B)";abB.classList.remove("on");
    rng.value=tr.bpm||60;v.textContent=rng.value;$(".tdesc").innerHTML=tr.d||"";
    lane=laneSVG(EV,tr.bar||4);laneEl.innerHTML=lane.s;
    const svg=laneEl.querySelector("svg"),r=document.createElementNS("http://www.w3.org/2000/svg","rect");
    r.setAttribute("class","abr");r.setAttribute("y",0);r.setAttribute("height",svg.getAttribute("height"));r.setAttribute("width",0);r.setAttribute("fill","var(--warn)");r.setAttribute("opacity",".18");svg.insertBefore(r,svg.firstChild);
    show(0);
  };
  if(tracks.length>1)$(".trk").onclick=e=>{const b=e.target.closest(".chip");if(!b)return;el.querySelectorAll(".trk .chip").forEach(x=>x.classList.toggle("on",x===b));load(+b.dataset.k)};
  btn.onclick=()=>playing?stop():play();
  $(".nxt").onclick=()=>step(1);$(".prv").onclick=()=>step(-1);
  rng.oninput=()=>v.textContent=rng.value;
  STOP.add(()=>{if(playing)stop();if(waitOn)endWait()});
  load(0);
};

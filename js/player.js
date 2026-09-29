// The lesson player. Sound is scheduled ahead on the audio clock; the guitar drawing reads the
// same timeline each frame, so hands and strings move exactly when you hear the note.
W.coach=(el,cfg)=>{
  const tracks=cfg.tracks;
  let ti=0,EV=[],N=0,lane=null,cur=0;
  let playing=false,idx=0,nextT=0,sched=null,vq=[],pa=0,pStart=0,A=null,B=null,abPick=0;
  let waitOn=false,steps=[],wi=0,hold=0,exam=false,hits=0,t0s=0;
  el.innerHTML=`${tracks.length>1?`<div class="pats trk">${tracks.map((tr,k)=>`<button class="chip${k?"":" on"}" data-k="${k}">${tr.n}</button>`).join("")}</div>`:""}
  <p class="meta tdesc"></p>
  <div class="chead"><b class="mono cnow"></b><span class="meta cnext"></span><span class="meta csec"></span><span class="cturn" hidden>دورك!</span></div>
  <div class="gvh"></div>
  <div class="legend">${[1,2,3,4].map(n=>`<span><i style="background:var(--f${n})"></i>${n} ${["سبابة","وسطى","بنصر","خنصر"][n-1]}</span>`).join("")}<span>الإصبع الباهت = مرفوع ومستنّي</span><span>○ وتر مفتوح · × لا تعزفه</span></div>
  <div class="tabwrap lane" title="اضغط على أي مكان بالتاب لتروح عليه"></div>
  <div class="ctrl pc"><button class="btn play">▶ خلّيه يعزف</button><button class="btn ghost prv" aria-label="خطوة لورا">‹</button><button class="btn ghost nxt" aria-label="خطوة لقدّام">›</button><label class="meta">السرعة <input type="range" class="rng" min="30" max="160"><b class="mono v"></b></label></div>
  <div class="ctrl lvls"><span class="meta">التمرين:</span><button class="chip lv" data-l="0">١ سهل</button><button class="chip lv" data-l="1">٢ متوسط</button><button class="chip lv" data-l="2">٣ الهدف</button><button class="chip wait">المايك: بستنّاك</button><button class="chip hard" hidden>أصعب مقطع</button></div>
  <details class="more"><summary class="meta">خيارات أكتر: عدّ، تكرار، مقطع، امتحانات المايك</summary>
  <div class="ctrl"><label class="meta"><input type="checkbox" class="cin" checked> عدّ قبل ما يبلّش</label><label class="meta"><input type="checkbox" class="lp" checked> كرّر</label><label class="meta"><input type="checkbox" class="turn"> هو بيعزف وبعدين أنا</label><button class="chip ab">حدّد مقطع (A–B)</button></div>
  <div class="ctrl"><button class="chip exam">فحص النغمات</button><button class="chip rexam">امتحان بالإيقاع</button><span class="meta">فحص النغمات: كل نغمة صح؟ · الإيقاع: صح وبوقتها مع المترونوم. <a href="#/mic">المايك مش مزبوط؟ اضبطه</a></span></div></details>
  <p class="wmsg"></p><p class="meta hist"></p>`;
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

  let tStart=0;
  const lessonId=()=>(el.closest(".lesson[id]")||{}).id;
  const stop=()=>{if(playing)logPractice(ac().currentTime-tStart,lessonId());playing=false;clearInterval(sched);sched=null;vq=[];btn.textContent="▶ خلّيه يعزف";turnEl.hidden=true};
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
    const c=ac();playing=true;tStart=c.currentTime;btn.textContent="■ وقّف";
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
  const showStep=()=>{const k=steps[wi];show(k);hold=0;heard=false;t0s=performance.now();wmsg.className="wmsg";wmsg.innerHTML=`<span class="mono">${wi+1}/${steps.length}</span> ${wText(expect(k))}. <span class="meta">أنا سامعك.</span>`};
  // Mic judging. The room is measured first so noise isn't taken for playing. Exams want the exact
  // octave (right string and fret); practice mode forgives an octave.
  // how late the analyser hears: measured per device on #/mic, ~70 ms if never calibrated
  const LAT=()=>CAL().lat??.07;
  let noise=.006,heard=false,sil=0,full=true,rex=null,missK=[];

  // Exam history per track: last scores, and a red mark above the tab where recent attempts went wrong.
  const hKey=()=>(lessonId()||location.hash)+"|"+ti;
  const saveExam=rec=>{const h=LS("cm40-exam",{}),k=hKey();h[k]=[...(h[k]||[]),{d:dayKey(new Date()),...rec}].slice(-10);LSset("cm40-exam",h);drawHist()};
  const drawHist=()=>{const a=LS("cm40-exam",{})[hKey()]||[],cnt={};
    $(".hist").textContent=a.length?`محاولاتك: ${a.slice(-5).map(x=>`${x.sc}% ${x.k==="r"?"إيقاع":"نغمات"}`).join(" · ")}. الأحمر فوق التاب = وين غلطت بآخر محاولات.`:"";
    laneEl.querySelectorAll(".miss").forEach(x=>x.remove());a.slice(-5).forEach(x=>(x.miss||[]).forEach(k=>cnt[k]=(cnt[k]||0)+1));
    const svg=laneEl.querySelector("svg");Object.entries(cnt).forEach(([k,c])=>{const xy=lane.xs[k];if(!xy)return;const r=document.createElementNS("http://www.w3.org/2000/svg","rect");
      [["class","miss"],["x",xy[0]+1],["y",0],["width",xy[1]-2],["height",5],["rx",2],["fill","#D0654F"],["opacity",Math.min(1,.25+c*.18)]].forEach(([n,v])=>r.setAttribute(n,v));svg.appendChild(r)})};
  const loud=r=>r.rms>Math.max(.012,noise*2.5);
  const matches=(x,r,strict)=>{if(!loud(r))return false;
    if(x.midi!=null){if(r.hz<=0)return false;const d=12*Math.log2(r.hz/mf(x.midi));return strict?Math.abs(d)<.5:Math.abs(d-12*Math.round(d/12))<.5&&Math.abs(d)<12.5}
    const ch=r.chroma,top=[...ch.keys()].sort((a,b)=>ch[b]-ch[a]).slice(0,3),hit=top.filter(p=>x.pcs.has(p)).length;return hit===3||(hit===2&&x.pcs.has(top[0]))};
  const calibrate=()=>new Promise(res=>{let n=0,s=0;Mic.listen(r=>{s+=r.rms;if(++n>=20){noise=Math.max(.004,s/n);res()}})});
  const onMic=r=>{
    if(!el.isConnected){endWait();return}if(hold<0)return;
    if(loud(r))heard=true;
    if(exam&&performance.now()-t0s>4500){hold=-1;if(!heard)sil++;missK.push(steps[wi]);wmsg.className="wmsg";wmsg.textContent=heard?"✗ فاتت":"… ما سمعت إشي";setTimeout(nextExam,350);return}
    const ok=matches(expect(steps[wi]),r,exam);
    hold=ok?hold+1:0;
    if(hold>=3){gv.hit(EV[steps[wi]]);hold=-1;wmsg.className="wmsg good";wmsg.textContent="✓ صح!";if(exam){hits++;setTimeout(nextExam,350);return}setTimeout(()=>{if(!waitOn)return;wi=(wi+1)%steps.length;showStep()},450)}
  };
  const endWait=()=>{Mic.stop();waitOn=false;exam=false;if(rex){rex=null;stop()}waitB.classList.remove("on");waitB.textContent="المايك: بستنّاك";wmsg.className="wmsg";wmsg.textContent=""};
  waitB.onclick=async()=>{
    if(waitOn){endWait();return}
    stopAll();
    try{await Mic.start()}catch(err){wmsg.textContent=micHelp(err);return}
    waitOn=true;waitB.classList.add("on");waitB.textContent="وقّف الانتظار";
    steps=buildSteps();wi=Math.max(0,steps.findIndex(k=>k>=cur));showStep();Mic.listen(onMic);
  };
  const cantHear=(s,n)=>`ما قدرت أقيّمك: ${s} من ${n} ما وصلني صوتها. قرّب الجهاز من الجيتار (٣٠–٥٠ سم)، سكّر أي صوت حولك، وجرّب مرة ثانية. إذا ضلّت تصير: <a href="#/mic">اضبط المايك</a>.`;
  const passEv=kind=>el.dispatchEvent(new CustomEvent("cm40-pass",{bubbles:true,detail:{kind}}));
  const startMic=async()=>{
    if(waitOn){endWait();return false}stopAll();
    try{await Mic.start()}catch(err){wmsg.textContent=micHelp(err);return false}
    waitOn=true;exam=true;waitB.classList.add("on");waitB.textContent="وقّف";
    wmsg.className="wmsg";wmsg.textContent="بسمع الغرفة ثانية… خلّيك ساكت.";return true};

  // Note check: every note or chord, one at a time, 4 seconds each. Covers the A–B section if one is set.
  const nextExam=()=>{if(!waitOn)return;wi++;if(wi<steps.length)return showStep();
    const n=steps.length,sc=Math.round(hits/n*100),pass=sc>=90,chords=steps.some(k=>EV[k].c);endWait();
    if(sil>n*.3){wmsg.innerHTML=cantHear(sil,n);return}
    saveExam({k:"n",sc,miss:missK});
    wmsg.className=pass?"wmsg good":"wmsg";
    wmsg.textContent=(pass?`نغماتك صح: ${sc}%.${full?"":" (هاد المقطع بس)"} الخطوة الجاية: «امتحان بالإيقاع».`:`${sc}% صح. بدك ٩٠%. ارجع لتمرين «٢ متوسط» وجرّب مرة ثانية.`)+(chords?" فحص الكوردات بالمايك تقريبي: اعزف كل كورد وتر وتر وتأكّد إن كل الأوتار بترن.":"");
    if(pass&&full)passEv("notes")};
  el.querySelector(".exam").onclick=async()=>{
    if(!await startMic())return;
    full=A==null;steps=buildSteps().filter(k=>full||(k>=A&&k<=B));hits=0;sil=0;wi=0;missK=[];
    await calibrate();if(!waitOn)return;
    wmsg.textContent=`فحص النغمات: ${steps.length} ${full?"":"(المقطع المحدّد) "}نغمة أو كورد. عندك ٤ ثواني لكل وحدة.`;
    setTimeout(()=>{if(waitOn){showStep();Mic.listen(onMic)}},1500)};

  // Rhythm exam: the metronome clicks, you play. A step counts only if the right pitch sounds
  // and a fresh attack (a jump in loudness) lands close to its beat.
  el.querySelector(".rexam").onclick=async()=>{
    if(!await startMic())return;
    const tok=rex={};await calibrate();if(rex!==tok)return;
    const c=ac(),sp=spb(),lo=A??0,hi=B??N-1,bb=tracks[ti].bar||4,part=A!=null,base=tracks[ti].bpm||60;
    let t=c.currentTime+.3;const T=[];
    for(let b=0;b<bb;b++){click(t,b===0);vq.push({t,count:bb-b});t+=sp}
    const t0=t;for(let k=lo;k<=hi;k++){T[k]=t;vq.push({t,i:k});t+=EV[k].d*sp}
    const end=t,want=buildSteps().filter(k=>k>=lo&&k<=hi),tol=Math.max(.1,Math.min(.2,sp/4));
    const R=want.map((k,j)=>({k,a:T[k]-tol,b:Math.max(T[k]+.3,j+1<want.length?T[want[j+1]]:end),x:expect(k),pitch:0,on:0,heard:0}));
    let prev=1,clickT=t0,beat=0;const lat=LAT();
    playing=true;tStart=c.currentTime;btn.textContent="■ وقّف";requestAnimationFrame(raf);
    wmsg.textContent=`اعزف مع المترونوم: ${want.length} خطوة على سرعة ${rng.value}.`;
    const finish=()=>{const reach=+rng.value>=base;endWait();
      const n=R.length,s0=R.filter(s=>!s.heard).length,ok=R.filter(s=>s.pitch&&s.on).length,pn=R.filter(s=>s.pitch).length,sc=Math.round(ok/n*100),pass=sc>=80,miss=R.find(s=>!(s.pitch&&s.on));
      if(s0>n*.3){wmsg.innerHTML=cantHear(s0,n);return}
      saveExam({k:"r",sc,bpm:+rng.value,miss:R.filter(s=>!(s.pitch&&s.on)).map(s=>s.k)});
      let m=`النغمات صح: ${Math.round(pn/n*100)}% · صح وبوقتها: ${sc}%. `;
      if(!pass)m+="بدك ٨٠%. "+(pn/n>=.8?"النغمات منيحة، المشكلة بالوقت: خلّي المترونوم يقودك.":"ارجع لتمرين «٢ متوسط».");
      else if(part)m+="زبط المقطع! هلأ جرّبه كامل (ألغِ المقطع A–B).";
      else if(!reach)m+=`زبط! هلأ ارفع السرعة لـ ${base} («٣ الهدف») وأعده.`;
      else m+="أتقنت التمرين!";
      wmsg.className=pass?"wmsg good":"wmsg";wmsg.textContent=m;
      if(!pass&&miss){wmsg.insertAdjacentHTML("beforeend",` <button class="chip fixm">تمرّن على أول غلطة ببطء</button>`);
        wmsg.querySelector(".fixm").onclick=()=>{A=Math.max(lo,miss.k-2);B=Math.min(hi,miss.k+2);abB.textContent="إلغاء المقطع";abB.classList.add("on");drawAB();show(A);rng.value=Math.round(base*.6);v.textContent=rng.value;wmsg.textContent="المقطع حول الغلطة محدّد على ٦٠%. اضغط ▶."}}
      if(pass&&!part&&reach){
        if(!R.some(s=>s.x.chord))return passEv("rhy");
        wmsg.insertAdjacentHTML("beforeend",` المايك بيفحص الكوردات تقريبي، فتأكّد بنفسك: اعزف كل كورد وتر وتر. <button class="chip cok">كل الأوتار بترن نظيف ✓</button>`);
        wmsg.querySelector(".cok").onclick=()=>{passEv("rhy");wmsg.textContent="أتقنت التمرين! ✓"}}
    };
    Mic.listen(r=>{
      if(rex!==tok)return;if(!el.isConnected){endWait();return}
      while(clickT<end&&clickT<c.currentTime+.2){click(clickT,beat%bb===0);clickT+=sp;beat++}
      const now=c.currentTime-lat,onset=loud(r)&&r.rms>prev*1.35;prev=r.rms;
      R.forEach(s=>{if(now<s.a||now>s.b)return;if(loud(r))s.heard=1;if(matches(s.x,r,true))s.pitch=1;if(onset&&Math.abs(now-T[s.k])<=tol)s.on=1});
      if(c.currentTime>end+.4)finish();
    });
  };
  const LV=[.6,.8,1],LVT=["سهل: أول جزء ببطء. اعزفه ٣ مرات نظيف ورا بعض.","متوسط: كامل على ٨٠% من السرعة، ٣ مرات نظيف.","الهدف: كامل على السرعة المطلوبة. لما يزبط، افتح «خيارات أكتر» وجرّب امتحانات المايك."];
  const setLevel=l=>{stop();if(waitOn)endWait();const base=tracks[ti].bpm||60;rng.value=Math.round(base*LV[l]);v.textContent=rng.value;
    if(l===0){let acc=0,k=0;const lim=Math.min(8,EV.reduce((a,e)=>a+e.d,0)/2);while(k<N-1&&acc+EV[k].d<=lim){acc+=EV[k].d;k++}A=0;B=Math.max(0,k-1);abB.textContent="إلغاء المقطع";abB.classList.add("on")}
    else{A=B=null;abB.textContent="حدّد مقطع (A–B)";abB.classList.remove("on")}
    drawAB();el.querySelectorAll(".lvls .lv").forEach(b=>b.classList.toggle("on",+b.dataset.l===l));wmsg.className="wmsg";wmsg.textContent=LVT[l]};
  el.querySelector(".lvls").onclick=e=>{const b=e.target.closest(".lv");if(b)setLevel(+b.dataset.l)};
  const load=k=>{
    stop();if(waitOn)endWait();ti=k;const tr=tracks[k];EV=tr.ev;N=EV.length;cur=0;A=B=null;abPick=0;abB.textContent="حدّد مقطع (A–B)";abB.classList.remove("on");
    rng.value=tr.bpm||60;v.textContent=rng.value;$(".tdesc").innerHTML=tr.d||"";
    // a track with no pressed notes is all right hand, so show the whole guitar instead of the left-hand zoom
    if(!EV.some(e=>e.c?CH[e.c].f.some(f=>f>0):(e.n||[]).some(n=>n[1]>0))){gv.mode="full";gv.cam=null;gv.chips()}
    lane=laneSVG(EV,tr.bar||4);laneEl.innerHTML=lane.s;
    hard=tr.hard||hardSec(EV);$(".hard").hidden=!hard;
    const svg=laneEl.querySelector("svg"),r=document.createElementNS("http://www.w3.org/2000/svg","rect");
    r.setAttribute("class","abr");r.setAttribute("y",0);r.setAttribute("height",svg.getAttribute("height"));r.setAttribute("width",0);r.setAttribute("fill","var(--warn)");r.setAttribute("opacity",".18");svg.insertBefore(r,svg.firstChild);
    show(0);drawHist();
  };
  let hard=null;
  $(".hard").onclick=()=>{stop();if(waitOn)endWait();[A,B]=hard;abB.textContent="إلغاء المقطع";abB.classList.add("on");drawAB();show(A);
    rng.value=Math.round((tracks[ti].bpm||60)*.6);v.textContent=rng.value;wmsg.className="wmsg";wmsg.textContent="أصعب مقطع محدّد على ٦٠% من السرعة. كرّره لحد ما يصير سهل، وبعدين ارفع السرعة.";};
  if(tracks.length>1)$(".trk").onclick=e=>{const b=e.target.closest(".chip");if(!b)return;el.querySelectorAll(".trk .chip").forEach(x=>x.classList.toggle("on",x===b));load(+b.dataset.k)};
  btn.onclick=()=>rex?endWait():playing?stop():play();
  $(".nxt").onclick=()=>step(1);$(".prv").onclick=()=>step(-1);
  rng.oninput=()=>v.textContent=rng.value;
  STOP.add(()=>{if(playing)stop();if(waitOn)endWait()});
  load(0);
};

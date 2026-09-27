// Interactive widgets (everything except the coach).
const W={};

W.fret=(el,cfg)=>{
  const F=cfg.frets||12,B=fbBase(F);let s=B.s;
  (cfg.dots||[]).forEach(d=>{const [x,y]=B.pos(d.s,d.f);s+=dot(x,y,d.t,"var(--accent)","var(--accent-ink)")});
  s+=`<g class="live"></g>`+hitRects(B,F,[1,2,3,4,5,6])+`</svg>`;
  el.innerHTML=`<div class="fbwrap">${s}</div>${FB_CAP}<p class="readout meta">${cfg.hint||"اضغط على أي مكان على الرقبة: بتسمع النغمة وبتعرف اسمها."}</p>`;
  const live=el.querySelector(".live"),out=el.querySelector(".readout");
  el.querySelector("svg").addEventListener("click",e=>{
    const r=e.target.closest(".hit");if(!r)return;const st=+r.dataset.s,f=+r.dataset.f,n=noteOf(st,f),[x,y]=B.pos(st,f);
    playSF(st,f);live.innerHTML=dot(x,y,n,"var(--warn)","var(--dot-ink)",12);
    out.innerHTML=`الوتر ${st} (${SNAME[st-1]})، ${f?"فريت "+f:"مفتوح"} ← النغمة <b class="mono">${n}</b>${NOTE_AR[n]?" ("+NOTE_AR[n]+")":" (نغمة دييز، بين نغمتين)"}`;
  });
};

W.quiz=(el,cfg)=>{
  const F=12,B=fbBase(F),NAT=["C","D","E","F","G","A","B"];
  el.innerHTML=`<div class="qhead"><b class="q"></b><span class="meta sc">0 / 0</span><label class="meta"><input type="checkbox" class="shw"> ورجيني النغمات</label></div><div class="fbwrap">${B.s}<g class="names"></g><g class="live"></g>${hitRects(B,F,cfg.strings)}</svg></div>${FB_CAP}`;
  const q=el.querySelector(".q"),sc=el.querySelector(".sc"),live=el.querySelector(".live"),names=el.querySelector(".names");
  let target,tstr,ok=0,tot=0,wait=false;
  const where=(st,n)=>Array.from({length:F+1},(_,f)=>f).filter(f=>noteOf(st,f)===n);
  const ask=()=>{tstr=cfg.strings[Math.floor(Math.random()*cfg.strings.length)];do{target=NAT[Math.floor(Math.random()*7)]}while(where(tstr,target).every(f=>f===0||f===12)&&Math.random()<.7);q.textContent=`وين ${NOTE_AR[target]} (${target}) على الوتر ${tstr}؟`;live.innerHTML="";wait=false};
  el.querySelector(".shw").onchange=e=>{names.innerHTML=e.target.checked?cfg.strings.map(st=>Array.from({length:F+1},(_,f)=>f).filter(f=>NOTE_AR[noteOf(st,f)]).map(f=>{const [x,y]=B.pos(st,f);return dot(x,y,NOTE_AR[noteOf(st,f)],"var(--soft)","var(--ink)",12)}).join("")).join(""):""};
  el.querySelector("svg").addEventListener("click",e=>{
    const r=e.target.closest(".hit");if(!r||wait)return;const st=+r.dataset.s,f=+r.dataset.f,[x,y]=B.pos(st,f);
    playSF(st,f);
    if(st!==tstr){q.textContent=`هاد الوتر ${st}. السؤال عن الوتر ${tstr}.`;setTimeout(()=>q.textContent=`وين ${NOTE_AR[target]} (${target}) على الوتر ${tstr}؟`,1200);return}
    tot++;const good=noteOf(st,f)===target;if(good)ok++;wait=true;
    live.innerHTML=dot(x,y,good?"✓":"✗",good?"var(--good)":"var(--bad)","var(--paper)",13)+(good?"":where(tstr,target).map(ff=>{const [a,b]=B.pos(tstr,ff);return dot(a,b,target,"var(--good)","var(--paper)",12)}).join(""));
    q.textContent=good?"صح!":`لا، ${NOTE_AR[target]} هون (الأخضر).`;sc.textContent=`${ok} / ${tot}`;
    setTimeout(ask,good?900:2000);
  });
  ask();
};

W.staff=el=>{
  const N=[["C",[5,3]],["D",[4,0]],["E",[4,2]],["F",[4,3]],["G",[3,0]],["A",[3,2]],["B",[2,0]],["C",[2,1]],["D",[2,3]],["E",[1,0]],["F",[1,1]],["G",[1,3]]];
  const y=i=>120-i*6,x=i=>120+i*42;
  let s=`<svg viewBox="0 0 620 175" role="img" aria-label="المدرج">`;
  for(let l=0;l<5;l++)s+=`<line x1="20" y1="${60+l*12}" x2="600" y2="${60+l*12}" stroke="var(--ink)"/>`;
  s+=`<text x="46" y="114" text-anchor="middle" font-size="68" fill="var(--ink)" font-family="'Segoe UI Symbol','Noto Music','Noto Sans Symbols 2',serif">𝄞</text>`;
  N.forEach(([n],i)=>{const X=x(i),Y=y(i),up=i<6;s+=`<g class="hit" data-i="${i}">`+(i===0?`<line x1="${X-14}" y1="120" x2="${X+14}" y2="120" stroke="var(--ink)"/>`:"")+`<rect x="${X-16}" y="40" width="32" height="100" fill="transparent"/><ellipse class="nh" cx="${X}" cy="${Y}" rx="7.5" ry="5.5" transform="rotate(-20 ${X} ${Y})" fill="var(--ink)"/><line x1="${up?X+7:X-7}" y1="${Y}" x2="${up?X+7:X-7}" y2="${up?Y-34:Y+34}" stroke="var(--ink)" stroke-width="1.5"/>`+Tm(X,164,NOTE_AR[n])+`</g>`});
  el.innerHTML=`<div class="tabwrap">${s}</svg></div><p class="readout meta">اضغط على أي نغمة: بتسمعها وبتعرف وين تعزفها.</p>`;
  const out=el.querySelector(".readout");
  el.querySelector("svg").addEventListener("click",e=>{
    const g=e.target.closest(".hit");if(!g)return;const i=+g.dataset.i,[n,[st,f]]=N[i];
    el.querySelectorAll(".nh").forEach((h,k)=>h.setAttribute("fill",k===i?"var(--accent)":"var(--ink)"));
    playSF(st,f);out.innerHTML=`<b>${NOTE_AR[n]} (${n})</b> ← الوتر ${st} (${SNAME[st-1]})، ${f?"فريت "+f+"، بالإصبع "+f:"مفتوح"}`;
  });
};

W.chords=(el,cfg)=>{
  el.innerHTML=`<div class="chords">${cfg.list.map(n=>`<button class="chord" data-c="${n}" aria-label="اسمع ${n}"><span class="nm">${n}</span><span class="ar">${CH[n].ar}</span>${chordSVG(CH[n])}${cfg.tips&&cfg.tips[n]?`<span class="tp">${cfg.tips[n]}</span>`:""}</button>`).join("")}</div><p class="meta" style="margin-top:8px;text-align:center">اضغط على الكورد عشان تسمع صوته الصح وتقارنه بصوتك.</p>`;
  el.onclick=e=>{const b=e.target.closest(".chord");if(!b)return;strum(CH[b.dataset.c]);b.classList.add("playing");setTimeout(()=>b.classList.remove("playing"),800)};
};

W.sw=(el,cfg)=>{
  let cur=0,iv=null,left=60,count=0,best={};
  try{best=JSON.parse(localStorage.getItem("cm40-best"))||{}}catch(e){}
  el.innerHTML=`<div class="pats">${cfg.pairs.map((p,i)=>`<button class="chip${i?"":" on"}" data-i="${i}">${p[0]} ↔ ${p[1]}</button>`).join("")}</div><div class="swview"></div><p class="swmsg"></p>
  <div class="timer"><button class="btn ghost go">ابدأ دقيقة</button><span class="big mono tm">60</span><button class="btn tap" disabled>بدّلت ✓</button><span class="meta res"></span></div>`;
  const view=el.querySelector(".swview"),msg=el.querySelector(".swmsg"),tm=el.querySelector(".tm"),tap=el.querySelector(".tap"),go=el.querySelector(".go"),res=el.querySelector(".res");
  const key=()=>cfg.pairs[cur].join("-");
  const showBest=()=>{res.textContent=best[key()]?`أحسن رقم إلك: ${best[key()]} تبديل`:"هدفك: 30 تبديل، وبعدين 60"};
  const shape=c=>c.g.map((g,i)=>g&&c.f[i]>0?[g,i,c.f[i]]:null).filter(Boolean);
  const render=()=>{
    const [an,bn]=cfg.pairs[cur],a=CH[an],b=CH[bn],hl=new Set();
    a.f.forEach((f,i)=>{if(f>0&&b.f[i]===f&&a.g[i]===b.g[i])hl.add(i)});
    view.innerHTML=`<div>${chordSVG(a,hl)}<div class="mono" style="text-align:center;font-weight:600">${an}</div></div><span class="arr">⇄</span><div>${chordSVG(b,hl)}<div class="mono" style="text-align:center;font-weight:600">${bn}</div></div>`;
    let m="";
    for(const d of [1,-1]){const sa=shape(a);if(sa.length&&sa.every(([g,i,f])=>b.g[i+d]===g&&b.f[i+d]===f)){const extra=shape(b).filter(([g,i,f])=>!(a.g[i-d]===g&&a.f[i-d]===f)).map(x=>x[0]);m=`<b>نفس الشكل!</b> انقل الأصابع ${sa.map(x=>x[0]).join(" و ")} مع بعض وتر واحد ${d<0?"لفوق (باتجاه الوتر 6)":"لتحت (باتجاه الوتر 1)"}${extra.length?`، وزيد الإصبع ${extra.join(" و ")}`:""}.`}}
    if(!m)m=hl.size?`<b>الإصبع ${[...hl].map(i=>a.g[i]).join(" و ")} ما بيتحرّك</b> (اللي عليه دائرة). خلّيه لازق مكانه وحرّك الباقي حواليه.`:"ما في إصبع ثابت. ارفع كل الأصابع مع بعض كشكل واحد بالهوا، ونزّلهم مع بعض على الكورد الجديد.";
    msg.innerHTML=m;showBest();
  };
  render();
  el.querySelector(".pats").onclick=e=>{const b=e.target.closest(".chip");if(!b||iv)return;cur=+b.dataset.i;el.querySelectorAll(".pats .chip").forEach(x=>x.classList.toggle("on",x===b));render()};
  go.onclick=()=>{
    if(iv)return;count=0;left=60;tm.textContent=left;tap.disabled=false;go.disabled=true;res.textContent="0";
    iv=setInterval(()=>{left--;tm.textContent=left;if(left<=0){clearInterval(iv);iv=null;tap.disabled=true;go.disabled=false;tm.textContent=60;
      const pb=best[key()]||0;if(count>pb){best[key()]=count;try{localStorage.setItem("cm40-best",JSON.stringify(best))}catch(e){}}
      res.textContent=`عملت ${count} تبديل.`+(count>pb?(pb?" رقم جديد!":""):` أحسن رقم: ${pb}`)}},1000);
  };
  tap.onclick=()=>{count++;res.textContent=count;strum(CH[cfg.pairs[cur][count%2]],"D",.22)};
};

W.tone=el=>{
  const O=[["Tasto (دافي)",{cut:1300}],["عادي",{}],["Ponticello (حاد)",{bright:1}],["عادي + Vibrato",{vib:1}]];
  el.innerHTML=`<div class="pats" style="justify-content:center">${O.map((o,i)=>`<button class="chip" data-i="${i}">▶ ${o[0]}</button>`).join("")}</div><p class="cap">نفس النغمتين بالزبط. بس مكان الضربة وهزّة الإصبع بيغيّروا اللون.</p>`;
  el.onclick=e=>{const b=e.target.closest(".chip");if(!b)return;const o=O[+b.dataset.i][1];loadSamples();playMidi(69,0,.55,o);playMidi(67,1.1,.55,o)};
};

W.diag=el=>{
  const D=[
   ["الوتر بيطنّ (زززز)","الإصبع بعيد عن السلك المعدني، أو الضغط قليل، أو إصبع ثاني بيلمس الوتر بخفّة.","قرّب الإصبع لحد ما يصير لازق بالسلك تقريباً. إذا ضل يطنّ، زيد الضغط شعرة. ولسا بيطنّ؟ اعزف الوتر مفتوح: إذا طنّ وهو مفتوح، المشكلة بالجيتار نفسه (الأوتار واطية) مش فيك."],
   ["الصوت مكتوم (تك)","الإصبع نازل فوق السلك نفسه، أو لحم إصبع ثاني ماسك الوتر.","بعّد الإصبع شوي عن السلك لجوّا الفريت. قوّس الأصابع أكتر عشان تكبس بالطرف، ونزّل الرسغ شوي لقدّام."],
   ["أطراف أصابعي بتوجعني","طبيعي أول ٢-٤ أسابيع، لحد ما يتكوّن جلد قاسي.","تدرّب ١٥ دقيقة مرتين باليوم بدل ساعة مرة وحدة. اكبس بأقل ضغط ممكن، وما تنقع إيدك بالمي قبل العزف. إذا صار الوجع حاد أو حسيت بتنميل، وقّف يوم."],
   ["رسغي أو كتفي بيوجعني","القعدة غلط: الجيتار واطي، أو الرسغ مطعوج، أو الإبهام بيعصر الرقبة.","ارفع رأس الجيتار لمستوى عينك، وخلّي الرسغ مستقيم تقريباً. الإبهام ورا الرقبة بيسند بس، ما بيعصر. وخذ استراحة كل ٢٠ دقيقة."],
   ["الجيتار بيفلت دوزانه","الأوتار النايلون الجديدة بتضل تتمطّ لأسبوعين.","مطّ كل وتر بلطف (اسحبه ٢-٣ سم لبرّا على طوله)، ودوزن، وكرّر ٣ مرات. وتأكد إن العقدة عند الجسر مربوطة صح."],
   ["بطيء بتبديل الكوردات","بتحط الأصابع وحدة وحدة، أو بتطلّع على إيدك كل مرة.","اعمل تمرين الدقيقة (درس 14). حرّك الأصابع كشكل واحد، واستعمل الإصبع الثابت، وآخر ضربة قبل التبديل اعزفها أوتار مفتوحة."],
   ["البار ما بيطلع نظيف","بتعصر بالقوة بدل الدقة، أو الوتر واقع بتجعيدة المفصل.","اكبس بجنب السبابة العظمي، واسحب الكوع لورا شوي. حط باقي الأصابع قبل السبابة. ٥ دقايق باليوم وأسبوعين صبر (درس 29)."],
   ["ما عندي وقت أتدرّب","المشكلة غالباً مش بالوقت، هي إن الجيتار محطوط بالشنطة.","طلّع الجيتار من الشنطة وحطّه على ستاند بمكان بتشوفه. ١٠ دقايق باليوم أحسن من ساعتين بالأسبوع."],
   ["حاسس إني مش عم بتحسّن","التطوّر بطيء، وما بتلاحظه يوم بيوم.","صوّر حالك فيديو كل أسبوع وقارن. واعزف أغنية بتحبها، مش بس تمارين."],
  ];
  el.innerHTML=`<div class="diag"><div class="opts">${D.map((d,i)=>`<button class="${i?"":"on"}" data-i="${i}">${d[0]}</button>`).join("")}</div><div class="out"></div></div>`;
  const out=el.querySelector(".out");
  const show=i=>{const d=D[i];out.innerHTML=`<h3 style="margin-bottom:12px">${d[0]}</h3><div class="flow"><div><h4>ليش بيصير</h4><p>${d[1]}</p></div><span class="arr">←</span><div><h4 class="ok">الحل</h4><p>${d[2]}</p></div></div>`};
  show(0);
  el.querySelector(".opts").onclick=e=>{const b=e.target.closest("button");if(!b)return;el.querySelectorAll(".opts button").forEach(x=>x.classList.toggle("on",x===b));show(+b.dataset.i)};
};

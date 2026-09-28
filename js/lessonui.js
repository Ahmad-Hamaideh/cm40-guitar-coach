// Lesson page: tabs (watch / understand / watch out / check), a picture for every step,
// pictures for every mistake, and an optional quiz generated from the lesson itself.
const ICO={
  metro:`<svg viewBox="0 0 200 150"><path d="M70 135 L100 18 L130 135Z" fill="#2C3752" stroke="#E6B04B" stroke-width="4" stroke-linejoin="round"/><line x1="100" y1="118" x2="138" y2="40" stroke="#F1EBDD" stroke-width="5" stroke-linecap="round"/><circle cx="126" cy="64" r="9" fill="#E6B04B"/><rect x="62" y="130" width="76" height="10" rx="4" fill="#E6B04B"/><text x="100" y="100" text-anchor="middle" font-size="18" font-family="IBM Plex Mono,monospace" fill="#F1EBDD">60</text></svg>`,
  ear:`<svg viewBox="0 0 200 150"><path d="M88 40 C88 10 150 10 150 52 C150 80 122 84 120 104 C118 124 96 128 90 112" fill="none" stroke="#E0B08C" stroke-width="9" stroke-linecap="round"/><path d="M106 52 C106 40 130 40 130 56 C130 66 118 68 116 76" fill="none" stroke="#B98463" stroke-width="6" stroke-linecap="round"/><g fill="#E6B04B"><circle cx="38" cy="98" r="9"/><rect x="45" y="50" width="4" height="48"/><circle cx="62" cy="70" r="7"/><rect x="67" y="34" width="4" height="36"/></g></svg>`,
  strum:`<svg viewBox="0 0 200 150"><g stroke="#C4BDB0">${[0,1,2,3,4,5].map(i=>`<line x1="20" y1="${30+i*18}" x2="120" y2="${30+i*18}" stroke-width="${1+i*.4}"/>`).join("")}</g><path d="M150 20 V120 M136 104 L150 124 L164 104" fill="none" stroke="#E6B04B" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/><path d="M182 124 V60 M172 72 L182 56 L192 72" fill="none" stroke="#4FB3A9" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  guitar:`<svg viewBox="0 0 220 150"><g transform="rotate(-30 100 75)"><circle cx="70" cy="80" r="34" fill="#E5BF83"/><circle cx="112" cy="80" r="26" fill="#E5BF83"/><rect x="60" y="54" width="50" height="52" fill="#E5BF83"/><circle cx="100" cy="80" r="11" fill="#1C130D"/><rect x="128" y="75" width="70" height="10" fill="#3A2618"/><rect x="194" y="71" width="18" height="18" rx="3" fill="#5B3920"/></g></svg>`,
};
// ✗ / ✓ pairs for the mistakes beginners make most
const PAIR={
  wrist:`<svg viewBox="0 0 320 150"><text x="80" y="20" text-anchor="middle" font-size="14" fill="#FF7A66">✗ رسغ مطعوج</text><text x="240" y="20" text-anchor="middle" font-size="14" fill="#5FD39A">✓ خط واحد</text><path d="M20 120 L80 100 L96 50" fill="none" stroke="#E0B08C" stroke-width="18" stroke-linecap="round" stroke-linejoin="round"/><path d="M180 120 L250 92 L290 78" fill="none" stroke="#E0B08C" stroke-width="18" stroke-linecap="round" stroke-linejoin="round"/><circle cx="80" cy="100" r="15" fill="none" stroke="#FF7A66" stroke-width="3"/><circle cx="250" cy="92" r="15" fill="none" stroke="#5FD39A" stroke-width="3"/></svg>`,
  thumb:`<svg viewBox="0 0 320 150"><text x="80" y="20" text-anchor="middle" font-size="14" fill="#FF7A66">✗ الإبهام فوق الرقبة</text><text x="240" y="20" text-anchor="middle" font-size="14" fill="#5FD39A">✓ الإبهام وراها بالنص</text>${[80,240].map((x,i)=>`<path d="M${x-60},70 Q${x},140 ${x+60},70Z" fill="#8C5B34"/><rect x="${x-60}" y="62" width="120" height="9" rx="2" fill="#3A2618"/>${i?`<ellipse cx="${x}" cy="118" rx="18" ry="10" fill="#E0B08C" stroke="#B98463" stroke-width="2"/>`:`<path d="M${x-50},98 Q${x-70},60 ${x-40},40" fill="none" stroke="#E0B08C" stroke-width="16" stroke-linecap="round"/>`}`).join("")}</svg>`,
  tempo:`<svg viewBox="0 0 320 150"><text x="80" y="20" text-anchor="middle" font-size="14" fill="#FF7A66">✗ سريع وملخبط</text><text x="240" y="20" text-anchor="middle" font-size="14" fill="#5FD39A">✓ بطيء ومنتظم</text><g fill="#FF7A66">${[20,34,70,82,120].map((x,i)=>`<circle cx="${x+10}" cy="${80+(i%2)*14}" r="7"/>`).join("")}</g><g fill="#5FD39A">${[0,1,2,3].map(i=>`<circle cx="${190+i*30}" cy="86" r="7"/>`).join("")}</g></svg>`,
};
const pickPair=t=>/مسطّح|بيكتم|يكتم|بيلمس|قوّس|طرف الإصبع|بعيد عن السلك|فوق السلك|تضغط/.test(t)?SVG_PRESS:/رسغ|السلطعون/.test(t)?PAIR.wrist:/إبهام|تعصر|عصر/.test(t)?PAIR.thumb:/تسرّع|بتسرّع|السرعة|الإيقاع|بتوقّف|بتستعجل/.test(t)?PAIR.tempo:/الوتر 6|الوتر 5|ابدأ الضربة/.test(t)?SVG_CHORDREAD:"";

function lessonChords(l){
  const s=new Set();
  l.figs.forEach(f=>{if(typeof f==="string")return;const c=f.cfg||{};(c.list||[]).forEach(x=>s.add(x));(c.pairs||[]).flat().forEach(x=>s.add(x));(c.tracks||[]).forEach(t=>t.ev.forEach(e=>e.c&&!/^H/.test(e.c)&&s.add(e.c)))});
  return [...s];
}
function miniFret(st,fr){
  const F=Math.max(4,fr+1),B=fbBase(F),[x,y]=B.pos(st,fr);
  return B.s+dot(x,y,fr||"0","var(--accent)","var(--accent-ink)",13)+`</svg>`;
}
const ARCH=()=>`<svg viewBox="0 0 360 236">${sideSVG({1:[2,1],2:[4,2],3:[3,2]},null,false)}</svg>`;
function stepPic(t,l,chs){
  const plain=t.replace(/<[^>]+>/g,"");
  const cm=/E A D G B E/.test(plain)?[]:chs.filter(c=>new RegExp(`(^|[^A-Za-z])${c}($|[^A-Za-z0-9])`).test(plain));
  if(cm.length)return `<div class="chrow">${cm.slice(0,3).map(c=>`<div><b class="mono">${c}</b>${chordSVG(CH[c])}</div>`).join("")}</div>`;
  const sm=plain.match(/الوتر (\d)[^\d]{0,12}فريت (\d+)/);if(sm)return `<div class="fbwrap">${miniFret(+sm[1],+sm[2])}</div>`;
  const R=[[/قعد|كرسي|رجلك|ظهرك|مسند/,SVG_POSTURE],[/دوزن|دوزان|تطبيق|التموّج/,SVG_TUNE5],[/التاب|الخط الفوقاني/,SVG_TABREAD],[/رسمة الكورد|العتبة|الخطوط الواقفة/,SVG_CHORDREAD],
    [/بار|السبابة مستقيمة|جنب الإصبع/,SVG_BARRE_F],[/Hammer|Pull|h:|p:/i,SVG_SLUR],[/دُم|تَك|مقسوم|بلدي|إيقاع/,SVG_RHYTHMS],[/تضرب|الضرب|البندول|↓/,ICO.strum],
    [/p i m a|الإيد اليمين|a m i|ساعدك|طابة تنس/,SVG_PIMA],[/مترونوم|السرعة|على \d+/,ICO.metro],[/اسمع|غنّي|أذن/,ICO.ear],
    [/مقام|نهاوند|حجاز|كرد/,SVG_MAQAM],[/نوتة|الخطوط من تحت|مستديرة/,SVG_DUR],[/هارمونك|فوق السلك تماماً/,SVG_HARM],[/تريمولو|p a m i/,SVG_TREMOLO],
    [/اكبس|الإصبع|الأصابع|السلك|قوّس/,null]];
  for(const [re,svg] of R)if(re.test(plain))return svg||ARCH();
  const own=l.figs.find(f=>typeof f==="string");if(own)return own;
  if(chs.length)return `<div class="chrow">${chs.slice(0,3).map(c=>`<div><b class="mono">${c}</b>${chordSVG(CH[c])}</div>`).join("")}</div>`;
  const co=l.figs.find(f=>f.w==="coach"),n=co&&co.cfg.tracks[0].ev.find(e=>e.n);
  if(n){const [s,f]=n.n[0];return `<div class="fbwrap">${miniFret(s,f)}</div>`}
  return ICO.guitar;
}

function makeQuiz(l){
  const R=rng(l.no*97+13),pick=a=>a[Math.floor(R()*a.length)],shuf=a=>a.map(v=>[R(),v]).sort((x,y)=>x[0]-y[0]).map(x=>x[1]);
  const pool=ALL.filter(x=>x!==l).flatMap(x=>x.mist.map(m=>m[1])),qs=[];
  l.mist.slice(0,2).forEach(([x,ok])=>{const w=new Set();while(w.size<2)w.add(pick(pool));qs.push({q:`<b>المشكلة:</b> ${x}. شو الحل الصح؟`,opts:shuf([ok,...w]),a:ok})});
  const chs=lessonChords(l);
  if(chs.length){const c=pick(chs),o=new Set(),all=Object.keys(CH).filter(k=>!/^H/.test(k)&&k!==c);while(o.size<2)o.add(pick(all));qs.push({pic:chordSVG(CH[c]),q:"أي كورد هاد؟",opts:shuf([c,...o]),a:c})}
  else{const st=1+Math.floor(R()*3),fr=[0,1,3][Math.floor(R()*3)],n=noteOf(st,fr),a=NOTE_AR[n]||n,o=new Set();while(o.size<2){const v=pick(Object.values(NOTE_AR));if(v!==a)o.add(v)}
    qs.push({pic:`<div class="fbwrap">${miniFret(st,fr)}</div>`,q:"شو اسم هالنغمة؟ (اسمعها كمان)",opts:shuf([a,...o]),a,snd:[st,fr]})}
  return qs;
}

function lessonBody(l,host){
  const chs=lessonChords(l),qs=makeQuiz(l);
  let best={};try{best=JSON.parse(localStorage.getItem("cm40-quiz"))||{}}catch(e){}
  host.innerHTML=`<div class="ltabs" role="tablist">${[["watch","شوف"],["learn","افهم"],["warn","انتبه"],["quiz","اتأكد"]].map(([k,t],i)=>`<button role="tab" class="${i?"":"on"}" data-t="${k}">${t}${k==="quiz"&&best[l.id]!=null?` <small class="mono">${best[l.id]}/${qs.length}</small>`:""}</button>`).join("")}</div>
  <section class="lt" data-t="watch"><div class="figs"></div><div class="trick"><b>تريك:</b> ${l.trick}</div></section>
  <section class="lt" data-t="learn" hidden><div class="slides">${l.steps.map((s,i)=>`<div class="slide"${i?" hidden":""}><div class="spic">${stepPic(s,l,chs)}</div><div class="stext"><span class="sn mono">${i+1} / ${l.steps.length}</span><p>${s}</p></div></div>`).join("")}</div>
    <div class="snav"><button class="btn ghost sp">السابقة</button><span class="sdots">${l.steps.map((_,i)=>`<i class="${i?"":"on"}"></i>`).join("")}</span><button class="btn sn2">الجاية</button></div></section>
  <section class="lt" data-t="warn" hidden><div class="mgrid">${l.mist.map(([x,o])=>{const p=pickPair(x+" "+o)||stepPic(o,l,chs);return `<div class="mcard">${p?`<div class="mpic">${p}</div>`:""}<p class="x">✗ ${x}</p><p class="ok">✓ ${o}</p></div>`}).join("")}</div></section>
  <section class="lt" data-t="quiz" hidden><p class="meta">٣ أسئلة سريعة، اختيارية. بتساعدك تتأكد إنك فهمت.</p><div class="quiz"></div></section>`;
  const tabs=host.querySelectorAll(".ltabs button"),secs=host.querySelectorAll(".lt");
  host.querySelector(".ltabs").onclick=e=>{const b=e.target.closest("button");if(!b)return;tabs.forEach(x=>x.classList.toggle("on",x===b));secs.forEach(s=>s.hidden=s.dataset.t!==b.dataset.t)};
  const slides=[...host.querySelectorAll(".slide")],dots=[...host.querySelectorAll(".sdots i")];let si=0;
  const go=i=>{si=(i+slides.length)%slides.length;slides.forEach((s,k)=>s.hidden=k!==si);dots.forEach((d,k)=>d.classList.toggle("on",k===si))};
  host.querySelector(".sp").onclick=()=>go(si-1);host.querySelector(".sn2").onclick=()=>go(si+1);
  const qz=host.querySelector(".quiz");let qi=0,score=0;
  const showQ=()=>{
    if(qi>=qs.length){const msg=score===qs.length?"ممتاز! فهمت الدرس.":score?"منيح. ارجع لتبويب «افهم» وشوف اللي فاتك.":"ارجع لتبويب «افهم» وجرّب مرة ثانية.";
      qz.innerHTML=`<div class="qdone"><b class="mono">${score}/${qs.length}</b><p>${msg}</p><button class="btn ghost qre">جرّب مرة ثانية</button></div>`;
      best[l.id]=Math.max(best[l.id]||0,score);try{localStorage.setItem("cm40-quiz",JSON.stringify(best))}catch(e){}
      qz.querySelector(".qre").onclick=()=>{qi=0;score=0;showQ()};return}
    const q=qs[qi];
    qz.innerHTML=`<div class="qcard"><span class="sn mono">${qi+1} / ${qs.length}</span>${q.pic?`<div class="qpic">${q.pic}</div>`:""}<p class="qq">${q.q}</p><div class="qopts">${q.opts.map((o,k)=>`<button class="qo" data-k="${k}">${o}</button>`).join("")}</div><p class="qfb"></p></div>`;
    if(q.snd)playSF(q.snd[0],q.snd[1]);
    const right=x=>q.opts[+x.dataset.k]===q.a;
    qz.querySelectorAll(".qo").forEach(b=>b.onclick=()=>{
      if(qz.querySelector(".qo.good"))return;const ok=right(b);if(ok)score++;
      qz.querySelectorAll(".qo").forEach(x=>{if(right(x))x.classList.add("good");else if(x===b)x.classList.add("badc")});
      qz.querySelector(".qfb").innerHTML=(ok?"صح! ":"مش هاد. ")+`<button class="btn ghost qn">${qi<qs.length-1?"السؤال الجاي":"النتيجة"}</button>`;
      qz.querySelector(".qn").onclick=()=>{qi++;showQ()}});
  };
  showQ();
  return host.querySelector(".figs");
}

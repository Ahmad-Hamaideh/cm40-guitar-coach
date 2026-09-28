// Routing and page assembly: home, lessons, libraries, practice, progress, help; plus the tools panel.
const KEY="cm40-progress";
let done={};
try{done=JSON.parse(localStorage.getItem(KEY))||{}}catch(e){}
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(done))}catch(e){}};

const ALL=[];UNITS.forEach(u=>u.lessons.forEach(l=>{l.u=u;l.no=ALL.length+1;ALL.push(l)}));
const view=document.getElementById("view");
const FOOT=`<footer>التقدّم محفوظ على هاد الجهاز والمتصفح بس.<br>المصادر: <a href="https://www.thisisclassicalguitar.com/free-classical-guitar-method-book-pdf/" target="_blank" rel="noopener">Bradford Werner (This is Classical Guitar)</a> · <a href="https://www.justinguitar.com/classes/beginner-guitar-course-grade-one" target="_blank" rel="noopener">JustinGuitar</a> · <a href="http://www.guitarabia.com/" target="_blank" rel="noopener">جيتارابيا</a> (ترتيب كوردات الأغاني، فطابقه مع الأصلي). صوت الجيتار: FluidR3 GM (رخصة MIT).</footer>`;

function renderHome(){
  const n=ALL.filter(l=>done[l.id]).length,nx=ALL.find(l=>!done[l.id])||ALL[0],st=streak(),mins=Math.round(Object.values(LS("cm40-log",{})).reduce((a,b)=>a+b,0));
  const plan=sessionPlan(),total=plan.reduce((a,s)=>a+s.min,0);
  const tiles=[["#/chords","مكتبة الكوردات",`${LIB.length} كورد بالإيد والصوت`,`<div class="tpic">${chordSVG(CH.Am)}</div>`],["#/songs","مكتبة الأغاني",`${SONGS.length} أغاني ومقطوعات`,`<div class="tpic">${ICO.guitar}</div>`],["#/ear","تدريب الأذن","كبير ولا صغير، المسافات، الأوتار",`<div class="tpic">${ICO.ear}</div>`],["#/progress","تقدّمي","أيام، دقايق، أرقام",`<div class="tpic">${ICO.metro}</div>`]];
  view.innerHTML=`<section class="dash">
    <div class="dhero"><div class="eyebrow">Yamaha CM40 · جيتار كلاسيك</div><h1>${n?"أهلاً رجعت!":"أهلاً! يلا نبلّش"}</h1>
      <p class="lead">جيتار كامل وإيدين بيعزفوا قدّامك بصوت حقيقي، وبعدين دورك. والمايك بيسمعك وبيستنّاك لحد ما تعزف صح.</p>
      <div class="dstats"><div><b class="mono">${st}</b><span>يوم ورا بعض</span></div><div><b class="mono">${n}/${ALL.length}</b><span>درس</span></div><div><b class="mono">${mins}</b><span>دقيقة تمرين</span></div></div></div>
    <a class="dtoday" href="#/today"><span class="tag">تمرين اليوم · ${total} دقيقة</span><h2>جلستك جاهزة</h2><ol>${plan.map(s=>`<li>${s.t}<span class="meta">${s.min} د</span></li>`).join("")}</ol><span class="btn big">ابدأ التمرين</span></a>
  </section>
  <a class="dnext" href="#/l/${nx.id}"><span class="meta">${n?"كمّل من وين وقفت":"أول درس"}</span><b>درس ${nx.no} · ${nx.t}</b><span class="meta">${nx.goal}</span></a>
  <div class="dtiles">${tiles.map(([h,t,d,p])=>`<a class="dtile" href="${h}">${p}<b>${t}</b><span class="meta">${d}</span></a>`).join("")}</div>
  <h2 class="sech">كل الدروس</h2>
  <div class="units">${UNITS.map(u=>{const d=u.lessons.filter(l=>done[l.id]).length;return `<section class="ucard" id="u${u.id}"><span class="tag">الوحدة ${u.id}</span><h3>${u.name}</h3><p class="meta">${u.sub}</p><div class="bar"><i style="width:${d/u.lessons.length*100}%"></i></div>
    <ol>${u.lessons.map(l=>`<li class="${done[l.id]?"done":""}"><a href="#/l/${l.id}"><span class="n mono">${l.no}</span><i></i><span class="t">${l.t}</span><span class="meta">${l.m} د</span></a></li>`).join("")}</ol></section>`}).join("")}</div>
  <p style="margin-top:28px"><a href="#/help">عندك مشكلة؟ عيادة المشاكل والروتين اليومي ←</a></p>${FOOT}`;
}

function renderLesson(l){
  const prev=ALL[l.no-2],next=ALL[l.no];
  view.innerHTML=`${crumb(`<a href="#/">كل الدروس</a><span>›</span><span>الوحدة ${l.u.id}: ${l.u.name}</span><span>›</span><span>درس ${l.no} من ${ALL.length}</span>`)}
  <article class="lesson" id="${l.id}"><header class="lh"><span class="ln">درس ${l.no}</span><h2>${l.t}</h2><span class="meta">${l.m} دقيقة</span></header>
    <p class="goal"><b>الهدف:</b> ${l.goal}</p><div class="lbody"></div>
    <div class="foot"><div class="vids">${l.vids.length?l.vids.map(([t,h])=>`<a href="${h}" target="_blank" rel="noopener">${ICON_PLAY}${t}</a>`).join(""):`<span class="meta">هاد الدرس ما بدّه فيديو، الرسمات بتكفّي.</span>`}</div>
    <label class="done"><input type="checkbox" data-l="${l.id}" ${done[l.id]?"checked":""}> خلّصت الدرس</label></div></article>
  <nav class="lnav">${prev?`<a href="#/l/${prev.id}"><small>الدرس اللي قبل</small>${prev.no}. ${prev.t}</a>`:"<span></span>"}${next?`<a class="nx" href="#/l/${next.id}"><small>الدرس الجاي</small>${next.no}. ${next.t}</a>`:`<a class="nx" href="#/"><small>خلّصت الدورة!</small>رجوع للرئيسية</a>`}</nav>`;
  const figs=lessonBody(l,view.querySelector(".lbody"));
  l.figs.forEach(f=>{try{mountFig(figs,f)}catch(err){console.error(l.id,err)}});
}

function renderHelp(){
  view.innerHTML=`${crumb("<span>عيادة المشاكل</span>")}
  <div class="uh"><span class="tag">عيادة المشاكل</span><h2>شو المشكلة؟</h2><p>اختار اللي عم يصير معك، وبتعرف السبب والحل.</p></div><div class="w-diag"></div>
  <div class="uh" style="margin-top:48px"><span class="tag">روتين يومي</span><h2>٣٠ دقيقة كل يوم أحسن من ٣ ساعات يوم الجمعة</h2><p>صفحة «تمرين اليوم» بتبنيلك هاد الروتين لحالها.</p></div>
  <div class="tablewrap"><table class="plan"><tr><th>الوقت</th><th>شو تعمل</th><th>ليش</th></tr>
  <tr><td class="m">5 د</td><td>دوزان بالمايك + الكروماتيك (درس 10)</td><td>تسخين وتنسيق بين الإيدين</td></tr>
  <tr><td class="m">10 د</td><td>الدرس الحالي بوضع «بستنّاك» أو «هو بيعزف وبعدين أنا»</td><td>هون بيصير التطوّر الحقيقي</td></tr>
  <tr><td class="m">5 د</td><td>تمرين الدقيقة على أصعب زوج كوردات</td><td>أسرع طريق للأغاني</td></tr>
  <tr><td class="m">10 د</td><td>أغنية من المكتبة، وحدّد الجزء الصعب بـ A–B</td><td>عشان تضل مبسوط وما تزهق</td></tr></table></div>${FOOT}`;
  W.diag(view.querySelector(".w-diag"));
}

const ROUTES=[
  [/^#(?:\/l\/)?(n\d+)$/,m=>{const l=ALL.find(x=>x.id===m[1]);if(!l)return false;renderLesson(l);return l.t}],
  [/^#\/chords\/(.+)$/,m=>{renderChord(view,decodeURIComponent(m[1]));return `${decodeURIComponent(m[1])} · الكوردات`},"#/chords"],
  [/^#\/chords$/,()=>{renderChords(view);return "مكتبة الكوردات"},"#/chords"],
  [/^#\/songs\/(.+)$/,m=>{renderSong(view,m[1]);return "مكتبة الأغاني"},"#/songs"],
  [/^#\/songs$/,()=>{renderSongs(view);return "مكتبة الأغاني"},"#/songs"],
  [/^#\/today$/,()=>{renderToday(view);return "تمرين اليوم"},"#/today"],
  [/^#\/progress$/,()=>{renderProgress(view);return "تقدّمي"},"#/progress"],
  [/^#\/ear$/,()=>{renderEar(view);return "تدريب الأذن"},"#/ear"],
  [/^#\/help/,()=>{renderHelp();return "عيادة المشاكل"},"#/help"],
];
function route(){
  stopAll();const h=location.hash;let title=null,nav="#/";
  for(const [re,fn,key] of ROUTES){const m=h.match(re);if(m){title=fn(m);if(title!==false){nav=key||"#/";break}title=null}}
  if(!title)renderHome();
  document.title=title?`${title} · مدرّب CM40`:"مدرّب CM40";
  document.querySelectorAll("#topnav a,#botnav a").forEach(a=>a.classList.toggle("on",a.getAttribute("href")===nav));
  window.scrollTo(0,0);
}
view.addEventListener("change",e=>{const l=e.target.dataset.l;if(l){done[l]=e.target.checked;save()}});
addEventListener("hashchange",route);
route();

// ---- tools panel ----
const tools=document.getElementById("tools"),tbtn=document.getElementById("toolsBtn");
const openTools=o=>{tools.hidden=!o;tbtn.classList.toggle("on",o);tbtn.setAttribute("aria-expanded",o);if(o)tools.scrollIntoView({block:"nearest"})};
tbtn.onclick=()=>openTools(tools.hidden);
document.addEventListener("click",e=>{if(e.target.closest("[data-open-tools]")){e.preventDefault();openTools(true);window.scrollTo(0,0)}});
W.mtuner(document.getElementById("mtuner"));

const sEl=document.getElementById("strings");let loopT=null;
const clearOn=()=>sEl.querySelectorAll("button").forEach(x=>x.classList.remove("on"));
const ring=st=>playMidi(OPEN_MIDI[st-1],0,.6,{dur:3});
[6,5,4,3,2,1].forEach(st=>{
  const b=document.createElement("button");b.innerHTML=`<b>${SNAME[st-1]}</b><small>وتر ${st}</small>`;
  b.onclick=()=>{loadSamples();clearInterval(loopT);clearOn();b.classList.add("on");ring(st);
    if(document.getElementById("loop").checked)loopT=setInterval(()=>ring(st),2600);
    else setTimeout(()=>b.classList.remove("on"),1500)};
  sEl.appendChild(b);
});
document.getElementById("loop").onchange=e=>{if(!e.target.checked){clearInterval(loopT);clearOn()}};

let bpm=60,running=false,next=0,beat=0,timer=null;
const bpmIn=document.getElementById("bpm"),bpmV=document.getElementById("bpmV"),dots=[...document.querySelectorAll("#beats span")];
const setBpm=v=>{bpm=Math.max(40,Math.min(200,v));bpmIn.value=bpm;bpmV.textContent=bpm};
bpmIn.oninput=e=>setBpm(+e.target.value);
document.getElementById("minus").onclick=()=>setBpm(bpm-5);
document.getElementById("plus").onclick=()=>setBpm(bpm+5);
function mtick(){const c=ac();while(next<c.currentTime+.1){const b=beat;click(next,b===0);setTimeout(()=>dots.forEach((d,i)=>d.classList.toggle("on",i===b)),Math.max(0,(next-c.currentTime)*1000));next+=60/bpm;beat=(beat+1)%4}}
document.getElementById("metBtn").onclick=e=>{running=!running;e.target.textContent=running?"وقّف":"شغّل";
  if(running){next=ac().currentTime+.05;beat=0;timer=setInterval(mtick,25)}else{clearInterval(timer);dots.forEach(d=>d.classList.remove("on"))}};

setTimeout(loadSamples,1200);
if("serviceWorker" in navigator&&location.protocol==="https:")navigator.serviceWorker.register("sw.js").catch(()=>{});

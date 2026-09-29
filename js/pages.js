// Chord library, song library, today's practice, progress and ear training.
const LS=(k,d)=>{try{return JSON.parse(localStorage.getItem(k))||d}catch(e){return d}};
const LSset=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}};
const dayKey=d=>new Date(d.getTime()-d.getTimezoneOffset()*6e4).toISOString().slice(0,10);
// The player and the today-timer can run at the same time, so keep the union of logged spans and count each second once.
const LOGGED=[];
function logPractice(sec,id){if(sec<5)return;const b=Date.now(),a=b-sec*1000;let add=b-a;
  LOGGED.forEach(([x,y])=>add-=Math.max(0,Math.min(b,y)-Math.max(a,x)));
  LOGGED.push([a,b]);LOGGED.sort((p,q)=>p[0]-q[0]);for(let i=LOGGED.length-1;i>0;i--)if(LOGGED[i][0]<=LOGGED[i-1][1]){LOGGED[i-1][1]=Math.max(LOGGED[i-1][1],LOGGED[i][1]);LOGGED.splice(i,1)}
  if(add>=1000){const log=LS("cm40-log",{}),k=dayKey(new Date());log[k]=Math.round(((log[k]||0)+add/6e4)*10)/10;LSset("cm40-log",log)}
  if(id){const st=ST();st[id]=st[id]||{};st[id].prac=Math.round((st[id].prac||0)+sec);LSset("cm40-st",st)}}
// Per-lesson state, kept apart from "mastered" (the done checkbox): seen, practice seconds, note check, rhythm exam.
const ST=()=>LS("cm40-st",{});
function setSt(id,k,v){const st=ST();st[id]=st[id]||{};st[id][k]=v;LSset("cm40-st",st)}
const hasCoach=l=>l.figs.some(f=>f.w==="coach");
function streak(){const log=LS("cm40-log",{});let n=0,d=new Date();if(!log[dayKey(d)])d=new Date(d-864e5);while(log[dayKey(d)]){n++;d=new Date(d-864e5)}return n}
const crumb=h=>`<nav class="crumb"><a href="#/">الرئيسية</a><span>›</span>${h}</nav>`;
const mountFig=(host,f)=>{const d=document.createElement("div");d.className="fig";host.appendChild(d);if(typeof f==="string")d.innerHTML=f;else W[f.w](d,f.cfg||{});return d};

// ---------- chords ----------
const LIB=["Em","Am","E","A","Dm","D","E7","C","G","Fmaj7","B7","F","Bm","F#","Gm"];
const LVL={Em:1,Am:1,E:1,A:1,Dm:1,D:1,E7:1,C:2,G:2,Fmaj7:2,B7:2,F:3,Bm:3,"F#":3,Gm:3},LVLN=["","سهل","متوسط","بار"];
const chordLessons=c=>ALL.filter(l=>lessonChords(l).includes(c));
const chordNotes=c=>[...new Set(CH[c].f.map((f,i)=>f<0?null:NOTE_EN[(OPEN_MIDI[5-i]+f)%12]).filter(Boolean))].map(n=>NOTE_AR[n]?`${NOTE_AR[n]} (${n})`:n);
const nearChords=c=>{const a=CH[c];return LIB.filter(x=>x!==c).map(x=>{const b=CH[x];let k=0;a.f.forEach((f,i)=>{if(f>0&&b.f[i]===f&&a.g[i]===b.g[i])k++});return [x,k]}).filter(x=>x[1]).sort((p,q)=>q[1]-p[1]).slice(0,4).map(x=>x[0])};
const sideOf=c=>{const ch=CH[c],m={};ch.f.forEach((f,i)=>{const g=ch.g[i];if(g&&f>0&&!(ch.barre&&g===1&&f===ch.barre))m[g]=[6-i,f]});return `<svg viewBox="0 0 360 236">${sideSVG(m,ch.barre?{fr:ch.barre,bf:ch.bf}:null,false)}</svg>`};

function renderChords(view){
  view.innerHTML=`${crumb("<span>مكتبة الكوردات</span>")}<div class="uh"><span class="tag">مكتبة الكوردات</span><h2>كل كورد بالإيد والصوت</h2><p>اضغط «اسمع» لتسمعه، أو افتحه لتشوف الإيدين وهم بيعزفوه، ومعه كوردات قريبة منه تتمرّن تتنقّل بينهم.</p></div>
  <div class="ctrl"><input type="search" class="csearch" placeholder="دوّر: Am، صغير، بار…" aria-label="دوّر على كورد"><div class="pats cf">${["الكل","سهل","متوسط","بار"].map((t,i)=>`<button class="chip${i?"":" on"}" data-l="${i}">${t}</button>`).join("")}</div></div>
  <div class="libgrid">${LIB.map(c=>`<article class="lcard" data-c="${c}" data-l="${LVL[c]}" data-s="${c.toLowerCase()} ${CH[c].ar} ${LVLN[LVL[c]]}"><header><b class="mono">${c}</b><span class="meta">${CH[c].ar}</span><span class="lv l${LVL[c]}">${LVLN[LVL[c]]}</span></header><div class="lpics">${chordSVG(CH[c])}${sideOf(c)}</div><div class="ctrl"><button class="btn ghost lplay">▶ اسمع</button><a class="btn" href="#/chords/${encodeURIComponent(c)}">افتح مع المدرّب</a></div></article>`).join("")}</div>`;
  let lv=0,q="";const cards=[...view.querySelectorAll(".lcard")];
  const filt=()=>cards.forEach(k=>k.hidden=(lv&&+k.dataset.l!==lv)||(q&&!k.dataset.s.includes(q)));
  view.querySelector(".csearch").oninput=e=>{q=e.target.value.trim().toLowerCase();filt()};
  view.querySelector(".cf").onclick=e=>{const b=e.target.closest(".chip");if(!b)return;lv=+b.dataset.l;view.querySelectorAll(".cf .chip").forEach(x=>x.classList.toggle("on",x===b));filt()};
  view.querySelectorAll(".lplay").forEach(b=>b.onclick=()=>{loadSamples();strum(CH[b.closest(".lcard").dataset.c])});
}
function renderChord(view,c){
  if(!LIB.includes(c))return renderChords(view);
  const ls=chordLessons(c),nr=nearChords(c);
  view.innerHTML=`${crumb(`<a href="#/chords">مكتبة الكوردات</a><span>›</span><span>${c}</span>`)}
  <article class="lesson"><header class="lh"><h2 class="mono">${c}</h2><span class="meta">${CH[c].ar} · ${LVLN[LVL[c]]}</span></header><div class="figs"></div>
  <div class="cols"><div><h4>النغمات جوّا الكورد</h4><p>${chordNotes(c).join("، ")}</p><h4 style="margin-top:12px">من وين بتبلّش الضربة</h4><p>من الوتر ${BASS[c]}${BASS[c]<6?`، والأوتار ${[6,5,4].filter(s=>s>BASS[c]).join(" و ")} لا تعزفها`:"، وكل الأوتار بترن"}.</p></div>
  <div><h4>كوردات قريبة منه</h4><div class="pats">${nr.map(x=>`<a class="chip" href="#/chords/${encodeURIComponent(x)}">${x}</a>`).join("")||"<span class='meta'>ما في كورد بيشاركه أصابع</span>"}</div><h4 style="margin-top:12px">بأي دروس</h4><div class="pats">${ls.map(l=>`<a class="chip" href="#/l/${l.id}">${l.no}. ${l.t}</a>`).join("")}</div></div></div></article>`;
  const figs=view.querySelector(".figs");
  mountFig(figs,{w:"coach",cfg:{tracks:[{n:"ضرب",bpm:70,ev:patEv([[c],[c]],P4),d:"٤ ضربات لتحت. شوف الأصابع من فوق ومن الجنب."},{n:"أربيج",bpm:70,ev:arpEv([c,c],[["B","p"],[3,"i"],[2,"m"],[1,"a"]]),d:"وتر وتر: إذا في وتر مكتوم عندك، بتسمع الفرق هون."}]}});
  if(nr.length)mountFig(figs,{w:"sw",cfg:{pairs:nr.slice(0,3).map(x=>[c,x])}});
}

// ---------- songs ----------
const SONGS=[
  {id:"ode",arr:"mel",t:"نشيد الفرح",by:"بيتهوفن",lvl:1,kind:"لحن",lesson:"n9"},
  {id:"etude",arr:"ex",t:"دراسة على النهاوند",by:"المدرّب",lvl:2,kind:"أربيج",lesson:"n27"},
  {id:"kan",arr:"acc",t:"كان عنّا طاحون",by:"فيروز",lvl:2,kind:"كوردات · مقسوم",lesson:"n16",src:V.kan},
  {id:"nassam1",arr:"acc",t:"نسّم علينا الهوى (أول سطر)",by:"فيروز",lvl:2,kind:"كوردات · بلدي",lesson:"n21",src:V.nassam},
  {id:"romanza",arr:"part",t:"Romanza (البداية)",by:"مجهول",lvl:3,kind:"كلاسيك",lesson:"n22",src:V.rom},
  {id:"eastern",arr:"ex",t:"Em Am B7 Em",by:"تسلسل شرقي",lvl:3,kind:"كوردات",lesson:"n30"},
  {id:"nassam",arr:"acc",t:"نسّم علينا الهوى (كاملة)",by:"فيروز",lvl:3,kind:"كوردات بالـ F",lesson:"n32",src:V.nassam},
  {id:"anda",arr:"ex",t:"الكادانس الأندلسي",by:"فلامنكو",lvl:4,kind:"رازغيادو",lesson:"n34"},
  // chord order from Guitarabia (chords only); each inner array is one bar
  {id:"bektob",t:"بكتب اسمك",by:"فيروز",lvl:2,kind:"كوردات",lesson:"n16",src:["بكتب اسمك على جيتارابيا","http://www.guitarabia.com/songs/451/bektob-esmak-arabic-tabs-and-chords"],
   bars:[["Dm"],["Am"],["Dm"],["Am"],["Am"],["E"],["Am"],["Dm"],["Dm"],["Am"],["Am"],["E"],["Am"],["Dm"],["Am"],["Dm"],["E"],["C"],["Am"],["Dm"],["G"]],secs:{0:"المقدمة",2:"مقطع 1",14:"مقطع 2"}},
  {id:"osad",t:"قصاد عيني",by:"عمرو دياب",lvl:2,kind:"كوردات",lesson:"n16",src:["قصاد عيني على جيتارابيا","http://www.guitarabia.com/songs/70/osad-3aini-arabic-tabs-and-chords"],
   bars:[["C","Am"],["Am","G"],["Am","G"],["G","C"],["E","Am"],["G","C"],["E","Am"],["Am","G"],["Am","G"]]},
  {id:"sakran",t:"حنّا السكران",by:"فيروز",lvl:3,kind:"كوردات",lesson:"n21",src:["حنّا السكران على جيتارابيا","http://www.guitarabia.com/songs/8/7anna-elsakran-arabic-tabs-and-chords"],
   bars:[["Em"],["E"],["Am"],["Dm"],["Am"],["Am"],["Dm"],["E"],["Am"],["E"],["F"],["G"],["Am"],["E"],["F"],["G"],["Am"]],secs:{0:"المقدمة",1:"مقطع",8:"اللازمة"}},
  {id:"amar",t:"نحنا والقمر جيران",by:"فيروز",lvl:3,kind:"كوردات",lesson:"n21",src:["نحنا والقمر جيران على جيتارابيا","http://www.guitarabia.com/songs/10/nehna-wel-amar-jeran-arabic-tabs-and-chords"],
   bars:[["Dm"],["Am"],["E"],["C"],["Dm"],["Am"],["E"],["C"],["E"],["F"],["G"],["Am"],["E"],["F"],["G"],["Am"],["Dm"],["Am"],["E"],["C"]],secs:{0:"مقطع",8:"اللازمة",16:"رجعة"}},
  {id:"tamally",t:"تملّي معاك",by:"عمرو دياب",lvl:3,kind:"كوردات · كابو 3",capo:3,lesson:"n21",src:["تملّي معاك على جيتارابيا","http://www.guitarabia.com/2011/artists/amr-diab/%D8%AA%D9%85%D9%84%D9%8A-%D9%85%D8%B9%D8%A7%D9%83/"],
   bars:[["Am"],["C"],["G"],["Dm"],["Am"],["Am"],["E"],["C"],["G"],["Dm"],["Am"],["Am"],["Dm"],["Am"],["G"],["C"],["E"],["C"],["G"],["Dm"],["F"],["Am"]],secs:{0:"المقدمة",12:"الغنا"}},
  {id:"nour",t:"نور العين",by:"عمرو دياب",lvl:3,kind:"إيقاع إسباني · كابو 3",capo:3,lesson:"n21",src:["نور العين على جيتارابيا","http://www.guitarabia.com/songs/2/nour-al-ain-arabic-tabs-and-chords"],
   bars:[["Am"],["Dm"],["Dm"],["E"],["Dm"],["E"],["Dm"],["E"],["Am"],["Dm"],["E"],["Am"],["Am"],["E"],["Dm"],["E"],["Dm"],["E"],["F"],["G"],["Am"],["E"],["Dm"],["Am"],["E"],["Dm"],["E"],["Am"]],secs:{0:"المقدمة",8:"الموسيقى",21:"مقطع",24:"اللازمة"}},

  {id:"leila",t:"الليلة",by:"عمرو دياب",lvl:2,kind:"كوردات · إيقاع إسباني · كابو 3",capo:3,lesson:"n16",src:["الليلة على جيتارابيا","http://www.guitarabia.com/ar/2013/artists/amr-diab/%D8%A7%D9%84%D9%84%D9%8A%D9%84%D9%87/"],
   bars:[["Am"],["Dm"],["Dm"],["E"],["Am"]]},
  {id:"wmalo",t:"ومالو",by:"عمرو دياب",lvl:3,kind:"كوردات · كابو 7",capo:7,lesson:"n21",src:["ومالو على جيتارابيا","http://www.guitarabia.com/ar/2012/artists/amr-diab/%D9%88%D9%85%D8%A7%D9%84%D9%88/"],
   bars:"Dm Am Dm G Dm C Am G E G Dm C Dm C Dm Am Dm Am G Dm Am E G Dm Am C C G Am E Dm F C G Am E F F Dm Am G Dm Am E Dm Am".split(" ").map(c=>[c]),secs:{0:"مقطع 1",14:"مقطع 2",26:"الجسر",32:"مقطع 3",37:"مقطع 4"}},
  {id:"amarein",t:"قمرين",by:"عمرو دياب",lvl:3,kind:"كوردات · كابو 7",capo:7,lesson:"n21",src:["قمرين على جيتارابيا","https://www.guitarabia.com/songs/14/amarein-arabic-tabs-and-chords"],
   bars:"Dm A F E C G Am Dm A Am F Am E7 Am F E7 Dm A".split(" ").map(c=>[c]),secs:{0:"مقطع",6:"اللازمة",13:"الموسيقى"}},
  {id:"rasmaha",t:"رسمها",by:"عمرو دياب",lvl:4,kind:"كوردات بار (Bm و F#)",lesson:"n30",src:["رسمها على جيتارابيا","http://www.guitarabia.com/2016/artists/amr-diab/rasmaha/"],
   bars:"Em Bm Em Bm Em F# Bm F# Em F# Bm Bm F# Em Bm F# Bm".split(" ").map(c=>[c])},
  {id:"haneet",t:"حنّيت",by:"عمرو دياب",lvl:4,kind:"كوردات بار (Gm)",lesson:"n30",src:["حنّيت على جيتارابيا","https://www.guitarabia.com/songs/530/7anet-arabic-tabs-and-chords"],
   bars:"A Dm A Dm A Gm A Gm A Dm A Dm A Gm A Gm A Dm A Dm A Dm A Dm A Gm A Gm A Dm A Dm A Dm A Dm A Gm A Gm".split(" ").reduce((a,c,i)=>(i%2?a[a.length-1].push(c):a.push([c]),a),[])},
];
const songLesson=s=>ALL.find(x=>x.id===s.lesson);
const ARR={acc:["مصاحبة مبسّطة","ترتيب الكوردات من المصدر، بس الإيقاع عام ومش نفس التسجيل، واللحن مش موجود. غنّي فوقها أو طابقها مع الأصلي."],
  mel:["اللحن","النغمات الأساسية للّحن نفسه."],piece:["المقطوعة من التاب","النغمات والإيقاع من التاب الأصلي. أصابع الإيد الشمال مقترحة."],
  part:["مقطع من المقطوعة","أول جزء بس، عشان تتعوّد عليها."],ex:["تمرين","مكتوب للدرس، مش أغنية أصلية."]};
const arrOf=s=>ARR[s.arr||(s.piece?"piece":s.bars?"acc":"ex")];
const songChords=s=>s.bars?[...new Set(s.bars.flat())]:lessonChords(songLesson(s));
const easyF=bars=>bars.map(b=>b.map(c=>c==="F"?"Fmaj7":c));
const songCoach=s=>{
  if(s.piece)return pieceCfg(s);
  if(!s.bars){const f=songLesson(s).figs.find(f=>f.w==="coach");return f&&f.cfg}
  const hasF=s.bars.flat().includes("F"),capo=s.capo?` مع الأغنية الأصلية حط كابو على فريت ${s.capo}.`:"";
  const tr=[{n:"بسيط (٤ لتحت)",bpm:72,ev:patEv(s.bars,P4,s.secs||{}),d:`الأغنية كاملة، ٤ ضربات بكل مازورة.${capo}`},
    {n:"مقسوم",bpm:84,ev:patEv(s.bars,rhy(RHY[0][1]),s.secs||{}),d:"نفس الأغنية بإيقاع المقسوم. طابقه على الأصلي، وإذا الأغنية على بلدي بدّل."},
    {n:"بلدي",bpm:84,ev:patEv(s.bars,rhy(RHY[1][1]),s.secs||{})}];
  if(hasF)tr.unshift({n:"سهل (Fmaj7 بدل F)",bpm:70,ev:patEv(easyF(s.bars),P4,s.secs||{}),d:`لحد ما يصير البار سهل عليك (درس 29) استعمل Fmaj7 مكان F.${capo}`});
  return {tracks:tr};
};
const stars=n=>`<span class="stars" aria-label="الصعوبة ${n} من 4">${[1,2,3,4].map(i=>`<i class="${i<=n?"on":""}"></i>`).join("")}</span>`;
function renderSongs(view){
  view.innerHTML=`${crumb("<span>مكتبة الأغاني</span>")}<div class="uh"><span class="tag">مكتبة الأغاني</span><h2>أغاني ومقطوعات مع المدرّب</h2><p>مرتّبة من الأسهل للأصعب. كل وحدة إلها الدرس اللي بيحضّرك إلها.</p></div>
  <section class="ppath"><h3>مسار المقطوعات: ٥ خطوات</h3><p class="meta">مقطوعات كاملة مرتّبة من الأسهل. كل وحدة بتفتح لما تتقن الدرس اللي قبلها.</p><ol>${PATH.map((id,i)=>{const x=SONGS.find(y=>y.id===id),l=songLesson(x),ok=done[l.id];return `<li class="${ok?"ok":""}"><a href="#/songs/${id}"><span class="mono">${i+1}</span><b>${x.t}</b><span class="meta">${x.by} · ${ok?"جاهز إلها":`بعد درس ${l.no}`}</span></a></li>`}).join("")}</ol></section>
  <div class="songgrid">${[...SONGS].sort((a,b)=>a.lvl-b.lvl).map(s=>{const l=songLesson(s),ok=done[l.id];return `<a class="scard" href="#/songs/${s.id}"><div class="sart">${ICO.guitar}</div><div><h3>${s.t}</h3><p class="meta">${s.by} · ${s.kind}</p><span class="arr">${arrOf(s)[0]}</span>${stars(s.lvl)}<div class="pats">${songChords(s).slice(0,6).map(c=>`<span class="chip">${c}</span>`).join("")}</div><p class="meta">${ok?"جاهز إلها":`بتصير جاهز بعد درس ${l.no}`}</p></div></a>`}).join("")}</div>`;
}
const PATH=["ode","romanza-full","andantino","sor22","lagrima"];
const pathBox=s=>{const i=PATH.indexOf(s.id);if(i<0)return "";const l=songLesson(s),cfg=songCoach(s),bpm=cfg.tracks[0].bpm||60;
  return `<div class="pbox"><b>المقطوعة ${i+1} من ٥ بالمسار</b><ul>
  <li><b>قبلها:</b> ${done[l.id]?"✓":"○"} <a href="#/l/${l.id}">درس ${l.no}. ${l.t}</a>${i?` و ${PATH[i-1]&&SONGS.find(y=>y.id===PATH[i-1]).t}`:""}</li>
  <li><b>السرعة الهدف:</b> ${bpm}. ابدأ بـ«١ سهل» (${Math.round(bpm*.6)}).</li>
  <li><b>الأصابع:</b> الأرقام والألوان على الجيتار = الإيد الشمال${s.piece?" (مقترحة من البرنامج)":""}، والحروف p i m a تحت التاب = الإيد اليمين.</li>
  <li><b>أصعب مقطع:</b> زر «أصعب مقطع» تحت الجيتار بيحدّده وبيبطّئه. ابدأ فيه قبل ما تعزفها كاملة.</li></ul></div>`};
function renderSong(view,id){
  const s=SONGS.find(x=>x.id===id);if(!s)return renderSongs(view);
  const l=songLesson(s),chs=songChords(s);
  view.innerHTML=`${crumb(`<a href="#/songs">مكتبة الأغاني</a><span>›</span><span>${s.t}</span>`)}
  <article class="lesson"><header class="lh"><h2>${s.t}</h2><span class="meta">${s.by} · ${s.kind}</span>${stars(s.lvl)}</header>${pathBox(s)}<p class="arrp"><span class="arr">${arrOf(s)[0]}</span> ${arrOf(s)[1]}</p><div class="figs"></div>
  <div class="cols"><div><h4>الكوردات</h4><div class="pats">${chs.map(c=>LIB.includes(c)?`<a class="chip" href="#/chords/${encodeURIComponent(c)}">${c}</a>`:`<span class="chip">${c}</span>`).join("")||"<span class='meta'>لحن، بدون كوردات</span>"}</div></div>
  <div><h4>الدرس اللي بيحضّرك</h4><div class="pats"><a class="chip" href="#/l/${l.id}">${l.no}. ${l.t}</a></div>${s.src?`<h4 style="margin-top:12px">المصدر</h4><div class="vids"><a href="${s.src[1]}" target="_blank" rel="noopener">${ICON_PLAY}${s.src[0]}</a></div>`:""}</div></div></article>`;
  mountFig(view.querySelector(".figs"),{w:"coach",cfg:songCoach(s)});
}

// ---------- spaced review: a finished lesson comes back after 1, 3, 7, 14, 30 days ----------
const REVI=[1,3,7,14,30];
function markLearned(id){const r=LS("cm40-rev",{});if(!r[id])r[id]={d:dayKey(new Date()),n:0};LSset("cm40-rev",r)}
function rateLesson(id,rate){const r=LS("cm40-rev",{}),x=r[id]||{d:dayKey(new Date()),n:0};x.rate=rate;
  if(rate==="hard"){x.n=0;x.d=dayKey(new Date(Date.now()-864e5))}if(rate==="easy")x.n=Math.max(x.n,1);r[id]=x;LSset("cm40-rev",r)}
function dueReviews(){const r=LS("cm40-rev",{}),t=dayKey(new Date());
  return Object.entries(r).filter(([id,x])=>{if(!done[id])return false;const d=new Date(x.d);d.setDate(d.getDate()+REVI[Math.min(x.n,4)]);return dayKey(d)<=t}).sort((a,b)=>a[1].d<b[1].d?-1:1).map(([id])=>id)}
function reviewed(id){const r=LS("cm40-rev",{});if(r[id]){r[id].n++;r[id].d=dayKey(new Date());LSset("cm40-rev",r)}}

// ---------- today's practice ----------
// Only uses what you already learned (plus the next lesson), and fits the minutes you said you have.
// Understanding the next lesson and practising it are separate steps.
function sessionPlan(){
  const prof=LS("cm40-prof",{min:30,from:1}),st=ST();
  const next=ALL.find(l=>!done[l.id]&&l.no>=(prof.from||1))||ALL.find(l=>!done[l.id])||ALL[ALL.length-1];
  const figOf=l=>l.figs.find(f=>f.w==="coach")||l.figs.find(f=>typeof f!=="string")||l.figs[0];
  const learned=ALL.filter(l=>done[l.id]),steps=[];
  steps.push({t:"دوزن الجيتار",min:2,fig:{w:"mtuner"},why:"جيتار مش مدوزن بيعلّم أذنك غلط. شغّل المايك واعزف كل وتر لحاله.",keep:1});
  const warm=done.n10?ALL.find(x=>x.id==="n10"):[...learned].reverse().find(hasCoach);
  if(warm)steps.push({t:`تسخين: ${warm.t}`,min:done.n10?5:3,fig:figOf(warm),why:done.n10?"الأصابع الأربعة والإيدين مع بعض.":"إشي تعلّمته قبل، عشان الإيدين يسخنوا.",link:warm.id,drop:2});
  dueReviews().slice(0,2).forEach(id=>{const l=ALL.find(x=>x.id===id);steps.push({t:`مراجعة: ${l.no}. ${l.t}`,min:5,fig:figOf(l),why:"المراجعة بوقتها بتثبّت الدرس بالذاكرة الطويلة.",link:l.id,rev:id,drop:3})});
  if(!(st[next.id]||{}).seen)steps.push({t:`افهم: ${next.no}. ${next.t}`,min:Math.max(3,Math.min(Math.round(next.m/2),Math.round(prof.min*.3))),fig:next.figs.find(f=>typeof f==="string")||next.figs[0],why:"افتح الدرس واقرأ «افهم» خطوة خطوة قبل ما تعزف.",link:next.id,keep:1});
  steps.push({t:`${hasCoach(next)?"تمرّن":"طبّق"}: ${next.no}. ${next.t}`,min:10,fig:figOf(next),why:next.goal,link:next.id,keep:1,main:1});
  const tip=coachTips()[0];
  if(tip)steps.push({t:`غلطتك: ${tip.t}`,min:5,fig:tip.fig,why:tip.why,drop:2.5});
  const pairs=[];learned.forEach(l=>l.figs.forEach(f=>{if(f.w==="sw")pairs.push(...f.cfg.pairs)}));
  if(pairs.length){const best=LS("cm40-best",{});pairs.sort((a,b)=>(best[a.join("-")]||0)-(best[b.join("-")]||0));steps.push({t:"تبديل كوردات",min:5,fig:{w:"sw",cfg:{pairs:pairs.slice(0,3)}},why:"الأزواج اللي رقمها الأبطأ عندك.",drop:1})}
  const ready=SONGS.filter(s=>done[s.lesson]);
  if(ready.length){const song=ready[ready.length-1];steps.push({t:`أغنية: ${song.t}`,min:10,fig:{w:"coach",cfg:songCoach(song)},why:"إشي بتقدر تعزفه من هلأ، عشان تضل مبسوط.",drop:2})}
  const tot=()=>steps.reduce((a,s)=>a+s.min,0);
  steps.filter(s=>s.drop).sort((a,b)=>a.drop-b.drop).forEach(s=>{if(tot()>prof.min)steps.splice(steps.indexOf(s),1)});
  // spare time goes to practice, but a short lesson doesn't need more than ~1.5x its length
  const main=steps.find(s=>s.main);main.min=Math.min(main.min+Math.max(0,prof.min-tot()),Math.max(10,Math.round(next.m*1.5)));
  return steps;
}
function askProfile(view){
  const p=LS("cm40-prof",{min:30,from:1});
  view.innerHTML=`${crumb("<span>تمرين اليوم</span>")}<div class="uh"><span class="tag">سؤالين قبل ما نبلّش</span><h2>خلّيني أرتّبلك الجلسة</h2></div>
  <section class="pcard prof"><h3>كم دقيقة عندك باليوم؟</h3><div class="pats pm">${[10,20,30,45].map(m=>`<button class="chip${m===p.min?" on":""}" data-v="${m}">${m} دقيقة</button>`).join("")}</div>
  <h3>شو خبرتك؟</h3><div class="pats pf">${[[1,"أول مرة بمسك جيتار"],[12,"بعرف القعدة والأوتار والتاب"],[18,"بعزف كوردات سهلة"]].map(([v,t])=>`<button class="chip${v===(p.from||1)?" on":""}" data-v="${v}">${t}</button>`).join("")}</div>
  <p class="meta">إذا بتعرف إشي، الخطة بتبدأ من بعد اللي بتعرفه. الدروس اللي قبل بتضل مفتوحة، وبتقدر تغيّر جوابك من «تمرين اليوم».</p><button class="btn big pgo">جهّز الجلسة</button></section>`;
  const pick=(sel,k)=>view.querySelector(sel).onclick=e=>{const b=e.target.closest(".chip");if(!b)return;p[k]=+b.dataset.v;view.querySelectorAll(sel+" .chip").forEach(x=>x.classList.toggle("on",x===b))};
  pick(".pm","min");pick(".pf","from");
  view.querySelector(".pgo").onclick=()=>{LSset("cm40-prof",p);renderToday(view)};
}
function renderToday(view){
  if(localStorage.getItem("cm40-prof")==null)return askProfile(view);
  const steps=sessionPlan(),total=steps.reduce((a,s)=>a+s.min,0);let i=0,left=0,iv=null,spent=0;
  view.innerHTML=`${crumb("<span>تمرين اليوم</span>")}<div class="uh"><span class="tag">تمرين اليوم · ${total} دقيقة</span><h2>جلسة اليوم جاهزة</h2><p>مبنية على الدروس اللي أتقنتها بس، وعلى الوقت اللي عندك. <button class="chip pchg">غيّر الوقت أو الخبرة</button></p></div>
  <ol class="tsteps">${steps.map((s,k)=>`<li data-k="${k}"><b>${s.t}</b><span class="meta">${s.min} د</span></li>`).join("")}</ol>
  <section class="tnow"><header class="lh"><h3 class="tt"></h3><span class="meta tw"></span></header><div class="timer"><b class="big mono tm"></b><button class="btn tgo">ابدأ المؤقّت</button><button class="btn ghost tnx">خلّصت، الجاية</button></div><div class="figs"></div></section>`;
  view.querySelector(".pchg").onclick=()=>{stopAll();askProfile(view)};
  const tm=view.querySelector(".tm"),tgo=view.querySelector(".tgo"),figs=view.querySelector(".figs");
  const fmt=s=>`${Math.floor(s/60)}:${String(Math.max(0,s)%60).padStart(2,"0")}`;
  const stopT=()=>{clearInterval(iv);iv=null;tgo.textContent="كمّل المؤقّت"};
  const load=()=>{
    stopAll();stopT();const s=steps[i];left=s.min*60;tm.textContent=fmt(left);tgo.textContent="ابدأ المؤقّت";
    view.querySelectorAll(".tsteps li").forEach(li=>{const k=+li.dataset.k;li.classList.toggle("on",k===i);li.classList.toggle("ok",k<i)});
    view.querySelector(".tt").textContent=s.t;view.querySelector(".tw").innerHTML=s.why+(s.link?` · <a href="#/l/${s.link}">افتح الدرس</a>`:"");
    figs.innerHTML="";mountFig(figs,s.fig);
  };
  tgo.onclick=()=>{if(iv){stopT();return}tgo.textContent="وقّف المؤقّت";iv=setInterval(()=>{left--;spent++;tm.textContent=fmt(left);if(left<=0){stopT();click(ac().currentTime,true);tm.textContent="خلص الوقت!"}},1000)};
  view.querySelector(".tnx").onclick=()=>{stopT();logPractice(spent);spent=0;if(steps[i].rev)reviewed(steps[i].rev);i++;
    if(i<steps.length)return load();
    stopAll();view.querySelector(".tnow").innerHTML=`<div class="qdone"><b>كفو!</b><p>خلّصت تمرين اليوم. صرلك ${streak()||1} يوم ورا بعض.</p><a class="btn" href="#/progress">شوف تقدّمك</a></div>`;
    view.querySelectorAll(".tsteps li").forEach(li=>li.classList.add("ok"))};
  view.querySelector(".tsteps").onclick=e=>{const li=e.target.closest("li");if(!li)return;stopT();logPractice(spent);spent=0;i=+li.dataset.k;load()};
  STOP.add(()=>{if(iv){stopT();logPractice(spent);spent=0}});
  load();
}

// ---------- progress ----------
function renderProgress(view){
  const log=LS("cm40-log",{}),mins=Object.values(log).reduce((a,b)=>a+b,0),n=ALL.filter(l=>done[l.id]).length,qz=LS("cm40-quiz",{}),best=LS("cm40-best",{}),ear=LS("cm40-ear",{});
  const tiles=[[streak(),"يوم ورا بعض"],[Math.round(mins),"دقيقة تمرين"],[`${n}/${ALL.length}`,"درس أتقنته"],[Object.values(qz).reduce((a,b)=>a+b,0),"جواب صح"]];
  const W7=12,cells=[];const d0=new Date();d0.setDate(d0.getDate()-(W7*7-1));
  for(let k=0;k<W7*7;k++){const d=new Date(d0);d.setDate(d0.getDate()+k);const m=log[dayKey(d)]||0;cells.push([k,m,dayKey(d)])}
  const col=m=>!m?"var(--soft)":m<10?"#2E6A66":m<20?"#4FB3A9":"#E6B04B";
  const heat=`<svg viewBox="0 0 ${W7*22+40} ${7*22+10}" class="heat" role="img" aria-label="أيام التمرين آخر ${W7} أسبوع">${cells.map(([k,m,dk])=>`<rect x="${Math.floor(k/7)*22}" y="${(k%7)*22}" width="18" height="18" rx="4" fill="${col(m)}"><title>${dk}: ${m} دقيقة</title></rect>`).join("")}</svg>`;
  const pairs=Object.entries(best).sort((a,b)=>b[1]-a[1]).slice(0,8),bw=300;
  const chart=pairs.length?`<svg viewBox="0 0 ${bw+120} ${pairs.length*30+20}" class="bars" role="img" aria-label="أحسن أرقام تبديل الكوردات">${pairs.map(([k,v],i)=>`<text x="0" y="${i*30+20}" font-size="13" fill="var(--ink)" font-family="IBM Plex Mono,monospace">${k.replace("-"," ↔ ")}</text><rect x="100" y="${i*30+6}" width="${Math.min(v,80)/80*bw}" height="18" rx="4" fill="${v>=60?"#E6B04B":"#4FB3A9"}"/><text x="${104+Math.min(v,80)/80*bw}" y="${i*30+20}" font-size="12" fill="var(--muted)">${v}</text>`).join("")}<line x1="${100+60/80*bw}" y1="0" x2="${100+60/80*bw}" y2="${pairs.length*30+10}" stroke="#E6B04B" stroke-dasharray="4 4"/></svg>`:`<p class="meta">اعمل تمرين الدقيقة (درس 14) وبيطلعلك رسم بياني هون.</p>`;
  view.innerHTML=`${crumb("<span>تقدّمي</span>")}<div class="uh"><span class="tag">تقدّمي</span><h2>شو عملت لحد هلأ</h2></div>
  <div class="tiles">${tiles.map(([v,t])=>`<div class="tile"><b class="mono">${v}</b><span>${t}</span></div>`).join("")}</div>
  <div class="pgrid"><section class="pcard"><h3>أيام التمرين</h3><p class="meta">آخر ${W7} أسبوع. كل مربّع يوم، وكل ما كان أغمق ذهبي يعني تمرّنت أكتر.</p>${heat}</section>
  <section class="pcard"><h3>تبديل الكوردات (بالدقيقة)</h3><p class="meta">الخط الذهبي = ٦٠، الهدف.</p>${chart}</section>
  <section class="pcard"><h3>الوحدات</h3>${UNITS.map(u=>{const d=u.lessons.filter(l=>done[l.id]).length;return `<div class="urow"><span>${u.id} · ${u.name}</span><div class="bar"><i style="width:${d/u.lessons.length*100}%"></i></div><span class="mono">${d}/${u.lessons.length}</span></div>`}).join("")}</section>
  <section class="pcard"><h3>مدرّبك بيحكي</h3>${(()=>{const t=coachTips();return t.length?t.map((x,i)=>`<details class="tip" data-i="${i}"><summary><b>${x.t}</b></summary><p class="meta">${x.why}</p><div class="tipfig"></div></details>`).join(""):`<p class="meta">لما تعمل كم «امتحان بالإيقاع»، بطلّعلك هون شو الغلطة اللي بتتكرّر عندك وتمرين إلها.</p>`})()}</section>
  <section class="pcard"><h3>هدف الأسبوع</h3>${weekBar()}<div class="ctrl"><label class="meta">دقايق <input type="number" class="gmin" min="10" max="2000" step="10" value="${GOAL().min}"></label><label class="meta">أيام <input type="number" class="gdays" min="1" max="7" value="${GOAL().days}"></label><button class="btn ghost gsave">احفظ</button></div>
    <h4>تذكير يومي</h4><p class="meta">بنزّلك ملف تقويم، افتحه وبيضيف تذكير كل يوم على جوالك أو كمبيوترك.</p><div class="ctrl"><input type="time" class="rtime" value="20:00" aria-label="وقت التذكير"><button class="btn ghost rics">ضيف التذكير للتقويم</button></div></section>
  <section class="pcard"><h3>تسجيلاتي</h3><div class="takes"><p class="meta">بحمّل…</p></div><p class="meta">التسجيلات على هاد الجهاز بس، ومش جوّا النسخة اللي بتنزّلها.</p></section>
  <section class="pcard"><h3>ملاحظاتك على الدروس</h3>${(()=>{const fb=Object.entries(LS("cm40-fb",{})).filter(([,x])=>!x.ok);return fb.length?fb.map(([id,x])=>{const l=ALL.find(y=>y.id===id);return l?`<div class="urow"><a href="#/l/${id}">${l.no}. ${l.t}</a><span class="meta">${x.why||"مش واضح"}</span></div>`:""}).join(""):`<p class="meta">ما في دروس معلّمها «مش واضح».</p>`})()}</section>
  <section class="pcard"><h3>آخر الامتحانات</h3>${(()=>{const ex=Object.entries(LS("cm40-exam",{})).map(([k,a])=>[k,a[a.length-1]]).sort((p,q)=>p[1].d<q[1].d?1:-1).slice(0,8);return ex.length?ex.map(([k,x])=>{const id=k.split("|")[0],l=ALL.find(y=>y.id===id);return `<div class="urow"><span>${l?`${l.no}. ${l.t}`:decodeURIComponent(id.replace("#/",""))}</span><span class="mono">${x.sc}%</span><span class="meta">${x.k==="r"?"إيقاع":"نغمات"} · ${x.d}</span></div>`}).join(""):`<p class="meta">لسا ما عملت امتحان بالمايك.</p>`})()}</section>
  <section class="pcard"><h3>احفظ تقدّمك</h3><p class="meta">التقدّم محفوظ بهاد المتصفح بس. نزّل نسخة، وارجعها على أي جهاز أو بعد ما تمسح المتصفح.</p><div class="ctrl"><button class="btn ghost pexp">نزّل نسخة</button><label class="btn ghost">ارجع نسخة<input type="file" accept=".json,application/json" class="pimp" hidden></label></div><p class="meta pmsg"></p></section>
  <section class="pcard"><h3>الدورة بدون نت</h3><p class="meta poffm">بفحص…</p><button class="btn ghost poff">نزّل كل الدورة</button></section>
  <section class="pcard"><h3>تدريب الأذن</h3>${Object.keys(EAR).map(k=>`<div class="urow"><span>${EAR[k].n}</span><span class="mono">${ear[k]||0}</span><span class="meta">أحسن سلسلة صح</span></div>`).join("")}</section></div>`;
  wireBackup(view);wireWeek(view);
  const tips=coachTips();view.querySelectorAll("details.tip").forEach(d=>d.ontoggle=()=>{const f=d.querySelector(".tipfig");if(d.open&&!f.childElementCount)mountFig(f,tips[+d.dataset.i].fig)});
  TAKES.all().then(list=>{const el=view.querySelector(".takes");if(!el)return;
    el.innerHTML=list.length?list.sort((a,b)=>a[1].d<b[1].d?1:-1).map(([k,x])=>`<div class="tk"><span>${x.t||k}${x.sc!=null?` · ${x.sc}%`:""} · ${x.d}</span><audio controls preload="none" src="${URL.createObjectURL(x.blob)}"></audio><button class="chip tdel" data-k="${encodeURIComponent(k)}">امسح</button></div>`).join(""):`<p class="meta">لسا ما حفظت تسجيل. من «خيارات أكتر» ← «سجّلني» بأي تمرين.</p>`;
    el.onclick=async e=>{const b=e.target.closest(".tdel");if(!b||!confirm("أمسح هالتسجيل؟"))return;await TAKES.del(decodeURIComponent(b.dataset.k));b.closest(".tk").remove()}}).catch(()=>{const el=view.querySelector(".takes");if(el)el.innerHTML=`<p class="meta">هاد المتصفح ما بيسمح بحفظ التسجيلات.</p>`});
}

// ---------- backup and offline ----------
function exportProgress(name="progress"){const o={};Object.keys(localStorage).filter(k=>k.startsWith("cm40-")).forEach(k=>o[k]=localStorage.getItem(k));
  const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([JSON.stringify(o,null,1)],{type:"application/json"}));a.download=`cm40-${name}-${dayKey(new Date())}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}
function wireBackup(view){
  const msg=view.querySelector(".pmsg");
  view.querySelector(".pexp").onclick=()=>{exportProgress();msg.textContent="نزلت النسخة. خبّيها بمكان آمن."};
  view.querySelector(".pimp").onchange=async e=>{const f=e.target.files[0];if(!f)return;
    let o;try{o=JSON.parse(await f.text())}catch(err){msg.textContent="هاد الملف مش نسخة تقدّم.";return}
    const ks=o&&typeof o==="object"?Object.keys(o).filter(k=>/^cm40-[a-z]+$/.test(k)&&typeof o[k]==="string"):[];
    if(!ks.length||!ks.every(k=>{try{JSON.parse(o[k]);return true}catch(err){return false}})){msg.textContent="هاد الملف مش نسخة تقدّم.";return}
    if(!confirm("رح تنمسح نسختك الحالية على هاد الجهاز وتحلّ محلها النسخة من الملف. أكمّل؟"))return;
    ks.forEach(k=>localStorage.setItem(k,o[k]));location.reload()};
  // The service worker caches what you open; this fetches everything up front and says when it's complete.
  const om=view.querySelector(".poffm"),ob=view.querySelector(".poff");
  if(!("caches" in window)||!navigator.serviceWorker||!navigator.serviceWorker.controller){om.textContent="بيشتغل من الرابط الرسمي بس (https)، بعد ما تفتح الموقع مرة.";ob.hidden=true;return}
  const urls=["./","index.html","manifest.webmanifest","icon.svg",...[...document.scripts].map(x=>x.getAttribute("src")).filter(Boolean),...Array.from({length:47},(_,i)=>`samples/${40+i}.mp3`)];
  const cache=async()=>caches.open((await caches.keys()).find(k=>k.startsWith("cm40-"))||"cm40-v12");
  const count=async c=>(await Promise.all(urls.map(u=>c.match(u)))).filter(Boolean).length;
  const status=async()=>{const n=await count(await cache());om.textContent=n===urls.length?`✓ الدورة كاملة محمّلة (${n}/${urls.length} ملف). بتشتغل بدون نت.`:`محمّل ${n} من ${urls.length} ملف. نزّل الباقي عشان تشتغل بدون نت.`;ob.hidden=n===urls.length};
  ob.onclick=async()=>{ob.disabled=true;const c=await cache();let k=0,bad=0;
    for(const u of urls){try{if(!await c.match(u))await c.add(u)}catch(err){bad++}om.textContent=`بنزّل… ${++k}/${urls.length}`}
    ob.disabled=false;await status();if(bad)om.textContent+=` (${bad} ما نزلوا، جرّب مرة ثانية)`};
  status();
}

// ---------- ear training ----------
const EAR={
  mm:{n:"كبير ولا صغير؟",q:"اسمع الكورد: كبير (فرحان) ولا صغير (حزين)؟",make(R){const p=[["E","كبير"],["A","كبير"],["D","كبير"],["C","كبير"],["G","كبير"],["Em","صغير"],["Am","صغير"],["Dm","صغير"],["Bm","صغير"]][Math.floor(R()*9)];return {play:()=>strum(CH[p[0]],"D",.35),opts:["كبير","صغير"],a:p[1],info:`كان ${p[0]}`}}},
  iv:{n:"شو المسافة؟",q:"اسمع نغمتين ورا بعض. قديش البعد بينهم؟",make(R){const IV=[[1,"نص تون"],[2,"تون"],[3,"ثالثة صغيرة"],[4,"ثالثة كبيرة"],[7,"خامسة"],[12,"أوكتاف"]],p=IV[Math.floor(R()*IV.length)],b=48+Math.floor(R()*12);
    const o=new Set([p[1]]);while(o.size<4)o.add(IV[Math.floor(R()*IV.length)][1]);return {play:()=>{playMidi(b,0,.55);playMidi(b+p[0],.8,.55)},opts:[...o].sort(()=>R()-.5),a:p[1],info:`${p[0]} فريت`}}},
  st:{n:"أي وتر؟",q:"اسمع الوتر المفتوح. أي وتر هاد؟",make(R){const s=1+Math.floor(R()*6);return {play:()=>playSF(s,0,.6),opts:[6,5,4,3,2,1].map(x=>`وتر ${x} (${SNAME[x-1]})`),a:`وتر ${s} (${SNAME[s-1]})`,info:""}}},
};
function renderEar(view){
  let g="mm",cur=null,run=0,score=0,tries=0;const best=LS("cm40-ear",{}),R=rng(Date.now()%2147483647||7);
  view.innerHTML=`${crumb("<span>تدريب الأذن</span>")}<div class="uh"><span class="tag">تدريب الأذن</span><h2>درّب أذنك</h2><p>الأذن أهم أداة عند العازف. العب كم دقيقة كل يوم.</p></div>
  <div class="pats eg">${Object.entries(EAR).map(([k,v],i)=>`<button class="chip${i?"":" on"}" data-g="${k}">${v.n}</button>`).join("")}</div>
  <section class="earbox"><div class="eart">${ICO.ear}</div><p class="eq"></p><button class="btn big eplay">▶ اسمع</button><div class="qopts eopts"></div><p class="efb"></p><p class="meta es"></p></section>`;
  const eq=view.querySelector(".eq"),eo=view.querySelector(".eopts"),fb=view.querySelector(".efb"),es=view.querySelector(".es");
  const stat=()=>es.textContent=`صح ${score} من ${tries} · سلسلة صح: ${run} · أحسن سلسلة: ${best[g]||0}`;
  const nextQ=()=>{cur=EAR[g].make(R);eq.textContent=EAR[g].q;fb.textContent="";eo.innerHTML=cur.opts.map((o,k)=>`<button class="qo" data-k="${k}">${o}</button>`).join("");stat()};
  view.querySelector(".eplay").onclick=()=>{loadSamples();cur.play()};
  eo.onclick=e=>{const b=e.target.closest(".qo");if(!b||eo.querySelector(".good"))return;const ok=cur.opts[+b.dataset.k]===cur.a;tries++;
    if(ok){score++;run++;if(run>(best[g]||0)){best[g]=run;LSset("cm40-ear",best)}}else run=0;
    eo.querySelectorAll(".qo").forEach(x=>{if(cur.opts[+x.dataset.k]===cur.a)x.classList.add("good");else if(x===b)x.classList.add("badc")});
    fb.innerHTML=(ok?"صح! ":"لا. ")+(cur.info?`(${cur.info}) `:"")+`<button class="btn ghost enx">السؤال الجاي</button>`;view.querySelector(".enx").onclick=()=>{nextQ();cur.play()};stat()};
  view.querySelector(".eg").onclick=e=>{const b=e.target.closest(".chip");if(!b)return;g=b.dataset.g;run=0;score=0;tries=0;view.querySelectorAll(".eg .chip").forEach(x=>x.classList.toggle("on",x===b));nextQ()};
  nextQ();
}

// ---------- full public-domain pieces (converted from ClassTab.org tabs by script) ----------
const pieceEv=k=>{let bar=0;return PIECES[k].ev.map(([d,n,sl,b])=>{if(b)bar++;return {d,n,sl:sl||undefined,lab:b&&bar%4===1?`م${bar}`:null}})};
const PIECE_INFO=[
  {id:"romanza-full",k:"romanza",t:"Romanza كاملة",by:"مجهول",lvl:3,kind:"كلاسيك · a m i",lesson:"n22",bpm:56,src:["التاب الأصلي على ClassTab","https://www.classtab.org/anon_romance_de_amor.txt"]},
  {id:"andantino",k:"andantino",t:"Andantino، Op.35 No.2",by:"Fernando Sor",lvl:2,kind:"دراسة كلاسيك",lesson:"n27",bpm:70,src:["التاب الأصلي على ClassTab","https://www.classtab.org/sor_op35_no02_andantino_in_c.txt"]},
  {id:"sor22",k:"sor22",t:"دراسة بـ Bm، Op.35 No.22",by:"Fernando Sor",lvl:4,kind:"أربيج · بار",lesson:"n30",bpm:60,src:["التاب الأصلي على ClassTab","https://www.classtab.org/sor_op35_no22_allegretto_in_bm.txt"]},
  {id:"lagrima",k:"lagrima",t:"Lágrima",by:"Francisco Tárrega",lvl:4,kind:"كلاسيك",lesson:"n39",bpm:60,src:["التاب الأصلي على ClassTab","https://www.classtab.org/tarrega_lagrima.txt"]},
];
PIECE_INFO.forEach(p=>SONGS.push({...p,piece:1}));
const pieceCfg=p=>({tracks:[{n:"كاملة",bpm:p.bpm,bar:3,phrase:3,ev:pieceEv(p.k),d:"النغمات والإيقاع من التاب الأصلي (ClassTab.org). أصابع الإيد الشمال مقترحة. استعمل «التمرين» تحت لتبدأ بجزء صغير وبطيء."}]});
// the Romanza lesson gets the full piece; the repertoire lesson gets Lágrima
UNITS.flatMap(u=>u.lessons).forEach(l=>{
  if(l.id==="n22"){const c=l.figs.find(f=>f.w==="coach");c.cfg.tracks.push({...pieceCfg(PIECE_INFO[0]).tracks[0],n:"المقطوعة كاملة"})}
  if(l.id==="n39")l.figs.push({w:"coach",cfg:pieceCfg(PIECE_INFO[3])});
  if(l.id==="n27")l.figs.push({w:"coach",cfg:pieceCfg(PIECE_INFO[1])});
});

// Arabic video series per unit (whole series, not an exact match for each lesson)
const AR_SERIES={A:["سلسلة عربية للمبتدئين (كاملة)","https://www.youtube.com/playlist?list=PLldfRVxgJg3vYVbA2mwbiL9ZQT3YVfUMz"],B:["سلسلة عربية للمبتدئين (كاملة)","https://www.youtube.com/playlist?list=PLldfRVxgJg3vYVbA2mwbiL9ZQT3YVfUMz"],C:["كورس جيتار من الصفر (عربي)","https://www.youtube.com/playlist?list=PLc76eLZH8vnVexTkoAiLkkmUEw90iWUdy"],D:["قناة Arabic Guitar Click (كلاسيك بالعربي)","https://www.youtube.com/c/ArabicGuitarClick"],E:["قناة Arabic Guitar Click (كلاسيك بالعربي)","https://www.youtube.com/c/ArabicGuitarClick"],F:["Ahmed Ibrahim Guitar Academy (عربي)","https://www.youtube.com/@ahmedibrahimguitaracademy2843"],G:["Ahmed Ibrahim Guitar Academy (عربي)","https://www.youtube.com/@ahmedibrahimguitaracademy2843"]};
UNITS.forEach(u=>u.lessons.forEach(l=>{if(AR_SERIES[u.id]&&!l.vids.some(v=>v[1]===AR_SERIES[u.id][1]))l.vids.push(AR_SERIES[u.id])}));

// ---------- mic setup ----------
function renderMic(view){
  view.innerHTML=`${crumb("<span>ضبط المايك</span>")}<div class="uh"><span class="tag">ضبط المايك</span><h2>خلّي المايك يسمعك صح</h2><p>الامتحانات بتعتمد على المايك. اضبطه مرة على كل جهاز، وإذا حسّيته ظالمك شوف شو سامع.</p></div>
  <div class="pgrid"><section class="pcard"><h3>١. الضبط (دقيقة)</h3><div class="w-cal"></div></section>
  <section class="pcard"><h3>٢. شو سامع؟</h3><p class="meta">اعزف نغمة: لازم يطلع اسمها صح، والشريط يتعدّى الخط، و«ضربة» تضوي لحظة ما تضرب.</p><div class="w-hear"></div></section>
  <section class="pcard"><h3>إذا ما زبط</h3><ul class="tips"><li>اسم النغمة غلط بأوكتاف؟ عادي بالأوتار الغليظة بالأجهزة الضعيفة. بالتمرين بنسامح، بالامتحان لا، فقرّب الجهاز.</li><li>الشريط ما بيتعدّى الخط؟ قرّب الجهاز أو اعزف أقوى شوي.</li><li>«ضربة» ما بتضوي؟ الغرفة فيها ضجة: مكيّف، تلفزيون، ناس بيحكوا.</li><li>سمّاعات بلوتوث بتأخّر الصوت كتير. استعمل سمّاعة الجهاز نفسه أو سلك.</li></ul></section></div>`;
  W.mcal(view.querySelector(".w-cal"));W.mhear(view.querySelector(".w-hear"));
}

// ---------- beginner test: three tasks with no outside help ----------
function renderTest(view){
  const T=[{t:"دوزن الجيتار",d:"دوزن الأوتار الستة بالمايك لحد ما كل وتر يطلع «مزبوط ✓».",fig:{w:"mtuner"}},
    {t:"اعزف تمرين درس 6",d:"افتح «خيارات أكتر» تحت الجيتار ← «امتحان بالإيقاع». النجاح = ٨٠٪ أو أكتر.",fig:ALL.find(l=>l.id==="n6").figs.find(f=>f.w==="coach")},
    {t:"Em ↔ Am دقيقة",d:"اضغط «ابدأ الدقيقة» وبدّل بين الكوردين قد ما تقدر. الهدف ٢٠ تبديلة أو أكتر لمبتدئ.",fig:{w:"sw",cfg:{pairs:[["Em","Am"]]}}}];
  const res=LS("cm40-test",[]);let i=0,t0=0,cur=[];
  view.innerHTML=`${crumb("<span>تجربة المبتدئين</span>")}<div class="uh"><span class="tag">تجربة المبتدئين</span><h2>٣ مهام، بدون مساعدة</h2>
  <p><b>للي بيدير التجربة:</b> اعطي الجهاز والجيتار للمجرّب، واحكيله «اعمل اللي مكتوب». لا تشرح ولا تساعد، وسجّل بس وين علق. بآخر التجربة نزّل النتائج.</p></div>
  <ol class="tsteps">${T.map((x,k)=>`<li data-k="${k}"><b>${k+1}. ${x.t}</b></li>`).join("")}</ol>
  <section class="tnow"><header class="lh"><h3 class="tt"></h3></header><p class="td"></p><div class="figs"></div>
  <div class="ctrl"><span class="meta">كيف زبطت؟</span><button class="btn" data-r="alone">زبطت لحالي</button><button class="btn ghost" data-r="help">احتجت مساعدة</button><button class="btn ghost" data-r="fail">ما زبطت</button></div>
  <input class="tnote" placeholder="وين علق؟ (اختياري)" aria-label="ملاحظة"></section>
  <section class="pcard tsum"><h3>النتائج (${res.length} تجربة)</h3>${res.map((r,k)=>`<div class="urow"><span>تجربة ${k+1} · ${r.d}</span><span>${r.tasks.map(x=>({alone:"✓",help:"½",fail:"✗"})[x.r]).join(" ")}</span><span class="meta">${r.tasks.map(x=>Math.round(x.sec/60)+"د").join(" / ")}</span></div>`).join("")||"<p class='meta'>لسا ما في.</p>"}
  <p class="meta">الهدف: ٤ من ٥ مجرّبين يخلّصوا الثلاث مهام «لحالهم».</p><div class="ctrl"><button class="btn ghost texp">نزّل النتائج والملاحظات</button></div></section>`;
  const figs=view.querySelector(".figs"),note=view.querySelector(".tnote");
  const load=()=>{stopAll();const x=T[i];view.querySelector(".tt").textContent=`${i+1}. ${x.t}`;view.querySelector(".td").textContent=x.d;figs.innerHTML="";mountFig(figs,x.fig);note.value="";t0=Date.now();
    view.querySelectorAll(".tsteps li").forEach(li=>{li.classList.toggle("on",+li.dataset.k===i);li.classList.toggle("ok",+li.dataset.k<i)})};
  view.querySelector(".tnow .ctrl").onclick=e=>{const b=e.target.closest("[data-r]");if(!b)return;
    cur.push({r:b.dataset.r,sec:Math.round((Date.now()-t0)/1000),note:note.value.trim()});i++;
    if(i<T.length)return load();
    stopAll();res.push({d:dayKey(new Date()),tasks:cur});LSset("cm40-test",res);renderTest(view)};
  view.querySelector(".texp").onclick=()=>exportProgress("test");
  load();
}

// ---------- recordings: the best take per track, kept in IndexedDB on this device ----------
const TAKES={
  open(){return this.db||(this.db=new Promise((res,rej)=>{const r=indexedDB.open("cm40",1);r.onupgradeneeded=()=>r.result.createObjectStore("takes");r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)}))},
  async run(mode,fn){const db=await this.open();return new Promise((res,rej)=>{const t=db.transaction("takes",mode);fn(t.objectStore("takes"));t.oncomplete=()=>res();t.onerror=()=>rej(t.error)})},
  put(k,v){return this.run("readwrite",st=>st.put(v,k))},
  del(k){return this.run("readwrite",st=>st.delete(k))},
  async all(){const out=[];await this.run("readonly",st=>{const c=st.openCursor();c.onsuccess=()=>{const x=c.result;if(x){out.push([x.key,x.value]);x.continue()}}});return out}
};

// ---------- mistake coach: patterns across the last exams, each with a drill ----------
function coachTips(){
  const recs=Object.values(LS("cm40-exam",{})).flat().sort((a,b)=>a.d<b.d?-1:1).slice(-15),tips=[];
  const dts=recs.filter(r=>r.k==="r").flatMap(r=>r.dt||[]).filter(x=>x!=null);
  if(dts.length>=12){
    const m=dts.reduce((a,b)=>a+b,0)/dts.length,sd=Math.sqrt(dts.reduce((a,b)=>a+(b-m)**2,0)/dts.length);
    const beat={w:"coach",cfg:{tracks:[{n:"مع الطقة",bpm:60,ev:melEv(Array.from({length:16},(_,k)=>[3,0,0,k%2?"m":"i"])),d:"نغمة وحدة على كل طقة. من «خيارات أكتر» اعمل «امتحان بالإيقاع» وشوف إذا تحسّن."}]}};
    if(m>60)tips.push({t:"بتضرب متأخر",why:`بمعدّل ${Math.round(m)} ملي ثانية بعد الطقة. اضرب «مع» الصوت، مش بعد ما تسمعه: جهّز الإصبع على الوتر قبل الطقة.`,fig:beat});
    else if(m<-60)tips.push({t:"بتستعجل",why:`بمعدّل ${Math.round(-m)} ملي ثانية قبل الطقة. استنّى الطقة، وعدّ بصوت عالي.`,fig:beat});
    else if(sd>110)tips.push({t:"الوقت مش ثابت",why:"مرة بدري ومرة متأخر. نزّل السرعة ١٠، وعدّ «واحد تنين تلاتة أربعة» بصوت عالي.",fig:beat});
  }
  const top=key=>{const c={};recs.forEach(r=>(r[key]||[]).forEach(x=>c[x]=(c[x]||0)+1));return Object.entries(c).sort((a,b)=>b[1]-a[1])[0]||[]};
  const [ws,wc]=top("ms");
  if(wc>=4){const st=+ws;tips.push({t:`الوتر ${st} (${SNAME[st-1]}) مش واضح`,why:`غلطت عليه ${wc} مرات بآخر امتحاناتك. تأكّد إن ولا إصبع من الإيد الشمال لامسه، وإن الإيد اليمين بتضربه من نصّه.`,
    fig:{w:"coach",cfg:{tracks:[{n:`الوتر ${st}`,bpm:60,ev:melEv([0,1,2,3,2,1,0,1,2,3,2,1,0].map((f,k)=>[st,f,f,k%2?"m":"i"])),d:"الوتر لحاله: مفتوح وفريت 1 و2 و3 رايح جاي. كل نغمة لازم ترنّ نظيفة."}]}}})}
  const [wp,wn]=top("mc");
  if(wn>=2){const [a,b]=wp.split(">");if(CH[a]&&CH[b])tips.push({t:`التبديل ${a} ← ${b} بطيء`,why:`هون وقعت ${wn} مرات. تمرين الدقيقة على هالزوج بالزبط.`,fig:{w:"sw",cfg:{pairs:[[a,b]]}}})}
  return tips;
}

// ---------- the week: goal, challenge, reminder (weeks start on Saturday) ----------
const weekStart=d=>{const x=new Date(d);x.setHours(0,0,0,0);x.setDate(x.getDate()-((x.getDay()+1)%7));return x};
function weekStats(off=0){const st=weekStart(new Date());st.setDate(st.getDate()+7*off);const log=LS("cm40-log",{});let min=0,days=0;
  for(let i=0;i<7;i++){const d=new Date(st);d.setDate(st.getDate()+i);const m=log[dayKey(d)]||0;min+=m;if(m>=1)days++}return {min:Math.round(min),days,start:st}}
const GOAL=()=>LS("cm40-goal",{min:120,days:4});
const weekBar=()=>{const g=GOAL(),w=weekStats();return `<div class="wk"><span>هالأسبوع: <b class="mono">${w.min}/${g.min}</b> دقيقة · <b class="mono">${w.days}/${g.days}</b> أيام${w.min>=g.min&&w.days>=g.days?" ✓":""}</span><div class="bar"><i style="width:${Math.min(100,w.min/g.min*100)}%"></i></div></div>`};
function wireWeek(view){
  view.querySelector(".gsave").onclick=()=>{const min=Math.max(10,+view.querySelector(".gmin").value||120),days=Math.min(7,Math.max(1,+view.querySelector(".gdays").value||4));LSset("cm40-goal",{min,days});renderProgress(view)};
  view.querySelector(".rics").onclick=()=>{const [h,m]=(view.querySelector(".rtime").value||"20:00").split(":"),d=new Date(),p=n=>String(n).padStart(2,"0");
    const ics=["BEGIN:VCALENDAR","VERSION:2.0","PRODID:-//CM40 coach//AR","BEGIN:VEVENT",`UID:cm40-${Date.now()}@cm40-coach`,`DTSTAMP:${new Date().toISOString().replace(/[-:]/g,"").slice(0,15)}Z`,
      `DTSTART:${d.getFullYear()}${p(d.getMonth()+1)}${p(d.getDate())}T${p(+h)}${p(+m)}00`,"DURATION:PT20M","RRULE:FREQ=DAILY","SUMMARY:تمرين الجيتار",`DESCRIPTION:${location.origin+location.pathname}#/today`,
      "BEGIN:VALARM","TRIGGER:PT0M","ACTION:DISPLAY","DESCRIPTION:وقت تمرين الجيتار","END:VALARM","END:VEVENT","END:VCALENDAR"].join("\r\n");
    const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([ics],{type:"text/calendar"}));a.download="cm40-reminder.ics";a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)};
}
// A new passage every week: the hardest 12 steps of a lesson you mastered (or an early lesson if none yet).
function challenge(){
  const pool=ALL.filter(l=>done[l.id]&&hasCoach(l)),src=pool.length?pool:ALL.filter(hasCoach).slice(0,3);
  const l=src[Math.floor(weekStart(new Date()).getTime()/(7*864e5))%src.length],tr=l.figs.find(f=>f.w==="coach").cfg.tracks[0],h=hardSec(tr.ev,12);
  return {l,track:{n:"التحدّي",bpm:tr.bpm,bar:tr.bar,ev:h?tr.ev.slice(h[0],h[1]+1):tr.ev,d:`مقطع من «${l.t}». من «خيارات أكتر» اعمل «امتحان بالإيقاع»، وأحسن نتيجة هالأسبوع بتنحفظ.`}};
}
function renderChallenge(view){
  const {l,track}=challenge();
  const best=off=>{const a=dayKey(weekStats(off).start),b=dayKey(weekStats(off+1).start),r=(LS("cm40-exam",{})["#/challenge|0"]||[]).filter(x=>x.k==="r"&&x.d>=a&&x.d<b);return r.length?Math.max(...r.map(x=>x.sc)):null};
  view.innerHTML=`${crumb("<span>تحدّي الأسبوع</span>")}<div class="uh"><span class="tag">تحدّي الأسبوع</span><h2>${l.t}: أصعب مقطع</h2><p>كل أسبوع مقطع جديد من دروس أتقنتها. اعمل «امتحان بالإيقاع» كم مرة، وبنقارن أحسن نتيجة إلك بنتيجتك بتحدّي الأسبوع اللي قبل.</p></div>
  <div class="tiles cst"></div><div class="figs"></div>`;
  const st=()=>{const a=best(0),b=best(-1);view.querySelector(".cst").innerHTML=[[a==null?"–":a+"%","أحسن نتيجة هالأسبوع"],[b==null?"–":b+"%","الأسبوع اللي قبل"],[a==null||b==null?"–":(a>=b?"+":"")+(a-b),"الفرق"]].map(([v,t])=>`<div class="tile"><b class="mono">${v}</b><span>${t}</span></div>`).join("")};
  st();const f=mountFig(view.querySelector(".figs"),{w:"coach",cfg:{tracks:[track]}});f.addEventListener("cm40-exam",st);
}

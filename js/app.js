// Page assembly: lessons, navigation, progress, and the top tools.
const KEY="cm40-progress";
let done={};
try{done=JSON.parse(localStorage.getItem(KEY))||{}}catch(e){}
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(done))}catch(e){}};
// carry over checkmarks from the first version of the page
if(!done._v2){const old=(p,n)=>[...Array(n)].every((_,i)=>done[`${p}-${i}`]);
  if(old("l1",4))["n1","n2","n3","n4"].forEach(k=>done[k]=true);
  if(old("l2",4))["n5","n6","n7","n8","n9","n10"].forEach(k=>done[k]=true);
  if(old("l3",4))["n11","n12","n13","n14","n15","n16"].forEach(k=>done[k]=true);
  done._v2=1;save();}

const content=document.getElementById("content"),nav=document.getElementById("nav"),road=document.getElementById("road");
const ALL=UNITS.flatMap(u=>u.lessons);
let num=0;
UNITS.forEach(u=>{
  const sec=document.createElement("section");sec.className="unit";
  sec.innerHTML=`<div class="uh" id="u${u.id}"><span class="tag">الوحدة ${u.id}</span><h2>${u.name}</h2><p>${u.sub}</p></div>`;
  let navh=`<div><div class="u">${u.id} · ${u.name}</div>`;
  u.lessons.forEach(l=>{
    num++;
    const a=document.createElement("article");a.className="lesson";a.id=l.id;
    a.innerHTML=`<header class="lh"><span class="ln">درس ${num}</span><h3>${l.t}</h3><span class="meta">${l.m} دقيقة</span></header>
      <p class="goal"><b>الهدف:</b> ${l.goal}</p>
      <div class="figs"></div>
      <div class="cols"><div><h4>خطوة بخطوة</h4><ol class="steps">${l.steps.map(s=>`<li>${s}</li>`).join("")}</ol></div>
      <div><h4>أخطاء مشهورة</h4><ul class="mist">${l.mist.map(([x,o])=>`<li><span class="x">✗ ${x}</span><span class="ok">✓ ${o}</span></li>`).join("")}</ul></div></div>
      <div class="trick"><b>تريك:</b> ${l.trick}</div>
      <div class="foot"><div class="vids">${l.vids.length?l.vids.map(([t,h])=>`<a href="${h}" target="_blank" rel="noopener">${ICON_PLAY}${t}</a>`).join(""):`<span class="meta">هاد الدرس ما بدّه فيديو، الرسمة بتكفّي.</span>`}</div>
      <label class="done"><input type="checkbox" id="chk-${l.id}" data-l="${l.id}" ${done[l.id]?"checked":""}> خلّصت الدرس</label></div>`;
    const figs=a.querySelector(".figs");
    l.figs.forEach(f=>{const d=document.createElement("div");d.className="fig";
      try{if(typeof f==="string")d.innerHTML=f;else W[f.w](d,f.cfg||{})}catch(err){d.innerHTML=`<p class="meta">ما قدرت أرسم هاد الجزء.</p>`;console.error(l.id,err)}
      figs.appendChild(d)});
    sec.appendChild(a);
    navh+=`<a href="#${l.id}" id="nv-${l.id}"><i></i><span>${num}. ${l.t}</span></a>`;
  });
  nav.insertAdjacentHTML("beforeend",navh+"</div>");
  content.appendChild(sec);
});

const tr=document.createElement("section");tr.className="unit";
tr.innerHTML=`<div class="uh" id="tricks"><span class="tag">عيادة المشاكل</span><h2>شو المشكلة؟</h2><p>اختار اللي عم يصير معك، وبتعرف السبب والحل.</p></div><div class="w-diag"></div>
<div class="uh" style="margin-top:48px" id="routine"><span class="tag">روتين يومي</span><h2>٣٠ دقيقة كل يوم أحسن من ٣ ساعات يوم الجمعة</h2></div>
<div class="tablewrap"><table class="plan"><tr><th>الوقت</th><th>شو تعمل</th><th>ليش</th></tr>
<tr><td class="m">5 د</td><td>دوزان + الكروماتيك مع المدرّب (درس 10)</td><td>تسخين وتنسيق بين الإيدين</td></tr>
<tr><td class="m">10 د</td><td>الدرس الحالي بوضع «هو بيعزف وبعدين أنا»</td><td>هون بيصير التطوّر الحقيقي</td></tr>
<tr><td class="m">5 د</td><td>تمرين الدقيقة على أصعب زوج كوردات</td><td>أسرع طريق للأغاني</td></tr>
<tr><td class="m">10 د</td><td>أغنية بتحبها مع المدرّب أو مع الأصلي</td><td>عشان تضل مبسوط وما تزهق</td></tr></table></div>`;
content.appendChild(tr);
W.diag(tr.querySelector(".w-diag"));
nav.insertAdjacentHTML("beforeend",`<div><div class="u">إضافي</div><a href="#tricks"><span>عيادة المشاكل</span></a><a href="#routine"><span>الروتين اليومي</span></a></div>`);
content.insertAdjacentHTML("beforeend",`<footer>التقدّم محفوظ على هاد الجهاز والمتصفح بس.<br>المصادر اللي اعتمدت عليها: <a href="https://www.thisisclassicalguitar.com/free-classical-guitar-method-book-pdf/" target="_blank" rel="noopener">Bradford Werner (This is Classical Guitar)</a> · <a href="https://www.justinguitar.com/classes/beginner-guitar-course-grade-one" target="_blank" rel="noopener">JustinGuitar</a> · <a href="http://www.guitarabia.com/" target="_blank" rel="noopener">جيتارابيا</a>. ترتيب كوردات الأغاني مأخوذ من جيتارابيا، فطابقه دايماً مع الأغنية الأصلية.</footer>`);

road.innerHTML=UNITS.map(u=>`<a href="#u${u.id}"><b>${u.id}</b>${u.name}<span class="mini"><i id="rd-${u.id}"></i></span></a>`).join("");

function refresh(){
  const n=ALL.filter(l=>done[l.id]).length;
  document.getElementById("allBar").style.width=(n/ALL.length*100)+"%";
  document.getElementById("allPct").textContent=`${n}/${ALL.length}`;
  ALL.forEach(l=>document.getElementById("nv-"+l.id).classList.toggle("done",!!done[l.id]));
  UNITS.forEach(u=>{document.getElementById("rd-"+u.id).style.width=(u.lessons.filter(l=>done[l.id]).length/u.lessons.length*100)+"%"});
}
content.addEventListener("change",e=>{const l=e.target.dataset.l;if(l){done[l]=e.target.checked;save();refresh()}});
refresh();
const side=document.getElementById("side"),narrow=()=>matchMedia("(max-width:900px)").matches;
if(narrow())side.open=false;
nav.addEventListener("click",e=>{if(e.target.closest("a")&&narrow())side.open=false});

// ---- tuner ----
const sEl=document.getElementById("strings");let loopT=null;
const clearOn=()=>sEl.querySelectorAll("button").forEach(x=>x.classList.remove("on"));
[6,5,4,3,2,1].forEach(st=>{
  const b=document.createElement("button");b.innerHTML=`<b>${SNAME[st-1]}</b><small>وتر ${st}</small>`;
  b.onclick=()=>{clearInterval(loopT);clearOn();b.classList.add("on");pluck(mf(OPEN_MIDI[st-1]),0,2.5,.6);
    if(document.getElementById("loop").checked)loopT=setInterval(()=>pluck(mf(OPEN_MIDI[st-1]),0,2.5,.6),2200);
    else setTimeout(()=>b.classList.remove("on"),1500)};
  sEl.appendChild(b);
});
document.getElementById("loop").onchange=e=>{if(!e.target.checked){clearInterval(loopT);clearOn()}};

// ---- metronome (scheduled on the audio clock so it doesn't drift) ----
let bpm=60,running=false,next=0,beat=0,timer=null;
const bpmIn=document.getElementById("bpm"),bpmV=document.getElementById("bpmV"),dots=[...document.querySelectorAll("#beats span")];
const setBpm=v=>{bpm=Math.max(40,Math.min(200,v));bpmIn.value=bpm;bpmV.textContent=bpm};
bpmIn.oninput=e=>setBpm(+e.target.value);
document.getElementById("minus").onclick=()=>setBpm(bpm-5);
document.getElementById("plus").onclick=()=>setBpm(bpm+5);
function mtick(){const c=ac();while(next<c.currentTime+.1){const b=beat;click(next,b===0);setTimeout(()=>dots.forEach((d,i)=>d.classList.toggle("on",i===b)),Math.max(0,(next-c.currentTime)*1000));next+=60/bpm;beat=(beat+1)%4}}
document.getElementById("metBtn").onclick=e=>{running=!running;e.target.textContent=running?"وقّف":"شغّل";
  if(running){next=ac().currentTime+.05;beat=0;timer=setInterval(mtick,25)}else{clearInterval(timer);dots.forEach(d=>d.classList.remove("on"))}};

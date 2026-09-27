// Static illustrations for units A–C.
const SVG_PARTS=(()=>{
  let s=`<svg viewBox="0 0 760 260" role="img" aria-label="أجزاء الجيتار">`;
  s+=`<rect x="40" y="104" width="112" height="52" rx="8" fill="var(--wood)" stroke="var(--wood-line)"/>`;
  s+=`<rect x="58" y="116" width="80" height="8" rx="4" fill="var(--paper)"/><rect x="58" y="136" width="80" height="8" rx="4" fill="var(--paper)"/>`;
  [65,95,125].forEach(x=>{s+=`<rect x="${x-5}" y="86" width="10" height="18" rx="3" fill="var(--ink)"/><rect x="${x-5}" y="156" width="10" height="18" rx="3" fill="var(--ink)"/>`});
  s+=`<path d="M425,80 C430,62 470,60 520,62 C560,64 580,85 600,86 C620,87 640,40 690,38 C735,36 752,90 752,130 C752,170 735,224 690,222 C640,220 620,173 600,174 C580,175 560,196 520,198 C470,200 430,198 425,180 Z" fill="var(--wood)" stroke="var(--wood-line)" stroke-width="2"/>`;
  s+=`<circle cx="545" cy="130" r="42" fill="none" stroke="var(--wood-line)" stroke-width="6" stroke-dasharray="2 3"/><circle cx="545" cy="130" r="32" fill="var(--ink)"/>`;
  s+=`<rect x="152" y="112" width="290" height="36" fill="var(--wood-line)"/>`;
  for(let n=1;n<=12;n++){const x=152+(1-Math.pow(2,-n/12))*580;s+=`<line x1="${x}" y1="112" x2="${x}" y2="148" stroke="var(--paper)" stroke-width="1.5"/>`}
  s+=`<rect x="149" y="110" width="6" height="40" fill="var(--paper)" stroke="var(--ink)" stroke-width=".6"/>`;
  s+=`<rect x="656" y="100" width="26" height="60" rx="3" fill="var(--ink)"/><rect x="662" y="110" width="4" height="40" fill="var(--paper)"/>`;
  for(let i=0;i<6;i++){const y=117+i*5.2;s+=`<line x1="64" y1="${y}" x2="668" y2="${y}" stroke="var(--ink)" stroke-width="${.6+i*.18}" opacity=".8"/>`}
  s+=T(80,34,"الرأس")+Tm(80,50,"Headstock")+L(80,56,80,102);
  s+=T(80,236,"المفاتيح")+Tm(80,252,"Tuners")+L(80,212,80,176);
  s+=T(178,34,"العتبة")+Tm(178,50,"Nut")+L(165,56,152,108);
  s+=T(300,34,"الفريتات")+Tm(300,50,"Frets")+L(300,56,300,110);
  s+=T(300,236,"الرقبة (بتلتقي بالجسم عند فريت 12)")+L(300,212,300,150);
  s+=T(545,20,"فتحة الصوت والوردة")+L(545,26,545,86);
  s+=T(669,250,"الجسر والفرس")+Tm(669,236,"Bridge · Saddle")+L(669,222,669,162);
  return s+`</svg>`;
})();

const SVG_POSTURE=`<svg viewBox="0 0 400 320" role="img" aria-label="القعدة الكلاسيكية">
<line x1="10" y1="300" x2="390" y2="300" stroke="var(--line)" stroke-width="2"/>
<rect x="90" y="196" width="120" height="10" rx="3" fill="var(--line)"/><line x1="100" y1="206" x2="100" y2="300" stroke="var(--line)" stroke-width="5"/><line x1="200" y1="206" x2="200" y2="300" stroke="var(--line)" stroke-width="5"/>
<rect x="158" y="268" width="56" height="32" rx="3" fill="var(--wood)" stroke="var(--wood-line)"/>
<g stroke="var(--skin-line)" stroke-width="20" stroke-linecap="round" fill="none" opacity=".9"><path d="M130 196 L124 232 L124 292"/><path d="M168 196 L186 206 L186 262"/></g>
<path d="M115 86 L185 86 L178 196 L122 196 Z" fill="var(--soft)" stroke="var(--muted)"/>
<circle cx="150" cy="54" r="21" fill="var(--skin)" stroke="var(--skin-line)"/><rect x="143" y="72" width="14" height="14" fill="var(--skin)"/>
<g transform="translate(170,205) rotate(-40)">
 <circle cx="-30" cy="0" r="42" fill="var(--wood)" stroke="var(--wood-line)" stroke-width="2"/><circle cx="28" cy="0" r="32" fill="var(--wood)" stroke="var(--wood-line)" stroke-width="2"/>
 <rect x="-40" y="-30" width="50" height="60" fill="var(--wood)"/><circle cx="12" cy="0" r="11" fill="var(--ink)"/>
 <rect x="55" y="-7" width="150" height="14" fill="var(--wood-line)"/><rect x="205" y="-10" width="36" height="20" rx="3" fill="var(--wood-line)"/>
</g>
<g stroke="var(--skin-line)" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" fill="none"><path d="M118 92 L96 162 L170 196"/><path d="M182 92 L232 170 L252 136"/></g>
<line x1="212" y1="170" x2="330" y2="170" stroke="var(--accent)" stroke-dasharray="4 4"/>
<path d="M282 170 A70 70 0 0 0 266 125" fill="none" stroke="var(--accent)" stroke-width="2"/>
<text x="312" y="150" text-anchor="middle" font-size="14" font-weight="700" fill="var(--accent)">30°–45°</text>
${T(320,24,"رأس الجيتار بمستوى عينك")}${L(320,30,350,52)}
${T(48,120,"ظهرك")}${T(48,138,"مستقيم")}${L(70,128,116,130)}
${T(300,262,"مسند للرجل الشمال")}${Tm(300,278,"١٥ سم تقريباً")}${L(250,270,216,280)}
${T(58,236,"الرجل اليمين")}${Tm(58,252,"على الأرض")}${L(80,244,112,256)}
</svg>`;

function handGroup(ox,mirror,labels,title,sub){
  const X=x=>mirror?ox+(220-x):ox+x;
  const fingers=[[52,62],[78,74],[104,68],[130,52]];
  const dl=(x,y,lb)=>dot(x,y,lb.t,lb.dim?"var(--line)":(lb.col||"var(--accent)"),lb.dim?"var(--muted)":(lb.col?"var(--f-ink)":"var(--accent-ink)"),11);
  let s=`<rect x="${X(mirror?160:50)}" y="110" width="110" height="92" rx="34" fill="var(--skin)" stroke="var(--skin-line)"/>`;
  const tx=X(34);
  s+=`<rect x="${tx-11}" y="128" width="22" height="64" rx="11" fill="var(--skin)" stroke="var(--skin-line)" transform="rotate(${mirror?35:-35} ${tx} 176)"/>`;
  fingers.forEach(([x,h],i)=>{const cx=X(x+11);s+=`<rect x="${cx-11}" y="${120-h}" width="22" height="${h+14}" rx="11" fill="var(--skin)" stroke="var(--skin-line)"/>`+dl(cx,120-h+14,labels[i+1])});
  s+=dl(X(10),150,labels[0]);
  return s+T(ox+110,232,title,'font-weight="700"')+Tm(ox+110,250,sub);
}
const SVG_HANDS=`<svg viewBox="0 0 520 260" role="img" aria-label="أسماء الأصابع">
${handGroup(20,false,[{t:"–",dim:1},{t:"1",col:"var(--f1)"},{t:"2",col:"var(--f2)"},{t:"3",col:"var(--f3)"},{t:"4",col:"var(--f4)"}],"الإيد الشمال (بتكبس)","كل إصبع إله رقم ولون، والألوان نفسها بكل الموقع")}
${handGroup(280,true,[{t:"p"},{t:"i"},{t:"m"},{t:"a"},{t:"c",dim:1}],"الإيد اليمين (بتعزف)","حروف إسبانية: p i m a")}
</svg>`;

function strokePanel(ox,rest){
  let s=`<g transform="translate(${ox},0)">`;
  s+=`<line x1="20" y1="150" x2="250" y2="150" stroke="var(--wood-line)" stroke-width="6"/>`+Tm(135,170,"وجه الجيتار");
  [60,100,140,180,220].forEach((x,i)=>{s+=`<circle cx="${x}" cy="110" r="${7-i*.9}" fill="${x===180?"var(--accent)":"var(--ink)"}"/>`});
  const p=rest?"M206,104 C190,114 176,114 150,110":"M206,104 C190,114 176,114 164,96 S150,58 146,44";
  s+=`<path d="${p}" fill="none" stroke="var(--muted)" stroke-dasharray="3 4"/>`;
  s+=`<circle r="10" fill="var(--skin)" stroke="var(--skin-line)" stroke-width="2"><animateMotion dur="2s" repeatCount="indefinite" path="${p}" keyPoints="0;1;1;0" keyTimes="0;.35;.7;1" calcMode="linear"/></circle>`;
  s+=T(135,22,rest?"Apoyando · ضربة مسنودة":"Tirando · ضربة حرّة",'font-weight="700"');
  s+=Tm(135,40,rest?"الإصبع بيرتاح على الوتر اللي بعده":"الإصبع بيطلع لجوّا الكف فوق الأوتار");
  return s+Tm(60,132,"← الأتخن")+`</g>`;
}
const SVG_STROKES=`<svg viewBox="0 0 540 180" role="img" aria-label="الضربة الحرة والمسنودة">${strokePanel(0,false)}${strokePanel(270,true)}</svg>`;

const SVG_PRESS=`<svg viewBox="0 0 560 210" role="img" aria-label="وين تكبس">
<defs><linearGradient id="zone" x1="0" x2="1"><stop offset="0" stop-color="var(--bad)" stop-opacity=".35"/><stop offset=".5" stop-color="var(--warn)" stop-opacity=".35"/><stop offset=".85" stop-color="var(--good)" stop-opacity=".55"/><stop offset="1" stop-color="var(--good)" stop-opacity=".55"/></linearGradient></defs>
<rect x="30" y="50" width="250" height="60" fill="url(#zone)"/>
<rect x="24" y="40" width="6" height="80" fill="var(--muted)"/><rect x="280" y="40" width="7" height="80" fill="var(--ink)"/>
<line x1="10" y1="80" x2="300" y2="80" stroke="var(--ink)" stroke-width="2"/>
<circle cx="258" cy="80" r="12" fill="none" stroke="var(--good)" stroke-width="3"/>
${T(258,30,"هون ✓",'fill="var(--good)" font-weight="700"')}${Tm(258,140,"قريب من السلك")}
${T(90,30,"بعيد = طنين",'fill="var(--bad)"')}${Tm(90,140,"بدها ضغط أكتر")}
${T(150,178,"الفريت اللي بتعزفه (بين سلكين)")}${Tm(284,158,"السلك")}
<line x1="330" y1="170" x2="550" y2="170" stroke="var(--wood-line)" stroke-width="6"/>
<g fill="var(--ink)"><circle cx="360" cy="162" r="4"/><circle cx="390" cy="162" r="4"/><circle cx="420" cy="162" r="4"/><circle cx="470" cy="162" r="4"/><circle cx="500" cy="162" r="4"/><circle cx="530" cy="162" r="4"/></g>
<path d="M350,40 C385,40 392,90 390,154" fill="none" stroke="var(--skin-line)" stroke-width="18" stroke-linecap="round"/><path d="M350,40 C385,40 392,90 390,154" fill="none" stroke="var(--skin)" stroke-width="14" stroke-linecap="round"/>
<path d="M455,70 C480,95 490,140 530,154" fill="none" stroke="var(--skin-line)" stroke-width="18" stroke-linecap="round"/><path d="M455,70 C480,95 490,140 530,154" fill="none" stroke="var(--skin)" stroke-width="14" stroke-linecap="round"/>
${T(390,22,"✓ طرف الإصبع واقف",'fill="var(--good)"')}${T(500,40,"✗ مسطّح",'fill="var(--bad)"')}${Tm(500,56,"بيكتم الوتر اللي جنبه")}${Tm(440,195,"منظر جانبي")}
</svg>`;

const SVG_TABREAD=(()=>{
  let s=`<svg viewBox="0 0 620 210" role="img" aria-label="قراءة التاب">`;
  const desc=["الوتر 1 · الأرفع","","","","","الوتر 6 · الأتخن"];
  SNAME.forEach((n,i)=>{const y=40+i*20;s+=`<line x1="80" y1="${y}" x2="470" y2="${y}" stroke="var(--muted)"/><text x="66" y="${y+4}" text-anchor="middle" font-size="13" font-family="IBM Plex Mono,monospace" fill="var(--ink)">${n}</text>`;if(desc[i])s+=`<text x="540" y="${y+4}" text-anchor="middle" font-size="12" fill="var(--muted)">${desc[i]}</text>`});
  const num=(x,y,t)=>`<rect x="${x-9}" y="${y-9}" width="18" height="18" fill="var(--paper)"/><text x="${x}" y="${y+5}" text-anchor="middle" font-size="15" font-weight="700" font-family="IBM Plex Mono,monospace" fill="var(--accent)">${t}</text>`;
  s+=num(140,40,"0")+num(250,60,"3")+num(370,80,"2")+num(370,100,"2");
  s+=L(140,50,140,160)+L(250,70,250,160)+L(370,110,370,160);
  s+=T(140,178,"0 = مفتوح")+T(250,178,"3 = فريت 3")+T(370,178,"فوق بعض = مع بعض");
  s+=`<path d="M90 200 H460" stroke="var(--accent)" stroke-width="2"/><path d="M452 194 L462 200 L452 206" fill="none" stroke="var(--accent)" stroke-width="2"/>`+Tm(275,196,"اقرأ بهاد الاتجاه");
  return s+`</svg>`;
})();

const SVG_CHORDREAD=(()=>{
  const sc=150/110,ox=185,oy=18,P=(x,y)=>[ox+x*sc,oy+y*sc];
  let s=`<svg viewBox="0 0 520 240" role="img" aria-label="قراءة رسمة الكورد"><svg x="${ox}" y="${oy}" width="150" height="${128*sc}" viewBox="0 0 110 128">${chordSVG(CH.Am).replace(/^<svg[^>]*>/,"").replace(/<\/svg>$/,"")}</svg>`;
  const c=(lx,ly,px,py,t,sub)=>{const [x,y]=P(px,py);return L(lx,ly+4,x,y)+T(lx,ly-10,t)+(sub?Tm(lx,ly+6,sub):"")};
  s+=c(90,40,18,18,"× = لا تعزفه","")+c(430,34,93,14,"○ = مفتوح","اعزفه بدون كبس")+c(430,92,60,26,"العتبة","الخط العريض");
  s+=c(90,108,18,59,"الفريت 2","كل مربع = فريت")+c(430,150,78,37,"رقم ولون الإصبع","مش رقم الفريت");
  s+=c(90,200,18,110,"الوتر 6","E الأتخن")+c(430,212,93,110,"الوتر 1","e الأرفع");
  return s+`</svg>`;
})();

const SVG_TUNE5=(()=>{
  const x0=70,fw=78,y0=30,sh=26,F=5,W=x0+F*fw+30,Y=s=>y0+(6-s)*sh;
  let s=`<svg viewBox="0 0 ${W} 250" role="img" aria-label="الدوزان بالفريت الخامس"><defs><marker id="ah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="var(--accent)"/></marker></defs>`;
  s+=`<rect x="${x0}" y="${y0-8}" width="${F*fw}" height="${5*sh+16}" fill="var(--wood)" opacity=".4"/>`;
  for(let n=0;n<=F;n++)s+=`<line x1="${x0+n*fw}" y1="${y0-8}" x2="${x0+n*fw}" y2="${y0+5*sh+8}" stroke="var(--ink)" stroke-width="${n?1.2:5}"/><text x="${x0+(n+.5)*fw}" y="${y0+5*sh+28}" text-anchor="middle" font-size="11" fill="var(--muted)" font-family="IBM Plex Mono,monospace">${n<F?n+1:""}</text>`;
  for(let i=1;i<=6;i++){const y=Y(i);s+=`<line x1="${x0-30}" y1="${y}" x2="${x0+F*fw}" y2="${y}" stroke="var(--ink)" stroke-width="${.8+(i-1)*.35}"/><text x="${x0-48}" y="${y+4}" text-anchor="middle" font-size="12" font-family="IBM Plex Mono,monospace" fill="var(--ink)">${i} ${SNAME[i-1]}</text>`}
  [[6,5,1],[5,5,2],[4,5,3],[3,4,4],[2,5,5]].forEach(([st,f,k])=>{
    const x=x0+(f-.5)*fw,y=Y(st),ty=Y(st-1),tx=x0-16;
    s+=`<path d="M${x-12},${y+6} Q${(x+tx)/2},${ty+16} ${tx+6},${ty}" fill="none" stroke="var(--accent)" stroke-width="1.6" marker-end="url(#ah)"/>`;
    s+=`<circle cx="${x}" cy="${y}" r="10" fill="${f===4?"var(--warn)":"var(--dot)"}"/><text x="${x}" y="${y+4}" text-anchor="middle" font-size="11" font-weight="700" fill="var(--dot-ink)">${k}</text>`;
  });
  return s+`<text x="${x0+3*fw}" y="${y0+5*sh+48}" text-anchor="middle" font-size="12" fill="var(--muted)">الدائرة البرتقالية: وتر G على فريت 4 (مش 5)</text></svg>`;
})();

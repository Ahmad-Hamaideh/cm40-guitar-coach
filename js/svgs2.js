// Static illustrations for units D–G, plus the coach character.
const SVG_PIMA=(()=>{
  let s=`<svg viewBox="0 0 560 230" role="img" aria-label="أصابع الإيد اليمين والأوتار">`;
  const Y=i=>30+(6-i)*32;
  for(let i=1;i<=6;i++)s+=`<line x1="70" y1="${Y(i)}" x2="380" y2="${Y(i)}" stroke="var(--ink)" stroke-width="${.8+(i-1)*.35}"/><text x="36" y="${Y(i)+4}" text-anchor="middle" font-size="12" font-family="IBM Plex Mono,monospace" fill="var(--ink)">${i} ${SNAME[i-1]}</text>`;
  s+=`<path d="M392 ${Y(6)} H404 V${Y(4)} H392" fill="none" stroke="var(--warn)" stroke-width="3"/><line x1="404" y1="${Y(5)}" x2="444" y2="${Y(5)}" stroke="var(--warn)" stroke-width="3"/>`+dot(462,Y(5),"p","var(--warn)","var(--dot-ink)",15)+T(518,Y(5)-4,"الإبهام")+Tm(518,Y(5)+12,"الباص: 6 5 4");
  [[3,"i","السبابة"],[2,"m","الوسطى"],[1,"a","البنصر"]].forEach(([st,l,n])=>{s+=`<line x1="384" y1="${Y(st)}" x2="444" y2="${Y(st)}" stroke="var(--accent)" stroke-width="3"/>`+dot(462,Y(st),l,"var(--accent)","var(--accent-ink)",15)+T(518,Y(st)+4,n)});
  return s+T(225,222,"كل إصبع إله وتر، والإبهام للأوتار التخينة")+`</svg>`;
})();

const RHY=[["مقسوم","DT-TD-T-"],["بلدي","DD-TD-T-"],["سعيدي","DT-DD-T-"],["ملفوف","D--T--T-"]];
const SVG_RHYTHMS=(()=>{
  let s=`<svg viewBox="0 0 600 ${50+RHY.length*62}" role="img" aria-label="الإيقاعات العربية">`;
  ["1","&","2","&","3","&","4","&"].forEach((c,i)=>s+=Tm(60+i*58,22,c));
  RHY.forEach(([n,p],r)=>{const y=58+r*62;s+=`<line x1="40" y1="${y}" x2="486" y2="${y}" stroke="var(--line)"/>`+T(548,y+5,n,'font-weight="700"');
    [...p].forEach((k,i)=>{const x=60+i*58;s+=k==="D"?`<circle cx="${x}" cy="${y}" r="17" fill="var(--accent)"/><text x="${x}" y="${y+4}" text-anchor="middle" font-size="11" font-weight="700" fill="var(--accent-ink)">دُم</text>`:k==="T"?`<circle cx="${x}" cy="${y}" r="12" fill="var(--card)" stroke="var(--accent)" stroke-width="2.5"/><text x="${x}" y="${y+4}" text-anchor="middle" font-size="10" fill="var(--accent)">تَك</text>`:`<circle cx="${x}" cy="${y}" r="3" fill="var(--muted)"/>`});});
  return s+`</svg>`;
})();

const SVG_DUR=(()=>{
  let s=`<svg viewBox="0 0 560 160" role="img" aria-label="طول النغمات">`;
  const note=(x,fill,stem,flag)=>`<ellipse cx="${x}" cy="80" rx="10" ry="7" transform="rotate(-20 ${x} 80)" fill="${fill?"var(--ink)":"var(--card)"}" stroke="var(--ink)" stroke-width="2"/>`+(stem?`<line x1="${x+9}" y1="78" x2="${x+9}" y2="30" stroke="var(--ink)" stroke-width="2"/>`:"")+(flag?`<path d="M${x+9} 30 q16 10 10 32" fill="none" stroke="var(--ink)" stroke-width="2.5"/>`:"");
  [["مستديرة","٤ عدّات",0,0,0],["بيضاء","عدّتين",0,1,0],["سوداء","عدّة وحدة",1,1,0],["كروش","نص عدّة",1,1,1]].forEach(([n,c,f,st,fl],i)=>{const x=80+i*130;s+=note(x,f,st,fl)+T(x,124,n,'font-weight="700"')+Tm(x,144,c)});
  return s+`</svg>`;
})();

const MAQ=[["نهاوند (على لا)",["A","B","C","D","E","F","G#","A"],[2,1,2,2,1,3,1]],["حجاز (على ري)",["D","E♭","F#","G","A","B♭","C","D"],[1,3,1,2,1,2,2]],["كرد (على مي)",["E","F","G","A","B","C","D","E"],[1,2,2,2,1,2,2]]];
const SVG_MAQAM=(()=>{
  let s=`<svg viewBox="0 0 640 240" role="img" aria-label="مسافات المقامات">`;
  MAQ.forEach(([n,notes,st],r)=>{const y=24+r*72;let x=30;s+=T(580,y+20,n,'font-weight="700"');
    st.forEach((k,i)=>{const w=k*38;s+=`<rect x="${x}" y="${y}" width="${w}" height="30" rx="4" fill="${k===3?"var(--warn)":k===1?"var(--soft)":"var(--card)"}" fill-opacity="${k===3?.45:1}" stroke="var(--line)"/><text x="${x+w/2}" y="${y+20}" text-anchor="middle" font-size="12" fill="var(--ink)">${k===1?"½":k===2?"1":"1½"}</text><text x="${x}" y="${y+48}" text-anchor="middle" font-size="12" font-family="IBM Plex Mono,monospace" fill="var(--muted)">${notes[i]}</text>`;x+=w});
    s+=`<text x="${x}" y="${y+48}" text-anchor="middle" font-size="12" font-family="IBM Plex Mono,monospace" fill="var(--muted)">${notes[7]}</text>`});
  return s+`</svg>`;
})();

const SVG_HALFBARRE=(()=>{
  const Y=i=>30+(6-i)*26;
  let s=`<svg viewBox="0 0 590 215" role="img" aria-label="نص بار"><rect x="40" y="18" width="290" height="154" fill="var(--wood)" opacity=".4"/>`;
  [40,130,220,310].forEach((x,k)=>{s+=`<line x1="${x}" y1="18" x2="${x}" y2="172" stroke="var(--ink)" stroke-width="1.2"/>`;if(k<3)s+=Tm(x+45,188,`فريت ${5+k}`)});
  for(let i=1;i<=6;i++)s+=`<line x1="30" y1="${Y(i)}" x2="330" y2="${Y(i)}" stroke="var(--ink)" stroke-width="${.8+(i-1)*.35}"/><text x="18" y="${Y(i)+4}" text-anchor="middle" font-size="11" fill="var(--muted)" font-family="IBM Plex Mono,monospace">${i}</text>`;
  s+=`<rect x="108" y="${Y(3)-13}" width="22" height="${Y(1)-Y(3)+26}" rx="11" fill="var(--f1)"/><text x="119" y="${Y(2)+4}" text-anchor="middle" font-size="12" font-weight="700" fill="var(--f-ink)">1</text>`;
  s+=T(185,208,"السبابة نايمة على الأوتار 1 و 2 و 3");
  s+=`<line x1="370" y1="172" x2="580" y2="172" stroke="var(--wood-line)" stroke-width="6"/>`;
  [390,420,450,480,510,540].forEach(x=>s+=`<circle cx="${x}" cy="163" r="4" fill="var(--ink)"/>`);
  s+=`<rect x="470" y="143" width="84" height="15" rx="7.5" fill="var(--skin)" stroke="var(--skin-line)" stroke-width="2"/><line x1="474" y1="157" x2="550" y2="157" stroke="var(--accent)" stroke-width="3"/>`;
  s+=T(480,48,"استعمل جنب الإصبع العظمي")+Tm(480,66,"لفّ السبابة شوي لجهة الإبهام")+L(480,74,512,150)+Tm(475,200,"منظر جانبي");
  return s+`</svg>`;
})();

const SVG_BARRE_F=(()=>{
  const x0=70,fw=110,y0=40,sh=28,Y=s=>y0+(6-s)*sh,X=f=>x0+(f-.5)*fw;
  let s=`<svg viewBox="0 0 600 225" role="img" aria-label="كورد F"><rect x="${x0}" y="${y0-12}" width="${3*fw}" height="${5*sh+24}" fill="var(--wood)" opacity=".4"/>`;
  for(let n=0;n<=3;n++)s+=`<line x1="${x0+n*fw}" y1="${y0-12}" x2="${x0+n*fw}" y2="${y0+5*sh+12}" stroke="var(--ink)" stroke-width="${n?1.2:5}"/>`+(n?Tm(X(n),y0+5*sh+30,`فريت ${n}`):"");
  for(let i=1;i<=6;i++)s+=`<line x1="${x0-24}" y1="${Y(i)}" x2="${x0+3*fw}" y2="${Y(i)}" stroke="var(--ink)" stroke-width="${.8+(i-1)*.35}"/><text x="30" y="${Y(i)+4}" text-anchor="middle" font-size="11" font-family="IBM Plex Mono,monospace" fill="var(--muted)">${i} ${SNAME[i-1]}</text>`;
  s+=`<rect x="${X(1)-12}" y="${Y(6)-13}" width="24" height="${Y(1)-Y(6)+26}" rx="12" fill="var(--f1)"/>`;
  [6,2,1].forEach(i=>s+=`<circle cx="${X(1)}" cy="${Y(i)}" r="13" fill="none" stroke="var(--warn)" stroke-width="3"/>`);
  s+=dot(X(2),Y(3),"2","var(--f2)","var(--f-ink)",12)+dot(X(3),Y(5),"3","var(--f3)","var(--f-ink)",12)+dot(X(3),Y(4),"4","var(--f4)","var(--f-ink)",12);
  s+=T(500,70,"الأوتار 6 و 2 و 1",'fill="var(--warn)" font-weight="700"')+Tm(500,88,"هون بس السبابة لازم تكبس")+T(500,140,"الأوتار 3 و 4 و 5")+Tm(500,158,"عليها أصابع ثانية")+Tm(500,174,"فالسبابة بترتاح هناك");
  return s+`</svg>`;
})();

const SVG_SLUR=`<svg viewBox="0 0 600 200" role="img" aria-label="الربط">
<defs><marker id="ar2" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0L10 5L0 10z" fill="var(--accent)"/></marker></defs>
${T(150,24,"Hammer-on (h)",'font-weight="700"')}
<line x1="30" y1="140" x2="270" y2="140" stroke="var(--ink)" stroke-width="2"/><line x1="60" y1="120" x2="60" y2="160" stroke="var(--muted)" stroke-width="3"/><line x1="170" y1="120" x2="170" y2="160" stroke="var(--muted)" stroke-width="3"/>
<circle cx="150" cy="62" r="13" fill="var(--f2)"/><text x="150" y="67" text-anchor="middle" font-size="12" font-weight="700" fill="var(--f-ink)">2</text>
<path d="M150 78 V124" stroke="var(--accent)" stroke-width="2.5" stroke-dasharray="5 4" marker-end="url(#ar2)"/>
<g stroke="var(--warn)" stroke-width="2.5"><line x1="136" y1="140" x2="128" y2="132"/><line x1="164" y1="140" x2="172" y2="132"/><line x1="150" y1="146" x2="150" y2="156"/></g>
${Tm(150,186,"انزل بسرعة كأنه مطرقة، وقريب من السلك")}
${T(450,24,"Pull-off (p)",'font-weight="700"')}
<path d="M320 90 L440 106 L570 90" fill="none" stroke="var(--ink)" stroke-width="2"/><line x1="460" y1="70" x2="460" y2="110" stroke="var(--muted)" stroke-width="3"/>
<circle cx="440" cy="106" r="13" fill="var(--f2)"/><text x="440" y="111" text-anchor="middle" font-size="12" font-weight="700" fill="var(--f-ink)">2</text>
<path d="M440 124 Q438 146 424 158" fill="none" stroke="var(--accent)" stroke-width="2.5" marker-end="url(#ar2)"/>
${Tm(450,186,"اسحب الوتر لتحت (باتجاه الأرض) كأنك بتنقره")}
</svg>`;

const SVG_TREMOLO=(()=>{
  let s=`<svg viewBox="0 0 580 180" role="img" aria-label="التريمولو"><line x1="40" y1="60" x2="540" y2="60" stroke="var(--ink)"/><line x1="40" y1="130" x2="540" y2="130" stroke="var(--ink)" stroke-width="2"/>`+Tm(20,64,"وتر 1")+Tm(20,134,"باص");
  for(let i=0;i<8;i++){const x=80+i*62,b=i%4===0;s+=b?dot(x,130,"p","var(--warn)","var(--dot-ink)",14):dot(x,60,"ami"[i%4-1],"var(--accent)","var(--accent-ink)",14)}
  return s+T(290,26,"p a m i · p a m i")+Tm(290,170,"بتنسمع كأنها نغمة وحدة طويلة فوق باص")+`</svg>`;
})();

const SVG_RASG=(()=>{
  let s=`<svg viewBox="0 0 580 190" role="img" aria-label="رازغيادو">`;
  const lbl=["قبضة","e","a","m","i"];
  for(let k=0;k<5;k++){const cx=70+k*110,cy=60;s+=`<circle cx="${cx}" cy="${cy}" r="22" fill="var(--skin)" stroke="var(--skin-line)"/>`;
    [0,1,2,3].forEach(j=>{const out=(3-j)<k,x1=cx+(j-1.5)*9;s+=`<line x1="${x1}" y1="${cy+14}" x2="${x1+(out?(j-1.5)*6:0)}" y2="${out?cy+60:cy+30}" stroke="${out&&(3-j)===k-1?"var(--accent)":"var(--skin-line)"}" stroke-width="8" stroke-linecap="round"/>`});
    s+=T(cx,178,lbl[k],'font-weight="700"')}
  s+=`<g stroke="var(--muted)"><line x1="20" y1="140" x2="560" y2="140"/><line x1="20" y1="146" x2="560" y2="146"/><line x1="20" y1="152" x2="560" y2="152"/></g>`;
  return s+`</svg>`;
})();

const SVG_HARM=(()=>{
  let s=`<svg viewBox="0 0 600 250" role="img" aria-label="الهارمونك">`;
  [[2,"فريت 12 = نص الوتر"],[3,"فريت 7 = ثلث الوتر"],[4,"فريت 5 = ربع الوتر"]].forEach(([n,t],r)=>{
    const y=50+r*72,L0=40,Lw=520/n;let up="",dn="";
    for(let k=0;k<n;k++){const x=L0+k*Lw;up+=`M${x} ${y} Q${x+Lw/2} ${y-20} ${x+Lw} ${y}`;dn+=`M${x} ${y} Q${x+Lw/2} ${y+20} ${x+Lw} ${y}`}
    s+=`<path d="${up}" fill="none" stroke="var(--accent)" stroke-width="2"/><path d="${dn}" fill="none" stroke="var(--accent)" stroke-width="1" opacity=".5"/>`;
    s+=`<rect x="36" y="${y-12}" width="6" height="24" fill="var(--ink)"/><rect x="556" y="${y-12}" width="6" height="24" fill="var(--ink)"/>`;
    const nx=L0+Lw;s+=`<path d="M${nx} ${y-9} L${nx+9} ${y} L${nx} ${y+9} L${nx-9} ${y}Z" fill="var(--warn)"/>`+T(nx,y+38,t);
  });
  return s+Tm(40,238,"العتبة")+Tm(558,238,"الجسر")+`</svg>`;
})();

const SVG_TONE=`<svg viewBox="0 0 600 170" role="img" aria-label="ألوان الصوت">
<rect x="20" y="70" width="220" height="40" fill="var(--wood-line)"/><circle cx="330" cy="90" r="38" fill="var(--ink)"/><rect x="510" y="66" width="24" height="48" rx="3" fill="var(--ink)"/>
<rect x="230" y="60" width="60" height="60" fill="var(--f2)" opacity=".25"/><rect x="330" y="60" width="80" height="60" fill="var(--f1)" opacity=".25"/><rect x="440" y="60" width="60" height="60" fill="var(--f4)" opacity=".3"/>
<line x1="20" y1="90" x2="522" y2="90" stroke="var(--paper)" stroke-width="2"/>
${T(260,40,"Tasto")}${Tm(260,140,"دافي وناعم")}${T(370,40,"عادي")}${Tm(370,140,"متوازن")}${T(470,40,"Ponticello")}${Tm(470,140,"حاد ومعدني")}
</svg>`;

const SVG_SHIFT=(()=>{
  const x=f=>40+(f-.5)*56;
  let s=`<svg viewBox="0 0 600 170" role="img" aria-label="التنقّل على الرقبة"><line x1="40" y1="90" x2="560" y2="90" stroke="var(--ink)" stroke-width="2"/>`;
  for(let n=0;n<=9;n++)s+=`<line x1="${40+n*56}" y1="70" x2="${40+n*56}" y2="110" stroke="var(--ink)" stroke-width="${n?1.2:5}"/>`+(n?Tm(40+(n-.5)*56,128,n):"");
  [1,3,5,7].forEach((f,k)=>{s+=`<g opacity="${.35+k*.2}">${dot(x(f),90,"1","var(--f1)","var(--f-ink)",12)}</g>`;if(k<3)s+=`<path d="M${x(f)+6} 74 Q${x(f)+56} 50 ${x(f+2)-6} 74" fill="none" stroke="var(--accent)" stroke-width="2" stroke-dasharray="4 3"/>`});
  s+=dot(x(9),90,"3","var(--f3)","var(--f-ink)",12);
  return s+T(300,26,"الإصبع 1 بيزحط على الوتر ويدلّك على المكان الجديد")+Tm(300,158,"ارخي الضغط وانت بتتحرّك، والإبهام بيتحرّك مع الإيد")+`</svg>`;
})();

const SVG_CHUNK=(()=>{
  let s=`<svg viewBox="0 0 600 230" role="img" aria-label="تعلّم من الآخر">`;
  for(let i=0;i<8;i++)s+=`<rect x="${40+i*66}" y="24" width="60" height="34" rx="6" fill="var(--card)" stroke="var(--line)"/>`+T(70+i*66,46,`مقطع ${i+1}`,'font-size="11"');
  for(let r=0;r<4;r++){const a=7-r,x=40+a*66,w=(r+1)*66-6,y=80+r*30;s+=`<rect x="${x}" y="${y}" width="${w}" height="22" rx="5" fill="var(--accent)" opacity="${.3+r*.18}"/>`+Tm(x-34,y+15,`يوم ${r+1}`)}
  return s+T(300,218,"بتبدأ من الآخر وبترجع لورا: كل مرة بتوصل لإشي بتعرفه منيح")+`</svg>`;
})();

const SVG_LADDER=(()=>{
  const P=[["Lágrima","Tárrega"],["Adelita","Tárrega"],["Romanza كاملة","Anon."],["Bourrée","Bach"],["Prelude 1","Villa-Lobos"],["Asturias","Albéniz"]];
  let s=`<svg viewBox="0 0 600 290" role="img" aria-label="درج المقطوعات">`;
  P.forEach(([n,c],k)=>{const x=24+k*92,top=250-k*36;s+=`<rect x="${x}" y="${top}" width="90" height="${270-top}" fill="${k===5?"var(--warn)":"var(--soft)"}" fill-opacity="${k===5?.5:1}" stroke="var(--line)"/>`+T(x+45,top-22,n,'font-size="12" font-weight="700"')+Tm(x+45,top-8,c)});
  return s+`</svg>`;
})();

const SVG_YEARS=(()=>{
  const M=[["اليوم","الوحدة A"],["٣ شهور","A لحد C"],["٦ شهور","D و E"],["سنة","F: البار"],["سنتين وأكتر","G، أستاذ، جيتار أحسن"]];
  let s=`<svg viewBox="0 0 600 190" role="img" aria-label="الطريق بالسنين"><line x1="40" y1="95" x2="560" y2="95" stroke="var(--ink)" stroke-width="2"/>`;
  M.forEach(([a,b],k)=>{const x=60+k*120,up=k%2===0;s+=`<circle cx="${x}" cy="95" r="9" fill="var(--accent)"/>`+T(x,up?55:135,a,'font-weight="700"')+Tm(x,up?72:152,b)});
  return s+Tm(300,182,"تقريباً، وكل واحد بسرعته")+`</svg>`;
})();

const CHAR_SVG=`<svg viewBox="0 0 210 215" aria-hidden="true">
<g class="bub" opacity="0"><rect x="108" y="4" width="96" height="36" rx="14" fill="var(--warn)"/><path d="M122 38 l-8 12 l20 -12z" fill="var(--warn)"/><text x="156" y="28" text-anchor="middle" font-size="16" font-weight="700" fill="var(--dot-ink)">دورك!</text></g>
<rect x="84" y="200" width="40" height="10" rx="3" fill="var(--wood)"/>
<rect x="60" y="158" width="17" height="52" rx="8" fill="var(--muted)"/><rect x="92" y="150" width="17" height="52" rx="8" fill="var(--muted)"/>
<rect x="50" y="86" width="64" height="82" rx="22" fill="var(--accent)"/>
<g transform="translate(94,140) rotate(-35)"><circle cx="-22" cy="0" r="31" fill="var(--wood)" stroke="var(--wood-line)" stroke-width="2"/><circle cx="20" cy="0" r="24" fill="var(--wood)" stroke="var(--wood-line)" stroke-width="2"/><rect x="-28" y="-20" width="46" height="40" fill="var(--wood)"/><circle cx="6" cy="0" r="8" fill="var(--ink)"/><rect x="40" y="-5" width="72" height="10" fill="var(--wood-line)"/><rect x="112" y="-7" width="22" height="14" rx="3" fill="var(--wood-line)"/><g stroke="var(--paper)" stroke-width=".6" opacity=".8"><line x1="-40" y1="-3" x2="112" y2="-3"/><line x1="-40" y1="0" x2="112" y2="0"/><line x1="-40" y1="3" x2="112" y2="3"/></g></g>
<path d="M110 96 Q140 128 150 100" fill="none" stroke="var(--skin-line)" stroke-width="11" stroke-linecap="round"/><path d="M110 96 Q140 128 150 100" fill="none" stroke="var(--skin)" stroke-width="8" stroke-linecap="round"/>
<g class="hd"><circle cx="82" cy="54" r="26" fill="var(--skin)" stroke="var(--skin-line)"/><path d="M56 52 Q58 24 82 25 Q108 25 108 50 Q98 38 82 40 Q66 40 56 52Z" fill="var(--ink)"/><circle cx="73" cy="57" r="2.8" fill="var(--ink)"/><circle cx="91" cy="57" r="2.8" fill="var(--ink)"/><path d="M73 67 Q82 74 91 67" fill="none" stroke="var(--ink)" stroke-width="2.2" stroke-linecap="round"/></g>
<g class="ra"><path d="M56 96 L44 134 L92 140" fill="none" stroke="var(--skin-line)" stroke-width="11" stroke-linecap="round" stroke-linejoin="round"/><path d="M56 96 L44 134 L92 140" fill="none" stroke="var(--skin)" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/><circle cx="94" cy="140" r="7" fill="var(--skin)" stroke="var(--skin-line)"/></g>
</svg>`;

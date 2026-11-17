"use strict";
const $=id=>document.getElementById(id);
function el(t,c,x){const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e}
const FALL="Vliegtuig,Fiets,Olifant,Zonnebril,Kerstboom,Voetbal,Tandenborstel,Regenboog,Krokodil,Banaan,Ziekenhuis,Brandweer,Computermuis,Ruimtevaart,Bibliotheek,Chocolade,Paraplu,Wasmachine,Telescoop,Kangoeroe,Strand,Sneeuwpop,Politieagent,Vulkaan,Broodrooster,Treinstation,Dolfijn,Verkeerslicht,Koffiezetapparaat,Zandkasteel,Bergbeklimmer,Schildpad,Portemonnee,Kettingzaag,Waterval,Supermarkt,Draaimolen,Sleutelbos,Fototoestel,Vuurtoren,Spookhuis,Basketbal,Magnetron,Aardbei,Rugzak,Zeilboot,Dierenarts,Kroonluchter,Kikker,Motorfiets,Kasteel,Kookpan,Schaakbord,Pinguïn,Lift,Wolkenkrabber,Giraffe,Koplamp,Slaapzak,Diamant,Maanlanding,Verrekijker,Trompet,Kermis,Duikbril,Luchtballon,Stofzuiger,Honingbij,Sneeuwvlok,Paardenbloem,Winkelwagen,Klapstoel,Tuinman,Koffiemok,Vuurwerk,Koelkast,Boemerang,Draaitafel,Octopus,Skateboard,Zeehond,Raket,Broodtrommel,Regenjas,Klokkentoren,Winkelcentrum,Zonnescherm,Piano,Fietspomp,Vogelverschrikker,Schaatsen,Ketting,Zandloper,Molen,Tulp,Stroopwafel,Klompen,Dijk,Gracht,Haring,Kaas,Windmolen,Trampoline,Pannenkoek,Brandweerauto,Ijsbeer,Kampvuur,Tent,Zwembad,Schommel,Glijbaan,Pizza,Hamburger,Spaghetti,Popcorn,Gitaar,Drumstel,Microfoon,Bioscoop,Theater,Circus,Clown,Goochelaar,Piraat,Schatkist,Kompas,Anker,Duikboot,Helikopter,Ambulance,Tractor,Graafmachine,Vrachtwagen,Tram,Metro,Luchthaven,Parachute,Astronaut,Planeet,Komeet,Zonsondergang,Onweer,Bliksem,Orkaan,Bakker,Slager,Kapper,Dokter,Leraar,Piloot,Kok,Schilder,Rekenmachine,Schaar,Hamer,Boormachine,Zaklamp,Kaars,Spiegel,Bril,Horloge,Wekker,Kussen,Dekbed,Pyjama,Trui,Sjaal,Handschoen,Laarzen,Bruiloft,Verjaardag,Cadeau,Taart,Ballon,Feestmuts".split(",");
const A={tc:[2,3,4,5,6],du:[30,45,60],tg:[15,25,40]};
const cfg={tc:2,du:30,tg:25};
let S=null,apiW=[],timer=null,endAt=0,cur=[],AC=null,wl=null,fetching=false;

function seg(id,vals,key,fmt){
  const box=$(id);box.replaceChildren();
  vals.forEach(v=>{
    const b=el("button",cfg[key]===v?"on":"",fmt(v));b.type="button";
    b.addEventListener("click",()=>{cfg[key]=v;seg(id,vals,key,fmt);if(key==="tc")names()});
    box.appendChild(b);
  });
}
function names(){
  const old=[...document.querySelectorAll("#tn input")].map(i=>i.value);
  const box=$("tn");box.replaceChildren();
  for(let i=0;i<cfg.tc;i++){
    const inp=el("input");inp.type="text";inp.maxLength=14;inp.autocomplete="off";
    inp.value=old[i]||"Team "+(i+1);
    box.append(el("label","","Naam team "+(i+1)),inp);
  }
}
function show(id){document.querySelectorAll(".scr").forEach(s=>s.classList.toggle("on",s.id===id));window.scrollTo(0,0)}

/* opslag met validatie */
function save(){try{localStorage.setItem("ts30",JSON.stringify(S))}catch(e){}}
function load(){
  try{
    const s=JSON.parse(localStorage.getItem("ts30"));
    if(!s||!Array.isArray(s.teams)||s.teams.length<2||s.teams.length>6)return null;
    if(!s.teams.every(t=>t&&typeof t.n==="string"&&Number.isInteger(t.s)))return null;
    if(!Number.isInteger(s.cur)||s.cur<0||s.cur>=s.teams.length)return null;
    if(!A.du.includes(s.dur)||!A.tg.includes(s.target))return null;
    s.teams.forEach(t=>{t.n=t.n.slice(0,14)});
    s.used=Array.isArray(s.used)?s.used.filter(x=>typeof x==="string"):[];
    s.round=Number.isInteger(s.round)?s.round:1;s.card=Number.isInteger(s.card)?s.card:0;
    return s;
  }catch(e){return null}
}

/* woorden */
async function fetchApi(){
  if(fetching)return;fetching=true;
  try{
    const jobs=Array.from({length:12},()=>fetch("https://random-words-api.vercel.app/word/dutch",{signal:AbortSignal.timeout(4000),credentials:"omit",referrerPolicy:"no-referrer"})
      .then(r=>r.ok?r.json():null).then(d=>Array.isArray(d)&&d[0]&&typeof d[0].word==="string"?d[0].word:null).catch(()=>null));
    (await Promise.all(jobs)).forEach(w=>{
      if(!w||!/^[A-Za-zÀ-ÿ-]{3,18}$/.test(w))return;
      w=w[0].toUpperCase()+w.slice(1).toLowerCase();
      if(!apiW.includes(w)&&apiW.length<60)apiW.push(w);
    });
  }finally{fetching=false}
}
function nextWord(){
  const used=S.used;let w=null;
  while(apiW.length&&!w){const c=apiW.pop();if(!used.includes(c.toLowerCase()))w=c}
  if(!w){
    let c=FALL.filter(x=>!used.includes(x.toLowerCase()));
    if(!c.length){S.used=[];c=FALL.slice()}
    w=c[Math.floor(Math.random()*c.length)];
  }
  S.used.push(w.toLowerCase());
  if(S.used.length>400)S.used=S.used.slice(-200);
  if(apiW.length<6)fetchApi();
  return w;
}

/* spel */
function startGame(){
  const nm=[...document.querySelectorAll("#tn input")].map((i,k)=>i.value.trim().slice(0,14)||"Team "+(k+1));
  S={teams:nm.map(n=>({n,s:0})),cur:0,round:1,dur:cfg.du,target:cfg.tg,used:[],card:0,over:false};
  save();intro();
}
function intro(){
  $("iTeam").textContent=S.teams[S.cur].n;
  $("iRound").textContent="Ronde "+S.round;
  $("iCards").textContent="Doel: "+S.target+" punten";
  show("intro");
}
function drawCard(){
  S.card++;
  cur=Array.from({length:5},()=>({w:nextWord(),ok:false}));
  $("cardNo").textContent="#"+S.card;
  $("dTeam").textContent=S.teams[S.cur].n;
  $("cardTag").textContent="Kaart #"+S.card+" · 5 woorden";
  renderWords($("cardWords"),true);
  $("flip").classList.remove("f");
  $("tm").textContent=S.dur;$("tm").classList.remove("lo");$("bar").style.width="100%";
  show("draws");save();
}
function renderWords(box,tappable){
  box.replaceChildren();
  cur.forEach(c=>{
    const d=el("div","w"+(c.ok?" ok":"")+(tappable?" tap":""));
    d.append(el("div","ck",c.ok?"✓":""),el("span","",c.w));
    if(tappable)d.addEventListener("click",()=>{if(!timer)return;c.ok=!c.ok;renderWords(box,true)});
    box.appendChild(d);
  });
  if(tappable)$("dPts").textContent=cur.filter(c=>c.ok).length+" punten";
}
function flipCard(){
  if($("flip").classList.contains("f")||timer)return;
  try{AC=AC||new (window.AudioContext||window.webkitAudioContext)();AC.resume()}catch(e){}
  $("flip").classList.add("f");
  startTimer();
}
async function lock(){try{if("wakeLock" in navigator)wl=await navigator.wakeLock.request("screen")}catch(e){}}
function unlock(){try{if(wl)wl.release()}catch(e){}wl=null}
function startTimer(){
  endAt=Date.now()+S.dur*1000;
  lock();tick();timer=setInterval(tick,200);
}
function tick(){
  const left=Math.max(0,(endAt-Date.now())/1000);
  $("tm").textContent=Math.ceil(left);
  $("tm").classList.toggle("lo",left<=5);
  $("bar").style.width=(left/S.dur*100)+"%";
  if(left<=0)stopTimer(true);
}
function beep(){
  try{
    if(AC){for(let i=0;i<2;i++){
      const o=AC.createOscillator(),g=AC.createGain(),t=AC.currentTime+i*.5;
      o.type="square";o.frequency.value=880;g.gain.value=.3;
      o.connect(g);g.connect(AC.destination);o.start(t);o.stop(t+.25);
    }}
  }catch(e){}
  try{if(navigator.vibrate)navigator.vibrate([300,200,300])}catch(e){}
}
function stopTimer(buzz){
  if(!timer)return;
  clearInterval(timer);timer=null;unlock();
  if(buzz)beep();
  renderWords($("rWords"),false);
  const n=cur.filter(c=>c.ok).length;
  $("rPts").textContent=n+(n===1?" punt":" punten");
  show("review");
}
function confirmPts(){
  S.teams[S.cur].s+=cur.filter(c=>c.ok).length;
  const lastTeam=S.cur===S.teams.length-1;
  /* einde pas na volledige ronde: iedereen evenveel beurten */
  if(lastTeam&&S.teams.some(x=>x.s>=S.target)){S.over=true;save();return endScreen()}
  S.cur=(S.cur+1)%S.teams.length;
  if(S.cur===0)S.round++;
  save();board();
}
function rows(box,list,hl){
  box.replaceChildren();
  const max=Math.max(S.target,...list.map(t=>t.s));
  list.forEach(t=>{
    const r=el("div","sc"+(hl&&t===S.teams[S.cur]?" cur":""));
    const bar=el("div","tr"),fill=document.createElement("i");
    fill.style.width=Math.min(100,t.s/max*100)+"%";bar.appendChild(fill);
    r.append(el("div","nm",t.n),bar,el("div","pt",String(t.s)));
    box.appendChild(r);
  });
}
function board(){
  rows($("bList"),S.teams,true);
  const lead=Math.max(...S.teams.map(t=>t.s));
  $("bSub").textContent="Eerste team met "+S.target+" punten wint"+(lead>=S.target?" · laatste beurt van de ronde!":"");
  $("next").textContent="Volgende: "+S.teams[S.cur].n;
  show("board");
}
function endScreen(){
  const sorted=[...S.teams].sort((a,b)=>b.s-a.s);
  const tie=sorted.filter(t=>t.s===sorted[0].s);
  $("eWin").textContent=tie.map(t=>t.n).join(" & ");
  $("eSub").textContent=tie.length>1?"Gelijkspel met "+sorted[0].s+" punten":sorted[0].s+" punten";
  rows($("eList"),sorted,false);
  show("end");
}
function reset(){
  clearInterval(timer);timer=null;unlock();
  try{localStorage.removeItem("ts30")}catch(e){}
  S=null;init();
}
function init(){
  seg("tc",A.tc,"tc",v=>v+" teams");seg("du",A.du,"du",v=>v+" sec");seg("tg",A.tg,"tg",v=>v+" ptn");names();
  const s=load();$("cont").classList.toggle("hide",!(s&&!s.over));
  show("setup");
}

$("go").addEventListener("click",startGame);
$("cont").addEventListener("click",()=>{const s=load();if(!s)return init();S=s;board()});
$("draw").addEventListener("click",drawCard);
$("toBoard").addEventListener("click",board);
$("flip").addEventListener("click",flipCard);
$("stopT").addEventListener("click",()=>stopTimer(false));
$("confirm").addEventListener("click",confirmPts);
$("next").addEventListener("click",intro);
$("quit").addEventListener("click",()=>{if(confirm("Spel stoppen en opnieuw beginnen?"))reset()});
$("again").addEventListener("click",reset);
document.addEventListener("visibilitychange",()=>{if(!document.hidden&&timer){lock();tick()}});

init();fetchApi();
if("serviceWorker" in navigator&&location.protocol==="https:"||location.hostname==="localhost"){
  window.addEventListener("load",()=>{navigator.serviceWorker.register("sw.js").catch(()=>{})});
}

(function(){"use strict";
const $=s=>document.querySelector(s),announce=t=>{const n=$("#speech-status");if(n)n.textContent=t};
let scale=1;try{scale=Number(localStorage.getItem("geb-cursos-font")||"1")||1}catch(e){}
function font(next){scale=Math.min(1.4,Math.max(.9,Math.round(next*10)/10));document.documentElement.style.setProperty("--size",String(Math.round(16*scale))+"px");try{localStorage.setItem("geb-cursos-font",scale)}catch(e){}}
font(scale);document.querySelectorAll("[data-font]").forEach(b=>b.addEventListener("click",()=>font(b.dataset.font==="more"?scale+.1:b.dataset.font==="less"?scale-.1:1)));

const synth="speechSynthesis" in window ? window.speechSynthesis : null;
let playbackId=0;
const mixedTerms={
  "Ponto de equilíbrio (break-even)":[["Ponto de equilíbrio","pt-BR"],["break-even","en-US"]],
  "SWOT / FOFA":[["SWOT","en-US"],["FOFA","pt-BR"]],
  "SOP / POP":[["SOP","en-US"],["POP","pt-BR"]],
  "Roadmap estratégico":[["Roadmap","en-US"],["estratégico","pt-BR"]],
  "B2B / B2C":[["B2B","en-US"],["B2C","en-US"]],
  "CPV / CSP":[["CPV","pt-BR"],["CSP","pt-BR"]]
};
const foreignWords=["product-market fit","venture capital","due diligence","smart money","brand equity","core business","lead time","burn rate","break-even","cross-sell","roadmap","markup","valuation","pipeline","stakeholder","payback","forecast","turnover","headcount","runway","equity","pitch","churn","upsell","compliance"];
const foreignMatcher=new RegExp("("+foreignWords.join("|").replaceAll("-","\\-")+")","gi");
function languageSegments(text,lang){
  const s=String(text||"").trim();
  if(!s)return [];
  if(mixedTerms[s])return mixedTerms[s];
  const result=[];let offset=0;
  foreignMatcher.lastIndex=0;
  for(const match of s.matchAll(foreignMatcher)){
    if(match.index>offset)result.push([s.slice(offset,match.index),lang||"pt-BR"]);
    result.push([match[0],"en-US"]);
    offset=match.index+match[0].length;
  }
  if(offset<s.length)result.push([s.slice(offset),lang||"pt-BR"]);
  return result.length?result:[[s,lang||"pt-BR"]];
}
function chunks(text){
 const words=String(text||"").trim().split(/\s+/).filter(Boolean),result=[];let piece="";
 words.forEach(word=>{if(piece&&piece.length+word.length+1>190){result.push(piece);piece="";}piece+=(piece?" ":"")+word;});
 if(piece)result.push(piece);
 return result;
}
function speak(text,language){
 if(!synth||typeof SpeechSynthesisUtterance==="undefined"){announce("A leitura por áudio não está disponível neste navegador.");return;}
 const items=languageSegments(text,language).flatMap(([piece,lang])=>chunks(piece).map(t=>[t,lang]));
 if(!items.length){announce("Não há texto para leitura.");return;}
 const id=++playbackId;synth.cancel();let i=0,alerted=false;
 function next(){
  if(id!==playbackId)return;
  if(i===items.length){announce("Leitura concluída.");return;}
  const [content,locale]=items[i++],utterance=new SpeechSynthesisUtterance(content);
  utterance.lang=locale;utterance.rate=Number($("#audio-rate")?.value||1);
  const voices=synth.getVoices().filter(v=>v.lang.toLowerCase().startsWith(locale.slice(0,2).toLowerCase()));
  utterance.voice=voices.find(v=>v.lang.toLowerCase()===locale.toLowerCase())||voices[0]||null;
  if(!voices.length&&locale.startsWith("en")&&!alerted){alerted=true;announce("Sem voz inglesa instalada: a pronúncia poderá variar.");}
  utterance.onend=next;
  utterance.onerror=()=>{if(id===playbackId)announce("Falha na leitura deste trecho.");};
  synth.speak(utterance);
 }
 announce("Leitura iniciada.");next();
}
function stopSpeech(){playbackId++;if(synth)synth.cancel();announce("Leitura interrompida.");}
document.querySelectorAll("[data-reader]").forEach(b=>b.addEventListener("click",()=>{
 const command=b.dataset.reader;
 if(command==="stop"){stopSpeech();return;}
 if(!synth){announce("O leitor não está disponível neste navegador.");return;}
 if(command==="pause"){
  if(synth.paused){synth.resume();announce("Leitura retomada.");}
  else if(synth.speaking){synth.pause();announce("Leitura pausada.");}
  else announce("Inicie a leitura antes de pausar.");
  return;
 }
 const main=$("[data-read-content]")||$("#conteudo");
 speak(main?.innerText||main?.textContent||"","pt-BR");
}));
document.querySelectorAll("[data-say]").forEach(b=>b.addEventListener("click",()=>speak(b.dataset.say,b.dataset.lang||"en-US")));
const quiz=$("#lesson-quiz");if(quiz)quiz.addEventListener("submit",e=>{e.preventDefault();const chosen=quiz.querySelector("input:checked"),feedback=$("#lesson-feedback");if(!chosen){feedback.textContent="Selecione uma alternativa.";return}feedback.textContent=chosen.value==="b"?"Correto. Markup calculado a partir do custo e margem sobre o preço possuem bases distintas.":"Revise: um acréscimo aplicado ao custo não equivale à mesma porcentagem sobre o preço de venda.";if(chosen.value==="b")try{localStorage.setItem("geb-cursos-aula-markup","estudada")}catch(e){}});
const form=$("#markup-form");if(form){const brl=n=>new Intl.NumberFormat("pt-BR",{style:"currency",currency:"BRL"}).format(n);function calculate(){const ids=["cost","variable","tax","profit"];const v=ids.map(id=>document.getElementById(id).value.trim()===""?NaN:Number(document.getElementById(id).value));const out=$("#markup-result"),sum=v[1]+v[2]+v[3];if(v.some(x=>!Number.isFinite(x)||x<0)||sum>=100){out.textContent="Revise os valores: devem ser não negativos e os percentuais devem somar menos de 100%.";return}const divisor=1-sum/100,price=v[0]/divisor;out.replaceChildren();const p=document.createElement("p");p.textContent="PREÇO ESTIMADO DE VENDA";const s=document.createElement("strong");s.textContent=brl(price);const dl=document.createElement("dl");[["Divisor",divisor.toFixed(4)],["Multiplicador",(1/divisor).toFixed(4)+"×"],["Lucro-alvo nominal",brl(price*v[3]/100)],["Lucro-alvo",v[3]+"% do preço"]].forEach(([k,val])=>{const div=document.createElement("div"),dt=document.createElement("dt"),dd=document.createElement("dd");dt.textContent=k;dd.textContent=val;div.append(dt,dd);dl.append(div)});out.append(p,s,dl)}form.querySelectorAll("input").forEach(i=>i.addEventListener("input",calculate));calculate()}
const results=$("#g-results");if(results){let rows=[],done=[];try{done=JSON.parse(localStorage.getItem("geb-cursos-terms")||"[]")}catch(e){}if(!Array.isArray(done))done=[];const en=new Set(["Markup","Stakeholder","Core business","SWOT / FOFA","OKR","KPI","EBITDA","Break-even","Runway","Forecast","Burn rate","Lead","Prospect","Pipeline","Churn","Upsell","Cross-sell","Turnover","Headcount","SLA","Lead time","OPEX","CAPEX","MVP","Product-market fit","Valuation","Equity","Payback","Pitch","Venture capital","Smart money","Due diligence","Compliance","Roadmap estratégico","ROI","LTV","CAC","ROAS","CTR","CPL","Brand equity"]);const mk=(tag,cl,t)=>{let x=document.createElement(tag);if(cl)x.className=cl;x.textContent=t;return x};const norm=x=>String(x).normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
function render(){const q=norm($("#g-search").value),a=$("#g-area").value,ph=$("#g-phase").value;const found=rows.filter(t=>(!q||norm(t.join(" ")).includes(q))&&(!a||t[0]===a)&&(!ph||t[3].split(",").includes(ph)));results.replaceChildren();$("#g-count").textContent=found.length+" de "+rows.length+" conceitos";found.forEach(t=>{const card=mk("article","term-card",""),meta=mk("span","term-area",t[0]),h=mk("h3","",t[1]),desc=mk("p","",t[2]),stages=mk("small","","Fases: "+t[3].replaceAll(",",", ")),question=mk("p","term-question","Pergunta executiva: "+t[4]),buttons=mk("div","term-buttons",""),voice=mk("button","",mixedTerms[t[1]]?"Ouvir português + inglês":"Ouvir termo"),studied=mk("button","",done.includes(t[1])?"Estudado":"Marcar estudado");voice.type="button";studied.type="button";voice.setAttribute("aria-label","Ouvir "+t[1]);studied.setAttribute("aria-pressed",done.includes(t[1])?"true":"false");voice.addEventListener("click",()=>speak(t[1],en.has(t[1])?"en-US":"pt-BR"));studied.addEventListener("click",()=>{done=done.includes(t[1])?done.filter(x=>x!==t[1]):[...done,t[1]];try{localStorage.setItem("geb-cursos-terms",JSON.stringify(done))}catch(e){}render();announce("Estudo atualizado.")});buttons.append(voice,studied);card.append(meta,h,desc,stages,question,buttons);results.append(card)})}
fetch("/assets/glossario.json").then(r=>{if(!r.ok)throw Error();return r.json()}).then(data=>{rows=data;[...new Set(rows.map(x=>x[0]))].forEach(a=>{const o=document.createElement("option");o.textContent=o.value=a;$("#g-area").append(o)});["Estruturação","Validação","Operação","Crescimento","Expansão","Reestruturação"].forEach(a=>{const o=document.createElement("option");o.textContent=o.value=a;$("#g-phase").append(o)});["g-search","g-area","g-phase"].forEach(id=>document.getElementById(id).addEventListener(id==="g-search"?"input":"change",render));render()}).catch(()=>{$("#g-error").textContent="Não foi possível carregar o glossário.";});}
})();

(function(){
 "use strict";
 const status=document.getElementById("curriculum-progress");
 const key="geb-academia-vocabulario-aulas";
 function completed(){try{const data=JSON.parse(localStorage.getItem(key)||"[]");return Array.isArray(data)?data:[]}catch(_){return []}}
 function updateStatus(){if(status){const count=completed().length;status.textContent=count+" de 11 aulas marcadas como estudadas neste navegador.";}}
 updateStatus();
 document.querySelectorAll(".chapter-quiz-form").forEach(form=>form.addEventListener("submit",event=>{
  event.preventDefault();
  const chosen=form.querySelector('input[type="radio"]:checked');
  const target=form.parentElement.querySelector(".chapter-feedback");
  if(!chosen){target.textContent="Selecione uma alternativa para conferir.";return;}
  const correct=Number(chosen.value)===Number(form.dataset.correct);
  target.textContent=(correct?"Resposta adequada. ":"Releia a situação. ")+form.dataset.feedback;
 }));
 document.querySelectorAll(".chapter-reflection").forEach(field=>{
  const key="geb-academia-reflexao-"+field.dataset.reflection;
  try{field.value=localStorage.getItem(key)||""}catch(_){}
  field.addEventListener("input",()=>{try{localStorage.setItem(key,field.value)}catch(_){}});
 });
 document.querySelectorAll(".chapter-finish").forEach(button=>button.addEventListener("click",()=>{
   const chapter=button.dataset.chapter,done=completed();
   if(!done.includes(chapter))done.push(chapter);
   try{localStorage.setItem(key,JSON.stringify(done))}catch(_){}
   button.parentElement.querySelector(".chapter-progress-status").textContent="Aula registrada como estudada neste navegador.";
 }));
})();

/* Acompanhamento da formação NR-1, sem envio de dados para servidor. */
(function(){
 "use strict";
 const key="geb-academia-nr1-aulas";
 function read(){try{let value=JSON.parse(localStorage.getItem(key)||"[]");return Array.isArray(value)?value:[]}catch(_){return []}}
 const total=document.getElementById("nr1-progress");
 if(total)total.textContent=read().length+" de 37 aulas marcadas como estudadas neste navegador.";
 document.querySelectorAll(".nr1-finish").forEach(button=>button.addEventListener("click",()=>{
  const item=button.dataset.nr1Lesson,done=read();if(!done.includes(item))done.push(item);
  try{localStorage.setItem(key,JSON.stringify(done))}catch(_){ }
  const feedback=button.parentElement.querySelector(".nr1-progress-status");
  if(feedback)feedback.textContent="Aula marcada como estudada neste navegador.";
 }));
})();

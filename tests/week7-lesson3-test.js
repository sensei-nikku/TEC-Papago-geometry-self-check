/* Week 7 Lesson 3 Learning Lab (slant height): straight answers complete every problem; a miss
   opens the plan ladder and walking it completes the step; named traps fire (h used as l, base left
   out or left in, s instead of s/2, the diameter as r, no 1/2); the Formula Box shows both rules.
   Run: node tests/week7-lesson3-test.js */
const fs=require('fs'),path=require('path');
const {JSDOM}=require(path.join(__dirname,'..','node_modules','jsdom'));
const root=path.join(__dirname,'..');
function A(c,m){if(!c){console.log('FAIL:',m);process.exit(1)}console.log('ok:',m);}
const FILE='week7-lesson3-slant-height.html';
function boot(){
  const dom=new JSDOM('<!DOCTYPE html><body><div id="hdrDots"></div><main id="main"></main></body>',{runScripts:'dangerously'});
  const w=dom.window; w.scrollTo=()=>{}; w.HTMLElement.prototype.scrollIntoView=function(){};
  w.eval(fs.readFileSync(path.join(root,'js/checker-kit.js'),'utf8'));
  const s=fs.readFileSync(path.join(root,'checkers',FILE),'utf8').split('<script>'); w.eval(s[s.length-1].split('</script>')[0]);
  return w;
}
function stepOf(w,pid,code){const S=w.K._S()[pid];return code>=1000?S.steps[Math.floor(code/1000)-1].subs[code%1000-1]:S.steps[code];}
function enter(w,pid,code,a){const st=stepOf(w,pid,code);
  if(a&&a.c!==undefined){const i=st.options.indexOf(a.c); if(i<0) throw new Error(pid+' no option '+a.c+' in '+st.options.join(' | ')); w.K.act(pid,code,'pick',i); w.K.act(pid,code,'check'); return;}
  w.K.input(pid,code,a); w.K.act(pid,code,'check');}
const ids=['t1','t2','t3','t4','a1','a2','a3','a4'];
const go=pid=>{const w=boot(); w.K.navTo(ids.indexOf(pid)); return w;};
let w=boot();
A(w.K.layout()==='split','split shell');
A(w.document.getElementById('hdrDots').textContent==='T-1T-2T-3T-4A-1A-2A-3A-4','8 problems');
const surf=w.document.getElementById('ckSurf').textContent;
A(surf.includes('S = πr² + πrℓ') && surf.includes('ℓ = √(h² + r²)'),'Formula Box: cone');
A(surf.includes('S = B + (1/2)Pℓ') && surf.includes('ℓ = √(h² + (s/2)²)') && surf.includes('P = 4s'),'Formula Box: square pyramid');
const STR={t1:['175.9'],t2:['160'],t3:['15','678.6'],t4:['10','384'],a1:['377'],a2:['25','896'],a3:['5','47.1'],a4:['5','60']};
ids.forEach(pid=>{const ww=go(pid); STR[pid].forEach((v,i)=>enter(ww,pid,i,v)); A(ww.K._S()[pid].done,pid+': straight answers -> Complete');});
// traps
const TRAP=[['t3',1,'593.8','You used h'],['t3',1,'424.1','only the side'],['t4',0,'14.4','half the side'],['t4',1,'336','You used h'],['t2',1-1,'256','1/2'],
  ['a1',0,'1017.9','diameter'],['a3',1,'75.4','no top'],['a4',1,'96','no floor'],['a2',1,'868','You used h'],['t1',0,'125.7','only the side']];
TRAP.forEach(([pid,si,v,msg])=>{const ww=go(pid); for(let i=0;i<si;i++) enter(ww,pid,i,STR[pid][i]); enter(ww,pid,si,v);
  const txt=ww.document.getElementById('main').textContent; A(!stepOf(ww,pid,si).done && txt.includes(msg),pid+': '+v+' -> "'+msg+'"');});
// ladders: walk every rung of every step after a miss
const LAD={
 t1:[[0,'1',[{c:'S = πr² + πrℓ'},{c:'S = π · 4² + π · 4 · 10'},'175.9']]],
 t2:[[0,'1',[{c:'S = B + (1/2)Pℓ'},'64','32','160']]],
 t3:[[0,'1',[{c:'ℓ = √(h² + r²)'},'225','15']],[1,'1',[{c:'S = πr² + πrℓ'},{c:'S = π · 9² + π · 9 · 15'},'678.6']]],
 t4:[[0,'1',[{c:'ℓ = √(h² + (s/2)²)'},'100','10']],[1,'1',[{c:'S = B + (1/2)Pℓ'},'144','48','384']]],
 a1:[[0,'1',[{c:'S = πr² + πrℓ'},'6',{c:'S = π · 6² + π · 6 · 14'},'377']]],
 a2:[[0,'1',[{c:'ℓ = √(h² + (s/2)²)'},'625','25']],[1,'1',[{c:'S = B + (1/2)Pℓ'},'196','56','896']]],
 a3:[[0,'1',[{c:'ℓ = √(h² + r²)'},'25','5']],[1,'1',[{c:'S = πrℓ'},{c:'S = π · 3 · 5'},'47.1']]],
 a4:[[0,'1',[{c:'ℓ = √(h² + (s/2)²)'},'25','5']],[1,'1',[{c:'S = (1/2)Pℓ'},'24','60']]]};
Object.keys(LAD).forEach(pid=>{const ww=go(pid);
  LAD[pid].forEach(([si,wrong,rungs])=>{
    enter(ww,pid,si,wrong); A(ww.K._S()[pid].steps[si].exp===true,pid+' step '+(si+1)+': miss opens the ladder');
    A(ww.K._S()[pid].steps[si].subs.length===rungs.length,pid+' step '+(si+1)+': '+rungs.length+' rungs');
    rungs.forEach((a,j)=>enter(ww,pid,(si+1)*1000+j+1,a));});
  A(ww.K._S()[pid].done,pid+': walking the plan completes the problem');});
const hub=fs.readFileSync(path.join(root,'terms/sy2627-term2.html'),'utf8');
A(hub.includes('week7-lesson3-slant-height.html'),'Term 2 page links this checker');
console.log('ALL PASS');

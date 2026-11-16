/* Week 7 Lesson 1 Learning Lab: straight answers (the solved formula, then the number) complete
   every problem; a miss on either step opens the Plan ladder and walking it completes the step;
   named traps fire (4·2 for 4², no × 3, × 1/3 again, r² for r, the width as r, liters); answers
   are to the nearest tenth with 0.1 of wiggle room; the Formula Box shows SG-1 to SG-3; the Term 2
   page links this checker.
   Run: node tests/week7-lesson1-test.js */
const fs=require('fs'),path=require('path');
const {JSDOM}=require(path.join(__dirname,'..','node_modules','jsdom'));
const root=path.join(__dirname,'..');
function A(c,m){if(!c){console.log('FAIL:',m);process.exit(1)}console.log('ok:',m);}
const FILE='week7-lesson1-volume.html';
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
A(surf.includes('SG-1') && surf.includes('V = πr²h') && surf.includes('SG-2') && surf.includes('V = (1/3)πr²h'),'Formula Box: SG-1, SG-2');
A(surf.includes('SG-3') && surf.includes('× 1/3: multiply by 3') && surf.includes('take the square root') && surf.includes('1 L = 1000 cm³'),'Formula Box: SG-3 undo moves, liters');
const SOLVED={t1:'h = V / (πr²)',t2:'h = V / B',t3:'h = 3V / (πr²)',t4:'r = √(V / (πh))',a1:'h = 3V / B',a2:'h = 3V / (πr²)',a3:'r = √(V / (πh))',a4:'r = √(3V / (πh))'};
const NUM={t1:'9.9',t2:'9',t3:'8.5',t4:'4.5',a1:'8',a2:'7.6',a3:'4.6',a4:'1.7'};
ids.forEach(pid=>{const ww=go(pid); enter(ww,pid,0,{c:SOLVED[pid]}); enter(ww,pid,1,NUM[pid]); A(ww.K._S()[pid].done,pid+': straight answers -> Complete');});
// nearest tenth, with wiggle room: the right tenth, one tenth off from rounding a middle step or 3.14, or any hundredth passes
const pass1=(pid,v,why)=>{const ww=go(pid); enter(ww,pid,0,{c:SOLVED[pid]}); enter(ww,pid,1,v); A(ww.K._S()[pid].done,pid+': '+v+' passes ('+why+')');};
pass1('t1','9.9','nearest tenth'); pass1('t1','10','3.14 or 16π as 50'); pass1('t1','9.95','a hundredth is fine'); pass1('t1','9.9472','unrounded');
pass1('t3','8.5','nearest tenth'); pass1('a4','1.7','nearest tenth'); pass1('a3','4.6','nearest tenth');
{const ww=go('t1'); enter(ww,'t1',0,{c:SOLVED.t1}); enter(ww,'t1',1,'9.8'); A(!stepOf(ww,'t1',1).done,'t1: 9.8 is outside the wiggle room');}
// middle steps: one decimal is enough, and the label says so
{const ww=go('t1'); enter(ww,'t1',0,{c:SOLVED.t1}); enter(ww,'t1',1,'5'); enter(ww,'t1',2001,{c:'h = 500 / (π · 4²)'}); enter(ww,'t1',2002,'50.3');
 A(ww.K._S()['t1'].steps[1].subIdx===2,'t1: 16π ≈ 50.3 passes (one decimal)');}
A(fs.readFileSync(path.join(root,'checkers',FILE),'utf8').includes('16π ≈ ? (one decimal is enough)'),'middle-step labels say one decimal is enough');
{const ww=go('t4'); enter(ww,'t4',0,{c:SOLVED.t4}); enter(ww,'t4',1,'1'); enter(ww,'t4',2001,{c:'r = √(750 / (π · 12))'}); enter(ww,'t4',2002,'19.9');
 A(ww.K._S()['t4'].steps[1].subIdx===2,'t4: the inside to one decimal (19.9) passes');}
// ladders: [step, wrong, rungs]
const LAD={
 t1:[[0,{c:'h = πr² / V'},[{c:'V = πr²h'},{c:'1/(πr²)'},{c:SOLVED.t1}]],[1,'5',[{c:'h = 500 / (π · 4²)'},'50.27','9.9']]],
 t2:[[0,{c:'h = V · B'},[{c:'V = Bh'},{c:'1/B'},{c:SOLVED.t2}]],[1,'1',[{c:'h = 360 / 40'},'40','9']]],
 t3:[[0,{c:'h = V / (3πr²)'},[{c:'V = (1/3)πr²h'},{c:'3'},{c:'1/(πr²)'},{c:SOLVED.t3}]],[1,'5',[{c:'h = 3 · 80 / (π · 3²)'},'240','28.27','8.5']]],
 t4:[[0,{c:'r = V / (πh)'},[{c:'V = πr²h'},{c:'1/(πh)'},{c:'take the square root'},{c:SOLVED.t4}]],[1,'1',[{c:'r = √(750 / (π · 12))'},'19.89','4.5']]],
 a1:[[0,{c:'h = V / B'},[{c:'V = (1/3)Bh'},{c:'3'},{c:'1/B'},{c:SOLVED.a1}]],[1,'1',[{c:'h = 3 · 96 / 36'},'36','288','8']]],
 a2:[[0,{c:'h = 3πr² / V'},[{c:'V = (1/3)πr²h'},{c:'3'},{c:'1/(πr²)'},{c:SOLVED.a2}]],[1,'1',[{c:'h = 3 · 200 / (π · 5²)'},'5','78.54','7.6']]],
 a3:[[0,{c:'r = √(V · πh)'},[{c:'V = πr²h'},{c:'1/(πh)'},{c:'take the square root'},{c:SOLVED.a3}]],[1,'1',[{c:'r = √(1000 / (π · 15))'},'1000','21.22','4.6']]],
 a4:[[0,{c:'r = 3V / (πh)'},[{c:'V = (1/3)πr²h'},{c:'3'},{c:'1/(πh)'},{c:'take the square root'},{c:SOLVED.a4}]],[1,'5',[{c:'r = √(3 · 6 / (π · 2))'},'2.86','1.7']]]};
Object.keys(LAD).forEach(pid=>{const ww=go(pid);
  LAD[pid].forEach(([si,wrong,rungs])=>{
    enter(ww,pid,si,wrong); A(ww.K._S()[pid].steps[si].exp===true,pid+' step '+(si+1)+': miss opens the ladder');
    A(ww.K._S()[pid].steps[si].subs.length===rungs.length,pid+' step '+(si+1)+': '+rungs.length+' rungs');
    rungs.forEach((a,j)=>enter(ww,pid,(si+1)*1000+j+1,a));});
  A(ww.K._S()[pid].done,pid+': walking the Plan completes the problem');});
// traps (step 2 after a correct step 1)
const trap=(pid,val,txt)=>{const ww=go(pid); enter(ww,pid,0,{c:SOLVED[pid]}); enter(ww,pid,1,val);
  const r=ww.document.getElementById('ckRail').textContent; A(!stepOf(ww,pid,1).done && r.includes(txt),pid+' '+val+' -> "'+txt+'"');};
trap('t1','19.89','not 4 · 2'); trap('t1','19.9','not 4 · 2');
trap('t2','27.69','not 8 + 5'); trap('t2','13.85','not the distance around');
trap('t3','2.83','skipped the × 3'); trap('t3','2.8','skipped the × 3'); trap('t3','0.94','not by 1/3');
trap('t4','19.89','That is r²'); trap('t4','9.95','not by halving');
trap('a1','2.67','skipped the × 3'); trap('a1','48','6 · 6, not 6');
trap('a2','1.9','whole width'); trap('a2','2.55','skipped the × 3');
trap('a3','21.22','That is r²'); trap('a3','0.15','1000 cm³');
trap('a4','0.98','skipped the × 3'); trap('a4','2.86','That is r²');
const html=fs.readFileSync(path.join(root,'checkers',FILE),'utf8');
A(!/\b(subtract|divide)\b/i.test(html),'no "subtract" or "divide" in student text');
const hub=new JSDOM(fs.readFileSync(path.join(root,'terms','sy2627-term2.html'),'utf8')).window.document;
const links=[...hub.querySelectorAll('a.hub-card')].map(a=>a.getAttribute('href'));
A(links.includes('../checkers/'+FILE),'Term 2 page links W7 L1');
console.log('WEEK 7 LESSON 1 TEST PASSED');

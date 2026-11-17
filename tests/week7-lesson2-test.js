/* Week 7 Lesson 2 Learning Lab, on the work shell (engine v1.5.0).
   - Shell: suggested work on the left, the question on the right, an f button that opens and
     closes the Formula Box (click, close button, Escape), aria-expanded kept in step.
   - Suggested work never runs ahead: a part shows only after its step (or ladder rung) is checked,
     and the finished problem shows every part plus the check line.
   - A finished problem stays on screen with a Next button (no jump to the next problem).
   - Straight answers complete every problem; every ladder walks to the end; named traps fire;
     tenths pass within 0.1 of the exact value; whole numbers are exact.
   - No "subtract" or "divide"; the Term 2 page links this checker.
   Run: node tests/week7-lesson2-test.js */
const fs=require('fs'),path=require('path');
const {JSDOM}=require(path.join(__dirname,'..','node_modules','jsdom'));
const root=path.join(__dirname,'..');
function A(c,m){if(!c){console.log('FAIL:',m);process.exit(1)}console.log('ok:',m);}
const FILE='week7-lesson2-surface-area.html';
const SRC=fs.readFileSync(path.join(root,'checkers',FILE),'utf8');
function boot(){
  const dom=new JSDOM('<!DOCTYPE html><body><div id="hdrDots"></div><main id="main"></main></body>',{runScripts:'dangerously'});
  const w=dom.window; w.scrollTo=()=>{}; w.HTMLElement.prototype.scrollIntoView=function(){};
  w.eval(fs.readFileSync(path.join(root,'js/checker-kit.js'),'utf8'));
  const s=SRC.split('<script>'); w.eval(s[s.length-1].split('</script>')[0]);
  return w;
}
function stepOf(w,pid,code){const S=w.K._S()[pid];return code>=1000?S.steps[Math.floor(code/1000)-1].subs[code%1000-1]:S.steps[code];}
function enter(w,pid,code,a){const st=stepOf(w,pid,code);
  if(a&&a.c!==undefined){const i=st.options.indexOf(a.c); if(i<0) throw new Error(pid+' no option '+a.c+' in '+st.options.join(' | ')); w.K.act(pid,code,'pick',i); w.K.act(pid,code,'check'); return;}
  w.K.input(pid,code,a); w.K.act(pid,code,'check');}
const ids=['t1','t2','t3','t4','a1','a2','a3','a4'];
const go=pid=>{const w=boot(); w.K.navTo(ids.indexOf(pid)); return w;};
const workText=w=>w.document.getElementById('ckWork').textContent;
const pending=w=>w.document.querySelectorAll('#ckWork .wk-block.pending').length;
const fb=w=>{const f=w.document.querySelectorAll('#ckQ .fb'); return f.length?f[f.length-1].textContent:'';};

const BOXS='h = (S − 2B) / P', CANS='h = (S − 2πr²) / (2πr)';
const SOLVED={t1:BOXS,t2:CANS,t3:BOXS,t4:CANS,a1:BOXS,a2:CANS,a3:BOXS,a4:CANS};
const BP={t1:[24,20],t3:[25,20],a1:[24,22],a3:[36,24]};
const NUM={t1:'9',t2:'7.7',t3:'6',t4:'10.3',a1:'8.3',a2:'6.1',a3:'11',a4:'2.7'};
function straight(w,pid){
  let k=0;
  if(BP[pid]){ enter(w,pid,0,String(BP[pid][0])); enter(w,pid,1,String(BP[pid][1])); k=2; }
  if(pid==='a2'){ enter(w,pid,0,'5'); k=1; }
  enter(w,pid,k,{c:SOLVED[pid]}); enter(w,pid,k+1,NUM[pid]);
}

/* ---- shell ---- */
let w=boot(); const d=w.document;
A(w.K.VERSION==='1.5.0','engine 1.5.0');
A(w.K.layout()==='work','work shell');
A(d.getElementById('hdrDots').textContent==='T-1T-2T-3T-4A-1A-2A-3A-4','8 problems');
const wk=d.querySelector('.wk'); A(wk && wk.children[0].id==='ckWork' && wk.children[1].querySelector('#ckQ'),'suggested work on the left, the question on the right');
A(d.getElementById('ckWork').getAttribute('aria-label')==='Suggested work' && d.getElementById('ckQ').getAttribute('aria-label')==='Question','panes are labelled');
A(d.getElementById('ckQ').textContent.includes('6 cm by 4 cm base'),'the question pane shows the prompt');
A(!d.querySelector('.btn-work'),'no Show Work button: the left pane is the work');

/* ---- f button ---- */
const btn=d.getElementById('ckRefBtn'), pop=d.getElementById('ckRef');
A(btn && btn.textContent==='f' && btn.getAttribute('aria-controls')==='ckRef','f button on the question pane');
A(pop.hidden && btn.getAttribute('aria-expanded')==='false','Formula Box starts closed');
btn.click();
A(!pop.hidden && btn.getAttribute('aria-expanded')==='true','f opens the Formula Box');
A(pop.textContent.includes('SG-4') && pop.textContent.includes('S = Ph + 2B') && pop.textContent.includes('S = 2πrh + 2πr²'),'Formula Box: SG-4 prism and cylinder');
A(pop.textContent.includes('change sides, change signs') && pop.textContent.includes('P = 2l + 2w') && pop.textContent.includes('across = 2r'),'Formula Box: undo moves, B and P, across');
A(d.activeElement===pop.querySelector('.ref-close'),'focus moves to the close button');
enter(w,'t1',0,'24');
A(!d.getElementById('ckRef').hidden,'the Formula Box stays open while the student works');
d.dispatchEvent(new w.KeyboardEvent('keydown',{key:'Escape'}));
A(d.getElementById('ckRef').hidden && d.getElementById('ckRefBtn').getAttribute('aria-expanded')==='false','Escape closes it');
A(d.activeElement===d.getElementById('ckRefBtn'),'focus returns to the f button');
d.getElementById('ckRefBtn').click(); d.querySelector('#ckRef .ref-close').click();
A(d.getElementById('ckRef').hidden,'the close button closes it');

/* ---- suggested work never runs ahead (box) ---- */
w=go('t1');
A(w.document.querySelector('#ckWork .wk-block svg.wk-sketch') && workText(w).includes('6 cm') && workText(w).includes('S = 228 cm²'),'t1: step 1 is a sketch with the givens, shown from the start');
A(!/Write the formula|Name the unknown|Find B|Facts as math|Read it/.test(workText(w)),'t1: no plan instructions on the paper side');
A(pending(w)===7 && !workText(w).includes('= 24') && !workText(w).includes('9 cm'),'t1: parts 2 to 6 are blank before any check');
A(w.document.querySelector('#ckWork .wk-block.next .wk-n').textContent==='2','t1: the next part to write is marked');
enter(w,'t1',0,'24');
A(workText(w).includes('B = lw = 6 · 4 = 24') && workText(w).includes('S = Ph + 2B') && workText(w).includes('S = 228'),'t1: after B: formula, unknown, facts and 5a show');
A(workText(w).includes('l = 6') && !workText(w).includes('= 20'),'t1: facts are quote -> math (l, w); P not yet');
enter(w,'t1',1,'20');
A(workText(w).includes('P = 2l + 2w = 2(6) + 2(4) = 20'),'t1: after P: 5b shows');
A(!workText(w).includes('S − 2B = Ph'),'t1: 5c still blank');
enter(w,'t1',2,{c:BOXS});
A(workText(w).includes('S − 2B = Ph') && workText(w).includes('= h'),'t1: after 5c: every letters line shows');
A(!workText(w).includes('228 − 2(24)'),'t1: the substitution waits for step 6');
enter(w,'t1',3,'9');
A(w.K._S().t1.done && workText(w).includes('228 − 2(24)') && workText(w).includes('h = 9 cm'),'t1: after the answer: substitute and answer show');
A(pending(w)===0 && workText(w).includes('Check: 20(9) + 2(24) = 228 ✓'),'t1: finished: every part and the check');
A(w.document.getElementById('ckQ').textContent.includes('Complete') && w.document.querySelector('#ckQ .wk-done .btn-go'),'t1: stays on screen with a Next button');
w.document.querySelector('#ckQ .wk-done .btn-go').click();
A(w.document.getElementById('ckQ').textContent.includes('400 cm²') && workText(w).includes('T-2'),'Next opens T-2');

/* ---- a ladder reveals its own lines, one rung at a time (can) ---- */
w=go('t2');
enter(w,'t2',0,{c:'h = (S + 2πr²) / (2πr)'});
A(w.K._S().t2.steps[0].exp===true && fb(w).includes('one move at a time') && !/Step 1a|steps 1a/.test(w.document.getElementById('ckQ').textContent),'t2: a miss opens the Plan, without Step 1a tags that clash with the paper numbers');
A(!workText(w).includes('S = 2πrh + 2πr²'),'t2: nothing shows for a miss');
enter(w,'t2',1001,{c:'S = 2πrh + 2πr²'});
A(workText(w).includes('S = 2πrh + 2πr²') && workText(w).includes('h := the height, in cm') && !workText(w).includes('S − 2πr² = 2πrh'),'t2: rung a shows the formula, unknown, facts');
enter(w,'t2',1002,{c:'S − 2πr² = 2πrh'});
A(workText(w).includes('S − 2πr² = 2πrh') && !workText(w).includes('· (S − 2πr²) = h'),'t2: rung b shows its line only');
enter(w,'t2',1003,{c:'1/(2πr)'}); enter(w,'t2',1004,{c:CANS});
A(w.K._S().t2.stepIdx===1,'t2: walking the ladder settles step 5');
enter(w,'t2',1,'3'); enter(w,'t2',2001,{c:'h = (400 − 2π(5²)) / (2π(5))'});
A(workText(w).includes('400 − 2π(5²)') && !workText(w).includes('7.7 cm'),'t2: substitute shows, the answer waits');
enter(w,'t2',2002,'7.7');
A(w.K._S().t2.done && workText(w).includes('h ≈ 7.7 cm') && workText(w).includes('about 400 ✓'),'t2: answer and check show');

/* ---- straight answers ---- */
ids.forEach(pid=>{const ww=go(pid); straight(ww,pid); A(ww.K._S()[pid].done,pid+': straight answers -> Complete'); A(ww.document.querySelectorAll('#ckWork .wk-block.pending,#ckWork .wk-block.part').length===0,pid+': every part of the work shows');});

/* ---- rounding ---- */
const tryAns=(pid,v)=>{const ww=go(pid); let k=0;
  if(BP[pid]){ enter(ww,pid,0,String(BP[pid][0])); enter(ww,pid,1,String(BP[pid][1])); k=2; }
  if(pid==='a2'){ enter(ww,pid,0,'5'); k=1; }
  enter(ww,pid,k,{c:SOLVED[pid]}); enter(ww,pid,k+1,v); return ww.K._S()[pid].done;};
A(tryAns('t2','7.7') && tryAns('t2','7.73') && tryAns('t2','7.8'),'t2: 7.7, 7.73 and 7.8 (3.14 or a rounded step) pass');
A(!tryAns('t2','7.6'),'t2: 7.6 is outside the wiggle room');
A(tryAns('a1','8.3') && tryAns('a1','8.27') && !tryAns('a1','8.1'),'a1: 8.3 and 8.27 pass, 8.1 does not');
A(tryAns('t1','9') && tryAns('t1','9.0') && !tryAns('t1','9.1'),'t1: whole answers are exact (9 or 9.0)');
A(tryAns('a4','2.7') && tryAns('a4','2.74'),'a4: 2.7 m');

/* ---- named traps ---- */
const trap=(pid,code,v,frag,setup)=>{const ww=go(pid); (setup||[]).forEach(([c,a])=>enter(ww,pid,c,a)); enter(ww,pid,code,v); A(fb(ww).includes(frag),pid+': '+v+' -> "'+frag+'"');};
const box=pid=>[[0,String(BP[pid][0])],[1,String(BP[pid][1])],[2,{c:BOXS}]];
trap('t1',0,'20','That is P'); trap('t1',0,'10','multiply, l · w');
trap('t1',1,'24','That is B',[[0,'24']]); trap('t1',1,'10','halfway around',[[0,'24']]);
trap('t1',3,'10.2','two bases',box('t1')); trap('t1',3,'10.4','l · w, not l + w',box('t1'));
trap('t1',3,'7.83','switched',box('t1')); trap('t1',3,'18','all the way around',box('t1'));
trap('t2',1,'12.73','never moved',[[0,{c:CANS}]]); trap('t4',1,'11.76','two ends',[[0,{c:CANS}]]);
trap('t4',1,'12.26','Power first',[[0,{c:CANS}]]);
trap('a2',0,'10','all the way across'); trap('a2',2,'-4.43','whole width',[[0,'5'],[1,{c:CANS}]]);
trap('a1',3,'9.36','two bases',box('a1'));

/* ---- every ladder walks to the end ---- */
const LAD={
 t1:[[2,{c:'h = (S − B) / P'},[{c:'S = Ph + 2B'},{c:'S − 2B = Ph'},{c:'1/P'},{c:BOXS}]],[3,'1',[{c:'h = (228 − 2(24)) / 20'},'9']]],
 t2:[[0,{c:'h = S / (2πr) − 2πr²'},[{c:'S = 2πrh + 2πr²'},{c:'S − 2πr² = 2πrh'},{c:'1/(2πr)'},{c:CANS}]],[1,'1',[{c:'h = (400 − 2π(5²)) / (2π(5))'},'7.7']]],
 t3:[[2,{c:'h = (S + 2B) / P'},[{c:'S = Ph + 2B'},{c:'S − 2B = Ph'},{c:'1/P'},{c:BOXS}]],[3,'1',[{c:'h = (170 − 2(25)) / 20'},'6']]],
 t4:[[0,{c:'h = (S − πr²) / (2πr)'},[{c:'S = 2πrh + 2πr²'},{c:'S − 2πr² = 2πrh'},{c:'1/(2πr)'},{c:CANS}]],[1,'1',[{c:'h = (250 − 2π(3²)) / (2π(3))'},'10.3']]],
 a1:[[2,{c:'h = S / P − 2B'},[{c:'S = Ph + 2B'},{c:'S − 2B = Ph'},{c:'1/P'},{c:BOXS}]],[3,'1',[{c:'h = (230 − 2(24)) / 22'},'8.3']]],
 a2:[[1,{c:'h = (S + 2πr²) / (2πr)'},[{c:'S = 2πrh + 2πr²'},{c:'S − 2πr² = 2πrh'},{c:'1/(2πr)'},{c:CANS}]],[2,'1',[{c:'h = (350 − 2π(5²)) / (2π(5))'},'6.1']]],
 a3:[[2,{c:'h = (S − B) / P'},[{c:'S = Ph + 2B'},{c:'S − 2B = Ph'},{c:'1/P'},{c:BOXS}]],[3,'1',[{c:'h = (336 − 2(36)) / 24'},'11']]],
 a4:[[0,{c:'h = (S + 2πr²) / (2πr)'},[{c:'S = 2πrh + 2πr²'},{c:'S − 2πr² = 2πrh'},{c:'1/(2πr)'},{c:CANS}]],[1,'1',[{c:'h = (40 − 2π(1.5²)) / (2π(1.5))'},'2.7']]]};
Object.keys(LAD).forEach(pid=>{const ww=go(pid);
  if(BP[pid]){ enter(ww,pid,0,String(BP[pid][0])); enter(ww,pid,1,String(BP[pid][1])); }
  if(pid==='a2') enter(ww,pid,0,'5');
  LAD[pid].forEach(([si,wrong,rungs])=>{
    enter(ww,pid,si,wrong); A(ww.K._S()[pid].steps[si].exp===true,pid+' step '+(si+1)+': a miss opens the ladder');
    A(ww.K._S()[pid].steps[si].subs.length===rungs.length,pid+' step '+(si+1)+': '+rungs.length+' rungs');
    rungs.forEach((a,j)=>enter(ww,pid,(si+1)*1000+j+1,a));});
  A(ww.K._S()[pid].done,pid+': walking the Plan completes the problem');
  A(ww.document.querySelectorAll('#ckWork .wk-block.pending,#ckWork .wk-block.part').length===0,pid+': the walked Plan fills every part of the work');});

/* ---- house language, hub ---- */
const text=SRC.replace(/<script src[^>]*><\/script>/g,'');
A(!/\bsubtract|\bdivide/i.test(text),'no "subtract" or "divide"');
A(!/\bThe top\b|\bThe bottom\b/.test(text),'no calculator pieces in step 6');
const term=fs.readFileSync(path.join(root,'terms','sy2627-term2.html'),'utf8');
A(term.includes('../checkers/'+FILE),'Term 2 page links this checker');
console.log('\nweek7-lesson2-test PASSED');

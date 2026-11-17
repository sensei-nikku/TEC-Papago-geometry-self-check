/* Week 7 Lesson 2 Learning Lab, on the work shell with drag-to-the-paper (engine v1.6.0).
   - Shell: suggested work (parchment) on the left, the question on the right, the f button.
   - Step 1, 3, 4: drag labels onto the sketch. Each right label stays on the sketch in its ink;
     a wrong spot, or a label that does not belong, says why. Tap a card, then tap the spot, too.
   - Step 2: drag the model that fits to step 2 of the paper; a wrong model says what it is.
   - Then B, P, the letters, the numbers. The work never runs ahead; every line is written once,
     hangs one = per line, and each letter and its values share one ink.
   - Straight answers complete every problem; every ladder walks to the end; named traps fire;
     tenths pass within 0.1; whole numbers are exact. No "subtract"/"divide"; the hub links it.
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
  w.eval(fs.readFileSync(path.join(root,'js/tool-drag.js'),'utf8'));
  const s=SRC.split('<script>'); w.eval(s[s.length-1].split('</script>')[0]);
  return w;
}
function stepOf(w,pid,code){const S=w.K._S()[pid];return code>=1000?S.steps[Math.floor(code/1000)-1].subs[code%1000-1]:S.steps[code];}
function enter(w,pid,code,a){const st=stepOf(w,pid,code);
  if(a&&a.c!==undefined){const i=st.options.indexOf(a.c); if(i<0) throw new Error(pid+' no option '+a.c+' in '+st.options.join(' | ')); w.K.act(pid,code,'pick',i); w.K.act(pid,code,'check'); return;}
  w.K.input(pid,code,a); w.K.act(pid,code,'check');}
const PROB={}; JSON.parse(SRC.match(/K\.run\((\[[\s\S]*?\]), \{ layout/)[1]).forEach(p=>PROB[p.id]=p);
const card=(pid,si,t)=>{const i=PROB[pid].pipeline[si].cards.findIndex(c=>c.t===t); if(i<0) throw new Error(pid+' no card '+t); return i;};
const drop=(w,pid,si,t,zone)=>w.K.act(pid,si,'drop',{card:card(pid,si,t),zone});
const ids=['t1','t2','t3','t4','a1','a2','a3','a4'];
const go=pid=>{const w=boot(); w.K.navTo(ids.indexOf(pid)); return w;};
const workText=w=>w.document.getElementById('ckWork').textContent;
const pending=w=>w.document.querySelectorAll('#ckWork .wk-ln.pending').length;
const flat=w=>workText(w).replace(/\s+/g,' ');
const hanging=w=>[...w.document.querySelectorAll('#ckWork .wk-ln.eq .wk-r')].every(e=>(e.textContent.match(/[=≈]/g)||[]).length===1);
const fb=w=>{const f=w.document.querySelectorAll('#ckQ .fb'); return f.length?f[f.length-1].textContent:'';};
const sketchLabels=w=>[...w.document.querySelectorAll('#ckWork .wk-fig .wk-lbl')].map(e=>e.textContent);

const BOXS='h = (S − 2B) / P', CANS='h = (S − 2πr²) / (2πr)', BOXM='S = Ph + 2B', CANM='S = 2πrh + 2πr²';
const LABELS={t1:{l:'l = 6 cm',w:'w = 4 cm',h:'h = ?',S:'S = 228 cm²'}, t2:{r:'r = 5 cm',h:'h = ?',S:'S = 400 cm²'},
  t3:{l:'l = 5 cm',w:'w = 5 cm',h:'h = ?',S:'S = 170 cm²'}, t4:{r:'r = 3 cm',h:'h = ?',S:'S = 250 cm²'},
  a1:{l:'l = 8 cm',w:'w = 3 cm',h:'h = ?',S:'S = 230 cm²'}, a2:{d:'d = 10 cm',h:'h = ?',S:'S = 350 cm²'},
  a3:{l:'l = 6 in',w:'w = 6 in',h:'h = ?',S:'S = 336 in²'}, a4:{r:'r = 1.5 m',h:'h = ?',S:'S = 40 m²'}};
const BOX={t1:1,t3:1,a1:1,a3:1};
const SOLVED={t1:BOXS,t2:CANS,t3:BOXS,t4:CANS,a1:BOXS,a2:CANS,a3:BOXS,a4:CANS};
const BP={t1:[24,20],t3:[25,20],a1:[24,22],a3:[36,24]};
const NUM={t1:'9',t2:'7.7',t3:'6',t4:'10.3',a1:'8.3',a2:'6.1',a3:'11',a4:'2.7'};
const labelAll=(w,pid)=>Object.entries(LABELS[pid]).forEach(([z,t])=>drop(w,pid,0,t,z));
const model=(w,pid)=>drop(w,pid,1,BOX[pid]?BOXM:CANM,'model');
/* after the two drags: box 2 B, 3 P, 4 letters, 5 numbers; can 2 letters, 3 numbers; a2 2 r, 3 letters, 4 numbers */
function rest(w,pid,ans){
  let k=2;
  if(BP[pid]){ enter(w,pid,2,String(BP[pid][0])); enter(w,pid,3,String(BP[pid][1])); k=4; }
  if(pid==='a2'){ enter(w,pid,2,'5'); k=3; }
  enter(w,pid,k,{c:SOLVED[pid]}); enter(w,pid,k+1,ans||NUM[pid]);
}
const straight=(w,pid,ans)=>{labelAll(w,pid); model(w,pid); rest(w,pid,ans);};

/* ---- shell ---- */
let w=boot(); const d=w.document;
A(w.K.VERSION==='1.6.0','engine 1.6.0');
A(w.K.layout()==='work','work shell');
A(d.getElementById('hdrDots').textContent==='T-1T-2T-3T-4A-1A-2A-3A-4','8 problems');
const wk=d.querySelector('.wk'); A(wk && wk.children[0].id==='ckWork' && wk.children[1].querySelector('#ckQ'),'suggested work on the left, the question on the right');
A(!d.querySelector('.btn-work'),'no Show Work button: the left pane is the work');

/* ---- f button ---- */
const btn=d.getElementById('ckRefBtn'), pop=d.getElementById('ckRef');
A(btn && btn.textContent==='f' && pop.hidden,'f button, Formula Box starts closed');
btn.click();
A(!pop.hidden && pop.textContent.includes('S = Ph + 2B') && pop.textContent.includes('S = 2πrh + 2πr²') && pop.textContent.includes('d = 2r'),'f opens the Formula Box (SG-4, undo moves, d = 2r)');
d.dispatchEvent(new w.KeyboardEvent('keydown',{key:'Escape'}));
A(d.getElementById('ckRef').hidden && d.activeElement===d.getElementById('ckRefBtn'),'Escape closes it, focus back on f');

/* ---- step 1, 3, 4: label the sketch ---- */
w=go('t1');
A(w.document.querySelector('#ckWork svg.wk-sketch') && sketchLabels(w).length===0,'t1: the sketch starts with no labels');
A(w.document.querySelectorAll('#ckWork .wk-zone[data-drop]').length===4,'t1: four drop spots on the sketch');
A(w.document.querySelectorAll('#ckQ .dd-card').length===6 && w.document.getElementById('ckQ').textContent.includes('Not every label belongs'),'t1: six label cards on the right, two do not belong');
A(w.document.querySelector('#ckQ .dd-card.ink-card.ink-2') && w.document.querySelector('#ckQ .dd-card.ink-card.ink-1'),'t1: label cards wear their letter\'s ink');
drop(w,'t1',0,'l = 6 cm','h');
A(fb(w).includes('l is the length') && sketchLabels(w).length===0,'t1: l on the height edge: says why (l runs along the front) and does not stick');
drop(w,'t1',0,'V = 228 cm³','S');
A(fb(w).includes('V is what a box holds'),'t1: V does not belong: says what V is');
drop(w,'t1',0,'h = 6 cm','h');
A(fb(w).includes('runs along the base'),'t1: h = 6 cm: says 6 cm is l, h is the unknown');
drop(w,'t1',0,'l = 6 cm','l');
A(sketchLabels(w).includes('l = 6 cm') && fb(w).includes('l is the length') && w.K._S().t1.steps[0].misses===0,'t1: l on the front edge sticks, says why, and clears the misses');
A(w.document.querySelector('#ckWork .wk-fig .wk-lbl.ink-2').textContent==='l = 6 cm','t1: a placed label is in its ink');
A(![...w.document.querySelectorAll('#ckQ .dd-card')].some(e=>e.textContent==='l = 6 cm') && w.document.getElementById('ckQ').textContent.includes('1 of 4 labels'),'t1: a placed card leaves the tray; 1 of 4');
/* tap a card, then tap the spot */
[...w.document.querySelectorAll('#ckQ .dd-card')].find(e=>e.textContent==='w = 4 cm').click();
A(w.document.querySelector('#ckQ .dd-card.sel') && w.document.querySelector('#ckWork .wk-zone.armed'),'t1: tapping a card picks it and arms the spots');
w.document.querySelector('#ckWork .wk-zone[data-drop="w"]').click();
A(sketchLabels(w).includes('w = 4 cm'),'t1: tapping the spot places the picked card');
w.document.querySelector('#ckWork .wk-zone[data-drop="h"]').click();
A(fb(w).includes('Pick a card on the right first'),'t1: tapping a spot with no card picked says what to do');
drop(w,'t1',0,'h = ?','h'); drop(w,'t1',0,'S = 228 cm²','S');
A(w.K._S().t1.stepIdx===1 && ['l = 6 cm','w = 4 cm','h = ?','S = 228 cm²'].every(x=>sketchLabels(w).includes(x)),'t1: four labels placed: the step is done and the sketch keeps them');
A(w.document.querySelectorAll('#ckWork .wk-zone').length===0,'t1: no drop spots once the sketch is labelled');

/* ---- step 2: drag the model ---- */
A(w.document.querySelector('#ckWork .wk-drop[data-drop="model"]') && w.document.querySelector('#ckWork .wk-ln.drop .wk-tag').textContent==='2','t1: step 2 on the paper is a drop box');
A(w.document.querySelectorAll('#ckQ .dd-card').length===4 && w.document.getElementById('ckQ').textContent.includes('Which model covers this solid?'),'t1: four models on the right');
drop(w,'t1',1,'V = Bh','model');
A(fb(w).includes('V fills the box') && !workText(w).includes('S = Ph + 2B'),'t1: V = Bh: says V fills, not covers; nothing written');
drop(w,'t1',1,'S = Ph + B','model');
A(fb(w).includes('box with no lid'),'t1: S = Ph + B: one base, a box with no lid');
drop(w,'t1',1,'S = Ph + 2B','model');
A(w.K._S().t1.stepIdx===2 && workText(w).includes('S = Ph + 2B') && !w.document.querySelector('#ckWork .wk-drop'),'t1: the right model is written in step 2');
A(w.document.getElementById('ckQ').textContent.includes('the top and the bottom (2B)'),'t1: the locked-in model says why it fits');

/* ---- the work never runs ahead; written once; hanging; inks ---- */
A(pending(w)===10 && !workText(w).includes('= 24'),'t1: after the model: the 10 written lines are blank');
A(w.document.querySelector('#ckWork .wk-ln.next .wk-tag').textContent==='5a','t1: the next line to write (5a) is marked');
enter(w,'t1',2,'24');
A(flat(w).includes('B = lw = 6 · 4 = 24') && hanging(w) && !workText(w).includes('= 20'),'t1: after B: 5a hangs, P not yet');
enter(w,'t1',3,'20');
A(flat(w).includes('P = 2l + 2w = 2(6) + 2(4) = 20') && !workText(w).includes('S − 2B = Ph'),'t1: after P: 5b; 5c still blank');
enter(w,'t1',4,{c:BOXS});
A(workText(w).includes('S − 2B = Ph') && workText(w).includes('change sides, change signs') && workText(w).includes('× 1/P') && !workText(w).includes('228 − 2(24)'),'t1: after 5c: the letters, each move beside its line; the numbers wait');
enter(w,'t1',5,'9');
A(w.K._S().t1.done && w.document.querySelector('#ckWork .wk-box').textContent==='9 cm' && pending(w)===0,'t1: done: the boxed answer, every line shown');
{const t=[...w.document.querySelectorAll('#ckWork .wk-group')].map(e=>e.textContent).join(' '); A(t.split('Ph + 2B').length===2 && t.split('228 − 2(24)').length===2,'t1: each line written once');}
{const rows=[...w.document.querySelectorAll('#ckWork .wk-group .wk-ln.eq')].map(e=>[e.querySelector('.wk-l').textContent.trim(),e.querySelector('.wk-r').textContent.trim()]);
 A(rows.some(([l,r])=>l==='S − 2BP' && r==='= h') && rows.some(([l,r])=>l==='h' && r==='= 228 − 2(24)20'),'t1: (S − 2B)/P = h, then h = (228 − 2(24))/20');}
A(flat(w).includes('Check S = Ph + 2B = 20(9) + 2(24) = 228 ✓') && hanging(w),'t1: the check restates the formula and hangs');
{const allowed={1:['S','228','S = 228 cm²'],2:['l','6','l = 6 cm'],3:['w','4','w = 4 cm'],4:['B','24'],5:['P','20'],6:['h','9','9 cm','h = ?']};
 const bad=[]; Object.keys(allowed).forEach(k=>w.document.querySelectorAll('#ckWork .ink-'+k).forEach(e=>{if(!allowed[k].includes(e.textContent.trim())) bad.push(k+':'+e.textContent);}));
 A(!bad.length,'t1: colour code holds, sketch labels included '+bad.join(' '));}
A(w.document.querySelector('#ckQ .wk-done .btn-go'),'t1: stays on screen with a Next button');

/* ---- cans: r or d on the sketch, the can's model, the ladder reveals one line per rung ---- */
w=go('t2'); labelAll(w,'t2');
A(['r = 5 cm','h = ?','S = 400 cm²'].every(x=>sketchLabels(w).includes(x)) && w.K._S().t2.stepIdx===1,'t2: three labels: r, h, S');
drop(w,'t2',1,'S = 2πrh + πr²','model'); A(fb(w).includes('covers a cup'),'t2: one end: that covers a cup');
drop(w,'t2',1,'V = (1/3)πr²h','model'); A(fb(w).includes('fills a cone'),'t2: the cone: fills a cone');
model(w,'t2');
enter(w,'t2',2,{c:'h = (S + 2πr²) / (2πr)'});
A(w.K._S().t2.steps[2].exp===true && fb(w).includes('one move at a time') && !workText(w).includes('S − 2πr² = 2πrh'),'t2: a miss opens the Plan; nothing new on the paper');
enter(w,'t2',3001,{c:'S − 2πr² = 2πrh'});
A(workText(w).includes('S − 2πr² = 2πrh'),'t2: the change-sides rung writes its line');
enter(w,'t2',3002,{c:'1/(2πr)'}); enter(w,'t2',3003,{c:CANS});
enter(w,'t2',3,'3'); enter(w,'t2',4001,{c:'h = (400 − 2π(5²)) / (2π(5))'});
A(workText(w).includes('400 − 2π(5²)') && !w.document.querySelector('#ckWork .wk-box'),'t2: substitute shows, the answer waits');
enter(w,'t2',4002,'7.7');
A(w.K._S().t2.done && w.document.querySelector('#ckWork .wk-box').textContent==='7.7 cm' && flat(w).includes('≈ 399.0, about 400 ✓'),'t2: answer and check');
w=go('t4'); drop(w,'t4',0,'d = 3 cm','r'); A(fb(w).includes('is the radius, center to edge'),'t4: d = 3 cm on the radius: 3 cm is r, d goes across');
w=go('a2'); drop(w,'a2',0,'r = 10 cm','d'); A(fb(w).includes('that is d. r is half'),'a2: r = 10 cm: 10 cm across is d');
labelAll(w,'a2'); model(w,'a2'); enter(w,'a2',2,'5');
{const rows=[...w.document.querySelectorAll('#ckWork .wk-group .wk-ln.eq')].map(e=>[e.querySelector('.wk-l').textContent.trim(),e.querySelector('.wk-r').textContent.trim()]);
 A(sketchLabels(w).includes('d = 10 cm') && rows.some(x=>x[0]==='d'&&x[1]==='= 2r') && rows.some(x=>x[0]==='d2'&&x[1]==='= r') && rows.some(x=>x[0]==='r'&&x[1]==='= 102'),'a2: d = 10 cm on the sketch; d = 2r, d/2 = r, r = 10/2');}

/* ---- a teacher-helped skip still labels the sketch (found by hash) ---- */
w=go('t3'); for(let i=0;i<4;i++) drop(w,'t3',0,'V = 170 cm³','S');
A(w.K._S().t3.steps[0].redirect===true && w.document.getElementById('ckQ').textContent.includes('Bring your work to your teacher'),'t3: four misses: bring it to the teacher');
w.K.act('t3',0,'skip');
A(['l = 5 cm','w = 5 cm','h = ?','S = 170 cm²'].every(x=>sketchLabels(w).includes(x)),'t3: after the teacher helps, the sketch shows the right labels');

/* ---- straight answers, every problem ---- */
ids.forEach(pid=>{const ww=go(pid); straight(ww,pid); A(ww.K._S()[pid].done && pending(ww)===0 && hanging(ww),pid+': labels, model, then straight answers -> Complete, every line shown');});

/* ---- rounding ---- */
const tryAns=(pid,v)=>{const ww=go(pid); straight(ww,pid,v); return ww.K._S()[pid].done;};
A(tryAns('t2','7.7') && tryAns('t2','7.73') && tryAns('t2','7.8') && !tryAns('t2','7.6'),'t2: 7.7, 7.73, 7.8 pass; 7.6 does not');
A(tryAns('a1','8.3') && tryAns('a1','8.27') && !tryAns('a1','8.1'),'a1: 8.3 and 8.27 pass, 8.1 does not');
A(tryAns('t1','9') && tryAns('t1','9.0') && !tryAns('t1','9.1'),'t1: whole answers are exact');

/* ---- named numeric traps ---- */
const at=(pid,steps)=>{const ww=go(pid); labelAll(ww,pid); model(ww,pid); steps.forEach(([c,a])=>enter(ww,pid,c,a)); return ww;};
const trap=(pid,pre,code,v,frag)=>{const ww=at(pid,pre); enter(ww,pid,code,v); A(fb(ww).includes(frag),pid+': '+v+' -> "'+frag+'"');};
const boxPre=pid=>[[2,String(BP[pid][0])],[3,String(BP[pid][1])],[4,{c:BOXS}]];
trap('t1',[],2,'20','That is P'); trap('t1',[[2,'24']],3,'10','halfway around');
trap('t1',boxPre('t1'),5,'10.2','two bases'); trap('t1',boxPre('t1'),5,'7.83','switched');
trap('t2',[[2,{c:CANS}]],3,'12.73','never moved'); trap('t4',[[2,{c:CANS}]],3,'11.76','two ends');
trap('a2',[],2,'10','all the way across'); trap('a2',[[2,'5'],[3,{c:CANS}]],4,'-4.43','is d, all the way across');

/* ---- every ladder walks to the end ---- */
const LAD={
 t1:[[4,{c:'h = (S − B) / P'},[{c:'S − 2B = Ph'},{c:'1/P'},{c:BOXS}]],[5,'1',[{c:'h = (228 − 2(24)) / 20'},'9']]],
 t2:[[2,{c:'h = S / (2πr) − 2πr²'},[{c:'S − 2πr² = 2πrh'},{c:'1/(2πr)'},{c:CANS}]],[3,'1',[{c:'h = (400 − 2π(5²)) / (2π(5))'},'7.7']]],
 a2:[[3,{c:'h = (S + 2πr²) / (2πr)'},[{c:'S − 2πr² = 2πrh'},{c:'1/(2πr)'},{c:CANS}]],[4,'1',[{c:'h = (350 − 2π(5²)) / (2π(5))'},'6.1']]],
 a4:[[2,{c:'h = (S + 2πr²) / (2πr)'},[{c:'S − 2πr² = 2πrh'},{c:'1/(2πr)'},{c:CANS}]],[3,'1',[{c:'h = (40 − 2π(1.5²)) / (2π(1.5))'},'2.7']]]};
Object.keys(LAD).forEach(pid=>{const ww=at(pid, BP[pid]?[[2,String(BP[pid][0])],[3,String(BP[pid][1])]]:(pid==='a2'?[[2,'5']]:[]));
  LAD[pid].forEach(([si,wrong,rungs])=>{
    enter(ww,pid,si,wrong); A(ww.K._S()[pid].steps[si].exp===true && ww.K._S()[pid].steps[si].subs.length===rungs.length,pid+' step '+(si+1)+': a miss opens '+rungs.length+' rungs');
    rungs.forEach((a,j)=>enter(ww,pid,(si+1)*1000+j+1,a));});
  A(ww.K._S()[pid].done && pending(ww)===0,pid+': walking the Plan completes the problem and fills the work');});

/* ---- house language, hub ---- */
const text=SRC.replace(/<script src[^>]*><\/script>/g,'');
A(!/\bsubtract|\bdivide/i.test(text),'no "subtract" or "divide"');
A(SRC.includes('<script src="../js/tool-drag.js"></script>'),'the page loads the drag tools');
const term=fs.readFileSync(path.join(root,'terms','sy2627-term2.html'),'utf8');
A(term.includes('../checkers/'+FILE),'Term 2 page links this checker');
console.log('\nweek7-lesson2-test PASSED');

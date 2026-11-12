/* Week 6 Lesson 3 Learning Lab: straight answers complete every problem; a miss opens the Plan
   ladder and walking it completes the step; the equation and the simplified radius are taps whose
   wrong options are named slips; named traps fire (sign of the center, r² for r, half for the
   square root, r not squared, adding Δx + Δy, minus a negative, going up r² or down r); the
   Formula Box shows SG-6, the signs rule, r² = Δx² + Δy² and the inside/on/outside compare;
   the Term 2 page links this checker.
   Run: node tests/week6-lesson3-test.js */
const fs=require('fs'),path=require('path');
const {JSDOM}=require(path.join(__dirname,'..','node_modules','jsdom'));
const root=path.join(__dirname,'..');
function A(c,m){if(!c){console.log('FAIL:',m);process.exit(1)}console.log('ok:',m);}
const FILE='week6-lesson3-circle.html';
function boot(){
  const dom=new JSDOM('<!DOCTYPE html><body><div id="hdrDots"></div><main id="main"></main></body>',{runScripts:'dangerously'});
  const w=dom.window; w.scrollTo=()=>{}; w.HTMLElement.prototype.scrollIntoView=function(){};
  w.eval(fs.readFileSync(path.join(root,'js/checker-kit.js'),'utf8'));
  w.eval(fs.readFileSync(path.join(root,'js/tool-fraction.js'),'utf8'));
  const s=fs.readFileSync(path.join(root,'checkers',FILE),'utf8').split('<script>'); w.eval(s[s.length-1].split('</script>')[0]);
  return w;
}
function stepOf(w,pid,code){const S=w.K._S()[pid];return code>=1000?S.steps[Math.floor(code/1000)-1].subs[code%1000-1]:S.steps[code];}
function enter(w,pid,code,a){const st=stepOf(w,pid,code);
  if(a&&a.c!==undefined){const i=st.options.indexOf(a.c); if(i<0) throw new Error(pid+' no option '+a.c+' in '+st.options.join(' | ')); w.K.act(pid,code,'pick',i); w.K.act(pid,code,'check'); return;}
  w.K.input(pid,code,a); w.K.act(pid,code,'check');}
const ids=['t1','t2','t3','t4','a1','a2','a3','a4'];
const go=pid=>{const w=boot(); w.K.navTo(ids.indexOf(pid)); return w;};
const M='−';
let w=boot();
A(w.K.layout()==='split','split shell');
A(w.document.getElementById('hdrDots').textContent==='T-1T-2T-3T-4A-1A-2A-3A-4','8 problems');
const surf=w.document.getElementById('ckSurf').textContent;
A(surf.includes('SG-6') && surf.includes('(x − h)² + (y − k)² = r²'),'Formula Box: SG-6');
A(surf.includes('(x + 7) is (x − (−7)): h = −7') && surf.includes('r² = Δx² + Δy²') && surf.includes('Inside, on, or outside?'),'Formula Box: signs, r² = Δx² + Δy², inside/on/outside');
const E3='(x + 3)² + (y − 5)² = 16', E4='(x + 1)² + (y − 4)² = 29', EA2='(x + 4)² + (y + 2)² = 45';
const STRAIGHT={t1:['6','-3','8'],t2:['-7','2','2'],t3:[{c:E3}],t4:['29',{c:E4}],a1:['0','-4',{c:'3√2'}],a2:['45',{c:EA2}],a3:[{c:'outside'}],a4:['1','-3']};
Object.keys(STRAIGHT).forEach(pid=>{const ww=go(pid); STRAIGHT[pid].forEach((a,i)=>enter(ww,pid,i,a)); A(ww.K._S()[pid].done,pid+': straight answers -> Complete');});
// ladders: [step index, wrong value, rungs]
const LAD={
 t1:[[0,'-6',[{c:'x − 6'},'6']],[1,'3',[{c:'y − (−3)'},'-3']],[2,'64',['64','8']]],
 t2:[[0,'7',[{c:'x − (−7)'},'-7']],[1,'-2',[{c:'y − 2'},'2']],[2,'4',['4','2']]],
 t3:[[0,{c:'(x − 3)² + (y + 5)² = 16'},[{c:'(x + 3)'},{c:'(y − 5)'},'16',{c:E3}]]],
 t4:[[0,'7',['2','5','29']],[1,{c:E4}]],
 a1:[[0,'1',[{c:'x − 0'},'0']],[1,'4',[{c:'y − (−4)'},'-4']],[2,{c:'9√2'},['18',{c:'3√2'}]]],
 a2:[[0,'9',['6','-3','45']],[1,{c:EA2}]],
 a3:[[0,{c:'inside'},['36','5','4','41',{c:'outside'}]]],
 a4:[[0,'-1',['1','1']],[1,'3',['-6','3','-3']]]};
Object.keys(LAD).forEach(pid=>{const ww=go(pid);
  LAD[pid].forEach(([si,wrong,rungs])=>{
    if(rungs===undefined){enter(ww,pid,si,wrong); return;}          // a step with no ladder: just answer it
    enter(ww,pid,si,wrong); A(ww.K._S()[pid].steps[si].exp===true,pid+' step '+(si+1)+': miss opens the ladder');
    A(ww.K._S()[pid].steps[si].subs.length===rungs.length,pid+' step '+(si+1)+': '+rungs.length+' rungs');
    rungs.forEach((a,j)=>enter(ww,pid,(si+1)*1000+j+1,a));});
  A(ww.K._S()[pid].done,pid+': walking the Plan completes the problem');});
// traps
const rail=(pid,code,val,pre)=>{const ww=go(pid); (pre||[]).forEach(([c,v])=>enter(ww,pid,c,v)); enter(ww,pid,code,val);
  return {txt:ww.document.getElementById('ckRail').textContent,done:stepOf(ww,pid,code).done};};
const trap=(pid,code,val,txt,pre)=>{const r=rail(pid,code,val,pre); A(!r.done && r.txt.includes(txt),pid+' '+(val.c||val)+' -> "'+txt+'"');};
trap('t2',0,'7','a plus in the equation means a negative'); trap('t1',1,'3','a plus in the equation',[[0,'6']]);
trap('t1',2,'64','That is r²',[[0,'6'],[1,'-3']]); trap('t1',2,'32','Square root, not half',[[0,'6'],[1,'-3']]);
trap('t3',1003,'8','not times 2',[[0,{c:'(x − 3)² + (y + 5)² = 16'}],[1001,{c:'(x + 3)'}],[1002,{c:'(y − 5)'}]]);
trap('t3',1003,'4','Square the radius',[[0,{c:'(x − 3)² + (y + 5)² = 16'}],[1001,{c:'(x + 3)'}],[1002,{c:'(y − 5)'}]]);
trap('t4',0,'7','Square each one before you add'); trap('t4',1001,'0','Minus a negative is plus',[[0,'999']]);
trap('a2',0,'27','A negative squared is positive'); trap('a2',1002,'-7','Minus a negative is plus',[[0,'999'],[1001,'6']]);
trap('a3',1002,'1','Minus a negative is plus',[[0,{c:'inside'}],[1001,'36']]);
trap('a4',1,'3','Go up r, not r²',[[0,'1']]); trap('a4',1,'-9','straight below',[[0,'1']]); trap('a4',0,'-1','a plus in the equation');
{const ww=go('a1'); enter(ww,'a1',0,'0'); enter(ww,'a1',1,'-4'); enter(ww,'a1',2,{c:'2√3'});
 A(!stepOf(ww,'a1',2).done && ww.K._S()['a1'].steps[2].exp===true,'a1: a wrong root opens the radius ladder');}
const html=fs.readFileSync(path.join(root,'checkers',FILE),'utf8');
A(!/\b(subtract|divide)\b/i.test(html),'no "subtract" or "divide" in student text');
const hub=new JSDOM(fs.readFileSync(path.join(root,'terms','sy2627-term2.html'),'utf8')).window.document;
const links=[...hub.querySelectorAll('a.hub-card')].map(a=>a.getAttribute('href'));
A(links.includes('../checkers/'+FILE),'Term 2 page links W6 L3');
console.log('WEEK 6 LESSON 3 TEST PASSED');

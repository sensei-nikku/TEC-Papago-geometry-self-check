/* Week 6 Lesson 2 Learning Lab: straight answers complete every problem; unrounded calculator
   values pass and a wrong hundredth does not; a miss opens the Plan ladder and walking it completes
   the step; the simplify tap follows the decimal; named traps fire (walking the grid, no square root,
   a negative's sign in Δx or Δy, a negative squared, k = a/b or measured from the wrong end, forgot
   the start, half the change for a midpoint, no ½ in the area, the scale); the Formula Box shows
   SG-4, SG-5, the midpoint and ½bh with Δx and Δy; the Term 2 page links this checker.
   Run: node tests/week6-lesson2-test.js */
const fs=require('fs'),path=require('path');
const {JSDOM}=require(path.join(__dirname,'..','node_modules','jsdom'));
const root=path.join(__dirname,'..');
function A(c,m){if(!c){console.log('FAIL:',m);process.exit(1)}console.log('ok:',m);}
const FILE='week6-lesson2-distance-partition.html';
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
let w=boot();
A(w.K.layout()==='split','split shell');
A(w.document.getElementById('hdrDots').textContent==='T-1T-2T-3T-4A-1A-2A-3A-4','8 problems');
const surf=w.document.getElementById('ckSurf').textContent;
A(surf.includes('SG-4') && surf.includes('d = √((x2 − x1)² + (y2 − y1)²)') && surf.includes('Δx := x2 − x1, Δy := y2 − y1'),'Formula Box: SG-4 distance with Δx and Δy');
A(surf.includes('SG-5') && surf.includes('k = a / (a + b)') && surf.includes('x of P = x1 + k(x2 − x1)'),'Formula Box: SG-5 partition');
A(surf.includes('M = ((x1 + x2) / 2, (y1 + y2) / 2)') && surf.includes('A = (1/2)bh'),'Formula Box: midpoint and triangle area');
// straight answers: [step 0, step 1?]
const STRAIGHT={t1:['10'],t2:['4.47',{c:'2√5'}],t3:['1','5'],t4:['1','3'],a1:['1','-1'],a2:['9','14.61'],a3:['50'],a4:['8.94',{c:'4√5'}]};
Object.keys(STRAIGHT).forEach(pid=>{const ww=go(pid); STRAIGHT[pid].forEach((a,i)=>enter(ww,pid,i,a)); A(ww.K._S()[pid].done,pid+': straight answers -> Complete');});
// unrounded calculator values pass; a wrong hundredth does not
[['t2','4.4721'],['a4','8.94427'],['a2','14.6056',1]].forEach(([pid,v,i])=>{const ww=go(pid); if(i) enter(ww,pid,0,'9'); enter(ww,pid,i||0,v); A(stepOf(ww,pid,i||0).done!==false && ww.K._S()[pid].stepIdx===(i||0)+1,pid+': unrounded '+v+' accepted');});
[['t2','4.48'],['a4','8.95'],['a4','8.93']].forEach(([pid,v])=>{const ww=go(pid); enter(ww,pid,0,v); A(ww.K._S()[pid].stepIdx===0,pid+': wrong hundredth '+v+' not accepted');});
// ladders
const LAD={
 t1:[[ '6','8','100','10']],
 t2:[[ '4','2','20','4.47'],[{c:'2√5'}]],
 t3:[[ '2','1'],['10','5']],
 t4:[[ '1/4','12','3','1'],['8','2','3']],
 a1:[[ '3/5','-10','-6','1'],['-10','-6','-1']],
 a2:[[ '6','3','9'],['13','25','5','14.61']],
 a3:[[ '8','6','100','10','50']],
 a4:[[ '8','-4','80','8.94'],[{c:'4√5'}]]};
const WRONG={t1:'999',t2:'999',t3:'999',t4:'999',a1:'999',a2:'999',a3:'999',a4:'999'};
Object.keys(LAD).forEach(pid=>{const ww=go(pid);
  LAD[pid].forEach((rungs,si)=>{
    if(rungs.length===1&&rungs[0].c){enter(ww,pid,si,rungs[0]); return;}          // the simplify tap has no ladder
    enter(ww,pid,si,WRONG[pid]); A(ww.K._S()[pid].steps[si].exp===true,pid+' step '+(si+1)+': miss opens the ladder');
    A(ww.K._S()[pid].steps[si].subs.length===rungs.length,pid+' step '+(si+1)+': '+rungs.length+' rungs');
    rungs.forEach((a,j)=>enter(ww,pid,(si+1)*1000+j+1,a));});
  A(ww.K._S()[pid].done,pid+': walking the Plan completes the problem');});
// simplify tap: wrong form is not accepted
{const ww=go('a4'); enter(ww,'a4',0,'8.94'); enter(ww,'a4',1,{c:'2√20'});
 A(!stepOf(ww,'a4',1).done && ww.document.getElementById('ckRail').textContent.includes('biggest perfect square'),'a4: 2√20 is not simplified -> perfect-square nudge');}
// traps
const rail=(pid,code,val,pre)=>{const ww=go(pid); (pre||[]).forEach(([c,v])=>enter(ww,pid,c,v)); enter(ww,pid,code,val);
  return {txt:ww.document.getElementById('ckRail').textContent,done:stepOf(ww,pid,code).done};};
const trap=(pid,code,val,txt,pre)=>{const r=rail(pid,code,val,pre); A(!r.done && r.txt.includes(txt),pid+' '+val+' -> "'+txt+'"');};
trap('t1',0,'14','walking along the grid'); trap('t1',0,'100','Take the square root'); trap('t1',0,'8.25','Check Δx');
trap('t2',0,'2.83','Check Δx'); trap('t2',0,'4.5','two digits after the point'); trap('a4',0,'8.9','two digits after the point'); trap('a4',0,'6.93','negative squared'); trap('a4',0,'11.31','Check Δy');
trap('a4',1002,'-8','Minus a negative is plus',[[0,'999'],[1001,'8']]);
trap('a4',1003,'48','negative squared is positive',[[0,'999'],[1001,'8'],[1002,'-4']]);
trap('t4',0,'2','first piece with the whole'); trap('t4',0,'7','wrong end'); trap('t4',0,'3','how far to move');
trap('t4',1001,'1/3','4 pieces in all',[[0,'999']]);
trap('a1',0,'13','Check the sign of the change'); trap('a1',1,'11','y2 − y1',[[0,'1']]); trap('a1',1,'-6','add y1',[[0,'1']]);
trap('t3',0,'4','half the change'); trap('t3',1,'10','multiply by 1/2',[[0,'1']]);
trap('a2',0,'18','A = (1/2)bh'); trap('a2',1,'24','square root of 13',[[0,'9']]); trap('a2',1,'14','height is not a side',[[0,'9']]);
trap('a2',1,'14.6','round to the nearest hundredth',[[0,'9']]);
trap('a3',0,'10','grid units'); trap('a3',0,'70','walking along the grid'); trap('a3',0,'500','square root before you scale');
const html=fs.readFileSync(path.join(root,'checkers',FILE),'utf8');
A(!/\b(subtract|divide)\b/i.test(html),'no "subtract" or "divide" in student text');
const hub=new JSDOM(fs.readFileSync(path.join(root,'terms','sy2627-term2.html'),'utf8')).window.document;
const links=[...hub.querySelectorAll('a.hub-card')].map(a=>a.getAttribute('href'));
A(links.includes('../checkers/'+FILE),'Term 2 page links W6 L2');
console.log('WEEK 6 LESSON 2 TEST PASSED');

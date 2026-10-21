/* Week 3 Lesson 1 Learning Lab: straight answers complete every problem; a miss opens the
   Problem-Solving Plan ladder and walking it settles the step; named traps fire.
   Run: node tests/week3-lesson1-test.js */
const fs=require('fs'),path=require('path');
const {JSDOM}=require(path.join(__dirname,'..','node_modules','jsdom'));
const root=path.join(__dirname,'..');
function A(c,m){if(!c){console.log('FAIL:',m);process.exit(1)}console.log('ok:',m);}
const FILE='week3-lesson1-dilations.html';
function boot(){
  const dom=new JSDOM('<!DOCTYPE html><body><div id="hdrDots"></div><main id="main"></main></body>',{runScripts:'dangerously'});
  const w=dom.window; w.scrollTo=()=>{}; w.HTMLElement.prototype.scrollIntoView=function(){};
  ['js/checker-kit.js','js/tool-point.js','js/tool-fraction.js'].forEach(f=>w.eval(fs.readFileSync(path.join(root,f),'utf8')));
  const s=fs.readFileSync(path.join(root,'checkers',FILE),'utf8').split('<script>'); w.eval(s[s.length-1].split('</script>')[0]);
  return w;
}
function stepOf(w,pid,code){const S=w.K._S()[pid];return code>=1000?S.steps[Math.floor(code/1000)-1].subs[code%1000-1]:S.steps[code];}
function enter(w,pid,code,a){const st=stepOf(w,pid,code);
  if(a&&a.c!==undefined){const i=st.options.indexOf(a.c); if(i<0) throw new Error(pid+' no option '+a.c); w.K.act(pid,code,'pick',i); w.K.act(pid,code,'check'); return;}
  w.K.input(pid,code,a); w.K.act(pid,code,'check');}
const M='\u2212',PR='\u2032',DOT='\u00B7';
const GOAL=['the target point','the scale factor k'];
const SUB='x '+DOT+' k = x'+PR+' and y '+DOT+' k = y'+PR;
const SUBK='start '+DOT+' k = target with the first coordinates, then confirm with the second';
const STRAIGHT={t1:['(6, -10)'],t2:['(-2, 4)','(3, 1)'],t3:['4',{c:'it grew'}],a1:['(-15, 3)'],a2:['(6, -9)'],a3:['2/5',{c:'it shrank'}],a4:['(5, 0)','(0, 10)','(5, 10)']};
const LADDER={t1:[{c:GOAL[0]},'2',{c:SUB},'6','-10'],t2:[{c:GOAL[0]},'1/2',{c:SUB},'-2','4'],t3:[{c:GOAL[1]},{c:'(3, '+M+'6)'},{c:SUBK},'4','4'],
  a1:[{c:GOAL[0]},'3',{c:SUB},'-15','3'],a2:[{c:GOAL[0]},'3/4',{c:SUB},'6','-9'],a3:[{c:GOAL[1]},{c:'(10, 5)'},{c:SUBK},'2/5','2/5'],a4:[{c:GOAL[0]},'5/2',{c:SUB},'5','0']};
let w=boot(); const ids=Object.keys(STRAIGHT);
A(w.K.layout()==='split','split shell');
A(w.document.getElementById('hdrDots').textContent==='T-1T-2T-3A-1A-2A-3A-4','7 problems');
A(w.document.getElementById('ckSurf').textContent.includes('target / start'),'Formula Box card shows k = target / start');
ids.forEach((pid,k)=>{w.K.navTo(k); STRAIGHT[pid].forEach((a,j)=>enter(w,pid,j,a)); A(w.K._S()[pid].done,pid+': straight answers -> Complete');});
w=boot();
Object.keys(LADDER).forEach(pid=>{w=boot(); w.K.navTo(ids.indexOf(pid)); const first=(pid==='t3'||pid==='a3')?'99':'(99, 99)'; enter(w,pid,0,first);
  A(w.K._S()[pid].steps[0].exp===true,pid+': miss opens the ladder');
  LADDER[pid].forEach((a,j)=>enter(w,pid,1000+j+1,a));
  A(w.K._S()[pid].stepIdx>=1||w.K._S()[pid].done,pid+': walking the Plan settles step 1');});
const trap=(pid,a,txt)=>{const ww=boot(); ww.K.navTo(ids.indexOf(pid)); enter(ww,pid,0,a); A(ww.document.getElementById('ckRail').textContent.includes(txt),pid+' '+a+' -> "'+txt+'"');};
trap('t1','(5, -3)','You added k'); trap('a1','(15, 3)','negative times a positive'); trap('t3','1/4','start over target'); trap('a3','5/2','start over target');
trap('t3','9','You subtracted'); trap('t2','(-8, 16)','multiplied by 2'); trap('a4','(4, 0)','k is 5/2');
const hub=new JSDOM(fs.readFileSync(path.join(root,'terms','sy2627-term2.html'),'utf8')).window.document;
A([...hub.querySelectorAll('.hub-card:not(.hub-soon)')].map(a=>a.getAttribute('href')).includes('../checkers/'+FILE),'Hub: W3 L1 live + linked');
A(![...hub.querySelectorAll('.hub-soon')].some(a=>a.textContent.includes('W3 \u00b7 L1')),'Hub: W3 L1 "soon" card removed');
console.log('WEEK 3 LESSON 1 TEST PASSED');

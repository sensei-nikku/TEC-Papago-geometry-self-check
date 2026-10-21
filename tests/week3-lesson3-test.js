/* Week 3 Lesson 3 Learning Lab: straight answers complete every problem (exact and
   the 1.41/1.73 estimates both accepted); a miss opens the Plan ladder and walking
   it settles the step; named traps fire; the Term 2 page links the checker.
   Run: node tests/week3-lesson3-test.js */
const fs=require('fs'),path=require('path');
const {JSDOM}=require(path.join(__dirname,'..','node_modules','jsdom'));
const root=path.join(__dirname,'..');
function A(c,m){if(!c){console.log('FAIL:',m);process.exit(1)}console.log('ok:',m);}
const FILE='week3-lesson3-special-right.html';
function boot(){
  const dom=new JSDOM('<!DOCTYPE html><body><div id="hdrDots"></div><main id="main"></main></body>',{runScripts:'dangerously'});
  const w=dom.window; w.scrollTo=()=>{}; w.HTMLElement.prototype.scrollIntoView=function(){};
  w.eval(fs.readFileSync(path.join(root,'js/checker-kit.js'),'utf8'));
  const s=fs.readFileSync(path.join(root,'checkers',FILE),'utf8').split('<script>'); w.eval(s[s.length-1].split('</script>')[0]);
  return w;
}
function stepOf(w,pid,code){const S=w.K._S()[pid];return code>=1000?S.steps[Math.floor(code/1000)-1].subs[code%1000-1]:S.steps[code];}
function enter(w,pid,code,a){const st=stepOf(w,pid,code);
  if(a&&a.c!==undefined){const i=st.options.indexOf(a.c); if(i<0) throw new Error(pid+' no option '+a.c); w.K.act(pid,code,'pick',i); w.K.act(pid,code,'check'); return;}
  w.K.input(pid,code,a); w.K.act(pid,code,'check');}
const R2='\u221A2',R3='\u221A3',DEG='\u00B0';
const STRAIGHT={t1:['6','8.5'],t2:['12','6','10.4'],t3:['4','5.7'],a1:['14','7','12.1'],a2:['4','2','3.5'],a3:['10','14.1'],a4:[{c:'the long leg'},{c:'the hypotenuse'}]};
const ESTIMATE={t1:['6','8.46'],t3:['4','5.64'],a2:['4','2','3.46']};
const LADDER={t1:[{c:'the hypotenuse'},{c:'45-45-90'},'6',{c:'h = a'+R2},'6'],
 t2:[{c:'the hypotenuse'},{c:'30-60-90'},{c:'30'+DEG},'6',{c:'h = 2a, then w = a'+R3},'12'],
 t3:[{c:'45-45-90'},'4',{c:'h = a'+R2},'4'], a1:[{c:'30-60-90'},'7',{c:'hyp = 2a, then long leg = a'+R3},'14'],
 a2:[{c:'30-60-90'},{c:'30'+DEG},'2',{c:'h = 2a, then r = a'+R3},'4'], a3:[{c:'45-45-90'},'10',{c:'d = a'+R2},'10']};
let w=boot(); const ids=Object.keys(STRAIGHT);
A(w.K.layout()==='split','split shell');
A(w.document.getElementById('hdrDots').textContent==='T-1T-2T-3A-1A-2A-3A-4','7 problems');
A(w.document.getElementById('ckSurf').textContent.includes('hypotenuse 2a'),'Formula Box card shows the 30-60-90 rule');
ids.forEach((pid,k)=>{w.K.navTo(k); STRAIGHT[pid].forEach((a,j)=>enter(w,pid,j,a)); A(w.K._S()[pid].done,pid+': straight answers -> Complete');});
Object.keys(ESTIMATE).forEach(pid=>{w=boot(); w.K.navTo(ids.indexOf(pid)); ESTIMATE[pid].forEach((a,j)=>enter(w,pid,j,a)); A(w.K._S()[pid].done,pid+': the 1.41/1.73 estimate is accepted');});
Object.keys(LADDER).forEach(pid=>{w=boot(); w.K.navTo(ids.indexOf(pid)); enter(w,pid,0,'99');
  A(w.K._S()[pid].steps[0].exp===true,pid+': miss opens the ladder');
  LADDER[pid].forEach((a,j)=>enter(w,pid,1000+j+1,a));
  A(w.K._S()[pid].stepIdx>=1,pid+': walking the Plan settles step 1');});
const trap=(pid,steps,txt)=>{const ww=boot(); ww.K.navTo(ids.indexOf(pid)); steps.forEach((a,j)=>enter(ww,pid,j,a)); A(ww.document.getElementById('ckRail').textContent.includes(txt),pid+' '+steps.join(' / ')+' -> "'+txt+'"');};
trap('t2',['10.4'],'goes on the long leg'); trap('t2',['6'],'That is a'); trap('a1',['12.1'],'goes on the long leg');
trap('t1',['6','12'],'30-60-90 rule'); trap('a2',['4','4'],'4 is h');
const hub=new JSDOM(fs.readFileSync(path.join(root,'terms','sy2627-term2.html'),'utf8')).window.document;
A([...hub.querySelectorAll('a.hub-card')].map(a=>a.getAttribute('href')).includes('../checkers/'+FILE),'Term 2 page links W3 L3');
console.log('WEEK 3 LESSON 3 TEST PASSED');

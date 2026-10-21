/* Week 3 Lesson 2 Learning Lab: straight answers complete every problem; a miss opens the
   Problem-Solving Plan ladder and walking it settles the step; named traps fire.
   Run: node tests/week3-lesson2-test.js */
const fs=require('fs'),path=require('path');
const {JSDOM}=require(path.join(__dirname,'..','node_modules','jsdom'));
const root=path.join(__dirname,'..');
function A(c,m){if(!c){console.log('FAIL:',m);process.exit(1)}console.log('ok:',m);}
const FILE='week3-lesson2-similar-figures.html';
function boot(){
  const dom=new JSDOM('<!DOCTYPE html><body><div id="hdrDots"></div><main id="main"></main></body>',{runScripts:'dangerously'});
  const w=dom.window; w.scrollTo=()=>{}; w.HTMLElement.prototype.scrollIntoView=function(){};
  ['js/checker-kit.js','js/tool-fraction.js'].forEach(f=>w.eval(fs.readFileSync(path.join(root,f),'utf8')));
  const s=fs.readFileSync(path.join(root,'checkers',FILE),'utf8').split('<script>'); w.eval(s[s.length-1].split('</script>')[0]);
  return w;
}
function stepOf(w,pid,code){const S=w.K._S()[pid];return code>=1000?S.steps[Math.floor(code/1000)-1].subs[code%1000-1]:S.steps[code];}
function enter(w,pid,code,a){const st=stepOf(w,pid,code);
  if(a&&a.c!==undefined){const i=st.options.indexOf(a.c); if(i<0) throw new Error(pid+' no option '+a.c); w.K.act(pid,code,'pick',i); w.K.act(pid,code,'check'); return;}
  w.K.input(pid,code,a); w.K.act(pid,code,'check');}
const G='a missing side', SUB='5a find k from the matched pair, then 5b multiply the matching starting side by k';
const STRAIGHT={t1:['15'],t2:['15'],t3:['6'],a1:['20'],a2:[{c:'YZ'},{c:'XZ'}],a3:['9'],a4:['3','15',{c:'not similar'}]};
const LADDER={t1:[{c:G},{c:'EF'},{c:SUB},'5','15'],t2:[{c:G},{c:'the original photo'},{c:SUB},'3/2','15'],t3:[{c:G},{c:'NP'},{c:SUB},'2/3','6'],
  a1:[{c:G},{c:'DF'},{c:SUB},'5/2','20'],a3:[{c:G},{c:'the original poster'},{c:SUB},'3/4','9']};
let w=boot(); const ids=Object.keys(STRAIGHT);
A(w.K.layout()==='split','split shell');
A(w.document.getElementById('hdrDots').textContent==='T-1T-2T-3A-1A-2A-3A-4','7 problems');
A(w.document.getElementById('ckSurf').textContent.includes('target / start'),'Formula Box card shows k = target / start');
A(!/ ft|feet|in = /.test(fs.readFileSync(path.join(root,'checkers',FILE),'utf8').replace(/in wide|in tall|in\)/g,'')),'no mixed-unit plan scales');
ids.forEach((pid,k)=>{w.K.navTo(k); STRAIGHT[pid].forEach((a,j)=>enter(w,pid,j,a)); A(w.K._S()[pid].done,pid+': straight answers -> Complete');});
Object.keys(LADDER).forEach(pid=>{w=boot(); w.K.navTo(ids.indexOf(pid)); enter(w,pid,0,'99');
  A(w.K._S()[pid].steps[0].exp===true,pid+': miss opens the ladder');
  LADDER[pid].forEach((a,j)=>enter(w,pid,1000+j+1,a));
  A(w.K._S()[pid].stepIdx>=1||w.K._S()[pid].done,pid+': walking the Plan settles it');});
const trap=(pid,a,txt)=>{const ww=boot(); ww.K.navTo(ids.indexOf(pid)); enter(ww,pid,0,a); A(ww.document.getElementById('ckRail').textContent.includes(txt),pid+' '+a+' -> "'+txt+'"');};
trap('t1','11','You added'); trap('t2','13','You added'); trap('t3','13.5','less than 1'); trap('a1','14','You added'); trap('a3','10','took away'); trap('a3','16','start over target');
const hub=new JSDOM(fs.readFileSync(path.join(root,'terms','sy2627-term2.html'),'utf8')).window.document;
A([...hub.querySelectorAll('.hub-card:not(.hub-soon)')].map(a=>a.getAttribute('href')).includes('../checkers/'+FILE),'Hub: W3 L2 live + linked');
A(![...hub.querySelectorAll('.hub-soon')].some(a=>a.textContent.includes('W3 \u00b7 L2')),'Hub: W3 L2 "soon" card removed');
console.log('WEEK 3 LESSON 2 TEST PASSED');

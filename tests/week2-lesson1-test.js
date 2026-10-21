/* Week 2 Lesson 1 Learning Lab: straight answers complete every problem; a miss opens the
   Transformation Plan ladder and walking it settles the step; named traps fire; plot hashes.
   Run: node tests/week2-lesson1-test.js */
const fs=require('fs'),path=require('path');
const {JSDOM}=require(path.join(__dirname,'..','node_modules','jsdom'));
const root=path.join(__dirname,'..');
function A(c,m){if(!c){console.log('FAIL:',m);process.exit(1)}console.log('ok:',m);}
const FILE='week2-lesson1-translate-reflect.html';
function boot(){
  const dom=new JSDOM('<!DOCTYPE html><body><div id="hdrDots"></div><main id="main"></main></body>',{runScripts:'dangerously'});
  const w=dom.window; w.scrollTo=()=>{}; w.HTMLElement.prototype.scrollIntoView=function(){};
  ['js/checker-kit.js','js/tool-point.js','js/tool-plot.js'].forEach(f=>w.eval(fs.readFileSync(path.join(root,f),'utf8')));
  const s=fs.readFileSync(path.join(root,'checkers',FILE),'utf8').split('<script>'); w.eval(s[s.length-1].split('</script>')[0]);
  return w;
}
function stepOf(w,pid,code){const S=w.K._S()[pid];return code>=1000?S.steps[Math.floor(code/1000)-1].subs[code%1000-1]:S.steps[code];}
function enter(w,pid,code,a){const st=stepOf(w,pid,code);
  if(a&&a.c!==undefined){const i=st.options.indexOf(a.c); if(i<0) throw new Error(pid+' no option '+a.c); w.K.act(pid,code,'pick',i); w.K.act(pid,code,'check'); return;}
  if(a&&a.plot){a.plot.forEach(p=>{st.prov={gx:p[0],gy:p[1]}; w.K.act(pid,code,'check');}); return;}
  w.K.input(pid,code,a); w.K.act(pid,code,'check');}
const M='\u2212',L='\u27E8',R='\u27E9',MT='\u21A6';
const G=['translation (a slide)','reflection (a flip)'];
const F=['T'+L+'a, b'+R+': translation by a vector','r x-axis: reflection over the x-axis','r y-axis: reflection over the y-axis','r y = x: reflection over the line y = x'];
const MP=['(x, y) '+MT+' (x + a, y + b)','(x, y) '+MT+' (x, '+M+'y)','(x, y) '+MT+' ('+M+'x, y)','(x, y) '+MT+' (y, x)'];
const STRAIGHT={t1:['(5, 1)'],t2:['(4, 2)'],t3:['(-1, 5)'],a1:['(-6, 2)'],a2:['(-3, 6)'],a3:['(3, -9)'],a4:[{c:MP[1]},{plot:[[-4,-1],[-1,-1],[-1,-4]]}]};
const LADDER={t1:[{c:G[0]},{c:F[0]},'3, 4',{c:MP[0]},'5','1'],t2:[{c:G[1]},{c:F[2]},{c:MP[2]},'(4, 2)'],t3:[{c:G[1]},{c:F[3]},{c:MP[3]},'(-1, 5)'],
  a1:[{c:G[0]},{c:F[0]},'-4, 7',{c:MP[0]},'-6','2'],a2:[{c:G[1]},{c:F[1]},{c:MP[1]},'(-3, 6)'],a3:[{c:G[0]},'-2, 5',{c:MP[0]},'3','-9']};
let w=boot(); const ids=Object.keys(STRAIGHT);
A(w.K.layout()==='split','split shell');
A(w.document.getElementById('hdrDots').textContent==='T-1T-2T-3A-1A-2A-3A-4','7 problems');
A(w.document.getElementById('ckSurf').textContent.includes('\u21A6'),'Formula Box card uses maps-to');
ids.forEach((pid,k)=>{w.K.navTo(k); STRAIGHT[pid].forEach((a,j)=>enter(w,pid,j,a)); A(w.K._S()[pid].done,pid+': straight answers -> Complete');});
w=boot();
Object.keys(LADDER).forEach(pid=>{w.K.navTo(ids.indexOf(pid)); enter(w,pid,0,'(9, 9)');
  A(w.K._S()[pid].steps[0].exp===true,pid+': miss opens the ladder');
  LADDER[pid].forEach((a,j)=>enter(w,pid,1000+j+1,a));
  A(w.K._S()[pid].steps[0].ok===true||w.K._S()[pid].done,pid+': walking the Plan settles it');});
const trap=(pid,a,txt)=>{const ww=boot(); ww.K.navTo(ids.indexOf(pid)); enter(ww,pid,0,a); A(ww.document.getElementById('ckRail').textContent.includes(txt),pid+' '+a+' -> "'+txt+'"');};
trap('t2','(-4, -2)','x-axis rule'); trap('a1','(2, 2)','Left is negative'); trap('a3','(-1, 1)','forward'); trap('t1','(1, 5)','wrong order'); trap('t1','(5, 7)','first coordinate is right');
const hub=new JSDOM(fs.readFileSync(path.join(root,'terms','sy2627-term2.html'),'utf8')).window.document;
A([...hub.querySelectorAll('.hub-card:not(.hub-soon)')].map(a=>a.getAttribute('href')).includes('../checkers/'+FILE),'Hub: W2 L1 live + linked');
console.log('WEEK 2 LESSON 1 TEST PASSED');

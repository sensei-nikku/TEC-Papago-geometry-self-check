/* Week 1 Lesson 3 Learning Lab (split layout, coarse first).
   Straight answers complete every problem; a miss opens the ladder and walking
   it settles the step; named traps fire.   Run: node tests/week1-lesson3-test.js */
const fs=require('fs'),path=require('path');
const {JSDOM}=require(path.join(__dirname,'..','node_modules','jsdom'));
const root=path.join(__dirname,'..');
function A(c,m){if(!c){console.log('FAIL:',m);process.exit(1)}console.log('ok:',m);}
function boot(){
  const dom=new JSDOM('<!DOCTYPE html><body><div id="hdrDots"></div><main id="main"></main></body>',{runScripts:'dangerously'});
  const w=dom.window; w.scrollTo=()=>{}; w.HTMLElement.prototype.scrollIntoView=function(){};
  w.eval(fs.readFileSync(path.join(root,'js/checker-kit.js'),'utf8'));
  w.eval(fs.readFileSync(path.join(root,'js/tool-fraction.js'),'utf8'));
  const html=fs.readFileSync(path.join(root,'checkers/week1-lesson3-rules.html'),'utf8');
  w.eval(html.split('tool-fraction.js"></script>')[1].split('<script>')[1].split('</script>')[0]);
  return w;
}
const IND='Independent: knowing one does not change the other', NOT='Not independent: knowing one changes the other';
const PROD='\u2119(A \u2229 B) = \u2119(A)\u00B7\u2119(B | A)  (product rule)', ADDR='\u2119(A \u222A B) = \u2119(A) + \u2119(B) \u2212 \u2119(A \u2229 B)  (addition rule)';
// straight answers per coarse step: string for text entry, {c:..} for choice
const STRAIGHT={t1:['3/10'],t2:['11/20'],t3:['1/4','1/4',{c:IND}],a1:['1/10'],a2:['49/60'],a3:['3/20','1/4',{c:NOT},'20'],a4:['1/5','2/3',{c:NOT}]};
// ladder answers for the FIRST coarse step of each problem
const LADDER={t1:[{c:PROD},'2/5','3/4','3/10'],t2:[{c:ADDR},'13/20','11/20'],t3:['10','40','1/4'],a1:[{c:PROD},'2/3','3/20','1/10'],
  a2:[{c:ADDR},'2/3','1/4','1/10','49/60'],a3:['12','80','3/20'],a4:[{c:ADDR},'4/5','1/5']};
function enter(w,pid,code,a){ const S=w.K._S()[pid]; const st= code>=1000 ? S.steps[Math.floor(code/1000)-1].subs[code%1000-1] : S.steps[code];
  if(typeof a==='object'){ const i=st.options.indexOf(a.c); if(i<0) throw new Error(pid+' no option '+a.c); w.K.act(pid,code,'pick',i); }
  else w.K.input(pid,code,a);
  w.K.act(pid,code,'check'); }
let w=boot(); const ids=Object.keys(STRAIGHT);
A(w.K.layout()==='split','split shell');
A(w.document.getElementById('hdrDots').textContent==='T-1T-2T-3A-1A-2A-3A-4','7 problems, T-1..T-3, A-1..A-4');
w.K.navTo(2); A(w.document.querySelector('#ckSurf table.pt') && w.document.getElementById('ckSurf').textContent.includes('120 apartment residents'),'T-3 table on the surface');
w.K.navTo(3); A(w.document.getElementById('ckSurf').textContent.includes('Vaccinated'),'A-1 flu table on the surface');
ids.forEach((pid,k)=>{ w.K.navTo(k); STRAIGHT[pid].forEach((a,j)=>enter(w,pid,j,a)); A(w.K._S()[pid].done,pid+': straight answers -> Complete'); });
w=boot();
ids.forEach((pid,k)=>{ w.K.navTo(k);
  enter(w,pid,0, STRAIGHT[pid][0]==='20'?'21':'1/7');
  A(w.K._S()[pid].steps[0].exp===true,pid+': miss opens the ladder');
  LADDER[pid].forEach((a,j)=>enter(w,pid,1000+j+1,a));
  A(w.K._S()[pid].steps[0].ok===true || w.K._S()[pid].stepIdx>0, pid+': walking the ladder settles step 1');
});
// traps
w=boot(); const txt=()=>w.document.getElementById('ckRail').textContent;
w.K.navTo(1); enter(w,'t2',0,'13/20'); A(txt().includes('overlap twice'),'T-2 13/20 -> overlap counted twice');
w.K.navTo(0); enter(w,'t1',0,'23/20'); A(txt().includes('product, not a sum'),'T-1 23/20 -> "and" is a product');
w.K.navTo(5); enter(w,'a3',0,'2/5'); A(txt().includes('flipped'),'A-3 12/30 -> flipped given');
w=boot(); w.K.navTo(5); ['3/20','1/4',{c:NOT}].forEach((a,j)=>enter(w,'a3',j,a)); enter(w,'a3',3,'12'); A(txt().includes('what the table shows'),'A-3 count check 12 -> table vs prediction');
const hub=new JSDOM(fs.readFileSync(path.join(root,'index.html'),'utf8')).window.document;
A([...hub.querySelectorAll('.hub-card:not(.hub-soon)')].map(a=>a.getAttribute('href')).includes('checkers/week1-lesson3-rules.html'),'Hub: Week 1 Lesson 3 card live + linked');
console.log('WEEK 1 LESSON 3 TEST PASSED');

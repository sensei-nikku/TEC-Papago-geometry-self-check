/* Week 1 Lesson 2 Learning Lab (split layout, coarse first).
   Each problem: right answer straight away -> Complete; a miss opens the
   ladder, and walking the ladder settles it; the fraction tool's simplify
   prompt and value traps fire.   Run: node tests/week1-lesson2-test.js   */
const fs=require('fs'),path=require('path');
const {JSDOM}=require(path.join(__dirname,'..','node_modules','jsdom'));
const root=path.join(__dirname,'..');
function A(c,m){if(!c){console.log('FAIL:',m);process.exit(1)}console.log('ok:',m);}
function boot(){
  const dom=new JSDOM('<!DOCTYPE html><body><div id="hdrDots"></div><main id="main"></main></body>',{runScripts:'dangerously'});
  const w=dom.window; w.scrollTo=()=>{}; w.HTMLElement.prototype.scrollIntoView=function(){};
  w.eval(fs.readFileSync(path.join(root,'js/checker-kit.js'),'utf8'));
  w.eval(fs.readFileSync(path.join(root,'js/tool-fraction.js'),'utf8'));
  const html=fs.readFileSync(path.join(root,'checkers/week1-lesson2-probability.html'),'utf8');
  w.eval(html.split('tool-fraction.js"></script>')[1].split('<script>')[1].split('</script>')[0]);
  return w;
}
const ANS={t1:'1/2',t2:'3/10',t3:'6/11',a1:'27/50',a2:'7/10',a3:'2/5',a4:'5/9'};
const LADDER={ // rung answers after the rule choice (index of rule rung given)
 t1:{rule:1,nums:{0:4,2:2,3:4}}, t2:{rule:0,nums:{1:18,2:60}}, t3:{rule:0,nums:{1:18,2:33}},
 a1:{rule:0,nums:{1:81,2:150}}, a2:{rule:0,nums:{1:105,2:150}}, a3:{rule:0,nums:{1:24,2:60}}, a4:{rule:0,nums:{1:45,2:81}}};
const RULE={t1:'\u2119(one head) = |one head| / |\u03A9|',t2:'\u2119(job \u2229 evening) = |job \u2229 evening| / |\u03A9|',t3:'\u2119(evening | job) = |evening \u2229 job| / |job|',
 a1:'\u2119(sports\u1D9C) = |sports\u1D9C| / |\u03A9|',a2:'\u2119(under 30 \u222A sports) = |under 30 \u222A sports| / |\u03A9|',a3:'\u2119(sports | under 30) = |sports \u2229 under 30| / |under 30|',a4:'\u2119(30+ | no sports) = |30+ \u2229 no sports| / |no sports|'};

let w=boot(); let d=w.document; let S=()=>w.K._S();
A(w.K.layout()==='split' && d.getElementById('ckRail') && d.getElementById('ckSurf'),'split shell: rail + work surface');
A(d.getElementById('hdrDots').textContent==='T-1T-2T-3A-1A-2A-3A-4','7 problems, T-1..T-3, A-1..A-4');
A(d.getElementById('ckSurf').textContent.includes('The Probability Plan') && !d.querySelector('#ckSurf table'),'T-1: Plan on the surface, no table (list Omega)');
w.K.navTo(1); A(d.querySelector('#ckSurf table.pt') && d.getElementById('ckSurf').textContent.includes('60 students'),'T-2: table on the surface');
A(d.querySelectorAll('#ckRail .step.live').length===1 && !d.getElementById('ckRail').textContent.includes('Which rule'),'coarse first: one live step, no ladder showing');

// coarse path: right answer straight away
Object.keys(ANS).forEach((pid,k)=>{ w.K.navTo(k); w.K.input(pid,0,ANS[pid]); w.K.act(pid,0,'check'); A(S()[pid].done, pid+': straight answer '+ANS[pid]+' -> Complete'); });

// fraction tool behaviors (fresh page)
w=boot(); d=w.document; S=()=>w.K._S();
w.K.navTo(1); w.K.input('t2',0,'18/60'); w.K.act('t2',0,'check');
A(!S().t2.done && S().t2.steps[0].misses===0 && d.getElementById('ckRail').textContent.includes('simplify'),'unsimplified 18/60 -> simplify prompt, not a miss');
w.K.input('t2',0,'0.3'); w.K.act('t2',0,'check'); A(S().t2.steps[0].misses===0 && d.getElementById('ckRail').textContent.includes('as a fraction'),'decimal -> soft prompt to write a fraction');
w.K.navTo(2); w.K.input('t3',0,'18/20'); w.K.act('t3',0,'check');
A(S().t3.steps[0].exp===true && d.getElementById('ckRail').textContent.includes('flipped'),'T-3 flipped given (18/20): trap named AND ladder opens');

// ladder path for every problem (fresh page): miss once, walk the rungs
w=boot(); d=w.document; S=()=>w.K._S();
Object.keys(ANS).forEach((pid,k)=>{
  w.K.navTo(k); w.K.input(pid,0,'1/7'); w.K.act(pid,0,'check');
  A(S()[pid].steps[0].exp===true,pid+': miss opens the ladder');
  const n=w.K._S()[pid].steps[0].subs.length;
  for(let j=0;j<n;j++){
    const code=1000+j+1, st=S()[pid].steps[0].subs[j];
    if(j===LADDER[pid].rule){ const i=st.options.indexOf(RULE[pid]); w.K.act(pid,code,'pick',i); w.K.act(pid,code,'check'); }
    else if(j===n-1){ w.K.input(pid,code,ANS[pid]); w.K.act(pid,code,'check'); }
    else { w.K.input(pid,code,String(LADDER[pid].nums[j])); w.K.act(pid,code,'check'); }
  }
  A(S()[pid].done,pid+': walking the ladder ('+n+' rungs) settles it');
});
// named traps inside the ladder
w=boot(); d=w.document; S=()=>w.K._S();
w.K.navTo(4); w.K.input('a2',0,'43/50'); w.K.act('a2',0,'check');
A(d.getElementById('ckRail').textContent.includes('overlap twice'),'A-2 double-count (43/50) named');
w.K.navTo(6); w.K.input('a4',0,'1/7'); w.K.act('a4',0,'check');
const ra=S().a4.steps[0].subs[0]; w.K.act('a4',1001,'pick',ra.options.indexOf(RULE.a4)); w.K.act('a4',1001,'check');
w.K.input('a4',1002,'45'); w.K.act('a4',1002,'check'); w.K.input('a4',1003,'90'); w.K.act('a4',1003,'check');
A(S().a4.steps[0].subIdx===2 && d.getElementById('ckRail').textContent.includes('flipped'),'A-4 bottom 90 -> flipped-given trap, rung not passed');

const hub=new JSDOM(fs.readFileSync(path.join(root,'index.html'),'utf8')).window.document;
A([...hub.querySelectorAll('.hub-card:not(.hub-soon)')].map(a=>a.getAttribute('href')).includes('checkers/week1-lesson2-probability.html'),'Hub: Week 1 Lesson 2 card live + linked');
console.log('WEEK 1 LESSON 2 TEST PASSED');

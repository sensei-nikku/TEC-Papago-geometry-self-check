/* Week 1 Lesson 2 Learning Lab — every problem walks to Complete on the right answers,
   and the named traps fire.   Run: node tests/week1-lesson2-test.js            */
const fs=require('fs'),path=require('path');
const {JSDOM}=require(path.join(__dirname,'..','node_modules','jsdom'));
const root=path.join(__dirname,'..');
function A(c,m){if(!c){console.log('FAIL:',m);process.exit(1)}console.log('ok:',m);}
const dom=new JSDOM('<!DOCTYPE html><body><div id="hdrDots"></div><main id="main"></main></body>',{runScripts:'dangerously'});
const w=dom.window; w.scrollTo=()=>{};
w.eval(fs.readFileSync(path.join(root,'js/checker-kit.js'),'utf8'));
const html=fs.readFileSync(path.join(root,'checkers/week1-lesson2-probability.html'),'utf8');
w.eval(html.split('checker-kit.js"></script>')[1].split('<script>')[1].split('</script>')[0]);
const d=w.document, S=()=>w.K._S();
A(d.getElementById('hdrDots').textContent==='T-1T-2T-3A-1A-2A-3A-4','7 problems, numbered T-1..T-3, A-1..A-4');
A(d.querySelector('.q-figure')===null,'T-1 has no table (list Omega)');
function live(){return d.querySelector('.card.v .step.live');}
function num(pid,v){const s=S()[pid].stepIdx;w.K.input(pid,s,String(v));w.K.act(pid,s,'check');}
function pick(pid,text){const s=S()[pid].stepIdx;const st=S()[pid].steps[s];const i=st.options.indexOf(text);if(i<0)throw new Error('no option '+text);w.K.act(pid,s,'pick',i);w.K.act(pid,s,'check');}
function fb(){const f=d.querySelector('.card.v .fb');return f?f.textContent:'';}
const P=[
 ['t1',[['n',3,'different outcomes'],['n',4],['c','\u2119(one head) = |one head| / |\u03A9|'],['n',1,'separately'],['n',2],['n',4],['c','1/3','simplify'],['c','1/2']]],
 ['t2',[['c','\u2119(job \u2229 evening) = |job \u2229 evening| / |job|','given'],['c','\u2119(job \u2229 evening) = |job \u2229 evening| / |\u03A9|'],['n',18],['n',33,'no \u201Cgiven'],['n',60],['c','3/10']]],
 ['t3',[['c','\u2119(evening | job) = |evening \u2229 job| / |job|'],['n',18],['n',20,'flipped'],['n',60,'IS a'],['n',33],['c','9/10'],['c','6/11']]],
 ['a1',[['c','\u2119(sports\u1D9C) = |sports\u1D9C| / |\u03A9|'],['n',69,'NOT'],['n',81],['n',150],['c','27/50']]],
 ['a2',[['c','\u2119(under 30 \u222A sports) = |under 30 \u222A sports| / |\u03A9|'],['n',129,'overlap twice'],['n',105],['n',150],['c','7/10']]],
 ['a3',[['c','\u2119(sports | under 30) = |sports \u2229 under 30| / |under 30|'],['n',24],['n',69,'flipped'],['n',60],['c','2/5']]],
 ['a4',[['c','\u2119(30+ | no sports) = |30+ \u2229 no sports| / |no sports|'],['n',45],['n',90,'flipped'],['n',81],['c','5/9']]]
];
P.forEach(([pid,acts],k)=>{
  w.K.navTo(k);
  acts.forEach(a=>{
    const before=S()[pid].stepIdx;
    if(a[0]==='n') num(pid,a[1]); else pick(pid,a[1]);
    if(a[2]){A(S()[pid].stepIdx===before && fb().toLowerCase().includes(a[2].toLowerCase()),pid+': trap/nudge "'+a[2]+'" on '+a[1]);}
  });
  A(S()[pid].done,pid+': walks to Complete');
});
// hub JS-off
const hub=new JSDOM(fs.readFileSync(path.join(root,'index.html'),'utf8')).window.document;
const hrefs=[...hub.querySelectorAll('.hub-card:not(.hub-soon)')].map(a=>a.getAttribute('href'));
A(hrefs.includes('checkers/week1-lesson2-probability.html'),'Hub: Week 1 Lesson 2 card live + linked');
console.log('WEEK 1 LESSON 2 TEST PASSED');

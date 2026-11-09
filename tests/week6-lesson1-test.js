/* Week 6 Lesson 1 Learning Lab: straight answers complete every problem (a tap for the
   classify problems; m-perp then b for the new-line problems); a miss opens the Plan ladder
   and walking it completes the problem; unsimplified fractions get the soft simplify prompt;
   named traps fire (sign-only and flip-only opposite reciprocal, -A/B sign slips, Δx over Δy,
   the point's sign in point-slope, change sides change signs, the given slope reused);
   the Formula Box shows Δx, Δy, -A/B and SG-1..SG-3; the Term 2 page links this checker.
   Run: node tests/week6-lesson1-test.js */
const fs=require('fs'),path=require('path');
const {JSDOM}=require(path.join(__dirname,'..','node_modules','jsdom'));
const root=path.join(__dirname,'..');
function A(c,m){if(!c){console.log('FAIL:',m);process.exit(1)}console.log('ok:',m);}
const FILE='week6-lesson1-par-perp.html';
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
const M='−', YES={c:'yes'}, NO={c:'no'};
const KIND={t1:'parallel',t2:'perpendicular',a1:'perpendicular',a2:'neither',a3:'parallel'};
const LINE={t3:['-1/2','5'],a4:['-2/3','3']};
const ids=['t1','t2','t3','a1','a2','a3','a4'];
let w=boot();
A(w.K.layout()==='split','split shell');
A(w.document.getElementById('hdrDots').textContent==='T-1T-2T-3A-1A-2A-3A-4','7 problems');
const surf=w.document.getElementById('ckSurf').textContent;
A(surf.includes('m = Δy / Δx') && surf.includes('Δx := x2 '+M+' x1') && surf.includes('Δy := y2 '+M+' y1'),'Formula Box: slope with Δx and Δy');
A(surf.includes('m = '+M+'A / B') && surf.includes('C only moves the intercept'),'Formula Box: slope from standard form');
A(['SG-1','SG-2','SG-3'].every(t=>surf.includes(t)),'Formula Box: SG-1, SG-2, SG-3');
// straight answers
Object.keys(KIND).forEach(pid=>{const ww=boot(); ww.K.navTo(ids.indexOf(pid)); enter(ww,pid,0,{c:KIND[pid]}); A(ww.K._S()[pid].done,pid+': '+KIND[pid]+' -> Complete');});
Object.keys(LINE).forEach(pid=>{const ww=boot(); ww.K.navTo(ids.indexOf(pid)); enter(ww,pid,0,LINE[pid][0]); A(stepOf(ww,pid,0).done!==false && ww.K._S()[pid].stepIdx===1,pid+': m-perp '+LINE[pid][0]+' accepted');
  enter(ww,pid,1,LINE[pid][1]); A(ww.K._S()[pid].done,pid+': b '+LINE[pid][1]+' -> Complete');});
// ladders
const LADDER={
 t1:['4','4',YES,{c:'no, they are different'},{c:'parallel'}],
 t2:['1/4',{c:'A = 4, B = 1'},'-4',NO,'-1',{c:'perpendicular'}],
 a1:[{c:'A = 6, B = '+M+'3'},'2','-1/2',NO,'-1',{c:'perpendicular'}],
 a2:['2','-2',NO,'-4',{c:'neither'}],
 a3:['-2/5','-2/5',YES,'2','3',{c:'parallel'}]};
const wrongKind=pid=>({c:['parallel','perpendicular','neither','the same line'].find(k=>k!==KIND[pid])});
Object.keys(LADDER).forEach(pid=>{const ww=boot(); ww.K.navTo(ids.indexOf(pid)); enter(ww,pid,0,wrongKind(pid));
  A(ww.K._S()[pid].steps[0].exp===true,pid+': miss opens the ladder');
  A(ww.K._S()[pid].steps[0].subs.length===LADDER[pid].length,pid+': ladder has '+LADDER[pid].length+' rungs');
  LADDER[pid].forEach((a,j)=>enter(ww,pid,1000+j+1,a));
  A(ww.K._S()[pid].done,pid+': walking the Plan completes the problem');});
const LADDER2={
 t3:{m:['2','-1/2'],b:[{c:'y '+M+' 3 = '+M+'(1/2)(x '+M+' 4)'},{c:'y '+M+' 3 = '+M+'(1/2)x + 2'},{c:'y = '+M+'(1/2)x + 2 + 3'},'5']},
 a4:{m:[{c:'A = 3, B = '+M+'2'},'3/2','-2/3'],b:[{c:'y '+M+' 5 = '+M+'(2/3)(x '+M+' ('+M+'3))'},{c:'x + 3'},{c:'y '+M+' 5 = '+M+'(2/3)x '+M+' 2'},{c:'y = '+M+'(2/3)x '+M+' 2 + 5'},'3']}};
Object.keys(LADDER2).forEach(pid=>{const ww=boot(); ww.K.navTo(ids.indexOf(pid));
  enter(ww,pid,0,'7'); A(ww.K._S()[pid].steps[0].exp===true,pid+': m-perp miss opens its ladder');
  LADDER2[pid].m.forEach((a,j)=>enter(ww,pid,1000+j+1,a)); A(ww.K._S()[pid].stepIdx===1,pid+': m-perp ladder finishes step 1');
  enter(ww,pid,1,'100'); A(ww.K._S()[pid].steps[1].exp===true,pid+': b miss opens its ladder');
  LADDER2[pid].b.forEach((a,j)=>enter(ww,pid,2000+j+1,a)); A(ww.K._S()[pid].done,pid+': walking the Plan completes the line');});
// soft simplify prompt: right value, not simplified, is not a miss
{const ww=boot(); ww.K.navTo(ids.indexOf('a3')); enter(ww,'a3',0,{c:'neither'});
 enter(ww,'a3',1001,'-2/5'); enter(ww,'a3',1002,'-4/10');
 A(!stepOf(ww,'a3',1002).done && stepOf(ww,'a3',1002).misses===0 && ww.document.getElementById('ckRail').textContent.includes('simplify'),'a3: -4/10 gets the simplify prompt, no strike');}
// traps
const rail=(pid,code,val,pre)=>{const ww=boot(); ww.K.navTo(ids.indexOf(pid)); (pre||[]).forEach(([c,v])=>enter(ww,pid,c,v)); enter(ww,pid,code,val);
  return {txt:ww.document.getElementById('ckRail').textContent,done:stepOf(ww,pid,code).done};};
const trap=(pid,code,val,txt,pre)=>{const r=rail(pid,code,val,pre); A(!r.done && r.txt.includes(txt),pid+' '+val+' -> "'+txt+'"');};
trap('t3',0,'-2','changed only the sign'); trap('t3',0,'1/2','flipped it but kept the sign'); trap('t3',0,'2','slope of the given line');
trap('a4',0,'2/3','flipped it but kept the sign'); trap('a4',0,'2/3','Also, check the sign of m');
trap('t3',1,'1','Check the point',[[0,'-1/2']]); trap('t3',1,'1','Also, distribute',[[0,'-1/2']]);
trap('t3',1,'-1','Change sides, change signs',[[0,'-1/2']]); trap('t3',1,'-5','given slope',[[0,'-1/2']]);
trap('a4',1,'7','Check the point',[[0,'-2/3']]); trap('a4',1,'-7','Change sides, change signs',[[0,'-2/3']]); trap('a4',1,'19/2','given slope',[[0,'-2/3']]);
trap('t2',1003,'4','Keep the minus',[[0,{c:'neither'}],[1001,'1/4'],[1002,{c:'A = 4, B = 1'}]]);
trap('t2',1003,'-1/4','B/A',[[0,{c:'neither'}],[1001,'1/4'],[1002,{c:'A = 4, B = 1'}]]);
trap('t2',1003,'-4/9','C only moves the intercept',[[0,{c:'neither'}],[1001,'1/4'],[1002,{c:'A = 4, B = 1'}]]);
trap('a1',1002,'-2','negative over a negative',[[0,{c:'neither'}],[1001,{c:'A = 6, B = '+M+'3'}]]);
trap('a2',1001,'1/2','Δx over Δy',[[0,{c:'parallel'}]]); trap('a2',1002,'2','Check the signs',[[0,{c:'parallel'}],[1001,'2']]);
const html=fs.readFileSync(path.join(root,'checkers',FILE),'utf8');
A(!/\bflip the fraction\b/i.test(html),'no "flip the fraction" step');
const hub=new JSDOM(fs.readFileSync(path.join(root,'terms','sy2627-term2.html'),'utf8')).window.document;
const links=[...hub.querySelectorAll('a.hub-card')].map(a=>a.getAttribute('href'));
A(links.includes('../checkers/'+FILE),'Term 2 page links W6 L1');
console.log('WEEK 6 LESSON 1 TEST PASSED');

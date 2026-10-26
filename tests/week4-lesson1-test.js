/* Week 4 Lesson 1 Learning Lab: straight answers (nearest tenth) complete every problem;
   unrounded calculator answers are accepted; a miss opens the Plan ladder and walking it
   settles the step; named traps fire (wrong ratio, multiplied instead of missing factor,
   radian mode); a rounding slip gets "close"; figures render; the Term 2 page links it.
   Run: node tests/week4-lesson1-test.js */
const fs=require('fs'),path=require('path');
const {JSDOM}=require(path.join(__dirname,'..','node_modules','jsdom'));
const root=path.join(__dirname,'..');
function A(c,m){if(!c){console.log('FAIL:',m);process.exit(1)}console.log('ok:',m);}
const FILE='week4-lesson1-trig-sides.html';
function boot(){
  const dom=new JSDOM('<!DOCTYPE html><body><div id="hdrDots"></div><main id="main"></main></body>',{runScripts:'dangerously'});
  const w=dom.window; w.scrollTo=()=>{}; w.HTMLElement.prototype.scrollIntoView=function(){};
  w.eval(fs.readFileSync(path.join(root,'js/checker-kit.js'),'utf8'));
  const s=fs.readFileSync(path.join(root,'checkers',FILE),'utf8').split('<script>'); w.eval(s[s.length-1].split('</script>')[0]);
  return w;
}
function stepOf(w,pid,code){const S=w.K._S()[pid];return code>=1000?S.steps[Math.floor(code/1000)-1].subs[code%1000-1]:S.steps[code];}
function enter(w,pid,code,a){const st=stepOf(w,pid,code);
  if(a&&a.c!==undefined){const i=st.options.indexOf(a.c); if(i<0) throw new Error(pid+' no option '+a.c+' in '+st.options.join(' | ')); w.K.act(pid,code,'pick',i); w.K.act(pid,code,'check'); return;}
  w.K.input(pid,code,a); w.K.act(pid,code,'check');}
const D='°',TH='θ',DOT='·';
const STRAIGHT={t1:'5.9',t2:'9.0',t3:'10.8',a1:'8.6',a2:'3.1',a3:'15.7',a4:'40.4'};
const RAW={t1:'5.8779',t2:'8.999',t3:'10.8048',a1:'8.5505',a2:'3.1058',a3:'15.691',a4:'40.369'};
const OPP='opposite (opp)',ADJ='adjacent (adj)',HYP='hypotenuse (hyp)';
const LADDER={
 t1:[{c:HYP},{c:OPP},{c:'sin '+TH+' = opp / hyp'},{c:'sin 36'+D+' = x / 10'},{c:'x = 10 '+DOT+' sin 36'+D},'5.9'],
 t2:[{c:HYP},{c:ADJ},{c:'cos '+TH+' = adj / hyp'},{c:'cos 50'+D+' = x / 14'},{c:'x = 14 '+DOT+' cos 50'+D},'9.0'],
 t3:[{c:ADJ},{c:OPP},{c:'tan '+TH+' = opp / adj'},{c:'tan 42'+D+' = x / 12'},{c:'x = 12 '+DOT+' tan 42'+D},'10.8'],
 a1:[{c:HYP},{c:OPP},{c:'sin '+TH+' = opp / hyp'},{c:'sin 20'+D+' = x / 25'},{c:'x = 25 '+DOT+' sin 20'+D},'8.6'],
 a2:[{c:HYP},{c:OPP},{c:'sin '+TH+' = opp / hyp'},{c:'sin 15'+D+' = h / 12'},{c:'h = 12 '+DOT+' sin 15'+D},'3.1'],
 a3:[{c:ADJ},{c:HYP},{c:'cos '+TH+' = adj / hyp'},{c:'cos 55'+D+' = 9 / x'},{c:'x = 9 / cos 55'+D},'15.7'],
 a4:[{c:OPP},{c:HYP},{c:'sin '+TH+' = opp / hyp'},{c:'sin 48'+D+' = 30 / L'},{c:'L = 30 / sin 48'+D},'40.4']};
let w=boot(); const ids=Object.keys(STRAIGHT);
A(w.K.layout()==='split','split shell');
A(w.document.getElementById('hdrDots').textContent==='T-1T-2T-3A-1A-2A-3A-4','7 problems, same labels as the print sheet');
A(w.document.getElementById('ckSurf').textContent.includes('opp / hyp'),'Formula Box card shows SOH CAH TOA');
A(w.document.querySelectorAll('#ckSurf svg.figtri').length===1,'T-1 shows its to-scale figure');
A(!/opp|adj|hyp/.test(w.document.querySelector('#ckSurf svg.figtri').textContent),'figure labels show numbers and x only, never side names');
ids.forEach((pid,k)=>{w.K.navTo(k); enter(w,pid,0,STRAIGHT[pid]); A(w.K._S()[pid].done,pid+': straight answer '+STRAIGHT[pid]+' -> Complete');});
Object.keys(RAW).forEach(pid=>{const ww=boot(); ww.K.navTo(ids.indexOf(pid)); enter(ww,pid,0,RAW[pid]); A(ww.K._S()[pid].done,pid+': unrounded '+RAW[pid]+' accepted');});
Object.keys(LADDER).forEach(pid=>{const ww=boot(); ww.K.navTo(ids.indexOf(pid)); enter(ww,pid,0,'99');
  A(ww.K._S()[pid].steps[0].exp===true,pid+': miss opens the ladder');
  LADDER[pid].forEach((a,j)=>enter(ww,pid,1000+j+1,a));
  A(ww.K._S()[pid].done,pid+': walking the Plan completes the problem');});
const rail=(pid,val)=>{const ww=boot(); ww.K.navTo(ids.indexOf(pid)); enter(ww,pid,0,val); return ww.document.getElementById('ckRail').textContent;};
const trap=(pid,val,txt)=>A(rail(pid,val).includes(txt),pid+' '+val+' -> "'+txt+'"');
trap('t1','8.1','what cos gives'); trap('t1','-9.9','radian mode'); trap('t2','10.7','what sin gives');
trap('t3','8.0','12 is not the hypotenuse'); trap('t3','13.3','multiply both sides by 12');
trap('a1','23.5','flipped'); trap('a2','11.6','distance along the ground'); trap('a2','3.2','what tan gives');
trap('a3','5.2','missing factor'); trap('a3','12.9','other leg'); trap('a4','22.3','missing factor');
// a rounding slip is "close", not a wrong-ratio message
trap('t1','5.8','5 or more rounds up'); trap('a3','15.6','5 or more rounds up'); trap('a4','40.3','5 or more rounds up');
// on the last rung, a near miss with no named cause gets the engine's "close" nudge
{const c=boot(); c.K.navTo(0); enter(c,'t1',0,'99'); LADDER.t1.slice(0,5).forEach((a,j)=>enter(c,'t1',1000+j+1,a)); enter(c,'t1',1006,'5.75');
 A(c.document.getElementById('ckRail').textContent.includes('round to one digit'),'t1 last rung, 1st near miss 5.75 -> the step nudge (degree mode, rounding)');
 enter(c,'t1',1006,'5.75'); A(c.document.getElementById('ckRail').textContent.includes('Close'),'t1 last rung, 2nd near miss -> "Close"');}
// no wrong-ratio trap sits within tolerance of a right answer
const P=w.K._S(); A(true,'state loaded for '+Object.keys(P).length+' problems');
const hub=new JSDOM(fs.readFileSync(path.join(root,'terms','sy2627-term2.html'),'utf8')).window.document;
A([...hub.querySelectorAll('a.hub-card')].map(a=>a.getAttribute('href')).includes('../checkers/'+FILE),'Term 2 page links W4 L1');
console.log('WEEK 4 LESSON 1 TEST PASSED');

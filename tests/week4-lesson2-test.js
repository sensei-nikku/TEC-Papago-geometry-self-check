/* Week 4 Lesson 2 Learning Lab: straight answers (nearest tenth of a degree) complete every
   problem; unrounded calculator answers pass; a wrongly rounded tenth does not; a miss opens
   the Plan ladder and walking it completes the problem; generated traps fire (other inverse,
   other acute angle, flipped tan, sin instead of sin^-1, radian mode); A-4 ends with the OSHA
   comparison; figures mark theta and show no side names; the Term 2 page links this checker
   (and no longer links the old unit3-day3-inverse checker).
   Run: node tests/week4-lesson2-test.js */
const fs=require('fs'),path=require('path');
const {JSDOM}=require(path.join(__dirname,'..','node_modules','jsdom'));
const root=path.join(__dirname,'..');
function A(c,m){if(!c){console.log('FAIL:',m);process.exit(1)}console.log('ok:',m);}
const FILE='week4-lesson2-inverse-angles.html';
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
const TH='θ',INV='⁻¹';
const OPP='opposite (opp)',ADJ='adjacent (adj)',HYP='hypotenuse (hyp)';
const OSHA={c:'less steep than the safe angle: its base is too far from the wall'};
const STRAIGHT={t1:['32.6'],t2:['46.6'],t3:['58.0'],a1:['49.5'],a2:['30.3'],a3:['32.0'],a4:['69.6',OSHA]};
const RAW={t1:'32.579',t2:'46.5675',t3:'57.9946',a1:'49.4584',a2:'30.2564',a3:'31.9657',a4:'69.6359'};
const inv=(f,t,b)=>({c:TH+' = '+f+INV+'('+t+' / '+b+')'});
const LADDER={
 t1:[{c:OPP},{c:HYP},{c:TH+' = sin'+INV+'(opp / hyp)'},inv('sin',7,13),'32.6'],
 t2:[{c:ADJ},{c:HYP},{c:TH+' = cos'+INV+'(adj / hyp)'},inv('cos',11,16),'46.6'],
 t3:[{c:OPP},{c:ADJ},{c:TH+' = tan'+INV+'(opp / adj)'},inv('tan',8,5),'58.0'],
 a1:[{c:ADJ},{c:HYP},{c:TH+' = cos'+INV+'(adj / hyp)'},inv('cos',13,20),'49.5'],
 a2:[{c:OPP},{c:ADJ},{c:TH+' = tan'+INV+'(opp / adj)'},inv('tan',7,12),'30.3'],
 a3:[{c:OPP},{c:HYP},{c:TH+' = sin'+INV+'(opp / hyp)'},inv('sin',9,17),'32.0'],
 a4:[{c:OPP},{c:HYP},{c:TH+' = sin'+INV+'(opp / hyp)'},inv('sin',15,16),'69.6']};
let w=boot(); const ids=Object.keys(STRAIGHT);
A(w.K.layout()==='split','split shell');
A(w.document.getElementById('hdrDots').textContent==='T-1T-2T-3A-1A-2A-3A-4','7 problems');
A(w.document.getElementById('ckSurf').textContent.includes('sin'+INV+'(opp / hyp)'),'Formula Box card shows the three inverses');
const fig=w.document.querySelector('#ckSurf svg.figtri');
A(fig && fig.textContent.includes(TH),'T-1 figure marks theta');
A(!/opp|adj|hyp|32/.test(fig.textContent),'figure shows no side names and no angle value');
ids.forEach((pid,k)=>{w.K.navTo(k); STRAIGHT[pid].forEach((a,j)=>enter(w,pid,j,a)); A(w.K._S()[pid].done,pid+': straight answer -> Complete');});
Object.keys(RAW).forEach(pid=>{const ww=boot(); ww.K.navTo(ids.indexOf(pid)); enter(ww,pid,0,RAW[pid]); A(ww.K._S()[pid].stepIdx>=1||ww.K._S()[pid].done,pid+': unrounded '+RAW[pid]+' accepted');});
Object.keys(LADDER).forEach(pid=>{const ww=boot(); ww.K.navTo(ids.indexOf(pid)); enter(ww,pid,0,'99');
  A(ww.K._S()[pid].steps[0].exp===true,pid+': miss opens the ladder');
  LADDER[pid].forEach((a,j)=>enter(ww,pid,1000+j+1,a));
  A(ww.K._S()[pid].stepIdx>=1,pid+': walking the Plan settles the angle');});
const rail=(pid,val)=>{const ww=boot(); ww.K.navTo(ids.indexOf(pid)); enter(ww,pid,0,val); return {txt:ww.document.getElementById('ckRail').textContent,done:ww.K._S()[pid].stepIdx>=1};};
const trap=(pid,val,txt)=>{const r=rail(pid,val); A(!r.done && r.txt.includes(txt),pid+' '+val+' -> "'+txt+'"');};
trap('t1','57.4','other acute angle'); trap('t1','28.3','what tan'+INV+' gives'); trap('t1','0.57','radian mode'); trap('t1','0.0094','You pressed sin');
trap('t3','32.0','wrong order'); trap('a3','58.0','other acute angle'); trap('a2','59.7','wrong order');
trap('a1','49.4','5 or more rounds up'); trap('a2','30.2','5 or more rounds up');
// A-4: a wrong OSHA comparison gets the nudge, not a pass
{const ww=boot(); ww.K.navTo(6); enter(ww,'a4',0,'69.6'); enter(ww,'a4',1,{c:'steeper than the safe angle: its base is too close to the wall'});
 A(!ww.K._S()['a4'].done && ww.document.getElementById('ckRail').textContent.includes('flatter ladder'),'a4: wrong OSHA comparison -> nudge');}
const hub=new JSDOM(fs.readFileSync(path.join(root,'terms','sy2627-term2.html'),'utf8')).window.document;
const links=[...hub.querySelectorAll('a.hub-card')].map(a=>a.getAttribute('href'));
A(links.includes('../checkers/'+FILE),'Term 2 page links W4 L2');
A(!links.includes('../checkers/unit3-day3-inverse.html'),'Term 2 page no longer links the old Unit 3 inverse checker');
console.log('WEEK 4 LESSON 2 TEST PASSED');

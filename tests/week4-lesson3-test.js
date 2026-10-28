/* Week 4 Lesson 3 Learning Lab: straight answers (nearest tenth) complete every problem;
   unrounded calculator answers pass; a wrongly rounded tenth does not; a miss opens the Plan
   ladder and walking it completes the problem; depression problems start the ladder with
   "move it to the bottom" (SG-5) and a wrong pick there gets the SG-5 nudge; hand-written
   traps fire (measured from the wall, ground distance instead of line of sight) and generated
   traps fire (other ratio, flipped tan, missing factor, missing inverse, radian mode);
   prompts are words only and say to sketch; the Term 2 page links this checker.
   Run: node tests/week4-lesson3-test.js */
const fs=require('fs'),path=require('path');
const {JSDOM}=require(path.join(__dirname,'..','node_modules','jsdom'));
const root=path.join(__dirname,'..');
function A(c,m){if(!c){console.log('FAIL:',m);process.exit(1)}console.log('ok:',m);}
const FILE='week4-lesson3-elevation-depression.html';
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
const TH='θ',INV='⁻¹',DEG='°',DOT='·';
const OPP={c:'opposite (opp)'},ADJ={c:'adjacent (adj)'},HYP={c:'hypotenuse (hyp)'};
const BOTTOM=where=>({c:'at the bottom, at the '+where+': it is the same angle (★ SG-5)'});
const STRAIGHT={t1:'48.5',t2:'138.5',t3:'51.6',a1:'126.3',a2:'31.0',a3:'18.4',a4:'165.0'};
const RAW={t1:'48.4831',t2:'138.4958',t3:'51.6219',a1:'126.275',a2:'30.9638',a3:'18.4349',a4:'165.0363'};
const LADDER={
 t1:[ADJ,OPP,{c:'tan '+TH+' = opp / adj'},{c:'tan 22'+DEG+' = h / 120'},{c:'h = 120 '+DOT+' tan 22'+DEG},'48.5'],
 t2:[BOTTOM('boat'),OPP,ADJ,{c:'tan '+TH+' = opp / adj'},{c:'tan 18'+DEG+' = 45 / d'},{c:'d = 45 / tan 18'+DEG},'138.5'],
 t3:[HYP,OPP,{c:'sin '+TH+' = opp / hyp'},{c:'sin 35'+DEG+' = h / 90'},{c:'h = 90 '+DOT+' sin 35'+DEG},'51.6'],
 a1:[BOTTOM('swimmer'),OPP,ADJ,{c:'tan '+TH+' = opp / adj'},{c:'tan 9'+DEG+' = 20 / d'},{c:'d = 20 / tan 9'+DEG},'126.3'],
 a2:[OPP,ADJ,{c:TH+' = tan'+INV+'(opp / adj)'},{c:TH+' = tan'+INV+'(6 / 10)'},'31.0'],
 a3:[BOTTOM('boat'),OPP,ADJ,{c:TH+' = tan'+INV+'(opp / adj)'},{c:TH+' = tan'+INV+'(200 / 600)'},'18.4'],
 a4:[BOTTOM('car'),OPP,HYP,{c:'sin '+TH+' = opp / hyp'},{c:'sin 31'+DEG+' = 85 / L'},{c:'L = 85 / sin 31'+DEG},'165.0']};
let w=boot(); const ids=Object.keys(STRAIGHT);
A(w.K.layout()==='split','split shell');
A(w.document.getElementById('hdrDots').textContent==='T-1T-2T-3A-1A-2A-3A-4','7 problems');
const surf=w.document.getElementById('ckSurf').textContent;
A(surf.includes('SG-5') && surf.includes('angle of depression (from the top) = angle of elevation (from the bottom)'),'Formula Box shows SG-5 in the lesson’s words');
A(surf.includes('tan '+TH+' = opp / adj') && surf.includes('tan'+INV),'Formula Box shows SOH CAH TOA and the inverses');
const html=fs.readFileSync(path.join(root,'checkers',FILE),'utf8');
const P=JSON.parse(html.match(/K\.run\((\[[\s\S]*?\]), \{ layout/)[1]);
A(P.every(p=>p.figure==='' && /Sketch the triangle on your paper first/.test(p.prompt)),'words only: no figures, every prompt says to sketch first');
A(!w.document.querySelector('#ckSurf svg'),'no triangle drawn on the work surface');
ids.forEach((pid,k)=>{w.K.navTo(k); enter(w,pid,0,STRAIGHT[pid]); A(w.K._S()[pid].done,pid+': straight answer '+STRAIGHT[pid]+' -> Complete');});
Object.keys(RAW).forEach(pid=>{const ww=boot(); ww.K.navTo(ids.indexOf(pid)); enter(ww,pid,0,RAW[pid]); A(ww.K._S()[pid].done,pid+': unrounded '+RAW[pid]+' accepted');});
Object.keys(LADDER).forEach(pid=>{const ww=boot(); ww.K.navTo(ids.indexOf(pid)); enter(ww,pid,0,'999');
  A(ww.K._S()[pid].steps[0].exp===true,pid+': miss opens the ladder');
  A(ww.K._S()[pid].steps[0].subs.length===LADDER[pid].length,pid+': ladder has '+LADDER[pid].length+' rungs');
  LADDER[pid].forEach((a,j)=>enter(ww,pid,1000+j+1,a));
  A(ww.K._S()[pid].done,pid+': walking the Plan completes the problem');});
// Depression ladders: a wrong pick on the move-it-to-the-bottom rung gets the SG-5 nudge.
{const ww=boot(); ww.K.navTo(1); enter(ww,'t2',0,'999');
 enter(ww,'t2',1001,{c:'at the top, between the lighthouse and the line of sight'});
 A(!stepOf(ww,'t2',1001).done && ww.document.getElementById('ckRail').textContent.includes('Move it to the bottom'),'t2: angle left at the top -> SG-5 nudge');}
const MOVE='The angle of depression is at the top';
A(['t2','a1','a3','a4'].every(pid=>P.find(p=>p.id===pid).pipeline[0].sub[0].ask.startsWith(MOVE)),'depression problems open with the move rung');
A(['t1','t3','a2'].every(pid=>!P.find(p=>p.id===pid).pipeline[0].sub[0].ask.startsWith(MOVE)),'elevation problems skip the move rung');
const rail=(pid,val)=>{const ww=boot(); ww.K.navTo(ids.indexOf(pid)); enter(ww,pid,0,val); return {txt:ww.document.getElementById('ckRail').textContent,done:ww.K._S()[pid].done};};
const trap=(pid,val,txt)=>{const r=rail(pid,val); A(!r.done && r.txt.includes(txt),pid+' '+val+' -> "'+txt+'"');};
trap('t2','14.6','from the lighthouse, not from level'); trap('a1','3.2','from the lifeguard stand');
trap('a3','71.6','between the cliff and the line of sight');
trap('a4','141.5','distance along the ground'); trap('a4','99.2','from straight down');
trap('t1','45.0','what sin gives'); trap('t2','47.3','what cos gives'); trap('t3','63.0','what tan gives');
trap('t1','297.0','multiply both sides by 120'); trap('a4','43.8','missing factor');
trap('a2','59.0','wrong order'); trap('a2','36.9','what sin'+INV+' gives'); trap('a3','0.0058','You pressed tan');
trap('t1','1.06','radian mode'); trap('a2','0.54','radian mode');
trap('t1','48.4','5 or more rounds up'); trap('a1','126.2','5 or more rounds up'); trap('a2','30.9','5 or more rounds up');
const hub=new JSDOM(fs.readFileSync(path.join(root,'terms','sy2627-term2.html'),'utf8')).window.document;
const links=[...hub.querySelectorAll('a.hub-card')].map(a=>a.getAttribute('href'));
A(links.includes('../checkers/'+FILE),'Term 2 page links W4 L3');
console.log('WEEK 4 LESSON 3 TEST PASSED');

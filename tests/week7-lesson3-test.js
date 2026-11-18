/* Week 7 Lesson 3 Learning Lab (slant height), on the work shell with drag-to-the-paper (kit 1.6.0):
   label the sketch, drag in the model, find l (and r, B, P), substitute and answer. Straight answers
   complete every problem; decoy labels and models say why; ladders walk to the end; named traps fire;
   work lines hang one = per line; the work never runs ahead; no "subtract"/"divide"; the hub links it.
   Run: node tests/week7-lesson3-test.js */
const fs=require('fs'),path=require('path');
const {JSDOM}=require(path.join(__dirname,'..','node_modules','jsdom'));
const root=path.join(__dirname,'..');
function A(c,m){if(!c){console.log('FAIL:',m);process.exit(1)}console.log('ok:',m);}
const FILE='week7-lesson3-slant-height.html';
const SRC=fs.readFileSync(path.join(root,'checkers',FILE),'utf8');
function boot(){
  const dom=new JSDOM('<!DOCTYPE html><body><div id="hdrDots"></div><main id="main"></main></body>',{runScripts:'dangerously'});
  const w=dom.window; w.scrollTo=()=>{}; w.HTMLElement.prototype.scrollIntoView=function(){};
  w.eval(fs.readFileSync(path.join(root,'js/checker-kit.js'),'utf8'));
  w.eval(fs.readFileSync(path.join(root,'js/tool-drag.js'),'utf8'));
  const s=SRC.split('<script>'); w.eval(s[s.length-1].split('</script>')[0]);
  return w;
}
function stepOf(w,pid,code){const S=w.K._S()[pid];return code>=1000?S.steps[Math.floor(code/1000)-1].subs[code%1000-1]:S.steps[code];}
function enter(w,pid,code,a){const st=stepOf(w,pid,code);
  if(a&&a.c!==undefined){const i=st.options.indexOf(a.c); if(i<0) throw new Error(pid+' no option '+a.c+' in '+st.options.join(' | ')); w.K.act(pid,code,'pick',i); w.K.act(pid,code,'check'); return;}
  w.K.input(pid,code,a); w.K.act(pid,code,'check');}
const PROB={}; JSON.parse(SRC.match(/K\.run\((\[[\s\S]*?\]), \{ layout/)[1]).forEach(p=>PROB[p.id]=p);
const card=(pid,si,t)=>{const i=PROB[pid].pipeline[si].cards.findIndex(c=>c.t===t); if(i<0) throw new Error(pid+' no card '+t); return i;};
const drop=(w,pid,si,t,zone)=>w.K.act(pid,si,'drop',{card:card(pid,si,t),zone});
const ids=['t1','t2','t3','t4','a1','a2','a3','a4'];
const go=pid=>{const w=boot(); w.K.navTo(ids.indexOf(pid)); return w;};
const workText=w=>w.document.getElementById('ckWork').textContent.replace(/\s+/g,' ');
const hanging=w=>[...w.document.querySelectorAll('#ckWork .wk-ln.eq .wk-r')].every(e=>(e.textContent.match(/[=≈]/g)||[]).length===1);
const fb=w=>{const f=w.document.querySelectorAll('#ckQ .fb'); return f.length?f[f.length-1].textContent:'';};

let w=boot();
A(w.K.layout()==='work','work shell (paper on the left, question on the right)');
A(w.document.getElementById('hdrDots').textContent==='T-1T-2T-3T-4A-1A-2A-3A-4','8 problems');
A(SRC.includes('Kalam') && SRC.includes('tool-drag.js'),'parchment font and the drag tools load');

const L='ℓ';
const LABELS={t1:{r:'r = 4 in',l:L+' = 10 in',S:'S = ?'}, t2:{s:'s = 8 cm',l:L+' = 6 cm',S:'S = ?'},
  t3:{r:'r = 9 m',h:'h = 12 m',l:L+' = ?',S:'S = ?'}, t4:{s:'s = 12 ft',h:'h = 8 ft',l:L+' = ?',S:'S = ?'},
  a1:{d:'d = 12 in',l:L+' = 14 in',S:'S = ?'}, a2:{s:'s = 14 m',h:'h = 24 m',l:L+' = ?',S:'S = ?'},
  a3:{r:'r = 3 cm',h:'h = 4 cm',l:L+' = ?',S:'S = ?'}, a4:{s:'s = 6 ft',h:'h = 4 ft',l:L+' = ?',S:'S = ?'}};
const CS='S = πr² + πrℓ', CSIDE='S = πrℓ', PS='S = B + (1/2)Pℓ', PSIDE='S = (1/2)Pℓ';
const MODEL={t1:CS,t2:PS,t3:CS,t4:PS,a1:CS,a2:PS,a3:CSIDE,a4:PSIDE};
const REST={t1:['175.9'],t2:['64','32','160'],t3:['15','678.6'],t4:['10','144','48','384'],a1:['6','377'],a2:['25','196','56','896'],a3:['5','47.1'],a4:['5','24','60']};
const labelAll=(w,pid)=>Object.entries(LABELS[pid]).forEach(([z,t])=>drop(w,pid,0,t,z));
const model=(w,pid)=>drop(w,pid,1,MODEL[pid],'model');
const straight=(w,pid)=>{labelAll(w,pid); model(w,pid); REST[pid].forEach((v,i)=>enter(w,pid,2+i,v));};

ids.forEach(pid=>{const ww=go(pid);
  A(!workText(ww).includes('≈') && !/= \d/.test(workText(ww).replace(/[^=\d ]/g,'').slice(0,0)),pid+': no answers on the paper before any step');
  straight(ww,pid);
  A(ww.K._S()[pid].done,pid+': straight answers -> Complete');
  A(hanging(ww),pid+': every work line hangs one relation');
  A(workText(ww).includes('✓'),pid+': the check line shows when done');});

// the work never runs ahead: after the labels and model only, no number answers are written
{const ww=go('t3'); labelAll(ww,'t3'); model(ww,'t3'); A(!workText(ww).includes('678.6') && !workText(ww).includes('= 15'),'t3: the paper waits for each step');
 enter(ww,'t3',2,'15'); A(workText(ww).includes('15') && !workText(ww).includes('678.6'),'t3: l = 15 shows after step 5, the answer does not');}

// decoy labels and models say why
{const ww=go('t3'); drop(ww,'t3',0,L+' = 12 m','l'); A(/that is h/.test(fb(ww)),'t3: the height labelled as l -> "that is h"');}
{const ww=go('t1'); drop(ww,'t1',0,'h = 10 in','l'); A(/slant height/.test(fb(ww)),'t1: the slant height labelled as h -> says it is the slant height');}
{const ww=go('t4'); drop(ww,'t4',0,'s = 6 ft','s'); A(/Half of it/.test(fb(ww)),'t4: half the side as s -> says why');}
{const ww=go('t3'); labelAll(ww,'t3'); drop(ww,'t3',1,'S = πr² + πrh','model'); A(/slant height/.test(fb(ww)),'t3: the model with h -> uses the slant height');}
{const ww=go('a3'); labelAll(ww,'a3'); drop(ww,'a3',1,CS,'model'); A(/no bottom/.test(fb(ww)),'a3: the closed model on a cup -> no bottom');}
{const ww=go('a4'); labelAll(ww,'a4'); drop(ww,'a4',1,PS,'model'); A(/no floor/.test(fb(ww)),'a4: the closed model on a tent -> no floor');}

// named traps
const TRAP=[['t1',2,'125.7','only the side'],['t3',3,'593.8','You used h'],['t4',2,'14.4','half the side'],['t4',5,'336','You used h'],
  ['t2',4,'256','1/2'],['a1',2,'12','d = 2r'],['a1',3,'980.2','all the way across'],['a3',3,'75.4','No bottom'],['a4',4,'96','No floor'],['a2',2,'31','Square, add']];
TRAP.forEach(([pid,si,v,msg])=>{const ww=go(pid); labelAll(ww,pid); model(ww,pid); for(let i=2;i<si;i++) enter(ww,pid,i,REST[pid][i-2]);
  enter(ww,pid,si,v); A(!stepOf(ww,pid,si).done && fb(ww).includes(msg),pid+': '+v+' -> "'+msg+'"');});

// ladders
const LAD={t3:[[2,'1',[{c:'ℓ = √(h² + r²)'},'225','15']],[3,'1',[{c:'S = π(9²) + π(9)(15)'},'678.6']]],
  t4:[[2,'1',[{c:'ℓ = √(h² + (s/2)²)'},'100','10']],[3,'1',[]],[4,'1',[]],[5,'1',[{c:'S = 144 + (1/2)(48)(10)'},'384']]],
  a3:[[2,'1',[{c:'ℓ = √(h² + r²)'},'25','5']],[3,'1',[{c:'S = π(3)(5)'},'47.1']]],
  a4:[[2,'1',[{c:'ℓ = √(h² + (s/2)²)'},'25','5']],[3,'1',[]],[4,'1',[{c:'S = (1/2)(24)(5)'},'60']]]};
Object.keys(LAD).forEach(pid=>{const ww=go(pid); labelAll(ww,pid); model(ww,pid);
  LAD[pid].forEach(([si,wrong,rungs])=>{
    if(!rungs.length){ enter(ww,pid,si,REST[pid][si-2]); return; }
    enter(ww,pid,si,wrong); A(ww.K._S()[pid].steps[si].exp===true,pid+' step '+si+': a miss opens the plan');
    rungs.forEach((a,j)=>enter(ww,pid,si*1000+1000+j+1,a));});
  A(ww.K._S()[pid].done,pid+': walking the plan completes the problem');});

A(!/\bsubtract|\bdivide/i.test(SRC),'no "subtract" or "divide"');
const hub=fs.readFileSync(path.join(root,'terms/sy2627-term2.html'),'utf8');
A(hub.includes('week7-lesson3-slant-height.html'),'Term 2 page links this checker');
console.log('ALL PASS');

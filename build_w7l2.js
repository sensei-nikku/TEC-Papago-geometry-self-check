/* Week 7 Lesson 2 checker (Surface Area: Solving for the Height). First checker on the work
   shell (engine v1.5.0): suggested work on the left, the question on the right, and an f button
   on the question's corner that opens the Formula Box.
   Steps follow the handout (Nov 17 rules):
     4 facts are quote -> math only ("6 cm by 4 cm base" -> l = 6, w = 4);
     5a, 5b find the in-between numbers (B and P for a box; r from a width);
     5c solves for h with letters only;
     6 reiterates the solved formula, substitutes, and answers with the calculator in one go.
   Checker steps, coarse first (a miss opens the Plan one move at a time):
     box:  5a B = ?  ·  5b P = ?  ·  5c h = … (tap)  ·  6 h = ? (substitute, then the calculator)
     can:  5 h = … (tap)  ·  6 h = ?            width given: 5a r = ? first
   No calculator pieces: step 6's ladder is substitute (tap) then the answer.
   Answers to the nearest tenth pass within 0.1 (the right tenth, 3.14, or a rounded middle step);
   whole-number in-between steps (B, P, r) are exact. Every wrong option is a named slip; every
   numeric trap is a named slip. The build stops if a trap lands on its answer, two traps share a
   value, options repeat, or an answer repeats a printed Week 7 problem.
   Run: node build_w7l2.js  -> checkers/week7-lesson2-surface-area.html */
const fs=require('fs');
function djb2(s){var v=5381;for(var i=0;i<s.length;i++){v=((v<<5)+v)+s.charCodeAt(i);v=v&v;}return v>>>0;}
const DOT='·',PI_='π',SQ='²',MI='−';
const PI=Math.PI, TOL=0.1;
const f1=x=>(Math.floor(x*10+0.5)/10).toFixed(1);
const show=x=>String(x);                                           // 1.5 stays 1.5

/* ---- step builders ---- */
function ch(label,ask,opts,i,nudge){
  if(new Set(opts).size!==opts.length) throw new Error(label+': duplicate options '+opts.join(' | '));
  return {tool:'choice',stack:true,label,ask,options:opts,ch:djb2(opts[i]),shuffle:true,nudges:[nudge]};}
function num(label,a,traps,nudge){                                 // a tenth answer: 0.1 of wiggle room
  const t=[];
  (traps||[]).forEach(([v,msg])=>{
    if(Math.abs(v-a)<=TOL){ if(msg!==PIKEY) throw new Error(label+': slip '+v+' passes as the answer '+a+' ('+msg+')'); return; }   // 3.14 that still lands close is not a slip
    if(Math.abs(v-a)<=TOL+0.06) throw new Error(label+': trap '+v+' sits too close to the answer '+a+' ('+msg+')');
    if(t.some(u=>Math.abs(u.near-v)<0.12)) return;               // two slips that land together: keep the first message
    t.push({near:v,tol:0.06,msg});});
  return {tool:'numeric',label,answer:a,tol:TOL,closeBand:0.03,traps:t,nudges:[nudge]};}
function exact(label,a,traps,nudge){                               // a whole number: exact
  const t=[];
  (traps||[]).forEach(([v,msg])=>{
    if(Math.abs(v-a)<0.5) throw new Error(label+': trap '+v+' equals the answer '+a);
    if(t.some(u=>u.near===v)) return;
    t.push({near:v,tol:0.005,msg});});
  return {tool:'numeric',label,answer:a,tol:0.005,closeBand:0.02,traps:t,nudges:[nudge]};}
function coarse(step,ladder){return Object.assign(step,{sub:ladder});}

/* ---- suggested-work HTML (trusted: built here) ---- */
const FR=(t,b)=>'<span class="fr"><span>'+t+'</span><span>'+b+'</span></span>';
/* colour code: a letter and every number that stands for it share one ink (l and r, w and d never meet) */
const INK={S:1,l:2,r:2,w:3,d:3,B:4,P:5,h:6};
const V=x=>'<i class="ink-'+INK[x]+'">'+x+'</i>';                 // the letter, in its ink
const N=(x,v)=>'<span class="ink-'+INK[x]+'">'+v+'</span>';        // a value of that letter, in the same ink
const S_=V('S'),P_=V('P'),B_=V('B'),h_=V('h'),r_=V('r'),l_=V('l'),w_=V('w'),d_=V('d');

const PIKEY='Use the '+PI_+' key, not 3.14. Type the whole line in one go.';
const UNDO_PLUS='Undo the + first: change sides, change signs. Multiplying first leaves it stuck.';

/* ---- box: S = Ph + 2B ---- */
const BOX={
  formula:'S = Ph + 2B',
  solved:'h = (S '+MI+' 2B) / P',
  slips:['h = S / P '+MI+' 2B','h = (S '+MI+' B) / P','h = (S + 2B) / P'],
  moves:[['Undo + 2B first: change sides, change signs. Which line is it?',['S '+MI+' 2B = Ph','S + 2B = Ph','S = Ph '+MI+' 2B'],'Change sides, change signs: + 2B on the right becomes '+MI+' 2B on the left.'],
         ['Now S '+MI+' 2B = Ph. Undo × P: multiply both sides by…',['1/P','P','1/2'],'h is multiplied by P. Its inverse is 1/P.']]};

/* ---- can: S = 2πrh + 2πr² ---- */
const CAN={
  formula:'S = 2'+PI_+'rh + 2'+PI_+'r'+SQ,
  solved:'h = (S '+MI+' 2'+PI_+'r'+SQ+') / (2'+PI_+'r)',
  slips:['h = S / (2'+PI_+'r) '+MI+' 2'+PI_+'r'+SQ,'h = (S '+MI+' '+PI_+'r'+SQ+') / (2'+PI_+'r)','h = (S + 2'+PI_+'r'+SQ+') / (2'+PI_+'r)'],
  moves:[['Undo + 2'+PI_+'r'+SQ+' first: change sides, change signs. Which line is it?',['S '+MI+' 2'+PI_+'r'+SQ+' = 2'+PI_+'rh','S + 2'+PI_+'r'+SQ+' = 2'+PI_+'rh','S = 2'+PI_+'rh '+MI+' 2'+PI_+'r'+SQ],'Change sides, change signs: + 2'+PI_+'r'+SQ+' on the right becomes '+MI+' 2'+PI_+'r'+SQ+' on the left.'],
         ['Now S '+MI+' 2'+PI_+'r'+SQ+' = 2'+PI_+'rh. Undo × 2'+PI_+'r: multiply both sides by…',['1/(2'+PI_+'r)','2'+PI_+'r','1/('+PI_+'r)'],'h is multiplied by 2'+PI_+'r. Its inverse is 1/(2'+PI_+'r).']]};

/* the "solve with letters" step (coarse tap) and its ladder: formula, each undo move, solved */
function solveStep(K,lbl){
  const opts=[K.solved].concat(K.slips);
  const ladder=K.moves.map(([ask,mo,nd])=>ch('Plan '+lbl+': Solve for h, letters only',ask,mo,0,nd))
    .concat([ch('Plan '+lbl+': Solved','So h = …',opts,0,'Put the two moves together: change sides, change signs, then the inverse.')]);
  return coarse(ch('Plan '+lbl+': Solve for h with letters','Before any numbers: h = …',opts,0,'Start from '+K.formula+'. '+UNDO_PLUS),ladder);
}
/* the answer step (step 6) and its ladder: substitute (tap), then the answer */
function answerStep(subs,ans,traps,unit,tenth){
  const ask=tenth?' (nearest tenth, in '+unit+')':' (in '+unit+')';
  const mk=lbl=>tenth?num(lbl,ans,traps,PIKEY):exact(lbl,ans,traps,'Type the whole line into the calculator in one go.');
  return coarse(mk('Plan 6: Substitute and answer. h = ?'+ask),
    [ch('Plan 6: Substitute','Put the numbers into your solved formula. Which is it?',subs,0,'Each number goes where its letter is.'),
     mk('Plan 6: Answer. Simplify with the calculator, one go. h = ?'+ask)]);
}

/* steps 1, 3, 4 on paper: a sketch with the facts and the unknown written on it */
function boxSketch(l,w,S,u){
  return '<svg class="wk-sketch" viewBox="0 0 330 150" width="330" height="150" role="img" aria-label="Sketch: a closed box, l = '+l+' '+u+', w = '+w+' '+u+', h unknown, S = '+S+' '+u+' squared">'+
    '<g fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" stroke-linecap="round">'+
    '<path d="M60 45 H180 V115 H60 Z"/><path d="M60 45 L100 18 H220 L180 45"/><path d="M180 115 L220 88 V18"/>'+
    '<path d="M60 115 L100 88 H220 M100 88 V18" stroke-dasharray="4 5" opacity=".45"/></g>'+
    '<g fill="currentColor" style="font-family:inherit" font-size="15">'+
    '<text class="ink-2" fill="currentColor" x="120" y="137" text-anchor="middle">l = '+l+' '+u+'</text><text class="ink-3" fill="currentColor" x="206" y="116">w = '+w+' '+u+'</text>'+
    '<text class="ink-6" fill="currentColor" x="52" y="85" text-anchor="end">h = ?</text>'+
    '<text class="ink-1" fill="currentColor" x="236" y="60">S = '+S+' '+u+'²</text></g></svg>';
}
function canSketch(r,S,u,width){
  const across=width?'<path d="M52 40 H148"/>':'<path d="M100 40 H148"/>';
  const lab=width?'<text class="ink-3" fill="currentColor" x="100" y="24" text-anchor="middle">d = '+width+' '+u+'</text>':'<text class="ink-2" fill="currentColor" x="124" y="24" text-anchor="middle">r = '+r+' '+u+'</text>';
  return '<svg class="wk-sketch" viewBox="0 0 330 140" width="330" height="140" role="img" aria-label="Sketch: a cylinder, '+(width?'d = '+width+' '+u+' across':'r = '+r+' '+u)+', h unknown, S = '+S+' '+u+' squared">'+
    '<g fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round">'+
    '<ellipse cx="100" cy="40" rx="48" ry="11"/><path d="M52 40 V118 M148 40 V118"/><path d="M52 118 A48 11 0 0 0 148 118"/>'+
    '<path d="M52 118 A48 11 0 0 1 148 118" stroke-dasharray="4 5" opacity=".45"/>'+across+'</g>'+
    (width?'':'<circle cx="100" cy="40" r="2.3" fill="currentColor"/>')+
    '<g fill="currentColor" style="font-family:inherit" font-size="15">'+lab+
    '<text class="ink-6" fill="currentColor" x="158" y="86">h = ?</text>'+
    '<text class="ink-1" fill="currentColor" x="220" y="86">S = '+S+' '+u+'²</text></g></svg>';
}
const BOXED=v=>'<span class="wk-box">'+v+'</span>';


/* ---- one box problem ---- */
function boxProb(o){
  const {id,numLbl,prompt,l,w,S,u,given}=o;
  const B=l*w, P=2*l+2*w, hx=(S-2*B)/P, tenth=!Number.isInteger(hx), ans=hx, aStr=tenth?f1(hx):String(hx);   // checked against the exact value
  const traps=[[(S-B)/P,'A closed box has two bases: '+MI+' 2B, not '+MI+' B.'],[(S-2*(l+w))/P,'B is an area: l '+DOT+' w, not l + w.'],
    [(S-2*P)/B,'B and P are switched. B is the area (l '+DOT+' w); P goes around (2l + 2w).'],[(S-2*B)/(l+w),'P goes all the way around: 2l + 2w.'],[S/P-2*B,UNDO_PLUS]];
  const sub=(a,b,c)=>'h = ('+a+' '+MI+' 2('+b+')) / '+c;
  const subs=[sub(S,B,P),'h = ('+S+' '+MI+' '+B+') / '+P,sub(S,P,B),'h = '+P+' / ('+S+' '+MI+' 2('+B+'))'];
  const back=P*Number(aStr)+2*B;
  const check=[{tag:'Check',l:S_,r:'= '+P_+h_+' + 2'+B_},{l:'',r:'= '+N('P',P)+'('+N('h',aStr)+') + 2('+N('B',B)+')'},
               {l:'',r:(back===S?'= '+N('S',back)+' ✓':'= '+N('S',back.toFixed(1))+', about '+N('S',S)+' ✓')}];
  return Object.assign({id,num:numLbl,prompt,given,want:'h, the height, in '+u,
    pipeline:[
      exact('Plan 5a: Find B, the area of the base. B = ? (in '+u+SQ+')',B,[[P,'That is P, the distance around. B is the area: l '+DOT+' w.'],[l+w,'B is an area: multiply, l '+DOT+' w.']],'B is the area of the base: B = lw.'),
      exact('Plan 5b: Find P, the distance around the base. P = ? (in '+u+')',P,[[B,'That is B, the area. P goes around: 2l + 2w.'],[l+w,'That is halfway around. P = 2l + 2w.']],'P is the distance around the base: P = 2l + 2w.'),
      solveStep(BOX,'5c'),
      answerStep(subs,ans,traps,u,tenth)]},
   {work:[
     {lines:[{tag:'1, 3, 4',h:boxSketch(l,w,S,u),fig:true}]},
     {lines:[
       {tag:'2',l:S_,r:'= '+P_+h_+' + 2'+B_},                    // free: it is in the Formula Box
       {tag:'5a',l:B_,r:'= '+l_+w_,at:[0]},{l:'',r:'= '+N('l',l)+' '+DOT+' '+N('w',w),at:[0]},{l:'',r:'= '+N('B',B),at:[0]},
       {tag:'5b',l:P_,r:'= 2'+l_+' + 2'+w_,at:[1]},{l:'',r:'= 2('+N('l',l)+') + 2('+N('w',w)+')',at:[1]},{l:'',r:'= '+N('P',P),at:[1]},
       {tag:'5c',l:S_+' '+MI+' 2'+B_,r:'= '+P_+h_,note:'change sides, change signs',at:[2,0]},
       {l:FR(S_+' '+MI+' 2'+B_,P_),r:'= '+h_,note:'× 1/P',at:[2]},
       {tag:'6',l:h_,r:'= '+FR(N('S',S)+' '+MI+' 2('+N('B',B)+')',N('P',P)),at:[3,0]},
       {l:'',r:(tenth?'≈ ':'= ')+BOXED(N('h',aStr+' '+u)),at:[3]}]}],
    workCheck:check},
   {_ans:aStr});
}

/* ---- one can problem (width: given the distance across instead of r) ---- */
function canProb(o){
  const {id,numLbl,prompt,r,S,u,given,width}=o;
  const hx=(S-2*PI*r*r)/(2*PI*r), ans=hx, aStr=f1(hx), rs=show(r);                  // checked against the exact value
  const traps=[[S/(2*PI*r),'2'+PI_+'r'+SQ+' never moved. '+UNDO_PLUS],[(S-PI*r*r)/(2*PI*r),'A can has two ends: 2'+PI_+'r'+SQ+', not '+PI_+'r'+SQ+'.'],
    [(S-2*PI*r)/(2*PI*r),'Power first: r'+SQ+' is r '+DOT+' r.'],[S/(2*PI*r)-2*PI*r*r,UNDO_PLUS],[(S-2*3.14*r*r)/(2*3.14*r),PIKEY]];
  if(width) traps.unshift([(S-2*PI*width*width)/(2*PI*width),width+' '+u+' is d, all the way across. d = 2r, so r = d/2.']);
  const subs=['h = ('+S+' '+MI+' 2'+PI_+'('+rs+SQ+')) / (2'+PI_+'('+rs+'))','h = ('+S+' '+MI+' '+PI_+'('+rs+SQ+')) / (2'+PI_+'('+rs+'))',
    'h = '+S+' / (2'+PI_+'('+rs+'))','h = ('+S+' '+MI+' 2'+PI_+'('+rs+')) / (2'+PI_+'('+rs+SQ+'))'];
  const back=2*PI*r*Number(aStr)+2*PI*r*r;
  const check=[{tag:'Check',l:S_,r:'= 2'+PI_+r_+h_+' + 2'+PI_+r_+SQ},{l:'',r:'= 2'+PI_+'('+N('r',rs)+')('+N('h',aStr)+') + 2'+PI_+'('+N('r',rs)+SQ+')'},
               {l:'',r:'≈ '+N('S',back.toFixed(1))+', about '+N('S',S)+' ✓'}];
  const k=width?1:0;                                          // pipeline index of the letters step
  const pipeline=(width?[exact('Plan 5a: Find r. r = ? (in '+u+')',r,[[width,width+' '+u+' is d, all the way across. d = 2r, so r = d/2.'],[2*width,'d = 2r: undo × 2 with × 1/2, not × 2.']],'Write d = 2r, then solve it for r.')]:[])
    .concat([solveStep(CAN,width?'5b':'5'),answerStep(subs,ans,traps,u,true)]);
  const n5=width?'5b':'5';
  const workCan=[{lines:[{tag:'1, 3, 4',h:canSketch(rs,S,u,width),fig:true}]},{lines:[
    {tag:'2',l:S_,r:'= 2'+PI_+r_+h_+' + 2'+PI_+r_+SQ}].concat(          // free: it is in the Formula Box
    width?[{tag:'5a',l:d_,r:'= 2'+r_,at:[0]},{l:FR(d_,'2'),r:'= '+r_,note:'× 1/2',at:[0]},
           {l:r_,r:'= '+FR(N('d',width),'2'),at:[0]},{l:'',r:'= '+N('r',rs),at:[0]}]:[],[
    {tag:n5,l:S_+' '+MI+' 2'+PI_+r_+SQ,r:'= 2'+PI_+r_+h_,note:'change sides, change signs',at:[k,0]},
    {l:FR(S_+' '+MI+' 2'+PI_+r_+SQ,'2'+PI_+r_),r:'= '+h_,note:'× 1/(2'+PI_+'r)',at:[k]},
    {tag:'6',l:h_,r:'= '+FR(N('S',S)+' '+MI+' 2'+PI_+'('+N('r',rs)+SQ+')','2'+PI_+'('+N('r',rs)+')'),at:[k+1,0]},
    {l:'',r:'≈ '+BOXED(N('h',aStr+' '+u)),at:[k+1]}])}];
  return {id,num:numLbl,prompt,given,want:'h, the height, in '+u,pipeline,work:workCan,workCheck:check,_ans:aStr};
}

const P=[
 boxProb({id:'t1',numLbl:'T-1',l:6,w:4,S:228,u:'cm',
   prompt:'A closed box has a 6 cm by 4 cm base. Its surface area is 228 cm². How tall is it?',
   given:[{v:'228 cm²',k:'surface area S'},{v:'6 cm by 4 cm',k:'the base'}]}),
 canProb({id:'t2',numLbl:'T-2',r:5,S:400,u:'cm',
   prompt:'A can is made from 400 cm² of metal, top and bottom included. Its radius is 5 cm. How tall is it, to the nearest tenth?',
   given:[{v:'400 cm²',k:'surface area S'},{v:'5 cm',k:'the radius r'}]}),
 boxProb({id:'t3',numLbl:'T-3',l:5,w:5,S:170,u:'cm',
   prompt:'A closed box has a square base, 5 cm on each side. Its surface area is 170 cm². How tall is it?',
   given:[{v:'170 cm²',k:'surface area S'},{v:'5 cm',k:'each side of the square base'}]}),
 canProb({id:'t4',numLbl:'T-4',r:3,S:250,u:'cm',
   prompt:'A can is made from 250 cm² of metal, top and bottom included. Its radius is 3 cm. How tall is it, to the nearest tenth?',
   given:[{v:'250 cm²',k:'surface area S'},{v:'3 cm',k:'the radius r'}]}),
 boxProb({id:'a1',numLbl:'A-1',l:8,w:3,S:230,u:'cm',
   prompt:'A closed gift box is made from 230 cm² of cardboard. Its base is 8 cm by 3 cm. How tall is it, to the nearest tenth?',
   given:[{v:'230 cm²',k:'cardboard: S'},{v:'8 cm by 3 cm',k:'the base'}]}),
 canProb({id:'a2',numLbl:'A-2',r:5,width:10,S:350,u:'cm',
   prompt:'A can is 10 cm across and is made from 350 cm² of metal, top and bottom included. How tall is it, to the nearest tenth?',
   given:[{v:'350 cm²',k:'surface area S'},{v:'10 cm across',k:'the width of the can'}]}),
 boxProb({id:'a3',numLbl:'A-3',l:6,w:6,S:336,u:'in',
   prompt:'A closed box with a square base, 6 in on each side, is wrapped in 336 in² of paper with no overlap. How tall is it?',
   given:[{v:'336 in²',k:'paper: S'},{v:'6 in',k:'each side of the square base'}]}),
 canProb({id:'a4',numLbl:'A-4',r:1.5,S:40,u:'m',
   prompt:'A water tank shaped like a cylinder has a radius of 1.5 m. It takes 40 m² of sheet metal, top and bottom included. How tall is it, to the nearest tenth?',
   given:[{v:'40 m²',k:'sheet metal: S'},{v:'1.5 m',k:'the radius r'}]})];

/* ---- build-time guards ---- */
const ANSWERS=P.map(p=>[p.id,p._ans]); P.forEach(p=>delete p._ans);
// printed Week 7 answers (handouts, recall card, study guide, final): no repeats, whole or tenth
const TAKEN=['3.6','9.0','10.6','9.5','5.1','14.3','11.9','11.5','4.0','5.6','13.9','7.9','5.0','4.2','5','8','7','10'];
ANSWERS.forEach(([id,a])=>{ if(TAKEN.includes(a)) throw new Error(id+': '+a+' is already a printed Week 7 answer'); });
P.forEach(p=>{
  const walk=s=>{
    if(s.tool==='numeric') s.traps.forEach(t=>{ if(Math.abs(t.near-s.answer)<=s.tol+t.tol) throw new Error(p.id+': trap '+t.near+' overlaps the answer in '+s.label); });
    (s.sub||[]).forEach(walk);};
  p.pipeline.forEach(walk);
  // every work gate points at a real step or rung
  p.work.forEach(g=>(g.cols?[].concat(...g.cols):g.lines).map(L=>L.at).forEach(at=>{ if(!at) return;
    const st=p.pipeline[at[0]]; if(!st) throw new Error(p.id+': work gate '+at+' has no step');
    if(at.length>1 && !(st.sub && st.sub[at[1]])) throw new Error(p.id+': work gate '+at+' has no rung'); }));
});
P.forEach(p=>p.work.concat([{lines:p.workCheck}]).forEach(g=>(g.cols?[].concat(...g.cols):g.lines).forEach(L=>{
  if(L.r==null) return; const rel=(L.r.replace(/<[^>]*>/g,'').match(/[=≈]/g)||[]).length;
  if(rel!==1) throw new Error(p.id+': a work line chains '+rel+' relations (hang them, one per line): '+L.r); })));
const txt=JSON.stringify(P);
['subtract','divide'].forEach(wd=>{ if(new RegExp('\\b'+wd,'i').test(txt)) throw new Error('uses "'+wd+'"'); });

const REF='<div class="ref-row"><div class="ref-cell"><div class="rc-t">★ SG-4 Prism</div><div class="rc-s" style="font-size:.85rem">S = Ph + 2B</div></div>'+
 '<div class="ref-cell"><div class="rc-t">★ SG-4 Cylinder</div><div class="rc-s" style="font-size:.85rem">S = 2'+PI_+'rh + 2'+PI_+'r'+SQ+'</div></div></div>'+
 '<div class="ref-row" style="margin-top:8px"><div class="ref-cell"><div class="rc-t">★ SG-3 Undo moves</div><div class="rc-s" style="font-size:.78rem">+ a: change sides, change signs<br>× a: multiply by 1/a</div></div>'+
 '<div class="ref-cell"><div class="rc-t">A box base</div><div class="rc-s" style="font-size:.78rem">B = lw (area)<br>P = 2l + 2w (around)</div></div></div>'+
 '<div class="ref-row" style="margin-top:8px"><div class="ref-cell"><div class="rc-t">Covers or fills?</div><div class="rc-s" style="font-size:.78rem">covers: S, in cm'+SQ+' &nbsp;'+DOT+'&nbsp; fills: V, in cm³</div></div>'+
 '<div class="ref-cell"><div class="rc-t">All the way across</div><div class="rc-s" style="font-size:.78rem">d = 2r &nbsp;'+DOT+'&nbsp; so d/2 = r</div></div></div>'+
 '<div class="ref-note">The Plan: 1 read and sketch '+DOT+' 2 write the formula '+DOT+' 3 name the unknown '+DOT+' 4 facts as math '+DOT+
 ' 5 find in-between numbers first (5a, 5b), then solve for h with letters only '+DOT+' 6 reiterate, substitute, answer: the calculator once, typed just as it looks. Type decimals like 7.7.</div>';

const page=`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Week 7, Lesson 2 — Surface Area: Solving for the Height Checker</title>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&family=Kalam:wght@400;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../assets/styles.css">
</head>
<body>
<header class="hdr">
  <div class="hdr-left"><a class="hdr-back" href="../index.html">&larr; All Checkers</a><h1>Surface Area: Solving for the Height</h1><div class="sub">Week 7 · Lesson 2 — Learning Lab</div></div>
  <div class="hdr-dots" id="hdrDots"></div>
</header>
<main class="main wide" id="main"><noscript><p>This checker needs JavaScript. Work the Learning Lab on paper and check with your teacher.</p></noscript></main>

<script src="../js/checker-kit.js"></script>
<script>
/* Week 7 Lesson 2 Learning Lab. Work shell: suggested work on the left fills in as each step
   is checked; the question is on the right; the f button opens the Formula Box. Box: 5a B,
   5b P, 5c solve with letters, 6 answer. Can: 5 solve with letters, 6 answer. A miss opens
   the Plan one move at a time. Answers to the nearest tenth (tol 0.1). Choice answers are
   djb2 hashes. */
K.run(${JSON.stringify(P,null,1)}, { layout:'work', reference:${JSON.stringify(REF)} });
</script>
</body>
</html>
`;
fs.writeFileSync('checkers/week7-lesson2-surface-area.html',page);
console.log('ok',page.length,JSON.stringify(ANSWERS));

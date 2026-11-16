/* Week 7 Lesson 1 checker (Volume: Solving Formulas for a Letter). Follows the handout's
   letters-first plan: write the formula, name the unknown, solve for it with letters only
   (SG-3 undo moves: × a → × 1/a; × 1/3 → × 3; a square → square root), then substitute.
   SG-1 prism V = Bh, cylinder V = πr²h; SG-2 pyramid V = (1/3)Bh, cone V = (1/3)πr²h.
   Two coarse steps per problem:
   1. the solved formula (tap it). A miss opens the Plan: which formula, then each undo move.
   2. the number (type it, nearest hundredth). A miss opens the Plan: substitute (tap),
      the pieces, then the calculator.
   Easy to hard: T-1..T-4 together, A-1..A-4 alone (a pyramid, a width instead of a radius,
   liters, a cone solved for r). Every formula option that is wrong is a named slip; every
   numeric trap is a named slip (no × 3, × 1/3 again, the width as r, no square root, 3.14).
   Wiggle room (Nov 16, after class feedback): the final answer passes within 0.015 of the exact
   value, so a hundredth that is one off from rounding a middle step (50.3 for 16π) or from 3.14
   still passes; an answer given only to the tenth gets "two digits after the point." The middle
   steps in a ladder (16π ≈ ?, the inside of a root) pass within 0.05, so one decimal is enough,
   and their labels say so. Whole-number steps stay exact. The build stops if a trap lands on its
   answer, two traps share a value, options repeat, or a number collides with the handout,
   the recall card, or the final.
   Run: node build_w7l1.js  -> checkers/week7-lesson1-volume.html */
const fs=require('fs');
function djb2(s){var v=5381;for(var i=0;i<s.length;i++){v=((v<<5)+v)+s.charCodeAt(i);v=v&v;}return v>>>0;}
const DOT='·',STAR='★',PI_='π',SQ='²',RT='√',THIRD='(1/3)';
const PI=Math.PI, r2=x=>Math.round(x*100)/100, f2=x=>r2(x).toFixed(2);
const TOL=0.015, PIECE_TOL=0.05;

function ch(label,ask,opts,i,nudge){
  if(new Set(opts).size!==opts.length) throw new Error(label+': duplicate options '+opts.join(' | '));
  return {tool:'choice',stack:true,label,ask,options:opts,ch:djb2(opts[i]),shuffle:true,nudges:[nudge]};}
function num(label,a,traps,nudge){
  const t=[];
  (traps||[]).forEach(([v,msg])=>{
    if(f2(v)===f2(a)){ if(msg!==PIKEY) throw new Error(label+': slip '+v+' rounds to the answer '+f2(a)+' ('+msg+')'); return; }   // 3.14 that still rounds right is not a slip
    if(Math.abs(v-a)<=TOL*2) throw new Error(label+': trap '+v+' sits on the answer '+a+' ('+msg+')');
    if(t.some(u=>Math.abs(u.near-v)<0.01)) return;              // two slips that land together: keep the first message
    t.push({near:v,tol:0.006,msg});});
  const tenth=Math.round(a*10)/10;                                   // answered to the tenth only
  if(Math.abs(tenth-a)>TOL&&!t.some(u=>Math.abs(u.near-tenth)<0.02)) t.push({near:tenth,tol:0.001,msg:'Close: give two digits after the point (the nearest hundredth).'});
  return {tool:'numeric',label,answer:a,tol:TOL,closeBand:0.01,traps:t,nudges:[nudge]};}
/* a middle step in a ladder: one decimal is enough; whole numbers stay exact */
function piece(label,a,nudge){
  const whole=Number.isInteger(a);
  return {tool:'numeric',label:whole?label:label+' (one decimal is enough)',answer:a,tol:whole?0.005:PIECE_TOL,closeBand:0.02,traps:[],nudges:[nudge]};}
function coarse(step,ladder){return Object.assign(step,{sub:ladder});}

const ONE='One undo move per row. Undo the last thing done to the unknown first.';
const PIKEY='Use the '+PI_+' key, not 3.14. Keep the whole number in the calculator until the end.';

/* ---- the solids: formula text, solved forms, slips ---- */
const F={
 cyl:{name:'cylinder',formula:'V = '+PI_+'r'+SQ+'h',
   h:{solved:'h = V / ('+PI_+'r'+SQ+')',slips:['h = V '+DOT+' '+PI_+'r'+SQ,'h = '+PI_+'r'+SQ+' / V','h = V / (2'+PI_+'r)'],
      moves:[['Undo × '+PI_+'r'+SQ+': multiply both sides by…',['1/('+PI_+'r'+SQ+')',PI_+'r'+SQ,'1/'+PI_],'h is multiplied by '+PI_+'r'+SQ+'. Its inverse is 1/('+PI_+'r'+SQ+').']]},
   r:{solved:'r = '+RT+'(V / ('+PI_+'h))',slips:['r = V / ('+PI_+'h)','r = '+RT+'(V '+DOT+' '+PI_+'h)','r = (V / ('+PI_+'h)) / 2'],
      moves:[['Undo × '+PI_+'h: multiply both sides by…',['1/('+PI_+'h)',PI_+'h','1/h'],'r'+SQ+' is multiplied by '+PI_+' and by h. Undo both at once: 1/('+PI_+'h).'],
             ['Now r'+SQ+' = V / ('+PI_+'h). Undo the square:',['take the square root','multiply by 1/2','multiply by 2'],'A square is undone by a square root, not by halving.']]}},
 cone:{name:'cone',formula:'V = '+THIRD+PI_+'r'+SQ+'h',
   h:{solved:'h = 3V / ('+PI_+'r'+SQ+')',slips:['h = V / ('+PI_+'r'+SQ+')','h = V / (3'+PI_+'r'+SQ+')','h = 3'+PI_+'r'+SQ+' / V'],
      moves:[['Undo × 1/3: multiply both sides by…',['3','1/3','1/'+PI_],'To undo × 1/3, multiply by 3. Multiplying by 1/3 again makes it smaller twice.'],
             ['Now 3V = '+PI_+'r'+SQ+'h. Undo × '+PI_+'r'+SQ+': multiply both sides by…',['1/('+PI_+'r'+SQ+')',PI_+'r'+SQ,'3'],'h is multiplied by '+PI_+'r'+SQ+'. Its inverse is 1/('+PI_+'r'+SQ+').']]},
   r:{solved:'r = '+RT+'(3V / ('+PI_+'h))',slips:['r = '+RT+'(V / ('+PI_+'h))','r = 3V / ('+PI_+'h)','r = '+RT+'(V / (3'+PI_+'h))'],
      moves:[['Undo × 1/3: multiply both sides by…',['3','1/3','1/h'],'To undo × 1/3, multiply by 3.'],
             ['Now 3V = '+PI_+'r'+SQ+'h. Undo × '+PI_+'h: multiply both sides by…',['1/('+PI_+'h)',PI_+'h','1/'+PI_],'r'+SQ+' is multiplied by '+PI_+' and by h. Undo both: 1/('+PI_+'h).'],
             ['Now r'+SQ+' = 3V / ('+PI_+'h). Undo the square:',['take the square root','multiply by 1/2','multiply by 2'],'A square is undone by a square root.']]}},
 prism:{name:'prism (box)',formula:'V = Bh',
   h:{solved:'h = V / B',slips:['h = V '+DOT+' B','h = B / V','h = 3V / B'],
      moves:[['Undo × B: multiply both sides by…',['1/B','B','3'],'h is multiplied by B. Its inverse is 1/B.']]}},
 pyr:{name:'pyramid',formula:'V = '+THIRD+'Bh',
   h:{solved:'h = 3V / B',slips:['h = V / B','h = V / (3B)','h = 3B / V'],
      moves:[['Undo × 1/3: multiply both sides by…',['3','1/3','1/B'],'To undo × 1/3, multiply by 3.'],
             ['Now 3V = Bh. Undo × B: multiply both sides by…',['1/B','B','3'],'h is multiplied by B. Its inverse is 1/B.']]}}};
const FORMULAS=['V = Bh','V = '+PI_+'r'+SQ+'h','V = '+THIRD+'Bh','V = '+THIRD+PI_+'r'+SQ+'h'];
const PICK_NUDGE='Same slice all the way up (box, can): V = Bh or '+PI_+'r'+SQ+'h. Comes to a point (pyramid, cone): the (1/3) versions.';

/* one problem: solid k, unknown u ('h' or 'r'), the numbers, and the slips for step 2 */
function prob(o){
  const {id,numLbl,prompt,given,want,k,u,ans,subs,pieces,traps,unit}=o, S=F[k][u];
  const opts=[S.solved].concat(S.slips);
  const ladder1=[ch('Plan 2: Write the formula','Which formula fits a '+F[k].name+'?',FORMULAS,FORMULAS.indexOf(F[k].formula),PICK_NUDGE)]
    .concat(S.moves.map(([ask,mo,nd])=>ch('Plan 5: Solve for '+u+', letters only',ask,mo,0,nd)))
    .concat([ch('Plan 5: Solved','So '+u+' = …',opts,0,'Put the moves together. '+ONE)]);
  const ladder2=[ch('Plan 6: Substitute','Put the numbers in. Which is it?',subs,0,'Each number goes where its letter is. '+(u==='h'?'V is what it holds.':'h is how tall.'))]
    .concat(pieces.map(([lbl,val,nd])=>piece('Plan 6: '+lbl,val,nd)))
    .concat([num('Plan 6: Calculator. '+u+' ≈ ? (nearest hundredth)',ans,traps,PIKEY)]);
  return {id,num:numLbl,prompt,given,want,reference:REF,
    pipeline:[coarse(ch('Plan 5: Solve for '+u+' with letters','Before any numbers: '+u+' = …',opts,0,'Start from '+F[k].formula+'. '+ONE),ladder1),
              coarse(num('Plan 6: Substitute and solve. '+u+' ≈ ? (nearest hundredth'+(unit?', in '+unit:'')+')',ans,traps,'Put the numbers into your solved formula. '+PIKEY),ladder2)],
    _ans:f2(ans)};
}

const REF='<div class="surf-label">Formula Box — stays on screen</div>'+
 '<div class="ref-row"><div class="ref-cell"><div class="rc-t">'+STAR+' SG-1 Prism; cylinder</div><div class="rc-s">V = Bh; &nbsp; V = '+PI_+'r'+SQ+'h</div></div>'+
 '<div class="ref-cell"><div class="rc-t">'+STAR+' SG-2 Pyramid; cone</div><div class="rc-s">V = '+THIRD+'Bh; &nbsp; V = '+THIRD+PI_+'r'+SQ+'h</div></div></div>'+
 '<div class="ref-row" style="margin-top:8px"><div class="ref-cell"><div class="rc-t">'+STAR+' SG-3 The undo moves</div><div class="rc-s">× a: multiply by 1/a &nbsp;'+DOT+'&nbsp; × 1/3: multiply by 3<br>a square: take the square root</div></div>'+
 '<div class="ref-cell"><div class="rc-t">Units</div><div class="rc-s">1 L = 1000 cm³ &nbsp;'+DOT+'&nbsp; across (width) = 2r<br>B is an area: for a box, B = length '+DOT+' width</div></div></div>'+
 '<div class="ref-note">Plan, letters first: 1 read and sketch '+DOT+' 2 write the formula '+DOT+' 3 name the unknown '+DOT+' 4 facts as math '+DOT+' 5 solve for the unknown, letters only '+DOT+' 6 substitute, calculator once, check. Type decimals like 12.34.</div>';

const cylH=(V,r,p=PI)=>V/(p*r*r), coneH=(V,r,p=PI)=>3*V/(p*r*r), cylR=(V,h,p=PI)=>Math.sqrt(V/(p*h)), coneR=(V,h,p=PI)=>Math.sqrt(3*V/(p*h));
const T314=(f,...a)=>f(...a,3.14);                                          // the same formula with 3.14 in place of pi
const P=[];

/* T-1: cylinder, solve for h */
{const V=500,r=4,a=cylH(V,r);
 P.push(prob({id:'t1',numLbl:'T-1',k:'cyl',u:'h',ans:a,unit:'cm',
  prompt:'A can holds 500 cm³. Its radius is 4 cm. How tall is it, to the nearest hundredth?',
  given:[{v:'500 cm³',k:'what it holds: V'},{v:'4 cm',k:'the radius r'}],want:'h, the height',
  subs:['h = 500 / ('+PI_+' '+DOT+' 4'+SQ+')','h = 4 / ('+PI_+' '+DOT+' 500'+SQ+')','h = 500 '+DOT+' '+PI_+' '+DOT+' 4'+SQ],
  pieces:[['The bottom: '+PI_+' '+DOT+' 4'+SQ+' = 16'+PI_+' ≈ ?',16*PI,'Power first: 4'+SQ+' = 16. Then times '+PI_+'.']],
  traps:[[T314(cylH,V,r),PIKEY],[V/(PI*4*2),'4'+SQ+' is 4 '+DOT+' 4 = 16, not 4 '+DOT+' 2.'],[V*PI*16,'Undo × '+PI_+'r'+SQ+' by multiplying by 1/('+PI_+'r'+SQ+'), not by '+PI_+'r'+SQ+'.']]}));}

/* T-2: box, solve for h */
{const V=360,l=8,w=5,B=l*w,a=V/B;
 P.push(prob({id:'t2',numLbl:'T-2',k:'prism',u:'h',ans:a,unit:'cm',
  prompt:'A box holds 360 cm³. Its base is 8 cm by 5 cm. How tall is it?',
  given:[{v:'360 cm³',k:'what it holds: V'},{v:'8 cm by 5 cm',k:'the base'}],want:'h, the height',
  subs:['h = 360 / 40','h = 40 / 360','h = 360 / 13'],
  pieces:[['B = 8 '+DOT+' 5 = ?',B,'B is the area of the base: length times width.']],
  traps:[[V/(l+w),'B is an area: 8 '+DOT+' 5, not 8 + 5.'],[V/(2*l+2*w),'B is the area of the base, not the distance around it.']]}));}

/* T-3: cone, solve for h */
{const V=80,r=3,a=coneH(V,r);
 P.push(prob({id:'t3',numLbl:'T-3',k:'cone',u:'h',ans:a,unit:'cm',
  prompt:'A cone-shaped cup holds 80 cm³. Its radius is 3 cm. How tall is it, to the nearest hundredth?',
  given:[{v:'80 cm³',k:'what it holds: V'},{v:'3 cm',k:'the radius r'}],want:'h, the height',
  subs:['h = 3 '+DOT+' 80 / ('+PI_+' '+DOT+' 3'+SQ+')','h = 80 / (3 '+DOT+' '+PI_+' '+DOT+' 3'+SQ+')','h = 3 '+DOT+' 3'+SQ+' / ('+PI_+' '+DOT+' 80)'],
  pieces:[['The top: 3 '+DOT+' 80 = ?',240,'Undoing the 1/3 put a 3 on V.'],['The bottom: '+PI_+' '+DOT+' 3'+SQ+' = 9'+PI_+' ≈ ?',9*PI,'Power first: 3'+SQ+' = 9.']],
  traps:[[cylH(V,r),'You skipped the × 3 that undoes the 1/3.'],[V/(3*PI*9),'To undo × 1/3, multiply by 3, not by 1/3.'],[T314(coneH,V,r),PIKEY]]}));}

/* T-4: cylinder, solve for r */
{const V=750,h=12,a=cylR(V,h);
 P.push(prob({id:'t4',numLbl:'T-4',k:'cyl',u:'r',ans:a,unit:'cm',
  prompt:'A can is 12 cm tall and holds 750 cm³. What is its radius, to the nearest hundredth?',
  given:[{v:'750 cm³',k:'what it holds: V'},{v:'12 cm',k:'the height h'}],want:'r, the radius',
  subs:['r = '+RT+'(750 / ('+PI_+' '+DOT+' 12))','r = '+RT+'(12 / ('+PI_+' '+DOT+' 750))','r = 750 / ('+PI_+' '+DOT+' 12)'],
  pieces:[['The inside: 750 / (12'+PI_+') ≈ ? (that is r'+SQ+')',V/(PI*h),'Work out the inside of the root first.']],
  traps:[[V/(PI*h),'That is r'+SQ+'. Take its square root.'],[V/(PI*h)/2,'A square is undone by a square root, not by halving.'],[T314(cylR,V,h),PIKEY]]}));}

/* A-1: square pyramid, solve for h */
{const V=96,s=6,B=s*s,a=3*V/B;
 P.push(prob({id:'a1',numLbl:'A-1',k:'pyr',u:'h',ans:a,unit:'cm',
  prompt:'A pyramid with a square base 6 cm on each side holds 96 cm³. How tall is it?',
  given:[{v:'96 cm³',k:'what it holds: V'},{v:'6 cm',k:'each side of the square base'}],want:'h, the height',
  subs:['h = 3 '+DOT+' 96 / 36','h = 96 / 36','h = 3 '+DOT+' 96 / 6'],
  pieces:[['B = 6 '+DOT+' 6 = ?',B,'B is the area of the square base.'],['The top: 3 '+DOT+' 96 = ?',3*V,'Undoing the 1/3 put a 3 on V.']],
  traps:[[V/B,'You skipped the × 3 that undoes the 1/3.'],[3*V/s,'B is the area of the base: 6 '+DOT+' 6, not 6.'],[3*V/(4*s),'B is the area of the base, not the distance around it.']]}));}

/* A-2: cone given its width, solve for h */
{const V=200,wid=10,r=wid/2,a=coneH(V,r);
 P.push(prob({id:'a2',numLbl:'A-2',k:'cone',u:'h',ans:a,unit:'cm',
  prompt:'A cone-shaped funnel is 10 cm across at the top and holds 200 cm³. How deep is it, to the nearest hundredth?',
  given:[{v:'200 cm³',k:'what it holds: V'},{v:'10 cm across',k:'the width of the top'}],want:'h, the depth',
  subs:['h = 3 '+DOT+' 200 / ('+PI_+' '+DOT+' 5'+SQ+')','h = 3 '+DOT+' 200 / ('+PI_+' '+DOT+' 10'+SQ+')','h = 200 / ('+PI_+' '+DOT+' 5'+SQ+')'],
  pieces:[['r = 10 '+DOT+' 1/2 = ?',r,'Across is the whole width. The radius is half of it.'],['The bottom: '+PI_+' '+DOT+' 5'+SQ+' = 25'+PI_+' ≈ ?',25*PI,'Power first: 5'+SQ+' = 25.']],
  traps:[[coneH(V,wid),'10 cm is the whole width. Use r = 10 '+DOT+' 1/2 = 5.'],[cylH(V,r),'You skipped the × 3 that undoes the 1/3.'],[T314(coneH,V,r),PIKEY]]}));}

/* A-3: cylinder holding 1 liter, solve for r */
{const V=1000,h=15,a=cylR(V,h);
 P.push(prob({id:'a3',numLbl:'A-3',k:'cyl',u:'r',ans:a,unit:'cm',
  prompt:'A bottle shaped like a cylinder is 15 cm tall and holds 1 liter. What is its radius, to the nearest hundredth? (1 L = 1000 cm³)',
  given:[{v:'1 liter',k:'what it holds'},{v:'15 cm',k:'the height h'}],want:'r, the radius, in cm',
  subs:['r = '+RT+'(1000 / ('+PI_+' '+DOT+' 15))','r = '+RT+'(1 / ('+PI_+' '+DOT+' 15))','r = 1000 / ('+PI_+' '+DOT+' 15)'],
  pieces:[['V in cm³ = ?',V,'1 L = 1000 cm³.'],['The inside: 1000 / (15'+PI_+') ≈ ? (that is r'+SQ+')',V/(PI*h),'Work out the inside of the root first.']],
  traps:[[V/(PI*h),'That is r'+SQ+'. Take its square root.'],[cylR(1,h),'Change 1 L to 1000 cm³ first.'],[T314(cylR,V,h),PIKEY]]}));}

/* A-4: cone-shaped pile, solve for r */
{const V=6,h=2,a=coneR(V,h);
 P.push(prob({id:'a4',numLbl:'A-4',k:'cone',u:'r',ans:a,unit:'m',
  prompt:'A cone-shaped pile of gravel is 2 m tall and holds 6 m³. What is the radius of its base, to the nearest hundredth?',
  given:[{v:'6 m³',k:'what it holds: V'},{v:'2 m',k:'the height h'}],want:'r, the radius, in m',
  subs:['r = '+RT+'(3 '+DOT+' 6 / ('+PI_+' '+DOT+' 2))','r = '+RT+'(6 / ('+PI_+' '+DOT+' 2))','r = '+RT+'(3 '+DOT+' 2 / ('+PI_+' '+DOT+' 6))'],
  pieces:[['The inside: 3 '+DOT+' 6 / (2'+PI_+') ≈ ? (that is r'+SQ+')',3*V/(PI*h),'Top: 3 '+DOT+' 6 = 18. Bottom: 2'+PI_+'.']],
  traps:[[cylR(V,h),'You skipped the × 3 that undoes the 1/3.'],[3*V/(PI*h),'That is r'+SQ+'. Take its square root.'],[T314(coneR,V,h),PIKEY]]}));}

/* ---- build-time guards ---- */
const ANSWERS=P.map(p=>[p.id,p._ans]); P.forEach(p=>delete p._ans);
const TAKEN=['3.57','8.95','10.61','9.55','5.09','14.32','11.94','11.46','3.99','5.64','4.96','5.96','7.94','4.23'];   // handout, recall card, final, study guide
ANSWERS.forEach(([id,a])=>{ if(TAKEN.includes(a)) throw new Error(id+': '+a+' is already used in a printed Week 7 item'); });
P.forEach(p=>{const walk=s=>{
  if(s.tool==='numeric'){ if(Math.abs(r2(s.answer)-s.answer)>=0.005) throw new Error(p.id+': rounding edge in '+s.label);
    s.traps.forEach(t=>{ if(Math.abs(t.near-s.answer)<=s.tol+t.tol) throw new Error(p.id+': trap '+t.near+' overlaps the wiggle room in '+s.label); }); }
  (s.sub||[]).forEach(walk);};p.pipeline.forEach(walk);});

const page=`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Week 7, Lesson 1 — Volume: Solving Formulas for a Letter Checker</title>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../assets/styles.css">
</head>
<body>
<header class="hdr">
  <div class="hdr-left"><a class="hdr-back" href="../index.html">&larr; All Checkers</a><h1>Volume: Solving Formulas for a Letter</h1><div class="sub">Week 7 · Lesson 1 — Learning Lab</div></div>
  <div class="hdr-dots" id="hdrDots"></div>
</header>
<main class="main wide" id="main"><noscript><p>This checker needs JavaScript. Work the Learning Lab on paper and check with your teacher.</p></noscript></main>

<script src="../js/checker-kit.js"></script>
<script>
/* Week 7 Lesson 1 Learning Lab. Split layout, coarse first, letters first:
   step 1 taps the solved formula, step 2 types the number. A miss opens the
   Problem-Solving Plan one move at a time. Answers to the nearest hundredth
   (tol 0.015; middle steps 0.05). Choice answers are djb2 hashes. */
K.run(${JSON.stringify(P,null,1)}, { layout:'split' });
</script>
</body>
</html>
`;
fs.writeFileSync('checkers/week7-lesson1-volume.html',page);
console.log('ok',page.length,JSON.stringify(ANSWERS));

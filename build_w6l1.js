/* Week 6 Lesson 1 checker (Slopes of Parallel and Perpendicular Lines). Follows the
   handout: slope is m = Δy/Δx with Δx := x2 − x1 and Δy := y2 − y1; from standard form
   Ax + By = C the slope is −A/B and b = C/B (C only moves the intercept); SG-1 parallel
   m∥ = m; SG-2 perpendicular m⊥ = −1/m (the slopes multiply to −1); SG-3 point-slope
   y − y1 = m(x − x1), then change sides, change signs.
   Two kinds of problem, both coarse first:
   - classify: tap parallel / perpendicular / neither / the same line. A miss opens the
     Plan: each slope, the parallel test, then the b compare (equal slopes) or the
     product (unequal slopes), then the answer.
   - write a perpendicular line: type m⊥, then b. A miss opens the Plan for that number.
   Every number is exact (fractions). Traps are computed from the named mistakes, and the
   build stops if a trap equals its answer or two traps land on the same value.
   Run: node build_w6l1.js  -> checkers/week6-lesson1-par-perp.html */
const fs=require('fs');
function djb2(s){var v=5381;for(var i=0;i<s.length;i++){v=((v<<5)+v)+s.charCodeAt(i);v=v&v;}return v>>>0;}
const DOT='·',STAR='★',MI='−',PERP='m⊥',PAR='m∥';

/* exact fractions: [n, d], d > 0, lowest terms */
const gcd=(a,b)=>{a=Math.abs(a);b=Math.abs(b);while(b){[a,b]=[b,a%b];}return a;};
const Q=(n,d=1)=>{if(d===0)throw new Error('zero denominator');if(d<0){n=-n;d=-d;}const g=gcd(n,d)||1;return [n/g,d/g];};
const add=(a,b)=>Q(a[0]*b[1]+b[0]*a[1],a[1]*b[1]), mul=(a,b)=>Q(a[0]*b[0],a[1]*b[1]);
const neg=a=>Q(-a[0],a[1]), inv=a=>Q(a[1],a[0]), sub=(a,b)=>add(a,neg(b)), div=(a,b)=>mul(a,inv(b));
const eq=(a,b)=>a[0]===b[0]&&a[1]===b[1];
const S=a=>(a[0]<0?MI:'')+Math.abs(a[0])+(a[1]===1?'':'/'+a[1]);          // −3/2, 4
const P_=a=>a[1]===1?S(a):(a[0]<0?MI+'('+Math.abs(a[0])+'/'+a[1]+')':'('+a[0]+'/'+a[1]+')'); // −(3/2) for a coefficient
const mx=(m,b)=>{const c=eq(m,Q(1))?'':eq(m,Q(-1))?MI:P_(m);const t='y = '+c+'x';
  return b[0]===0?t:t+(b[0]<0?' '+MI+' '+S(neg(b)):' + '+S(b));};
const signed=v=>v<0?MI+' '+Math.abs(v):'+ '+v;                              // "+ 7", "− 3"

function ch(label,ask,opts,i,nudge){return {tool:'choice',stack:true,label,ask,options:opts,ch:djb2(opts[i]),shuffle:true,nudges:[nudge]};}
function frac(label,a,traps,nudge){
  const seen=[];(traps||[]).forEach(t=>{
    if(eq(t.f,a)) throw new Error(label+': trap equals the answer '+S(a)+' ('+t.msg+')');
    if(seen.some(s=>eq(s,t.f))) throw new Error(label+': two traps at '+S(t.f));
    seen.push(t.f);});
  label=label.replace(TYPE,''); if(!nudge.includes('hyphen')) nudge+=TYPE;   // keep labels short; the typing hint lives in the nudge and the Formula Box
  return {tool:'fraction',label,answer:a,traps:traps||[],nudges:[nudge]};}
function coarse(step,ladder){return Object.assign(step,{sub:ladder});}

const KINDS=['parallel','perpendicular','neither','the same line'];
const KIND_NUDGE='Equal slopes and a different b: parallel. Equal slopes and the same b: the same line. Slopes that multiply to '+MI+'1: perpendicular. Anything else: neither.';
const TYPE=' Type fractions like -3/2 (a hyphen for the minus).';
const ABQ='This line is in standard form, Ax + By = C. What are A and B?';
const AB_NUDGE='A is the number on x and B is the number on y, signs included. C is the number alone on the right.';

/* slope from standard form; traps for the usual slips */
function stdSlope(label,A,B,C){
  const m=Q(-A,B), t=[];
  const add1=(f,msg)=>{const g=Q(f[0],f[1]);if(!eq(g,m)&&!t.some(x=>eq(x.f,g)))t.push({f:g,msg});};
  add1(Q(A,B),'Keep the minus: m = '+MI+'A/B.'+(B<0?' (B is '+MI+Math.abs(B)+', so a negative over a negative comes out positive.)':''));
  add1(Q(-B,A),'That is '+MI+'B/A. The slope is '+MI+'A over B.');
  add1(Q(-A,C),'C only moves the intercept. The slope is '+MI+'A over B.');
  return {m,step:frac(label,m,t,'m = '+MI+'A/B. A rides with x, B rides with y.'+TYPE)};
}
/* slope from two points with Δ; traps for flipped and sign slips */
function ptSlope(label,p1,p2){
  const dx=p2[0]-p1[0], dy=p2[1]-p1[1], m=Q(dy,dx), t=[];
  const add1=(f,msg)=>{if(!eq(f,m)&&!t.some(x=>eq(x.f,f)))t.push({f,msg});};
  add1(Q(dx,dy),'That is Δx over Δy. Slope is Δy over Δx.');
  add1(neg(m),'Check the signs: Δy := y2 '+MI+' y1 and Δx := x2 '+MI+' x1, in the same order.');
  return {m,step:frac(label,m,t,'m = Δy/Δx, with Δx := x2 '+MI+' x1 and Δy := y2 '+MI+' y1.'+TYPE)};
}
/* classify two lines: L = {name, m:[n,d] or null, b, slopeRungs:[...]} */
function classify(o){
  const {id,numLbl,prompt,given,L1,L2}=o;
  const same=eq(L1.m,L2.m), prod=mul(L1.m,L2.m);
  const ans= same ? (eq(L1.b,L2.b)?'the same line':'parallel') : (eq(prod,Q(-1))?'perpendicular':'neither');
  const ladder=[].concat(L1.rungs,L2.rungs,[
    ch('Plan 5: Parallel test','Are the two slopes equal?',['yes','no'],same?0:1,'Compare '+(o.mNames||['m₁','m₂']).join(' and ')+' as numbers, signs included.')]);
  if(same){
    ladder.push(...(o.bRungs||[ch('Plan 5: Same slope','Same slope. Now compare b. Are the y-intercepts the same?',['no, they are different','yes, they are the same'],eq(L1.b,L2.b)?1:0,'b is the number added on the end of y = mx + b.')]));
  }else{
    const pt=[], add1=(f,msg)=>{if(!eq(f,prod)&&!pt.some(x=>eq(x.f,f)))pt.push({f,msg});};
    add1(neg(prod),'Watch the sign: multiply the signs too.');
    ladder.push(frac('Plan 5: Perpendicular test. '+(o.mNames||['m₁','m₂']).join(' '+DOT+' ')+' = ?',prod,pt,'Multiply tops, multiply bottoms.'+TYPE));
  }
  ladder.push(ch('Plan 6: Answer','So the lines are…',KINDS,KINDS.indexOf(ans),KIND_NUDGE));
  return {id,num:numLbl,prompt,given,want:'parallel, perpendicular, neither, or the same line',reference:REF,
    pipeline:[coarse(ch('Your answer','Are the lines parallel, perpendicular, neither, or the same line?',KINDS,KINDS.indexOf(ans),KIND_NUDGE),ladder)],_ans:ans};
}
/* write the line perpendicular to a given line through (x1, y1) */
function perpLine(o){
  const {id,numLbl,prompt,given,m,mRungs,pt}=o;
  const [x1,y1]=pt.map(v=>Q(v));
  const mp=neg(inv(m));                                   // m⊥ = −1/m
  const k=mul(mp,neg(x1));                                // m⊥ · (−x1): the constant from distributing
  const b=add(k,y1);                                      // change sides, change signs: + y1
  // m⊥ traps
  const merge=(arr,ans)=>(f,msg)=>{if(eq(f,ans))return;const o=arr.find(x=>eq(x.f,f));if(o)o.msg+=' Also, '+msg.charAt(0).toLowerCase()+msg.slice(1);else arr.push({f,msg});};
  const mt=[],addm=merge(mt,mp);
  addm(neg(m),'You changed only the sign. Opposite reciprocal is two moves: flip it too.');
  addm(inv(m),'You flipped it but kept the sign. Opposite reciprocal is two moves: change the sign too.');
  addm(m,'That is the slope of the given line. Perpendicular needs the opposite reciprocal.');
  (o.mTraps||[]).forEach(t=>addm(t.f,t.msg));
  // b traps (each a named slip), dropped if it lands on the answer or an earlier trap
  const bt=[],addb=merge(bt,b);
  addb(add(mul(mp,x1),y1),'Check the point: it goes in as (x '+MI+' x1), with x1\u2019s sign, before you distribute.');
  addb(add(neg(k),y1),'Distribute '+S(mp)+' to both terms in the parentheses, signs included.');
  addb(sub(k,y1),'Change sides, change signs: the number next to y crosses with the opposite sign.');
  addb(add(mul(m,neg(x1)),y1),'That b comes from the given slope. Use '+PERP+' in point-slope form.');
  const fx=v=>v[0]<0?'(x '+MI+' ('+S(v)+'))':'(x '+MI+' '+S(v)+')';
  const fy=v=>v[0]<0?'y '+MI+' ('+S(v)+')':'y '+MI+' '+S(v);
  const ps=fy(y1)+' = '+P_(mp)+fx(x1);
  const psSwap=fy(x1)+' = '+P_(mp)+fx(y1);
  const psOld=fy(y1)+' = '+P_(m)+fx(x1);
  const dist=(c)=>fy(y1)+' = '+P_(mp)+'x '+(c[0]<0?MI+' '+S(neg(c)):'+ '+S(c));
  const distOpts=[dist(k),dist(neg(k)),dist(neg(x1))];          // right; sign slip; forgot to multiply the constant
  if(new Set(distOpts).size<3) throw new Error(id+': distribute options collide');
  const term=v=>v[0]<0?'('+S(v)+')':S(v);
  const cs=v=>'y = '+P_(mp)+'x '+(k[0]<0?MI+' '+S(neg(k)):'+ '+S(k))+' + '+term(v);
  const pipeline=[
    coarse(frac('Your line is y = mx + b. What is '+PERP+'?'+TYPE,mp,mt,'Perpendicular: '+PERP+' = '+MI+'1/m. Get m first.'),
      mRungs.concat([frac('Plan 5a: '+PERP+' = '+MI+'1/m. '+PERP+' = ?'+TYPE,mp,mt,'Opposite reciprocal: flip m and change its sign. Check: m '+DOT+' '+PERP+' = '+MI+'1.')])),
    coarse(frac('Now b. What is b?'+TYPE,b,bt,'Put '+PERP+' and the point into y '+MI+' y1 = m(x '+MI+' x1), distribute, then change sides, change signs.'),[
      ch('Plan 5b: Point-slope form','Substitute '+PERP+' and the point into y '+MI+' y1 = m(x '+MI+' x1).',[ps,psSwap,psOld],0,'(x1, y1) is the point: x1 goes with x, y1 goes with y. The slope is '+PERP+'.'),
      ...(x1[0]<0?[ch('Plan 5b: Minus a negative','Clean up x '+MI+' ('+S(x1)+').',['x + '+S(neg(x1)),'x '+MI+' '+S(neg(x1))],0,'Minus a negative is plus.')]:[]),
      ch('Plan 5b: Distribute','Distribute '+S(mp)+'.',distOpts,0,'Multiply '+S(mp)+' by each term in the parentheses, signs included.'),
      ch('Plan 5b: Change sides, change signs','Move the '+S(neg(y1))+' off the y side.',[cs(y1),cs(neg(y1))],0,'Change sides, change signs: the number next to y crosses with the opposite sign.'),
      frac('Plan 6: Add. b = ?'+TYPE,b,bt,'Add the two numbers on the end.')])];
  return {id,num:numLbl,prompt,given,want:'m and b for the new line, y = mx + b',reference:REF,pipeline,_ans:{m:mp,b}};
}

const REF='<div class="surf-label">Formula Box — stays on screen</div>'+
 '<div class="ref-row"><div class="ref-cell"><div class="rc-t">Slope</div><div class="rc-s">m = Δy / Δx<br>Δx := x2 '+MI+' x1, Δy := y2 '+MI+' y1</div></div>'+
 '<div class="ref-cell"><div class="rc-t">Standard form Ax + By = C</div><div class="rc-s">m = '+MI+'A / B, b = C / B<br>(C only moves the intercept)</div></div></div>'+
 '<div class="ref-row" style="margin-top:8px"><div class="ref-cell"><div class="rc-t">'+STAR+' SG-1 Parallel</div><div class="rc-s">'+PAR+' = m (different b)</div></div>'+
 '<div class="ref-cell"><div class="rc-t">'+STAR+' SG-2 Perpendicular</div><div class="rc-s">'+PERP+' = '+MI+'1 / m (the slopes multiply to '+MI+'1)</div></div>'+
 '<div class="ref-cell"><div class="rc-t">'+STAR+' SG-3 Point-slope</div><div class="rc-s">y '+MI+' y1 = m(x '+MI+' x1)</div></div></div>'+
 '<div class="ref-note">Plan: 1 read '+DOT+' 2 goal '+DOT+' 3 facts as math '+DOT+' 4 subgoals (the slope first, then the line) '+DOT+' 5 execute, one move per row '+DOT+' 6 answer and check. Type fractions like -3/2.</div>';

const mRead=(label,m,where)=>frac('Plan 3: Facts. '+label+' = ?'+TYPE,m,[{f:neg(m),msg:'Keep the sign that is in front of x.'}].filter(t=>!eq(t.f,m)),'In y = mx + b, m is the number in front of x'+(where||'')+'.');

const sA1=stdSlope('Plan 5: m₁ = '+MI+'A/B = ?',6,-3,9);
const sA3a=stdSlope('Plan 5: m₁ = '+MI+'A/B = ?',2,5,10), sA3b=stdSlope('Plan 5: m₂ = '+MI+'A/B = ?',4,10,30);
const sT2=stdSlope('Plan 5: m₂ = '+MI+'A/B = ?',4,1,9);
const sA4=stdSlope('Plan 3: Facts. m = '+MI+'A/B = ?',3,-2,6);
const pAB=ptSlope('Plan 3: Facts. m(AB) = Δy/Δx = ?',[1,2],[4,8]), pCD=ptSlope('Plan 3: Facts. m(CD) = Δy/Δx = ?',[0,5],[2,1]);

const P=[
 classify({id:'t1',numLbl:'T-1',prompt:'Are the lines y = 4x '+MI+' 3 and y = 4x + 7 parallel, perpendicular, neither, or the same line?',
  given:[{v:'y = 4x '+MI+' 3',k:'line 1'},{v:'y = 4x + 7',k:'line 2'}],
  L1:{m:Q(4),b:Q(-3),rungs:[mRead('m₁',Q(4))]},L2:{m:Q(4),b:Q(7),rungs:[mRead('m₂',Q(4))]}}),
 classify({id:'t2',numLbl:'T-2',prompt:'Are the lines y = (1/4)x '+MI+' 2 and 4x + y = 9 parallel, perpendicular, neither, or the same line?',
  given:[{v:'y = (1/4)x '+MI+' 2',k:'line 1'},{v:'4x + y = 9',k:'line 2, standard form'}],
  L1:{m:Q(1,4),b:Q(-2),rungs:[mRead('m₁',Q(1,4))]},
  L2:{m:sT2.m,b:Q(9),rungs:[ch('Plan 3: Facts',ABQ.replace('This line','4x + y = 9'),['A = 4, B = 1','A = 4, B = 9','A = 1, B = 4'],0,AB_NUDGE),sT2.step]}}),
 perpLine({id:'t3',numLbl:'T-3',prompt:'Write the equation of the line perpendicular to y = 2x + 1 that passes through (4, 3). Give m and b for y = mx + b.',
  given:[{v:'y = 2x + 1',k:'the given line'},{v:'(4, 3)',k:'a point on the new line'}],m:Q(2),pt:[4,3],
  mRungs:[mRead('m, the slope of the given line',Q(2))]}),
 classify({id:'a1',numLbl:'A-1',prompt:'Are the lines 6x '+MI+' 3y = 9 and y = '+MI+'(1/2)x + 4 parallel, perpendicular, neither, or the same line?',
  given:[{v:'6x '+MI+' 3y = 9',k:'line 1, standard form'},{v:'y = '+MI+'(1/2)x + 4',k:'line 2'}],
  L1:{m:sA1.m,b:Q(9,-3),rungs:[ch('Plan 3: Facts',ABQ.replace('This line','6x '+MI+' 3y = 9'),['A = 6, B = '+MI+'3','A = 6, B = 3','A = 6, B = 9'],0,AB_NUDGE),sA1.step]},
  L2:{m:Q(-1,2),b:Q(4),rungs:[mRead('m₂',Q(-1,2))]}}),
 classify({id:'a2',numLbl:'A-2',prompt:'Line AB goes through A(1, 2) and B(4, 8). Line CD goes through C(0, 5) and D(2, 1). Are the lines parallel, perpendicular, neither, or the same line?',
  given:[{v:'A(1, 2), B(4, 8)',k:'line AB'},{v:'C(0, 5), D(2, 1)',k:'line CD'}],mNames:['m(AB)','m(CD)'],
  L1:{m:pAB.m,b:Q(0),rungs:[pAB.step]},L2:{m:pCD.m,b:Q(5),rungs:[pCD.step]}}),
 classify({id:'a3',numLbl:'A-3',prompt:'Are the lines 2x + 5y = 10 and 4x + 10y = 30 parallel, perpendicular, neither, or the same line?',
  given:[{v:'2x + 5y = 10',k:'line 1, standard form'},{v:'4x + 10y = 30',k:'line 2, standard form'}],
  L1:{m:sA3a.m,b:Q(10,5),rungs:[sA3a.step]},L2:{m:sA3b.m,b:Q(30,10),rungs:[sA3b.step]},
  bRungs:[frac('Plan 5: Same slope. Compare b. For line 1, b = C/B = ?'+TYPE,Q(2),[{f:Q(5),msg:'That is B/C. b = C over B.'}],'C only moves the intercept: b = C/B.'),
          frac('Plan 5: For line 2, b = C/B = ?'+TYPE,Q(3),[{f:Q(1,3),msg:'That is B/C. b = C over B.'}],'C only moves the intercept: b = C/B.')]}),
 perpLine({id:'a4',numLbl:'A-4',prompt:'Write the equation of the line perpendicular to 3x '+MI+' 2y = 6 that passes through ('+MI+'3, 5). Give m and b for y = mx + b.',
  given:[{v:'3x '+MI+' 2y = 6',k:'the given line, standard form'},{v:'('+MI+'3, 5)',k:'a point on the new line'}],m:sA4.m,pt:[-3,5],
  mRungs:[ch('Plan 3: Facts',ABQ.replace('This line','3x '+MI+' 2y = 6'),['A = 3, B = '+MI+'2','A = 3, B = 2','A = 3, B = 6'],0,AB_NUDGE),sA4.step],
  mTraps:[{f:Q(2,3),msg:'Check the sign of m: B is '+MI+'2, so m = '+MI+'A/B = 3/2 is positive.'}]})
];
const ANSWERS=P.map(p=>[p.id,typeof p._ans==='string'?p._ans:mx(p._ans.m,p._ans.b)]); P.forEach(p=>delete p._ans);

const page=`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Week 6, Lesson 1 — Parallel and Perpendicular Lines Checker</title>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../assets/styles.css">
</head>
<body>
<header class="hdr">
  <div class="hdr-left"><a class="hdr-back" href="../index.html">&larr; All Checkers</a><h1>Parallel and Perpendicular Lines</h1><div class="sub">Week 6 · Lesson 1 — Learning Lab</div></div>
  <div class="hdr-dots" id="hdrDots"></div>
</header>
<main class="main wide" id="main"><noscript><p>This checker needs JavaScript. Work the Learning Lab on paper and check with your teacher.</p></noscript></main>

<script src="../js/checker-kit.js"></script>
<script src="../js/tool-fraction.js"></script>
<script>
/* Week 6 Lesson 1 Learning Lab. Split layout, coarse first. A miss opens the
   Problem-Solving Plan: each slope (Δy/Δx, or −A/B from standard form), the
   parallel test, then the b compare or the product, then the answer; for a new
   line, m⊥ = −1/m, then point-slope, distribute, change sides, change signs.
   Exact fractions. Choice answers are djb2 hashes. */
K.run(${JSON.stringify(P,null,1)}, { layout:'split' });
</script>
</body>
</html>
`;
fs.writeFileSync('checkers/week6-lesson1-par-perp.html',page);
console.log('ok',page.length,JSON.stringify(ANSWERS));

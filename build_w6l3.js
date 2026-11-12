/* Week 6 Lesson 3 checker (The Equation of a Circle). Follows the handout: SG-6 standard form
   (x − h)² + (y − k)² = r², center (h, k), radius r; a plus in the equation means a negative
   center number (x + 7 = x − (−7)); the right side is r², so take its square root; a point on
   the circle is r from the center, so r² = Δx² + Δy² (Lesson 2, Δx := x2 − x1, Δy := y2 − y1);
   inside / on / outside compares Δx² + Δy² with r².
   Coarse first: each step asks for the answer straight away; a miss opens the Plan one move at a
   time. Equations are picked from a short list (the kit cannot read a typed equation); every
   distractor is a named slip (signs flipped, r not squared). Exact arithmetic throughout.
   The build stops if a trap lands on its answer, two traps share a value, or options repeat.
   Run: node build_w6l3.js  -> checkers/week6-lesson3-circle.html */
const fs=require('fs');
function djb2(s){var v=5381;for(var i=0;i<s.length;i++){v=((v<<5)+v)+s.charCodeAt(i);v=v&v;}return v>>>0;}
const DOT='·',STAR='★',MI='−',RT='√',SQ='²';
const TYPE=' Type a whole number or a fraction like -3/2 (a hyphen for the minus).';
const sgn=v=>v<0?MI+Math.abs(v):''+v, P_=v=>v<0?'('+MI+Math.abs(v)+')':''+v;

function ch(label,ask,opts,i,nudge){
  if(new Set(opts).size!==opts.length) throw new Error(label+': duplicate options '+opts.join(' | '));
  return {tool:'choice',stack:true,label,ask,options:opts,ch:djb2(opts[i]),shuffle:true,nudges:[nudge]};}
function frac(label,a,traps,nudge){
  const t=[];(traps||[]).forEach(([v,msg])=>{ if(v===a) return; if(t.some(u=>u.f[0]===v)) return; t.push({f:[v,1],msg}); });
  return {tool:'fraction',label,answer:[a,1],traps:t,nudges:[nudge+TYPE]};}
function coarse(step,ladder){return Object.assign(step,{sub:ladder});}

/* (x − h)² written the way the equation shows it */
const term=(v,c)=>v===0?c+SQ:(v<0?'('+c+' + '+Math.abs(v)+')'+SQ:'('+c+' '+MI+' '+v+')'+SQ);
const eqn=(h,k,r2)=>term(h,'x')+' + '+term(k,'y')+' = '+r2;
const SIGN='Check the sign: a plus in the equation means a negative center number, and a minus means a positive one.';

/* ---- read the center and the radius from standard form ---- */
function readCircle(o){
  const {id,numLbl,h,k,r2,rTap}=o; const r=Math.sqrt(r2), whole=Number.isInteger(r);
  const E=eqn(h,k,r2);
  const hl=ch('Plan 3: Facts',`Write ${term(h,'x').replace(SQ,'')} as x ${MI} h. It is…`,
    h===0?['x '+MI+' 0','there is no h']:[h<0?'x '+MI+' ('+MI+Math.abs(h)+')':'x '+MI+' '+h, h<0?'x '+MI+' '+Math.abs(h):'x '+MI+' ('+MI+h+')'],0,
    h===0?'x by itself is x '+MI+' 0, so h = 0: the center sits on the y-axis.':'x + a number is x '+MI+' (a negative number). Minus a negative is plus.');
  const kl=ch('Plan 3: Facts',`Write ${term(k,'y').replace(SQ,'')} as y ${MI} k. It is…`,
    k===0?['y '+MI+' 0','there is no k']:[k<0?'y '+MI+' ('+MI+Math.abs(k)+')':'y '+MI+' '+k, k<0?'y '+MI+' '+Math.abs(k):'y '+MI+' ('+MI+k+')'],0,
    k===0?'y by itself is y '+MI+' 0.':'y + a number is y '+MI+' (a negative number). Minus a negative is plus.');
  const pipe=[
    coarse(frac('The center’s x: h = ?',h,[[-h,SIGN]],'Match (x '+MI+' h). The number after x, with its sign changed.'),[hl,frac('Plan 3: h = ?',h,[[-h,SIGN]],'h is the number in x '+MI+' h.')]),
    coarse(frac('The center’s y: k = ?',k,[[-k,SIGN]],'Match (y '+MI+' k). The number after y, with its sign changed.'),[kl,frac('Plan 3: k = ?',k,[[-k,SIGN]],'k is the number in y '+MI+' k.')])];
  const rTraps=[[r2,'That is r'+SQ+', the right side. Take its square root.'],[r2/2,'Square root, not half: what number times itself is '+r2+'?']];
  if(whole){
    pipe.push(coarse(frac('The radius: r = ?',r,rTraps,'The right side is r'+SQ+'. Take its square root.'),[
      frac('Plan 3: The right side is r'+SQ+'. r'+SQ+' = ?',r2,[],'Read the number on the right side.'),
      frac('Plan 5: r = '+RT+r2+' = ?',r,rTraps,'What number times itself is '+r2+'?')]));
  }else{
    pipe.push(coarse(ch('If you can, simplify','The radius: r = '+RT+r2+' = ?',rTap.opts,0,'Find the biggest perfect square that goes into '+r2+' (4, 9, 16, 25, …). Its square root comes out front; the rest stays under the root.'),[
      frac('Plan 3: The right side is r'+SQ+'. r'+SQ+' = ?',r2,[],'Read the number on the right side.'),
      ch('Plan 5: If you can, simplify','r = '+RT+r2+' = ?',rTap.opts,0,'Find the biggest perfect square that goes into '+r2+'. Its square root comes out front.')]));
  }
  return {id,num:numLbl,prompt:'Find the center and the radius of '+E+'.',
    given:[{v:E,k:'standard form'}],want:'the center (h, k), then the radius r',reference:REF,pipeline:pipe,
    _ans:'('+h+', '+k+'), r = '+(whole?r:rTap.opts[0])};
}

/* ---- write the equation from the center and the radius ---- */
function eqOptions(h,k,r2,r){
  const o=[eqn(h,k,r2),eqn(-h,-k,r2)];
  if(r!==undefined&&r!==r2) o.push(eqn(h,k,r));
  o.push(eqn(-h,-k,r!==undefined&&r!==r2?r:r2+1));
  return [...new Set(o)];
}
function writeFromRadius(o){
  const {id,numLbl,h,k,r}=o; const r2=r*r, opts=eqOptions(h,k,r2,r);
  const xs=term(h,'x').replace(SQ,''), ys=term(k,'y').replace(SQ,'');
  const xw=term(-h,'x').replace(SQ,''), yw=term(-k,'y').replace(SQ,'');
  return {id,num:numLbl,prompt:`Write the equation of the circle with center (${sgn(h)}, ${sgn(k)}) and radius ${r}.`,
    given:[{v:`(${sgn(h)}, ${sgn(k)})`,k:'the center (h, k)'},{v:''+r,k:'the radius r'}],want:'the equation in standard form',reference:REF,
    pipeline:[coarse(ch('Your equation','Which is the equation?',opts,0,'Put h and k into (x '+MI+' h) and (y '+MI+' k), and square the radius.'),[
      ch('Plan 5: Substitute h',`x ${MI} h with h = ${sgn(h)} becomes…`,[xs,xw],0,h<0?'x '+MI+' ('+MI+Math.abs(h)+'): minus a negative is plus.':'x '+MI+' '+h+' stays a minus.'),
      ch('Plan 5: Substitute k',`y ${MI} k with k = ${sgn(k)} becomes…`,[ys,yw],0,k<0?'y '+MI+' ('+MI+Math.abs(k)+'): minus a negative is plus.':'y '+MI+' '+k+' stays a minus.'),
      frac(`Plan 5: The right side is r${SQ} = ${r}${SQ} = ?`,r2,[[2*r,'Squaring is a number times itself, not times 2.'],[r,'The right side is r'+SQ+', not r. Square the radius.']],'Multiply the radius by itself.'),
      ch('Plan 6: Answer','So the equation is…',opts,0,'Use the two pieces you just found and r'+SQ+' on the right.')])],
    _ans:opts[0]};
}

/* ---- write the equation from the center and one point on the circle ---- */
function writeFromPoint(o){
  const {id,numLbl,h,k,px,py}=o; const dx=px-h, dy=py-k, r2=dx*dx+dy*dy, ns=Math.abs(dx)+Math.abs(dy);
  const opts=[eqn(h,k,r2),eqn(-h,-k,r2),eqn(h,k,ns),eqn(-h,-k,ns)];      // right; signs flipped; not squared; both
  const dt=(v,f,s)=>[[f+s,'Minus a negative is plus.'],[-v,'Δ is the point minus the center: the second one first.']].filter(([w])=>w!==v);
  return {id,num:numLbl,prompt:`Write the equation of the circle with center (${sgn(h)}, ${sgn(k)}) that passes through (${sgn(px)}, ${sgn(py)}).`,
    given:[{v:`(${sgn(h)}, ${sgn(k)})`,k:'the center (h, k)'},{v:`(${sgn(px)}, ${sgn(py)})`,k:'a point on the circle'}],want:'r'+SQ+', then the equation',reference:REF,
    pipeline:[
     coarse(frac('r'+SQ+' = ?',r2,[[ns,'Square each one before you add: r'+SQ+' = Δx'+SQ+' + Δy'+SQ+'.']].concat(dy<0?[[dx*dx-dy*dy,'A negative squared is positive. Add the squares.']]:[]).concat(dx<0?[[dy*dy-dx*dx,'A negative squared is positive. Add the squares.']]:[]),
       'The point is r from the center, so r'+SQ+' = Δx'+SQ+' + Δy'+SQ+' (Lesson 2).'),[
       frac(`Plan 5a: Δx = ${sgn(px)} ${MI} ${P_(h)} = ?`,dx,h<0?dt(dx,px,h):[[-dx,'Δx is the point minus the center: the second one first.']],'Δx := x2 '+MI+' x1: the point minus the center.'),
       frac(`Plan 5a: Δy = ${sgn(py)} ${MI} ${P_(k)} = ?`,dy,k<0?dt(dy,py,k):[[-dy,'Δy is the point minus the center: the second one first.']],'Δy := y2 '+MI+' y1: the point minus the center.'),
       frac(`Plan 5a: r${SQ} = Δx${SQ} + Δy${SQ} = ${P_(dx)}${SQ} + ${P_(dy)}${SQ} = ?`,r2,[[ns,'Square each one before you add.'],[2*Math.abs(dx)+2*Math.abs(dy),'Squaring is a number times itself, not times 2.']],'Square each, then add.')]),
     ch('Plan 5b: Standard form','Which is the equation?',opts,0,'Put h and k into (x '+MI+' h) and (y '+MI+' k). The right side is the r'+SQ+' you just found.')],
    _ans:opts[0]};
}

const REF='<div class="surf-label">Formula Box — stays on screen</div>'+
 '<div class="ref-row"><div class="ref-cell"><div class="rc-t">'+STAR+' SG-6 Circle</div><div class="rc-s">(x '+MI+' h)'+SQ+' + (y '+MI+' k)'+SQ+' = r'+SQ+'<br>center (h, k), radius r</div></div>'+
 '<div class="ref-cell"><div class="rc-t">Signs</div><div class="rc-s">(x + 7) is (x '+MI+' ('+MI+'7)): h = '+MI+'7<br>x'+SQ+' alone is (x '+MI+' 0)'+SQ+': h = 0</div></div></div>'+
 '<div class="ref-row" style="margin-top:8px"><div class="ref-cell"><div class="rc-t">From Lesson 2</div><div class="rc-s">d = '+RT+'(Δx'+SQ+' + Δy'+SQ+'), Δx := x2 '+MI+' x1, Δy := y2 '+MI+' y1<br>a point on the circle: r'+SQ+' = Δx'+SQ+' + Δy'+SQ+'</div></div>'+
 '<div class="ref-cell"><div class="rc-t">Inside, on, or outside?</div><div class="rc-s">Δx'+SQ+' + Δy'+SQ+' less than r'+SQ+': inside<br>equal: on &nbsp; more: outside</div></div></div>'+
 '<div class="ref-note">Plan: 1 read and sketch the center '+DOT+' 2 goal '+DOT+' 3 facts: match (x '+MI+' h), (y '+MI+' k), r'+SQ+' '+DOT+' 4 subgoals '+DOT+' 5 execute, one move per row '+DOT+' 6 answer and check: put a point back in. Type negatives like -3.</div>';

const P=[];
P.push(readCircle({id:'t1',numLbl:'T-1',h:6,k:-3,r2:64}));
P.push(readCircle({id:'t2',numLbl:'T-2',h:-7,k:2,r2:4}));
P.push(writeFromRadius({id:'t3',numLbl:'T-3',h:-3,k:5,r:4}));
P.push(writeFromPoint({id:'t4',numLbl:'T-4',h:-1,k:4,px:1,py:9}));
P.push(readCircle({id:'a1',numLbl:'A-1',h:0,k:-4,r2:18,rTap:{opts:['3'+RT+'2','9'+RT+'2','2'+RT+'3']}}));
P.push(writeFromPoint({id:'a2',numLbl:'A-2',h:-4,k:-2,px:2,py:-5}));
/* A-3: inside, on, or outside */
{const h=-2,k=3,r=6,px=3,py=7,dx=px-h,dy=py-k,d2=dx*dx+dy*dy,r2=r*r; if(d2===r2) throw new Error('A-3 must not be on the edge');
 const ans=d2<r2?'inside':'outside', K3=['inside','on the edge','outside'];
 P.push({id:'a3',num:'A-3',prompt:`A cell tower at (${sgn(h)}, ${sgn(k)}) on a map measured in miles covers every point within ${r} miles. Is a house at (${px}, ${py}) inside the range, on its edge, or outside?`,
  given:[{v:`(${sgn(h)}, ${sgn(k)})`,k:'the tower: the center'},{v:''+r+' miles',k:'the radius'},{v:`(${px}, ${py})`,k:'the house'}],want:'inside, on the edge, or outside',reference:REF,
  pipeline:[coarse(ch('Your answer','The house is…',K3,K3.indexOf(ans),'Compare the house’s Δx'+SQ+' + Δy'+SQ+' with r'+SQ+'.'),[
    frac(`Plan 5a: r${SQ} = ${r}${SQ} = ?`,r2,[[2*r,'Squaring is a number times itself, not times 2.']],'Multiply the radius by itself.'),
    frac(`Plan 5b: Δx = ${px} ${MI} ${P_(h)} = ?`,dx,[[px+h,'Minus a negative is plus.'],[-dx,'Δx is the house minus the tower: the second one first.']],'Δx := x2 '+MI+' x1: the house minus the tower.'),
    frac(`Plan 5b: Δy = ${py} ${MI} ${P_(k)} = ?`,dy,[[-dy,'Δy is the house minus the tower: the second one first.']],'Δy := y2 '+MI+' y1: the house minus the tower.'),
    frac(`Plan 5b: Δx${SQ} + Δy${SQ} = ${P_(dx)}${SQ} + ${P_(dy)}${SQ} = ?`,d2,[[dx+dy,'Square each one before you add.']],'Square each, then add.'),
    ch('Plan 6: Compare',`Compare ${d2} with r${SQ} = ${r2}. The house is…`,K3,K3.indexOf(ans),'Less than r'+SQ+': inside. Equal: on the edge. More: outside.')])],_ans:ans});}
/* A-4: the point straight above the center (the graphing step) */
{const h=1,k=-6,r2=9,r=3,E=eqn(h,k,r2);
 P.push({id:'a4',num:'A-4',prompt:`For the circle ${E}, find the point on the circle straight above the center.`,
  given:[{v:E,k:'standard form'}],want:'the point (x, y) straight above the center',reference:REF,
  pipeline:[
   coarse(frac('x of the point = ?',h,[[-h,SIGN]],'Straight above the center keeps the center’s x.'),[
     frac('Plan 3: The center’s x: h = ?',h,[[-h,SIGN]],'Match (x '+MI+' h).'),
     frac('Plan 5a: Straight up does not change x. x = ?',h,[[h+r,'Straight up moves y, not x.']],'Straight up keeps the same x.')]),
   coarse(frac('y of the point = ?',k+r,[[k+r2,'Go up r, not r'+SQ+': take the square root of '+r2+' first.'],[k-r,'That point is straight below the center. Up adds r.'],[-k+r,SIGN]],'Start at the center’s y and go up r.'),[
     frac('Plan 3: The center’s y: k = ?',k,[[-k,SIGN]],'Match (y '+MI+' k).'),
     frac('Plan 3: The radius: r = '+RT+r2+' = ?',r,[[r2,'That is r'+SQ+'. Take its square root.']],'What number times itself is '+r2+'?'),
     frac(`Plan 5b: Up r from the center: y = k + r = ${sgn(k)} + ${r} = ?`,k+r,[[k-r,'Up adds r.']],'Add r to the center’s y.')])],
  _ans:'('+h+', '+(k+r)+')'});}

const ANSWERS=P.map(p=>[p.id,p._ans]); P.forEach(p=>delete p._ans);
// every trap and option is checked at build time above; also confirm each fraction answer is not a trap
P.forEach(p=>{const walk=s=>{if(s.tool==='fraction'&&s.traps.some(t=>t.f[0]===s.answer[0]))throw new Error(p.id+': trap = answer in '+s.label);(s.sub||[]).forEach(walk);};p.pipeline.forEach(walk);});

const page=`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Week 6, Lesson 3 — The Equation of a Circle Checker</title>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../assets/styles.css">
</head>
<body>
<header class="hdr">
  <div class="hdr-left"><a class="hdr-back" href="../index.html">&larr; All Checkers</a><h1>The Equation of a Circle</h1><div class="sub">Week 6 · Lesson 3 — Learning Lab</div></div>
  <div class="hdr-dots" id="hdrDots"></div>
</header>
<main class="main wide" id="main"><noscript><p>This checker needs JavaScript. Work the Learning Lab on paper and check with your teacher.</p></noscript></main>

<script src="../js/checker-kit.js"></script>
<script src="../js/tool-fraction.js"></script>
<script>
/* Week 6 Lesson 3 Learning Lab. Split layout, coarse first. A miss opens the
   Problem-Solving Plan one move at a time: match (x − h), (y − k) and r²; for a
   point on the circle, r² = Δx² + Δy²; inside / on / outside compares with r².
   Equations are picked from a list. Choice answers are djb2 hashes. */
K.run(${JSON.stringify(P,null,1)}, { layout:'split' });
</script>
</body>
</html>
`;
fs.writeFileSync('checkers/week6-lesson3-circle.html',page);
console.log('ok',page.length,JSON.stringify(ANSWERS));

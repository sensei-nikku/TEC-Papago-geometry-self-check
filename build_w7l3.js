/* Week 7 Lesson 3 checker (Surface Area of Pyramids and Cones: Slant Height). Built for a sub day:
   the packet teaches it, the checker gives feedback. Matches the packet's rules:
   cone S = pi r^2 + pi r l; square pyramid S = B + (1/2)P l with B = s^2, P = 4s;
   given the height: l = sqrt(h^2 + r^2) (cone), l = sqrt(h^2 + (s/2)^2) (pyramid).
   Coarse first: when the height is given, step 1 is l (type it); the last step is SA (type it).
   A miss opens the plan: pick the rule, the pieces, then the calculator.
   T-1..T-4 together (l given, then h given), A-1..A-4 alone (a diameter, h given, no bottom).
   Every numeric trap is a named slip: h used as l, the base left out (or left in), s instead of s/2,
   the diameter as r, no 1/2. Nearest tenth, tolerance 0.1. The build stops if a trap lands on its
   answer, two traps share a value, options repeat, or an answer repeats a printed packet answer.
   Run: node build_w7l3.js  -> checkers/week7-lesson3-slant-height.html */
const fs=require('fs');
function djb2(s){var v=5381;for(var i=0;i<s.length;i++){v=((v<<5)+v)+s.charCodeAt(i);v=v&v;}return v>>>0;}
const DOT='·',PI_='π',SQ='²',RT='√',HALF='(1/2)',L='ℓ';
const PI=Math.PI, TOL=0.1;
const f1=x=>(Math.round(x*10)/10).toFixed(1);
const PIKEY='Use the '+PI_+' key, not 3.14. Type the whole line into the calculator at once.';

function ch(label,ask,opts,i,nudge){
  if(new Set(opts).size!==opts.length) throw new Error(label+': duplicate options '+opts.join(' | '));
  return {tool:'choice',stack:true,label,ask,options:opts,ch:djb2(opts[i]),shuffle:true,nudges:[nudge]};}
function num(label,a,traps,nudge){
  const t=[];
  (traps||[]).forEach(([v,msg])=>{
    if(Math.abs(v-a)<=TOL){ if(msg!==PIKEY) throw new Error(label+': slip '+v+' passes as the answer '+a+' ('+msg+')'); return; }
    if(Math.abs(v-a)<=TOL+0.06) throw new Error(label+': trap '+v+' sits too close to the answer '+a+' ('+msg+')');
    if(t.some(u=>Math.abs(u.near-v)<0.12)) return;
    t.push({near:v,tol:0.06,msg});});
  return {tool:'numeric',label,answer:a,tol:TOL,closeBand:0.03,traps:t,nudges:[nudge]};}
function piece(label,a,nudge){
  const whole=Number.isInteger(a);
  return {tool:'numeric',label:whole?label:label+' (one decimal is enough)',answer:a,tol:whole?0.005:0.05,closeBand:0.02,traps:[],nudges:[nudge]};}
function coarse(step,ladder){return Object.assign(step,{sub:ladder});}

/* the rules, as options */
const SA_CONE='S = '+PI_+'r'+SQ+' + '+PI_+'r'+L, SA_CONE_SIDE='S = '+PI_+'r'+L, SA_CONE_H='S = '+PI_+'r'+SQ+' + '+PI_+'rh';
const SA_PYR='S = B + '+HALF+'P'+L, SA_PYR_SIDE='S = '+HALF+'P'+L, SA_PYR_H='S = B + '+HALF+'Ph';
const SA_OPTS=[SA_CONE,SA_CONE_SIDE,SA_CONE_H,SA_PYR,SA_PYR_SIDE,SA_PYR_H];
const L_CONE=L+' = '+RT+'(h'+SQ+' + r'+SQ+')', L_PYR=L+' = '+RT+'(h'+SQ+' + (s/2)'+SQ+')';
const L_OPTS_CONE=[L_CONE,L+' = h + r',L+' = '+RT+'(h'+SQ+' − r'+SQ+')',L+' = h'];
const L_OPTS_PYR=[L_PYR,L+' = '+RT+'(h'+SQ+' + s'+SQ+')',L+' = h + s/2',L+' = h'];
const pick=(opts,right,nudge)=>ch('Plan 2: Write the formula','Which rule fits?',opts,opts.indexOf(right),nudge);
const SA_NUDGE='Surface area uses the slant height '+L+', not h. If a part is missing (no bottom), leave out its area.';

/* find l from h: step + ladder */
function slantStep(kind,h,leg,legLbl,traps){
  const a=Math.sqrt(h*h+leg*leg), inside=h*h+leg*leg;
  const opts=kind==='cone'?L_OPTS_CONE:L_OPTS_PYR, right=kind==='cone'?L_CONE:L_PYR;
  return coarse(num('Plan 5: You were given h. Find '+L+' first. '+L+' = ?',a,traps,'h, '+legLbl+' and '+L+' make a right triangle. '+L+' is the longest side.'),
    [ch('Plan 5: The slant height rule','Which rule finds '+L+'?',opts,0,'Pythagorean theorem: '+L+SQ+' = h'+SQ+' + (the bottom leg)'+SQ+'. Then undo the square with a square root.'),
     piece('Plan 5: Under the root: '+h+SQ+' + '+leg+SQ+' = ?',inside,'Power first: '+h+SQ+' = '+h*h+' and '+leg+SQ+' = '+leg*leg+'. Then add.'),
     num('Plan 5: Take the square root. '+L+' = ?',a,[[inside,'That is '+L+SQ+'. Take its square root.']],'A square is undone by a square root.')]);
}
/* cone SA step */
function coneSA(r,l,side,traps,unit,extra){
  const a=side?PI*r*l:PI*r*r+PI*r*l, right=side?SA_CONE_SIDE:SA_CONE;
  const lad=[pick(SA_OPTS,right,SA_NUDGE)].concat(extra||[])
    .concat([ch('Plan 6: Substitute','Put the numbers in. Which is it?',
       side?['S = '+PI_+' '+DOT+' '+r+' '+DOT+' '+l,'S = '+PI_+' '+DOT+' '+r+SQ+' + '+PI_+' '+DOT+' '+r+' '+DOT+' '+l,'S = '+PI_+' '+DOT+' '+l+' '+DOT+' '+l]
           :['S = '+PI_+' '+DOT+' '+r+SQ+' + '+PI_+' '+DOT+' '+r+' '+DOT+' '+l,'S = '+PI_+' '+DOT+' '+r+' '+DOT+' '+l,'S = '+PI_+' '+DOT+' '+l+SQ+' + '+PI_+' '+DOT+' '+r+' '+DOT+' '+l],
       0,'r goes where r is, '+L+' where '+L+' is.'),
     num('Plan 6: Calculator. S ≈ ? (nearest tenth)',a,traps,PIKEY)]);
  return coarse(num('Plan 6: Substitute and answer. S ≈ ? (nearest tenth, in '+unit+SQ+')',a,traps,'Write the rule, substitute, then type the whole line into the calculator. '+PIKEY),lad);
}
/* pyramid SA step */
function pyrSA(s,l,side,traps,unit){
  const B=s*s,P=4*s,a=side?0.5*P*l:B+0.5*P*l, right=side?SA_PYR_SIDE:SA_PYR;
  const lad=[pick(SA_OPTS,right,SA_NUDGE)]
    .concat(side?[]:[piece('Plan 5a: B = s'+SQ+' = ?',B,'B is the area of the square base: s '+DOT+' s.')])
    .concat([piece('Plan 5b: P = 4s = ?',P,'P is the distance around the base: 4 sides.'),
     num('Plan 6: Calculator. S = ? ',a,traps,'Reiterate the rule, substitute, then the calculator.')]);
  return coarse(num('Plan 6: Substitute and answer. S = ? (in '+unit+SQ+')',a,traps,'Find B and P first, then substitute.'),lad);
}

const REF='<div class="surf-label">Formula Box — stays on screen</div>'+
 '<div class="ref-row"><div class="ref-cell"><div class="rc-t">Cone</div><div class="rc-s">S = '+PI_+'r'+SQ+' + '+PI_+'r'+L+'<br>'+L+' = '+RT+'(h'+SQ+' + r'+SQ+')</div></div>'+
 '<div class="ref-cell"><div class="rc-t">Square pyramid</div><div class="rc-s">S = B + '+HALF+'P'+L+', &nbsp;B = s'+SQ+', &nbsp;P = 4s<br>'+L+' = '+RT+'(h'+SQ+' + (s/2)'+SQ+')</div></div></div>'+
 '<div class="ref-note">h goes straight up inside. '+L+' (slant height) runs down the outside face. Surface area uses '+L+'. Given h? Find '+L+' first. Across (diameter) = 2r. Round to the nearest tenth.</div>';

const P=[];
function prob(id,numLbl,prompt,given,want,pipeline,ans){P.push({id,num:numLbl,prompt,given,want,reference:REF,pipeline,_ans:ans});}

/* T-1: cone, l given */
{const r=4,l=10,a=PI*r*r+PI*r*l;
 prob('t1','T-1','A cone has a radius of 4 in and a slant height of 10 in. Find its surface area, to the nearest tenth.',
  [{v:'4 in',k:'the radius r'},{v:'10 in',k:'the slant height '+L}],'S, the surface area',
  [coneSA(r,l,false,[[PI*r*l,'That is only the side. Add the base circle: '+PI_+'r'+SQ+'.'],[3.14*(r*r+r*l),PIKEY],[PI*r*r+PI*r*r*l,'The side is '+PI_+'r'+L+', not '+PI_+'r'+SQ+L+'.']],'in')],a);}

/* T-2: pyramid, l given */
{const s=8,l=6,a=s*s+0.5*4*s*l;
 prob('t2','T-2','A square pyramid has a base 8 cm on each side. Its slant height is 6 cm. Find its surface area.',
  [{v:'8 cm',k:'each side s'},{v:'6 cm',k:'the slant height '+L}],'S, the surface area',
  [pyrSA(s,l,false,[[s*s+4*s*l,'You left out the 1/2.'],[0.5*4*s*l,'That is only the sides. Add the base B.'],[4*s+0.5*4*s*l,'B is the area of the base, s'+SQ+', not 4s.']],'cm')],a);}

/* T-3: cone, h given */
{const r=9,h=12,l=15,a=PI*r*r+PI*r*l;
 prob('t3','T-3','A cone has a radius of 9 m and a height of 12 m. Find its surface area, to the nearest tenth.',
  [{v:'9 m',k:'the radius r'},{v:'12 m',k:'the height h'}],'S, the surface area',
  [slantStep('cone',h,r,'r',[[h+r,L+' is not h + r. Square, add, then take the square root.'],[Math.sqrt(h*h-r*r),'Add the squares; '+L+' is the longest side.']]),
   coneSA(r,l,false,[[PI*r*r+PI*r*h,'You used h. Surface area uses '+L+'.'],[PI*r*l,'That is only the side. Add the base circle.'],[3.14*(r*r+r*l),PIKEY]],'m')],a);}

/* T-4: pyramid, h given */
{const s=12,h=8,l=10,a=s*s+0.5*4*s*l;
 prob('t4','T-4','A square pyramid has a base 12 ft on each side. Its height is 8 ft. Find its surface area.',
  [{v:'12 ft',k:'each side s'},{v:'8 ft',k:'the height h'}],'S, the surface area',
  [slantStep('pyr',h,s/2,'half the side',[[Math.sqrt(h*h+s*s),'Use half the side: s/2 = 6, not 12.'],[h+s/2,L+' is not h + s/2. Square, add, then take the square root.']]),
   pyrSA(s,l,false,[[s*s+0.5*4*s*h,'You used h. Surface area uses '+L+'.'],[0.5*4*s*l,'That is only the sides. Add the base B.'],[s*s+4*s*l,'You left out the 1/2.']],'ft')],a);}

/* A-1: cone, diameter and l given */
{const d=12,r=6,l=14,a=PI*r*r+PI*r*l;
 prob('a1','A-1','A cone is 12 in across the bottom. Its slant height is 14 in. Find its surface area, to the nearest tenth.',
  [{v:'12 in across',k:'the diameter'},{v:'14 in',k:'the slant height '+L}],'S, the surface area',
  [coneSA(r,l,false,[[PI*d*d+PI*d*l,'12 in across is the diameter. r = 12 '+DOT+' 1/2 = 6.'],[PI*r*l,'That is only the side. Add the base circle.'],[3.14*(r*r+r*l),PIKEY]],'in',
    [piece('Plan 4: r = 12 '+DOT+' 1/2 = ?',r,'Across is the whole width. The radius is half of it.')])],a);}

/* A-2: pyramid, h given */
{const s=14,h=24,l=25,a=s*s+0.5*4*s*l;
 prob('a2','A-2','A square pyramid has a base 14 m on each side. Its height is 24 m. Find its surface area.',
  [{v:'14 m',k:'each side s'},{v:'24 m',k:'the height h'}],'S, the surface area',
  [slantStep('pyr',h,s/2,'half the side',[[Math.sqrt(h*h+s*s),'Use half the side: s/2 = 7, not 14.'],[h+s/2,L+' is not h + s/2.']]),
   pyrSA(s,l,false,[[s*s+0.5*4*s*h,'You used h. Surface area uses '+L+'.'],[0.5*4*s*l,'That is only the sides. Add the base B.'],[s*s+4*s*l,'You left out the 1/2.']],'m')],a);}

/* A-3: paper cup, cone with no top, h given */
{const r=3,h=4,l=5,a=PI*r*l;
 prob('a3','A-3','A paper cup is a cone with no top. Its radius is 3 cm and its height is 4 cm. How much paper does it take, to the nearest tenth?',
  [{v:'3 cm',k:'the radius r'},{v:'4 cm',k:'the height h'},{v:'no top',k:'no circle'}],'S, the paper (the side only)',
  [slantStep('cone',h,r,'r',[[h+r,L+' is not h + r.'],[Math.sqrt(h*h-r*r),'Add the squares; '+L+' is the longest side.']]),
   coneSA(r,l,true,[[PI*r*r+PI*r*l,'The cup has no top. Leave out the circle: S = '+PI_+'r'+L+'.'],[PI*r*h,'You used h. Surface area uses '+L+'.'],[3.14*r*l,PIKEY]],'cm')],a);}

/* A-4: tent, pyramid with no floor, h given */
{const s=6,h=4,l=5,a=0.5*4*s*l;
 prob('a4','A-4','A tent is a square pyramid with no floor. Its base is 6 ft on each side and it is 4 ft tall. How much fabric does it take?',
  [{v:'6 ft',k:'each side s'},{v:'4 ft',k:'the height h'},{v:'no floor',k:'no base'}],'S, the fabric (the sides only)',
  [slantStep('pyr',h,s/2,'half the side',[[Math.sqrt(h*h+s*s),'Use half the side: s/2 = 3, not 6.'],[h+s/2,L+' is not h + s/2.']]),
   pyrSA(s,l,true,[[s*s+0.5*4*s*l,'The tent has no floor. Leave out B: S = '+HALF+'P'+L+'.'],[0.5*4*s*h,'You used h. Surface area uses '+L+'.'],[4*s*l,'You left out the 1/2.']],'ft')],a);}

/* ---- build-time guards ---- */
const ANSWERS=P.map(p=>[p.id,f1(p._ans)]); P.forEach(p=>delete p._ans);
const TAKEN=['301.6','360.0','251.3','96.0','94.2','282.7','800.0','320.0','113.1'];   // the printed packet (Ex 1-3, Your Turn 1-6)
ANSWERS.forEach(([id,a])=>{ if(TAKEN.includes(a)) throw new Error(id+': '+a+' is already a printed packet answer'); });
P.forEach(p=>{const walk=s=>{
  if(s.tool==='numeric') s.traps.forEach(t=>{ if(Math.abs(t.near-s.answer)<=s.tol+t.tol) throw new Error(p.id+': trap '+t.near+' overlaps '+s.label); });
  (s.sub||[]).forEach(walk);};p.pipeline.forEach(walk);});

const page=`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Week 7, Lesson 3 — Surface Area: Pyramids and Cones Checker</title>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../assets/styles.css">
</head>
<body>
<header class="hdr">
  <div class="hdr-left"><a class="hdr-back" href="../index.html">&larr; All Checkers</a><h1>Surface Area: Pyramids and Cones</h1><div class="sub">Week 7 · Lesson 3 — Learning Lab</div></div>
  <div class="hdr-dots" id="hdrDots"></div>
</header>
<main class="main wide" id="main"><noscript><p>This checker needs JavaScript. Work the packet on paper and check with the key on page 4.</p></noscript></main>

<script src="../js/checker-kit.js"></script>
<script>
/* Week 7 Lesson 3 Learning Lab (sub day). Split layout, coarse first: find the slant
   height when h is given, then the surface area. A miss opens the plan one move at a time.
   Nearest tenth (tol 0.1). Choice answers are djb2 hashes. */
K.run(${JSON.stringify(P,null,1)}, { layout:'split' });
</script>
</body>
</html>
`;
fs.writeFileSync('checkers/week7-lesson3-slant-height.html',page);
console.log('ok',page.length,JSON.stringify(ANSWERS));

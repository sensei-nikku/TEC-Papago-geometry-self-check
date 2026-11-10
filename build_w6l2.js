/* Week 6 Lesson 2 checker (Distance, Partitioning, Perimeter and Area). Follows the
   handout: SG-4 distance d = √(Δx² + Δy²); SG-5 partition k = a/(a + b),
   xP = x1 + k·Δx, yP = y1 + k·Δy (Δx := x2 − x1, Δy := y2 − y1); midpoint = the average; triangle area ½bh;
   perimeter adds the sides; round once, at the end. Δx := x2 − x1 and Δy := y2 − y1 (Lesson 1).
   Coarse first: each problem asks for the answer straight away. A miss opens the Plan
   one move at a time (Δx, Δy, the number under the root, the square root; k, k·Δx, xP; ...).
   Distance problems ask for the decimal (nearest hundredth), then the simplified exact form
   ("If you can, simplify") as a tap. Exact arithmetic for every rung; decimals checked to
   tol 0.005 (the right hundredth or the unrounded value passes; a wrong hundredth does not).
   The build stops if any trap lands on its answer or two traps land on the same value.
   Run: node build_w6l2.js  -> checkers/week6-lesson2-distance-partition.html */
const fs=require('fs');
function djb2(s){var v=5381;for(var i=0;i<s.length;i++){v=((v<<5)+v)+s.charCodeAt(i);v=v&v;}return v>>>0;}
const DOT='·',STAR='★',MI='−',RT='√',SQ='²';
const TOL=0.005, TYPE=' Type a whole number or a fraction like -3/2 (a hyphen for the minus).';

/* exact fractions [n, d] */
const gcd=(a,b)=>{a=Math.abs(a);b=Math.abs(b);while(b){[a,b]=[b,a%b];}return a;};
const Q=(n,d=1)=>{if(d===0)throw new Error('zero denominator');if(d<0){n=-n;d=-d;}const g=gcd(n,d)||1;return [n/g,d/g];};
const add=(a,b)=>Q(a[0]*b[1]+b[0]*a[1],a[1]*b[1]), mul=(a,b)=>Q(a[0]*b[0],a[1]*b[1]), eq=(a,b)=>a[0]===b[0]&&a[1]===b[1];
const S=a=>(a[0]<0?MI:'')+Math.abs(a[0])+(a[1]===1?'':'/'+a[1]);
const P_=v=>v<0?'('+MI+Math.abs(v)+')':''+v;                        // a negative inside a formula
const sgn=v=>v<0?MI+Math.abs(v):''+v;
const PF=f=>f[0]<0?'('+S(f)+')':S(f);                                  // a fraction inside a sum

function ch(label,ask,opts,i,nudge){
  if(new Set(opts).size!==opts.length) throw new Error(label+': duplicate options');
  return {tool:'choice',stack:true,label,ask,options:opts,ch:djb2(opts[i]),shuffle:true,nudges:[nudge]};}
function frac(label,a,traps,nudge){
  const seen=[];(traps||[]).forEach(t=>{
    if(eq(t.f,a)) throw new Error(label+': trap equals the answer '+S(a)+' ('+t.msg+')');
    if(seen.some(s=>eq(s,t.f))) throw new Error(label+': two traps at '+S(t.f));
    seen.push(t.f);});
  return {tool:'fraction',label,answer:a,traps:traps||[],nudges:[nudge+TYPE]};}
function num(label,ans,unit,traps,nudge){
  const out=[];(traps||[]).forEach(([v,msg,tol])=>{tol=tol||0.006;
    if(Math.abs(v-ans)<=TOL+tol) throw new Error(label+': trap collides with the answer '+ans.toFixed(4)+' ('+msg+')');
    if(out.some(t=>Math.abs(t.near-v)<=t.tol+tol)) return;                // first trap wins
    out.push({near:+v.toFixed(4),tol,msg});});
  const chop=Math.floor(ans*100)/100;
  if(Math.round(ans*100)/100!==chop && !out.some(t=>Math.abs(t.near-chop)<=t.tol)) out.push({near:chop,tol:0.001,msg:'Close: round to the nearest hundredth. Look at the next digit; 5 or more rounds up.'});
  const tenth=Math.round(ans*10)/10;
  if(Math.abs(tenth-ans)>TOL+0.001 && !out.some(t=>Math.abs(t.near-tenth)<=t.tol)) out.push({near:tenth,tol:0.001,msg:'Round to the nearest hundredth: two digits after the point.'});
  return {tool:'numeric',label,answer:ans,tol:TOL,closeBand:0.01,unit:unit||'',traps:out,nudges:[nudge]};}
function coarse(step,ladder){return Object.assign(step,{sub:ladder});}

/* ---- simplified square root: n = s²·r ---- */
function simpRoot(n){let s=1;for(let k=2;k*k<=n;k++) while(n%(k*k)===0){n/=k*k;s*=k;} return [s,n];}
const rootStr=(s,r)=>r===1?''+s:(s===1?'':s)+RT+r;

/* ---- distance between two points ---- */
const D_NUDGE='Δx := x2 '+MI+' x1 and Δy := y2 '+MI+' y1. Square each, add, then take the square root.';
function distRungs(p1,p2,opt){
  const dx=p2[0]-p1[0], dy=p2[1]-p1[1], n=dx*dx+dy*dy, o=opt||{};
  const rungs=[
    frac('Plan 3: Facts. Δx = x2 '+MI+' x1 = '+sgn(p2[0])+' '+MI+' '+P_(p1[0])+' = ?',Q(dx),
      [[p1[0]<0?p2[0]+p1[0]:dx,'Minus a negative is plus: '+sgn(p2[0])+' '+MI+' '+P_(p1[0])+'.'],[-dx,'Δx is x2 '+MI+' x1: the second x first.']]
        .filter(([v])=>v!==dx).filter((t,i,a)=>a.findIndex(u=>u[0]===t[0])===i).map(([v,m])=>({f:Q(v),msg:m})),
      'Δx := x2 '+MI+' x1. Keep the parentheses, then minus a negative is plus.'),
    frac('Plan 3: Facts. Δy = y2 '+MI+' y1 = '+sgn(p2[1])+' '+MI+' '+P_(p1[1])+' = ?',Q(dy),
      [[p1[1]<0?p2[1]+p1[1]:dy,'Minus a negative is plus: '+sgn(p2[1])+' '+MI+' '+P_(p1[1])+'.'],[-dy,'Δy is y2 '+MI+' y1: the second y first.']]
        .filter(([v])=>v!==dy).filter((t,i,a)=>a.findIndex(u=>u[0]===t[0])===i).map(([v,m])=>({f:Q(v),msg:m})),
      'Δy := y2 '+MI+' y1. Keep the parentheses, then minus a negative is plus.')];
  const ut=[];const addu=(v,m)=>{if(v!==n&&!ut.some(t=>t.f[0]===v))ut.push({f:Q(v),msg:m});};
  if(dy<0) addu(dx*dx-dy*dy,'A negative squared is positive: ('+sgn(dy)+')'+SQ+' = '+dy*dy+'.');
  if(dx<0) addu(dy*dy-dx*dx,'A negative squared is positive: ('+sgn(dx)+')'+SQ+' = '+dx*dx+'.');
  addu(Math.abs(dx)+Math.abs(dy),'Square each one before you add: Δx'+SQ+' + Δy'+SQ+'.');
  addu(2*Math.abs(dx)+2*Math.abs(dy),'Squaring is a number times itself, not times 2.');
  rungs.push(frac('Plan 5: Under the root. Δx'+SQ+' + Δy'+SQ+' = '+P_(dx)+SQ+' + '+P_(dy)+SQ+' = ?',Q(n),ut,'Square each, then add. A negative squared is positive.'));
  return {dx,dy,n,rungs};
}
/* decimal traps shared by every distance problem */
function distTraps(p1,p2,scale){
  const dx=p2[0]-p1[0], dy=p2[1]-p1[1], n=dx*dx+dy*dy, k=scale||1, t=[];
  t.push([k*(Math.abs(dx)+Math.abs(dy)),'That is walking along the grid lines: Δx + Δy. The straight-line distance uses the distance formula.']);
  t.push([k*n,'Take the square root: '+RT+n+'.',0.006]);
  const sx=p2[0]+p1[0], sy=p2[1]+p1[1];
  if(p1[0]<0&&sx!==dx&&sx!==-dx) t.push([k*Math.sqrt(sx*sx+dy*dy),'Check Δx: minus a negative is plus.']);
  if(p1[1]<0&&sy!==dy&&sy!==-dy) t.push([k*Math.sqrt(dx*dx+sy*sy),'Check Δy: minus a negative is plus.']);
  if((dx<0||dy<0)&&dx*dx!==dy*dy) t.push([k*Math.sqrt(Math.abs(dx*dx-dy*dy)),'A negative squared is positive. Add the squares.']);
  return t;
}
/* the simplify tap: right form first, then the distractors */
function simplifyStep(n,wrong){
  const [s,r]=simpRoot(n); if(r===1||s===1) throw new Error('simplify step needs a root that simplifies: '+n);
  const opts=[rootStr(s,r)].concat(wrong);
  return ch('If you can, simplify','Exact value: d = '+RT+n+' = ?',opts,0,'Find the biggest perfect square that goes into '+n+' (4, 9, 16, 25, …). Its square root comes out front; the rest stays under the root.');
}

/* ---- partition ---- */
function partition(o){
  const {id,numLbl,prompt,given,A,B,a,b}=o;
  const k=Q(a,a+b), kw=Q(b,a+b), kab=Q(a,b);
  const dx=B[0]-A[0], dy=B[1]-A[1];
  const xP=add(Q(A[0]),mul(k,Q(dx))), yP=add(Q(A[1]),mul(k,Q(dy)));
  const tr=(start,d,ax,L)=>{const t=[],put=(f,m)=>{if(!eq(f,ax)&&!t.some(u=>eq(u.f,f)))t.push({f,msg:m});};
    put(add(Q(start),mul(kab,Q(d))),'k compares the first piece with the whole: a/(a + b), not a/b.');
    put(add(Q(start),mul(kw,Q(d))),'That is '+S(kw)+' of the way: measured from the wrong end. k = a/(a + b) starts at the first point.');
    put(mul(k,Q(d)),'That is how far to move. Now start from the first point: add '+L+'1.');
    put(add(Q(start),mul(k,Q(-d))),'Check the sign of the change: '+L+'2 '+MI+' '+L+'1, the second one first.');
    put(add(Q(start),mul(Q(1,a+b),Q(d))),'k = a/(a + b): '+a+' pieces of the '+(a+b)+', not 1.');
    return t;};
  const kTraps=[],putk=(f,m)=>{if(!eq(f,k)&&!kTraps.some(u=>eq(u.f,f)))kTraps.push({f,msg:m});};
  putk(kab,'A ratio of '+a+':'+b+' is '+(a+b)+' pieces in all. k = a/(a + b).'); putk(kw,'That is '+S(kw)+': measured from the wrong end. k = a/(a + b).');
  putk(Q(1,a+b),'k = a/(a + b): the first piece is '+a+' of the '+(a+b)+'.');
  const xT=tr(A[0],dx,xP,'x'), yT=tr(A[1],dy,yP,'y');
  const N='x of P = x1 + k'+DOT+'Δx. Find k, then go k of Δx from the first point.';
  return {id,num:numLbl,prompt,given,want:'the point P, (x, y)',reference:REF,pipeline:[
    coarse(frac('x of P = ?',xP,xT,N),[
      frac('Plan 5a: k = a/(a + b) = ?',k,kTraps,'The ratio '+a+':'+b+' is '+a+' pieces, then '+b+' pieces.'),
      frac('Plan 5b: Δx = x2 '+MI+' x1 = '+sgn(B[0])+' '+MI+' '+P_(A[0])+' = ?',Q(dx),[{f:Q(-dx),msg:'Δx is x2 '+MI+' x1: the second x first.'}].filter(u=>u.f[0]!==dx),'Δx := x2 '+MI+' x1.'),
      frac('Plan 5b: k '+DOT+' Δx = '+S(k)+' '+DOT+' '+P_(dx)+' = ?',mul(k,Q(dx)),[{f:mul(k,Q(-dx)),msg:'Keep the sign of Δx.'}].filter(u=>!eq(u.f,mul(k,Q(dx)))),'Multiply tops, multiply bottoms, then simplify.'),
      frac('Plan 5b: x of P = x1 + k'+DOT+'Δx = '+sgn(A[0])+' + '+PF(mul(k,Q(dx)))+' = ?',xP,xT,'Start at x1 and add the move.')]),
    coarse(frac('y of P = ?',yP,yT,'y of P = y1 + k'+DOT+'Δy. Same k, now with Δy.'),[
      frac('Plan 5c: Δy = y2 '+MI+' y1 = '+sgn(B[1])+' '+MI+' '+P_(A[1])+' = ?',Q(dy),[{f:Q(-dy),msg:'Δy is y2 '+MI+' y1: the second y first.'}].filter(u=>u.f[0]!==dy),'Δy := y2 '+MI+' y1.'),
      frac('Plan 5c: k '+DOT+' Δy = '+S(k)+' '+DOT+' '+P_(dy)+' = ?',mul(k,Q(dy)),[{f:mul(k,Q(-dy)),msg:'Keep the sign of Δy.'}].filter(u=>!eq(u.f,mul(k,Q(dy)))),'Same k as before. Multiply tops, multiply bottoms.'),
      frac('Plan 5c: y of P = y1 + k'+DOT+'Δy = '+sgn(A[1])+' + '+PF(mul(k,Q(dy)))+' = ?',yP,yT,'Start at y1 and add the move.')])],
    _ans:'('+S(xP)+', '+S(yP)+')'};
}

const REF='<div class="surf-label">Formula Box — stays on screen</div>'+
 '<div class="ref-row"><div class="ref-cell"><div class="rc-t">'+STAR+' SG-4 Distance</div><div class="rc-s">d = '+RT+'(Δx'+SQ+' + Δy'+SQ+')<br>Δx := x2 '+MI+' x1, Δy := y2 '+MI+' y1</div></div>'+
 '<div class="ref-cell"><div class="rc-t">'+STAR+' SG-5 Partition point</div><div class="rc-s">k = a / (a + b)<br>x of P = x1 + k'+DOT+'Δx, y of P = y1 + k'+DOT+'Δy</div></div></div>'+
 '<div class="ref-row" style="margin-top:8px"><div class="ref-cell"><div class="rc-t">Midpoint (k = 1/2)</div><div class="rc-s">M = ((x1 + x2) / 2, (y1 + y2) / 2)</div></div>'+
 '<div class="ref-cell"><div class="rc-t">Triangle</div><div class="rc-s">A = (1/2)bh; perimeter: add the sides</div></div></div>'+
 '<div class="ref-note">Plan: 1 read and sketch '+DOT+' 2 goal '+DOT+' 3 facts as math (label x1, y1, x2, y2 first) '+DOT+' 4 subgoals '+DOT+' 5 execute, one move per row '+DOT+' 6 answer and check. Round once, at the end. Type fractions like -3/2.</div>';

const HUND=' Round to the nearest hundredth.';
const P=[];
/* T-1: a distance that comes out whole */
{const p1=[-2,1],p2=[4,9],R=distRungs(p1,p2),d=Math.sqrt(R.n);
 P.push({id:'t1',num:'T-1',prompt:'Find the distance between ('+sgn(p1[0])+', '+p1[1]+') and ('+p2[0]+', '+p2[1]+').',
  given:[{v:'('+sgn(p1[0])+', '+p1[1]+')',k:'(x1, y1)'},{v:'('+p2[0]+', '+p2[1]+')',k:'(x2, y2)'}],want:'d, the distance',reference:REF,
  pipeline:[coarse(num('d = ?',d,'',distTraps(p1,p2),D_NUDGE),R.rungs.concat([num('Plan 6: d = '+RT+R.n+' = ?',d,'',[[R.n,'Take the square root.']],'What number times itself is '+R.n+'?')]))],_ans:d});}
/* T-2: decimal, then the simplified exact form */
{const p1=[-3,2],p2=[1,4],R=distRungs(p1,p2),d=Math.sqrt(R.n);
 P.push({id:'t2',num:'T-2',prompt:'Find the distance between ('+sgn(p1[0])+', '+p1[1]+') and ('+p2[0]+', '+p2[1]+').'+HUND+' Then give the exact value.',
  given:[{v:'('+sgn(p1[0])+', '+p1[1]+')',k:'(x1, y1)'},{v:'('+p2[0]+', '+p2[1]+')',k:'(x2, y2)'}],want:'d, to the nearest hundredth, then exact',reference:REF,
  pipeline:[coarse(num('d ≈ ? (nearest hundredth)',d,'',distTraps(p1,p2),D_NUDGE),R.rungs.concat([num('Plan 6: Calculator. d = '+RT+R.n+' ≈ ? (nearest hundredth)',d,'',[[R.n,'Take the square root.']],'Round once, at the end.')])),
   simplifyStep(R.n,['4'+RT+'5','2'+RT+'10'])],_ans:d});}
/* T-3: midpoint */
{const A=[-3,8],B=[5,2],mx=Q(A[0]+B[0],2),my=Q(A[1]+B[1],2);
 const mt=(s,dv,ans)=>[{f:Q(dv,2),msg:'That is half the change: how far to move. The midpoint averages the endpoints: (x1 + x2)/2.'},{f:Q(s),msg:'Now multiply by 1/2: the average of two numbers is their sum over 2.'}].filter(u=>!eq(u.f,ans));
 P.push({id:'t3',num:'T-3',prompt:'Find the midpoint of the segment from ('+sgn(A[0])+', '+A[1]+') to ('+B[0]+', '+B[1]+').',
  given:[{v:'('+sgn(A[0])+', '+A[1]+')',k:'(x1, y1)'},{v:'('+B[0]+', '+B[1]+')',k:'(x2, y2)'}],want:'M, the midpoint',reference:REF,
  pipeline:[coarse(frac('x of the midpoint = ?',mx,mt(A[0]+B[0],B[0]-A[0],mx),'Average the x values: (x1 + x2)/2.'),[
     frac('Plan 5a: x1 + x2 = '+sgn(A[0])+' + '+B[0]+' = ?',Q(A[0]+B[0]),[{f:Q(B[0]-A[0]),msg:'Add the two x values; do not take the change.'}],'Add the two x values.'),
     frac('Plan 5a: (x1 + x2)/2 = '+(A[0]+B[0])+'/2 = ?',mx,[],'Multiply by 1/2.')]),
   coarse(frac('y of the midpoint = ?',my,mt(A[1]+B[1],B[1]-A[1],my),'Average the y values: (y1 + y2)/2.'),[
     frac('Plan 5b: y1 + y2 = '+A[1]+' + '+B[1]+' = ?',Q(A[1]+B[1]),[{f:Q(B[1]-A[1]),msg:'Add the two y values; do not take the change.'}],'Add the two y values.'),
     frac('Plan 5b: (y1 + y2)/2 = '+(A[1]+B[1])+'/2 = ?',my,[],'Multiply by 1/2.')])],_ans:'('+S(mx)+', '+S(my)+')'});}
/* T-4: partition 1:3 (the handout's trap) */
P.push(partition({id:'t4',numLbl:'T-4',prompt:'Find the point P that partitions the directed segment from A('+MI+'2, 1) to B(10, 9) in the ratio 1:3.',
  given:[{v:'A('+MI+'2, 1)',k:'the start: (x1, y1)'},{v:'B(10, 9)',k:'(x2, y2)'},{v:'1:3',k:'the ratio a:b'}],A:[-2,1],B:[10,9],a:1,b:3}));
/* A-1: partition that runs left and down */
P.push(partition({id:'a1',numLbl:'A-1',prompt:'Find the point P that partitions the directed segment from A(7, 5) to B('+MI+'3, '+MI+'5) in the ratio 3:2.',
  given:[{v:'A(7, 5)',k:'the start: (x1, y1)'},{v:'B('+MI+'3, '+MI+'5)',k:'(x2, y2)'},{v:'3:2',k:'the ratio a:b'}],A:[7,5],B:[-3,-5],a:3,b:2}));
/* A-2: triangle area, then perimeter */
{const Pp=[0,0],Qp=[6,0],Rp=[2,3];
 const b=Qp[0]-Pp[0], h=Rp[1]-Pp[1], area=b*h/2;
 const PR=distRungs(Pp,Rp), QR=distRungs(Qp,Rp), per=b+Math.sqrt(PR.n)+Math.sqrt(QR.n);
 if(QR.n!==25) throw new Error('A-2 expects QR = 5');
 P.push({id:'a2',num:'A-2',prompt:'Triangle PQR has vertices P(0, 0), Q(6, 0) and R(2, 3). Find its area. Then find its perimeter, to the nearest hundredth.',
  given:[{v:'P(0, 0), Q(6, 0)',k:'same y: a flat side'},{v:'R(2, 3)',k:'the top vertex'}],want:'the area, then the perimeter',reference:REF,
  pipeline:[
   coarse(frac('Area = ? (square units)',Q(area),[{f:Q(b*h),msg:'A triangle is half of a rectangle: A = (1/2)bh.'}],'A = (1/2)bh. Count the base along the flat side and the height straight up.'),[
     frac('Plan 5a: The base PQ has the same y. Count it: b = ?',Q(b),[],'From x = 0 to x = 6.'),
     frac('Plan 5a: The height, straight up from PQ to R: h = ?',Q(h),[{f:Q(Rp[0]),msg:'Height goes straight up: count the y of R above the base.'}],'From y = 0 up to the y of R.'),
     frac('Plan 5a: A = (1/2)bh = (1/2)('+b+')('+h+') = ?',Q(area),[{f:Q(b*h),msg:'Multiply by 1/2 too.'}],'Multiply all three.')]),
   coarse(num('Perimeter ≈ ? (nearest hundredth)',per,'',[[b+PR.n+5,'Take the square root of '+PR.n+' before you add.'],[b+h+5,'The height is not a side. Use the slanted side PR.'],[Math.sqrt(PR.n)+5,'Add all three sides, the base too.']],'Add the three sides. The base is counted; the slanted sides use the distance formula.'),[
     frac('Plan 5b: PR first. Δx'+SQ+' + Δy'+SQ+' = '+(Rp[0]-Pp[0])+SQ+' + '+(Rp[1]-Pp[1])+SQ+' = ?',Q(PR.n),[{f:Q(Rp[0]+Rp[1]),msg:'Square each one before you add.'}],'Square each, then add.'),
     frac('Plan 5b: QR. Δx'+SQ+' + Δy'+SQ+' = '+P_(QR.dx)+SQ+' + '+P_(QR.dy)+SQ+' = ?',Q(QR.n),[{f:Q(QR.dy*QR.dy-QR.dx*QR.dx),msg:'A negative squared is positive.'}],'A negative squared is positive. Square each, then add.'),
     frac('Plan 5b: QR = '+RT+QR.n+' = ?',Q(Math.sqrt(QR.n)),[],'What number times itself is '+QR.n+'?'),
     num('Plan 6: Perimeter = '+b+' + '+RT+PR.n+' + 5 ≈ ? (nearest hundredth)',per,'',[[b+PR.n+5,'Take the square root of '+PR.n+' before you add.']],'Round once, at the end.')])],_ans:[area,per]});}
/* A-3: a straight run on a scaled plan */
{const p1=[-1,2],p2=[7,8],sc=5,R=distRungs(p1,p2),d=Math.sqrt(R.n),L=sc*d;
 P.push({id:'a3',num:'A-3',prompt:'On a site plan, each grid unit stands for 5 feet. A fence runs straight from ('+MI+'1, 2) to (7, 8). How long is the fence, in feet?',
  given:[{v:'('+MI+'1, 2) to (7, 8)',k:'the fence on the plan'},{v:'1 unit = 5 ft',k:'the scale'}],want:'L, the real length, in feet',reference:REF,
  pipeline:[coarse(num('L = ? (feet)',L,'ft',[[d,'That is the length in grid units. Each unit stands for 5 feet.'],[d/sc,'Each unit is 5 feet: multiply by 5.'],[sc*R.n,'Take the square root before you scale.']].concat(distTraps(p1,p2,sc)),'Find d in grid units with the distance formula, then L = 5 '+DOT+' d.'),
   R.rungs.concat([num('Plan 5: d = '+RT+R.n+' = ? (grid units)',d,'',[[R.n,'Take the square root.']],'What number times itself is '+R.n+'?'),
     num('Plan 6: L = 5 '+DOT+' d = ? (feet)',L,'ft',[[d,'That is still grid units. Multiply by 5.']],'Each grid unit stands for 5 feet.')]))],_ans:L});}
/* A-4: both points negative-heavy, then simplify */
{const p1=[-5,-2],p2=[3,-6],R=distRungs(p1,p2),d=Math.sqrt(R.n);
 P.push({id:'a4',num:'A-4',prompt:'Find the distance between ('+MI+'5, '+MI+'2) and (3, '+MI+'6).'+HUND+' Then give the exact value.',
  given:[{v:'('+MI+'5, '+MI+'2)',k:'(x1, y1)'},{v:'(3, '+MI+'6)',k:'(x2, y2)'}],want:'d, to the nearest hundredth, then exact',reference:REF,
  pipeline:[coarse(num('d ≈ ? (nearest hundredth)',d,'',distTraps(p1,p2),D_NUDGE),R.rungs.concat([num('Plan 6: Calculator. d = '+RT+R.n+' ≈ ? (nearest hundredth)',d,'',[[R.n,'Take the square root.']],'Round once, at the end.')])),
   simplifyStep(R.n,['16'+RT+'5','2'+RT+'20'])],_ans:d});}

const ANSWERS=P.map(p=>[p.id,p._ans]); P.forEach(p=>delete p._ans);

const page=`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Week 6, Lesson 2 — Distance, Partitioning, Perimeter and Area Checker</title>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../assets/styles.css">
</head>
<body>
<header class="hdr">
  <div class="hdr-left"><a class="hdr-back" href="../index.html">&larr; All Checkers</a><h1>Distance, Partitioning, Perimeter and Area</h1><div class="sub">Week 6 · Lesson 2 — Learning Lab</div></div>
  <div class="hdr-dots" id="hdrDots"></div>
</header>
<main class="main wide" id="main"><noscript><p>This checker needs JavaScript. Work the Learning Lab on paper and check with your teacher.</p></noscript></main>

<script src="../js/checker-kit.js"></script>
<script src="../js/tool-fraction.js"></script>
<script>
/* Week 6 Lesson 2 Learning Lab. Split layout, coarse first. A miss opens the
   Problem-Solving Plan one move at a time: Δx, Δy, the number under the root,
   the square root; k, k·Δx, x of P; the midpoint average; base, height, ½bh.
   Decimals to the nearest hundredth (tol 0.005). Choice answers are djb2 hashes. */
K.run(${JSON.stringify(P,null,1)}, { layout:'split' });
</script>
</body>
</html>
`;
fs.writeFileSync('checkers/week6-lesson2-distance-partition.html',page);
console.log('ok',page.length,JSON.stringify(ANSWERS));

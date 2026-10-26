/* Week 4 Lesson 1 checker (Trig Ratios: Finding Sides). Same 7 problems as the
   printed Learning Lab (w4_l1_learning_lab). Coarse first: each problem asks for x
   straight away. A miss opens the Problem-Solving Plan one rung at a time:
   3 facts as math (name the given side and x from the marked angle), 4 subgoal
   (the ratio), 5 substitute, 5 solve (x on top: multiply; x on the bottom: x is the
   missing factor), 6 calculator in degree mode. Answers to the nearest tenth.
   Figures are drawn to scale and show only the numbers and x, so naming the
   sides stays the student's job.
   Run: node build_w4l1.js  -> checkers/week4-lesson1-trig-sides.html */
const fs=require('fs');
function djb2(s){var v=5381;for(var i=0;i<s.length;i++){v=((v<<5)+v)+s.charCodeAt(i);v=v&v;}return v>>>0;}
const DEG='°',DOT='·',TH='θ';
const rad=d=>d*Math.PI/180, SIN=d=>Math.sin(rad(d)), COS=d=>Math.cos(rad(d)), TAN=d=>Math.tan(rad(d));

/* ---- to-scale right triangle (ported from unit3-day3-inverse figTri) ----
   Canonical frame: W(0,0) - R(h,0) - N(h,v); R is the right angle.
   ang sits at W (vx:'W') or N (vx:'N'). flip mirrors left-right.
   lab = {opp, adj, hyp}: text for the labelled sides (numbers and x only). */
function figTri(cfg){
  var h=cfg.h, v=cfg.v, M=14, TARGET=150, LBL=15, TH_=15, CW=LBL*0.62;
  var P=[[0,0],[h,0],[h,v]];
  if(cfg.flip) P=P.map(p=>[-p[0],p[1]]);
  var s=TARGET/Math.max(h,v), Q=P.map(p=>[p[0]*s,-p[1]*s]);
  const sub=(a,b)=>[a[0]-b[0],a[1]-b[1]], unit=d=>{var n=Math.hypot(d[0],d[1])||1;return [d[0]/n,d[1]/n];}, mid=(a,b)=>[(a[0]+b[0])/2,(a[1]+b[1])/2];
  var C=[(Q[0][0]+Q[1][0]+Q[2][0])/3,(Q[0][1]+Q[1][1]+Q[2][1])/3];
  var texts=[], box=[Infinity,Infinity,-Infinity,-Infinity];
  const grow=(x0,y0,x1,y1)=>{box=[Math.min(box[0],x0),Math.min(box[1],y0),Math.max(box[2],x1),Math.max(box[3],y1)];};
  Q.forEach(p=>grow(p[0],p[1],p[0],p[1]));
  function addText(x,y,txt,anchor,size,cls){var w=txt.length*CW;var x0=anchor==='start'?x:(anchor==='end'?x-w:x-w/2);
    grow(x0,y-size,x0+w,y+size*0.4); texts.push({x,y,t:txt,a:anchor,s:size,c:cls});}
  var vi=(cfg.vx==='W')?0:2, T=Q[vi], a1=unit(sub(Q[(vi+1)%3],T)), a2=unit(sub(Q[(vi+2)%3],T)), r=24;
  var bis=unit([a1[0]+a2[0],a1[1]+a2[1]]);
  grow(T[0]-r,T[1]-r,T[0]+r,T[1]+r);
  // A narrow angle leaves no room inside its wedge: put the label just outside the corner.
  if(cfg.ang<30){ var ox=-bis[0], anc2=ox>0.35?'start':(ox<-0.35?'end':'middle');
    addText(T[0]-bis[0]*12, T[1]-bis[1]*12+5, cfg.ang+DEG, anc2, TH_, 'th'); }
  else addText(T[0]+bis[0]*44, T[1]+bis[1]*44+5, cfg.ang+DEG, 'middle', TH_, 'th');
  var SIDES={opp:(cfg.vx==='W')?[1,2]:[0,1], adj:(cfg.vx==='W')?[0,1]:[1,2], hyp:[0,2]};
  Object.keys(cfg.lab).forEach(k=>{var sd=SIDES[k], Mp=mid(Q[sd[0]],Q[sd[1]]), out=unit(sub(Mp,C));
    var anc=out[0]>0.35?'start':(out[0]<-0.35?'end':'middle');
    addText(Mp[0]+out[0]*20, Mp[1]+out[1]*20+5, cfg.lab[k], anc, LBL, 'sd');});
  var dx=M-box[0], dy=M-box[1], W=(box[2]-box[0])+2*M, H=(box[3]-box[1])+2*M;
  const X=p=>(p[0]+dx).toFixed(1), Y=p=>(p[1]+dy).toFixed(1);
  var e='<polygon points="'+Q.map(p=>X(p)+','+Y(p)).join(' ')+'" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/>';
  var R=Q[1], u1=unit(sub(Q[0],R)), u2=unit(sub(Q[2],R)), m=11;
  var c1=[R[0]+u1[0]*m,R[1]+u1[1]*m], c2=[R[0]+(u1[0]+u2[0])*m,R[1]+(u1[1]+u2[1])*m], c3=[R[0]+u2[0]*m,R[1]+u2[1]*m];
  e+='<path d="M '+X(c1)+' '+Y(c1)+' L '+X(c2)+' '+Y(c2)+' L '+X(c3)+' '+Y(c3)+'" fill="none" stroke="currentColor" stroke-width="1.7"/>';
  var th1=Math.atan2(a1[1],a1[0]), th2=Math.atan2(a2[1],a2[0]), dth=th2-th1;
  while(dth>Math.PI)dth-=2*Math.PI; while(dth<-Math.PI)dth+=2*Math.PI;
  var arc=[]; for(var i=0;i<=14;i++){var t=th1+dth*i/14; arc.push((T[0]+r*Math.cos(t)+dx).toFixed(1)+','+(T[1]+r*Math.sin(t)+dy).toFixed(1));}
  e+='<polyline points="'+arc.join(' ')+'" fill="none" stroke="var(--accent,#1B6B93)" stroke-width="2"/>';
  texts.forEach(t2=>{var isTh=t2.c==='th';
    e+='<text x="'+(t2.x+dx).toFixed(1)+'" y="'+(t2.y+dy).toFixed(1)+'" text-anchor="'+t2.a+'" font-size="'+t2.s+'" font-family="DM Sans, sans-serif"'+
       (isTh?' fill="var(--accent,#1B6B93)"':' fill="currentColor" font-style="italic"')+'>'+t2.t+'</text>';});
  return '<svg class="figtri" viewBox="0 0 '+W.toFixed(0)+' '+H.toFixed(0)+'" style="width:100%;height:auto;max-width:'+Math.round(W*1.5)+'px" role="img" aria-label="Right triangle drawn to scale. The marked angle is '+cfg.ang+' degrees. Labelled sides: '+Object.values(cfg.lab).join(' and ')+'." xmlns="http://www.w3.org/2000/svg">'+e+'</svg>';
}

/* ---- step builders (same shapes as Week 3) ---- */
function ch(label,ask,opts,i,nudge){return {tool:'choice',stack:true,label,ask,options:opts,ch:djb2(opts[i]),shuffle:true,nudges:[nudge]};}
function num(label,a,traps,nudge){return {tool:'numeric',label,answer:a,tol:0.06,closeBand:0.03,traps:traps||[],nudges:[nudge||'Name the sides from the marked angle, pick the ratio, then solve.']};}
function coarse(step,ladder){return Object.assign(step,{sub:ladder});}
const NAMES=['opposite (opp)','adjacent (adj)','hypotenuse (hyp)'], IDX={opp:0,adj:1,hyp:2};
const NAME_NUDGE='Hypotenuse: across from the square corner. Opposite: across from the marked angle. Adjacent: touches the marked angle and is not the hypotenuse.';
const RATIOS=['sin '+TH+' = opp / hyp','cos '+TH+' = adj / hyp','tan '+TH+' = opp / adj'], RIDX={sin:0,cos:1,tan:2};
const RADIAN='Your calculator is in radian mode. Switch to degree mode: sin 30 must show 0.5.';
const OTHER={sin:'cos',cos:'sin',tan:'sin'};

/* One problem. g = given side name, gv = its number, w = wanted side name, r = ratio, x = the unknown's letter. */
function prob(o){
  const {id,numLbl,prompt,figure,given,want,a,g,gv,w,r,x,where,traps}=o;
  const onTop = (w!=='hyp');                       // x is on top of the ratio unless x is the hypotenuse
  const fn={sin:SIN,cos:COS,tan:TAN}[r];
  const ans = onTop ? gv*fn(a) : gv/fn(a);
  // A chopped answer (5.8 for 5.88) is a rounding slip, not a setup error: name it.
  const chop=Math.floor(ans*10)/10;
  if(Math.round(ans*10)/10!==chop) traps.push({near:chop,tol:0.02,msg:'Close: round to the nearest tenth. Look at the next digit; 5 or more rounds up.'});
  const eqR = onTop ? `${r} ${a}${DEG} = ${x} / ${gv}` : `${r} ${a}${DEG} = ${gv} / ${x}`;
  const eqFlip = onTop ? `${r} ${a}${DEG} = ${gv} / ${x}` : `${r} ${a}${DEG} = ${x} / ${gv}`;
  const eqWrong = `${OTHER[r]} ${a}${DEG} = ${onTop?x+' / '+gv:gv+' / '+x}`;
  const mv = onTop ? [`${x} = ${gv} ${DOT} ${r} ${a}${DEG}`,`${x} = ${gv} / ${r} ${a}${DEG}`,`${x} = ${r} ${a}${DEG} / ${gv}`]
                   : [`${x} = ${gv} / ${r} ${a}${DEG}`,`${x} = ${gv} ${DOT} ${r} ${a}${DEG}`,`${x} = ${r} ${a}${DEG} / ${gv}`];
  const mvNudge = onTop ? `${x} is on top, over ${gv}. Multiply both sides by ${gv}.`
                        : `${x} is on the bottom. Multiply both sides by ${x}; then ${x} is the missing factor, like 2 ${DOT} ☐ = 6.`;
  const ladder=[
    ch('Plan 3: Facts as math',`Stand at the ${a}${DEG} angle. ${where.g} is the…`,NAMES,IDX[g],NAME_NUDGE),
    ch('Plan 3: Facts as math',`${where.x} is the…`,NAMES,IDX[w],NAME_NUDGE),
    ch('Plan 4: Subgoal','Which ratio uses those two sides?',RATIOS,RIDX[r],'SOH CAH TOA: pick the ratio built from the two sides you just named.'),
    ch('Plan 5: Substitute','Which equation?',[eqR,eqFlip,eqWrong],0,'Put each number where its side goes in the ratio.'),
    ch('Plan 5: Solve','Which move frees '+x+'?',mv,0,mvNudge),
    num(`Plan 6: Calculator, degree mode. ${x} ≈ ? (nearest tenth)`,ans,traps,'Check degree mode, then round to one digit after the point.')];
  return {id,num:numLbl,prompt,figure:figure||'',given,want,reference:REF,
          pipeline:[coarse(num(`${x} ≈ ? (nearest tenth)`,ans,traps),ladder)], _ans:ans};
}

const REF='<div class="surf-label">Formula Box — stays on screen</div>'+
 '<div class="ref-row"><div class="ref-cell"><div class="rc-t">SOH</div><div class="rc-s">sin '+TH+' = opp / hyp</div></div>'+
 '<div class="ref-cell"><div class="rc-t">CAH</div><div class="rc-s">cos '+TH+' = adj / hyp</div></div>'+
 '<div class="ref-cell"><div class="rc-t">TOA</div><div class="rc-s">tan '+TH+' = opp / adj</div></div></div>'+
 '<div class="ref-row" style="margin-top:8px"><div class="ref-cell"><div class="rc-t">hyp</div><div class="rc-s">across from the square corner</div></div>'+
 '<div class="ref-cell"><div class="rc-t">opp</div><div class="rc-s">across from the marked angle</div></div>'+
 '<div class="ref-cell"><div class="rc-t">adj</div><div class="rc-s">touches the angle, not the hyp</div></div></div>'+
 '<div class="ref-note">Plan: 1 read '+DOT+' 2 goal '+DOT+' 3 facts as math (name the sides) '+DOT+' 4 pick the ratio '+DOT+' 5 substitute and solve '+DOT+' 6 answer and check. '+
 'Calculator in degree mode. A leg is always shorter than the hypotenuse.</div>';

const T=(near,msg,tol)=>({near,tol:tol||0.06,msg});
const usedCos=(a)=>`That is what cos gives. Name the sides from the ${a}${DEG} angle first.`;
const usedSin=(a)=>`That is what sin gives. Name the sides from the ${a}${DEG} angle first.`;
const usedTan=(a)=>`That is what tan gives. Name the sides from the ${a}${DEG} angle first.`;
const MULT=(x)=>`${x} is on the bottom of the fraction, so multiplying doesn't free it. Treat ${x} as the missing factor. Check: a hypotenuse is longer than either leg.`;

const P=[
 prob({id:'t1',numLbl:'T-1',prompt:'Find x. Round to the nearest tenth.',
  figure:figTri({h:10*COS(36),v:10*SIN(36),vx:'W',ang:36,lab:{hyp:'10',opp:'x'}}),
  given:[{v:'36'+DEG,k:'the marked angle'},{v:'10',k:'a side'}],want:'x, to the nearest tenth',
  a:36,g:'hyp',gv:10,w:'opp',r:'sin',x:'x',where:{g:'The side marked 10',x:'And x'},
  traps:[T(10*COS(36),usedCos(36)),T(10*TAN(36),usedTan(36)),T(10*Math.sin(36),RADIAN,0.1)]}),
 prob({id:'t2',numLbl:'T-2',prompt:'Find x. Round to the nearest tenth.',
  figure:figTri({h:14*COS(50),v:14*SIN(50),vx:'W',ang:50,lab:{hyp:'14',adj:'x'}}),
  given:[{v:'50'+DEG,k:'the marked angle'},{v:'14',k:'a side'}],want:'x, to the nearest tenth',
  a:50,g:'hyp',gv:14,w:'adj',r:'cos',x:'x',where:{g:'The side marked 14',x:'And x'},
  traps:[T(14*SIN(50),usedSin(50)),T(14*TAN(50),usedTan(50)),T(14*Math.cos(50),RADIAN,0.1)]}),
 prob({id:'t3',numLbl:'T-3',prompt:'Find x. Round to the nearest tenth.',
  figure:figTri({h:12,v:12*TAN(42),vx:'W',ang:42,lab:{adj:'12',opp:'x'}}),
  given:[{v:'42'+DEG,k:'the marked angle'},{v:'12',k:'a side'}],want:'x, to the nearest tenth',
  a:42,g:'adj',gv:12,w:'opp',r:'tan',x:'x',where:{g:'The side marked 12',x:'And x'},
  traps:[T(12*SIN(42),usedSin(42)+' 12 is not the hypotenuse.'),T(12*COS(42),usedCos(42)),T(12/TAN(42),'You used 12 / tan 42°. x is on top, so multiply both sides by 12.'),T(12*Math.tan(42),RADIAN,0.1)]}),
 prob({id:'a1',numLbl:'A-1',prompt:'Find x. Round to the nearest tenth. The picture is turned around: find the marked angle first.',
  figure:figTri({h:25*COS(20),v:25*SIN(20),vx:'W',flip:1,ang:20,lab:{hyp:'25',opp:'x'}}),
  given:[{v:'20'+DEG,k:'the marked angle'},{v:'25',k:'a side'}],want:'x, to the nearest tenth',
  a:20,g:'hyp',gv:25,w:'opp',r:'sin',x:'x',where:{g:'The side marked 25',x:'And x'},
  traps:[T(25*COS(20),usedCos(20)+' The picture is flipped: x is across from 20'+DEG+'.'),T(25*TAN(20),usedTan(20)),T(25*Math.sin(20),RADIAN,0.1)]}),
 prob({id:'a2',numLbl:'A-2',prompt:'A loading ramp is 12 ft long. It makes a 15'+DEG+' angle with the ground. How high is the top of the ramp? Round to the nearest tenth. No picture: sketch the right triangle on your paper first.',
  given:[{v:'12 ft long',k:'the ramp'},{v:'15'+DEG,k:'the angle with the ground'}],want:'h, the height of the top, in feet',
  a:15,g:'hyp',gv:12,w:'opp',r:'sin',x:'h',where:{g:'The ramp (12 ft)',x:'And the height h'},
  traps:[T(12*COS(15),'That is the distance along the ground (cos). The height is across from the 15'+DEG+' angle.'),T(12*TAN(15),usedTan(15)+' The ramp itself is the hypotenuse.'),T(12*Math.sin(15),RADIAN,0.1)]}),
 prob({id:'a3',numLbl:'A-3',prompt:'Find x. Round to the nearest tenth. The marked angle is at the top this time.',
  figure:figTri({h:9*TAN(55),v:9,vx:'N',flip:1,ang:55,lab:{adj:'9',hyp:'x'}}),
  given:[{v:'55'+DEG,k:'the marked angle'},{v:'9',k:'a side'}],want:'x, to the nearest tenth',
  a:55,g:'adj',gv:9,w:'hyp',r:'cos',x:'x',where:{g:'The side marked 9',x:'And x'},
  traps:[T(9*COS(55),MULT('x')),T(9/SIN(55),usedSin(55)+' 9 touches the 55'+DEG+' angle.'),T(9*TAN(55),'That is the other leg, not x. x is across from the square corner.'),T(9/Math.cos(55),RADIAN,0.1)]}),
 prob({id:'a4',numLbl:'A-4',prompt:'A kite flies 30 ft above the ground. Its string makes a 48'+DEG+' angle with the ground. How long is the string? Treat the string as straight, with your hand at ground level. Round to the nearest tenth. No picture: sketch the right triangle first.',
  given:[{v:'30 ft',k:'the height of the kite'},{v:'48'+DEG,k:'the angle with the ground'}],want:'L, the length of the string, in feet',
  a:48,g:'opp',gv:30,w:'hyp',r:'sin',x:'L',where:{g:'The height (30 ft)',x:'And the string L'},
  traps:[T(30*SIN(48),MULT('L')),T(30/COS(48),usedCos(48)+' The height is across from the 48'+DEG+' angle.'),T(30/TAN(48),'That is the distance along the ground, not the string.'),T(30/Math.sin(48),RADIAN,0.1)]})
];
const ANSWERS=P.map(p=>[p.id,+p._ans.toFixed(4)]); P.forEach(p=>delete p._ans);

const page=`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Week 4, Lesson 1 — Trig Ratios: Finding Sides Checker</title>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../assets/styles.css">
</head>
<body>
<header class="hdr">
  <div class="hdr-left"><a class="hdr-back" href="../index.html">&larr; All Checkers</a><h1>Trig Ratios: Finding Sides</h1><div class="sub">Week 4 · Lesson 1 — Learning Lab</div></div>
  <div class="hdr-dots" id="hdrDots"></div>
</header>
<main class="main wide" id="main"><noscript><p>This checker needs JavaScript. Work the Learning Lab on the printed sheet and check with your teacher.</p></noscript></main>

<script src="../js/checker-kit.js"></script>
<script>
/* Week 4 Lesson 1 Learning Lab. Split layout, coarse first. A miss opens the
   Problem-Solving Plan: name the sides from the marked angle, pick the ratio,
   substitute, solve, calculator. Answers to the nearest tenth (tol 0.06).
   Same 7 problems as the printed Learning Lab. Choice answers are djb2 hashes. */
K.run(${JSON.stringify(P,null,1)}, { layout:'split' });
</script>
</body>
</html>
`;
fs.writeFileSync('checkers/week4-lesson1-trig-sides.html',page);
console.log('ok',page.length,JSON.stringify(ANSWERS));

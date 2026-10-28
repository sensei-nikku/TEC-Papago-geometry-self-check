/* Week 4 Lesson 3 checker (Angles of Elevation and Depression). Words only, no
   figures: sketching the triangle from the words is the lesson's skill, so every
   prompt says to sketch first. Coarse first: each problem asks for the answer
   straight away. A miss opens the Problem-Solving Plan one rung at a time:
   (depression only) move the angle to the bottom (SG-5), name the two sides from
   the angle at the bottom, pick the ratio or inverse, pick the equation, pick the
   move (sides only), then the calculator. Answers to the nearest tenth (tol 0.05:
   the right tenth or the unrounded value passes; a wrongly rounded tenth does not).
   Traps: hand-written ones for this lesson's mistakes (measuring from the wall,
   the ground distance instead of the line of sight) come first, then traps
   generated from every wrong ratio, flipped ratio, missing inverse, radian mode,
   and a chopped answer. The build fails if any trap lands within tolerance.
   Run: node build_w4l3.js  -> checkers/week4-lesson3-elevation-depression.html */
const fs=require('fs');
function djb2(s){var v=5381;for(var i=0;i<s.length;i++){v=((v<<5)+v)+s.charCodeAt(i);v=v&v;}return v>>>0;}
const DEG='°',DOT='·',TH='θ',INV='⁻¹',STAR='★';
const rad=d=>d*Math.PI/180, F={sin:d=>Math.sin(rad(d)),cos:d=>Math.cos(rad(d)),tan:d=>Math.tan(rad(d))};
const RF={sin:Math.sin,cos:Math.cos,tan:Math.tan};
const AF={sin:x=>Math.asin(x)*180/Math.PI,cos:x=>Math.acos(x)*180/Math.PI,tan:x=>Math.atan(x)*180/Math.PI};
const SIDES={sin:['opp','hyp'],cos:['adj','hyp'],tan:['opp','adj']};
const TOL=0.05;

function ch(label,ask,opts,i,nudge){return {tool:'choice',stack:true,label,ask,options:opts,ch:djb2(opts[i]),shuffle:true,nudges:[nudge]};}
function num(label,a,unit,traps,nudge){return {tool:'numeric',label,answer:a,tol:TOL,closeBand:0.03,unit,traps:traps||[],nudges:[nudge||'Sketch it, move any angle of depression to the bottom, name the sides, then solve.']};}
function coarse(step,ladder){return Object.assign(step,{sub:ladder});}
const NAMES=['opposite (opp)','adjacent (adj)','hypotenuse (hyp)'], IDX={opp:0,adj:1,hyp:2};
const NAME_NUDGE='Work from the angle at the bottom. Hypotenuse: the slanted side, across from the square corner. Opposite: across from the angle. Adjacent: touches the angle and is not the hypotenuse.';
const RATIOS=['sin '+TH+' = opp / hyp','cos '+TH+' = adj / hyp','tan '+TH+' = opp / adj'];
const INVS=[TH+' = sin'+INV+'(opp / hyp)',TH+' = cos'+INV+'(adj / hyp)',TH+' = tan'+INV+'(opp / adj)'];
const RIDX={sin:0,cos:1,tan:2};
const RADIAN='Your calculator is in radian mode. Switch to degree mode: sin 30 must show 0.5.';
const CHOP='Close: round to the nearest tenth. Look at the next digit; 5 or more rounds up.';

/* Trap list: custom first (their messages win), then generated; dedupe; guard. */
function finishTraps(ans,custom,gen){
  const out=[], add=(v,msg,tol)=>{ if(!isFinite(v)) return;
    if(Math.abs(v-ans)<=TOL) throw new Error('trap collides with answer ('+ans.toFixed(3)+'): '+msg);
    if(out.some(t=>Math.abs(t.near-v)<0.12)) return; out.push({near:+v.toFixed(4),tol:tol||0.06,msg}); };
  custom.forEach(t=>add(t[0],t[1],t[2])); gen.forEach(t=>add(t[0],t[1],t[2]));
  const chop=Math.floor(ans*10)/10; if(Math.round(ans*10)/10!==chop) add(chop,CHOP,0.02);
  return out;
}

/* The move-to-the-bottom rung for an angle of depression. */
function moveRung(where){return ch('Plan 3: Facts as math','The angle of depression is at the top. Where do you work with it?',
  ['at the bottom, at the '+where.bottom+': it is the same angle ('+STAR+' SG-5)','at the top, between the '+where.wall+' and the line of sight','at the square corner'],0,
  'Angle of depression (from the top) = angle of elevation (from the bottom). Move it to the bottom.');}

/* Find a side. s = {given side: value}; w = wanted side; x = its letter. */
function probSide(o){
  const {id,numLbl,prompt,given,want,a,fn,g,gv,w,x,depr,where,custom,unit}=o;
  const xTop = SIDES[fn][0]===w;                            // x is the ratio's top side
  const ans = xTop ? gv*F[fn](a) : gv/F[fn](a);
  const gen=[];
  ['sin','cos','tan'].filter(r=>r!==fn).forEach(r=>gen.push([xTop?gv*F[r](a):gv/F[r](a),'That is what '+r+' gives. Name the sides from the angle at the bottom first.']));
  gen.push([xTop?gv/F[fn](a):gv*F[fn](a), xTop?(x+' is on top, so multiply both sides by '+gv+'.'):(x+' is on the bottom of the fraction, so multiplying doesn’t free it. Treat '+x+' as the missing factor, like 2 '+DOT+' ☐ = 6.')]);
  gen.push([xTop?gv*RF[fn](a):gv/RF[fn](a),RADIAN,0.1]);
  const traps=finishTraps(ans,custom||[],gen);
  const eq = xTop ? `${fn} ${a}${DEG} = ${x} / ${gv}` : `${fn} ${a}${DEG} = ${gv} / ${x}`;
  const eqFlip = xTop ? `${fn} ${a}${DEG} = ${gv} / ${x}` : `${fn} ${a}${DEG} = ${x} / ${gv}`;
  const other={sin:'cos',cos:'sin',tan:'sin'}[fn];
  const eqWrong = `${other} ${a}${DEG} = ${xTop?x+' / '+gv:gv+' / '+x}`;
  const mv = xTop ? [`${x} = ${gv} ${DOT} ${fn} ${a}${DEG}`,`${x} = ${gv} / ${fn} ${a}${DEG}`,`${x} = ${fn} ${a}${DEG} / ${gv}`]
                  : [`${x} = ${gv} / ${fn} ${a}${DEG}`,`${x} = ${gv} ${DOT} ${fn} ${a}${DEG}`,`${x} = ${fn} ${a}${DEG} / ${gv}`];
  const ladder=(depr?[moveRung(where)]:[]).concat([
    ch('Plan 3: Facts as math',`From the ${a}${DEG} angle at the bottom, ${where.g} is the…`,NAMES,IDX[g],NAME_NUDGE),
    ch('Plan 3: Facts as math',`${where.x} is the…`,NAMES,IDX[w],NAME_NUDGE),
    ch('Plan 4: Subgoal','Which ratio uses those two sides?',RATIOS,RIDX[fn],'SOH CAH TOA: pick the ratio built from the two sides you just named.'),
    ch('Plan 5: Substitute','Which equation?',[eq,eqFlip,eqWrong],0,'Put each number where its side goes in the ratio.'),
    ch('Plan 5: Solve','Which move frees '+x+'?',mv,0, xTop?(x+' is on top, over '+gv+'. Multiply both sides by '+gv+'.'):(x+' is on the bottom. Multiply both sides by '+x+'; then '+x+' is the missing factor.')),
    num(`Plan 6: Calculator, degree mode. ${x} ≈ ? (nearest tenth)`,ans,unit,traps,'Check degree mode, then round to one digit after the point.')]);
  return {id,num:numLbl,prompt,figure:'',given,want,reference:REF,pipeline:[coarse(num(`${x} ≈ ? (nearest tenth)`,ans,unit,traps),ladder)],_ans:ans};
}

/* Find an angle from two sides. s = {opp:200, adj:600}. */
function probAngle(o){
  const {id,numLbl,prompt,given,want,fn,s,depr,where,custom}=o;
  const [tn,bn]=SIDES[fn], top=s[tn], bot=s[bn], r=top/bot, ans=AF[fn](r);
  const comp=v=>Math.abs((90-ans)-v)<0.06, gen=[];
  if(fn==='tan') gen.push([AF.tan(1/r),'The sides are in the wrong order, so you got the other acute angle. For tan, opp goes on top.']);
  ['sin','cos','tan'].filter(g=>g!==fn).forEach(g=>[r,1/r].forEach(xv=>{ if(g!=='tan'&&xv>1) return; const v=AF[g](xv);
    gen.push([v,'That is what '+g+INV+' gives'+(comp(v)?': the other acute angle':'')+'. Name the two sides from the angle at the bottom first.']); }));
  gen.push([F[fn](r),'You pressed '+fn+', not '+fn+INV+'. The answer is an angle, so undo the ratio: use 2nd (or SHIFT) first.',0.006]);
  gen.push([rad(ans),RADIAN,0.01]);
  const traps=finishTraps(ans,custom||[],gen);
  const names=Object.keys(s);
  const ladder=(depr?[moveRung(where)]:[]).concat([
    ch('Plan 3: Facts as math',`From the angle at the bottom, ${where[names[0]]} is the…`,NAMES,IDX[names[0]],NAME_NUDGE),
    ch('Plan 3: Facts as math',`And ${where[names[1]]} is the…`,NAMES,IDX[names[1]],NAME_NUDGE),
    ch('Plan 4: Subgoal','Which inverse uses those two sides?',INVS,RIDX[fn],'Pick the inverse built from the two sides you just named.'),
    ch('Plan 5: Substitute and undo','Which equation?',[`${TH} = ${fn}${INV}(${top} / ${bot})`,`${TH} = ${fn}${INV}(${bot} / ${top})`,`${TH} = ${fn}(${top} / ${bot})`],0,
       'Keep the sides in the ratio’s order, and keep the −1: it undoes the ratio so the angle comes out.'),
    num(`Plan 6: Calculator, degree mode. ${TH} ≈ ? (nearest tenth of a degree)`,ans,DEG,traps,'Check degree mode, then round to one digit after the point.')]);
  return {id,num:numLbl,prompt,figure:'',given,want,reference:REF,pipeline:[coarse(num(`${TH} ≈ ? (nearest tenth of a degree)`,ans,DEG,traps),ladder)],_ans:ans};
}

const REF='<div class="surf-label">Formula Box — stays on screen</div>'+
 '<div class="ref-row"><div class="ref-cell"><div class="rc-t">'+STAR+' SG-5</div><div class="rc-s">angle of depression (from the top) = angle of elevation (from the bottom)</div></div></div>'+
 '<div class="ref-row" style="margin-top:8px"><div class="ref-cell"><div class="rc-t">SOH</div><div class="rc-s">sin '+TH+' = opp / hyp</div></div>'+
 '<div class="ref-cell"><div class="rc-t">CAH</div><div class="rc-s">cos '+TH+' = adj / hyp</div></div>'+
 '<div class="ref-cell"><div class="rc-t">TOA</div><div class="rc-s">tan '+TH+' = opp / adj</div></div></div>'+
 '<div class="ref-row" style="margin-top:8px"><div class="ref-cell"><div class="rc-t">Angle known</div><div class="rc-s">find a side with sin, cos, or tan</div></div>'+
 '<div class="ref-cell"><div class="rc-t">Two sides known</div><div class="rc-s">find the angle with sin'+INV+', cos'+INV+', or tan'+INV+'</div></div></div>'+
 '<div class="ref-note">Plan: 1 read and sketch '+DOT+' 2 goal '+DOT+' 3 facts as math (move an angle of depression to the bottom, then name the sides) '+DOT+' 4 pick the ratio '+DOT+' 5 substitute and solve '+DOT+' 6 answer and check. Calculator in degree mode.</div>';

const SK=' Sketch the triangle on your paper first. Round to the nearest tenth.';
const P=[
 probSide({id:'t1',numLbl:'T-1',prompt:'You stand 120 ft from a building. The angle of elevation to the roof is 22'+DEG+'. How tall is the building?'+SK,
  given:[{v:'120 ft',k:'along the ground'},{v:'22'+DEG,k:'angle of elevation'}],want:'h, the height, in feet',unit:'ft',
  a:22,fn:'tan',g:'adj',gv:120,w:'opp',x:'h',where:{g:'the 120 ft along the ground',x:'And the height h'},custom:[]}),
 probSide({id:'t2',numLbl:'T-2',prompt:'From the top of a 45 ft lighthouse, the angle of depression to a boat is 18'+DEG+'. How far is the boat from the base of the lighthouse?'+SK,
  given:[{v:'45 ft',k:'the lighthouse'},{v:'18'+DEG,k:'angle of depression'}],want:'d, the distance along the water, in feet',unit:'ft',depr:true,
  a:18,fn:'tan',g:'opp',gv:45,w:'adj',x:'d',where:{bottom:'boat',wall:'lighthouse',g:'the 45 ft height',x:'And the distance d along the water'},
  custom:[[45*Math.tan(rad(18)),'You measured the 18'+DEG+' from the lighthouse, not from level. An angle of depression starts at the level line: move it to the bottom, at the boat.']]}),
 probSide({id:'t3',numLbl:'T-3',prompt:'A kite string is 90 ft long. The angle of elevation of the string is 35'+DEG+'. Treat your hand as ground level. How high is the kite?'+SK,
  given:[{v:'90 ft',k:'the string'},{v:'35'+DEG,k:'angle of elevation'}],want:'h, the height of the kite, in feet',unit:'ft',
  a:35,fn:'sin',g:'hyp',gv:90,w:'opp',x:'h',where:{g:'the 90 ft string',x:'And the height h'},custom:[]}),
 probSide({id:'a1',numLbl:'A-1',prompt:'A lifeguard’s eyes are 20 ft above the water. The angle of depression to a swimmer is 9'+DEG+'. How far out is the swimmer, along the water?'+SK,
  given:[{v:'20 ft',k:'eyes above the water'},{v:'9'+DEG,k:'angle of depression'}],want:'d, the distance along the water, in feet',unit:'ft',depr:true,
  a:9,fn:'tan',g:'opp',gv:20,w:'adj',x:'d',where:{bottom:'swimmer',wall:'lifeguard stand',g:'the 20 ft height',x:'And the distance d along the water'},
  custom:[[20*Math.tan(rad(9)),'You measured the 9'+DEG+' from the lifeguard stand, not from level. Move the angle of depression to the bottom, at the swimmer.']]}),
 probAngle({id:'a2',numLbl:'A-2',prompt:'A 6 ft person casts a 10 ft shadow. What is the angle of elevation of the sun? It is the angle at the tip of the shadow. Sketch the triangle on your paper first. Round to the nearest tenth.',
  given:[{v:'6 ft',k:'the person'},{v:'10 ft',k:'the shadow'}],want:TH+', the sun’s angle of elevation',fn:'tan',s:{opp:6,adj:10},
  where:{opp:'the 6 ft person',adj:'the 10 ft shadow'},custom:[]}),
 probAngle({id:'a3',numLbl:'A-3',prompt:'From the top of a 200 ft cliff, you look down at a boat 600 ft from the base of the cliff. What is the angle of depression? Sketch the triangle on your paper first. Round to the nearest tenth.',
  given:[{v:'200 ft',k:'the cliff'},{v:'600 ft',k:'boat to the base'}],want:TH+', the angle of depression',fn:'tan',s:{opp:200,adj:600},depr:true,
  where:{bottom:'boat',wall:'cliff',opp:'the 200 ft cliff',adj:'the 600 ft to the boat'},
  custom:[[Math.atan(600/200)*180/Math.PI,'That is the angle between the cliff and the line of sight. An angle of depression is measured from level: it equals the angle at the boat.']]}),
 probSide({id:'a4',numLbl:'A-4',prompt:'A drone hovers 85 ft above the ground. The angle of depression from the drone to a car is 31'+DEG+'. How far is the drone from the car, measured along the line of sight?'+SK,
  given:[{v:'85 ft',k:'above the ground'},{v:'31'+DEG,k:'angle of depression'}],want:'L, the line-of-sight distance, in feet',unit:'ft',depr:true,
  a:31,fn:'sin',g:'opp',gv:85,w:'hyp',x:'L',where:{bottom:'car',wall:'drone’s straight-down line',g:'the 85 ft height',x:'And the line of sight L'},
  custom:[[85/Math.tan(rad(31)),'That is the distance along the ground. The question asks along the line of sight: the slanted side.'],
          [85/Math.cos(rad(31)),'You measured the 31'+DEG+' from straight down, not from level. Move the angle of depression to the bottom, at the car.']]})
];
const ANSWERS=P.map(p=>[p.id,+p._ans.toFixed(4)]); P.forEach(p=>delete p._ans);

const page=`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Week 4, Lesson 3 — Angles of Elevation and Depression Checker</title>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../assets/styles.css">
</head>
<body>
<header class="hdr">
  <div class="hdr-left"><a class="hdr-back" href="../index.html">&larr; All Checkers</a><h1>Angles of Elevation and Depression</h1><div class="sub">Week 4 · Lesson 3 — Learning Lab</div></div>
  <div class="hdr-dots" id="hdrDots"></div>
</header>
<main class="main wide" id="main"><noscript><p>This checker needs JavaScript. Work the Learning Lab on paper and check with your teacher.</p></noscript></main>

<script src="../js/checker-kit.js"></script>
<script>
/* Week 4 Lesson 3 Learning Lab. Split layout, coarse first, words only (sketch
   first). A miss opens the Problem-Solving Plan: move an angle of depression to
   the bottom, name the sides, pick the ratio or inverse, substitute, solve,
   calculator. Answers to the nearest tenth (tol 0.05). Choice answers are djb2 hashes. */
K.run(${JSON.stringify(P,null,1)}, { layout:'split' });
</script>
</body>
</html>
`;
fs.writeFileSync('checkers/week4-lesson3-elevation-depression.html',page);
console.log('ok',page.length,JSON.stringify(ANSWERS));

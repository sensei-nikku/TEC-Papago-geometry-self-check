/* Week 4 Lesson 2 checker (Inverse Trig: Finding Angles). Coarse first: each
   problem asks for the angle straight away. A miss opens the Problem-Solving Plan
   one rung at a time: 3 facts as math (name both given sides from theta), 4 subgoal
   (which inverse), 5 substitute and undo (the equation, sides in order, with the -1),
   6 calculator in degree mode. Answers to the nearest tenth of a degree.
   Figures are drawn to scale and show only the two numbers and theta, so naming
   the sides stays the student's job. Traps are generated from every wrong move:
   other inverses, flipped ratio, no inverse (sin instead of sin^-1), radian mode,
   and a chopped answer.
   Run: node build_w4l2.js  -> checkers/week4-lesson2-inverse-angles.html */
const fs=require('fs');
function djb2(s){var v=5381;for(var i=0;i<s.length;i++){v=((v<<5)+v)+s.charCodeAt(i);v=v&v;}return v>>>0;}
const DEG='°',DOT='·',TH='θ',INV='⁻¹';
const rad=d=>d*Math.PI/180, SIN=d=>Math.sin(rad(d)), COS=d=>Math.cos(rad(d)), TAN=d=>Math.tan(rad(d));
const ASIN=x=>Math.asin(x)*180/Math.PI, ACOS=x=>Math.acos(x)*180/Math.PI, ATAN=x=>Math.atan(x)*180/Math.PI;
const AF={sin:ASIN,cos:ACOS,tan:ATAN}, FF={sin:SIN,cos:COS,tan:TAN};
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
    addText(T[0]-bis[0]*12, T[1]-bis[1]*12+5, cfg.angText||(cfg.ang+DEG), anc2, TH_, 'th'); }
  else addText(T[0]+bis[0]*36, T[1]+bis[1]*36+5, cfg.angText||(cfg.ang+DEG), 'middle', TH_, 'th');
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
  return '<svg class="figtri" viewBox="0 0 '+W.toFixed(0)+' '+H.toFixed(0)+'" style="width:100%;height:auto;max-width:'+Math.round(W*1.5)+'px" role="img" aria-label="Right triangle drawn to scale. The marked angle is '+(cfg.angText?'theta, the unknown':cfg.ang+' degrees')+'. Labelled sides: '+Object.values(cfg.lab).join(' and ')+'." xmlns="http://www.w3.org/2000/svg">'+e+'</svg>';
}

/* ---- step builders (same shapes as Lesson 1) ---- */
function ch(label,ask,opts,i,nudge){return {tool:'choice',stack:true,label,ask,options:opts,ch:djb2(opts[i]),shuffle:true,nudges:[nudge]};}
function num(label,a,traps,nudge){return {tool:'numeric',label,answer:a,tol:0.05,closeBand:0.03,unit:DEG,traps:traps||[],nudges:[nudge||'Name the two sides from '+TH+', pick the inverse, then use the calculator.']};}
function coarse(step,ladder){return Object.assign(step,{sub:ladder});}
const NAMES=['opposite (opp)','adjacent (adj)','hypotenuse (hyp)'], IDX={opp:0,adj:1,hyp:2};
const NAME_NUDGE='Hypotenuse: across from the square corner. Opposite: across from '+TH+'. Adjacent: touches '+TH+' and is not the hypotenuse.';
const INVS=[TH+' = sin'+INV+'(opp / hyp)',TH+' = cos'+INV+'(adj / hyp)',TH+' = tan'+INV+'(opp / adj)'], RIDX={sin:0,cos:1,tan:2};
const SIDES={sin:['opp','hyp'],cos:['adj','hyp'],tan:['opp','adj']};
const RADIAN='Your calculator is in radian mode. Switch to degree mode: sin 30 must show 0.5.';

/* Every wrong move, computed, becomes a named trap (deduped; never within tolerance of the answer). */
function trapsFor(fn,top,bot,ans){
  const r=top/bot, out=[], add=(v,msg,tol)=>{ if(!isFinite(v)) return; if(Math.abs(v-ans)<=0.05) throw new Error('trap collides with answer: '+msg);
    if(out.some(t=>Math.abs(t.near-v)<0.12)) return; out.push({near:+v.toFixed(4),tol:tol||0.06,msg}); };
  const comp=v=>Math.abs((90-ans)-v)<0.06;
  // flipped ratio, same inverse (tan only; sin/cos give ERROR)
  if(fn==='tan') add(ATAN(1/r),'The sides are in the wrong order, so you got the other acute angle. For tan, opp goes on top.');
  ['sin','cos','tan'].filter(g=>g!==fn).forEach(g=>{
    [[r,'r'],[1/r,'flip']].forEach(([x])=>{ if(g!=='tan'&&x>1) return; const v=AF[g](x);
      add(v,'That is what '+g+INV+' gives'+(comp(v)?': the other acute angle':'')+'. Name the two sides from '+TH+' first, then pick the inverse that uses them.'); }); });
  add(FF[fn](r),'You pressed '+fn+', not '+fn+INV+'. The answer is an angle, so undo the ratio: use the 2nd (or SHIFT) key first.',0.006);
  add(rad(ans),RADIAN,0.01);
  const chop=Math.floor(ans*10)/10; if(Math.round(ans*10)/10!==chop) add(chop,'Close: round to the nearest tenth. Look at the next digit; 5 or more rounds up.',0.02);
  return out;
}

/* One problem: s = {opp:7, hyp:13}; fn = the inverse; where = how each given side is named in the ask. */
function prob(o){
  const {id,numLbl,prompt,figure,given,want,fn,s,where,extra}=o;
  const [tn,bn]=SIDES[fn], top=s[tn], bot=s[bn], ans=AF[fn](top/bot);
  const names=Object.keys(s);
  const ladder=[
    ch('Plan 3: Facts as math',`Stand at ${TH}. ${where[names[0]]} is the…`,NAMES,IDX[names[0]],NAME_NUDGE),
    ch('Plan 3: Facts as math',`${where[names[1]]} is the…`,NAMES,IDX[names[1]],NAME_NUDGE),
    ch('Plan 4: Subgoal','Which inverse uses those two sides?',INVS,RIDX[fn],'Pick the inverse built from the two sides you just named.'),
    ch('Plan 5: Substitute and undo','Which equation?',[`${TH} = ${fn}${INV}(${top} / ${bot})`,`${TH} = ${fn}${INV}(${bot} / ${top})`,`${TH} = ${fn}(${top} / ${bot})`],0,
       'Keep the sides in the ratio’s order, and keep the '+INV.replace('⁻','−')+': it undoes the ratio so the angle comes out. ERROR on the calculator means the hypotenuse ended up on top.'),
    num(`Plan 6: Calculator, degree mode. ${TH} ≈ ? (nearest tenth of a degree)`,ans,trapsFor(fn,top,bot,ans),'Check degree mode, then round to one digit after the point.')];
  const pipeline=[coarse(num(`${TH} ≈ ? (nearest tenth of a degree)`,ans,trapsFor(fn,top,bot,ans)),ladder)].concat(extra||[]);
  return {id,num:numLbl,prompt,figure:figure||'',given,want,reference:REF,pipeline,_ans:ans};
}

const REF='<div class="surf-label">Formula Box — stays on screen</div>'+
 '<div class="ref-row"><div class="ref-cell"><div class="rc-t">opp and hyp</div><div class="rc-s">'+TH+' = sin'+INV+'(opp / hyp)</div></div>'+
 '<div class="ref-cell"><div class="rc-t">adj and hyp</div><div class="rc-s">'+TH+' = cos'+INV+'(adj / hyp)</div></div>'+
 '<div class="ref-cell"><div class="rc-t">opp and adj</div><div class="rc-s">'+TH+' = tan'+INV+'(opp / adj)</div></div></div>'+
 '<div class="ref-row" style="margin-top:8px"><div class="ref-cell"><div class="rc-t">hyp</div><div class="rc-s">across from the square corner</div></div>'+
 '<div class="ref-cell"><div class="rc-t">opp</div><div class="rc-s">across from '+TH+'</div></div>'+
 '<div class="ref-cell"><div class="rc-t">adj</div><div class="rc-s">touches '+TH+', not the hyp</div></div></div>'+
 '<div class="ref-note">Plan: 1 read '+DOT+' 2 goal '+DOT+' 3 facts as math (name both sides) '+DOT+' 4 pick the inverse '+DOT+' 5 substitute and undo '+DOT+' 6 answer and check. '+
 'Calculator in degree mode; the inverse key is 2nd (or SHIFT), then sin, cos, or tan. The answer is an angle between 0'+DEG+' and 90'+DEG+'.</div>';

const leg=(h,a)=>Math.sqrt(h*h-a*a);
const P=[
 prob({id:'t1',numLbl:'T-1',prompt:'Find '+TH+'. Round to the nearest tenth.',fn:'sin',s:{opp:7,hyp:13},
  figure:figTri({h:leg(13,7),v:7,vx:'W',ang:ASIN(7/13),angText:TH,lab:{opp:'7',hyp:'13'}}),
  given:[{v:'7',k:'a side'},{v:'13',k:'a side'}],want:TH+', to the nearest tenth of a degree',where:{opp:'The side marked 7',hyp:'The side marked 13'}}),
 prob({id:'t2',numLbl:'T-2',prompt:'Find '+TH+'. Round to the nearest tenth.',fn:'cos',s:{adj:11,hyp:16},
  figure:figTri({h:11,v:leg(16,11),vx:'W',ang:ACOS(11/16),angText:TH,lab:{adj:'11',hyp:'16'}}),
  given:[{v:'11',k:'a side'},{v:'16',k:'a side'}],want:TH+', to the nearest tenth of a degree',where:{adj:'The side marked 11',hyp:'The side marked 16'}}),
 prob({id:'t3',numLbl:'T-3',prompt:'Find '+TH+'. Round to the nearest tenth.',fn:'tan',s:{opp:8,adj:5},
  figure:figTri({h:5,v:8,vx:'W',ang:ATAN(8/5),angText:TH,lab:{opp:'8',adj:'5'}}),
  given:[{v:'8',k:'a side'},{v:'5',k:'a side'}],want:TH+', to the nearest tenth of a degree',where:{opp:'The side marked 8',adj:'The side marked 5'}}),
 prob({id:'a1',numLbl:'A-1',prompt:'Find '+TH+'. Round to the nearest tenth. The picture is turned around: find '+TH+' first.',fn:'cos',s:{adj:13,hyp:20},
  figure:figTri({h:13,v:leg(20,13),vx:'W',flip:1,ang:ACOS(13/20),angText:TH,lab:{adj:'13',hyp:'20'}}),
  given:[{v:'13',k:'a side'},{v:'20',k:'a side'}],want:TH+', to the nearest tenth of a degree',where:{adj:'The side marked 13',hyp:'The side marked 20'}}),
 prob({id:'a2',numLbl:'A-2',prompt:'A roof rises 7 in for every 12 in across. What angle does the roof make with level? Round to the nearest tenth. No picture: sketch the right triangle on your paper first.',fn:'tan',s:{opp:7,adj:12},
  given:[{v:'rises 7 in',k:'up'},{v:'12 in across',k:'level'}],want:TH+', the roof angle, to the nearest tenth of a degree',where:{opp:'The rise (7 in)',adj:'The run across (12 in)'}}),
 prob({id:'a3',numLbl:'A-3',prompt:'Find '+TH+'. Round to the nearest tenth. '+TH+' is at the top this time.',fn:'sin',s:{opp:9,hyp:17},
  figure:figTri({h:9,v:leg(17,9),vx:'N',flip:1,ang:ASIN(9/17),angText:TH,lab:{opp:'9',hyp:'17'}}),
  given:[{v:'9',k:'a side'},{v:'17',k:'a side'}],want:TH+', to the nearest tenth of a degree',where:{opp:'The side marked 9',hyp:'The side marked 17'}}),
 prob({id:'a4',numLbl:'A-4',prompt:'A 16 ft ladder (from its foot to where it rests) reaches 15 ft up a wall. What angle does it make with the ground? Round to the nearest tenth. Then compare it with OSHA’s safe angle, about 75.5'+DEG+'.',fn:'sin',s:{opp:15,hyp:16},
  given:[{v:'16 ft',k:'the ladder'},{v:'15 ft',k:'up the wall'}],want:TH+', then how it compares with 75.5'+DEG,where:{opp:'The height up the wall (15 ft)',hyp:'The ladder (16 ft)'},
  extra:[ch('Check against OSHA','OSHA’s safe angle is about 75.5'+DEG+'. This ladder is…',
    ['less steep than the safe angle: its base is too far from the wall','steeper than the safe angle: its base is too close to the wall','right at the safe angle'],0,
    'Compare your angle with 75.5'+DEG+'. A smaller angle means a flatter ladder.')]})
];
const ANSWERS=P.map(p=>[p.id,+p._ans.toFixed(4)]); P.forEach(p=>delete p._ans);

const page=`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Week 4, Lesson 2 — Inverse Trig: Finding Angles Checker</title>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../assets/styles.css">
</head>
<body>
<header class="hdr">
  <div class="hdr-left"><a class="hdr-back" href="../index.html">&larr; All Checkers</a><h1>Inverse Trig: Finding Angles</h1><div class="sub">Week 4 · Lesson 2 — Learning Lab</div></div>
  <div class="hdr-dots" id="hdrDots"></div>
</header>
<main class="main wide" id="main"><noscript><p>This checker needs JavaScript. Work the Learning Lab on paper and check with your teacher.</p></noscript></main>

<script src="../js/checker-kit.js"></script>
<script>
/* Week 4 Lesson 2 Learning Lab. Split layout, coarse first. A miss opens the
   Problem-Solving Plan: name both sides from theta, pick the inverse, substitute
   and undo, calculator. Answers to the nearest tenth of a degree (tol 0.05: the right tenth or
   the unrounded value passes; a wrongly rounded tenth does not).
   Choice answers are djb2 hashes. */
K.run(${JSON.stringify(P,null,1)}, { layout:'split' });
</script>
</body>
</html>
`;
fs.writeFileSync('checkers/week4-lesson2-inverse-angles.html',page);
console.log('ok',page.length,JSON.stringify(ANSWERS));

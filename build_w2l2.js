/* Week 2 Lesson 2 checker (Rotations & Symmetry). Ladders follow the handout's
   Transformation Plan: 1 group, 2 formula (cw -> ccw first), 4 maps to,
   6a/6b solve. Run: node build_w2l2.js -> checkers/week2-lesson2-rotate-symmetry.html */
const fs=require('fs');
function djb2(s){var v=5381;for(var i=0;i<s.length;i++){v=((v<<5)+v)+s.charCodeAt(i);v=v&v;}return v>>>0;}
const M='\u2212',PR='\u2032',MT='\u21A6',D='\u00B0';
const GROUPS=['translation (a slide)','reflection (a flip)','rotation (a turn)'];
const FORMS=['R 90'+D+' (counterclockwise)','R 180'+D,'R 270'+D+' (counterclockwise)'];
const MAPS=['(x, y) '+MT+' ('+M+'y, x)','(x, y) '+MT+' ('+M+'x, '+M+'y)','(x, y) '+MT+' (y, '+M+'x)'];
function ch(label,ask,opts,i,nudge){return {tool:'choice',stack:true,label,ask,options:opts,ch:djb2(opts[i]),shuffle:true,nudges:[nudge]};}
const g=()=>ch('Plan 1: Group','Slide, flip, or turn?',GROUPS,2,'Turning about the origin: a rotation.');
const f=(i,cw)=>ch('Plan 2: Formula',cw?'It says clockwise. Which counterclockwise formula matches?':'Which formula?',FORMS,i,cw?'90'+D+' clockwise is 270'+D+' counterclockwise.':'Match the degrees to the Formula Box.');
const mp=i=>ch('Plan 4: Maps to','Which maps-to line goes with that formula?',MAPS,i,'Copy the maps-to line from the Formula Box.');
function num(label,a,traps,nudge){return {tool:'numeric',label,answer:a,tol:0,closeBand:0,traps:traps||[],nudges:[nudge||'Say \u201cthe opposite of \u2026\u201d before you write the number.']};}
function pt(label,a,traps){return {tool:'point',label,answer:a,traps:traps||[],nudges:['Copy the maps-to, substitute, then simplify.']};}
function coarse(label,a,traps,ladder){return Object.assign(pt(label,a,traps),{sub:ladder});}
function plot(prompt,pre,img,labels){return {tool:'plot',label:'Plot the image',prompt,range:6,preimage:pre.map((p,i)=>({x:p[0],y:p[1],label:labels[i]})),targets:img.map((p,i)=>({label:labels[i]+PR,ch:djb2(p[0]+','+p[1])}))};}
const cell=(t,s)=>'<div class="ref-cell"><div class="rc-t">'+t+'</div><div class="rc-s">'+s+'</div></div>';
const REF='<div class="surf-label">Formula Box \u2014 stays on screen</div>'+
 '<div class="ref-row">'+cell('Rotate 90'+D,'(x, y) '+MT+' ('+M+'y, x)')+cell('Rotate 180'+D,'(x, y) '+MT+' ('+M+'x, '+M+'y)')+cell('Rotate 270'+D,'(x, y) '+MT+' (y, '+M+'x)')+'</div>'+
 '<div class="ref-row" style="margin-top:8px">'+cell('Clockwise?','90'+D+' cw = 270'+D+' ccw')+cell('Smallest turn','360 \u00B7 1/n')+cell('Forget a rule?','apply 90'+D+' again')+'</div>'+
 '<div class="ref-note">Plan: 1 group \u00B7 2 formula \u00B7 3 collect \u00B7 4 maps to \u00B7 5 substitute \u00B7 6 solve. Counterclockwise unless it says clockwise. '+M+'x means the opposite of x.</div>';
const CW='That is the clockwise answer. Counterclockwise unless the problem says clockwise.';
const P=[
 {id:'t1',num:'T-1',prompt:'Rotate the point (3, '+M+'2) by 90'+D+' about the origin.',given:[{v:'(3, '+M+'2)',k:'the point'},{v:'90'+D,k:'counterclockwise'}],want:'the image, as (x, y)',reference:REF,
  pipeline:[coarse('The image',[2,3],[{p:[-2,-3],msg:CW},{p:[-3,-2],msg:'For 90'+D+': swap, and the new FIRST coordinate is the opposite of y.'}],[g(),f(0),mp(0),num("Plan 6a: x\u2032 = the opposite of "+M+"2",2),num("Plan 6b: y\u2032 = the old x",3)])]},
 {id:'t2',num:'T-2',prompt:'Rotate the point ('+M+'4, 1) by 180'+D+' about the origin.',given:[{v:'('+M+'4, 1)',k:'the point'},{v:'180'+D,k:'a half turn'}],want:'the image, as (x, y)',reference:REF,
  pipeline:[coarse('The image',[4,-1],[{p:[4,1],msg:'180'+D+' changes BOTH signs.'},{p:[-4,-1],msg:'180'+D+' changes BOTH signs.'},{p:[-1,-4],msg:'180'+D+' does not swap.'}],[g(),f(1),mp(1),num("Plan 6a: x\u2032 = the opposite of "+M+"4",4),num("Plan 6b: y\u2032 = the opposite of 1",-1)])]},
 {id:'t3',num:'T-3',prompt:'Rotate the point (2, 6) by 270'+D+' counterclockwise about the origin.',given:[{v:'(2, 6)',k:'the point'},{v:'270'+D,k:'three quarter turns'}],want:'the image, as (x, y)',reference:REF,
  pipeline:[coarse('The image',[6,-2],[{p:[-6,2],msg:'That is the 90'+D+' answer. 270'+D+' maps to (y, '+M+'x).'}],[g(),f(2),mp(2),num("Plan 6a: x\u2032 = the old y",6),num("Plan 6b: y\u2032 = the opposite of 2",-2)])]},
 {id:'a1',num:'A-1',prompt:'Rotate the point ('+M+'5, '+M+'3) by 90'+D+' about the origin.',given:[{v:'('+M+'5, '+M+'3)',k:'the point'},{v:'90'+D,k:'counterclockwise'}],want:'the image, as (x, y)',reference:REF,
  pipeline:[coarse('The image',[3,-5],[{p:[-3,5],msg:CW}],[g(),f(0),mp(0),num("Plan 6a: x\u2032 = the opposite of "+M+"3",3),num("Plan 6b: y\u2032 = the old x",-5)])]},
 {id:'a2',num:'A-2',prompt:'Rotate the point (1, '+M+'6) by 90'+D+' CLOCKWISE about the origin.',given:[{v:'(1, '+M+'6)',k:'the point'},{v:'90'+D+' clockwise',k:'change it first'}],want:'the image, as (x, y)',reference:REF,
  pipeline:[coarse('The image',[-6,-1],[{p:[6,1],msg:'That is the counterclockwise answer. 90'+D+' clockwise is 270'+D+' counterclockwise.'}],[g(),f(2,true),mp(2),num("Plan 6a: x\u2032 = the old y",-6),num("Plan 6b: y\u2032 = the opposite of 1",-1)])]},
 {id:'a3',num:'A-3',prompt:'A stop sign is a regular octagon (8 equal sides). How many lines of symmetry? What is the smallest turn that lands it on itself?',given:[{v:'8',k:'equal sides and angles'}],want:'lines, then the smallest turn in degrees',reference:REF,
  pipeline:[num('Lines of symmetry',8,[{near:4,tol:0,msg:'Count the folds through corners AND through the middles of sides.'}],'A regular polygon has one line of symmetry per side.'),
   Object.assign(num('Smallest turn, in degrees',45,[{near:8,tol:0,msg:'That is n. The turn is 360 \u00B7 1/8.'},{near:90,tol:0,msg:'90'+D+' works, but there is a smaller turn.'}],'360 \u00B7 1/n with n = 8.'),{sub:[num('Count: matching positions, n',8),num('Substitute and solve: 360 \u00B7 1/8',45)]})]},
 {id:'a4',num:'A-4',prompt:'Rotate triangle ABC by 180'+D+' about the origin: A(1, 2), B(4, 2), C(4, 5). Plot A'+PR+', B'+PR+', C'+PR+'.',given:[{v:'A(1, 2)',k:''},{v:'B(4, 2)',k:''},{v:'C(4, 5)',k:''}],want:'the image triangle, plotted',reference:REF,
  pipeline:[mp(1),plot('Tap to place each image vertex. Both coordinates become their opposites.',[[1,2],[4,2],[4,5]],[[-1,-2],[-4,-2],[-4,-5]],['A','B','C'])]}
];
const page=`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Week 2, Lesson 2 \u2014 Rotations &amp; Symmetry Checker</title>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../assets/styles.css">
</head>
<body>
<header class="hdr">
  <div class="hdr-left"><a class="hdr-back" href="../index.html">&larr; All Checkers</a><h1>Rotations &amp; Symmetry</h1><div class="sub">Week 2 \u00B7 Lesson 2 \u2014 Learning Lab</div></div>
  <div class="hdr-dots" id="hdrDots"></div>
</header>
<main class="main wide" id="main"><noscript><p>This checker needs JavaScript. Work the Learning Lab on paper and check with your teacher.</p></noscript></main>

<script src="../js/checker-kit.js"></script>
<script src="../js/tool-point.js"></script>
<script src="../js/tool-plot.js"></script>
<script>
/* Week 2 Lesson 2 Learning Lab. Split layout, coarse first.
   A miss opens the Transformation Plan: group, formula (cw -> ccw), maps to, 6a/6b.
   Choice answers and plotted points are djb2 hashes. */
K.run(${JSON.stringify(P,null,1)}, { layout:'split' });
</script>
</body>
</html>
`;
fs.writeFileSync('checkers/week2-lesson2-rotate-symmetry.html',page); console.log('ok',page.length);

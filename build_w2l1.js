/* Week 2 Lesson 1 checker (Translations & Reflections). Ladders follow the
   handout's Transformation Plan: 1 formula group, 2 formula, 3 collect,
   4 maps to, 5 substitute, 6a/6b solve (6 only when there is arithmetic).
   Run: node build_w2l1.js  -> checkers/week2-lesson1-translate-reflect.html */
const fs=require('fs');
function djb2(s){var v=5381;for(var i=0;i<s.length;i++){v=((v<<5)+v)+s.charCodeAt(i);v=v&v;}return v>>>0;}
const L='\u27E8',R='\u27E9',M='\u2212',PR='\u2032',MT='\u21A6';
const GROUPS=['translation (a slide)','reflection (a flip)','rotation (a turn)'];
const FORMS=['T'+L+'a, b'+R+': translation by a vector','r x-axis: reflection over the x-axis','r y-axis: reflection over the y-axis','r y = x: reflection over the line y = x'];
const MAPS=['(x, y) '+MT+' (x + a, y + b)','(x, y) '+MT+' (x, '+M+'y)','(x, y) '+MT+' ('+M+'x, y)','(x, y) '+MT+' (y, x)'];
function ch(label,ask,opts,i,nudge){return {tool:'choice',stack:true,label,ask,options:opts,ch:djb2(opts[i]),shuffle:true,nudges:[nudge]};}
const g=i=>ch('Plan 1: Formula group','Slide, flip, or turn?',GROUPS,i,'Every point moves the same way: a slide. A mirror over a line: a flip.');
const f=i=>ch('Plan 2: Formula','Which formula?',FORMS,i,'Check the Formula Box on the right. Which line, or is it a vector?');
const mp=i=>ch('Plan 4: Maps to','Which maps-to line goes with that formula?',MAPS,i,'Copy the maps-to line from the Formula Box.');
function num(label,a,traps,nudge){return {tool:'numeric',label,answer:a,tol:0,closeBand:0,traps:traps||[],nudges:[nudge||'One coordinate at a time.']};}
function pt(label,a,traps,nudge,extra){return Object.assign({tool:'point',label,answer:a,traps:traps||[],nudges:[nudge||'Write the maps-to, substitute, then simplify.']},extra||{});}
function coarse(label,a,traps,ladder){return Object.assign(pt(label,a,traps),{sub:ladder});}
function plot(prompt,pre,img,labels){return {tool:'plot',label:'Plot the image',prompt,range:6,preimage:pre.map((p,i)=>({x:p[0],y:p[1],label:labels[i]})),targets:img.map((p,i)=>({label:labels[i]+PR,ch:djb2(p[0]+','+p[1])}))};}
const REF='<div class="surf-label">Formula Box \u2014 stays on screen</div>'+
 '<div class="ref-row"><div class="ref-cell"><div class="rc-t">Translate '+L+'a, b'+R+'</div><div class="rc-s">(x, y) '+MT+' (x + a, y + b)</div></div>'+
 '<div class="ref-cell"><div class="rc-t">Over the x-axis</div><div class="rc-s">(x, y) '+MT+' (x, '+M+'y)</div></div>'+
 '<div class="ref-cell"><div class="rc-t">Over the y-axis</div><div class="rc-s">(x, y) '+MT+' ('+M+'x, y)</div></div></div>'+
 '<div class="ref-row" style="margin-top:8px"><div class="ref-cell"><div class="rc-t">Over y = x</div><div class="rc-s">(x, y) '+MT+' (y, x): swap</div></div>'+
 '<div class="ref-cell"><div class="rc-t">Signs</div><div class="rc-s">right/up +, left/down '+M+'</div></div>'+
 '<div class="ref-cell"><div class="rc-t">Working backward</div><div class="rc-s">change sides, change signs</div></div></div>'+
 '<div class="ref-note">Plan: 1 formula group \u00B7 2 formula \u00B7 3 collect \u00B7 4 maps to \u00B7 5 substitute \u00B7 6 solve (6a x'+PR+', 6b y'+PR+'). '+M+'x means the opposite of x.</div>';
const BACK='You moved the wrong way. Right and up add; left and down add a negative.';
const P=[
 {id:'t1',num:'T-1',prompt:'Translate the point (2, '+M+'3) by the vector '+L+'3, 4'+R+'.',given:[{v:'(2, '+M+'3)',k:'the point'},{v:L+'3, 4'+R,k:'right 3, up 4'}],want:'the image, as (x, y)',reference:REF,
  pipeline:[coarse('The image',[5,1],[{p:[-1,-7],msg:BACK}],[g(0),f(0),pt('Plan 3: Collect the parameters a, b',[3,4],[],'a is across, b is up or down.',{vec:true}),mp(0),
   num("Plan 6a: Solve for x\u2032: 2 + 3",5),num("Plan 6b: Solve for y\u2032: "+M+"3 + 4",1,[{near:-7,tol:0,msg:'Up 4 adds 4: '+M+'3 + 4.'}])])]},
 {id:'t2',num:'T-2',prompt:'Reflect the point ('+M+'4, 2) over the y-axis.',given:[{v:'('+M+'4, 2)',k:'the point'},{v:'y-axis',k:'the line'}],want:'the image, as (x, y)',reference:REF,
  pipeline:[coarse('The image',[4,2],[{p:[-4,-2],msg:'That is the x-axis rule. Over the y-axis, x becomes its opposite and y stays.'}],[g(1),f(2),mp(2),
   pt('Plan 5: Substitute: the opposite of '+M+'4, and y stays. (Step 6: nothing to simplify.)',[4,2])])]},
 {id:'t3',num:'T-3',prompt:'Reflect the point (5, '+M+'1) over the line y = x.',given:[{v:'(5, '+M+'1)',k:'the point'},{v:'y = x',k:'the line'}],want:'the image, as (x, y)',reference:REF,
  pipeline:[coarse('The image',[-1,5],[{p:[1,-5],msg:'Over y = x the coordinates swap and keep their signs.'},{p:[5,1],msg:'That is the x-axis rule. Over y = x, swap.'}],[g(1),f(3),mp(3),
   pt('Plan 5: Substitute: swap. (Step 6: nothing to simplify.)',[-1,5])])]},
 {id:'a1',num:'A-1',prompt:'A game piece at ('+M+'2, '+M+'5) moves left 4 and up 7. Where does it land?',given:[{v:'('+M+'2, '+M+'5)',k:'start'},{v:'left 4, up 7',k:'the move'}],want:'the image, as (x, y)',reference:REF,
  pipeline:[coarse('Where it lands',[-6,2],[{p:[2,2],msg:'Left is negative. Left 4 is a = '+M+'4.'},{p:[2,-12],msg:BACK}],[g(0),f(0),pt('Plan 3: Collect the parameters a, b',[-4,7],[{p:[4,7],msg:'Left is negative.'}],'Left 4 is '+M+'4. Up 7 is +7.',{vec:true}),mp(0),
   num('Plan 6a: Solve for x\u2032: '+M+'2 + ('+M+'4)',-6,[{near:2,tol:0,msg:'Adding a negative moves left: '+M+'2 + ('+M+'4).'}]),num('Plan 6b: Solve for y\u2032: '+M+'5 + 7',2)])]},
 {id:'a2',num:'A-2',prompt:'Reflect the point ('+M+'3, '+M+'6) over the x-axis.',given:[{v:'('+M+'3, '+M+'6)',k:'the point'},{v:'x-axis',k:'the line'}],want:'the image, as (x, y)',reference:REF,
  pipeline:[coarse('The image',[-3,6],[{p:[3,-6],msg:'That is the y-axis rule. Over the x-axis, x stays and y becomes its opposite.'},{p:[3,6],msg:'Only y changes. x stays '+M+'3.'}],[g(1),f(1),mp(1),
   pt('Plan 5: Substitute: x stays, the opposite of '+M+'6. (Step 6: nothing to simplify.)',[-3,6])])]},
 {id:'a3',num:'A-3',prompt:'The rule (x, y) '+MT+' (x '+M+' 2, y + 5) sends a point Q to Q'+PR+'(1, '+M+'4). Find Q.',given:[{v:'(x '+M+' 2, y + 5)',k:'the rule'},{v:'(1, '+M+'4)',k:'the image Q'+PR}],want:'Q, as (x, y)',reference:REF,
  pipeline:[coarse('The point Q',[3,-9],[{p:[-1,1],msg:'You ran the rule forward on the image. Work backward: x + ('+M+'2) = 1.'}],[g(0),pt('Plan 3: Collect the parameters a, b',[-2,5],[],'x '+M+' 2 is x + ('+M+'2), so a = '+M+'2.',{vec:true}),mp(0),
   num('Plan 6a: x + ('+M+'2) = 1. Change sides, change signs. x = ?',3,[{near:-1,tol:0,msg:'Change sides, change signs: x = 1 + 2.'}]),
   num('Plan 6b: y + 5 = '+M+'4. Change sides, change signs. y = ?',-9,[{near:1,tol:0,msg:'Change sides, change signs: y = '+M+'4 + ('+M+'5).'}])])]},
 {id:'a4',num:'A-4',prompt:'Reflect triangle ABC over the x-axis: A('+M+'4, 1), B('+M+'1, 1), C('+M+'1, 4). Plot A'+PR+', B'+PR+', C'+PR+'.',given:[{v:'A('+M+'4, 1)',k:''},{v:'B('+M+'1, 1)',k:''},{v:'C('+M+'1, 4)',k:''}],want:'the image triangle, plotted',reference:REF,
  pipeline:[mp(1),plot('Tap to place each image vertex. Same distance below the x-axis as its partner is above it.',[[-4,1],[-1,1],[-1,4]],[[-4,-1],[-1,-1],[-1,-4]],['A','B','C'])]}
];
const page=`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Week 2, Lesson 1 \u2014 Translations &amp; Reflections Checker</title>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../assets/styles.css">
</head>
<body>
<header class="hdr">
  <div class="hdr-left"><a class="hdr-back" href="../index.html">&larr; All Checkers</a><h1>Translations &amp; Reflections</h1><div class="sub">Week 2 \u00B7 Lesson 1 \u2014 Learning Lab</div></div>
  <div class="hdr-dots" id="hdrDots"></div>
</header>
<main class="main wide" id="main"><noscript><p>This checker needs JavaScript. Work the Learning Lab on paper and check with your teacher.</p></noscript></main>

<script src="../js/checker-kit.js"></script>
<script src="../js/tool-point.js"></script>
<script src="../js/tool-plot.js"></script>
<script>
/* Week 2 Lesson 1 Learning Lab. Split layout, coarse first.
   A miss opens the Transformation Plan one step at a time:
   1 formula group, 2 formula, 3 collect, 4 maps to, 5 substitute, 6a/6b solve.
   Reflections stop at Step 5 (nothing to simplify). Working backward uses
   change sides, change signs. Choice answers and plotted points are djb2 hashes. */
K.run(${JSON.stringify(P,null,1)}, { layout:'split' });
</script>
</body>
</html>
`;
fs.writeFileSync('checkers/week2-lesson1-translate-reflect.html',page); console.log('ok',page.length);

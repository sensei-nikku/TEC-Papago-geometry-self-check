/* Week 3 Lesson 3 checker (Special Right Triangles). Ladders follow the handout:
   2 goal (name the unknown), 3 facts as math (which triangle, what the given side is
   across from, a = ?), 4 subgoals, 5 substitute. Exact answers are typed as the
   number in front of the root; tape-measure answers to the nearest tenth accept
   either the exact value or the 1.41 / 1.73 estimate. Every length is in inches.
   Run: node build_w3l3.js  -> checkers/week3-lesson3-special-right.html */
const fs=require('fs');
function djb2(s){var v=5381;for(var i=0;i<s.length;i++){v=((v<<5)+v)+s.charCodeAt(i);v=v&v;}return v>>>0;}
const R2='\u221A2',R3='\u221A3',DEG='\u00B0',DOT='\u00B7';
function ch(label,ask,opts,i,nudge){return {tool:'choice',stack:true,label,ask,options:opts,ch:djb2(opts[i]),shuffle:true,nudges:[nudge]};}
function num(label,a,traps,nudge,tol){return {tool:'numeric',label,answer:a,tol:tol||0,closeBand:0,traps:traps||[],nudges:[nudge||'Find a first, then use the rule.']};}
function coarse(step,ladder){return Object.assign(step,{sub:ladder});}
const tri=(i)=>ch('Plan 3: Facts as math','Which triangle is it?',['45-45-90','30-60-90'],i,'Read the angle: 45'+DEG+' means 45-45-90; 30'+DEG+' or 60'+DEG+' means 30-60-90.');
const across=(q,i)=>ch('Plan 3: Facts as math',q,['30'+DEG,'60'+DEG,'the square corner'],i,'In a bend, the rise sits across from the bend angle. The distance along the wall sits across from the other acute angle.');
const SQ3='\u221A3 goes on the long leg. The hypotenuse of a 30-60-90 is 2a.';
const TWOA='2a is the 30-60-90 rule. A 45-45-90 hypotenuse is a'+R2+'.';
const REF='<div class="surf-label">Formula Box \u2014 stays on screen</div>'+
 '<div class="ref-row"><div class="ref-cell"><div class="rc-t">45-45-90</div><div class="rc-s">legs a, a; hypotenuse a'+R2+'</div></div>'+
 '<div class="ref-cell"><div class="rc-t">30-60-90</div><div class="rc-s">short a, long a'+R3+', hypotenuse 2a</div></div>'+
 '<div class="ref-cell"><div class="rc-t">About</div><div class="rc-s">'+R2+' \u2248 1.41, '+R3+' \u2248 1.73</div></div></div>'+
 '<div class="ref-row" style="margin-top:8px"><div class="ref-cell"><div class="rc-t">Across from 30'+DEG+'</div><div class="rc-s">short leg, a</div></div>'+
 '<div class="ref-cell"><div class="rc-t">Across from 60'+DEG+'</div><div class="rc-s">long leg, a'+R3+'</div></div>'+
 '<div class="ref-cell"><div class="rc-t">Bend marks apart</div><div class="rc-s">the hypotenuse</div></div></div>'+
 '<div class="ref-note">Plan: 1 read '+DOT+' 2 goal: name the unknown '+DOT+' 3 facts as math '+DOT+' 4 subgoals '+DOT+' 5 substitute '+DOT+' 6 answer and check. For an exact answer like 6'+R2+', type 6.</div>';
const P=[
 {id:'t1',num:'T-1',prompt:'A 45-45-90 triangle has a leg of 6 in. Let h be the hypotenuse. Find h.',given:[{v:'45-45-90',k:'the triangle'},{v:'leg = 6 in',k:'a leg'}],want:'h, exact and about',reference:REF,
  pipeline:[coarse(num('Exact: h = \u2610'+R2+'. Type the number in front of '+R2+'.',6,[{near:3,tol:0,msg:'That halves the leg. In a 45-45-90, a is the leg itself.'}]),[
    ch('Plan 2: Goal','What is h?',['the hypotenuse','a leg'],0,'h is the side across from the square corner.'),tri(0),num('Plan 3: \u201Ca leg of 6\u201D means a = ?',6),
    ch('Plan 4: Subgoal','Which rule finds h?',['h = a'+R2,'h = 2a','h = a'+R3],0,'45-45-90: the hypotenuse is a'+R2+'.'),num('Plan 5: h = 6'+R2+'. The number in front of '+R2+' is',6)]),
   num('About how long is h, to the nearest tenth?',8.485,[{near:12,tol:0,msg:TWOA}],'Multiply 6 by 1.41.',0.06)]},
 {id:'t2',num:'T-2',prompt:'A 30'+DEG+' offset rises 6 in. Let h be the distance between the bend marks and w the distance along the wall.',given:[{v:'30'+DEG+' offset',k:'the bend'},{v:'rises 6 in',k:'the rise'}],want:'h, then w',reference:REF,
  pipeline:[coarse(num('h = ? (inches)',12,[{near:10.392,tol:0.06,msg:SQ3},{near:6,tol:0,msg:'That is a, the rise. The bend marks are the hypotenuse, 2a.'}]),[
    ch('Plan 2: Goal','What is h?',['the hypotenuse','the short leg','the long leg'],0,'The bend marks are along the slanted pipe: the hypotenuse.'),tri(1),
    across('\u201Crises 6 in\u201D is across from',0),num('Plan 3: so a = ?',6),
    ch('Plan 4: Subgoals','Which subgoals?',['h = 2a, then w = a'+R3,'h = a'+R3+', then w = 2a','h = a'+R2],0,'30-60-90: hypotenuse 2a, long leg a'+R3+'.'),num('Plan 5a: h = 2 '+DOT+' 6',12)]),
   num('Exact: w = \u2610'+R3+'. Type the number in front of '+R3+'.',6,[{near:12,tol:0,msg:'12 is h. The wall distance is the long leg, a'+R3+'.'}]),
   num('About how far along the wall is w, to the nearest tenth?',10.392,[{near:12,tol:0,msg:'12 is h. The wall distance is the long leg, a'+R3+'.'}],'Multiply 6 by 1.73.',0.06)]},
 {id:'t3',num:'T-3',prompt:'A 45'+DEG+' offset rises 4 in. Let h be the distance between the bend marks. Find h.',given:[{v:'45'+DEG+' offset',k:'the bend'},{v:'rises 4 in',k:'the rise'}],want:'h, exact and about',reference:REF,
  pipeline:[coarse(num('Exact: h = \u2610'+R2+'. Type the number in front of '+R2+'.',4,[{near:2,tol:0,msg:'In a 45-45-90, a is the leg itself.'}]),[
    tri(0),num('Plan 3: \u201Crises 4 in\u201D means a = ?',4),ch('Plan 4: Subgoal','Which rule finds h?',['h = a'+R2,'h = 2a','h = a'+R3],0,'45-45-90: the hypotenuse is a'+R2+'.'),num('Plan 5: h = 4'+R2+'. The number in front of '+R2+' is',4)]),
   num('About how far apart are the marks, to the nearest tenth?',5.657,[{near:8,tol:0,msg:TWOA}],'Multiply 4 by 1.41.',0.07)]},
 {id:'a1',num:'A-1',prompt:'A 30-60-90 triangle has a short leg of 7 in. Find the hypotenuse and the long leg.',given:[{v:'30-60-90',k:'the triangle'},{v:'short leg = 7 in',k:'a'}],want:'hypotenuse, then long leg',reference:REF,
  pipeline:[coarse(num('Hypotenuse = ? (inches)',14,[{near:12.124,tol:0.06,msg:SQ3}]),[tri(1),num('Plan 3: \u201Cshort leg of 7\u201D means a = ?',7),
    ch('Plan 4: Subgoals','Which subgoals?',['hyp = 2a, then long leg = a'+R3,'hyp = a'+R3+', then long leg = 2a','hyp = a'+R2],0,'30-60-90: hypotenuse 2a, long leg a'+R3+'.'),num('Plan 5a: hyp = 2 '+DOT+' 7',14)]),
   num('Exact: long leg = \u2610'+R3+'. Type the number in front of '+R3+'.',7,[{near:14,tol:0,msg:'14 is the hypotenuse. The long leg is a'+R3+'.'}]),
   num('About how long is the long leg, to the nearest tenth?',12.124,[{near:14,tol:0,msg:'14 is the hypotenuse. The long leg is a'+R3+'.'}],'Multiply 7 by 1.73.',0.06)]},
 {id:'a2',num:'A-2',prompt:'A 60'+DEG+' offset covers 2 in along the wall. Let h be the distance between the bend marks and r the rise.',given:[{v:'60'+DEG+' offset',k:'the bend'},{v:'2 in along the wall',k:'the wall distance'}],want:'h, then r',reference:REF,
  pipeline:[coarse(num('h = ? (inches)',4,[{near:3.464,tol:0.06,msg:SQ3}]),[tri(1),across('\u201C2 in along the wall\u201D is across from',0),num('Plan 3: so a = ?',2),
    ch('Plan 4: Subgoals','Which subgoals?',['h = 2a, then r = a'+R3,'h = a'+R3+', then r = 2a','h = a'+R2],0,'In a 60'+DEG+' bend the rise is across from 60'+DEG+': the long leg.'),num('Plan 5a: h = 2 '+DOT+' 2',4)]),
   num('Exact: r = \u2610'+R3+'. Type the number in front of '+R3+'.',2,[{near:4,tol:0,msg:'4 is h. The rise is across from 60'+DEG+': the long leg, a'+R3+'.'}]),
   num('About how high is the rise, to the nearest tenth?',3.464,[{near:4,tol:0,msg:'4 is h. The rise is the long leg, a'+R3+'.'}],'Multiply 2 by 1.73.',0.06)]},
 {id:'a3',num:'A-3',prompt:'A square has sides of 10 in. Let d be the diagonal. Find d.',given:[{v:'square, sides 10 in',k:'the figure'}],want:'d, exact and about',reference:REF,
  pipeline:[coarse(num('Exact: d = \u2610'+R2+'. Type the number in front of '+R2+'.',10,[{near:5,tol:0,msg:'The legs are the sides themselves: a = 10.'}]),[
    ch('Plan 3: Facts as math','A diagonal cuts a square into two triangles. Which kind?',['45-45-90','30-60-90'],0,'A diagonal splits the square corner into two 45'+DEG+' angles.'),num('Plan 3: \u201Csides of 10\u201D means a = ?',10),
    ch('Plan 4: Subgoal','Which rule finds d?',['d = a'+R2,'d = 2a','d = a'+R3],0,'The diagonal is the hypotenuse: a'+R2+'.'),num('Plan 5: d = 10'+R2+'. The number in front of '+R2+' is',10)]),
   num('About how long is d, to the nearest tenth?',14.142,[{near:20,tol:0,msg:TWOA}],'Multiply 10 by 1.41.',0.06)]},
 {id:'a4',num:'A-4',prompt:'Name the sides of a 30-60-90 triangle.',given:[{v:'30-60-90',k:'the triangle'}],want:'the side names',reference:REF,
  pipeline:[ch('Naming','Which side is across from 60'+DEG+'?',['the long leg','the short leg','the hypotenuse'],0,'Bigger angle, longer side across from it.'),
   ch('Naming','Which side is always the longest?',['the hypotenuse','the long leg','the short leg'],0,'The side across from the square corner is always the longest.')]}
];
const page=`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Week 3, Lesson 3 \u2014 Special Right Triangles Checker</title>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../assets/styles.css">
</head>
<body>
<header class="hdr">
  <div class="hdr-left"><a class="hdr-back" href="../index.html">&larr; All Checkers</a><h1>Special Right Triangles</h1><div class="sub">Week 3 \u00B7 Lesson 3 \u2014 Learning Lab</div></div>
  <div class="hdr-dots" id="hdrDots"></div>
</header>
<main class="main wide" id="main"><noscript><p>This checker needs JavaScript. Work the Learning Lab on paper and check with your teacher.</p></noscript></main>

<script src="../js/checker-kit.js"></script>
<script>
/* Week 3 Lesson 3 Learning Lab. Split layout, coarse first. A miss opens the
   Problem-Solving Plan: goal (name the unknown), facts as math, subgoals,
   substitute. Exact answers: the number in front of the root. All lengths in
   inches. Choice answers are djb2 hashes. */
K.run(${JSON.stringify(P,null,1)}, { layout:'split' });
</script>
</body>
</html>
`;
fs.writeFileSync('checkers/week3-lesson3-special-right.html',page); console.log('ok',page.length);

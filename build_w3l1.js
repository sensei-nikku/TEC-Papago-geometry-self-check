/* Week 3 Lesson 1 checker (Dilations). Ladders follow the handout's
   Problem-Solving Plan: 1 read, 2 goal, 3 facts and what they mean,
   4 subgoals, 5 execute (5a, 5b), 6 solve and check. k is the missing
   factor: start . k = target, so k = target/start. No working backward.
   Run: node build_w3l1.js  -> checkers/week3-lesson1-dilations.html */
const fs=require('fs');
function djb2(s){var v=5381;for(var i=0;i<s.length;i++){v=((v<<5)+v)+s.charCodeAt(i);v=v&v;}return v>>>0;}
const M='\u2212',PR='\u2032',MT='\u21A6',DOT='\u00B7';
function ch(label,ask,opts,i,nudge){return {tool:'choice',stack:true,label,ask,options:opts,ch:djb2(opts[i]),shuffle:true,nudges:[nudge]};}
const GOALS=['the target point','the scale factor k','the starting point'];
const goal=i=>ch('Plan 2: Goal','What are you finding?',GOALS,i,'Read the question again. Does it give k and ask where the point lands, or give both points and ask for k?');
const SUBS=['x '+DOT+' k = x'+PR+' and y '+DOT+' k = y'+PR,'x + k = x'+PR+' and y + k = y'+PR,'x'+PR+' '+DOT+' k = x and y'+PR+' '+DOT+' k = y'];
const subs=()=>ch('Plan 4: Subgoals','Which subgoals?',SUBS,0,'A dilation multiplies: start times k is target, one coordinate at a time.');
const SUBK=['start '+DOT+' k = target with the first coordinates, then confirm with the second','target '+DOT+' k = start','start + k = target'];
const subk=()=>ch('Plan 4: Subgoals','Which subgoals?',SUBK,0,'k is the missing factor: start times k is target.');
function kfact(n,d,word){return {tool:'fraction',label:'Plan 3: Facts. What is k?',answer:[n,d],nudges:['The number after \u201Cby\u201D is k'+(word?': '+word:'')+'.']};}
function startfact(s,t){return ch('Plan 3: Facts','Which point is the start? (no prime)',[s,t],0,'The dilation maps the start to the target. The start comes first.');}
function num(label,a,traps,nudge){return {tool:'numeric',label,answer:a,tol:0,closeBand:0,traps:traps||[],nudges:[nudge||'Multiply that coordinate by k.']};}
function frac(label,a,traps,nudge){return {tool:'fraction',label,answer:a,traps:traps||[],nudges:[nudge||'k = target over start.']};}
function pt(label,a,traps,nudge){return {tool:'point',label,answer:a,traps:traps||[],nudges:[nudge||'Multiply each coordinate by k.']};}
function coarse(step,ladder){return Object.assign(step,{sub:ladder});}
const GROW=['it grew','it shrank'];
const grow=i=>ch('Plan 6: Check','Did it grow or shrink?',GROW,i,'k more than 1: it grew. k between 0 and 1: it shrank.');
const ADD='You added k. A dilation multiplies: start '+DOT+' k = target.';
const SIGN='Check the sign. A negative times a positive is negative.';
const FLIP='That is start over target. k = target over start.';
const SUBT='You subtracted. k is the missing factor: start '+DOT+' k = target.';
const REF='<div class="surf-label">Formula Box \u2014 stays on screen</div>'+
 '<div class="ref-row"><div class="ref-cell"><div class="rc-t">Dilation by k</div><div class="rc-s">x '+DOT+' k = x'+PR+', y '+DOT+' k = y'+PR+'</div></div>'+
 '<div class="ref-cell"><div class="rc-t">Maps to</div><div class="rc-s">(x, y) '+MT+' (kx, ky)</div></div>'+
 '<div class="ref-cell"><div class="rc-t">Scale factor</div><div class="rc-s">k = target / start</div></div></div>'+
 '<div class="ref-row" style="margin-top:8px"><div class="ref-cell"><div class="rc-t">No prime</div><div class="rc-s">the start</div></div>'+
 '<div class="ref-cell"><div class="rc-t">Prime</div><div class="rc-s">the target</div></div>'+
 '<div class="ref-cell"><div class="rc-t">Read k</div><div class="rc-s">more than 1: grows; 0 to 1: shrinks</div></div></div>'+
 '<div class="ref-note">Plan: 1 read '+DOT+' 2 goal '+DOT+' 3 facts and what they mean '+DOT+' 4 subgoals '+DOT+' 5 execute (5a, 5b) '+DOT+' 6 solve and check. Fractions: type 3/4.</div>';
const P=[
 {id:'t1',num:'T-1',prompt:'Dilate the point (3, '+M+'5) by k = 2.',given:[{v:'(3, '+M+'5)',k:'the start'},{v:'k = 2',k:'scale factor'}],want:'the target point, as (x, y)',reference:REF,
  pipeline:[coarse(pt('The target point',[6,-10],[{p:[5,-3],msg:ADD},{p:[6,10],msg:SIGN}]),[goal(0),kfact(2,1),subs(),
   num('Plan 5a: x'+PR+' = 3 '+DOT+' 2',6),num('Plan 5b: y'+PR+' = '+M+'5 '+DOT+' 2',-10,[{near:10,tol:0,msg:SIGN}])])]},
 {id:'t2',num:'T-2',prompt:'Dilate the segment with endpoints A('+M+'4, 8) and B(6, 2) by k = 1/2.',given:[{v:'A('+M+'4, 8), B(6, 2)',k:'the start'},{v:'k = 1/2',k:'scale factor'}],want:'A'+PR+' and B'+PR+', as (x, y)',reference:REF,
  pipeline:[coarse(pt('A'+PR,[-2,4],[{p:[-8,16],msg:'You multiplied by 2. k = 1/2: multiply by 1/2, so the segment shrinks.'}]),[goal(0),kfact(1,2),subs(),
   num('Plan 5a: x'+PR+' = '+M+'4 '+DOT+' 1/2',-2,[{near:2,tol:0,msg:SIGN}]),num('Plan 5b: y'+PR+' = 8 '+DOT+' 1/2',4)]),
   pt('B'+PR,[3,1],[{p:[12,4],msg:'You multiplied by 2. k = 1/2: multiply by 1/2.'}],'Same k for every point: 6 '+DOT+' 1/2 and 2 '+DOT+' 1/2.')]},
 {id:'t3',num:'T-3',prompt:'A dilation maps (3, '+M+'6) to (12, '+M+'24). Find k. Did it grow or shrink?',given:[{v:'(3, '+M+'6)',k:'one point'},{v:'(12, '+M+'24)',k:'the other point'}],want:'k, then grew or shrank',reference:REF,
  pipeline:[coarse(frac('k',[4,1],[{f:[1,4],msg:FLIP},{f:[9,1],msg:SUBT}]),[goal(1),startfact('(3, '+M+'6)','(12, '+M+'24)'),subk(),
   frac('Plan 5a: 3 '+DOT+' k = 12, so k = ?',[4,1],[{f:[1,4],msg:FLIP}]),frac('Plan 5b: confirm. '+M+'6 '+DOT+' k = '+M+'24, so k = ?',[4,1])]),grow(0)]},
 {id:'a1',num:'A-1',prompt:'Dilate the point ('+M+'5, 1) by k = 3.',given:[{v:'('+M+'5, 1)',k:'the start'},{v:'k = 3',k:'scale factor'}],want:'the target point, as (x, y)',reference:REF,
  pipeline:[coarse(pt('The target point',[-15,3],[{p:[-2,4],msg:ADD},{p:[15,3],msg:SIGN}]),[goal(0),kfact(3,1),subs(),
   num('Plan 5a: x'+PR+' = '+M+'5 '+DOT+' 3',-15,[{near:15,tol:0,msg:SIGN}]),num('Plan 5b: y'+PR+' = 1 '+DOT+' 3',3)])]},
 {id:'a2',num:'A-2',prompt:'Dilate the point (8, '+M+'12) by k = 3/4.',given:[{v:'(8, '+M+'12)',k:'the start'},{v:'k = 3/4',k:'scale factor'}],want:'the target point, as (x, y)',reference:REF,
  pipeline:[coarse(pt('The target point',[6,-9],[{p:[6,9],msg:SIGN}]),[goal(0),kfact(3,4),subs(),
   num('Plan 5a: x'+PR+' = 8 '+DOT+' 3/4',6),num('Plan 5b: y'+PR+' = '+M+'12 '+DOT+' 3/4',-9,[{near:9,tol:0,msg:SIGN}])])]},
 {id:'a3',num:'A-3',prompt:'A dilation maps (10, 5) to (4, 2). Find k. Did it grow or shrink?',given:[{v:'(10, 5)',k:'one point'},{v:'(4, 2)',k:'the other point'}],want:'k, then grew or shrank',reference:REF,
  pipeline:[coarse(frac('k',[2,5],[{f:[5,2],msg:FLIP},{f:[-6,1],msg:SUBT}]),[goal(1),startfact('(10, 5)','(4, 2)'),subk(),
   frac('Plan 5a: 10 '+DOT+' k = 4, so k = ?',[2,5],[{f:[5,2],msg:FLIP}]),frac('Plan 5b: confirm. 5 '+DOT+' k = 2, so k = ?',[2,5])]),grow(1)]},
 {id:'a4',num:'A-4',prompt:'Dilate the triangle with corners A(2, 0), B(0, 4), and C(2, 4) by k = 5/2.',given:[{v:'A(2, 0), B(0, 4), C(2, 4)',k:'the start'},{v:'k = 5/2',k:'scale factor'}],want:'A'+PR+', B'+PR+', C'+PR+', as (x, y)',reference:REF,
  pipeline:[coarse(pt('A'+PR,[5,0],[{p:[4,0],msg:'k is 5/2, not 2. 2 '+DOT+' 5/2 = 5.'}]),[goal(0),kfact(5,2),subs(),
   num('Plan 5a: x'+PR+' = 2 '+DOT+' 5/2',5),num('Plan 5b: y'+PR+' = 0 '+DOT+' 5/2',0)]),
   pt('B'+PR,[0,10],[{p:[0,8],msg:'k is 5/2, not 2. 4 '+DOT+' 5/2 = 10.'}],'0 '+DOT+' 5/2 and 4 '+DOT+' 5/2.'),
   pt('C'+PR,[5,10],[{p:[4,8],msg:'k is 5/2, not 2.'}],'2 '+DOT+' 5/2 and 4 '+DOT+' 5/2.')]}
];
const page=`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Week 3, Lesson 1 \u2014 Dilations Checker</title>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../assets/styles.css">
</head>
<body>
<header class="hdr">
  <div class="hdr-left"><a class="hdr-back" href="../index.html">&larr; All Checkers</a><h1>Dilations</h1><div class="sub">Week 3 \u00B7 Lesson 1 \u2014 Learning Lab</div></div>
  <div class="hdr-dots" id="hdrDots"></div>
</header>
<main class="main wide" id="main"><noscript><p>This checker needs JavaScript. Work the Learning Lab on paper and check with your teacher.</p></noscript></main>

<script src="../js/checker-kit.js"></script>
<script src="../js/tool-point.js"></script>
<script src="../js/tool-fraction.js"></script>
<script>
/* Week 3 Lesson 1 Learning Lab. Split layout, coarse first.
   A miss opens the Problem-Solving Plan one step at a time:
   2 goal, 3 facts, 4 subgoals, 5a/5b execute; find-k problems end with a
   grow/shrink check (Plan 6). k is the missing factor: start . k = target.
   No working backward. Choice answers are djb2 hashes. */
K.run(${JSON.stringify(P,null,1)}, { layout:'split' });
</script>
</body>
</html>
`;
fs.writeFileSync('checkers/week3-lesson1-dilations.html',page); console.log('ok',page.length);

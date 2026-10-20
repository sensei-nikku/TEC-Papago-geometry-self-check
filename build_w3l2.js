/* Week 3 Lesson 2 checker (Similar Figures). Ladders follow the handout's
   Problem-Solving Plan: 2 goal, 3 facts and what they mean, 4 subgoals,
   5a find k from a matched pair (start . k = target, k = target/start),
   5b use k on the side you need. Same units only (no plan scales).
   Run: node build_w3l2.js  -> checkers/week3-lesson2-similar-figures.html */
const fs=require('fs');
function djb2(s){var v=5381;for(var i=0;i<s.length;i++){v=((v<<5)+v)+s.charCodeAt(i);v=v&v;}return v>>>0;}
const PR='\u2032',DOT='\u00B7',TRI='\u25B3',SIM='\u223C';
function ch(label,ask,opts,i,nudge){return {tool:'choice',stack:true,label,ask,options:opts,ch:djb2(opts[i]),shuffle:true,nudges:[nudge]};}
function num(label,a,traps,nudge){return {tool:'numeric',label,answer:a,tol:0,closeBand:0,traps:traps||[],nudges:[nudge||'Multiply the matching starting side by k.']};}
function frac(label,a,traps,nudge){return {tool:'fraction',label,answer:a,traps:traps||[],nudges:[nudge||'k = target over start.']};}
function coarse(step,ladder){return Object.assign(step,{sub:ladder});}
const GOALS=['a missing side','the scale factor k','whether they are similar'];
const goal=i=>ch('Plan 2: Goal','What are you finding?',GOALS,i,'Read the last sentence of the problem again.');
const startq=(opts,i,nudge)=>ch('Plan 3: Facts','Which one is the start?',opts,i,nudge||'In a similarity statement, the first figure is the start. In a resize, the original is the start.');
const matchq=(ask,opts,i)=>ch('Plan 3: Facts',ask,opts,i,'Use the letter positions: 1st with 1st, 2nd with 2nd, 3rd with 3rd.');
const SUBS=['5a find k from the matched pair, then 5b multiply the matching starting side by k','add the difference of the matched pair','5a find k, then 5b divide by k'];
const subs=()=>ch('Plan 4: Subgoals','Which subgoals?',SUBS,0,'Similar sides multiply. Find k first, then use it.');
const ADD='You added the difference. Similar sides multiply: start '+DOT+' k = target.';
const FLIP='That k is start over target. k = target over start.';
const REF='<div class="surf-label">Formula Box \u2014 stays on screen</div>'+
 '<div class="ref-row"><div class="ref-cell"><div class="rc-t">Scale factor</div><div class="rc-s">k = target / start</div></div>'+
 '<div class="ref-cell"><div class="rc-t">Missing side</div><div class="rc-s">target = k '+DOT+' start</div></div>'+
 '<div class="ref-cell"><div class="rc-t">Missing factor</div><div class="rc-s">start '+DOT+' k = target</div></div></div>'+
 '<div class="ref-row" style="margin-top:8px"><div class="ref-cell"><div class="rc-t">'+TRI+'ABC '+SIM+' '+TRI+'DEF</div><div class="rc-s">A\u2194D, B\u2194E, C\u2194F</div></div>'+
 '<div class="ref-cell"><div class="rc-t">Partners</div><div class="rc-s">AB\u2194DE, BC\u2194EF, AC\u2194DF</div></div>'+
 '<div class="ref-cell"><div class="rc-t">Read k</div><div class="rc-s">target bigger: k more than 1</div></div></div>'+
 '<div class="ref-note">Plan: 1 read '+DOT+' 2 goal '+DOT+' 3 facts and what they mean '+DOT+' 4 subgoals '+DOT+' 5 execute (5a, 5b) '+DOT+' 6 solve and check. Type fractions like 3/2.</div>';
const P=[
 {id:'t1',num:'T-1',prompt:TRI+'ABC '+SIM+' '+TRI+'DEF. AB = 2, DE = 10, BC = 3. Find EF.',given:[{v:'AB = 2, DE = 10',k:'a matched pair'},{v:'BC = 3',k:'a starting side'}],want:'EF',reference:REF,
  pipeline:[coarse(num('EF',15,[{near:11,tol:0,msg:ADD},{near:0.6,tol:0.01,msg:FLIP}]),[goal(0),matchq('Which side matches BC?',['EF','DE','DF'],0),subs(),
   frac('Plan 5a: 2 '+DOT+' k = 10, so k = ?',[5,1],[{f:[1,5],msg:FLIP}]),num('Plan 5b: EF = 5 '+DOT+' 3',15)])]},
 {id:'t2',num:'T-2',prompt:'A photo is 6 in wide and 10 in tall. It is enlarged to 9 in wide. How tall is it now?',given:[{v:'6 in wide, 10 in tall',k:'the original'},{v:'9 in wide',k:'the new width'}],want:'the new height, in inches',reference:REF,
  pipeline:[coarse(num('New height (in)',15,[{near:13,tol:0,msg:ADD},{near:6.67,tol:0.05,msg:FLIP}]),[goal(0),startq(['the original photo','the enlarged photo'],0),subs(),
   frac('Plan 5a: 6 '+DOT+' k = 9, so k = ?',[3,2],[{f:[2,3],msg:FLIP}]),num('Plan 5b: height = 3/2 '+DOT+' 10',15)])]},
 {id:'t3',num:'T-3',prompt:TRI+'JKL '+SIM+' '+TRI+'MNP. JK = 6, MN = 4, KL = 9. Find NP.',given:[{v:'JK = 6, MN = 4',k:'a matched pair'},{v:'KL = 9',k:'a starting side'}],want:'NP',reference:REF,
  pipeline:[coarse(num('NP',6,[{near:13.5,tol:0.01,msg:'That k is start over target. The target is smaller here, so k must be less than 1.'},{near:7,tol:0,msg:ADD}]),[goal(0),matchq('Which side matches KL?',['NP','MN','MP'],0),subs(),
   frac('Plan 5a: 6 '+DOT+' k = 4, so k = ?',[2,3],[{f:[3,2],msg:FLIP}]),num('Plan 5b: NP = 2/3 '+DOT+' 9',6)])]},
 {id:'a1',num:'A-1',prompt:TRI+'ABC '+SIM+' '+TRI+'DEF. AB = 4, DE = 10, AC = 8. Find DF.',given:[{v:'AB = 4, DE = 10',k:'a matched pair'},{v:'AC = 8',k:'a starting side'}],want:'DF',reference:REF,
  pipeline:[coarse(num('DF',20,[{near:14,tol:0,msg:ADD},{near:3.2,tol:0.01,msg:FLIP}]),[goal(0),matchq('Which side matches AC?',['DF','DE','EF'],0),subs(),
   frac('Plan 5a: 4 '+DOT+' k = 10, so k = ?',[5,2],[{f:[2,5],msg:FLIP}]),num('Plan 5b: DF = 5/2 '+DOT+' 8',20)])]},
 {id:'a2',num:'A-2',prompt:TRI+'RST '+SIM+' '+TRI+'XYZ. Name the partner of each side.',given:[{v:TRI+'RST '+SIM+' '+TRI+'XYZ',k:'the statement'}],want:'the matching sides',reference:REF,
  pipeline:[matchq('Which side matches ST?',['YZ','XY','XZ'],0),matchq('Which side matches RT?',['XZ','XY','YZ'],0)]},
 {id:'a3',num:'A-3',prompt:'A poster is 8 in wide and 12 in tall. It is shrunk to 6 in wide. How tall is it now?',given:[{v:'8 in wide, 12 in tall',k:'the original'},{v:'6 in wide',k:'the new width'}],want:'the new height, in inches',reference:REF,
  pipeline:[coarse(num('New height (in)',9,[{near:10,tol:0,msg:'You took away the difference. Similar sides multiply: start '+DOT+' k = target.'},{near:16,tol:0,msg:FLIP}]),[goal(0),startq(['the original poster','the shrunk poster'],0),subs(),
   frac('Plan 5a: 8 '+DOT+' k = 6, so k = ?',[3,4],[{f:[4,3],msg:FLIP}]),num('Plan 5b: height = 3/4 '+DOT+' 12',9)])]},
 {id:'a4',num:'A-4',prompt:'Is a 2 by 5 rectangle similar to a 6 by 14 rectangle?',given:[{v:'2 by 5',k:'the start'},{v:'6 by 14',k:'the other rectangle'}],want:'similar or not similar',reference:REF,
  pipeline:[frac('Plan 5a: k from the short sides: 2 '+DOT+' k = 6, so k = ?',[3,1],[{f:[1,3],msg:FLIP}]),num('Plan 5b: the long side times k: 5 '+DOT+' 3',15),
   ch('Plan 6: Check','Similar or not similar?',['not similar','similar'],0,'Similar needs the same k for every pair. Does 5 times 3 give 14?')]}
];
const page=`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Week 3, Lesson 2 \u2014 Similar Figures Checker</title>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../assets/styles.css">
</head>
<body>
<header class="hdr">
  <div class="hdr-left"><a class="hdr-back" href="../index.html">&larr; All Checkers</a><h1>Similar Figures</h1><div class="sub">Week 3 \u00B7 Lesson 2 \u2014 Learning Lab</div></div>
  <div class="hdr-dots" id="hdrDots"></div>
</header>
<main class="main wide" id="main"><noscript><p>This checker needs JavaScript. Work the Learning Lab on paper and check with your teacher.</p></noscript></main>

<script src="../js/checker-kit.js"></script>
<script src="../js/tool-fraction.js"></script>
<script>
/* Week 3 Lesson 2 Learning Lab. Split layout, coarse first.
   A miss opens the Problem-Solving Plan one step at a time:
   2 goal, 3 facts, 4 subgoals, 5a k from the matched pair, 5b use k.
   Same units only. No working backward. Choice answers are djb2 hashes. */
K.run(${JSON.stringify(P,null,1)}, { layout:'split' });
</script>
</body>
</html>
`;
fs.writeFileSync('checkers/week3-lesson2-similar-figures.html',page); console.log('ok',page.length);

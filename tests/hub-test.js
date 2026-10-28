/* Hub: index lists the terms; each term page lists its lessons in order; every
   link resolves to a real file; every card sits in its own week's section.
   Run: node tests/hub-test.js */
const fs=require('fs'),path=require('path');
const {JSDOM}=require(path.join(__dirname,'..','node_modules','jsdom'));
const root=path.join(__dirname,'..');
function A(c,m){if(!c){console.log('FAIL:',m);process.exit(1)}console.log('ok:',m);}
const doc=f=>new JSDOM(fs.readFileSync(path.join(root,f),'utf8')).window.document;
const idx=doc('index.html');
const terms=[...idx.querySelectorAll('a.hub-card')].map(a=>a.getAttribute('href'));
A(terms.length===2 && terms[0]==='terms/sy2627-term2.html' && terms[1]==='terms/historical.html','index lists SY2627 Term 2, then Historical');
terms.forEach(t=>A(fs.existsSync(path.join(root,t)),'term page exists: '+t));
['terms/sy2627-term2.html','terms/historical.html'].forEach(t=>{
  const d=doc(t);
  [...d.querySelectorAll('a.hub-card')].forEach(a=>{const h=a.getAttribute('href'); if(h&&h!=='#') A(fs.existsSync(path.join(root,'terms',h)),t+' link resolves: '+h);});
  A(d.querySelector('.hdr-back').getAttribute('href')==='../index.html',t+' links back to the term list');
});
// every Term 2 card is in its own week
const d=doc('terms/sy2627-term2.html'); let sec=null, bad=[];
d.querySelectorAll('.sec-title, .hub-card').forEach(n=>{
  if(n.classList.contains('sec-title')){ sec=(n.textContent.match(/Week (\d+)/)||[])[1]; return; }
  const tag=n.querySelector('.tag').textContent; if(!tag.startsWith('W'+sec)) bad.push(tag+' under Week '+sec); });
A(bad.length===0,'Term 2: every card sits in its own week'+(bad.length?' -> '+bad.join('; '):''));
A([...d.querySelectorAll('a.hub-card')].length===13,'Term 2: 13 lessons have checkers');
A([...d.querySelectorAll('div.hub-card.hub-soon')].every(c=>!c.querySelector('a')),'Term 2: lessons without a checker are listed, not linked');
console.log('HUB TEST PASSED');

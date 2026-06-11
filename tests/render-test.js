/* Render regression — three different figures must all mount on ONE Label engine.
   Run:  npm install jsdom   then   node tests/render-test.js                     */
const fs=require('fs'), path=require('path');
const {JSDOM}=require(path.join(__dirname,'..','node_modules','jsdom'));
const root=path.join(__dirname,'..');
const dom=new JSDOM('<!DOCTYPE html><body><div id="hdrDots"></div><main id="main"></main></body>',{runScripts:'dangerously'});
const w=dom.window; w.scrollTo=function(){};
['js/checker-kit.js','js/tool-label.js','js/fig-triangle.js'].forEach(f=>w.eval(fs.readFileSync(path.join(root,f),'utf8')));
const K=w.K, d=w.document;
function assert(c,m){ if(!c){ console.log('FAIL:',m); process.exit(1);} console.log('ok:',m); }

// SQUARE
K.run([{id:'sq',num:'SQ',prompt:'square',pipeline:[{tool:'label',
  figure:'<svg viewBox="0 0 340 250"><rect x="90" y="45" width="160" height="160"/></svg>',
  zones:[{id:'t',x:50,y:18,accepts:['side']},{id:'r',x:73,y:50,accepts:['side']},{id:'b',x:50,y:82,accepts:['side']},{id:'l',x:26,y:50,accepts:['side']}],
  chips:[{id:'s1',text:'6 cm',type:'side'},{id:'s2',text:'6 cm',type:'side'},{id:'s3',text:'6 cm',type:'side'},{id:'s4',text:'6 cm',type:'side'},{id:'d',text:'hypotenuse',type:'hyp'}],badger:'x'}]}]);
assert(d.querySelector('.lab-stage'),'square mounts');
assert(d.querySelectorAll('.lab-zone').length===4,'square: 4 zones ('+d.querySelectorAll('.lab-zone').length+')');
assert(d.querySelectorAll('.lab-chip').length===5,'square: 5 chips ('+d.querySelectorAll('.lab-chip').length+')');

// RECTANGLE
K.run([{id:'rc',num:'RC',prompt:'rect',pipeline:[{tool:'label',
  figure:'<svg viewBox="0 0 340 250"><rect x="70" y="70" width="200" height="110"/></svg>',
  zones:[{id:'t',x:50,y:28,accepts:['length']},{id:'b',x:50,y:72,accepts:['length']},{id:'l',x:20,y:50,accepts:['width']},{id:'r',x:80,y:50,accepts:['width']}],
  chips:[{id:'l1',text:'8 m',type:'length'},{id:'l2',text:'8 m',type:'length'},{id:'w1',text:'5 m',type:'width'},{id:'w2',text:'5 m',type:'width'}]}]}]);
assert(d.querySelector('.lab-stage'),'rectangle mounts');
assert(d.querySelectorAll('.lab-zone').length===4,'rectangle: 4 zones ('+d.querySelectorAll('.lab-zone').length+')');

// TRIANGLE (via figTriangle, tan elev = 3 side zones (1 distractor) + 4 angle candidates = 7 zones, 4 chips)
K.run([{id:'tr',num:'TR',prompt:'tri',pipeline:[Object.assign({tool:'label'},
  w.figTriangle({type:'elev',ratio:'tan',R:[70,200],LOW:[280,200],HIGH:[70,60]}))]}]);
assert(d.querySelector('.lab-stage'),'triangle mounts on the SAME engine');
assert(d.querySelectorAll('.lab-stage svg polygon').length===1,'triangle SVG drawn');
assert(d.querySelectorAll('.lab-zone').length===7,'triangle: 7 zones (3 sides + 4 angle candidates) ('+d.querySelectorAll('.lab-zone').length+')');
assert(d.querySelectorAll('.lab-chip').length===4,'triangle: 4 chips (opp/adj/hyp/theta) ('+d.querySelectorAll('.lab-chip').length+')');
console.log('ALL THREE FIGURES MOUNT ON ONE ENGINE \u2014 PASSED');

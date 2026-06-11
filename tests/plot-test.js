/* Plot regression — grid + pre-image render, and the hashed targets equal the rule-applied image coords.
   (Tap/snap needs a real layout engine, so the placement itself is eyeballed; this covers render + answer data.)
   Run:  npm install jsdom   then   node tests/plot-test.js                                                  */
const fs=require('fs'),path=require('path');
const {JSDOM}=require(path.join(__dirname,'..','node_modules','jsdom'));
const root=path.join(__dirname,'..');
const dom=new JSDOM('<!DOCTYPE html><body><div id="hdrDots"></div><main id="main"></main></body>',{runScripts:'dangerously'});
const w=dom.window; w.scrollTo=()=>{};
['js/checker-kit.js','js/tool-plot.js'].forEach(f=>w.eval(fs.readFileSync(path.join(root,f),'utf8')));
const K=w.K,d=w.document;
function A(c,m){if(!c){console.log('FAIL:',m);process.exit(1)}console.log('ok:',m);}

const preimage=[{x:1,y:1,label:'A'},{x:3,y:1,label:'B'},{x:1,y:3,label:'C'}];
const targets=[{label:'A\u2032',ch:2088355844},{label:'B\u2032',ch:2088427718},{label:'C\u2032',ch:2088355842}];
K.run([{id:'p9',num:'P-9',prompt:'plot',pipeline:[{tool:'plot',prompt:'tap to plot',range:6,preimage,targets}]}]);

// render
A(d.querySelector('.plot-svg'),'coordinate grid mounts');
A(d.querySelectorAll('.plot-svg line').length>10,'gridlines + axes drawn ('+d.querySelectorAll('.plot-svg line').length+')');
A(d.querySelector('.plot-svg polygon'),'pre-image triangle drawn');
A(/Tap the grid/.test(d.querySelector('.plot-readout').textContent),'prompts first target');

// answer data: rule (x+2, y-4) applied to pre-image hashes to the targets
const h=K._djb2;
preimage.forEach((p,i)=>{ const key=(p.x+2)+','+(p.y-4); A(h(key)===targets[i].ch, targets[i].label+' hash matches rule-applied ('+key+')'); });
console.log('PLOT TEST PASSED');

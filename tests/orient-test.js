/* Orient picker — 4 quadrant candidates render, wrong nudges, correct completes.
   Run:  npm install jsdom   then   node tests/orient-test.js                       */
const fs=require('fs'),path=require('path');
const {JSDOM}=require(path.join(__dirname,'..','node_modules','jsdom'));
const root=path.join(__dirname,'..');
const dom=new JSDOM('<!DOCTYPE html><body><div id="hdrDots"></div><main id="main"></main></body>',{runScripts:'dangerously'});
const w=dom.window; w.scrollTo=()=>{};
['js/checker-kit.js','js/tool-orient.js','js/fig-orientations.js'].forEach(f=>w.eval(fs.readFileSync(path.join(root,f),'utf8')));
const K=w.K,d=w.document;
function A(c,m){if(!c){console.log('FAIL:',m);process.exit(1)}console.log('ok:',m);}
K.run([{id:'p',num:'P',prompt:'orient',pipeline:[{tool:'orient',prompt:'pick',candidates:w.figOrientations(),ch:5862169}]}]);
A(d.querySelectorAll('.orient-card').length===4,'4 quadrant cards');
A(d.querySelectorAll('.orient-card svg polygon').length===4,'each draws a triangle');
w.K.act('p',0,'pick',0); w.K.act('p',0,'check');
A(d.querySelector('.fb.err') && !/Complete/.test(d.querySelector('.card').textContent),'wrong nudges, no complete');
w.K.act('p',0,'pick',1); w.K.act('p',0,'check');
A(/Complete/.test(d.querySelector('.card').textContent),'correct (BR) completes');
console.log('ORIENT TEST PASSED');

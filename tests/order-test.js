/* Order regression — step-locked sequencing: right tap advances, wrong tap nudges, full order completes.
   Run:  npm install jsdom   then   node tests/order-test.js                                            */
const fs=require('fs'),path=require('path');
const {JSDOM}=require(path.join(__dirname,'..','node_modules','jsdom'));
const root=path.join(__dirname,'..');
function fresh(){
  const dom=new JSDOM('<!DOCTYPE html><body><div id="hdrDots"></div><main id="main"></main></body>',{runScripts:'dangerously'});
  const w=dom.window; w.scrollTo=()=>{};
  ['js/checker-kit.js','js/tool-order.js'].forEach(f=>w.eval(fs.readFileSync(path.join(root,f),'utf8')));
  return w;
}
function A(c,m){if(!c){console.log('FAIL:',m);process.exit(1)}console.log('ok:',m);}
const items=[{id:'s1',text:'Label opposite, adjacent, hypotenuse'},{id:'s2',text:'Pick the ratio (SOH-CAH-TOA)'},
             {id:'s3',text:'Set up the equation'},{id:'s4',text:'Solve for the unknown'}];
const seq=[3271053374,3889240081,3459945885,4178664390];
const prob=()=>[{id:'p8',num:'P-8',prompt:'order',pipeline:[{tool:'order',prompt:'order',items,seq}]}];

// render
let w=fresh(); w.K.run(prob()); let d=w.document;
A(d.querySelectorAll('.order-row').length===4,'4 rows render');

// wrong-first tap nudges, does not complete
w=fresh(); w.K.run(prob()); d=w.document;
w.K.act('p8',0,'check',1);                              // tap s2 first (wrong — s1 is first)
A(d.querySelector('.fb.err'),'wrong tap nudges (err feedback)');
A(!/Complete/.test(d.querySelector('.card').textContent),'wrong tap does not complete');

// correct full order completes
w=fresh(); w.K.run(prob()); d=w.document;
[0,1,2,3].forEach(i=>w.K.act('p8',0,'check',i));
A(/Complete/.test(d.querySelector('.card').textContent),'correct full sequence completes');
console.log('ORDER TEST PASSED');

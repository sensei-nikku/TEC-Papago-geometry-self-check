/* Solve regression — chain grows on correct picks, holds on wrong, hands off to calc step.
   Run:  npm install jsdom   then   node tests/solve-test.js                              */
const fs=require('fs'),path=require('path');
const {JSDOM}=require(path.join(__dirname,'..','node_modules','jsdom'));
const root=path.join(__dirname,'..');
const dom=new JSDOM('<!DOCTYPE html><body><div id="hdrDots"></div><main id="main"></main></body>',{runScripts:'dangerously'});
const w=dom.window; w.scrollTo=()=>{};
['js/checker-kit.js','js/tool-solve.js'].forEach(f=>w.eval(fs.readFileSync(path.join(root,f),'utf8')));
const K=w.K,d=w.document;
function A(c,m){if(!c){console.log('FAIL:',m);process.exit(1)}console.log('ok:',m);}
K.run([{id:'p6',num:'P-6',prompt:'solve',pipeline:[
  {tool:'solve',start:'90 = ½·15·h',steps:[
    {instruction:'undo ½',options:['×2','×½','×15','×1/15'],ch:5867054,then:'2·90 = 15·h'},
    {instruction:'undo 15',options:['×15','×1/15','×2','×½'],ch:390939010,then:'(1/15)·2·90 = h'}]},
  {tool:'numeric',answer:12,unit:'cm'}]}]);
A(d.querySelector('.solve-chain').children.length===1,'starts with 1 chain line');
A(d.querySelectorAll('.ratio-btn').length===4,'4 operation options');
K.act('p6',0,'pick',1); K.act('p6',0,'check');
A(d.querySelector('.solve-chain').children.length===1,'wrong pick holds the chain');
K.act('p6',0,'pick',0); K.act('p6',0,'check');
A(d.querySelector('.solve-chain').children.length===2,'correct pick grows chain');
K.act('p6',0,'pick',1); K.act('p6',0,'check');
A(d.querySelector('.calc-row'),'hands off to calculator (Numeric) step');
K.input('p6',1,'12'); K.act('p6',1,'check');
A(/Complete/.test(d.querySelector('.card').textContent),'complete after calculator answer');
console.log('SOLVE TEST PASSED');

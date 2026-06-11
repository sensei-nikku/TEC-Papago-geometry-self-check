/* Show Work popup — Label renders the labeled figure; the modal assembles ratio + chain + answer.
   Run:  npm install jsdom   then   node tests/work-test.js                                       */
const fs=require('fs'),path=require('path');
const {JSDOM}=require(path.join(__dirname,'..','node_modules','jsdom'));
const root=path.join(__dirname,'..');
const dom=new JSDOM('<!DOCTYPE html><body><div id="hdrDots"></div><main id="main"></main></body>',{runScripts:'dangerously'});
const w=dom.window; w.scrollTo=()=>{};
w.eval(fs.readFileSync(path.join(root,'js/checker-kit.js'),'utf8'));
const K=w.K, d=w.document;
const caught={}; const orig=K.tool; w.K.tool=function(n,def){caught[n]=def;return orig(n,def);};
['js/tool-label.js','js/tool-solve.js','js/fig-triangle.js'].forEach(f=>w.eval(fs.readFileSync(path.join(root,f),'utf8')));
function A(c,m){if(!c){console.log('FAIL:',m);process.exit(1)}console.log('ok:',m);}
const lstep=Object.assign({tool:'label'}, w.figTriangle({type:'elev',ratio:'sin',R:[255,175],LOW:[70,175],HIGH:[255,60]}));
const lwork=caught.label.work(lstep, {placed:{opp:'opp',hyp:'hyp',theta:'in_LOW'}}, {esc:K._esc});
A(/lab-stage/.test(lwork) && /<svg/.test(lwork),'Label work: figure renders');
A(/lab-zone filled/.test(lwork) && /opposite/.test(lwork) && /hypotenuse/.test(lwork),'Label work: student labels shown');
function pick(txt){const b=[...d.querySelectorAll('.ratio-btn')].find(x=>x.textContent.trim()===txt);return [...d.querySelectorAll('.ratio-btn')].indexOf(b);}
K.run([{id:'p',num:'Q1',prompt:'Find x.',pipeline:[
  {tool:'choice',label:'Which ratio?',options:['SIN','COS','TAN'],ch:K._djb2('SIN')},
  {tool:'solve',label:'Isolate x',start:'sin(30) = x / 10',steps:[{instruction:'multiply by?',options:['\u00D710','\u00D71/10'],ch:K._djb2('\u00D710'),then:'10 \u00B7 sin(30) = x'}]},
  {tool:'numeric',label:'Calculator form',answer:5,tol:0.1,unit:'ft'}]}]);
w.K.act('p',0,'pick',pick('SIN')); w.K.act('p',0,'check');
w.K.act('p',1,'pick',pick('\u00D710')); w.K.act('p',1,'check');
w.K.input('p',2,'5'); w.K.act('p',2,'check');
A(d.querySelector('.btn-work'),'Show Work button on completed problem');
w.K.showWork('p'); const mt=d.querySelector('.work-modal').textContent;
A(/SIN/.test(mt),'popup shows chosen ratio');
A(/sin\(30\) = x \/ 10/.test(mt) && /10 \u00B7 sin\(30\) = x/.test(mt),'popup shows algebra chain');
A(/5 ft/.test(mt),'popup shows boxed answer');
w.K.closeWork(); A(!d.querySelector('.work-modal'),'popup closes');
console.log('WORK TEST PASSED');

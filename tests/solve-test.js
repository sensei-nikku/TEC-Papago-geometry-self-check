/* Solve (typed) regression — tap operation, then type the value; chain grows;
   f-inverse needs no value; denominator runs two multiply cycles; wrong op /
   wrong value strike. Run: node tests/solve-test.js */
const fs=require('fs'),path=require('path');
const {JSDOM}=require(path.join(__dirname,'..','node_modules','jsdom'));
const root=path.join(__dirname,'..');
function fresh(){
  const dom=new JSDOM('<!DOCTYPE html><body><div id="hdrDots"></div><main id="main"></main></body>',{runScripts:'dangerously'});
  const w=dom.window; w.scrollTo=()=>{};
  ['js/checker-kit.js','js/tool-solve.js'].forEach(f=>w.eval(fs.readFileSync(path.join(root,f),'utf8')));
  return w;
}
function A(c,m){if(!c){console.log('FAIL:',m);process.exit(1)}console.log('ok:',m);}
const X='\u00D7', FINV='f\u207B\u00B9';

// ---- 1) DENOMINATOR: two multiply cycles, chain visibly grows ----
let w=fresh(),K=w.K,d=w.document;
K.run([{id:'pd',num:'D',prompt:'p',pipeline:[
  {tool:'solve',start:'sin(2\u00B0) = 230.2 / d',moves:[
    {ask:'lift d',opCh:177788,valCh:177673,then:'d \u00B7 sin(2\u00B0) = 230.2'},
    {ask:'free d',opCh:177788,valCh:2109679585,then:'d = 230.2 / sin(2\u00B0)'}]},
  {tool:'numeric',answer:6596,tol:250,unit:'ft'}]}]);
A(d.querySelector('.solve-chain').children.length===1,'denom: starts at 1 chain line');
A(d.querySelectorAll('.ratio-btn').length===3,'denom: 3 operations (\u00D7,+,f\u207B\u00B9)');
K.act('pd',0,'check',X); A(d.querySelector('.num-input'),'denom m1: \u00D7 opens a value box');
A(d.querySelector('.solve-chain').children.length===1,'denom m1: chain still 1 before value');
K.input('pd',0,'d'); K.act('pd',0,'check');
A(d.querySelector('.solve-chain').children.length===2,'denom m1: typing d grows chain to 2');
A(d.querySelectorAll('.ratio-btn').length===3,'denom m2: back to operation choice');
K.act('pd',0,'check',X); K.input('pd',0,'1/sin(2\u00B0)'); K.act('pd',0,'check');
A(!d.querySelector('.ratio-btn') && d.querySelector('.calc-row'),'denom: done -> numeric step');

// ---- 2) MULTIPLY: wrong op strikes, wrong value strikes+clears, right value advances ----
w=fresh();K=w.K;d=w.document;
K.run([{id:'pm',num:'M',prompt:'p',pipeline:[
  {tool:'solve',start:'sin(7.7\u00B0) = x / 21120',moves:[
    {ask:'free x',opCh:177788,valCh:195264251,then:'21120 \u00B7 sin(7.7\u00B0) = x'}]},
  {tool:'numeric',answer:2829.8,tol:15,unit:'ft'}]}]);
K.act('pm',0,'check','+');
A(d.querySelector('.fb.err') && d.querySelector('.solve-chain').children.length===1,'mult: wrong op = strike, chain holds');
K.act('pm',0,'check',X);
A(d.querySelector('.num-input'),'mult: \u00D7 opens value box');
K.input('pm',0,'999'); K.act('pm',0,'check');
A(d.querySelector('.fb.err'),'mult: wrong value = strike');
A(d.querySelector('.num-input').value==='','mult: entry clears on miss');
K.input('pm',0,'21120'); K.act('pm',0,'check');
A(!d.querySelector('.ratio-btn'),'mult: right value advances past solve');

// ---- 3) F-INVERSE: tap f-inv, no value, advances ----
w=fresh();K=w.K;d=w.document;
K.run([{id:'pf',num:'F',prompt:'p',pipeline:[
  {tool:'solve',start:'tan(\u03B8) = 1390 / 2640',moves:[
    {ask:'free \u03B8',opCh:193762655,then:'\u03B8 = tan\u207B\u00B9(1390 / 2640)'}]},
  {tool:'numeric',answer:27.77,tol:0.5,unit:'\u00B0'}]}]);
K.act('pf',0,'check',X);
A(d.querySelector('.fb.err'),'finv: arithmetic op = strike');
K.act('pf',0,'check',FINV);
A(!d.querySelector('.ratio-btn') && d.querySelector('.calc-row'),'finv: f\u207B\u00B9 advances with no value typed');

console.log('SOLVE (typed) TEST PASSED');

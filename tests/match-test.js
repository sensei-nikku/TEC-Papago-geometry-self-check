/* Match regression — renders targets/slots/items, and the hashed pairing is correct.
   Run:  npm install jsdom   then   node tests/match-test.js                          */
const fs=require('fs'),path=require('path');
const {JSDOM}=require(path.join(__dirname,'..','node_modules','jsdom'));
const root=path.join(__dirname,'..');
const dom=new JSDOM('<!DOCTYPE html><body><div id="hdrDots"></div><main id="main"></main></body>',{runScripts:'dangerously'});
const w=dom.window; w.scrollTo=()=>{};
['js/checker-kit.js','js/tool-match.js'].forEach(f=>w.eval(fs.readFileSync(path.join(root,f),'utf8')));
const K=w.K,d=w.document;
function A(c,m){if(!c){console.log('FAIL:',m);process.exit(1)}console.log('ok:',m);}

const targets=[{id:'t1',text:'slope 2, through (0, 3)',ch:375495939},
               {id:'t2',text:'slope −1, through (0, 4)',ch:179818975},
               {id:'t3',text:'slope ½, through (0, −2)',ch:1520350447}];
const items=[{id:'a',text:'y = 2x + 3'},{id:'b',text:'y = -x + 4'},{id:'c',text:'y = ½x - 2'},{id:'d',text:'y = 2x - 1'}];
K.run([{id:'p7',num:'P-7',prompt:'match',pipeline:[{tool:'match',prompt:'drag',targets,items}]}]);

// render
A(d.querySelectorAll('.match-slot').length===3,'3 target slots ('+d.querySelectorAll('.match-slot').length+')');
A(d.querySelectorAll('.lab-chip').length===4,'4 item chips ('+d.querySelectorAll('.lab-chip').length+')');
A(/drag/i.test(d.querySelector('.lab-prompt').textContent),'prompt present');

// pairing logic via the hash
const h=K._djb2;
A(h('y = 2x + 3')===375495939,'item a -> t1');
A(h('y = -x + 4')===179818975,'item b -> t2');
A(h('y = ½x - 2')===1520350447,'item c -> t3');
const chs=targets.map(t=>t.ch);
A(!chs.includes(h('y = 2x - 1')),'distractor d matches NO target');
console.log('MATCH TEST PASSED');

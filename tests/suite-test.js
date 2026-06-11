/* Suite regression — both Hudson checkers mount on real data, and the hub links both, JS-off.
   Run:  npm install jsdom   then   node tests/suite-test.js                                  */
const fs=require('fs'),path=require('path');
const {JSDOM}=require(path.join(__dirname,'..','node_modules','jsdom'));
const root=path.join(__dirname,'..');
function A(c,m){if(!c){console.log('FAIL:',m);process.exit(1)}console.log('ok:',m);}

function loadChecker(file){
  const dom=new JSDOM('<!DOCTYPE html><body><div id="hdrDots"></div><main id="main"></main></body>',{runScripts:'dangerously'});
  const w=dom.window; w.scrollTo=()=>{};
  ['js/checker-kit.js','js/tool-label.js','js/tool-solve.js','js/fig-triangle.js','js/tool-orient.js','js/fig-orientations.js'].forEach(f=>w.eval(fs.readFileSync(path.join(root,f),'utf8')));
  const html=fs.readFileSync(path.join(root,file),'utf8');
  const inline=html.split('fig-triangle.js"></script>')[1].split('<script>')[1].split('</script>')[0];
  w.eval(inline); return w.document;
}

let d=loadChecker('checkers/hudson-pretest.html');
A(d.querySelectorAll('.qd').length===4,'Pre-Test: 4 problems');
A(d.querySelector('.orient-grid .orient-card svg polygon'),'Pre-Test: Q1 orient grid mounts');
A(d.querySelectorAll('.orient-card').length===4,'Pre-Test: Q1 has 4 orientation candidates');

d=loadChecker('checkers/hudson-project.html');
A(d.querySelectorAll('.qd').length===8,'Project: 8 problems');
A(d.querySelector('.orient-grid .orient-card svg polygon'),'Project: Q1 orient grid mounts');
A(d.querySelectorAll('.orient-card').length===4,'Project: Q1 has 4 orientation candidates');

// hub, JS OFF (no runScripts) — static cards must link both checkers
const hub=new JSDOM(fs.readFileSync(path.join(root,'index.html'),'utf8')).window.document;
const hrefs=[...hub.querySelectorAll('.hub-card:not(.hub-soon)')].map(a=>a.getAttribute('href'));
A(hrefs.includes('checkers/hudson-project.html'),'Hub: Project card live + linked');
A(hrefs.includes('checkers/hudson-pretest.html'),'Hub: Pre-Test card live + linked');
console.log('SUITE TEST PASSED');

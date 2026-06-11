/* Suite regression — the Hudson checker mounts on real data, and the hub renders Hudson live.
   Run:  npm install jsdom   then   node tests/suite-test.js                                  */
const fs=require('fs'),path=require('path');
const {JSDOM}=require(path.join(__dirname,'..','node_modules','jsdom'));
const root=path.join(__dirname,'..');
function A(c,m){if(!c){console.log('FAIL:',m);process.exit(1)}console.log('ok:',m);}
(function(){
  const dom=new JSDOM('<!DOCTYPE html><body><div id="hdrDots"></div><main id="main"></main></body>',{runScripts:'dangerously'});
  const w=dom.window; w.scrollTo=()=>{};
  ['js/checker-kit.js','js/tool-label.js','js/fig-triangle.js'].forEach(f=>w.eval(fs.readFileSync(path.join(root,f),'utf8')));
  const html=fs.readFileSync(path.join(root,'checkers/hudson.html'),'utf8');
  const inline=html.split('fig-triangle.js"></script>')[1].split('<script>')[1].split('</script>')[0];
  w.eval(inline); const d=w.document;
  A(d.querySelectorAll('.qd').length===4,'Hudson: 4 problems');
  A(d.querySelector('.lab-stage svg polygon'),'Hudson: Q1 triangle mounts');
})();
(function(){
  const dom=new JSDOM(fs.readFileSync(path.join(root,'index.html'),'utf8'),{runScripts:'dangerously'});
  const cards=[...dom.window.document.querySelectorAll('.hub-card')];
  const hudson=cards.find(c=>/Hudson/.test(c.textContent));
  A(hudson && !hudson.classList.contains('hub-soon') && /checkers\/hudson\.html/.test(hudson.getAttribute('href')),'Hub: Hudson live + linked');
})();
console.log('SUITE TEST PASSED');

/* Drag to the paper (engine v1.6.0): the pointer path. A card dragged from the question pane
   and let go over a drop box on the paper is placed; let go anywhere else, nothing happens;
   a tap (no movement) only picks the card; the ghost follows the pointer and the box under it
   lights up. jsdom has no layout, so the drop boxes get stub bounding boxes.
   Run: node tests/drag-test.js */
const fs=require('fs'),path=require('path');
const {JSDOM}=require(path.join(__dirname,'..','node_modules','jsdom'));
const root=path.join(__dirname,'..');
function A(c,m){if(!c){console.log('FAIL:',m);process.exit(1)}console.log('ok:',m);}
const SRC=fs.readFileSync(path.join(root,'checkers','week7-lesson2-surface-area.html'),'utf8');
const dom=new JSDOM('<!DOCTYPE html><body><div id="hdrDots"></div><main id="main"></main></body>',{runScripts:'dangerously'});
const w=dom.window, d=w.document; w.scrollTo=()=>{}; w.HTMLElement.prototype.scrollIntoView=function(){};
w.eval(fs.readFileSync(path.join(root,'js/checker-kit.js'),'utf8'));
w.eval(fs.readFileSync(path.join(root,'js/tool-drag.js'),'utf8'));
const s=SRC.split('<script>'); w.eval(s[s.length-1].split('</script>')[0]);
const PE=(type,x,y,el)=>{ (el||d).dispatchEvent(new w.MouseEvent(type,{clientX:x,clientY:y,bubbles:true,cancelable:true})); };
const RECT=(l,t)=>({left:l,top:t,right:l+60,bottom:t+30,width:60,height:30});
function stub(){ d.querySelectorAll('[data-drop]').forEach((z,i)=>{ z.getBoundingClientRect=()=>RECT(100,100+i*50); }); }
const zoneY=id=>{ const zs=[...d.querySelectorAll('[data-drop]')]; return 100+zs.findIndex(z=>z.getAttribute('data-drop')===id)*50+10; };
const cardEl=t=>[...d.querySelectorAll('#ckQ .dd-card')].find(e=>e.textContent===t);
const labels=()=>[...d.querySelectorAll('#ckWork .wk-fig .wk-lbl')].map(e=>e.textContent);

A(w.K.VERSION==='1.6.0','engine 1.6.0');
stub();
/* a drag that ends on the right spot */
let c=cardEl('h = ?'); PE('pointerdown',10,10,c); PE('pointermove',40,40);
A(d.querySelector('.dd-ghost') && d.body.classList.contains('dd-on'),'moving past the threshold lifts a ghost card');
PE('pointermove',120,zoneY('h'));
A(d.querySelector('[data-drop="h"]').classList.contains('dd-over'),'the drop box under the pointer lights up');
PE('pointerup',120,zoneY('h'));
A(!d.querySelector('.dd-ghost') && labels().includes('h = ?'),'letting go over the box places the label; the ghost is gone');
/* a drag that ends nowhere */
stub(); c=cardEl('S = 228 cm²'); PE('pointerdown',10,10,c); PE('pointermove',50,50); PE('pointerup',400,600);
A(labels().length===1 && cardEl('S = 228 cm²'),'letting go away from every box changes nothing');
/* a tap is not a drag */
c=cardEl('l = 6 cm'); PE('pointerdown',10,10,c); PE('pointerup',11,11); c.click();
A(!d.querySelector('.dd-ghost') && d.querySelector('#ckQ .dd-card.sel') && d.querySelector('#ckQ .dd-card.sel').textContent==='l = 6 cm','a tap (no movement) only picks the card');
/* the click that trails a real drop does not count as a second tap on the box */
stub(); c=cardEl('w = 4 cm'); PE('pointerdown',10,10,c); PE('pointermove',60,60); PE('pointerup',120,zoneY('w'));
const z=d.querySelector('[data-drop="S"]'); if(z) z.click();
A(labels().includes('w = 4 cm') && !d.querySelector('#ckQ .fb.err'),'a drop then a stray click: one placement, no error');
/* finish the sketch by dragging, then the model by dragging */
stub(); ['l = 6 cm','S = 228 cm²'].forEach(t=>{ const id=t[0]; stub(); const e=cardEl(t); PE('pointerdown',5,5,e); PE('pointermove',60,60); PE('pointerup',120,zoneY(id)); });
A(w.K._S().t1.stepIdx===1,'every label dragged home: step 1, 3, 4 done');
stub(); c=cardEl('S = Ph + 2B'); PE('pointerdown',5,5,c); PE('pointermove',60,60); PE('pointermove',120,zoneY('model')); PE('pointerup',120,zoneY('model'));
A(w.K._S().t1.stepIdx===2 && d.getElementById('ckWork').textContent.includes('S = Ph + 2B'),'the model dragged to step 2 is written there');
/* pointercancel drops nothing */
console.log('\ndrag-test PASSED');

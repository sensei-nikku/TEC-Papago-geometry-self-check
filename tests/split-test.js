/* Behavioural test — engine v1.3.0 split shell + the Hudson project checker.
   node tests/split-test.js   (needs jsdom; see package.json) */
const fs = require('fs'), path = require('path');
const { JSDOM, VirtualConsole } = require('jsdom');
const ROOT = path.join(__dirname, '..');
let fails = 0;
function ok(name, cond, extra) {
  if (cond) console.log('  \u2713 ' + name);
  else { fails++; console.log('  \u2717 ' + name + (extra ? '  -> ' + extra : '')); }
}
function boot(inlineScript, files) {
  const vc = new VirtualConsole();
  let err = null;
  vc.on('jsdomError', e => { err = e; });
  const dom = new JSDOM('<!DOCTYPE html><body><main class="main wide" id="main"></main>' +
    '<div class="hdr-dots" id="hdrDots"></div></body>',
    { runScripts: 'dangerously', pretendToBeVisual: true, virtualConsole: vc });
  files.forEach(f => {
    const s = dom.window.document.createElement('script');
    s.textContent = fs.readFileSync(path.join(ROOT, f), 'utf8');
    dom.window.document.body.appendChild(s);
  });
  const s = dom.window.document.createElement('script');
  s.textContent = inlineScript;
  dom.window.document.body.appendChild(s);
  return { dom, w: dom.window, err: () => err };
}

/* ---------- 1. engine: split shell, limits, two-level nudges ---------- */
console.log('\nengine v1.3.0 — split shell');
{
  const inline = `
    K.run([
      { id:'p1', num:'P1', prompt:'A prompt.', want:'the height',
        given:[{v:'12 ft', k:'base'},{v:'30\\u00B0', k:'angle'}],
        reference:'<div class="ref-note">DEGREE mode</div>',
        figure:'<svg id="plainFig"></svg>',
        pipeline:[
          { tool:'choice', label:'S1', options:['A','B','C'], ch:K._djb2('A'), limit:2,
            nudges:['BROAD first','SPECIFIC second'] },
          { tool:'numeric', label:'S2', answer:10, tol:0.5, unit:'ft',
            traps:[{near:20, tol:0.5, msg:'TRAP-DOUBLED'}] }
      ]},
      { id:'p2', num:'P2', prompt:'Second.', pipeline:[{ tool:'numeric', label:'S1', answer:1 }] }
    ], { layout:'split' });`;
  const { w, err } = boot(inline, ['js/checker-kit.js']);
  const doc = w.document;
  ok('no load error', !err(), err() && String(err().detail || err()));
  ok('version is 1.3.0', w.K.VERSION === '1.3.0', w.K.VERSION);
  ok('layout reported as split', w.K.layout() === 'split');
  ok('rail pane rendered', !!doc.getElementById('ckRail'));
  ok('surface pane rendered', !!doc.getElementById('ckSurf'));
  const rail = () => doc.getElementById('ckRail').innerHTML;
  const surf = () => doc.getElementById('ckSurf').innerHTML;
  ok('prompt is in the rail, not the surface', /A prompt\./.test(rail()) && !/A prompt\./.test(surf()));
  ok('givens are on the surface', /What you know/.test(surf()) && /12 ft/.test(surf()) && /base/.test(surf()));
  ok('"looking for" is on the surface', /the height/.test(surf()));
  ok('reference is on the surface', /DEGREE mode/.test(surf()));
  ok('plain figure falls through to the surface', /plainFig/.test(surf()));
  ok('choice step (no surface pane) renders in the rail', /S1/.test(rail()) && /&gt;A&lt;|>A</.test(rail()));
  ok('only the active problem is in the rail', /P1/.test(rail()) && !/Second\./.test(rail()));

  // two-level nudges: broad on miss 1, specific on miss 2 is pre-empted by limit:2
  w.K.act('p1', 0, 'pick', 1);            // wrong option
  w.K.act('p1', 0, 'check');
  ok('miss 1 gives the BROAD nudge', /BROAD first/.test(rail()), rail().slice(0, 200));
  w.K.act('p1', 0, 'check');
  ok('limit:2 sends to the teacher on miss 2', /Bring your work to your teacher/.test(rail()));
  ok('teacher-redirect hides the tool', !/BROAD first/.test(rail()));
  w.K.act('p1', 0, 'skip');               // teacher helped
  ok('skip advances to step 2', /S2/.test(rail()));

  // numeric: trap fires ahead of the close band, three tries before redirect
  w.K.input('p1', 1, '20'); w.K.act('p1', 1, 'check');
  ok('trap message beats "close"', /TRAP-DOUBLED/.test(rail()), rail().slice(0, 200));
  w.K.input('p1', 1, '99'); w.K.act('p1', 1, 'check');
  w.K.input('p1', 1, '98'); w.K.act('p1', 1, 'check');
  ok('numeric default limit is 3', /Bring your work to your teacher/.test(rail()));
  w.K.act('p1', 1, 'skip');
  ok('problem 2 becomes active after p1 finishes', /Second\./.test(doc.getElementById('ckRail').innerHTML));
  w.K.navTo(0);
  ok('navigating back shows the finished problem', /Complete/.test(doc.getElementById('ckRail').innerHTML));
  ok('finished problem keeps its locked-in rows', /S1/.test(doc.getElementById('ckRail').innerHTML));
}

/* ---------- 2. the Hudson checker itself ---------- */
console.log('\nhudson-project.html');
{
  const html = fs.readFileSync(path.join(ROOT, 'checkers/hudson-project.html'), 'utf8');
  const inline = html.slice(html.indexOf('var RATIOS'), html.lastIndexOf('</script>'));
  const { w, err } = boot(inline, ['js/checker-kit.js', 'js/tool-label.js', 'js/tool-solve.js',
    'js/fig-triangle.js', 'js/tool-orient.js', 'js/fig-orientations.js']);
  const doc = w.document;
  const rail = () => doc.getElementById('ckRail').innerHTML;
  const surf = () => doc.getElementById('ckSurf').innerHTML;
  ok('no load error', !err(), err() && String(err().detail || err()));
  ok('runs in split layout', w.K.layout() === 'split');
  ok('Q1 prompt in the rail', /21,120 ft\) along its flight path/.test(rail()));
  ok('Q1 givens on the surface', /angle of ascent/.test(surf()) && /21,120 ft/.test(surf()));
  ok('SOH-CAH-TOA reference on the surface', /SOH/.test(surf()) && /TOA/.test(surf()));
  ok('DEGREE-mode reminder on the surface', /DEGREE mode/.test(surf()));
  ok('orientation grid is on the surface, not the rail', /orient-grid/.test(surf()) && !/orient-grid/.test(rail()));
  ok('rail keeps the place with a pointer', /rail-pointer/.test(rail()));
  ok('dots rendered for all 6 problems', doc.getElementById('hdrDots').children.length === 6,
     String(doc.getElementById('hdrDots').children.length));

  // walk Q1: orient -> (skip the drag step) -> HAVE/WANT -> ratio -> chain -> answer
  const cands = w.figOrientations();
  const wrong = cands.findIndex(c => c.id !== 'BR'), right = cands.findIndex(c => c.id === 'BR');
  w.K.act('q1', 0, 'pick', wrong); w.K.act('q1', 0, 'check');
  ok('wrong orientation is nudged, not passed', /Not that one/.test(surf()));
  w.K.act('q1', 0, 'check');
  ok('orient limit is 2', /Bring your work to your teacher/.test(rail()) || /Bring your work/.test(surf()));
  w.K.act('q1', 0, 'skip');
  w.K.act('q1', 0, 'pick', right); // (state reset not needed; step already advanced)
  ok('label step is surface-hosted', /lab-wrap|lab-stage/.test(surf()), surf().slice(0, 120));
  w.K.act('q1', 1, 'skip');        // stand in for the drag
  ok('labelled figure is kept on the surface', /Your figure/.test(surf()));
  // HAVE/WANT — options are shuffled, so find the right one by hash
  const st = w.K._state ? null : null;
  const opts = Array.from(doc.querySelectorAll('#ckRail .opt-row')).map(b => b.textContent);
  ok('HAVE/WANT renders as a full-width stack', opts.length === 4, String(opts.length));
  const target = 'Have: the hypotenuse and the angle  \u2192  Want: the opposite side';
  const idx = opts.findIndex(t => t === target);
  const bad = opts.findIndex(t => t !== target);
  w.K.act('q1', 2, 'pick', bad); w.K.act('q1', 2, 'check');
  ok('HAVE/WANT miss 1 is the broad nudge', /Start at the angle you know/.test(rail()));
  w.K.act('q1', 2, 'pick', idx); w.K.act('q1', 2, 'check');
  ok('correct HAVE/WANT advances', /Which ratio/.test(rail()));
  ok('ratio ask no longer names the sides', !/hypotenuse \(path\)/.test(rail()));
  // ratio: SIN is index 0 of RATIOS (not shuffled)
  w.K.act('q1', 3, 'pick', 2); w.K.act('q1', 3, 'check');   // TAN
  ok('wrong ratio nudged with the reference card', /reference card/.test(rail()));
  w.K.act('q1', 3, 'pick', 0); w.K.act('q1', 3, 'check');   // SIN
  ok('SIN advances to the iff-chain', /Isolate x/.test(rail()));
  w.K.act('q1', 4, 'check', '+');
  ok('wrong operation is nudged', /multiplied here/.test(rail()));
  w.K.act('q1', 4, 'check', '\u00D7');
  w.K.input('q1', 4, '21120'); w.K.act('q1', 4, 'check');
  ok('chain closes and the answer step opens', /Calculator form/.test(rail()));
  w.K.input('q1', 5, '2855.5'); w.K.act('q1', 5, 'check');
  ok('the TAN answer is named as the TAN answer', /TAN answer/.test(rail()), rail().slice(-300));
  w.K.input('q1', 5, '2829.8'); w.K.act('q1', 5, 'check');
  ok('correct answer completes Q1', /Q2/.test(rail()) || /maximum altitude of 3,060/.test(rail()));
}

console.log(fails ? `\n${fails} FAILED` : '\nall passed');
process.exit(fails ? 1 : 0);

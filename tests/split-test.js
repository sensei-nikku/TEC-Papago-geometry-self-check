/* Behavioural test — engine v1.4.0: split shell + coarse-first sub-step ladders,
   then the Hudson project checker walked end to end.
   node tests/split-test.js   (needs jsdom; see package.json) */
const fs = require('fs'), path = require('path');
const { JSDOM, VirtualConsole } = require('jsdom');
const ROOT = path.join(__dirname, '..');
let fails = 0;
function ok(name, cond, extra) {
  if (cond) console.log('  \u2713 ' + name);
  else { fails++; console.log('  \u2717 ' + name + (extra ? '  -> ' + String(extra).slice(0, 260) : '')); }
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

/* ---------- 1. split shell ---------- */
console.log('\nengine v1.4.0 — split shell');
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
  const rail = () => doc.getElementById('ckRail').innerHTML;
  const surf = () => doc.getElementById('ckSurf').innerHTML;
  ok('no load error', !err(), err() && (err().detail || err()));
  ok('version is 1.4.0', w.K.VERSION === '1.4.0', w.K.VERSION);
  ok('layout reported as split', w.K.layout() === 'split');
  ok('both panes rendered', !!doc.getElementById('ckRail') && !!doc.getElementById('ckSurf'));
  ok('prompt in the rail only', /A prompt\./.test(rail()) && !/A prompt\./.test(surf()));
  ok('givens on the surface', /What you know/.test(surf()) && /12 ft/.test(surf()));
  ok('reference on the surface', /DEGREE mode/.test(surf()));
  ok('plain figure falls through to the surface', /plainFig/.test(surf()));
  ok('only the active problem is in the rail', /P1/.test(rail()) && !/Second\./.test(rail()));

  w.K.act('p1', 0, 'pick', 1); w.K.act('p1', 0, 'check');
  ok('miss 1 on a ladderless step gives the BROAD nudge', /BROAD first/.test(rail()));
  w.K.act('p1', 0, 'check');
  ok('limit:2 sends to the teacher', /Bring your work to your teacher/.test(rail()));
  w.K.act('p1', 0, 'skip');
  ok('skip advances', /S2/.test(rail()));
  w.K.input('p1', 1, '20'); w.K.act('p1', 1, 'check');
  ok('trap beats the close band', /TRAP-DOUBLED/.test(rail()));
  w.K.input('p1', 1, '10'); w.K.act('p1', 1, 'check');
  ok('problem 2 becomes active', /Second\./.test(rail()));
  w.K.navTo(0);
  ok('finished problem shows as complete', /Complete/.test(rail()));
}

/* ---------- 2. ladder mechanics ---------- */
console.log('\nengine v1.4.0 — coarse-first ladder');
{
  const inline = `
    K.run([
      { id:'L', num:'L1', prompt:'Big ask.',
        pipeline:[
          { tool:'numeric', label:'The big move', answer:100, tol:1, unit:'ft',
            traps:[{near:50, tol:1, msg:'HALVED-IT'}],
            sub:[
              { tool:'numeric', label:'convert', answer:10, tol:0.5 },
              { tool:'choice',  label:'pick',    options:['A','B'], ch:K._djb2('A') },
              { tool:'numeric', label:'finish',  answer:100, tol:1, unit:'ft' }
            ] },
          { tool:'numeric', label:'After', answer:7, tol:0.5 }
      ]}
    ], { layout:'split' });`;
  const { w, err } = boot(inline, ['js/checker-kit.js']);
  const doc = w.document;
  const rail = () => doc.getElementById('ckRail').innerHTML;
  ok('no load error', !err(), err() && (err().detail || err()));
  ok('the big move is asked first', /The big move/.test(rail()));
  ok('no ladder on screen before a miss', !/Step 1a/.test(rail()) && !/convert/.test(rail()));
  ok('later parents still hidden', !/After/.test(rail()));

  w.K.input('L', 0, '100'); w.K.act('L', 0, 'check');
  ok('a correct big move skips the ladder entirely', !/Step 1a/.test(rail()) && /After/.test(rail()));

  const b = boot(inline, ['js/checker-kit.js']);
  const r2 = () => b.w.document.getElementById('ckRail').innerHTML;
  b.w.K.input('L', 0, '50'); b.w.K.act('L', 0, 'check');
  ok('first miss opens the ladder', /Step 1a/.test(r2()));
  ok('split notice explains itself', /one move at a time/.test(r2()));
  ok('split notice names the range 1a through 1c', /steps 1a through 1c/.test(r2()));
  ok('the trap diagnosis rides along with the split', /HALVED-IT/.test(r2()));
  ok('only the first rung is live', /Step 1a/.test(r2()) && !/Step 1b/.test(r2()));
  ok('a miss that opens a ladder spends no strike', b.w.K._S()['L'].steps[0].misses === 0);
  ok('live step is now the rung', b.w.K._live('L') === b.w.K._sub(0, 0), b.w.K._live('L'));

  const c1 = b.w.K._sub(0, 0), c2 = b.w.K._sub(0, 1), c3 = b.w.K._sub(0, 2);
  b.w.K.input('L', c1, '10'); b.w.K.act('L', c1, 'check');
  ok('rung 1b appears after 1a', /Step 1b/.test(r2()));
  ok('1a persists as locked-in', (r2().match(/locked-in/g) || []).length >= 1);
  ok('rung 1c still hidden', !/Step 1c/.test(r2()));
  b.w.K.act('L', c2, 'pick', 0); b.w.K.act('L', c2, 'check');
  ok('rung 1c appears after 1b', /Step 1c/.test(r2()));
  b.w.K.input('L', c3, '100'); b.w.K.act('L', c3, 'check');
  ok('finishing the ladder settles the parent', b.w.K._S()['L'].stepIdx === 1);
  ok('next parent is live', /After/.test(r2()));
  ok('the walked ladder stays on screen', /Step 1a/.test(r2()) && /Step 1c/.test(r2()));

  const d = boot(inline, ['js/checker-kit.js']);
  const r3 = () => d.w.document.getElementById('ckRail').innerHTML;
  d.w.K.input('L', 0, '50'); d.w.K.act('L', 0, 'check');
  const rc = d.w.K._sub(0, 0);
  for (let i = 0; i < 3; i++) { d.w.K.input('L', rc, '999'); d.w.K.act('L', rc, 'check'); }
  ok('a rung reaches the teacher redirect after 3 misses', /Bring your work to your teacher/.test(r3()));
  d.w.K.act('L', rc, 'skip');
  ok('teacher-helped continues to the next rung', /Step 1b/.test(r3()));
}

/* ---------- 3. the Hudson checker ---------- */
console.log('\nhudson-project.html');
{
  const html = fs.readFileSync(path.join(ROOT, 'checkers/hudson-project.html'), 'utf8');
  const inline = html.slice(html.indexOf('var RATIOS'), html.lastIndexOf('</script>'));
  const { w, err } = boot(inline, ['js/checker-kit.js', 'js/tool-label.js', 'js/tool-solve.js',
    'js/fig-triangle.js', 'js/tool-orient.js', 'js/fig-orientations.js']);
  const doc = w.document;
  const rail = () => doc.getElementById('ckRail').innerHTML;
  const surf = () => doc.getElementById('ckSurf').innerHTML;
  const S = i => w.K._sub(0, i);
  ok('no load error', !err(), err() && (err().detail || err()));
  ok('six problems, numbered Q1 to Q6', doc.getElementById('hdrDots').textContent === 'Q1Q2Q3Q4Q5Q6',
     doc.getElementById('hdrDots').textContent);
  ok('prompt gives miles, not feet', /traveled four miles/.test(rail()) && !/21,120/.test(rail()));
  ok('Q1 opens on the big move only', /The height above the ground/.test(rail()));
  ok('no orientation picker before a miss', !/orient-grid/.test(surf()) && !/orient-grid/.test(rail()));
  ok('no triangle on screen before a miss', !/lab-stage/.test(surf()) && !/<svg/.test(surf()));
  ok('reference and conversion factor on the surface', /SOH/.test(surf()) && /5,280 ft/.test(surf()));

  w.K.input('q1', 0, '2829.8'); w.K.act('q1', 0, 'check');
  ok('a correct Q1 needs no scaffolding at all',
     !/Step 1a/.test(rail()) && /kept climbing for 19 more seconds/.test(rail()));

  w.K.input('q2', 0, '1.25'); w.K.act('q2', 0, 'check');
  ok('an answer in miles is named as such', /answer in miles/.test(rail()));
  ok('the miss opened the Q2 ladder', /Step 1a/.test(rail()));
  w.K.input('q2', S(0), '3060'); w.K.act('q2', S(0), 'check');
  ok('using 3,060 as the rise is caught', /height above the GROUND/.test(rail()));
  w.K.input('q2', S(0), '230.2'); w.K.act('q2', S(0), 'check');
  ok('rung b is the orientation picker, on the surface', /orient-grid/.test(surf()));
  const cands = w.figOrientations();
  w.K.act('q2', S(1), 'pick', cands.findIndex(c => c.id === 'BR'));
  w.K.act('q2', S(1), 'check');
  ok('rung c is the labeller, on the surface', /lab-wrap|lab-stage/.test(surf()));
  w.K.act('q2', S(2), 'skip');
  ok('the labelled figure is kept on the surface', /Your figure/.test(surf()));
  w.K.act('q2', S(3), 'pick', 2); w.K.act('q2', S(3), 'check');
  ok('wrong ratio points at the reference card', /reference card/.test(rail()));
  w.K.act('q2', S(3), 'pick', 0); w.K.act('q2', S(3), 'check');
  ok('rung e is the iff-chain', /denominator/.test(rail()));
  w.K.act('q2', S(4), 'check', '+');
  ok('wrong operation is diagnosed', /multiplied here/.test(rail()));
  w.K.act('q2', S(4), 'check', '\u00D7');
  w.K.input('q2', S(4), 'd'); w.K.act('q2', S(4), 'check');
  w.K.act('q2', S(4), 'check', '\u00D7');
  w.K.input('q2', S(4), '1/sin(2\u00B0)'); w.K.act('q2', S(4), 'check');
  ok('chain closes onto the calculator rung', /Calculator form/.test(rail()));
  w.K.input('q2', S(5), '8'); w.K.act('q2', S(5), 'check');
  ok('multiplying by sin instead of its inverse is named', /multiplied BY sin/.test(rail()));
  w.K.input('q2', S(5), '6596'); w.K.act('q2', S(5), 'check');
  ok('walking the ladder settles Q2', w.K._S()['q2'].done === true);
  ok('Q3 is now live', /dropped 1,390 feet/.test(rail()));

  w.K.input('q3', 0, '0.48'); w.K.act('q3', 0, 'check');
  ok('the radian answer is named on Q3', /radian answer/.test(rail()));
  w.K.input('q3', 0, '27.77'); w.K.act('q3', 0, 'check');
  ok('Q3 accepts the correct angle', /leveled off/.test(rail()));

  w.K.input('q4', 0, '553.4'); w.K.act('q4', 0, 'check');
  w.K.input('q5', 0, '1106.3'); w.K.act('q5', 0, 'check');
  ok('Q6 is live after Q5', /212 feet tall/.test(rail()));
  w.K.input('q6', 0, '1318.3'); w.K.act('q6', 0, 'check');
  ok('adding 212 instead is named', /You added 212/.test(rail()));
  ok('Q6 ladder opened', /Step 1a/.test(rail()));
  w.K.input('q6', S(0), '1106.3'); w.K.act('q6', S(0), 'check');
  w.K.input('q6', S(1), '894.3'); w.K.act('q6', S(1), 'check');
  ok('the whole checker completes', Object.keys(w.K._S()).every(k => w.K._S()[k].done));
}

console.log(fails ? `\n${fails} FAILED` : '\nall passed');
process.exit(fails ? 1 : 0);

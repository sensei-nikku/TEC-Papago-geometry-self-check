/* Hub builder. index.html lists the terms; each term page lists that term's
   lessons in order. A lesson with a checker is a link; a lesson without one
   is listed but not linked. Checkers stay in checkers/ and are shared.
   terms/historical.html is the old week-by-week hub, kept as-is (not generated).
   Run: node build_hub.js */
const fs=require('fs');
const esc=s=>s.replace(/&/g,'&amp;');
const HEAD=(title,css)=>`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="${css}">
<style>
.sec-title{font-size:.74rem;font-weight:700;letter-spacing:.09em;text-transform:uppercase;color:var(--muted);margin:26px 0 10px}
.hub-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:14px}
.hub-card{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:18px;text-decoration:none;color:var(--text);display:block;transition:transform .15s,box-shadow .15s,border-color .15s}
a.hub-card:hover{transform:translateY(-3px);box-shadow:0 8px 22px rgba(0,0,0,.18);border-color:var(--accent)}
.hub-card .tag{font-family:'JetBrains Mono',monospace;font-size:.64rem;font-weight:700;color:var(--accent);text-transform:uppercase;letter-spacing:.07em}
.hub-card h3{font-size:1rem;font-weight:700;margin:6px 0 5px}
.hub-card p{font-size:.83rem;color:var(--muted);line-height:1.5;margin:0}
.hub-soon{opacity:.45;pointer-events:none}
.hub-soon .tag{color:var(--muted)}
</style>
</head>
<body>
`;
// ---- SY2627 Term 2: the lessons in order; file = checker in checkers/, or null ----
const TERM2={id:'sy2627-term2',name:'SY2627 Term 2',weeks:[
 ['Week 1 — Probability',[
  ['W1 · L1','Syllabus Day',null,''],
  ['W1 · L2','Probability from Counts','week1-lesson2-probability.html','Sample spaces and two-way tables.'],
  ['W1 · L3','Probability Rules & Independence','week1-lesson3-rules.html','Product rule, addition rule, and the independence check.']]],
 ['Week 2 — Transformations',[
  ['W2 · L1','Translations & Reflections','week2-lesson1-translate-reflect.html','Slides and flips as maps-to rules.'],
  ['W2 · L2','Rotations & Symmetry','week2-lesson2-rotate-symmetry.html','Quarter turns, half turns, clockwise, and symmetry.'],
  ['W2 · L3','Combining Transformations & Congruence',null,'']]],
 ['Week 3 — Similarity',[
  ['W3 · L1','Dilations','week3-lesson1-dilations.html','Find k as the missing factor and dilate points and figures.'],
  ['W3 · L2','Similar Figures','week3-lesson2-similar-figures.html','Match sides, find k from one matched pair, and find the missing side.'],
  ['W3 · L3','Special Right Triangles','week3-lesson3-special-right.html','45-45-90 and 30-60-90 from the short leg, with conduit bends.']]],
 ['Week 4 — Right-Triangle Trigonometry',[
  ['W4 · L1','Sine, Cosine & Tangent: Missing Sides','week4-lesson1-trig-sides.html','Name the sides from the marked angle, pick sin, cos, or tan, and find the missing side.'],
  ['W4 · L2','Inverse Functions & Inverse Trig','week4-lesson2-inverse-angles.html','Undo the ratio: two sides in, the angle out, with sin⁻¹, cos⁻¹, and tan⁻¹.'],
  ['W4 · L3','Angles of Elevation & Depression','week4-lesson3-elevation-depression.html','Sketch it from the words, move an angle of depression to the bottom, then find the side or the angle.']]],
 ['Week 5 — Midterm: Miracle on the Hudson',[
  ['W5 · Pre-Test','Miracle on the Hudson — Pre-Test','hudson-pretest.html','Four-problem readiness check: set up the triangle, pick the ratio, solve.'],
  ['W5 · Project','Miracle on the Hudson — Project','hudson-project.html','Reconstruct the flight path from the NTSB data.']]],
 ['Week 6 — Coordinate Geometry',[
  ['W6 · L1','Slope: Parallel & Perpendicular Lines',null,''],
  ['W6 · L2','Distance, Perimeter & Area on a Grid',null,''],
  ['W6 · L3','Equation of a Circle',null,''],
  ['W6 · Review','Area Formulas','unit4-day1-area.html','Area of every shape: pick the formula, solve, check.']]],
 ['Week 7 — 3D Shapes & Modeling',[
  ['W7 · L1','Cross-Sections',null,''],
  ['W7 · L2','Volume of Prisms, Cylinders, Pyramids, Cones & Spheres',null,''],
  ['W7 · L3','Density & Size Limits',null,'']]],
 ['Week 8 — Catch-Up & Retakes',[
  ['W8','3D Print Bonus: Design to a Volume Limit',null,'']]]
]};
const TERMS=[
 {href:'terms/sy2627-term2.html',tag:'Current term',name:'SY2627 Term 2',desc:'Probability, transformations, similarity, trig, the Hudson midterm, coordinates, and 3D.'},
 {href:'terms/historical.html',tag:'Archive',name:'Historical',desc:'The older checkers and the hub as it was before SY2627 Term 2.'}];

function card(tag,title,file,desc){
  const t=esc(tag).replace(/ · /g,' &middot; ');
  if(file) return `    <a class="hub-card" href="../checkers/${file}"><div class="tag">${t}</div><h3>${esc(title)}</h3>${desc?`<p>${esc(desc)}</p>`:''}</a>`;
  return `    <div class="hub-card hub-soon"><div class="tag">${t}</div><h3>${esc(title)}</h3><p>No checker</p></div>`;
}
function termPage(T){
  let h=HEAD('Geometry 1 — '+T.name,'../assets/styles.css');
  h+=`<header class="hdr">\n  <div class="hdr-left"><a class="hdr-back" href="../index.html">&larr; All Terms</a><h1>${esc(T.name)}</h1><div class="sub">Geometry 1 &middot; Checkers by lesson</div></div>\n</header>\n<!-- Generated by build_hub.js. Edit the list there, then run: node build_hub.js -->\n<main class="main">\n`;
  T.weeks.forEach(([wk,lessons])=>{ h+=`\n  <div class="sec-title">${esc(wk).replace(' — ',' &mdash; ')}</div>\n  <div class="hub-grid">\n`+lessons.map(l=>card(...l)).join('\n')+`\n  </div>\n`; });
  return h+`</main>\n</body>\n</html>\n`;
}
function indexPage(){
  let h=HEAD('Geometry 1 — Checkers','assets/styles.css');
  h+=`<header class="hdr">\n  <div class="hdr-left"><h1>Geometry 1</h1><div class="sub">Checkers &amp; Tools</div></div>\n</header>\n<!-- Generated by build_hub.js. One card per term. -->\n<main class="main">\n\n  <div class="sec-title">Terms</div>\n  <div class="hub-grid">\n`;
  h+=TERMS.map(t=>`    <a class="hub-card" href="${t.href}"><div class="tag">${esc(t.tag)}</div><h3>${esc(t.name)}</h3><p>${esc(t.desc)}</p></a>`).join('\n');
  return h+`\n  </div>\n</main>\n</body>\n</html>\n`;
}
fs.mkdirSync('terms',{recursive:true});
fs.writeFileSync('terms/'+TERM2.id+'.html',termPage(TERM2));
fs.writeFileSync('index.html',indexPage());
console.log('hub built: index.html, terms/'+TERM2.id+'.html');

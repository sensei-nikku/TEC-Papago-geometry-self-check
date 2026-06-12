/* ===================================================================
   FIGURE — AREA SHAPES
   figArea({ shape:'rect'|'tri'|'pgram'|'trap'|'circ', dims:{...} })
     -> an SVG string for the problem diagram (rendered persistently
        above the steps via the runner's problem-level `figure` hook).
   dims keys: b, h, b1, b2, r, d  (strings incl. units, e.g. '14 m');
              A (area label, shown for backward problems);
              use '?' for the unknown dimension.
   Colors come from CSS custom properties so it themes with the kit
   (dark default / light escape hatch). No measurement is encoded as a
   number here — labels are whatever strings the problem passes in.
   =================================================================== */
(function (global) {
  'use strict';
  var STROKE = 'var(--text)', DIM = 'var(--text)', SUB = 'var(--muted)';
  function esc(s){ return (s==null?'':s).toString().replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  function txt(x,y,t,anchor){ return '<text x="'+x+'" y="'+y+'" text-anchor="'+(anchor||'middle')+'" font-size="13" font-family="DM Sans, sans-serif" fill="'+DIM+'">'+esc(t)+'</text>'; }
  function sub(x,y,t){ return '<text x="'+x+'" y="'+y+'" text-anchor="middle" font-size="11" font-family="DM Sans, sans-serif" fill="'+SUB+'">'+esc(t)+'</text>'; }
  function ra(x,y,s){ s=s||8; return '<path d="M '+(x-s)+','+y+' L '+(x-s)+','+(y-s)+' L '+x+','+(y-s)+'" fill="none" stroke="'+STROKE+'" stroke-width="1.5"/>'; }
  function poly(pts){ return '<polygon points="'+pts+'" fill="none" stroke="'+STROKE+'" stroke-width="2"/>'; }
  function dash(x1,y1,x2,y2){ return '<line x1="'+x1+'" y1="'+y1+'" x2="'+x2+'" y2="'+y2+'" stroke="'+STROKE+'" stroke-width="1.5" stroke-dasharray="5,4"/>'; }

  function figArea(cfg){
    var shape = cfg.shape, d = cfg.dims || {};
    var s = '<svg viewBox="0 0 200 130" width="200" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">';
    if (shape === 'rect'){
      s += '<rect x="25" y="15" width="120" height="75" fill="none" stroke="'+STROKE+'" stroke-width="2"/>';
      s += ra(145,90);
      if (d.b) s += txt(85,108,d.b);
      if (d.h) s += txt(155,57,d.h,'start');
      if (d.A) s += sub(85,57,'A = '+d.A);
    } else if (shape === 'tri'){
      s += poly('25,95 165,95 85,15');
      s += dash(85,95,85,15);
      s += ra(85,95);
      if (d.b) s += txt(95,115,d.b);
      if (d.h) s += txt(72,58,d.h,'end');
      if (d.A) s += sub(120,65,'A = '+d.A);
    } else if (shape === 'pgram'){
      s += poly('40,95 170,95 145,20 15,20');
      s += dash(40,20,40,95);
      s += ra(40,95);
      if (d.b) s += txt(105,115,d.b);
      if (d.h) s += txt(28,60,d.h,'end');
      if (d.A) s += sub(100,62,'A = '+d.A);
    } else if (shape === 'trap'){
      s += poly('15,95 185,95 145,20 55,20');
      s += dash(55,20,55,95);
      s += ra(55,95);
      if (d.b2) s += txt(100,115,d.b2);
      if (d.b1) s += txt(100,14,d.b1);
      if (d.h)  s += txt(42,60,d.h,'end');
      if (d.A)  s += sub(110,62,'A = '+d.A);
    } else if (shape === 'circ'){
      s += '<circle cx="80" cy="60" r="45" fill="none" stroke="'+STROKE+'" stroke-width="2"/>';
      s += '<circle cx="80" cy="60" r="2.5" fill="'+STROKE+'"/>';
      if (d.r){ s += '<line x1="80" y1="60" x2="125" y2="60" stroke="'+STROKE+'" stroke-width="1.5"/>'; s += txt(103,54,d.r); }
      else if (d.d){ s += '<line x1="35" y1="60" x2="125" y2="60" stroke="'+STROKE+'" stroke-width="1.5"/>'; s += txt(80,54,d.d); }
      if (d.A) s += sub(80,120,'A = '+d.A);
    }
    s += '</svg>';
    return s;
  }

  global.figArea = figArea;
})(typeof window !== 'undefined' ? window : this);

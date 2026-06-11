/* ===================================================================
   FIGURE HELPER — the 4 quadrant orientations of a right triangle.
   Right angle in each corner (BL, BR, TL, TR); the triangle fills the
   diagonally-opposite quadrant. Returns [{id, svg}] for tool:'orient'.
   Pure data — the orient engine never learns what a triangle is.
   =================================================================== */
(function (global) {
  'use strict';
  var BL=[16,94], BR=[94,94], TL=[16,16], TR=[94,16];
  var DEFS = { BL:{R:BL,A:BR,B:TL}, BR:{R:BR,A:BL,B:TR}, TL:{R:TL,A:TR,B:BL}, TR:{R:TR,A:TL,B:BR} };

  function u(a,b){ var dx=b[0]-a[0], dy=b[1]-a[1], n=Math.hypot(dx,dy)||1; return [dx/n,dy/n]; }
  function raMark(R,A,B){                       // right-angle square, drawn into the triangle at R
    var ua=u(R,A), ub=u(R,B), d=12;
    var p1=[R[0]+ua[0]*d,R[1]+ua[1]*d], p3=[R[0]+ub[0]*d,R[1]+ub[1]*d], p2=[p1[0]+ub[0]*d,p1[1]+ub[1]*d];
    return 'M '+p1[0]+' '+p1[1]+' L '+p2[0]+' '+p2[1]+' L '+p3[0]+' '+p3[1];
  }
  function svg(d){
    var R=d.R,A=d.A,B=d.B;
    return '<svg viewBox="0 0 110 110" preserveAspectRatio="xMidYMid meet">'+
      '<polygon points="'+R[0]+','+R[1]+' '+A[0]+','+A[1]+' '+B[0]+','+B[1]+'" '+
        'style="fill:var(--bg);stroke:var(--text)" stroke-width="2.5" stroke-linejoin="round"/>'+
      '<path d="'+raMark(R,A,B)+'" style="fill:none;stroke:var(--text)" stroke-width="1.6"/>'+
      '</svg>';
  }
  // Placement follows the coordinate-quadrant convention: the angle vertex
  // (origin) meets at the grid center and each triangle fans into its quadrant,
  // so the right angle (foot on the axis) lands toward the center line.
  // cell = id with the vertical half flipped:  BL->TL, BR->TR, TL->BL, TR->BR.
  function quadCell(id){ return (id.charAt(0)==='B'?'T':'B') + id.charAt(1); }
  function figOrientations(){
    return ['BL','BR','TL','TR'].map(function(id){ return { id:id, cell:quadCell(id), svg:svg(DEFS[id]) }; });
  }
  global.figOrientations = figOrientations;
})(typeof window!=='undefined'?window:this);

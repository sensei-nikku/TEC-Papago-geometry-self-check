/* ===================================================================
   FIGURE HELPER — trig right triangle  ->  generic Label data
   figTriangle({type:'elev'|'depr', ratio:'sin'|'cos'|'tan', R, LOW, HIGH})
   returns { figure, zones, chips, prompt, badger } for tool:'label'.
   This is a DATA GENERATOR, not engine code. The generic Label engine
   never learns what a triangle is — it just gets zones + chips.
   Geometry math is the proven code from triangle-labeler v2.
   =================================================================== */
(function (global) {
  'use strict';

  var LABREL = { sin:{rel:['opp','hyp'],dis:'adj'},
                 cos:{rel:['adj','hyp'],dis:'opp'},
                 tan:{rel:['opp','adj'],dis:'hyp'} };
  var LABNM = { opp:'opposite', adj:'adjacent', hyp:'hypotenuse' };
  var VBW=340, VBH=250;

  function lU(a,b){var dx=b[0]-a[0],dy=b[1]-a[1],n=Math.hypot(dx,dy)||1;return[dx/n,dy/n];}
  function lMid(s){return[(s[0][0]+s[1][0])/2,(s[0][1]+s[1][1])/2];}
  function lCen(c){return[(c.R[0]+c.LOW[0]+c.HIGH[0])/3,(c.R[1]+c.LOW[1]+c.HIGH[1])/3];}
  function lOff(p,g,d){var dx=p[0]-g[0],dy=p[1]-g[1],n=Math.hypot(dx,dy)||1;return[p[0]+dx/n*d,p[1]+dy/n*d];}
  function lSeg(c,k){if(k==='opp')return[c.R,c.HIGH];if(k==='adj')return[c.R,c.LOW];return[c.LOW,c.HIGH];}
  function lThetaBox(c){return c.type==='elev'?'in_LOW':'out_HIGH';}
  function lBis(u1,u2){var x=u1[0]+u2[0],y=u1[1]+u2[1],n=Math.hypot(x,y)||1;return[x/n,y/n];}
  function lPlace(V,d,b){return[V[0]+b[0]*d,V[1]+b[1]*d];}
  function lBoxes(c){
    var g=lCen(c),b={};
    ['opp','adj','hyp'].forEach(function(k){b[k]=lOff(lMid(lSeg(c,k)),g,32);});
    // angle candidates sit in their real wedges, not pushed radially from the centroid
    var uLR=lU(c.LOW,c.R), uLH=lU(c.LOW,c.HIGH), uHR=lU(c.HIGH,c.R), uHL=lU(c.HIGH,c.LOW);
    var uHoriz=[(c.LOW[0]>=c.HIGH[0])?1:-1,0];           // horizontal, toward the target
    var biLow=lBis(uLR,uLH), biHin=lBis(uHR,uHL), biDep=lBis(uHoriz,uHL);
    b.in_LOW  = lPlace(c.LOW, 30, biLow);                // ELEVATION: interior wedge at the base
    b.out_LOW = lPlace(c.LOW, 44, [-biLow[0],-biLow[1]]);// exterior base (red herring)
    b.in_HIGH = lPlace(c.HIGH, 32, biHin);              // interior top (red herring)
    b.out_HIGH= lPlace(c.HIGH, 56, biDep);              // DEPRESSION: exterior wedge, off the horizontal at the top
    return b;
  }
  function lSVG(c){
    var s='<svg viewBox="0 0 '+VBW+' '+VBH+'" preserveAspectRatio="xMidYMid meet">';
    [c.LOW,c.HIGH].forEach(function(V){s+='<line x1="'+(V[0]-46)+'" y1="'+V[1]+'" x2="'+(V[0]+46)+'" y2="'+V[1]+'" stroke-width="1.5" stroke-dasharray="5 4" style="stroke:var(--muted)"/>';});
    s+='<polygon points="'+c.R[0]+','+c.R[1]+' '+c.LOW[0]+','+c.LOW[1]+' '+c.HIGH[0]+','+c.HIGH[1]+'" stroke-width="2.5" stroke-linejoin="round" style="fill:var(--bg);stroke:var(--text)"/>';
    var ul=lU(c.R,c.LOW),uh=lU(c.R,c.HIGH);
    var qp=[c.R[0]+ul[0]*14,c.R[1]+ul[1]*14],pp=[c.R[0]+uh[0]*14,c.R[1]+uh[1]*14],fp=[qp[0]+pp[0]-c.R[0],qp[1]+pp[1]-c.R[1]];
    s+='<path d="M '+qp[0]+' '+qp[1]+' L '+fp[0]+' '+fp[1]+' L '+pp[0]+' '+pp[1]+'" stroke-width="2" style="fill:none;stroke:var(--text)"/>';
    s+='</svg>';return s;
  }
  function pct(p){ return { x:+(p[0]/VBW*100).toFixed(2), y:+(p[1]/VBH*100).toFixed(2) }; }

  function figTriangle(c){
    var rel=LABREL[c.ratio].rel, dis=LABREL[c.ratio].dis, boxes=lBoxes(c), thetaBox=lThetaBox(c);
    var zones=[];
    var sideNudge='Not that side. Opposite is across from \u03B8; adjacent touches it; hypotenuse is across from the square corner.';
    // all three side positions are shown; only the two this ratio uses accept a label.
    // the unused side is a visible distractor \u2014 its spot accepts nothing, so its chip never finds a home.
    ['opp','adj','hyp'].forEach(function(k){ var p=pct(boxes[k]); var on=rel.indexOf(k)>=0;
      zones.push({ id:k, x:p.x, y:p.y, accepts:on?[k]:[], req:on, nudge:sideNudge }); });
    // four angle candidates — only the right one accepts \u03B8; others are red herrings (accept nothing, not required)
    ['in_LOW','out_LOW','in_HIGH','out_HIGH'].forEach(function(id){
      var p=pct(boxes[id]);
      zones.push({ id:id, x:p.x, y:p.y, ang:true,
        accepts: id===thetaBox?['theta']:[], req: id===thetaBox,
        nudge: c.type==='elev' ? 'An elevation angle sits inside the triangle, at the base.' : 'A depression angle sits outside, off the horizontal at the top.' });
    });
    var chips=[{id:'opp',text:'opposite',type:'opp'},{id:'adj',text:'adjacent',type:'adj'},
               {id:'hyp',text:'hypotenuse',type:'hyp'},{id:'theta',text:'\u03B8',type:'theta',ang:true}];
    var disMsg = { hyp:'You don\u2019t need the hypotenuse for this one \u2014 it works between the two legs. Leave it in the tray.',
                   adj:'You don\u2019t need the adjacent side here \u2014 it works between opposite and hypotenuse. Leave it in the tray.',
                   opp:'You don\u2019t need the opposite side here \u2014 it works between adjacent and hypotenuse. Leave it in the tray.' };
    return { figure:lSVG(c), zones:zones, chips:chips,
             prompt:'Drag each side and the angle \u03B8 onto the triangle where it belongs. One side isn\u2019t part of this relationship \u2014 leave it in the tray.',
             badger: disMsg[dis] };
  }

  global.figTriangle = figTriangle;
})(typeof window!=='undefined'?window:this);

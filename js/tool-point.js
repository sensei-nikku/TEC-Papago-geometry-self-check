/* ===================================================================
   PRIMITIVE — POINT  (an ordered pair, like (3, -2))
   step = { tool:'point', answer:[x,y], label?, traps?:[{p:[x,y], msg}],
            nudges?, vec?:true }
   The student types a pair: "(3, -2)", "3,-2", or "3 -2" all work, and a
   typed minus sign or an en-dash both count. vec:true shows the vector
   placeholder <a, b>. Traps are checked first. With no trap, the feedback
   says which coordinate is right, so the student fixes one at a time.
   Built for Week 2 (transformations): the numeric tool takes one number.
   =================================================================== */
(function () {
  'use strict';
  function parse(s){
    s = (s==null?'':''+s).replace(/[\u2212\u2013\u2014]/g,'-').replace(/[()\u27E8\u27E9<>\s]+/g,' ').trim();
    var m = s.match(/^(-?\d+)\s*[, ]\s*(-?\d+)$/);
    if(!m) return null;
    return [parseInt(m[1],10), parseInt(m[2],10)];
  }
  K.tool('point', {
    limit: 3,
    state: function(){ return {val:''}; },
    render: function(step, st, ref){
      var ph = step.vec ? 'like 3, -5' : 'like (3, -5)';
      return '<div class="calc-row">'+
        '<input type="text" inputmode="text" autocomplete="off" value="'+ref.esc(st.val)+'" placeholder="'+ph+'" '+
        'oninput="K.input(\''+ref.p+'\','+ref.s+',this.value)" '+
        'onkeydown="if(event.key===\'Enter\')K.act(\''+ref.p+'\','+ref.s+',\'check\')">'+
        '<button class="btn btn-go" onclick="K.act(\''+ref.p+'\','+ref.s+',\'check\')">Check</button></div>';
    },
    check: function(step, st){
      var p = parse(st.val);
      if(!p) return {fb:{t:'err',m:'Type two whole numbers with a comma between them, like (3, -5).'}, tier:'soft'};
      var a = step.answer;
      if(p[0]===a[0] && p[1]===a[1]) return {pass:true};
      if(step.traps){ for(var i=0;i<step.traps.length;i++){ var t=step.traps[i].p;
        if(p[0]===t[0] && p[1]===t[1]) return {fb:{t:'err',m:step.traps[i].msg,diag:true}}; } }
      if(p[0]===a[1] && p[1]===a[0] && a[0]!==a[1]) return {fb:{t:'err',m:'Right numbers, wrong order. The first coordinate is x (across), the second is y (up or down).',diag:true}};
      if(p[0]===a[0]) return {fb:{t:'warn',m:'Your first coordinate is right. Check the second one.',diag:true}};
      if(p[1]===a[1]) return {fb:{t:'warn',m:'Your second coordinate is right. Check the first one.',diag:true}};
      return {fb:{t:'err',m:'Not quite. Write the rule, then build one coordinate at a time.'}};
    },
    summary: function(step){ return step.vec ? '\u27E8'+step.answer[0]+', '+step.answer[1]+'\u27E9' : '('+step.answer[0]+', '+step.answer[1]+')'; },
    entry: function(step, st){ return (st.val===''||st.val==null) ? null : st.val; }
  });
})();

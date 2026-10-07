/* ===================================================================
   PRIMITIVE — FRACTION  (exact fraction entry, must be simplified)
   step = { tool:'fraction', answer:[n,d], label?, traps?:[{f:[n,d], msg}],
            nudges? }
   The student types a fraction like 6/11 (a whole number like 1 is fine).
   Value is compared exactly, as a cross product, so 18/33 and 6/11 are
   the same VALUE.  Right value, not simplified -> a soft prompt to simplify
   (does not count as a miss).  Traps compare by value, so a flipped-given
   fraction is named whether or not the student simplified it.
   Built because the numeric tool reads "6/11" as 6.
   =================================================================== */
(function () {
  'use strict';
  function gcd(a, b){ a=Math.abs(a); b=Math.abs(b); while(b){ var t=b; b=a%b; a=t; } return a; }
  function parse(s){
    s = (s==null?'':''+s).replace(/\s+/g,'');
    var m = s.match(/^(-?\d+)\/(\d+)$/);
    if(m){ var d=parseInt(m[2],10); if(d===0) return null; return [parseInt(m[1],10), d]; }
    if(/^-?\d+$/.test(s)) return [parseInt(s,10), 1];
    if(/^-?\d*\.\d+$/.test(s)) return 'decimal';
    return null;
  }
  function same(a, b){ return a[0]*b[1] === b[0]*a[1]; }

  K.tool('fraction', {
    limit: 3,
    state: function(){ return {val:''}; },
    render: function(step, st, ref){
      return '<div class="calc-row">'+
        '<input type="text" inputmode="numeric" value="'+ref.esc(st.val)+'" placeholder="like 3/10" '+
        'oninput="K.input(\''+ref.p+'\','+ref.s+',this.value)" '+
        'onkeydown="if(event.key===\'Enter\')K.act(\''+ref.p+'\','+ref.s+',\'check\')">'+
        '<button class="btn btn-go" onclick="K.act(\''+ref.p+'\','+ref.s+',\'check\')">Check</button></div>';
    },
    check: function(step, st){
      var f = parse(st.val);
      if(f==='decimal') return {fb:{t:'err',m:'Write it as a fraction, top over bottom, like 3/10.'}, tier:'soft'};
      if(!f) return {fb:{t:'err',m:'Type a fraction, like 3/10.'}, tier:'soft'};
      if(same(f, step.answer)){
        if(gcd(f[0], f[1])===1) return {pass:true};
        return {fb:{t:'warn',m:'Right value. Now simplify it: cancel the factor the top and bottom share.'}, tier:'soft'};
      }
      if(step.traps){ for(var i=0;i<step.traps.length;i++){ if(same(f, step.traps[i].f)) return {fb:{t:'err',m:step.traps[i].msg,diag:true}}; } }
      return {fb:{t:'err',m:'Not quite. Check your top and your bottom.'}};
    },
    summary: function(step){ return step.answer[0]+'/'+step.answer[1]; },
    entry: function(step, st){ return (st.val===''||st.val==null) ? null : st.val; }
  });
})();

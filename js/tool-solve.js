/* ===================================================================
   PRIMITIVE 4 — SOLVE  (typed, multiplicative-inverse style)
   step = { tool:'solve', start:'sin(7.7\u00B0) = x / 21120',
            moves:[ { ask, opCh, valCh?, then } ] }
   Each move: tap the operation (\u00D7 / + / f\u207B\u00B9), then \u2014 for
   \u00D7 and + \u2014 TYPE the value to operate by (a number, a variable, or
   1/sin\u2026). f\u207B\u00B9 takes no value (the function IS the operation).
   The iff-chain grows by `then`, left uncomputed (house style).
   opCh / valCh are djb2 hashes so answers aren't in source; typed text
   is normalized (lowercased, spaces/\u00B0/parens stripped) before hashing.
   No "divide"/"subtract" language \u2014 inverses only. The engine never
   learns any specific math: which inverse appears is just data in `then`.
   =================================================================== */
(function () {
  'use strict';
  var MULT = 177788, ADD = 177616, FINV = 193762655;   // djb2('\u00D7'), djb2('+'), djb2('f\u207B\u00B9')
  var OPS = ['\u00D7', '+', 'f\u207B\u00B9'];
  function norm(s){ return (s==null?'':s).toString().toLowerCase().replace(/\s+/g,'').replace(/\u00B0/g,'').replace(/[()]/g,''); }
  function opNudge(opCh){
    if (opCh===FINV) return 'It\u2019s locked inside a function \u2014 arithmetic won\u2019t free it. Apply the inverse function.';
    if (opCh===MULT) return 'The variable is multiplied here \u2014 undo it by multiplying, not adding.';
    if (opCh===ADD)  return 'This is an addition \u2014 multiplying won\u2019t undo it.';
    return 'Which operation undoes what\u2019s attached to the variable?';
  }
  function chainHtml(lines, esc){
    var h = '<div class="solve-chain" style="font-family:\'JetBrains Mono\',ui-monospace,monospace;font-size:.95rem;line-height:2;'+
      'background:var(--accent-lt);border-left:3px solid var(--accent);border-radius:6px;padding:10px 14px;margin:4px 0 14px">';
    lines.forEach(function(line,i){ h += '<div>'+(i>0?'<span style="color:var(--accent);font-weight:700">\u27FA</span> ':'')+esc(line)+'</div>'; });
    return h+'</div>';
  }

  K.tool('solve', {
    state: function (step) { return { i:0, phase:'op', op:null, val:'', chain:[step.start], fb:null }; },

    render: function (step, st, ref) {
      var h = chainHtml(st.chain, ref.esc);
      if (st.i >= step.moves.length) return h;                 // chain complete
      var mv = step.moves[st.i];
      if (st.phase === 'op') {
        h += '<div class="step-text">' + ref.esc(mv.ask || 'What operation frees the variable?') + '</div>';
        h += '<div class="ratio-row" style="gap:8px">';
        OPS.forEach(function (o) {
          h += '<button class="ratio-btn" style="min-width:auto;background:var(--surface);color:var(--text);border-color:var(--border)" '+
               'onclick="K.act(\'' + ref.p + '\',' + ref.s + ',\'check\',\'' + o + '\')">' + ref.esc(o) + '</button>';
        });
        h += '</div>';
      } else { // value entry
        h += '<div class="step-text">' + ref.esc(st.op + ' both sides by what? Type it.') + '</div>';
        h += '<div style="display:flex;gap:8px;align-items:center">'+
             '<span style="font-family:monospace;font-weight:700;color:var(--accent);font-size:1.05rem">'+ref.esc(st.op)+'</span>'+
             '<input class="num-input" type="text" autocomplete="off" spellcheck="false" value="'+ref.esc(st.val||'')+'" '+
             'oninput="K.input(\''+ref.p+'\','+ref.s+',this.value)" '+
             'onkeydown="if(event.key===\'Enter\')K.act(\''+ref.p+'\','+ref.s+',\'check\')">'+
             '<button class="btn btn-go" onclick="K.act(\''+ref.p+'\','+ref.s+',\'check\')">Check</button></div>';
      }
      return h;
    },

    act: function () { /* value text is captured by the runner's input() into st.val */ },

    check: function (step, st, ctx, payload) {
      var mv = step.moves[st.i];
      if (st.phase === 'op') {
        if (payload == null) return { fb:{t:'err', m:'Tap the operation.'}, tier:'soft' };
        if (ctx.djb2(payload) === mv.opCh) {
          st.op = payload;
          if (mv.valCh != null) { st.phase='val'; st.val=''; return { fb:null, tier:'soft' }; }   // need a value next
          st.chain.push(mv.then); st.i++; st.phase='op'; st.val='';                                // f\u207B\u00B9: no value
          return st.i >= step.moves.length ? { pass:true } : { fb:null, tier:'soft' };
        }
        return { fb:{t:'err', m: opNudge(mv.opCh)} };                                              // wrong op -> strike
      }
      var typed = (st.val||'').toString();
      if (typed.trim()==='') return { fb:{t:'err', m: st.op+' both sides by what? Type the value.'}, tier:'soft' };
      if (ctx.djb2(norm(typed)) === mv.valCh) {
        st.chain.push(mv.then); st.i++; st.phase='op'; st.val='';
        return st.i >= step.moves.length ? { pass:true } : { fb:null, tier:'soft' };
      }
      st.val='';                                                                                  // clear entry on a miss
      return { fb:{t:'err', m:'Not that value \u2014 which multiplicative inverse frees it?'} };   // strike
    },

    work: function (step, st, ctx) {
      var lines = (st.chain && st.chain.length) ? st.chain : [step.start];
      return chainHtml(lines, ctx.esc);
    },
    summary: function (step, st) { return st.chain[st.chain.length-1]; }
  });
})();

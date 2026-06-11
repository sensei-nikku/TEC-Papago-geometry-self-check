/* ===================================================================
   PRIMITIVE 4 — SOLVE  (step-locked algebra, multiplicative-inverse style)
   step = { tool:'solve', start:'90 = ½·15·h',
            steps:[ { instruction, options:[...], ch, then:'2·90 = 15·h' }, ... ] }
   Student picks the multiplicative inverse to multiply both sides by.
   The iff-chain grows line by line, operations left UNCOMPUTED until the
   calculator step (the house style). `ch` = djb2 hash of the correct option,
   so the answer isn't in source. Internal sub-steps live inside one pipeline
   step; only the final correct pick advances the pipeline.
   No "divide"/"subtract" language — inverses only.
   =================================================================== */
(function () {
  'use strict';

  K.tool('solve', {
    state: function (step) { return { sIdx:0, chain:[step.start], pick:null }; },

    render: function (step, st, ref) {
      var h = '';
      // the iff-chain so far
      h += '<div class="solve-chain" style="font-family:\'JetBrains Mono\',ui-monospace,monospace;font-size:.95rem;line-height:2;'+
           'background:var(--accent-lt);border-left:3px solid var(--accent);border-radius:6px;padding:10px 14px;margin:4px 0 14px">';
      st.chain.forEach(function (line, i) {
        h += '<div>' + (i>0 ? '<span style="color:var(--accent);font-weight:700">\u27FA</span> ' : '') + ref.esc(line) + '</div>';
      });
      h += '</div>';
      // current sub-step: pick the inverse
      if (st.sIdx < step.steps.length) {
        var sub = step.steps[st.sIdx];
        h += '<div class="step-text">' + ref.esc(sub.instruction) + '</div>';
        h += '<div class="ratio-row" style="gap:8px">';
        sub.options.forEach(function (o, i) {
          var on = st.pick === i;
          h += '<button class="ratio-btn' + (on?' inv':'') + '" style="min-width:auto' +
               (on?'':';background:var(--surface);color:var(--text);border-color:var(--border)') + '" ' +
               'onclick="K.act(\'' + ref.p + '\',' + ref.s + ',\'pick\',' + i + ')">' + ref.esc(o) + '</button>';
        });
        h += '</div>';
        if (st.pick != null)
          h += '<div style="margin-top:10px"><button class="btn btn-go" onclick="K.act(\'' + ref.p + '\',' + ref.s + ',\'check\')">Apply</button></div>';
      }
      return h;
    },

    act: function (step, st, action, payload) { if (action === 'pick') { st.pick = payload; st.fb = null; } },

    check: function (step, st, ctx) {
      if (st.pick == null) return { fb:{t:'err',m:'Pick the inverse to multiply both sides by.'}, tier:'soft' };
      var sub = step.steps[st.sIdx];
      if (ctx.djb2(sub.options[st.pick]) !== sub.ch)
        return { fb:{t:'err',m:'Not that one \u2014 which multiplicative inverse undoes that coefficient?'} };
      // correct: grow the chain, advance the internal sub-step
      st.chain.push(sub.then); st.sIdx++; st.pick = null;
      if (st.sIdx >= step.steps.length) return { pass:true };      // last line done -> advance pipeline
      return { fb:null, tier:'soft' };                            // intermediate line -> re-render, no strike
    },

    work: function (step, st, ctx) {
      var lines = (st.chain && st.chain.length) ? st.chain : [step.start];
      var h = '<div style="font-family:\'JetBrains Mono\',ui-monospace,monospace;font-size:.92rem;line-height:1.9;' +
              'background:var(--accent-lt);border-left:3px solid var(--accent);border-radius:6px;padding:10px 14px">';
      lines.forEach(function (line, i) { h += '<div>' + (i>0 ? '<span style="color:var(--accent);font-weight:700">\u27FA</span> ' : '') + ctx.esc(line) + '</div>'; });
      return h + '</div>';
    },

    summary: function (step, st) { return st.chain[st.chain.length - 1]; }
  });

})();

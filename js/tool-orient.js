/* ===================================================================
   PRIMITIVE 8 — ORIENT  (pick the matching figure from N candidates)
   step = { tool:'orient', prompt?, candidates:[ {id, svg} ], ch }
   ch = djb2 hash of the correct candidate's id. Candidates render as a
   grid of tappable cards (shuffled); pick-then-check, step-locked.
   Generic "pick the matching figure" — fed quadrant triangles here, but
   the engine never learns what a triangle is.
   =================================================================== */
(function () {
  'use strict';

  K.tool('orient', {
    state: function (step) {
      var idx = step.candidates.map(function (_, i) { return i; });
      // If every candidate declares a home cell, lay them out by quadrant (no shuffle):
      // row-major order TL, TR, BL, BR over a 2-col grid puts each in its corner.
      if (step.candidates.every(function (c) { return c.cell; })) {
        var seq = ['TL', 'TR', 'BL', 'BR'];
        idx.sort(function (a, b) { return seq.indexOf(step.candidates[a].cell) - seq.indexOf(step.candidates[b].cell); });
        return { sel:null, order:idx };
      }
      for (var i = idx.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = idx[i]; idx[i] = idx[j]; idx[j] = t; }
      return { sel:null, order:idx };
    },
    render: function (step, st, ref) {
      var h = '<div class="step-text">' + ref.esc(step.prompt || 'Pick the triangle that matches the situation.') + '</div>';
      h += '<div class="orient-grid">';
      st.order.forEach(function (idx) {
        var c = step.candidates[idx], on = st.sel === idx;
        h += '<div class="orient-card' + (on ? ' sel' : '') + '" onclick="K.act(\'' + ref.p + '\',' + ref.s + ',\'pick\',' + idx + ')">' + c.svg + '</div>';
      });
      h += '</div>';
      if (st.sel != null) h += '<div style="margin-top:12px"><button class="btn btn-go" onclick="K.act(\'' + ref.p + '\',' + ref.s + ',\'check\')">Check</button></div>';
      return h;
    },
    act: function (step, st, action, payload) { if (action === 'pick') { st.sel = payload; st.fb = null; } },
    check: function (step, st, ctx) {
      if (st.sel == null) return { fb:{t:'err',m:'Tap the orientation that matches the situation.'}, tier:'soft' };
      if (ctx.djb2(step.candidates[st.sel].id) === step.ch) return { pass:true };
      return { fb:{t:'err',m:'Not that one \u2014 where does the right angle sit (where the height meets the ground)?'} };
    },
    work: function (step, st, ctx) { return '<div style="max-width:120px">' + (step.candidates[st.sel] ? step.candidates[st.sel].svg : '') + '</div>'; },
    summary: function () { return 'Orientation set'; }
  });

})();

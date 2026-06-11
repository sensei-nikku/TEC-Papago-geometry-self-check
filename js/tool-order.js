/* ===================================================================
   PRIMITIVE 6 — ORDER  (tap items into the correct sequence)
   step = { tool:'order', prompt?, items:[ {id, text} ],
            seq:[ ch0, ch1, ... ] }     // djb2 hashes of the correct item texts, IN ORDER
   Items render shuffled. Each tap is validated against the correct NEXT
   item (step-locked); a correct tap gets the next position number, a wrong
   tap nudges and counts toward the 3-miss teacher redirect. The correct
   order is only present as hashes, so it isn't readable in source.
   Tap-based (no drag) -> render-string tool, fully testable headless.
   =================================================================== */
(function () {
  'use strict';

  K.tool('order', {
    state: function (step) {
      var idx = step.items.map(function (_, i) { return i; });
      for (var i = idx.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = idx[i]; idx[i] = idx[j]; idx[j] = t; }
      return { order:[], display:idx };   // order = item indices placed so far; display = shuffled render order
    },

    render: function (step, st, ref) {
      var h = '<div class="step-text">' + ref.esc(step.prompt || 'Tap the steps in the correct order.') + '</div>';
      h += '<div style="display:flex;flex-direction:column;gap:8px">';
      st.display.forEach(function (itemIdx) {
        var pos = st.order.indexOf(itemIdx), placed = pos >= 0;
        var rowClick = placed ? '' : ' onclick="K.act(\'' + ref.p + '\',' + ref.s + ',\'check\',' + itemIdx + ')"';
        var rowCur = placed ? '' : 'cursor:pointer;';
        h += '<div class="order-row"' + rowClick + ' style="' + rowCur + 'display:flex;align-items:center;gap:10px;border:2px solid ' +
             (placed ? 'var(--ok)' : 'var(--border)') + ';border-radius:8px;padding:10px 12px;background:var(--surface)' +
             (placed ? ';opacity:.6' : '') + '">' +
          '<div style="width:26px;height:26px;border-radius:50%;flex:none;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:.85rem;' +
            (placed ? 'background:var(--ok);color:#fff' : 'background:var(--bg);color:var(--muted);border:1.5px solid var(--border)') + '">' +
            (placed ? (pos + 1) : '') + '</div>' +
          '<div style="flex:1;font-size:.92rem;color:var(--text)">' + ref.esc(step.items[itemIdx].text) + '</div>' +
        '</div>';
      });
      h += '</div>';
      return h;
    },

    check: function (step, st, ctx, payload) {
      if (st.order.indexOf(payload) >= 0) return { tier:'soft' };       // already placed — ignore
      if (ctx.djb2(step.items[payload].text) === step.seq[st.order.length]) {
        st.order.push(payload);
        if (st.order.length >= step.items.length) return { pass:true };
        return { fb:null, tier:'soft' };                               // correct next — re-render, no strike
      }
      return { fb:{ t:'err', m:'Not the next step \u2014 what has to happen before this?' } };
    },

    summary: function () { return 'Steps ordered'; }
  });

})();

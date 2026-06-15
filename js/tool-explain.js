/* ===================================================================
   PRIMITIVE — EXPLAIN  (free-text reasoning, self-checked)
   step = { tool:'explain', ask, key, label? }
   The student writes their reasoning, taps "Show model answer" to
   reveal `key`, compares their own work to it, then "Done". There is
   no auto-grading — the point is to GENERATE the reasoning first, then
   check it against a model. Use for conceptual "why / explain / compare"
   prompts that a forced-choice question would only turn into guessing.
   =================================================================== */
(function () {
  'use strict';
  K.tool('explain', {
    state: function (step) { return { val:'', revealed:false }; },

    render: function (step, st, ref) {
      var h = '';
      if (step.ask) h += '<div class="step-text">' + ref.esc(step.ask) + '</div>';
      h += '<textarea class="explain-box" placeholder="Write your reasoning\u2026" ' +
           'oninput="K.input(\'' + ref.p + '\',' + ref.s + ',this.value)">' + ref.esc(st.val || '') + '</textarea>';
      if (!st.revealed) {
        h += '<div style="margin-top:10px"><button class="btn btn-go" ' +
             'onclick="K.act(\'' + ref.p + '\',' + ref.s + ',\'reveal\')">Show model answer</button></div>';
      } else {
        h += '<div class="fb ok" style="margin-top:10px"><strong>Model answer</strong><br>' + ref.esc(step.key) + '</div>';
        h += '<div style="margin-top:10px"><button class="btn btn-go" ' +
             'onclick="K.act(\'' + ref.p + '\',' + ref.s + ',\'check\')">Compared it \u2014 next</button></div>';
      }
      return h;
    },

    act: function (step, st, action) { if (action === 'reveal') st.revealed = true; },

    check: function (step, st) {
      if (!st.revealed) return { fb:{t:'err', m:'Write your reasoning first, then reveal the model answer to compare.'}, tier:'soft' };
      return { pass:true };
    },

    work: function (step, st, ctx) {
      var h = '';
      if (st.val && st.val.trim()) h += '<div style="font-size:.85rem;line-height:1.5;margin-bottom:8px">' + ctx.esc(st.val) + '</div>';
      h += '<div class="work-answer" style="display:block;border-color:var(--accent);color:var(--text)"><strong style="color:var(--accent)">Model:</strong> ' + ctx.esc(step.key) + '</div>';
      return h;
    },
    summary: function (step, st) { return 'Reasoning compared to the model answer'; }
  });
})();

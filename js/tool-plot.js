/* ===================================================================
   PRIMITIVE 7 — PLOT  (place points on a coordinate grid)
   step = { tool:'plot', prompt?, range?,                       // grid spans -range..range (default 6)
            preimage?:[ {x,y,label} ],                          // drawn for reference (dashed)
            targets:[ {label, ch} ] }                           // ch = djb2 hash of "gx,gy" of the image point
   Tap the grid -> snaps to the nearest lattice point (a provisional marker
   + coordinate readout). "Place" commits and validates against the current
   target's hash, step-locked. Correct -> lock + next; wrong -> nudge + a
   strike toward the teacher redirect. Coordinates are hashed, so the answer
   isn't in source. Hybrid tool: mount (grid + tap) + check (commit).
   =================================================================== */
(function () {
  'use strict';

  function mountPlot(host, step, st, ctx) {
    if (host.dataset.mounted === '1') return; host.dataset.mounted = '1';
    var R = step.range || 6, SZ = 300, C = 150, cell = (SZ - 44) / (2 * R);
    function sx(gx) { return +(C + gx * cell).toFixed(1); }
    function sy(gy) { return +(C - gy * cell).toFixed(1); }
    st.placed = st.placed || []; if (st.prov === undefined) st.prov = null;
    var k = st.placed.length, done = k >= step.targets.length;

    var s = '<svg class="plot-svg" viewBox="0 0 ' + SZ + ' ' + SZ + '" style="width:100%;max-width:320px;display:block;margin:0 auto;touch-action:none;cursor:crosshair">';
    for (var i = -R; i <= R; i++) {
      if (i === 0) continue;
      s += '<line x1="' + sx(i) + '" y1="' + sy(-R) + '" x2="' + sx(i) + '" y2="' + sy(R) + '" stroke="var(--border)" stroke-width="0.6"/>';
      s += '<line x1="' + sx(-R) + '" y1="' + sy(i) + '" x2="' + sx(R) + '" y2="' + sy(i) + '" stroke="var(--border)" stroke-width="0.6"/>';
    }
    s += '<line x1="' + sx(-R) + '" y1="' + sy(0) + '" x2="' + sx(R) + '" y2="' + sy(0) + '" stroke="var(--muted)" stroke-width="1.4"/>';
    s += '<line x1="' + sx(0) + '" y1="' + sy(-R) + '" x2="' + sx(0) + '" y2="' + sy(R) + '" stroke="var(--muted)" stroke-width="1.4"/>';
    for (var i = -R; i <= R; i += 2) {
      if (i === 0) continue;
      s += '<text x="' + sx(i) + '" y="' + (sy(0) + 11) + '" font-size="7" fill="var(--muted)" text-anchor="middle" font-family="DM Sans,sans-serif">' + i + '</text>';
      s += '<text x="' + (sx(0) - 7) + '" y="' + (sy(i) + 3) + '" font-size="7" fill="var(--muted)" text-anchor="end" font-family="DM Sans,sans-serif">' + i + '</text>';
    }
    // pre-image (reference, dashed)
    if (step.preimage && step.preimage.length) {
      if (step.preimage.length >= 2) {
        var pts = step.preimage.map(function (p) { return sx(p.x) + ',' + sy(p.y); }).join(' ');
        s += '<polygon points="' + pts + '" fill="none" stroke="var(--muted)" stroke-width="1.2" stroke-dasharray="4 3"/>';
      }
      step.preimage.forEach(function (p) {
        s += '<circle cx="' + sx(p.x) + '" cy="' + sy(p.y) + '" r="3" fill="var(--muted)"/>';
        if (p.label) s += '<text x="' + (sx(p.x) + 6) + '" y="' + (sy(p.y) - 5) + '" font-size="9" font-weight="700" fill="var(--muted)" font-family="DM Sans,sans-serif">' + ctx.esc(p.label) + '</text>';
      });
    }
    // placed image points
    if (st.placed.length >= 2) {
      var pp = st.placed.map(function (p) { return sx(p.gx) + ',' + sy(p.gy); }).join(' ');
      s += '<polyline points="' + pp + '" fill="none" stroke="var(--accent)" stroke-width="1.6"/>';
    }
    st.placed.forEach(function (p, idx) {
      s += '<circle cx="' + sx(p.gx) + '" cy="' + sy(p.gy) + '" r="4.5" fill="var(--accent)"/>';
      var lab = step.targets[idx].label;
      if (lab) s += '<text x="' + (sx(p.gx) + 6) + '" y="' + (sy(p.gy) - 5) + '" font-size="9" font-weight="700" fill="var(--accent)" font-family="DM Sans,sans-serif">' + ctx.esc(lab) + '</text>';
    });
    if (st.prov && !done)
      s += '<circle cx="' + sx(st.prov.gx) + '" cy="' + sy(st.prov.gy) + '" r="5" fill="none" stroke="var(--warn)" stroke-width="2"/>';
    s += '</svg>';

    var ui = '';
    if (!done) {
      var t = step.targets[k];
      ui += '<div class="plot-readout" style="text-align:center;margin-top:10px;font-size:.9rem;color:var(--muted)">' +
        (st.prov ? 'Selected <b style="color:var(--text)">(' + st.prov.gx + ', ' + st.prov.gy + ')</b> for ' + ctx.esc(t.label)
                 : 'Tap the grid to place ' + ctx.esc(t.label)) + '</div>';
      if (st.prov) ui += '<div style="text-align:center;margin-top:8px"><button class="btn btn-go" onclick="K.act(\'' + ctx.p + '\',' + ctx.s + ',\'check\')">Place ' + ctx.esc(t.label) + '</button></div>';
    }
    host.innerHTML = '<div class="lab-prompt">' + ctx.esc(step.prompt || 'Plot the points.') + '</div>' + s + ui;

    if (!done) {
      var svgEl = host.querySelector('.plot-svg');
      svgEl.addEventListener('pointerdown', function (e) {
        e.preventDefault();
        var r = svgEl.getBoundingClientRect();
        var vx = (e.clientX - r.left) / r.width * SZ, vy = (e.clientY - r.top) / r.height * SZ;
        var gx = Math.max(-R, Math.min(R, Math.round((vx - C) / cell)));
        var gy = Math.max(-R, Math.min(R, Math.round((C - vy) / cell)));
        st.prov = { gx: gx, gy: gy }; st.fb = null; ctx.rerender();
      });
    }
  }

  K.tool('plot', {
    state: function () { return { placed: [], prov: null }; },
    render: function (step, st, ref) { return '<div class="lab-wrap" id="plot-' + ref.p + '-' + ref.s + '"></div>'; },
    mount: function (step, st, ctx) { var host = document.getElementById('plot-' + ctx.p + '-' + ctx.s); if (!host) return; mountPlot(host, step, st, ctx); },
    check: function (step, st, ctx) {
      if (!st.prov) return { fb:{t:'err',m:'Tap the grid to choose a point first.'}, tier:'soft' };
      var t = step.targets[st.placed.length];
      if (ctx.djb2(st.prov.gx + ',' + st.prov.gy) === t.ch) {
        st.placed.push(st.prov); st.prov = null;
        if (st.placed.length >= step.targets.length) return { pass:true };
        return { fb:null, tier:'soft' };
      }
      return { fb:{t:'err',m:'Not quite \u2014 apply the rule to that vertex and check the coordinates.'} };
    },
    summary: function () { return 'Points plotted'; }
  });

})();

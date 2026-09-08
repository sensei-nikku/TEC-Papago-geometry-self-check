/* ===================================================================
   CHECKER KIT — generic runner + tool registry
   A checker is data: PROBLEMS = [ {id, num, prompt, pipeline:[step...]} ]
   Each step = { tool:'numeric', ...config }.  Tools register themselves.
   The runner walks the pipeline; each passed step unlocks the next.
   No localStorage. Pointer-event tools come later (Label/Match/Plot).
   =================================================================== */
(function (global) {
  'use strict';

  var ENGINE_VERSION = '1.3.0';   // 1.1.0 locked-in rows (tool.entry); 1.2.0 choice stack layout;
                                  // 1.3.0 split shell (rail + work surface), per-step miss limits,
                                  //       two-level nudges (broad -> specific)
  var LAYOUT = 'stack';    // 'stack' (one scrolling column) | 'split' (left rail + right surface)
  var TOOLS = {};          // tool registry:  name -> tool definition
  var PROBLEMS = [];       // the loaded checker (set by run())
  var S = {};              // run-time state, keyed by problem id
  var activeP = 0;         // index of the open problem

  // ---- shared helpers (the bits every tool reuses) ----
  function esc(s){return (s==null?'':''+s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
  function djb2(s){var v=5381;for(var i=0;i<s.length;i++){v=((v<<5)+v)+s.charCodeAt(i);v=v&v;}return v>>>0;}
  function pById(id){for(var i=0;i<PROBLEMS.length;i++)if(PROBLEMS[i].id===id)return PROBLEMS[i];return null;}
  function pIndex(id){for(var i=0;i<PROBLEMS.length;i++)if(PROBLEMS[i].id===id)return i;return -1;}

  // ---- registration: a tool is { state, render, check, summary } ----
  function tool(name, def){ TOOLS[name] = def; }

  // ---- lifecycle ----
  function run(problems, opts){
    LAYOUT = (opts && opts.layout) ? opts.layout : 'stack';
    PROBLEMS = problems;
    S = {};
    for (var i=0;i<PROBLEMS.length;i++){
      var p=PROBLEMS[i], steps=[];
      for (var j=0;j<p.pipeline.length;j++){
        var t=TOOLS[p.pipeline[j].tool];
        if(!t){throw new Error('Unknown tool: '+p.pipeline[j].tool);}
        steps.push(t.state ? t.state(p.pipeline[j]) : {});
        steps[j].misses=0; steps[j].fb=null; steps[j].redirect=false;
      }
      S[p.id]={stepIdx:0, done:false, steps:steps};
    }
    activeP=0;
    for(var k=0;k<PROBLEMS.length;k++){if(!S[PROBLEMS[k].id].done){activeP=k;break;}}
    render();
  }

  // ---- runner actions (single global entry point for inline handlers) ----
  function input(pid, si, val){ var st=S[pid].steps[si]; st.val=val; st.fb=null; }      // generic text/number capture
  function set(pid, si, key, val){ var st=S[pid].steps[si]; st[key]=val; st.fb=null; render(); }

  function act(pid, si, action, payload){
    var p=pById(pid), step=p.pipeline[si], st=S[pid].steps[si], t=TOOLS[step.tool];
    if(action==='skip'){ st.redirect=false; st.fb=null; advance(pid); render(); return; }   // teacher-helped continue
    if(action==='check'){
      var r=t.check(step, st, {djb2:djb2}, payload);   // payload: tap index for order-style tools; ignored by others
      if(r.pass){ st.fb=null; st.redirect=false; advance(pid); }
      else if(r.tier==='soft'){ st.fb=r.fb;                            // prompt, not a wrong answer — no strike
        if(r.progress) st.misses=0;                                    // a step with several decisions (solve) gives
      }                                                                // each decision its own allowance
      else { st.misses++;
        // Miss limit is per step: step.limit overrides the tool's default, which
        // overrides 3.  (pedagogy_context: orientation 2, ratio 3, algebra move 2, answer 3.)
        var lim = (step.limit!=null) ? step.limit : (t.limit!=null ? t.limit : 3);
        if(st.misses>=lim){ st.redirect=true; st.fb=null; }
        else st.fb = nudgeFor(step, st, r);
      }
      render(); return;
    }
    if(t.act){ t.act(step, st, action, payload, {render:render, djb2:djb2}); render(); }     // tool-specific actions
  }

  // Two-level nudge: first miss gets the broad conceptual prompt (step.nudges[0]);
  // later misses prefer the tool's own diagnostic (a trap message, a wrong-operation
  // message) because that one names the specific error.  Neither states the answer.
  function nudgeFor(step, st, r){
    var nd = step.nudges && step.nudges.length ? step.nudges : null;
    // A matched diagnosis (a trap, a wrong-operation message) outranks the broad
    // nudge even on the first miss: we already know exactly what they did.
    if(r.fb && r.fb.diag) return r.fb;
    if(st.misses===1 && nd) return {t:'warn', m:nd[0]};
    if(r.fb) return r.fb;
    if(nd) return {t:'err', m:nd[Math.min(st.misses-1, nd.length-1)]};
    return {t:'err', m:'Not quite — try again.'};
  }

  function advance(pid){
    var p=pById(pid), s=S[pid];
    s.stepIdx++;
    if(s.stepIdx>=p.pipeline.length){ s.done=true;
      var i=pIndex(pid); if(i<PROBLEMS.length-1) activeP=i+1;
    }
    scrollToWork();
  }
  function scrollToWork(){
    if(LAYOUT==='split'){ return; }        // split: the rail scrolls itself in renderSplit()
    window.scrollTo({top:0,behavior:'smooth'});
  }

  function navTo(i){ if(i>=0&&i<PROBLEMS.length){activeP=i; render(); scrollToWork();} }

  // ---- rendering ----
  function fbHtml(fb){
    if(!fb) return '';
    var cls = fb.t==='ok'?'ok':(fb.t==='warn'?'warn':'err');
    var icon = fb.t==='warn'?'\u26A0 ':(fb.t==='ok'?'\u2713 ':'\u2717 ');
    return '<div class="fb '+cls+' show" style="margin-top:10px">'+icon+esc(fb.m)+'</div>';
  }
  function redirectHtml(pid, si){
    return '<div class="hint-text" style="border-left-color:var(--warn);background:var(--warn-lt);color:var(--warn);font-style:normal;font-weight:600">'+
      '\u270B Bring your work to your teacher and show them this step. It\u2019s okay to ask for help.</div>'+
      '<div style="margin-top:8px"><button class="btn btn-reset" onclick="K.act(\''+pid+'\','+si+',\'skip\')">Teacher helped \u2014 continue</button></div>';
  }

  function renderStep(p, si){
    var step=p.pipeline[si], st=S[p.id].steps[si], t=TOOLS[step.tool], cur=S[p.id].stepIdx;
    if(si<cur){ // completed -> LOCKED-IN row showing what the student entered.
      // `entry` is what they actually put in; `summary` is the model value.
      // Falls back to summary for tools that have not defined entry yet.
      var sum = (t.entry ? t.entry(step, st) : (t.summary ? t.summary(step, st) : 'done'));
      if(sum==null || sum==='') sum = 'done';
      return '<div class="step show"><div class="step-label">'+esc(step.label||('Step '+(si+1)))+'</div>'+
             '<div class="locked-in" style="min-height:40px;display:flex;align-items:center;gap:8px;'+
             'padding:9px 14px;border:2px solid var(--ok);border-radius:8px;background:var(--ok-lt);'+
             'font-size:.9rem;font-weight:600;color:var(--ok)">'+
             '<span aria-hidden="true">\u2713</span><span class="sr-only" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)">Answered: </span>'+
             '<span style="color:var(--text)">'+esc(sum)+'</span></div></div>';
    }
    if(si>cur) return ''; // locked → hidden
    // active step
    var h='<div class="step show live"><div class="step-label">'+esc(step.label||('Step '+(si+1)))+'</div>';
    if(st.redirect){ h+=redirectHtml(p.id, si); }
    else if(LAYOUT==='split' && t.pane==='surface'){
      // The manipulable lives in the work surface; the rail keeps the place in line.
      h+='<div class="rail-pointer">'+esc(t.railText || 'Work on the panel to the right, then check your answer there.')+'</div>';
    }
    else { h+=t.render(step, st, {p:p.id, s:si, esc:esc}); h+=fbHtml(st.fb); }
    h+='</div>';
    return h;
  }

  function renderDots(){
    var c=document.getElementById('hdrDots'); if(!c) return; c.innerHTML='';
    for(var i=0;i<PROBLEMS.length;i++){
      var s=S[PROBLEMS[i].id], d=document.createElement('div'); d.className='qd';
      if(s.done) d.classList.add('done'); else if(i===activeP) d.classList.add('active');
      d.textContent=(PROBLEMS[i].num!=null?PROBLEMS[i].num:(i+1));
      (function(idx){d.addEventListener('click',function(){navTo(idx);});})(i);
      c.appendChild(d);
    }
  }

  // ---- SPLIT SHELL ----------------------------------------------------
  // Left rail  = the pipeline: prompt, locked-in answers, the one live step.
  // Right pane = the work surface: what you know, the figure / digital tool,
  //              and the reference that stays on screen the whole problem.
  // Tool contracts are untouched; a tool opts in with pane:'surface'.
  function ensureShell(){
    var m=document.getElementById('main'); if(!m) return false;
    if(!document.getElementById('ckRail')){
      m.innerHTML='<div class="split">'+
        '<div class="pane rail" id="ckRail"></div>'+
        '<div class="pane surf" id="ckSurf"></div></div>';
    }
    return true;
  }

  function surfaceHtml(p, s){
    var h='';
    if(p.given && p.given.length){
      h+='<div class="surf-block"><div class="surf-label">What you know</div><div class="given-list">';
      for(var i=0;i<p.given.length;i++){
        var g=p.given[i];
        h+='<div class="g-chip"><span class="g-val">'+esc(g.v)+'</span><span class="g-k">'+esc(g.k)+'</span></div>';
      }
      h+='</div>';
      if(p.want) h+='<div class="g-want">Looking for: <strong>'+esc(p.want)+'</strong></div>';
      h+='</div>';
    }
    var live=null;
    if(!s.done){
      var ci=s.stepIdx, cstep=p.pipeline[ci], ctool=TOOLS[cstep.tool], cst=s.steps[ci];
      if(ctool && ctool.pane==='surface' && !cst.redirect) live={i:ci, step:cstep, tool:ctool, st:cst};
    }
    if(live){
      h+='<div class="surf-block live"><div class="surf-label">'+esc(live.step.label||'Your turn')+'</div>'+
         live.tool.render(live.step, live.st, {p:p.id, s:live.i, esc:esc})+fbHtml(live.st.fb)+'</div>';
    } else {
      // No live manipulable: keep the most recent surface tool’s finished state on
      // screen (the labelled triangle), falling back to the plain figure.
      var kept=null;
      for(var b=(s.done?p.pipeline.length:s.stepIdx)-1; b>=0; b--){
        var bt=TOOLS[p.pipeline[b].tool];
        if(bt && bt.pane==='surface' && bt.work){ kept=bt.work(p.pipeline[b], s.steps[b], {esc:esc}); break; }
      }
      if(kept){ h+='<div class="surf-block"><div class="surf-label">Your figure</div><div class="surf-fig">'+kept+'</div></div>'; }
      else if(p.figure){
        h+='<div class="surf-block"><div class="surf-fig">'+p.figure+'</div></div>';
      }
    }
    if(p.reference) h+='<div class="surf-block ref">'+p.reference+'</div>';
    return h;
  }

  function renderSplit(){
    if(!ensureShell()) return;
    var rail=document.getElementById('ckRail'), surf=document.getElementById('ckSurf');
    var p=PROBLEMS[activeP], s=S[p.id];
    var h='<div class="qn">'+esc(p.num)+(s.done?'<span class="done-check">\u2713 Complete</span>':'')+'</div>'+
          '<div class="qp">'+esc(p.prompt)+'</div>';
    for(var j=0;j<p.pipeline.length;j++) h+=renderStep(p, j);
    if(s.done || s.stepIdx>=1) h+='<div style="margin-top:14px"><button class="btn btn-work" onclick="K.showWork(\''+p.id+'\')">Show Work</button></div>';
    rail.innerHTML=h;
    surf.innerHTML=surfaceHtml(p, s);
    renderDots();
    var liveEl=rail.querySelector('.step.live');
    if(liveEl && liveEl.scrollIntoView) liveEl.scrollIntoView({block:'nearest'});
    mountLive();
  }

  // afterRender mount pass — tools that need imperative DOM (drag/canvas) provide mount();
  // tools without it (numeric, choice) are unaffected.  Location-agnostic: the tool looks
  // its host up by id, so it works in the rail or in the surface.
  function mountLive(){
    var ap=PROBLEMS[activeP];
    if(!ap || S[ap.id].done) return;
    var ci=S[ap.id].stepIdx, cstep=ap.pipeline[ci], ctool=TOOLS[cstep.tool], cst=S[ap.id].steps[ci];
    if(ctool && ctool.mount && !cst.redirect){
      ctool.mount(cstep, cst, { p:ap.id, s:ci, esc:esc, djb2:djb2,
        rerender:render, pass:function(){ advance(ap.id); render(); } });
    }
  }

  function render(){
    if(LAYOUT==='split') return renderSplit();
    var m=document.getElementById('main'); if(!m) return; m.innerHTML='';
    for(var i=0;i<PROBLEMS.length;i++){
      var p=PROBLEMS[i], s=S[p.id], card=document.createElement('div');
      if(s.done){
        card.className='card done';
        var hd='<div class="qn">'+esc(p.num)+'<span class="done-check">\u2713 Complete</span></div>'+
               '<div class="qp">'+esc(p.prompt)+'</div>';
        for(var jd=0;jd<p.pipeline.length;jd++) hd+=renderStep(p, jd);   // all steps completed -> their answer summaries stay
        hd+='<div style="margin-top:14px"><button class="btn btn-work" onclick="K.showWork(\''+p.id+'\')">Show Work</button></div>';
        card.innerHTML=hd;
      } else if(i===activeP){
        card.className='card v';
        var h='<div class="qn">'+esc(p.num)+'</div><div class="qp">'+esc(p.prompt)+'</div>';
        if(p.figure) h+='<div class="q-figure">'+p.figure+'</div>';   // persistent diagram, raw SVG
        for(var j=0;j<p.pipeline.length;j++) h+=renderStep(p, j);
        if(s.stepIdx>=1) h+='<div style="margin-top:14px"><button class="btn btn-work" onclick="K.showWork(\''+p.id+'\')">Show Work</button></div>';
        card.innerHTML=h;
      } else continue;
      m.appendChild(card);
    }
    renderDots();
    mountLive();
  }

  // ---- "Show Work" popup (a model of how the solution should look on paper) ----
  function showWork(pid){
    var p=pById(pid), s=S[pid];
    var head='<p class="work-prompt">'+esc(p.prompt)+'</p>';
    if(p.figure) head+='<div class="work-figure">'+p.figure+'</div>';
    head+='<div class="work-reminder">\u270D First, rewrite the problem on your paper \u2014 copy the figure and label its numbers. That copying IS the first part of showing your work.</div>';
    var body='', any=false;
    for(var j=0;j<p.pipeline.length && j<s.stepIdx; j++){
      any=true;
      var step=p.pipeline[j], st=s.steps[j], t=TOOLS[step.tool];
      var w = t.work ? t.work(step, st, {esc:esc})
                     : '<div class="work-answer">'+esc(t.summary?t.summary(step,st):'done')+'</div>';
      body+='<div class="work-step"><div class="work-step-label">'+esc(step.label||('Step '+(j+1)))+'</div>'+w+'</div>';
    }
    if(!any) body='<p class="work-note">Then work it out step by step \u2014 your steps will show up here too.</p>';
    var modal=document.createElement('div'); modal.className='work-backdrop'; modal.id='workModal';
    modal.addEventListener('click', closeWork);
    modal.innerHTML='<div class="work-modal"><div class="work-head"><h3>Your work \u2014 '+esc(p.num)+'</h3>'+
      '<button class="work-close" onclick="K.closeWork()">\u2715</button></div><div class="work-body">'+head+body+'</div></div>';
    modal.querySelector('.work-modal').addEventListener('click', function(e){ e.stopPropagation(); });
    document.body.appendChild(modal);
  }
  function closeWork(){ var m=document.getElementById('workModal'); if(m) m.parentNode.removeChild(m); }

  // ---- public surface ----
  global.K = { run:run, tool:tool, act:act, input:input, set:set, navTo:navTo,
               VERSION:ENGINE_VERSION, layout:function(){return LAYOUT;},
               showWork:showWork, closeWork:closeWork,
               _esc:esc, _djb2:djb2 };

})(window);


/* ===================================================================
   PRIMITIVE 1 — NUMERIC
   step = { tool:'numeric', answer, tol?, unit?, label?, closeBand? }
   Tiered feedback: exact→pass, close→nudge, 3 misses→teacher redirect.
   =================================================================== */
K.tool('numeric', {
  limit: 3,                        // answer step: three tries before the teacher redirect
  state: function(){ return {val:''}; },
  render: function(step, st, ref){
    var unit = step.unit ? '<span style="font-size:.85rem;color:var(--muted);font-weight:500">'+ref.esc(step.unit)+'</span>' : '';
    return '<div class="calc-row">'+
      '<input type="text" inputmode="decimal" value="'+ref.esc(st.val)+'" placeholder="number only" '+
      'oninput="K.input(\''+ref.p+'\','+ref.s+',this.value)" '+
      'onkeydown="if(event.key===\'Enter\')K.act(\''+ref.p+'\','+ref.s+',\'check\')">'+
      unit+
      '<button class="btn btn-go" onclick="K.act(\''+ref.p+'\','+ref.s+',\'check\')">Check</button></div>';
  },
  check: function(step, st){
    var v=parseFloat(st.val);
    if(isNaN(v)) return {fb:{t:'err',m:'Enter a number.'}, tier:'soft'};   // 'soft' = doesn't count toward redirect
    var tol = step.tol!=null ? step.tol : 0.5;
    var diff = Math.abs(v - step.answer);
    if(diff <= tol) return {pass:true};
    // Traps are tested FIRST: a known misconception that happens to land near the
    // right answer must be named, not softened into "close, check your arithmetic".
    if(step.traps){ for(var ti=0;ti<step.traps.length;ti++){ var tr=step.traps[ti];
      if(Math.abs(v-tr.near) <= (tr.tol!=null?tr.tol:0.5)) return {fb:{t:'err',m:tr.msg,diag:true}}; } }   // common-error nudges
    var band = step.closeBand!=null ? step.closeBand : 0.15;
    if(diff <= Math.abs(step.answer)*band) return {fb:{t:'warn',m:'Close \u2014 check your arithmetic or rounding.'}};
    return {fb:{t:'err',m:'Not quite. Check your setup and try again.'}};
  },
  summary: function(step){ return step.answer + (step.unit?(' '+step.unit):''); },
  entry: function(step, st){ return (st.val===''||st.val==null) ? null : (st.val + (step.unit?(' '+step.unit):'')); }
});


/* ===================================================================
   PRIMITIVE 2 — CHOICE
   step = { tool:'choice', options:[...], ch, ask?, shuffle?, label? }
   `ch` = djb2 hash of the correct option text, so the answer is NOT
   readable in page source. Tap to select, Check to commit.
   =================================================================== */
K.tool('choice', {
  limit: 3,                        // formula / ratio step
  state: function(step){
    var opts = step.options.slice();
    if(step.shuffle){ for(var i=opts.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=opts[i];opts[i]=opts[j];opts[j]=t;} }
    return { selIdx:null, options:opts };
  },
  render: function(step, st, ref){
    var h='';
    if(step.ask) h+='<div class="step-text">'+ref.esc(step.ask)+'</div>';
    // `stack:true` -> full-width, left-aligned, prose font. The default row of
    // centred monospace pills is right for short math tokens (A = bh, sin-1)
    // and unreadable for sentence-length options.
    var stack = !!step.stack;
    h+= stack ? '<div class="opt-stack">' : '<div class="ratio-row" style="gap:8px">';
    for(var i=0;i<st.options.length;i++){
      var on = st.selIdx===i;
      if(stack){
        h+='<button class="opt-row'+(on?' sel':'')+'" '+
           'onclick="K.act(\''+ref.p+'\','+ref.s+',\'pick\','+i+')">'+ref.esc(st.options[i])+'</button>';
      }else{
        h+='<button class="ratio-btn'+(on?' inv':'')+'" style="min-width:auto'+(on?'':';background:var(--surface);color:var(--text);border-color:var(--border)')+'" '+
           'onclick="K.act(\''+ref.p+'\','+ref.s+',\'pick\','+i+')">'+ref.esc(st.options[i])+'</button>';
      }
    }
    h+='</div>';
    if(st.selIdx!=null) h+='<div style="margin-top:10px"><button class="btn btn-go" onclick="K.act(\''+ref.p+'\','+ref.s+',\'check\')">Check</button></div>';
    return h;
  },
  act: function(step, st, action, payload){ if(action==='pick'){ st.selIdx=payload; st.fb=null; } },
  check: function(step, st, ctx){
    if(st.selIdx==null) return {fb:{t:'err',m:'Tap an option first.'}, tier:'soft'};
    if(ctx.djb2(st.options[st.selIdx])===step.ch) return {pass:true};
    return {fb:{t:'err',m: step.nudge || 'Not that one \u2014 try again.'}};
  },
  summary: function(step, st){ return st.options[st.selIdx]; },
  entry: function(step, st){ return st.selIdx==null ? null : st.options[st.selIdx]; }
});

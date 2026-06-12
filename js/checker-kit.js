/* ===================================================================
   CHECKER KIT — generic runner + tool registry
   A checker is data: PROBLEMS = [ {id, num, prompt, pipeline:[step...]} ]
   Each step = { tool:'numeric', ...config }.  Tools register themselves.
   The runner walks the pipeline; each passed step unlocks the next.
   No localStorage. Pointer-event tools come later (Label/Match/Plot).
   =================================================================== */
(function (global) {
  'use strict';

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
  function run(problems){
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
      else if(r.tier==='soft'){ st.fb=r.fb; }                          // prompt, not a wrong answer — no strike
      else { st.misses++;
        if(st.misses>=3){ st.redirect=true; st.fb=null; }
        else st.fb=r.fb || {t:'err',m:'Not quite — try again.'};
      }
      render(); return;
    }
    if(t.act){ t.act(step, st, action, payload, {render:render, djb2:djb2}); render(); }     // tool-specific actions
  }

  function advance(pid){
    var p=pById(pid), s=S[pid];
    s.stepIdx++;
    if(s.stepIdx>=p.pipeline.length){ s.done=true;
      var i=pIndex(pid); if(i<PROBLEMS.length-1) activeP=i+1;
    }
    window.scrollTo({top:0,behavior:'smooth'});
  }

  function navTo(i){ if(i>=0&&i<PROBLEMS.length){activeP=i; render(); window.scrollTo({top:0,behavior:'smooth'});} }

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
    if(si<cur){ // completed → collapsed summary
      var sum = t.summary ? t.summary(step, st) : 'done';
      return '<div class="step show"><div class="step-label">'+esc(step.label||('Step '+(si+1)))+'</div>'+
             '<div class="fb ok show">\u2713 '+esc(sum)+'</div></div>';
    }
    if(si>cur) return ''; // locked → hidden
    // active step
    var h='<div class="step show"><div class="step-label">'+esc(step.label||('Step '+(si+1)))+'</div>';
    if(st.redirect){ h+=redirectHtml(p.id, si); }
    else { h+=t.render(step, st, {p:p.id, s:si, esc:esc}); h+=fbHtml(st.fb); }
    h+='</div>';
    return h;
  }

  function renderDots(){
    var c=document.getElementById('hdrDots'); if(!c) return; c.innerHTML='';
    for(var i=0;i<PROBLEMS.length;i++){
      var s=S[PROBLEMS[i].id], d=document.createElement('div'); d.className='qd';
      if(s.done) d.classList.add('done'); else if(i===activeP) d.classList.add('active');
      d.textContent=((PROBLEMS[i].num||'').match(/\d+/)||[String(i+1)])[0];
      (function(idx){d.addEventListener('click',function(){navTo(idx);});})(i);
      c.appendChild(d);
    }
  }

  function render(){
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
        for(var j=0;j<p.pipeline.length;j++) h+=renderStep(p, j);
        if(s.stepIdx>=1) h+='<div style="margin-top:14px"><button class="btn btn-work" onclick="K.showWork(\''+p.id+'\')">Show Work</button></div>';
        card.innerHTML=h;
      } else continue;
      m.appendChild(card);
    }
    renderDots();
    // afterRender mount pass — tools that need imperative DOM (drag/canvas) provide mount();
    // tools without it (numeric, choice) are unaffected.
    var ap=PROBLEMS[activeP];
    if(ap && !S[ap.id].done){
      var ci=S[ap.id].stepIdx, cstep=ap.pipeline[ci], ctool=TOOLS[cstep.tool], cst=S[ap.id].steps[ci];
      if(ctool && ctool.mount && !cst.redirect){
        ctool.mount(cstep, cst, { p:ap.id, s:ci, esc:esc, djb2:djb2,
          rerender:render, pass:function(){ advance(ap.id); render(); } });
      }
    }
  }

  // ---- "Show Work" popup (a model of how the solution should look on paper) ----
  function showWork(pid){
    var p=pById(pid), s=S[pid];
    var body='<p class="work-prompt">'+esc(p.prompt)+'</p>', any=false;
    for(var j=0;j<p.pipeline.length && j<s.stepIdx; j++){
      any=true;
      var step=p.pipeline[j], st=s.steps[j], t=TOOLS[step.tool];
      var w = t.work ? t.work(step, st, {esc:esc})
                     : '<div class="work-answer">'+esc(t.summary?t.summary(step,st):'done')+'</div>';
      body+='<div class="work-step"><div class="work-step-label">'+esc(step.label||('Step '+(j+1)))+'</div>'+w+'</div>';
    }
    if(!any) body='<p class="work-prompt">Start working and your steps show up here \u2014 this is how it should look on your paper.</p>';
    var modal=document.createElement('div'); modal.className='work-backdrop'; modal.id='workModal';
    modal.addEventListener('click', closeWork);
    modal.innerHTML='<div class="work-modal"><div class="work-head"><h3>Your work \u2014 '+esc(p.num)+'</h3>'+
      '<button class="work-close" onclick="K.closeWork()">\u2715</button></div><div class="work-body">'+body+'</div></div>';
    modal.querySelector('.work-modal').addEventListener('click', function(e){ e.stopPropagation(); });
    document.body.appendChild(modal);
  }
  function closeWork(){ var m=document.getElementById('workModal'); if(m) m.parentNode.removeChild(m); }

  // ---- public surface ----
  global.K = { run:run, tool:tool, act:act, input:input, set:set, navTo:navTo,
               showWork:showWork, closeWork:closeWork,
               _esc:esc, _djb2:djb2 };

})(window);


/* ===================================================================
   PRIMITIVE 1 — NUMERIC
   step = { tool:'numeric', answer, tol?, unit?, label?, closeBand? }
   Tiered feedback: exact→pass, close→nudge, 3 misses→teacher redirect.
   =================================================================== */
K.tool('numeric', {
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
    var band = step.closeBand!=null ? step.closeBand : 0.15;
    if(diff <= Math.abs(step.answer)*band) return {fb:{t:'warn',m:'Close \u2014 check your arithmetic or rounding.'}};
    return {fb:{t:'err',m:'Not quite. Check your setup and try again.'}};
  },
  summary: function(step){ return step.answer + (step.unit?(' '+step.unit):''); }
});


/* ===================================================================
   PRIMITIVE 2 — CHOICE
   step = { tool:'choice', options:[...], ch, ask?, shuffle?, label? }
   `ch` = djb2 hash of the correct option text, so the answer is NOT
   readable in page source. Tap to select, Check to commit.
   =================================================================== */
K.tool('choice', {
  state: function(step){
    var opts = step.options.slice();
    if(step.shuffle){ for(var i=opts.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=opts[i];opts[i]=opts[j];opts[j]=t;} }
    return { selIdx:null, options:opts };
  },
  render: function(step, st, ref){
    var h='';
    if(step.ask) h+='<div class="step-text">'+ref.esc(step.ask)+'</div>';
    h+='<div class="ratio-row" style="gap:8px">';
    for(var i=0;i<st.options.length;i++){
      var on = st.selIdx===i;
      h+='<button class="ratio-btn'+(on?' inv':'')+'" style="min-width:auto'+(on?'':';background:var(--surface);color:var(--text);border-color:var(--border)')+'" '+
         'onclick="K.act(\''+ref.p+'\','+ref.s+',\'pick\','+i+')">'+ref.esc(st.options[i])+'</button>';
    }
    h+='</div>';
    if(st.selIdx!=null) h+='<div style="margin-top:10px"><button class="btn btn-go" onclick="K.act(\''+ref.p+'\','+ref.s+',\'check\')">Check</button></div>';
    return h;
  },
  act: function(step, st, action, payload){ if(action==='pick'){ st.selIdx=payload; st.fb=null; } },
  check: function(step, st, ctx){
    if(st.selIdx==null) return {fb:{t:'err',m:'Tap an option first.'}, tier:'soft'};
    if(ctx.djb2(st.options[st.selIdx])===step.ch) return {pass:true};
    return {fb:{t:'err',m:'Not that one — try again.'}};
  },
  summary: function(step, st){ return st.options[st.selIdx]; }
});

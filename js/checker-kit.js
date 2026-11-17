/* ===================================================================
   CHECKER KIT — generic runner + tool registry
   A checker is data: PROBLEMS = [ {id, num, prompt, pipeline:[step...]} ]
   Each step = { tool:'numeric', ...config }.  Tools register themselves.
   The runner walks the pipeline; each passed step unlocks the next.
   No localStorage.

   SCAFFOLDING MODEL (v1.4.0) — coarse first, ladder on demand.
   A step may carry `sub:[step...]`, a ladder of smaller moves that gets
   you to the same place.  Nothing in the ladder is on screen at the
   start: the student is asked the BIG move and given room to just do it.
   On the first miss the ladder splits open, one rung at a time, and
   finishing it settles the parent.  Scaffolding is a response to a miss,
   never a precondition for trying.

   STEP CODES.  Handlers address a step by an integer code so that tool
   contracts stay untouched (tools interpolate ref.s straight into
   onclick).  A parent step is its own index.  A rung is encoded
   (parentIndex+1)*1000 + (rungIndex+1) — so 1a is 1001, 3c is 3003.
   =================================================================== */
(function (global) {
  'use strict';

  var ENGINE_VERSION = '1.6.0';   // 1.1.0 locked-in rows (tool.entry); 1.2.0 choice stack layout;
                                  // 1.3.0 split shell, per-step miss limits, two-level nudges;
                                  // 1.4.0 coarse-first sub-step ladders (step.sub);
                                  // 1.5.0 work shell: suggested work left, question right, f button (opt-in);
                                  // 1.6.0 work shell drop slots: drag a card from the question onto the paper
  var LAYOUT = 'stack';    // 'stack' (one column) | 'split' (left rail + right surface) | 'work' (suggested work + question)
  var GLOBAL_REF = null;   // work shell: the Formula Box when a problem has no reference of its own
  var refOpen = false, refFor = -1, escWired = false;
  var TOOLS = {};          // tool registry:  name -> tool definition
  var PROBLEMS = [];       // the loaded checker (set by run())
  var S = {};              // run-time state, keyed by problem id
  var activeP = 0;         // index of the open problem
  var SUBBASE = 1000;
  var LETTERS = 'abcdefghijklmn';

  // ---- shared helpers (the bits every tool reuses) ----
  function esc(s){return (s==null?'':''+s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
  function djb2(s){var v=5381;for(var i=0;i<s.length;i++){v=((v<<5)+v)+s.charCodeAt(i);v=v&v;}return v>>>0;}
  function pById(id){for(var i=0;i<PROBLEMS.length;i++)if(PROBLEMS[i].id===id)return PROBLEMS[i];return null;}
  function pIndex(id){for(var i=0;i<PROBLEMS.length;i++)if(PROBLEMS[i].id===id)return i;return -1;}

  // ---- registration: a tool is { state, render, check, summary } ----
  function tool(name, def){ TOOLS[name] = def; }

  // ---- state construction ----
  function stateFor(step){
    var t = TOOLS[step.tool];
    if(!t){ throw new Error('Unknown tool: '+step.tool); }
    var st = t.state ? t.state(step) : {};
    st.misses = 0; st.fb = null; st.redirect = false;
    if(step.sub && step.sub.length){
      st.exp = false; st.subIdx = 0; st.subs = [];
      for(var j=0;j<step.sub.length;j++) st.subs.push(stateFor(step.sub[j]));
    }
    return st;
  }

  // ---- lifecycle ----
  function run(problems, opts){
    LAYOUT = (opts && opts.layout) ? opts.layout : 'stack';
    GLOBAL_REF = (opts && opts.reference) ? opts.reference : null;
    refOpen = false; refFor = -1;
    if(LAYOUT==='work' && !escWired && typeof document!=='undefined'){
      escWired = true;
      document.addEventListener('keydown', function(e){ if(e.key==='Escape' && refOpen) closeRef(); });
    }
    PROBLEMS = problems;
    S = {};
    for (var i=0;i<PROBLEMS.length;i++){
      var p=PROBLEMS[i], steps=[];
      for (var j=0;j<p.pipeline.length;j++) steps.push(stateFor(p.pipeline[j]));
      S[p.id]={stepIdx:0, done:false, steps:steps};
    }
    activeP=0;
    for(var k=0;k<PROBLEMS.length;k++){if(!S[PROBLEMS[k].id].done){activeP=k;break;}}
    render();
  }

  // ---- code <-> step resolution ----
  function isSub(code){ return code >= SUBBASE; }
  function parentOf(code){ return isSub(code) ? Math.floor(code/SUBBASE)-1 : code; }
  function rungOf(code){ return isSub(code) ? (code % SUBBASE)-1 : -1; }
  function subCode(si, sj){ return (si+1)*SUBBASE + (sj+1); }

  function resolve(pid, code){
    var p=pById(pid), si=parentOf(code), sj=rungOf(code);
    var pstep=p.pipeline[si], pst=S[pid].steps[si];
    if(sj>=0){
      var step=pstep.sub[sj];
      return {p:p, si:si, sj:sj, step:step, st:pst.subs[sj], parent:pstep, pst:pst, tool:TOOLS[step.tool]};
    }
    return {p:p, si:si, sj:-1, step:pstep, st:pst, parent:null, pst:pst, tool:TOOLS[pstep.tool]};
  }

  // The one step the student can act on right now: the active parent, or,
  // if that parent's ladder is open, the active rung of the ladder.
  function liveCode(pid){
    var s=S[pid]; if(s.done) return -1;
    var si=s.stepIdx, st=s.steps[si];
    return (st.exp) ? subCode(si, st.subIdx) : si;
  }

  // ---- runner actions (single global entry point for inline handlers) ----
  function input(pid, code, val){ var r=resolve(pid, code); r.st.val=val; r.st.fb=null; }
  function set(pid, code, key, val){ var r=resolve(pid, code); r.st[key]=val; r.st.fb=null; render(); }

  function act(pid, code, action, payload){
    var r=resolve(pid, code), st=r.st, step=r.step, t=r.tool;
    if(action==='skip'){ st.redirect=false; st.fb=null; pass(pid, code); render(); return; }  // teacher-helped continue
    if(action==='check'){
      var res=t.check(step, st, {djb2:djb2}, payload);   // payload: tap index / op token; ignored by others
      if(res.pass){ st.fb=null; st.redirect=false; pass(pid, code); render(); return; }
      if(res.tier==='soft'){ st.fb=res.fb; if(res.progress) st.misses=0; render(); return; }  // prompt, not a wrong answer
      st.misses++;
      // FIRST MISS ON A PARENT THAT CARRIES A LADDER: split it open rather
      // than spending a strike. The rungs are the help.
      if(r.sj<0 && step.sub && step.sub.length && !st.exp){
        st.exp=true; st.subIdx=0; st.misses=0;
        st.fb={t:'warn', m:splitNotice(r.si, step, res)};
        render(); return;
      }
      var lim = (step.limit!=null) ? step.limit : (t.limit!=null ? t.limit : 3);
      if(st.misses>=lim){ st.redirect=true; st.fb=null; }
      else st.fb = nudgeFor(step, st, res);
      render(); return;
    }
    if(t.act){                                                                          // tool-specific actions
      var ar=t.act(step, st, action, payload, {render:render, djb2:djb2});
      if(ar && ar.check) return act(pid, code, 'check');                                 // e.g. a drop is an answer
      render();
    }
  }

  function splitNotice(si, step, res){
    var n=step.sub.length, range=(si+1)+'a through '+(si+1)+LETTERS[n-1];
    var diag = (res && res.fb && res.fb.diag) ? res.fb.m+' ' : '';
    if(LAYOUT==='work') return diag+'Let\u2019s take this one move at a time. Finish these moves and this step is done.';
    return diag+'Let\u2019s take this one move at a time \u2014 steps '+range+'. Finish them and this step is done.';
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
    return {t:'err', m:'Not quite \u2014 try again.'};
  }

  // ---- advancing ----
  function pass(pid, code){
    if(isSub(code)){
      var si=parentOf(code), pst=S[pid].steps[si], n=pById(pid).pipeline[si].sub.length;
      pst.subIdx++;
      if(pst.subIdx>=n) advance(pid);      // walked the whole ladder -> the parent is settled
      return;
    }
    advance(pid);
  }

  function advance(pid){
    var p=pById(pid), s=S[pid];
    s.stepIdx++;
    if(s.stepIdx>=p.pipeline.length){ s.done=true;
      // work shell: stay on the finished problem so the whole suggested work is on screen;
      // the student moves on with the Next button.
      var i=pIndex(pid); if(LAYOUT!=='work' && i<PROBLEMS.length-1) activeP=i+1;
    }
    scrollToWork();
  }
  function scrollToWork(){
    if(LAYOUT==='split' || LAYOUT==='work'){ return; }   // these shells scroll their own panes
    if(typeof window!=='undefined' && window.scrollTo) window.scrollTo({top:0,behavior:'smooth'});
  }

  function navTo(i){ if(i>=0&&i<PROBLEMS.length){activeP=i; render(); scrollToWork();} }

  // ---- rendering ----
  function fbHtml(fb){
    if(!fb) return '';
    var cls = fb.t==='ok'?'ok':(fb.t==='warn'?'warn':'err');
    var icon = fb.t==='warn'?'\u26A0 ':(fb.t==='ok'?'\u2713 ':'\u2717 ');
    return '<div class="fb '+cls+' show" style="margin-top:10px">'+icon+esc(fb.m)+'</div>';
  }
  function redirectHtml(pid, code){
    return '<div class="hint-text" style="border-left-color:var(--warn);background:var(--warn-lt);color:var(--warn);font-style:normal;font-weight:600">'+
      '\u270B Bring your work to your teacher and show them this step. It\u2019s okay to ask for help.</div>'+
      '<div style="margin-top:8px"><button class="btn btn-reset" onclick="K.act(\''+pid+'\','+code+',\'skip\')">Teacher helped \u2014 continue</button></div>';
  }
  function lockedRow(step, st, t){
    var sum = (t.entry ? t.entry(step, st) : (t.summary ? t.summary(step, st) : 'done'));
    if(sum==null || sum==='') sum='done';
    return '<div class="locked-in" style="min-height:40px;display:flex;align-items:center;gap:8px;'+
           'padding:9px 14px;border:2px solid var(--ok);border-radius:8px;background:var(--ok-lt);'+
           'font-size:.9rem;font-weight:600;color:var(--ok)">'+
           '<span aria-hidden="true">\u2713</span><span class="sr-only" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)">Answered: </span>'+
           '<span style="color:var(--text)">'+esc(sum)+'</span></div>';
  }
  function bodyFor(pid, code, step, st, t){
    if(st.redirect) return redirectHtml(pid, code);
    if(LAYOUT==='split' && t.pane==='surface'){
      // The manipulable lives in the work surface; the rail keeps the place in line.
      return '<div class="rail-pointer">'+esc(t.railText || 'Work on the panel to the right, then check your answer there.')+'</div>';
    }
    return t.render(step, st, {p:pid, s:code, esc:esc}) + fbHtml(st.fb);
  }

  // one rung of an open ladder
  function renderRung(p, si, sj){
    var pstep=p.pipeline[si], pst=S[p.id].steps[si];
    var step=pstep.sub[sj], st=pst.subs[sj], t=TOOLS[step.tool];
    var tag='Step '+(si+1)+LETTERS[sj];
    var lbl=step.label ? (LAYOUT==='work' ? step.label : tag+' \u2014 '+step.label) : tag;
    if(sj < pst.subIdx)
      return '<div class="step sub show"><div class="step-label">'+esc(lbl)+'</div>'+lockedRow(step, st, t)+'</div>';
    if(sj > pst.subIdx) return '';                       // later rungs are not rendered at all
    return '<div class="step sub show live"><div class="step-label">'+esc(lbl)+'</div>'+
           bodyFor(p.id, subCode(si,sj), step, st, t)+'</div>';
  }

  function renderStep(p, si){
    var step=p.pipeline[si], st=S[p.id].steps[si], t=TOOLS[step.tool], cur=S[p.id].stepIdx;
    var lbl=step.label||('Step '+(si+1));
    if(si<cur){ // completed -> LOCKED-IN row showing what the student entered.
      var h='<div class="step show"><div class="step-label">'+esc(lbl)+'</div>';
      if(st.exp){                                        // a walked ladder stays on screen
        h+='<div class="ladder-done">';
        for(var j=0;j<step.sub.length;j++) h+=renderRung(p, si, j);
        h+='</div>';
      } else h+=lockedRow(step, st, t);
      return h+'</div>';
    }
    if(si>cur) return ''; // locked -> hidden
    // active step
    var a='<div class="step show'+(st.exp?'':' live')+'"><div class="step-label">'+esc(lbl)+'</div>';
    if(st.exp){
      a+=fbHtml(st.fb);                                  // the split notice
      for(var k=0;k<step.sub.length;k++) a+=renderRung(p, si, k);
    } else {
      a+=bodyFor(p.id, si, step, st, t);
    }
    return a+'</div>';
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
    var code=liveCode(p.id), live=null;
    if(code>=0){
      var r=resolve(p.id, code);
      if(r.tool && r.tool.pane==='surface' && !r.st.redirect) live=r;
    }
    if(live){
      h+='<div class="surf-block live"><div class="surf-label">'+esc(live.step.label||'Your turn')+'</div>'+
         live.tool.render(live.step, live.st, {p:p.id, s:code, esc:esc})+fbHtml(live.st.fb)+'</div>';
    } else {
      // No live manipulable: keep the most recent surface tool's finished state on
      // screen (the labelled triangle), falling back to the plain figure.
      var kept=keptSurface(p, s);
      if(kept) h+='<div class="surf-block"><div class="surf-label">Your figure</div><div class="surf-fig">'+kept+'</div></div>';
      else if(p.figure) h+='<div class="surf-block"><div class="surf-fig">'+p.figure+'</div></div>';
    }
    if(p.reference) h+='<div class="surf-block ref">'+p.reference+'</div>';
    return h;
  }

  // walk backwards through everything already answered — rungs included — for the
  // last surface tool that can draw its finished state.
  function keptSurface(p, s){
    var last=(s.done?p.pipeline.length:s.stepIdx+1)-1;
    for(var i=last;i>=0;i--){
      var step=p.pipeline[i], st=s.steps[i];
      if(st.exp){
        var upto=(i<s.stepIdx||s.done) ? step.sub.length-1 : st.subIdx-1;
        for(var j=upto;j>=0;j--){
          var rt=TOOLS[step.sub[j].tool];
          if(rt && rt.pane==='surface' && rt.work) return rt.work(step.sub[j], st.subs[j], {esc:esc});
        }
        continue;
      }
      if(i>=s.stepIdx && !s.done) continue;              // the live parent has not been answered
      var t=TOOLS[step.tool];
      if(t && t.pane==='surface' && t.work) return t.work(step, st, {esc:esc});
    }
    return null;
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

  // afterRender mount pass — tools that need imperative DOM (drag/canvas) provide
  // mount(); tools without it (numeric, choice) are unaffected. Location-agnostic:
  // the tool looks its host up by id, so it works in the rail or in the surface.
  function mountLive(){
    var ap=PROBLEMS[activeP]; if(!ap) return;
    var code=liveCode(ap.id); if(code<0) return;
    var r=resolve(ap.id, code);
    if(r.tool && r.tool.mount && !r.st.redirect){
      r.tool.mount(r.step, r.st, { p:ap.id, s:code, esc:esc, djb2:djb2,
        rerender:render, pass:function(){ pass(ap.id, code); render(); } });
    }
  }

  // ---- WORK SHELL (v1.5.0) -------------------------------------------
  // Left  = the suggested work: how the paper should look, filled in one part
  //         at a time as the student checks each step. Nothing shows ahead of
  //         the student; parts not reached yet show as blank lines.
  // Right = the question: prompt, what you know, the live step and its ladder.
  // An f button on the question's corner opens the Formula Box (references).
  //
  // A problem opts in with  work:[group...]  and optional  workCheck: 'html' or [line...] (shown when done).
  // The work is what a person writes on paper, not the scaffolding: a labelled sketch,
  // side calculations beside it, then one column of algebra with the = signs lined up.
  //   group = { lines:[line...] }  or  { cols:[ [line...], [line...] ] }   (side by side)
  //   line  = { h:'html' }                         a free line (a sketch, a side calculation)
  //         | { l:'html', r:'html' }               an equation: left side | = right side, aligned
  //           + tag:'5c'      the step number, in the margin
  //           + note:'text'   the move, written beside the line (change sides, change signs)
  //           + at:[si] | [si, rung]   when it shows (see below); no `at` = from the start
  //           + fig:true      a sketch: its step number sits at the top, not on the last baseline
  //   at:[si]        shows once pipeline step si is settled
  //   at:[si, rung]  shows once rung `rung` of step si's open ladder is done (or si is settled)
  // Lines are trusted HTML from the checker's builder (fractions, sketches), like p.figure.
  function revealedAt(s, at){
    if(!at || s.done) return true;
    var si=at[0], sj=(at.length>1 ? at[1] : -1);
    if(s.stepIdx>si) return true;
    if(s.stepIdx===si && sj>=0){ var st=s.steps[si]; if(st.exp && st.subIdx>sj) return true; }
    return false;
  }

  function ensureWorkShell(){
    var m=document.getElementById('main'); if(!m) return false;
    if(!document.getElementById('ckWork')){
      m.innerHTML='<div class="wk">'+
        '<section class="pane wk-work" id="ckWork" aria-label="Suggested work"></section>'+
        '<div class="wk-qwrap">'+
          '<section class="pane wk-q" id="ckQ" aria-label="Question"></section>'+
          '<button type="button" class="ref-fab" id="ckRefBtn" aria-expanded="false" aria-controls="ckRef" '+
            'aria-label="Formula Box" title="Formula Box" onclick="K.toggleRef()">f</button>'+
          '<div class="ref-pop" id="ckRef" role="dialog" aria-label="Formula Box" hidden></div>'+
        '</div></div>';
    }
    return true;
  }

  // ---- DROP SLOTS (v1.6.0) ----
  // A pipeline step with  slot:'name'  is answered by dragging a card from the
  // question pane onto the paper. The work names where:
  //   a line   { slot:'model', tag, l, r, at:[si] }   while step si is live it is a drop box;
  //                                                   once si is settled it is the written line
  //   a sketch { fig:{ svg, vb:[w,h], zones:[{id, x, y, anchor, name}] }, slot:'sketch' }
  //            each zone is a spot on the sketch (viewBox units); while the step is live the
  //            empty zones are drop boxes, and every label placed there stays in its ink
  // The tool (tool-drag.js) owns the cards and decides right or wrong; the shell only
  // draws the targets and hands a drop back as  act(pid, code, 'drop', {card, zone}).
  function slotStep(p, name){ for(var i=0;i<p.pipeline.length;i++) if(p.pipeline[i].slot===name) return i; return -1; }
  function slotLive(p, s, name){
    var si=slotStep(p, name); if(si<0 || s.done || s.stepIdx!==si) return null;
    var st=s.steps[si]; if(st.redirect) return null;
    return {si:si, step:p.pipeline[si], st:st};
  }
  function cardFor(step, zid){                        // the card a zone takes, found by its hash
    var acc=null; (step.zones||[]).forEach(function(z){ if(z.id===zid) acc=z.accept; });
    if(acc==null) return null;
    for(var i=0;i<(step.cards||[]).length;i++) if(djb2(step.cards[i].t)===acc) return i;
    return null;
  }
  var ANCHOR={start:'translate(0,-50%)', middle:'translate(-50%,-50%)', end:'translate(-100%,-50%)'};
  function figHtml(L, p, s){
    var F=L.fig, si=L.slot ? slotStep(p, L.slot) : -1, lv=L.slot ? slotLive(p, s, L.slot) : null;
    var step=si>=0 ? p.pipeline[si] : null, st=si>=0 ? s.steps[si] : null;
    var settled = si<0 || s.done || s.stepIdx>si;
    var h='<div class="wk-fig" style="max-width:'+F.vb[0]+'px">'+F.svg;
    (F.zones||[]).forEach(function(z){
      var pos='left:'+(100*z.x/F.vb[0]).toFixed(2)+'%;top:'+(100*z.y/F.vb[1]).toFixed(2)+'%;transform:'+(ANCHOR[z.anchor||'middle']);
      var ci = (st && st.placed && st.placed[z.id]!=null) ? st.placed[z.id] : (settled && step ? cardFor(step, z.id) : null);
      if(ci!=null){ var c=step.cards[ci];
        h+='<span class="wk-lbl'+(c.ink?' ink-'+c.ink:'')+'" style="'+pos+'">'+esc(c.t)+'</span>'; }
      else if(!step && z.text) h+='<span class="wk-lbl'+(z.ink?' ink-'+z.ink:'')+'" style="'+pos+'">'+z.text+'</span>';
      else if(lv) h+='<button type="button" class="wk-zone'+(lv.st.sel!=null?' armed':'')+'" data-drop="'+esc(z.id)+'" style="'+pos+'" '+
                    'onclick="K.dropAt(\''+esc(z.id)+'\')" aria-label="Put a label here'+(z.name?': '+esc(z.name):'')+'">?</button>';
    });
    return h+'</div>';
  }
  function workLine(L, s, mark, p){
    if(typeof L==='string') L={h:L};
    var eq=(L.l!=null || L.r!=null);
    var tag='<span class="wk-tag'+(L.fig?' top':'')+'">'+esc(L.tag||'')+'</span>';   // fig: a sketch, number at its top
    // a sketch spans to the flexible last column, so it can shrink on a phone instead of widening the = column
    if(L.fig && L.fig.svg) return '<div class="wk-ln">'+tag+' <span class="wk-h wk-figcell">'+figHtml(L, p, s)+'</span></div>';
    var lv = L.slot ? slotLive(p, s, L.slot) : null;
    if(lv && !revealedAt(s, L.at)){
      mark.done=true;
      return '<div class="wk-ln drop">'+tag+' <span class="wk-dropcell"><button type="button" class="wk-drop'+(lv.st.sel!=null?' armed':'')+
             '" data-drop="'+esc(L.slot)+'" onclick="K.dropAt(\''+esc(L.slot)+'\')">'+esc(lv.step.dropText||'Drag it here')+'</button></span><span class="wk-move"></span></div>';
    }
    if(!revealedAt(s, L.at)){
      var next=(!s.done && !mark.done); if(next) mark.done=true;
      return '<div class="wk-ln pending'+(next?' next':'')+'">'+tag+
             // the left side is laid out but invisible, so the = signs never move as lines appear
             ' <span class="wk-l" style="visibility:hidden">'+(L.l||'')+'</span><span class="wk-guide" aria-hidden="true"></span><span class="wk-move"></span></div>';
    }
    // spaces between the parts read right aloud and in textContent; a grid ignores them
    var body = eq ? '<span class="wk-l">'+(L.l||'')+'</span> <span class="wk-r">'+(L.r||'')+'</span>'
                  : '<span class="wk-h">'+L.h+'</span>';
    return '<div class="wk-ln'+(eq?' eq':'')+'">'+tag+' '+body+' <span class="wk-move">'+esc(L.note||'')+'</span></div>';
  }
  function workHtml(p, s){
    var h='<div class="wk-head"><span class="wk-title">Suggested work</span><span class="wk-for">'+esc(p.num)+'</span></div>'+
          '<p class="wk-intro">How your paper could look. A line shows up after you check that step.</p>';
    var groups=p.work||[], mark={done:false};
    for(var i=0;i<groups.length;i++){
      var g=groups[i];
      if(g.cols){
        h+='<div class="wk-group wk-cols">';
        for(var c=0;c<g.cols.length;c++){
          h+='<div class="wk-sheet">';
          for(var k=0;k<g.cols[c].length;k++) h+=workLine(g.cols[c][k], s, mark, p);
          h+='</div>';
        }
        h+='</div>';
      } else {
        h+='<div class="wk-group"><div class="wk-sheet">';
        for(var j=0;j<(g.lines||[]).length;j++) h+=workLine(g.lines[j], s, mark, p);
        h+='</div></div>';
      }
    }
    if(s.done && p.workCheck){
      if(typeof p.workCheck==='string') h+='<div class="wk-check">'+p.workCheck+'</div>';
      else { h+='<div class="wk-check"><div class="wk-sheet">';
             for(var c=0;c<p.workCheck.length;c++) h+=workLine(p.workCheck[c], s, mark, p);
             h+='</div></div>'; }
    }
    return h;
  }

  function questionHtml(p, s){
    var i=pIndex(p.id);
    var h='<div class="qn">'+esc(p.num)+(s.done?'<span class="done-check">✓ Complete</span>':'')+'</div>'+
          '<div class="qp">'+esc(p.prompt)+'</div>';
    if(p.given && p.given.length){
      h+='<div class="surf-block"><div class="surf-label">What you know</div><div class="given-list">';
      for(var g=0;g<p.given.length;g++)
        h+='<div class="g-chip"><span class="g-val">'+esc(p.given[g].v)+'</span><span class="g-k">'+esc(p.given[g].k)+'</span></div>';
      h+='</div>';
      if(p.want) h+='<div class="g-want">Looking for: <strong>'+esc(p.want)+'</strong></div>';
      h+='</div>';
    }
    if(p.figure) h+='<div class="q-figure">'+p.figure+'</div>';
    for(var j=0;j<p.pipeline.length;j++) h+=renderStep(p, j);
    if(s.done){
      var left=0; for(var k=0;k<PROBLEMS.length;k++) if(!S[PROBLEMS[k].id].done) left++;
      h+='<div class="wk-done">';
      if(i<PROBLEMS.length-1) h+='<button class="btn btn-go" onclick="K.navTo('+(i+1)+')">Next problem →</button>';
      h+='<p class="wk-note">'+(left ? 'Check your paper against the suggested work before you move on.'
                                    : 'That is every problem. Check your paper against the suggested work.')+'</p></div>';
    }
    return h;
  }

  function refHtml(){
    var p=PROBLEMS[activeP], ref=(p && p.reference) || GLOBAL_REF;
    return '<div class="ref-pop-head"><span class="surf-label" style="margin:0">Formula Box</span>'+
           '<button type="button" class="ref-close" onclick="K.closeRef()" aria-label="Close the Formula Box">✕</button></div>'+
           (ref||'');
  }
  function syncRef(){
    var btn=document.getElementById('ckRefBtn'), pop=document.getElementById('ckRef'); if(!btn||!pop) return;
    var p=PROBLEMS[activeP], has=!!((p && p.reference) || GLOBAL_REF);
    btn.hidden=!has;
    if(refFor!==activeP){ pop.innerHTML=refHtml(); refFor=activeP; }
    pop.hidden=!(refOpen && has);
    btn.setAttribute('aria-expanded', (refOpen && has) ? 'true' : 'false');
  }
  function toggleRef(){ refOpen ? closeRef() : openRef(); }
  function openRef(){
    refOpen=true; syncRef();
    var c=document.querySelector('#ckRef .ref-close'); if(c && c.focus) c.focus();
  }
  function closeRef(){
    refOpen=false; syncRef();
    var b=document.getElementById('ckRefBtn'); if(b && b.focus) b.focus();
  }

  // a tap on a drop box uses the card picked on the right (tap a card, then tap the spot)
  var lastDrop=0;
  function dropAt(zone){
    if(Date.now()-lastDrop<350) return;              // the click that trails a finished drag
    var p=PROBLEMS[activeP], code=liveCode(p.id); if(code<0) return;
    var r=resolve(p.id, code);
    if(r.st.sel==null){ r.st.fb={t:'warn', m:'Pick a card on the right first, then tap here. Or drag the card here.'}; render(); return; }
    act(p.id, code, 'drop', {card:r.st.sel, zone:zone});
  }
  function dropCard(card, zone){
    var p=PROBLEMS[activeP], code=liveCode(p.id); if(code<0) return;
    lastDrop=Date.now();
    act(p.id, code, 'drop', {card:card, zone:zone});
  }
  // Drag a .dd-card (data-card) anywhere; let go over a [data-drop] box. Hit-testing by
  // bounding boxes, as in the proven label tool. Pointer events cover mouse, pen and touch.
  var dragWired=false;
  function wireDrag(){
    if(dragWired || typeof document==='undefined') return; dragWired=true;
    var d=null;
    function hit(x, y){
      var zs=document.querySelectorAll('[data-drop]');
      for(var i=0;i<zs.length;i++){ var b=zs[i].getBoundingClientRect();
        if(b.width && x>=b.left && x<=b.right && y>=b.top && y<=b.bottom) return zs[i]; }
      return null;
    }
    document.addEventListener('pointerdown', function(e){
      var c=e.target && e.target.closest ? e.target.closest('.dd-card') : null;
      if(!c || c.disabled) return;
      d={card:+c.getAttribute('data-card'), el:c, x:e.clientX, y:e.clientY, ghost:null, over:null};
    });
    document.addEventListener('pointermove', function(e){
      if(!d) return;
      if(!d.ghost){
        if(Math.abs(e.clientX-d.x)+Math.abs(e.clientY-d.y)<6) return;     // a tap, not a drag (yet)
        d.ghost=d.el.cloneNode(true); d.ghost.className='dd-card dd-ghost'; d.ghost.removeAttribute('onclick');
        document.body.appendChild(d.ghost); document.body.classList.add('dd-on');
      }
      d.ghost.style.left=e.clientX+'px'; d.ghost.style.top=e.clientY+'px';
      var z=hit(e.clientX, e.clientY);
      if(d.over && d.over!==z) d.over.classList.remove('dd-over');
      if(z) z.classList.add('dd-over'); d.over=z;
      if(e.cancelable) e.preventDefault();
    });
    function finish(e, cancel){
      if(!d) return; var g=d; d=null; document.body.classList.remove('dd-on');
      if(!g.ghost) return;                                                 // a tap: the card's own click selects it
      if(g.ghost.parentNode) g.ghost.parentNode.removeChild(g.ghost);
      if(g.over) g.over.classList.remove('dd-over');
      lastDrop=Date.now();
      var t = cancel ? null : (hit(e.clientX, e.clientY) || g.over);         // where it was let go
      if(t) dropCard(g.card, t.getAttribute('data-drop'));
    }
    document.addEventListener('pointerup', function(e){ finish(e, false); });
    document.addEventListener('pointercancel', function(e){ finish(e, true); });
  }

  function renderWork(){
    if(!ensureWorkShell()) return;
    wireDrag();
    var p=PROBLEMS[activeP], s=S[p.id];
    var q=document.getElementById('ckQ');
    document.getElementById('ckWork').innerHTML=workHtml(p, s);
    q.innerHTML=questionHtml(p, s);
    syncRef();
    renderDots();
    var liveEl=q.querySelector('.step.live');
    if(liveEl && liveEl.scrollIntoView) liveEl.scrollIntoView({block:'nearest'});
    mountLive();
  }

  function render(){
    if(LAYOUT==='split') return renderSplit();
    if(LAYOUT==='work') return renderWork();
    var m=document.getElementById('main'); if(!m) return; m.innerHTML='';
    for(var i=0;i<PROBLEMS.length;i++){
      var p=PROBLEMS[i], s=S[p.id], card=document.createElement('div');
      if(s.done){
        card.className='card done';
        var hd='<div class="qn">'+esc(p.num)+'<span class="done-check">\u2713 Complete</span></div>'+
               '<div class="qp">'+esc(p.prompt)+'</div>';
        for(var jd=0;jd<p.pipeline.length;jd++) hd+=renderStep(p, jd);
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
  function workBlock(step, st, t, label){
    var w = t.work ? t.work(step, st, {esc:esc})
                   : '<div class="work-answer">'+esc(t.summary?t.summary(step,st):'done')+'</div>';
    return '<div class="work-step"><div class="work-step-label">'+esc(label)+'</div>'+w+'</div>';
  }
  function showWork(pid){
    var p=pById(pid), s=S[pid];
    var head='<p class="work-prompt">'+esc(p.prompt)+'</p>';
    if(p.figure) head+='<div class="work-figure">'+p.figure+'</div>';
    head+='<div class="work-reminder">\u270D First, rewrite the problem on your paper \u2014 copy the figure and label its numbers. That copying IS the first part of showing your work.</div>';
    var body='', any=false;
    for(var j=0;j<p.pipeline.length && j<s.stepIdx; j++){
      var step=p.pipeline[j], st=s.steps[j], t=TOOLS[step.tool];
      if(st.exp){                                   // the ladder is the work for this step
        for(var k=0;k<step.sub.length;k++){
          var rs=step.sub[k], rt=TOOLS[rs.tool];
          body+=workBlock(rs, st.subs[k], rt, 'Step '+(j+1)+LETTERS[k]+(rs.label?(' \u2014 '+rs.label):''));
          any=true;
        }
      } else { body+=workBlock(step, st, t, step.label||('Step '+(j+1))); any=true; }
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
               toggleRef:toggleRef, openRef:openRef, closeRef:closeRef, _refOpen:function(){return refOpen;},
               dropAt:dropAt, dropCard:dropCard,
               _esc:esc, _djb2:djb2, _live:liveCode, _sub:subCode, _S:function(){return S;} };

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

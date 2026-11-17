/* ===================================================================
   DRAG TO THE PAPER — two tools for the work shell (engine v1.6.0)
   The cards sit in the question pane; the targets are on the student's
   paper (the suggested work). Drag a card over, or tap a card and then
   tap the spot. Every card says WHY when it is placed: the right card
   says why it fits, a wrong card says what it is and why it does not.

   MODEL — pick the model that fits, put it in its line of the work.
   step = { tool:'model', slot:'model', label, ask, dropText,
            cards:[ {t:'S = Ph + 2B', why:'…'}, … ],
            ch: djb2(right card's t) }
   The work has a line { slot:'model', at:[thisStep], … } that is a
   drop box while this step is live and the written line once it is done.

   LABELS — put each label on the sketch; one or two do not belong.
   step = { tool:'labels', slot:'sketch', label, ask,
            cards:[ {t:'l = 6 cm', ink:2, why:'…'}, … ],
            zones:[ {id:'l', accept: djb2('l = 6 cm')}, … ] }
   The work's sketch line carries the zone positions:
            { fig:{svg, vb:[w,h], zones:[{id, x, y, anchor, name}]}, slot:'sketch' }
   A card is right in the zone whose `accept` is its hash. A card no zone
   takes is a distractor: its why says what it is. Done when every zone
   holds its card. Answers are hashes; no plain mapping in the page.
   =================================================================== */
(function () {
  'use strict';

  function cardBtn(ref, step, st, i, extra){
    var c=step.cards[i], on=(st.sel===i);
    return '<button type="button" class="dd-card'+(on?' sel':'')+(c.ink?' ink-card ink-'+c.ink:'')+(extra||'')+'" data-card="'+i+'" '+
           'aria-pressed="'+(on?'true':'false')+'" onclick="K.act(\''+ref.p+'\','+ref.s+',\'select\','+i+')">'+ref.esc(c.t)+'</button>';
  }
  function order(step){                               // shuffle:true mixes the tray every visit
    var o=[]; for(var i=0;i<step.cards.length;i++) o.push(i);
    if(step.shuffle) for(var j=o.length-1;j>0;j--){ var k=Math.floor(Math.random()*(j+1)), t=o[j]; o[j]=o[k]; o[k]=t; }
    return o;
  }
  function howTo(word){
    return '<div class="dd-how">Drag '+word+' onto your paper. Or tap '+word+', then tap the spot.</div>';
  }

  K.tool('model', {
    limit: 3,
    state: function(step){ return {sel:null, drop:null, order:order(step)}; },
    render: function(step, st, ref){
      var h='';
      if(step.ask) h+='<div class="step-text">'+ref.esc(step.ask)+'</div>';
      h+=howTo('a model')+'<div class="dd-tray">';
      for(var i=0;i<st.order.length;i++) h+=cardBtn(ref, step, st, st.order[i]);
      return h+'</div>';
    },
    act: function(step, st, action, payload){
      if(action==='select'){ st.sel=(st.sel===payload ? null : payload); st.fb=null; return; }
      if(action==='drop'){ if(payload.zone!==step.slot) return; st.drop=payload.card; st.sel=null; return {check:true}; }
    },
    check: function(step, st, ctx){
      if(st.drop==null) return {fb:{t:'err', m:'Drag a model to your paper first.'}, tier:'soft'};
      var c=step.cards[st.drop];
      if(ctx.djb2(c.t)===step.ch) return {pass:true};
      return {fb:{t:'err', m:c.why, diag:true}};
    },
    summary: function(step, st){ return st.drop!=null ? step.cards[st.drop].t : ''; },
    entry: function(step, st){
      if(st.drop==null) return null;
      var c=step.cards[st.drop]; return c.t+(c.why ? ' — '+c.why : '');
    }
  });

  K.tool('labels', {
    limit: 4,
    state: function(step){ return {sel:null, placed:{}, last:null, order:order(step)}; },
    render: function(step, st, ref){
      var used={}, n=0, h='';
      for(var z in st.placed){ used[st.placed[z]]=true; n++; }
      if(step.ask) h+='<div class="step-text">'+ref.esc(step.ask)+'</div>';
      h+=howTo('a label')+'<div class="dd-tray">';
      for(var i=0;i<st.order.length;i++) if(!used[st.order[i]]) h+=cardBtn(ref, step, st, st.order[i]);
      h+='</div><div class="dd-count">'+n+' of '+step.zones.length+' labels on the sketch</div>';
      return h;
    },
    act: function(step, st, action, payload){
      if(action==='select'){ st.sel=(st.sel===payload ? null : payload); st.fb=null; return; }
      if(action==='drop'){
        var known=false; for(var j=0;j<step.zones.length;j++) if(step.zones[j].id===payload.zone) known=true;
        if(!known) return;
        st.last={card:payload.card, zone:payload.zone}; st.sel=null; return {check:true};
      }
    },
    check: function(step, st, ctx){
      var d=st.last; st.last=null;
      if(!d) return {fb:{t:'err', m:'Drag a label onto the sketch first.'}, tier:'soft'};
      var c=step.cards[d.card], zone=null;
      for(var j=0;j<step.zones.length;j++) if(step.zones[j].id===d.zone) zone=step.zones[j];
      if(zone && ctx.djb2(c.t)===zone.accept){
        st.placed[zone.id]=d.card;
        var all=true; for(var k=0;k<step.zones.length;k++) if(st.placed[step.zones[k].id]==null) all=false;
        if(all) return {pass:true};
        return {fb:{t:'ok', m:c.why}, tier:'soft', progress:true};
      }
      return {fb:{t:'err', m:c.why, diag:true}};
    },
    summary: function(step){ return step.zones.length+' labels on the sketch'; },
    entry: function(step, st){
      var out=[]; for(var k=0;k<step.zones.length;k++){ var i=st.placed[step.zones[k].id]; if(i!=null) out.push(step.cards[i].t); }
      return out.length ? out.join('  ·  ') : null;
    }
  });
})();

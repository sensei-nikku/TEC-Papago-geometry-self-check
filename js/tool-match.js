/* ===================================================================
   PRIMITIVE 5 — MATCH  (drag each item onto the target it matches)
   step = { tool:'match', prompt?,
            targets:[ {id, text, ch} ],     // ch = djb2 hash of the matching item's text
            items:[ {id, text} ] }          // chips; an item whose text-hash fits no target = distractor
   Pairing is hashed -> not readable in source. Complete when every target
   holds its correct item. Mount tool; reuses the Label drag/hit-test code.
   =================================================================== */
(function () {
  'use strict';

  function mountMatch(host, step, st, ctx){
    if(host.dataset.mounted==='1') return; host.dataset.mounted='1';
    var targets=step.targets||[], items=step.items||[];
    st.placed = st.placed || {};   // { itemId: targetId }

    function iById(id){for(var i=0;i<items.length;i++)if(items[i].id===id)return items[i];}
    function tById(id){for(var i=0;i<targets.length;i++)if(targets[i].id===id)return targets[i];}
    function matchesSome(it){for(var i=0;i<targets.length;i++)if(ctx.djb2(it.text)===targets[i].ch)return true;return false;}
    function complete(){for(var i=0;i<targets.length;i++){var f=false;for(var k in st.placed)if(st.placed[k]===targets[i].id)f=true;if(!f)return false;}return true;}

    var html='<div class="lab-prompt">'+ctx.esc(step.prompt||'Drag each item onto the one it matches.')+'</div>';
    html+='<div style="display:flex;flex-direction:column;gap:8px;margin-bottom:14px">';
    targets.forEach(function(t){
      html+='<div style="display:flex;align-items:center;gap:10px;border:1.5px solid var(--border);border-radius:8px;padding:8px 12px;background:var(--surface)">'+
        '<div style="flex:1;font-size:.9rem;color:var(--text)">'+ctx.esc(t.text)+'</div>'+
        '<div class="match-slot" data-tid="'+t.id+'" style="min-width:118px;min-height:34px;border:2px dashed var(--border);border-radius:20px;display:flex;align-items:center;justify-content:center;font-family:\'JetBrains Mono\',monospace;font-size:.85rem;color:var(--muted)"></div>'+
      '</div>';
    });
    html+='</div><div class="lab-tray">';
    items.forEach(function(it){ html+='<div class="lab-chip" data-iid="'+it.id+'" style="font-family:\'JetBrains Mono\',monospace">'+ctx.esc(it.text)+'</div>'; });
    html+='</div><div class="lab-fb"></div>';
    host.innerHTML=html;

    var fb=host.querySelector('.lab-fb');
    function slotEl(tid){return host.querySelector('.match-slot[data-tid="'+tid+'"]');}
    function chipEl(iid){return host.querySelector('.lab-chip[data-iid="'+iid+'"]');}
    function fill(iid,tid){var it=iById(iid),s=slotEl(tid);if(s){s.textContent=it.text;s.style.border='2px solid var(--ok)';s.style.color='var(--ok)';s.dataset.filled='1';}var c=chipEl(iid);if(c)c.classList.add('placed');}
    Object.keys(st.placed).forEach(function(iid){fill(iid,st.placed[iid]);});
    function showFb(cls,msg){fb.className='lab-fb show '+cls;fb.innerHTML=msg;}

    function startDrag(chip,e){
      if(chip.classList.contains('placed'))return;e.preventDefault();
      var it=iById(chip.dataset.iid);
      var ghost=document.createElement('div');ghost.className='lab-ghost';ghost.style.fontFamily="'JetBrains Mono',monospace";ghost.textContent=it.text;document.body.appendChild(ghost);
      var ip=(e.touches?e.touches[0]:e);ghost.style.left=ip.clientX+'px';ghost.style.top=ip.clientY+'px';chip.classList.add('dragging');
      function move(ev){var p=(ev.touches?ev.touches[0]:ev);ghost.style.left=p.clientX+'px';ghost.style.top=p.clientY+'px';
        var ss=host.querySelectorAll('.match-slot:not([data-filled])');for(var i=0;i<ss.length;i++){var r=ss[i].getBoundingClientRect();ss[i].style.borderColor=(p.clientX>=r.left&&p.clientX<=r.right&&p.clientY>=r.top&&p.clientY<=r.bottom)?'var(--accent)':'var(--border)';}}
      function up(ev){
        var p=(ev.changedTouches?ev.changedTouches[0]:ev);
        document.removeEventListener('pointermove',move);document.removeEventListener('pointerup',up);
        if(ghost.parentNode)ghost.parentNode.removeChild(ghost);chip.classList.remove('dragging');
        var ss=host.querySelectorAll('.match-slot:not([data-filled])'),hit=null;
        for(var i=0;i<ss.length;i++){var r=ss[i].getBoundingClientRect();ss[i].style.borderColor='var(--border)';if(p.clientX>=r.left&&p.clientX<=r.right&&p.clientY>=r.top&&p.clientY<=r.bottom)hit=ss[i];}
        if(!hit){ if(!matchesSome(it)) showFb('badger', step.badger||'That one doesn\u2019t match any of these \u2014 leave it in the tray.'); return; }
        var t=tById(hit.dataset.tid);
        if(ctx.djb2(it.text)===t.ch){ st.placed[it.id]=t.id; fill(it.id,t.id); fb.className='lab-fb'; fb.innerHTML='';
          if(complete()){showFb('','\u2713 All matched.');fb.style.background='var(--ok-lt)';fb.style.color='var(--ok)';fb.style.borderLeft='3px solid var(--ok)';fb.className='lab-fb show';setTimeout(function(){ctx.pass();},700);}
        } else if(!matchesSome(it)){ showFb('badger', step.badger||'That one doesn\u2019t match any of these \u2014 leave it in the tray.'); }
        else { showFb('nudge','Not the one this describes \u2014 check the slope and the intercept.'); }
      }
      document.addEventListener('pointermove',move);document.addEventListener('pointerup',up);
    }
    var cs=host.querySelectorAll('.lab-chip');for(var i=0;i<cs.length;i++){(function(ch){ch.addEventListener('pointerdown',function(e){startDrag(ch,e);});})(cs[i]);}
  }

  K.tool('match', {
    state: function(){ return { placed:{} }; },
    render: function(step, st, ref){ return '<div class="lab-wrap" id="match-'+ref.p+'-'+ref.s+'"></div>'; },
    mount: function(step, st, ctx){
      var host=document.getElementById('match-'+ctx.p+'-'+ctx.s); if(!host) return;
      mountMatch(host, step, st, ctx);
    },
    summary: function(){ return 'All matched'; }
  });

})();

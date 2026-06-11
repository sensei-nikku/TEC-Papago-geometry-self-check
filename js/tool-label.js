/* ===================================================================
   PRIMITIVE 3 — LABEL  (generic: drag labels onto a figure)
   Figure-agnostic. Knows nothing about triangles, squares, or trig.
   step = { tool:'label', figure:'<svg>...</svg>',
            zones:[ {id, x, y, accepts:[type...], ang?, nudge?, req?} ],   // x,y in % of figure box
            chips:[ {id, text, type, ang?} ],                              // type matched vs zone.accepts
            badger?:'msg', prompt?:'msg' }
   A chip is correct in any zone whose `accepts` includes chip.type.
   A chip whose type no zone accepts is a distractor -> badger.
   Complete when every required zone (req !== false) is filled.
   Drag/hit-test machinery is the proven pointer-event code from the
   triangle labeler, now fed generic zones/chips.
   =================================================================== */
(function () {
  'use strict';

  function mountFigure(host, step, st, ctx){
    if(host.dataset.mounted==='1') return; host.dataset.mounted='1';
    var zones=step.zones||[], chips=step.chips||[];
    st.placed = st.placed || {};   // { chipId: zoneId }

    function chipById(id){for(var i=0;i<chips.length;i++)if(chips[i].id===id)return chips[i];}
    function zoneById(id){for(var i=0;i<zones.length;i++)if(zones[i].id===id)return zones[i];}
    function accepts(z,c){return z&&c&&(z.accepts||[]).indexOf(c.type)>=0;}
    function anyAccepts(c){for(var i=0;i<zones.length;i++)if(accepts(zones[i],c))return true;return false;}
    function reqZones(){return zones.filter(function(z){return z.req!==false;});}
    function zoneFilled(zid){for(var cid in st.placed)if(st.placed[cid]===zid)return true;return false;}
    function complete(){var rz=reqZones();for(var i=0;i<rz.length;i++)if(!zoneFilled(rz[i].id))return false;return true;}

    var html='<div class="lab-prompt">'+ctx.esc(step.prompt||'Drag each label onto the right part of the figure.')+'</div>';
    html+='<div class="lab-stage">'+step.figure;
    zones.forEach(function(z){ html+='<div class="lab-zone'+(z.ang?' ang':'')+'" data-zid="'+z.id+'" style="left:'+z.x+'%;top:'+z.y+'%"></div>'; });
    html+='</div><div class="lab-tray">';
    chips.forEach(function(c){ html+='<div class="lab-chip'+(c.ang?' theta':'')+'" data-cid="'+c.id+'">'+ctx.esc(c.text)+'</div>'; });
    html+='</div><div class="lab-fb"></div>';
    host.innerHTML=html;

    var stage=host.querySelector('.lab-stage'), fb=host.querySelector('.lab-fb');
    function zEl(id){return stage.querySelector('.lab-zone[data-zid="'+id+'"]');}
    function cEl(id){return host.querySelector('.lab-chip[data-cid="'+id+'"]');}
    function fill(cid,zid){var z=zEl(zid),ch=cEl(cid),c=chipById(cid);if(z){z.classList.add('filled');z.textContent=c.text;}if(ch)ch.classList.add('placed');}
    Object.keys(st.placed).forEach(function(cid){fill(cid,st.placed[cid]);});
    function showFb(cls,msg){fb.className='lab-fb show '+cls;fb.innerHTML=msg;}

    function startDrag(chipEl,e){
      if(chipEl.classList.contains('placed'))return;e.preventDefault();
      var c=chipById(chipEl.dataset.cid);
      var ghost=document.createElement('div');ghost.className='lab-ghost'+(c.ang?' theta':'');ghost.textContent=c.text;document.body.appendChild(ghost);
      var ip=(e.touches?e.touches[0]:e);ghost.style.left=ip.clientX+'px';ghost.style.top=ip.clientY+'px';chipEl.classList.add('dragging');
      function move(ev){var p=(ev.touches?ev.touches[0]:ev);ghost.style.left=p.clientX+'px';ghost.style.top=p.clientY+'px';
        var zs=stage.querySelectorAll('.lab-zone:not(.filled)');for(var i=0;i<zs.length;i++){var r=zs[i].getBoundingClientRect();zs[i].classList.toggle('hot',p.clientX>=r.left&&p.clientX<=r.right&&p.clientY>=r.top&&p.clientY<=r.bottom);}}
      function up(ev){
        var p=(ev.changedTouches?ev.changedTouches[0]:ev);
        document.removeEventListener('pointermove',move);document.removeEventListener('pointerup',up);
        if(ghost.parentNode)ghost.parentNode.removeChild(ghost);chipEl.classList.remove('dragging');
        var zs=stage.querySelectorAll('.lab-zone:not(.filled)'),hit=null;
        for(var i=0;i<zs.length;i++){var r=zs[i].getBoundingClientRect();zs[i].classList.remove('hot');if(p.clientX>=r.left&&p.clientX<=r.right&&p.clientY>=r.top&&p.clientY<=r.bottom)hit=zs[i];}
        var sr=stage.getBoundingClientRect(),over=p.clientX>=sr.left-20&&p.clientX<=sr.right+20&&p.clientY>=sr.top-20&&p.clientY<=sr.bottom+20;
        // distractor: no zone in the whole figure accepts this chip
        if(!anyAccepts(c)){ if(over||hit)showFb('badger',step.badger||'That label doesn\u2019t belong on this figure \u2014 leave it in the tray.'); return; }
        if(!hit)return;
        var z=zoneById(hit.dataset.zid);
        if(accepts(z,c)){ st.placed[c.id]=z.id; fill(c.id,z.id); fb.className='lab-fb'; fb.innerHTML='';
          if(complete()){showFb('','\u2713 Figure labeled correctly.');fb.style.background='var(--ok-lt)';fb.style.color='var(--ok)';fb.style.borderLeft='3px solid var(--ok)';fb.className='lab-fb show';setTimeout(function(){ctx.pass();},700);}
        } else { showFb('nudge', z.nudge || 'Not there \u2014 that label belongs on a different part of the figure.'); }
      }
      document.addEventListener('pointermove',move);document.addEventListener('pointerup',up);
    }
    var cs=host.querySelectorAll('.lab-chip');for(var i=0;i<cs.length;i++){(function(ch){ch.addEventListener('pointerdown',function(e){startDrag(ch,e);});})(cs[i]);}
  }

  K.tool('label', {
    state: function(){ return { placed:{} }; },
    render: function(step, st, ref){ return '<div class="lab-wrap" id="lab-'+ref.p+'-'+ref.s+'"></div>'; },
    mount: function(step, st, ctx){
      var host=document.getElementById('lab-'+ctx.p+'-'+ctx.s); if(!host) return;
      mountFigure(host, step, st, ctx);
    },
    work: function(step, st, ctx){
      var h='<div class="lab-stage" style="max-width:300px;margin:0 auto">'+step.figure;
      (step.zones||[]).forEach(function(z){
        var cid=null; for(var k in (st.placed||{})) if(st.placed[k]===z.id) cid=k;
        if(cid){ var txt=''; (step.chips||[]).forEach(function(c){ if(c.id===cid) txt=c.text; });
          h+='<div class="lab-zone filled'+(z.ang?' ang':'')+'" style="left:'+z.x+'%;top:'+z.y+'%">'+ctx.esc(txt)+'</div>'; }
      });
      return h+'</div>';
    },
    summary: function(){ return 'Figure labeled'; }
  });

})();

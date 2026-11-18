/* Week 7 Lesson 3 checker (Surface Area of Pyramids and Cones: Slant Height), on the work shell
   with drag-to-the-paper (engine v1.6.0), like Week 7 Lesson 2: suggested work on parchment on the
   left, the question on the right, the f button for the Formula Box.
   Steps follow the sub-day packet:
     1, 3, 4  label the sketch (drag): the given numbers, l = ? when only h is given, S = ?
              (the decoys: the height labelled as l, the slant height labelled as h, d for r)
     2        drag the model in (closed or no bottom; the decoys use h, or fill instead of cover)
     5        given h? find l = sqrt(h^2 + r^2) (cone) or sqrt(h^2 + (s/2)^2) (pyramid);
              a diameter? 5a r from d = 2r; a pyramid: B (unless there is no floor) and P
     6        reiterate the formula, substitute, answer with the calculator in one go
   Coarse first: a miss opens the plan one move at a time. Nearest tenth passes within 0.1; whole
   numbers are exact. Every work line hangs one = per line, and each letter and its values share an
   ink. The build stops if a trap lands on its answer, options repeat, a work gate points nowhere,
   a line chains two relations, or an answer repeats a printed packet answer.
   Run: node build_w7l3.js  -> checkers/week7-lesson3-slant-height.html */
const fs=require('fs');
function djb2(s){var v=5381;for(var i=0;i<s.length;i++){v=((v<<5)+v)+s.charCodeAt(i);v=v&v;}return v>>>0;}
const DOT='·',PI_='π',SQ='²',HALF='(1/2)',ELL='ℓ',RT='√',THIRD='(1/3)';
const PI=Math.PI, TOL=0.1;
const f1=x=>(Math.floor(x*10+0.5)/10).toFixed(1);
const PIKEY='Use the '+PI_+' key, not 3.14. Type the whole line in one go.';

/* ---- step builders (as in Lesson 2) ---- */
function ch(label,ask,opts,i,nudge){
  if(new Set(opts).size!==opts.length) throw new Error(label+': duplicate options '+opts.join(' | '));
  return {tool:'choice',stack:true,label,ask,options:opts,ch:djb2(opts[i]),shuffle:true,nudges:[nudge]};}
function num(label,a,traps,nudge){
  const t=[];
  (traps||[]).forEach(([v,msg])=>{
    if(Math.abs(v-a)<=TOL){ if(msg!==PIKEY) throw new Error(label+': slip '+v+' passes as the answer '+a+' ('+msg+')'); return; }
    if(Math.abs(v-a)<=TOL+0.06) throw new Error(label+': trap '+v+' sits too close to the answer '+a+' ('+msg+')');
    if(t.some(u=>Math.abs(u.near-v)<0.12)) return;
    t.push({near:v,tol:0.06,msg});});
  return {tool:'numeric',label,answer:a,tol:TOL,closeBand:0.03,traps:t,nudges:[nudge]};}
function exact(label,a,traps,nudge){
  const t=[];
  (traps||[]).forEach(([v,msg])=>{
    if(Math.abs(v-a)<0.5) throw new Error(label+': trap '+v+' equals the answer '+a);
    if(t.some(u=>u.near===v)) return;
    t.push({near:v,tol:0.005,msg});});
  return {tool:'numeric',label,answer:a,tol:0.005,closeBand:0.02,traps:t,nudges:[nudge]};}
function coarse(step,ladder){return Object.assign(step,{sub:ladder});}

/* ---- suggested-work HTML ---- */
const INK={S:1,r:2,s:2,d:3,B:3,l:4,P:5,h:6};             // d (cones) and B (pyramids) never meet
const SHOW={l:ELL};
const V=x=>'<i class="ink-'+INK[x]+'">'+(SHOW[x]||x)+'</i>';
const N=(x,v)=>'<span class="ink-'+INK[x]+'">'+v+'</span>';
const S_=V('S'),P_=V('P'),B_=V('B'),h_=V('h'),r_=V('r'),s_=V('s'),d_=V('d'),l_=V('l');
const FR=(t,b)=>'<span class="fr"><span>'+t+'</span><span>'+b+'</span></span>';
const BOXED=v=>'<span class="wk-box">'+v+'</span>';
const ROOT=x=>RT+'('+x+')';

/* ---- sketches: no labels drawn; each zone is a spot for one label ---- */
function coneFig(hGiven,width){
  const W=310,H=165;
  return {vb:[W,H],
    svg:'<svg class="wk-sketch" viewBox="0 0 '+W+' '+H+'" width="'+W+'" height="'+H+'" role="img" aria-label="Sketch: a cone">'+
      '<g fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">'+
      '<path d="M100 16 L44 124 M100 16 L156 124"/>'+
      '<path d="M44 124 A56 13 0 0 0 156 124"/><path d="M44 124 A56 13 0 0 1 156 124" stroke-dasharray="4 5" opacity=".45"/>'+
      (width?'<path d="M44 124 H156" stroke-dasharray="5 4"/>':'<path d="M100 124 H156" stroke-dasharray="5 4"/>')+
      (hGiven?'<path d="M100 16 V124" stroke-dasharray="5 4"/><path d="M100 115 H109 V124" stroke-width="1.2"/>':'')+
      '</g><circle cx="100" cy="124" r="2.3" fill="currentColor"/></svg>',
    zones:[width?{id:'d',x:100,y:154,anchor:'middle',name:'across the bottom'}:{id:'r',x:128,y:154,anchor:'middle',name:'the radius'}]
      .concat(hGiven?[{id:'h',x:94,y:78,anchor:'end',name:'straight up the middle'}]:[])
      .concat([{id:'l',x:136,y:62,anchor:'start',name:'down the side'},{id:'S',x:212,y:100,anchor:'start',name:'beside the cone'}])};
}
function pyrFig(hGiven){
  const W=330,H=165;
  return {vb:[W,H],
    svg:'<svg class="wk-sketch" viewBox="0 0 '+W+' '+H+'" width="'+W+'" height="'+H+'" role="img" aria-label="Sketch: a square pyramid">'+
      '<g fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">'+
      '<path d="M50 132 H180 L222 100"/><path d="M140 16 L50 132 M140 16 L180 132 M140 16 L222 100"/>'+
      '<path d="M222 100 H92 L50 132 M140 16 L92 100" stroke-dasharray="4 5" opacity=".45"/>'+
      '<path d="M140 16 L115 132"/>'+
      (hGiven?'<path d="M140 16 V116 L115 132" stroke-dasharray="5 4"/>':'')+
      '</g></svg>',
    zones:[{id:'s',x:82,y:152,anchor:'middle',name:'the front edge of the base'}]
      .concat(hGiven?[{id:'h',x:147,y:72,anchor:'start',name:'straight up the middle'}]:[])
      .concat([{id:'l',x:118,y:66,anchor:'end',name:'down the middle of the front face'},{id:'S',x:240,y:70,anchor:'start',name:'beside the pyramid'}])};
}
function labelStep(cards){
  const zs={}; cards.forEach(c=>[].concat(c.z||[]).forEach(z=>{(zs[z]=zs[z]||[]).push(djb2(c.t));}));
  const zones=Object.keys(zs).map(id=>({id,accept:zs[id].length===1?zs[id][0]:zs[id]}));
  if(new Set(cards.map(c=>c.t)).size!==cards.length) throw new Error('duplicate label cards '+cards.map(c=>c.t).join(' | '));
  return {tool:'labels',slot:'sketch',shuffle:true,label:'Plan 1, 3, 4: Label your sketch',
    ask:'Put each label where it belongs on the sketch. Not every label belongs.',
    cards:cards.map(c=>{const o={t:c.t,why:c.why}; if(c.ink) o.ink=c.ink; return o;}),zones};
}
function modelStep(cards){
  if(new Set(cards.map(c=>c.t)).size!==cards.length) throw new Error('duplicate model cards');
  return {tool:'model',slot:'model',shuffle:true,label:'Plan 2: The model',ask:'Which model covers this solid?',dropText:'Drag the model here',
    cards:cards.map(c=>({t:c.t,why:c.why})),ch:djb2(cards[0].t)};
}
const CONE_S='S = '+PI_+'r'+SQ+' + '+PI_+'r'+ELL, CONE_SIDE='S = '+PI_+'r'+ELL, CONE_H='S = '+PI_+'r'+SQ+' + '+PI_+'rh', CONE_V='V = '+THIRD+PI_+'r'+SQ+'h';
const PYR_S='S = B + '+HALF+'P'+ELL, PYR_SIDE='S = '+HALF+'P'+ELL, PYR_H='S = B + '+HALF+'Ph', PYR_V='V = '+THIRD+'Bh';
function coneModels(side){
  const closed={t:CONE_S,why:side?'That adds the base circle, '+PI_+'r'+SQ+'. This one has no bottom: the side only.':'A cone with its bottom: the base circle ('+PI_+'r'+SQ+') plus the side ('+PI_+'r'+ELL+').'};
  const open={t:CONE_SIDE,why:side?'No bottom, so the side only: '+PI_+'r'+ELL+'.':'The side only covers a cone with no bottom. This cone has its base circle too.'};
  return [side?open:closed, side?closed:open,
    {t:CONE_H,why:'The side unrolls to '+PI_+'r'+ELL+': it uses the slant height '+ELL+', not h.'},
    {t:CONE_V,why:'V fills the cone, in cubic units. This problem covers it, in square units: S.'}];
}
function pyrModels(side){
  const closed={t:PYR_S,why:side?'That adds the base B. There is no floor: the sides only.':'A square pyramid: the base (B) plus the 4 triangle faces ('+HALF+'P'+ELL+').'};
  const open={t:PYR_SIDE,why:side?'No floor, so the 4 triangle faces only: '+HALF+'P'+ELL+'.':'The faces only cover a pyramid with no floor. This one has its base too.'};
  return [side?open:closed, side?closed:open,
    {t:PYR_H,why:'Each triangle face is '+HALF+' '+DOT+' s '+DOT+' '+ELL+': it uses the slant height '+ELL+', not h.'},
    {t:PYR_V,why:'V fills the pyramid, in cubic units. This problem covers it, in square units: S.'}];
}

/* the slant-height step (h given) with its ladder: the rule, under the root, the root */
function slantStep(kind,h,leg,legTxt,u){
  const a=Math.hypot(h,leg), inside=h*h+leg*leg;
  const rule=kind==='cone'?ELL+' = '+ROOT('h'+SQ+' + r'+SQ):ELL+' = '+ROOT('h'+SQ+' + (s/2)'+SQ);
  const opts=kind==='cone'?[rule,ELL+' = h + r',ELL+' = '+ROOT('h'+SQ+' − r'+SQ),ELL+' = h']:[rule,ELL+' = '+ROOT('h'+SQ+' + s'+SQ),ELL+' = h + s/2',ELL+' = h'];
  const traps=[[h+leg,ELL+' is not h + '+legTxt+'. Square, add, then take the square root.']];
  if(kind==='cone') traps.push([Math.sqrt(Math.abs(h*h-leg*leg)),'Add the squares. '+ELL+' is the longest side.']);
  else traps.push([Math.hypot(h,2*leg),'Use half the side: s/2 = '+leg+', not '+(2*leg)+'.']);
  traps.push([inside,'That is '+ELL+SQ+'. Take its square root.']);
  return coarse(num('Plan 5: You were given h. Find '+ELL+' first. '+ELL+' = ? (in '+u+')',a,traps,'h, '+legTxt+' and '+ELL+' make a right triangle. '+ELL+' is the longest side.'),
    [ch('Plan 5: The slant height rule','Which rule finds '+ELL+'?',opts,0,'Pythagorean theorem: '+ELL+SQ+' = h'+SQ+' + (the bottom leg)'+SQ+'. Undo the square with a square root.'),
     exact('Plan 5: Under the root: '+h+SQ+' + '+leg+SQ+' = ?',inside,[[h*h+2*leg,'Power first: '+leg+SQ+' is '+leg+' '+DOT+' '+leg+'.']],'Power first: '+h+SQ+' = '+h*h+' and '+leg+SQ+' = '+leg*leg+'. Then add.'),
     num('Plan 5: Take the square root. '+ELL+' = ?',a,[[inside,'That is '+ELL+SQ+'. Take its square root.']],'A square is undone by a square root.')]);
}
/* step 6: substitute (tap), then the answer */
function answerStep(subs,ans,traps,u,tenth){
  const ask=tenth?' (nearest tenth, in '+u+SQ+')':' (in '+u+SQ+')';
  const mk=lbl=>tenth?num(lbl,ans,traps,PIKEY):exact(lbl,ans,traps,'Type the whole line into the calculator in one go.');
  return coarse(mk('Plan 6: Substitute and answer. S = ?'+ask),
    [ch('Plan 6: Substitute','Put the numbers into the formula. Which is it?',subs,0,'Each number goes where its letter is.'),
     mk('Plan 6: Answer. Simplify with the calculator, one go. S = ?'+ask)]);
}
function slantLines(kind,h,leg,a,k){
  const legL=kind==='cone'?r_:'('+FR(s_,'2')+')', legN=kind==='cone'?N('r',leg):'('+FR(N('s',2*leg),'2')+')';
  return [{tag:'5',l:l_+SQ,r:'= '+h_+SQ+' + '+legL+SQ,at:[k,0]},
    {l:l_,r:'= '+RT+'('+h_+SQ+' + '+legL+SQ+')',note:'square root',at:[k,0]},
    {l:'',r:'= '+RT+'('+N('h',h)+SQ+' + '+legN+SQ+')',at:[k,1]},
    {l:'',r:'= '+N('l',a),at:[k]}];
}

/* ---- one cone problem ---- */
function coneProb(o){
  const {id,numLbl,prompt,given,r,u,side}=o, hv=o.h, lg=o.l, wd=o.d;
  const l=hv!=null?Math.hypot(hv,r):lg;
  const S=side?PI*r*l:PI*r*r+PI*r*l, aStr=f1(S);
  const traps=side?[[PI*r*r+PI*r*l,'No bottom: leave out the base circle, '+PI_+'r'+SQ+'.'],[3.14*r*l,PIKEY]]
                  :[[PI*r*l,'That is only the side. Add the base circle: '+PI_+'r'+SQ+'.'],[3.14*(r*r+r*l),PIKEY],[PI*r*r+PI*r*r*l,'The side is '+PI_+'r'+ELL+', not '+PI_+'r'+SQ+ELL+'.']];
  if(hv!=null) traps.push([side?PI*r*hv:PI*r*r+PI*r*hv,'You used h. Surface area uses the slant height '+ELL+'.']);
  if(wd) traps.push([side?PI*wd*l:PI*wd*wd+PI*wd*l,wd+' '+u+' is d, all the way across. r = d/2.']);
  const sub=(a,b)=>side?'S = '+PI_+'('+a+')('+b+')':'S = '+PI_+'('+a+SQ+') + '+PI_+'('+a+')('+b+')';
  const subs=[sub(r,l), sub(l,r)].concat(hv!=null?[sub(r,hv)]:[side?'S = '+PI_+'('+r+SQ+') + '+PI_+'('+r+')('+l+')':'S = '+PI_+'('+r+')('+l+')']);
  // labels
  const cards=[];
  if(wd){ cards.push({t:'d = '+wd+' '+u,ink:INK.d,z:'d',why:wd+' '+u+' goes all the way across the bottom: that is d.'},
                     {t:'r = '+wd+' '+u,ink:INK.r,why:wd+' '+u+' goes all the way across: that is d. r is half of it.'}); }
  else    cards.push({t:'r = '+r+' '+u,ink:INK.r,z:'r',why:'r is the radius: from the center of the base to its edge.'},
                     {t:'d = '+r+' '+u,ink:INK.d,why:r+' '+u+' is the radius, center to edge. d goes all the way across.'});
  if(hv!=null){ cards.push({t:'h = '+hv+' '+u,ink:INK.h,z:'h',why:'h goes straight up the middle, inside the cone.'},
                           {t:ELL+' = ?',ink:INK.l,z:'l',why:ELL+' runs down the outside, along the side. You find it in step 5.'},
                           {t:ELL+' = '+hv+' '+u,ink:INK.l,why:hv+' '+u+' goes straight up inside: that is h. '+ELL+' runs down the outside.'}); }
  else { cards.push({t:ELL+' = '+lg+' '+u,ink:INK.l,z:'l',why:'The slant height runs down the outside, along the side.'},
                    {t:'h = '+lg+' '+u,ink:INK.h,why:lg+' '+u+' is the slant height: it runs down the outside. h would go straight up inside.'}); }
  cards.push({t:'S = ?',ink:INK.S,z:'S',why:'S covers the whole cone, so it goes beside it, not on one line.'});
  const pipeline=[labelStep(cards), modelStep(coneModels(side))];
  const lines=[{tag:'2',slot:'model',l:S_,r:'= '+(side?PI_+r_+l_:PI_+r_+SQ+' + '+PI_+r_+l_),at:[1]}];
  if(wd){ const k=pipeline.length;
    pipeline.push(exact('Plan 5a: Find r. r = ? (in '+u+')',r,[[wd,wd+' '+u+' is d, all the way across. d = 2r, so r = d/2.'],[2*wd,'d = 2r: undo × 2 with × 1/2, not × 2.']],'Write d = 2r, then solve it for r.'));
    lines.push({tag:'5a',l:d_,r:'= 2'+r_,at:[k]},{l:FR(d_,'2'),r:'= '+r_,note:'× 1/2',at:[k]},{l:r_,r:'= '+FR(N('d',wd),'2'),at:[k]},{l:'',r:'= '+N('r',r),at:[k]}); }
  if(hv!=null){ const k=pipeline.length; pipeline.push(slantStep('cone',hv,r,'r',u)); lines.push(...slantLines('cone',hv,r,l,k)); }
  const k6=pipeline.length;
  pipeline.push(answerStep(subs,S,traps,u,true));
  lines.push({tag:'6',l:S_,r:'= '+(side?PI_+r_+l_:PI_+r_+SQ+' + '+PI_+r_+l_),at:[k6,0]},
    {l:'',r:'= '+(side?PI_+'('+N('r',r)+')('+N('l',l)+')':PI_+'('+N('r',r)+SQ+') + '+PI_+'('+N('r',r)+')('+N('l',l)+')'),at:[k6,0]},
    {l:'',r:'≈ '+BOXED(N('S',aStr+' '+u+SQ)),at:[k6]});
  const check=[{tag:'Check',l:l_,r:'= '+N('l',l)+': longer than '+(hv!=null?h_+' and ':'')+r_+' ✓'}];
  return {id,num:numLbl,prompt,given,want:side?'S, the side only, in '+u+SQ:'S, the surface area, in '+u+SQ,pipeline,
    work:[{lines:[{tag:'1, 3, 4',fig:coneFig(hv!=null,!!wd),slot:'sketch'}]},{lines}],workCheck:check,_ans:aStr};
}

/* ---- one square pyramid problem ---- */
function pyrProb(o){
  const {id,numLbl,prompt,given,s,u,side}=o, hv=o.h, lg=o.l;
  const l=hv!=null?Math.hypot(hv,s/2):lg, B=s*s, P=4*s, S=side?0.5*P*l:B+0.5*P*l;
  const traps=side?[[B+0.5*P*l,'No floor: leave out B.'],[P*l,'You left out the 1/2.']]
                  :[[0.5*P*l,'That is only the faces. Add the base B.'],[B+P*l,'You left out the 1/2.'],[P+0.5*P*l,'B is the area of the base, s'+SQ+', not 4s.']];
  if(hv!=null) traps.push([side?0.5*P*hv:B+0.5*P*hv,'You used h. Surface area uses the slant height '+ELL+'.']);
  const subs=side?['S = '+HALF+'('+P+')('+l+')','S = '+HALF+'('+B+')('+l+')','S = '+B+' + '+HALF+'('+P+')('+l+')']
                 :['S = '+B+' + '+HALF+'('+P+')('+l+')','S = '+P+' + '+HALF+'('+B+')('+l+')','S = '+B+' + '+HALF+'('+P+')('+(hv!=null?hv:s)+')'];
  const cards=[{t:'s = '+s+' '+u,ink:INK.s,z:'s',why:'s is a side of the square base: the front edge.'},
               {t:'s = '+(s/2)+' '+u,ink:INK.s,why:'The side is '+s+' '+u+'. Half of it, '+(s/2)+', is only for finding '+ELL+'.'}];
  if(hv!=null) cards.push({t:'h = '+hv+' '+u,ink:INK.h,z:'h',why:'h goes straight up the middle, inside the pyramid.'},
                          {t:ELL+' = ?',ink:INK.l,z:'l',why:ELL+' runs down the middle of a face. You find it in step 5.'},
                          {t:ELL+' = '+hv+' '+u,ink:INK.l,why:hv+' '+u+' goes straight up inside: that is h. '+ELL+' runs down the face.'});
  else cards.push({t:ELL+' = '+lg+' '+u,ink:INK.l,z:'l',why:'The slant height runs down the middle of a face.'},
                  {t:'h = '+lg+' '+u,ink:INK.h,why:lg+' '+u+' is the slant height, down the face. h would go straight up inside.'});
  cards.push({t:'S = ?',ink:INK.S,z:'S',why:'S covers the whole pyramid, so it goes beside it, not on one edge.'});
  const pipeline=[labelStep(cards), modelStep(pyrModels(side))];
  const lines=[{tag:'2',slot:'model',l:S_,r:'= '+(side?HALF+P_+l_:B_+' + '+HALF+P_+l_),at:[1]}];
  if(hv!=null){ const k=pipeline.length; pipeline.push(slantStep('pyr',hv,s/2,'half the side',u)); lines.push(...slantLines('pyr',hv,s/2,l,k).map((L,i)=>i===0?Object.assign(L,{tag:'5a'}):L)); }
  const tB=hv!=null?'5b':'5a';
  if(!side){ const k=pipeline.length;
    pipeline.push(exact('Plan '+tB+': Find B, the area of the base. B = ? (in '+u+SQ+')',B,[[P,'That is P, the distance around. B is the area: s'+SQ+'.'],[2*s,'s'+SQ+' is s '+DOT+' s, not 2s.']],'B is the area of the square base: B = s'+SQ+'.'));
    lines.push({tag:tB,l:B_,r:'= '+s_+SQ,at:[k]},{l:'',r:'= '+N('s',s)+SQ,at:[k]},{l:'',r:'= '+N('B',B),at:[k]}); }
  { const k=pipeline.length, tP=side?(hv!=null?'5b':'5a'):(hv!=null?'5c':'5b');
    pipeline.push(exact('Plan '+tP+': Find P, the distance around the base. P = ? (in '+u+')',P,(side?[]:[[B,'That is B, the area. P goes around: 4s.']]).concat([[2*s,'P goes all the way around: 4 sides, 4s.']]),'P is the distance around the square: P = 4s.'));
    lines.push({tag:tP,l:P_,r:'= 4'+s_,at:[k]},{l:'',r:'= 4('+N('s',s)+')',at:[k]},{l:'',r:'= '+N('P',P),at:[k]}); }
  const k6=pipeline.length, whole=Number.isInteger(S);
  pipeline.push(answerStep(subs,S,traps,u,!whole));
  lines.push({tag:'6',l:S_,r:'= '+(side?HALF+P_+l_:B_+' + '+HALF+P_+l_),at:[k6,0]},
    {l:'',r:'= '+(side?HALF+'('+N('P',P)+')('+N('l',l)+')':N('B',B)+' + '+HALF+'('+N('P',P)+')('+N('l',l)+')'),at:[k6,0]},
    {l:'',r:(whole?'= ':'≈ ')+BOXED(N('S',(whole?String(S):f1(S))+' '+u+SQ)),at:[k6]});
  const check=[{tag:'Check',l:l_,r:'= '+N('l',l)+': longer than '+(hv!=null?h_+' and ':'')+'half of '+s_+' ✓'}];
  return {id,num:numLbl,prompt,given,want:side?'S, the sides only, in '+u+SQ:'S, the surface area, in '+u+SQ,pipeline,
    work:[{lines:[{tag:'1, 3, 4',fig:pyrFig(hv!=null),slot:'sketch'}]},{lines}],workCheck:check,_ans:whole?String(S):f1(S)};
}

const P=[
 coneProb({id:'t1',numLbl:'T-1',r:4,l:10,u:'in',
   prompt:'A cone has a radius of 4 in and a slant height of 10 in. Find its surface area, to the nearest tenth.',
   given:[{v:'4 in',k:'the radius r'},{v:'10 in',k:'the slant height '+ELL}]}),
 pyrProb({id:'t2',numLbl:'T-2',s:8,l:6,u:'cm',
   prompt:'A square pyramid has a base 8 cm on each side. Its slant height is 6 cm. Find its surface area.',
   given:[{v:'8 cm',k:'each side s'},{v:'6 cm',k:'the slant height '+ELL}]}),
 coneProb({id:'t3',numLbl:'T-3',r:9,h:12,u:'m',
   prompt:'A cone has a radius of 9 m and a height of 12 m. Find its surface area, to the nearest tenth.',
   given:[{v:'9 m',k:'the radius r'},{v:'12 m',k:'the height h'}]}),
 pyrProb({id:'t4',numLbl:'T-4',s:12,h:8,u:'ft',
   prompt:'A square pyramid has a base 12 ft on each side. Its height is 8 ft. Find its surface area.',
   given:[{v:'12 ft',k:'each side s'},{v:'8 ft',k:'the height h'}]}),
 coneProb({id:'a1',numLbl:'A-1',r:6,d:12,l:14,u:'in',
   prompt:'A cone is 12 in across the bottom. Its slant height is 14 in. Find its surface area, to the nearest tenth.',
   given:[{v:'12 in across',k:'all the way across the bottom'},{v:'14 in',k:'the slant height '+ELL}]}),
 pyrProb({id:'a2',numLbl:'A-2',s:14,h:24,u:'m',
   prompt:'A square pyramid has a base 14 m on each side. Its height is 24 m. Find its surface area.',
   given:[{v:'14 m',k:'each side s'},{v:'24 m',k:'the height h'}]}),
 coneProb({id:'a3',numLbl:'A-3',r:3,h:4,u:'cm',side:true,
   prompt:'A paper cup is a cone with no top. Its radius is 3 cm and its height is 4 cm. How much paper does it take, to the nearest tenth?',
   given:[{v:'3 cm',k:'the radius r'},{v:'4 cm',k:'the height h'},{v:'no top',k:'no circle'}]}),
 pyrProb({id:'a4',numLbl:'A-4',s:6,h:4,u:'ft',side:true,
   prompt:'A tent is a square pyramid with no floor. Its base is 6 ft on each side and it is 4 ft tall. How much fabric does it take?',
   given:[{v:'6 ft',k:'each side s'},{v:'4 ft',k:'the height h'},{v:'no floor',k:'no base'}]})];

/* ---- build-time guards ---- */
const ANSWERS=P.map(p=>[p.id,p._ans]); P.forEach(p=>delete p._ans);
const TAKEN=['301.6','360','251.3','96','94.2','282.7','800','320','113.1','565.5','681.7','703.7','144','80'];   // the printed packet
ANSWERS.forEach(([id,a])=>{ if(TAKEN.includes(a)) throw new Error(id+': '+a+' is already a printed packet answer'); });
P.forEach(p=>{
  const walk=s=>{ if(s.tool==='numeric') s.traps.forEach(t=>{ if(Math.abs(t.near-s.answer)<=s.tol+t.tol) throw new Error(p.id+': trap '+t.near+' overlaps '+s.label); }); (s.sub||[]).forEach(walk); };
  p.pipeline.forEach(walk);
  p.work.forEach(g=>g.lines.map(L=>L.at).forEach(at=>{ if(!at) return; const st=p.pipeline[at[0]];
    if(!st) throw new Error(p.id+': work gate '+at+' has no step'); if(at.length>1 && !(st.sub && st.sub[at[1]])) throw new Error(p.id+': work gate '+at+' has no rung'); }));
  const zf=p.work[0].lines[0].fig.zones.map(z=>z.id).sort().join(), zl=p.pipeline[0].zones.map(z=>z.id).sort().join();
  if(zf!==zl) throw new Error(p.id+': sketch zones '+zf+' do not match label zones '+zl);
});
P.forEach(p=>p.work.concat([{lines:p.workCheck}]).forEach(g=>g.lines.forEach(L=>{
  if(L.r==null) return; const rel=(L.r.replace(/<[^>]*>/g,'').match(/[=≈]/g)||[]).length;
  if(rel!==1) throw new Error(p.id+': a work line chains '+rel+' relations: '+L.r); })));
const txt=JSON.stringify(P);
['subtract','divide'].forEach(wd=>{ if(new RegExp('\\b'+wd,'i').test(txt)) throw new Error('uses "'+wd+'"'); });

const REF='<div class="ref-row"><div class="ref-cell"><div class="rc-t">Cone</div><div class="rc-s" style="font-size:.85rem">S = '+PI_+'r'+SQ+' + '+PI_+'r'+ELL+'<br>no bottom: S = '+PI_+'r'+ELL+'</div></div>'+
 '<div class="ref-cell"><div class="rc-t">Square pyramid</div><div class="rc-s" style="font-size:.85rem">S = B + '+HALF+'P'+ELL+'<br>no floor: S = '+HALF+'P'+ELL+'</div></div></div>'+
 '<div class="ref-row" style="margin-top:8px"><div class="ref-cell"><div class="rc-t">Given h? Find '+ELL+'</div><div class="rc-s" style="font-size:.78rem">cone: '+ELL+' = '+RT+'(h'+SQ+' + r'+SQ+')<br>pyramid: '+ELL+' = '+RT+'(h'+SQ+' + (s/2)'+SQ+')</div></div>'+
 '<div class="ref-cell"><div class="rc-t">A square base</div><div class="rc-s" style="font-size:.78rem">B = s'+SQ+' (area)<br>P = 4s (around) &nbsp;'+DOT+'&nbsp; d = 2r</div></div></div>'+
 '<div class="ref-note">h goes straight up inside; '+ELL+' runs down the outside. Surface area uses '+ELL+'. The Plan: 1 read and sketch '+DOT+' 2 write the formula '+DOT+
 ' 3 name the unknown '+DOT+' 4 facts as math '+DOT+' 5 find what is missing ('+ELL+', r, B, P) '+DOT+' 6 reiterate, substitute, answer: the calculator once. Textbook: 8.1 (Pythagorean theorem), 11.5 (volumes of pyramids and cones).</div>';

const page=`<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Week 7, Lesson 3 — Surface Area: Pyramids and Cones Checker</title>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&family=Kalam:wght@400;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../assets/styles.css">
</head>
<body>
<header class="hdr">
  <div class="hdr-left"><a class="hdr-back" href="../index.html">&larr; All Checkers</a><h1>Surface Area: Pyramids and Cones</h1><div class="sub">Week 7 · Lesson 3 — Learning Lab</div></div>
  <div class="hdr-dots" id="hdrDots"></div>
</header>
<main class="main wide" id="main"><noscript><p>This checker needs JavaScript. Work the packet on paper and check with the key on page 8.</p></noscript></main>

<script src="../js/checker-kit.js"></script>
<script src="../js/tool-drag.js"></script>
<script>
/* Week 7 Lesson 3 Learning Lab (sub day). Work shell: suggested work on parchment on the left
   fills in as each step is checked; the question is on the right; the f button opens the Formula
   Box. Label the sketch, drag in the model, find l (and r, B, P), then substitute and answer.
   A miss opens the plan one move at a time. Nearest tenth (tol 0.1). Choice answers are djb2 hashes. */
K.run(${JSON.stringify(P,null,1)}, { layout:'work', reference:${JSON.stringify(REF)} });
</script>
</body>
</html>
`;
fs.writeFileSync('checkers/week7-lesson3-slant-height.html',page);
console.log('ok',page.length,JSON.stringify(ANSWERS));

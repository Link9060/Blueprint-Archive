/* Blueprint Archive / Motion Lab
 * Native scroll-linked depth, deterministic canvas field and pointer responses.
 * No scroll-jacking, imported graphics libraries or network requests.
 */
(() => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const coarsePointer = window.matchMedia('(hover: none), (pointer: coarse)');
  const root = document.documentElement;
  const stage = document.getElementById('archive-stage');
  const hero = document.getElementById('entry');
  const bridge = document.getElementById('lab-bridge');
  const ribbon = document.querySelector('.lab-ribbon');
  const floors = Array.from(document.querySelectorAll('.floor.observed,.studio.observed'));
  const header = document.querySelector('.header');
  const cursor = document.getElementById('lab-cursor');
  const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
  const lerp = (a, b, t) => a + (b - a) * t;
  const set = (element, property, value) => element && element.style.setProperty(property, value);

  // CSS variables are updated on one animation frame per scroll, not per wheel event.
  let scrollQueued = false;
  function onScrollFrame() {
    scrollQueued = false;
    const scrollTop = window.scrollY || document.documentElement.scrollTop || 0;
    const height = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    set(root, '--lab-scroll', (scrollTop / height).toFixed(4));
    header?.classList.toggle('is-scrolled', scrollTop > 24);

    if (reduceMotion.matches) return;
    const heroH = Math.max(1, hero?.offsetHeight || window.innerHeight);
    const hp = clamp(scrollTop / heroH);
    set(root, '--lab-hero-progress', hp.toFixed(3));
    set(root, '--lab-hero-y', (-hp*65).toFixed(1)+'px');
    set(root, '--lab-hero-copy-y', (-hp*70).toFixed(1)+'px');
    set(root, '--lab-hero-line-scale', (.05+hp*.95).toFixed(3));
    set(root, '--lab-shaft-y', (hp*105).toFixed(1)+'px');
    set(root, '--lab-hero-mobile-y', (hp*65).toFixed(1)+'px');

    if (bridge) {
      const r = bridge.getBoundingClientRect();
      const scrollable = Math.max(1, r.height - window.innerHeight);
      const p = clamp(-r.top / scrollable);
      set(root, '--lab-bridge-progress', p.toFixed(4));
      set(root, '--lab-grid-scale', (1.05+p*.44).toFixed(3));
      set(root, '--lab-grid-y', (-p*8).toFixed(1)+'%');
      set(root, '--lab-grid-opacity', (.5+p*.36).toFixed(3));
      set(root, '--lab-orbit-scale', (.62+p*1.17).toFixed(3));
      set(root, '--lab-orbit-degrees', (p*90).toFixed(1)+'deg');
      set(root, '--lab-orbit-opacity', (.25+p*.5).toFixed(3));
      set(root, '--lab-bridge-copy-y', ((.5-p)*130).toFixed(1)+'px');
      set(root, '--lab-bridge-copy-scale', (.81+p*.23).toFixed(3));
      set(root, '--lab-bridge-copy-alpha', Math.min(1,.3+p*1.15).toFixed(3));
    }

    for (const floor of floors) {
      const r = floor.getBoundingClientRect();
      if (r.bottom < -100 || r.top > window.innerHeight + 100) continue;
      const p = clamp((window.innerHeight - r.top) / (window.innerHeight + r.height));
      set(floor, '--lab-scene-progress', p.toFixed(4));
      set(floor, '--lab-scene-y', ((.5-p)*165).toFixed(1)+'px');
      set(floor, '--lab-scene-line-scale', (.2+p*.8).toFixed(3));
      set(floor, '--lab-card-y', ((.5-p)*28).toFixed(1)+'px');
      set(floor, '--lab-visual-y', ((.5-p)*13).toFixed(1)+'px');
      set(floor, '--lab-cafe-scale', (.98+p*.06).toFixed(3));
    }
    if (ribbon) {
      const r = ribbon.getBoundingClientRect();
      if (r.bottom > -100 && r.top < window.innerHeight + 100) {
        const p = clamp((window.innerHeight - r.top) / (window.innerHeight + r.height));
        set(ribbon, '--lab-ribbon-progress', p.toFixed(4));
        set(ribbon, '--lab-ribbon-shift', (-p*31).toFixed(1)+'vw');
      }
    }
  }
  function requestScrollFrame() {
    if (!scrollQueued) {
      scrollQueued = true;
      window.requestAnimationFrame(onScrollFrame);
    }
  }
  window.addEventListener('scroll', requestScrollFrame, { passive: true });
  window.addEventListener('resize', requestScrollFrame, { passive: true });
  requestScrollFrame();

  // Small circular pointer indicator. Does not replace native cursor or focus styles.
  if (cursor && !coarsePointer.matches && !reduceMotion.matches) {
    const interactive = 'a,button,.template-card,.showcase,.interface-visual,.cafe-visual';
    window.addEventListener('pointermove', event => {
      if (event.pointerType === 'touch') return;
      set(cursor, 'left', event.clientX + 'px');
      set(cursor, 'top', event.clientY + 'px');
      cursor.classList.add('is-visible');
      cursor.classList.toggle('is-active', Boolean(event.target.closest(interactive)));
      const x = clamp(event.clientX / Math.max(1, window.innerWidth));
      const y = clamp(event.clientY / Math.max(1, window.innerHeight));
      set(root, '--lab-mouse-x', x.toFixed(3));
      set(root, '--lab-mouse-y', y.toFixed(3));
      set(root, '--lab-shaft-rotate-y', ((x-.5)*-9).toFixed(2)+'deg');
      set(root, '--lab-shaft-rotate-x', ((y-.5)*6).toFixed(2)+'deg');
    }, { passive: true });
    document.addEventListener('pointerout', event => {
      if (!event.relatedTarget) cursor.classList.remove('is-visible');
    }, { passive: true });
    window.addEventListener('blur', () => cursor.classList.remove('is-visible'));
  }

  // Local pointer lighting/depth on large visual previews. Only track active elements.
  if (!coarsePointer.matches && !reduceMotion.matches) {
    const cards = document.querySelectorAll('.interface-visual,.cafe-visual,.template-preview');
    for (const card of cards) {
      card.addEventListener('pointermove', e => {
        const rect = card.getBoundingClientRect();
        const x = clamp((e.clientX - rect.left) / Math.max(1,rect.width));
        const y = clamp((e.clientY - rect.top) / Math.max(1,rect.height));
        set(card, '--lab-pointer-x', x.toFixed(3));
        set(card, '--lab-pointer-y', y.toFixed(3));
        set(card, '--lab-sheen-x', ((x-.5)*45).toFixed(1)+'px');
        set(card, '--lab-tilt-y', ((x-.5)*-6).toFixed(2)+'deg');
        set(card, '--lab-tilt-x', ((y-.5)*5).toFixed(2)+'deg');
        set(card, '--lab-tilt-y-hover', ((x-.5)*-8).toFixed(2)+'deg');
        set(card, '--lab-tilt-x-hover', ((y-.5)*6).toFixed(2)+'deg');
        set(card, '--lab-cafe-tilt', ((x-.5)*8).toFixed(2)+'deg');
        set(card, '--lab-pointer-shift-x', ((x-.5)*-16).toFixed(1)+'px');
        set(card, '--lab-pointer-shift-y', ((y-.5)*-16).toFixed(1)+'px');
      }, { passive: true });
      card.addEventListener('pointerleave', () => {
        set(card, '--lab-pointer-x', '.5');
        set(card, '--lab-pointer-y', '.5');
        for(const property of ['--lab-sheen-x','--lab-tilt-y','--lab-tilt-x','--lab-tilt-y-hover','--lab-tilt-x-hover','--lab-cafe-tilt','--lab-pointer-shift-x','--lab-pointer-shift-y']){
          card.style.removeProperty(property);
        }
      });
    }

    const magnets = document.querySelectorAll('.hero-actions .button,.hero-actions .text-action,.header-action,.brief-button');
    for (const target of magnets) {
      target.classList.add('press-magnet');
      target.addEventListener('pointermove', e => {
        const r = target.getBoundingClientRect();
        const x = clamp((e.clientX-r.left)/Math.max(1,r.width));
        const y = clamp((e.clientY-r.top)/Math.max(1,r.height));
        const dx = (x-.5)*11, dy = (y-.5)*8;
        set(target, '--lab-magnet-x', dx.toFixed(1)+'px');
        set(target, '--lab-magnet-y', dy.toFixed(1)+'px');
        set(target, '--lab-pointer-x', (x*100).toFixed(1)+'%');
        set(target, '--lab-pointer-y', (y*100).toFixed(1)+'%');
        set(target, '--lab-pointer-x-pct', (x*100).toFixed(1)+'%');
        set(target, '--lab-pointer-y-pct', (y*100).toFixed(1)+'%');
      }, { passive: true });
      target.addEventListener('pointerleave', () => {
        set(target, '--lab-magnet-x', '0px');
        set(target, '--lab-magnet-y', '0px');
      });
    }
  }

  // An understated depth-field texture drawn natively on a 2D canvas.
  // The field pauses outside the intro/bridge, when the tab is hidden,
  // and for reduced-motion users. Canvas resolution is capped deliberately.
  if (!stage || !stage.getContext || reduceMotion.matches) return;
  const ctx = stage.getContext('2d', { alpha: true });
  if (!ctx) return;
  const narrow = window.matchMedia('(max-width: 700px)');
  let width = 0, height = 0, scale = 1, points = [], raf = 0, lastTime = 0;
  let pointer = { x: .5, y: .5 }, smooth = { x: .5, y: .5 };
  let visibleHero = true, visibleBridge = false;
  const rand = (seed) => {
    const x = Math.sin(seed * 127.1 + 78.233) * 43758.5453123;
    return x - Math.floor(x);
  };
  function resizeCanvas() {
    width = Math.min(window.innerWidth, 1800);
    height = Math.min(window.innerHeight, 1050);
    scale = Math.min(window.devicePixelRatio || 1, 1.5);
    stage.width = Math.round(width * scale);
    stage.height = Math.round(height * scale);
    ctx.setTransform(scale,0,0,scale,0,0);
    const count = narrow.matches ? 27 : 64;
    points = Array.from({length:count}, (_,i) => ({
      x:rand(i+2)*width, y:rand(i+91)*height,
      r:rand(i+52)*1.15+.3, depth:rand(i+171),
      speed:rand(i+4)*.3+.08, offset:rand(i+38)*6.28
    }));
  }
  function draw(time) {
    raf = 0;
    if (document.hidden || reduceMotion.matches || (!visibleHero && !visibleBridge)) return;
    if (time-lastTime < 32) { raf = requestAnimationFrame(draw); return; }
    lastTime = time;
    ctx.clearRect(0,0,width,height);
    smooth.x = lerp(smooth.x,pointer.x,.065);
    smooth.y = lerp(smooth.y,pointer.y,.065);
    const t = time*.00024;
    const alpha = narrow.matches ? .38 : .64;
    const px = (smooth.x-.5)*45, py = (smooth.y-.5)*25;

    // Deliberately sparse geometry; legibility outranks spectacle.
    ctx.lineWidth = .7;
    for(let i=0;i<points.length;i++) {
      const p=points[i];
      const nx=p.x+px*p.depth + Math.sin(t*.8+p.offset)*9*p.depth;
      const ny=(p.y + t*110*p.speed)%height + py*p.depth;
      ctx.fillStyle='rgba(223,235,223,'+(alpha*(.18+p.depth*.5))+')';
      ctx.beginPath();ctx.arc(nx,ny,p.r,0,Math.PI*2);ctx.fill();
      if(i%4===0 && i+1<points.length) {
        const next=points[i+1], tx=next.x+px*next.depth,ty=(next.y+t*110*next.speed)%height+py*next.depth;
        if(Math.hypot(tx-nx,ty-ny)<240) {
          ctx.strokeStyle='rgba(185,209,188,'+(alpha*.085)+')';
          ctx.beginPath();ctx.moveTo(nx,ny);ctx.lineTo(tx,ty);ctx.stroke();
        }
      }
    }
    ctx.strokeStyle='rgba(183,203,183,'+(alpha*.13)+')';
    const horizonY=height*.59+py*.2;
    ctx.beginPath();ctx.moveTo(0,horizonY);
    ctx.bezierCurveTo(width*.34,horizonY-34+Math.sin(t)*15,width*.67,horizonY+60,width,horizonY-24);
    ctx.stroke();
    raf=requestAnimationFrame(draw);
  }
  function updateActiveCanvas() {
    stage.style.opacity=(visibleHero||visibleBridge)?'.78':'0';
    if(!raf && !document.hidden && (visibleHero || visibleBridge)) raf=requestAnimationFrame(draw);
    if(!visibleHero && !visibleBridge && raf){cancelAnimationFrame(raf);raf=0;}
  }
  if ('IntersectionObserver' in window) {
    const observer=new IntersectionObserver(entries => {
      for(const entry of entries) {
        if(entry.target===hero)visibleHero=entry.isIntersecting;
        if(entry.target===bridge)visibleBridge=entry.isIntersecting;
      }
      updateActiveCanvas();
    }, {threshold:0});
    if(hero)observer.observe(hero);
    if(bridge)observer.observe(bridge);
  }
  window.addEventListener('pointermove',event => {
    pointer.x=clamp(event.clientX/Math.max(1,window.innerWidth));
    pointer.y=clamp(event.clientY/Math.max(1,window.innerHeight));
  }, {passive:true});
  window.addEventListener('resize',()=>{resizeCanvas();updateActiveCanvas();},{passive:true});
  document.addEventListener('visibilitychange',updateActiveCanvas);
  reduceMotion.addEventListener?.('change',updateActiveCanvas);
  resizeCanvas();updateActiveCanvas();
})();

/* =========================================================
   KASWA — site script
   Edit WHATSAPP_NUMBER and the SCENTS list below.
   ========================================================= */

// Your WhatsApp number with country code, digits only (e.g. '919876543210').
// Left empty, the order buttons open WhatsApp and let the customer pick a chat.
const WHATSAPP_NUMBER = '';
const INSTAGRAM_URL = 'https://instagram.com/kaswa_perfume';

const SCENTS = [
  { id: 'royal-oud',  name: 'Royal Oud',  img: 'images/labels/royal-oud.jpg',  color: '#c9a24e', tint: 'rgba(201,162,78,0.20)',  family: ['Woody', 'Oriental'] },
  { id: 'white-musk', name: 'White Musk', img: 'images/labels/white-musk.png', color: '#e9e0c8', tint: 'rgba(233,224,200,0.13)', family: ['Musky', 'Soft'] },
  { id: 'blue-ice',   name: 'Blue Ice',   img: 'images/labels/blue-ice.png',   color: '#2a9be0', tint: 'rgba(42,155,224,0.20)',  family: ['Fresh', 'Aquatic'] },
  { id: 'cool-water', name: 'Cool Water', img: 'images/labels/cool-water.png', color: '#2c4f8f', tint: 'rgba(44,79,143,0.28)',   family: ['Fresh', 'Aquatic'] },
  { id: 'fitrat',     name: 'Fitrat',     img: 'images/labels/fitrat.png',     color: '#dccf95', tint: 'rgba(220,207,149,0.16)', family: ['Musky', 'Natural'] },
  { id: 'guava',      name: 'Guava',      img: 'images/labels/guava.png',      color: '#9a2c45', tint: 'rgba(154,44,69,0.28)',   family: ['Fruity', 'Sweet'] },
];

const waLink = (msg) => `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

/* ---------- Product cards ---------- */
function scentCard(s) {
  return `
    <article class="scent" style="--c:${s.color}" data-tint="${s.tint}" data-family="${s.family.join(' ').toLowerCase()}">
      <div class="scent__card" data-cursor="Order">
        <img src="${s.img}" alt="Kaswa ${s.name} label" loading="lazy">
      </div>
      <div class="scent__meta"><h3>${s.name}</h3><span>Extrait · 50ml</span></div>
      <div class="scent__family">${s.family.map((f) => `<em>${f}</em>`).join('')}</div>
      <a class="scent__order" href="${waLink(`Hi Kaswa, I'd like to order ${s.name} (50ml).`)}" target="_blank" rel="noopener">Order on WhatsApp</a>
    </article>`;
}

function renderScents() {
  $$('[data-scents]').forEach((el) => {
    el.insertAdjacentHTML('afterbegin', SCENTS.map(scentCard).join(''));
  });
  $$('[data-wa]').forEach((a) => {
    a.href = waLink(a.dataset.wa || "Hi Kaswa, I'd like to know more about your perfumes.");
    a.target = '_blank';
    a.rel = 'noopener';
  });
  $$('[data-ig]').forEach((a) => { a.href = INSTAGRAM_URL; a.target = '_blank'; a.rel = 'noopener'; });
  $$('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });
}

/* ---------- Split headings into masked words ---------- */
function splitWords(el) {
  let i = 0;
  const wrap = (text, parentTag) => {
    const frag = document.createDocumentFragment();
    text.split(/(\s+)/).forEach((part) => {
      if (!part) return;
      if (/^\s+$/.test(part)) { frag.append(' '); return; }
      const w = document.createElement('span');
      w.className = 'w';
      const inner = document.createElement(parentTag || 'span');
      inner.textContent = part;
      inner.style.setProperty('--i', i++);
      w.append(inner);
      frag.append(w);
    });
    return frag;
  };
  [...el.childNodes].forEach((n) => {
    if (n.nodeType === 3) n.replaceWith(wrap(n.textContent));
    else if (n.nodeName === 'BR') return;
    else n.replaceWith(wrap(n.textContent, n.nodeName.toLowerCase()));
  });
}

/* ---------- Reveal on scroll ---------- */
function initReveals() {
  $$('.split').forEach(splitWords);
  // A clip-path of inset(100%) hides an element from IntersectionObserver,
  // so .clip elements are watched through their parent instead.
  const targets = new Map();
  $$('.reveal, .split, .clip').forEach((el) => {
    const watch = el.classList.contains('clip') ? el.parentElement : el;
    if (!targets.has(watch)) targets.set(watch, []);
    targets.get(watch).push(el);
  });
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      targets.get(e.target).forEach((el) => el.classList.add('in'));
      io.unobserve(e.target);
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
  targets.forEach((_, watch) => io.observe(watch));
}

/* ---------- Preloader ---------- */
function initLoader() {
  const loader = $('.loader');
  if (!loader) { document.documentElement.classList.remove('lock'); return Promise.resolve(); }
  let seen = false;
  try { seen = sessionStorage.getItem('kaswa-intro') === '1'; } catch (e) {}
  const duration = seen || reduceMotion ? 350 : 1900;
  const fill = $('.loader__fill', loader);
  const count = $('.loader__count', loader);
  const start = performance.now();

  return new Promise((resolve) => {
    const tick = (now) => {
      const t = clamp((now - start) / duration, 0, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      const p = Math.round(eased * 100);
      fill.style.setProperty('--p', p + '%');
      count.textContent = String(p).padStart(3, '0');
      if (t < 1) return requestAnimationFrame(tick);
      loader.classList.add('done');
      document.documentElement.classList.remove('lock');
      try { sessionStorage.setItem('kaswa-intro', '1'); } catch (e) {}
      setTimeout(resolve, 450);
      setTimeout(() => loader.remove(), 1800);
    };
    requestAnimationFrame(tick);
  });
}

/* ---------- Custom cursor ---------- */
function initCursor() {
  if (!finePointer) return;
  const ring = document.createElement('div');
  ring.className = 'cursor';
  ring.innerHTML = '<span></span>';
  const dot = document.createElement('div');
  dot.className = 'cursor-dot';
  document.body.append(ring, dot);
  const label = ring.firstChild;

  let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
  addEventListener('mousemove', (e) => {
    mx = e.clientX; my = e.clientY;
    dot.style.transform = `translate(${mx}px, ${my}px)`;
  });
  (function loop() {
    rx += (mx - rx) * 0.16; ry += (my - ry) * 0.16;
    ring.style.transform = `translate(${rx}px, ${ry}px)`;
    requestAnimationFrame(loop);
  })();

  document.addEventListener('mouseover', (e) => {
    const view = e.target.closest('[data-cursor]');
    const link = e.target.closest('a, button');
    ring.classList.toggle('view', !!view);
    ring.classList.toggle('hover', !view && !!link);
    label.textContent = view ? view.dataset.cursor : '';
  });
  document.addEventListener('mouseleave', () => { ring.style.opacity = dot.style.opacity = 0; });
  document.addEventListener('mouseenter', () => { ring.style.opacity = dot.style.opacity = 1; });
}

/* ---------- Magnetic buttons ---------- */
function initMagnetic() {
  if (!finePointer || reduceMotion) return;
  $$('[data-magnetic]').forEach((el) => {
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      el.style.transform = `translate(${x * 0.25}px, ${y * 0.35}px)`;
    });
    el.addEventListener('mouseleave', () => {
      el.style.transition = 'transform .7s cubic-bezier(.22,1,.36,1), color .5s';
      el.style.transform = '';
      setTimeout(() => { el.style.transition = ''; }, 700);
    });
  });
}

/* ---------- 3D tilt on label cards ---------- */
function initTilt() {
  if (!finePointer || reduceMotion) return;
  document.addEventListener('mousemove', (e) => {
    const card = e.target.closest('.scent__card');
    if (!card) return;
    const r = card.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    card.style.transition = 'box-shadow .6s';
    card.style.setProperty('--ry', `${(px - 0.5) * 16}deg`);
    card.style.setProperty('--rx', `${(0.5 - py) * 16}deg`);
    card.style.setProperty('--gx', `${px * 100}%`);
    card.style.setProperty('--gy', `${py * 100}%`);
  });
  document.addEventListener('mouseout', (e) => {
    const card = e.target.closest('.scent__card');
    if (!card || card.contains(e.relatedTarget)) return;
    card.style.transition = '';
    card.style.setProperty('--rx', '0deg');
    card.style.setProperty('--ry', '0deg');
  });
  // Clicking a card opens the WhatsApp order
  document.addEventListener('click', (e) => {
    const card = e.target.closest('.scent__card');
    if (card) $('.scent__order', card.parentElement).click();
  });
}

/* ---------- Nav: shrink, hide on scroll down, mobile menu ---------- */
function initNav() {
  const nav = $('.nav');
  let last = scrollY;
  const onScroll = () => {
    const y = scrollY;
    nav.classList.toggle('scrolled', y > 40);
    if (!document.body.classList.contains('menu-open')) nav.classList.toggle('hide', y > last && y > 500);
    last = y;
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const burger = $('.burger');
  burger?.addEventListener('click', () => {
    const open = document.body.classList.toggle('menu-open');
    burger.setAttribute('aria-expanded', open);
    document.documentElement.classList.toggle('lock', open);
  });
  $$('.menu a').forEach((a) => a.addEventListener('click', () => {
    document.body.classList.remove('menu-open');
    document.documentElement.classList.remove('lock');
  }));
}

/* ---------- Hero: floating gold dust ---------- */
function initDust() {
  const canvas = $('.hero__canvas');
  if (!canvas || reduceMotion) return;
  const ctx = canvas.getContext('2d');
  const dpr = Math.min(devicePixelRatio || 1, 2);
  let w, h, parts = [], running = true;
  const mouse = { x: -9999, y: -9999 };

  const resize = () => {
    w = canvas.clientWidth; h = canvas.clientHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.round(clamp((w * h) / 9000, 50, 180));
    parts = Array.from({ length: n }, () => spawn(true));
  };
  const spawn = (anywhere) => ({
    x: Math.random() * w,
    y: anywhere ? Math.random() * h : h + 10,
    r: Math.random() * 1.6 + 0.3,
    vy: -(Math.random() * 0.35 + 0.08),
    vx: (Math.random() - 0.5) * 0.15,
    a: Math.random() * 0.6 + 0.2,
    tw: Math.random() * Math.PI * 2,
  });

  canvas.parentElement.addEventListener('mousemove', (e) => {
    const r = canvas.getBoundingClientRect();
    mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
  });
  canvas.parentElement.addEventListener('mouseleave', () => { mouse.x = mouse.y = -9999; });

  new IntersectionObserver(([e]) => {
    running = e.isIntersecting;
    if (running) requestAnimationFrame(draw);
  }).observe(canvas);

  function draw() {
    if (!running) return;
    ctx.clearRect(0, 0, w, h);
    for (const p of parts) {
      const dx = p.x - mouse.x, dy = p.y - mouse.y;
      const d2 = dx * dx + dy * dy;
      if (d2 < 22000) {
        // swirl around the cursor like perfume in air
        const f = (1 - d2 / 22000) * 0.6;
        p.vx += (-dy * 0.004 + dx * 0.002) * f;
        p.vy += (dx * 0.004 + dy * 0.002) * f;
      }
      p.vx *= 0.97; p.vy = p.vy * 0.97 - 0.006;
      p.x += p.vx; p.y += p.vy; p.tw += 0.03;
      if (p.y < -10 || p.x < -10 || p.x > w + 10) Object.assign(p, spawn(false));
      const alpha = p.a * (0.6 + Math.sin(p.tw) * 0.4);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(232, 200, 130, ${alpha})`;
      ctx.shadowBlur = p.r * 6;
      ctx.shadowColor = 'rgba(214, 178, 102, .8)';
      ctx.fill();
    }
    requestAnimationFrame(draw);
  }
  addEventListener('resize', resize);
  resize();
  requestAnimationFrame(draw);
}

/* ---------- Scroll-driven effects ---------- */
function initScrollFx() {
  const heroInner = $('.hero__inner');
  const storyText = $('.story__text');
  const storyImg = $('.story__frame img');
  const collection = $('.collection');
  const track = $('.collection .track');
  const progress = $('.collection__progress');
  const bg = $('.collection__bg');
  const desktop = matchMedia('(min-width: 961px)');

  // Story words
  let words = [];
  if (storyText) {
    [...storyText.childNodes].forEach((n) => {
      const gold = n.nodeName === 'B';
      const frag = document.createDocumentFragment();
      n.textContent.split(/(\s+)/).forEach((part) => {
        if (!part) return;
        if (/^\s+$/.test(part)) return frag.append(' ');
        const s = document.createElement('span');
        s.className = 'word' + (gold ? ' gold' : '');
        s.textContent = part;
        frag.append(s);
      });
      n.replaceWith(frag);
    });
    words = $$('.word', storyText);
  }

  const sizeCollection = () => {
    if (!collection || !track) return;
    if (desktop.matches) {
      const extra = track.scrollWidth - innerWidth;
      collection.style.height = `${innerHeight + Math.max(extra, 0)}px`;
    } else {
      collection.style.height = '';
    }
  };

  let ticking = false;
  const update = () => {
    ticking = false;
    const vh = innerHeight;

    if (heroInner && !reduceMotion) {
      const y = scrollY;
      if (y < vh * 1.2) {
        heroInner.style.transform = `translateY(${y * 0.35}px)`;
        heroInner.style.opacity = clamp(1 - y / (vh * 0.75), 0, 1);
      }
    }

    if (words.length) {
      const r = storyText.getBoundingClientRect();
      const p = clamp((vh * 0.8 - r.top) / (r.height + vh * 0.25), 0, 1);
      const lit = Math.floor(p * words.length * 1.05);
      words.forEach((w, i) => w.classList.toggle('lit', i < lit));
    }

    if (storyImg && !reduceMotion) {
      const r = storyImg.parentElement.getBoundingClientRect();
      const p = (r.top + r.height / 2 - vh / 2) / vh;
      storyImg.style.setProperty('--py', `${-8 + p * -40}px`);
    }

    if (collection && track && desktop.matches) {
      const r = collection.getBoundingClientRect();
      const total = collection.offsetHeight - vh;
      const p = clamp(-r.top / total, 0, 1);
      const extra = track.scrollWidth - innerWidth;
      track.style.transform = `translate3d(${-p * extra}px,0,0)`;
      progress?.style.setProperty('--p', p);
      // tint the room with the colour of the label nearest the centre
      let best = null, bestD = Infinity;
      $$('.scent', track).forEach((s) => {
        const sr = s.getBoundingClientRect();
        const d = Math.abs(sr.left + sr.width / 2 - innerWidth / 2);
        if (d < bestD) { bestD = d; best = s; }
      });
      if (best) bg.style.setProperty('--tint', best.dataset.tint);
    }
  };
  const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };

  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', () => { sizeCollection(); update(); });
  addEventListener('load', () => { sizeCollection(); update(); });
  sizeCollection();
  update();

  // Mobile swipe row: tint by the snapped card
  if (track && bg) {
    track.addEventListener('scroll', () => {
      if (desktop.matches) return;
      const i = Math.round(track.scrollLeft / ($('.scent', track).offsetWidth + 24));
      const s = $$('.scent', track)[i];
      if (s) bg.style.setProperty('--tint', s.dataset.tint);
    }, { passive: true });
  }
}

/* ---------- Collection page filters ---------- */
function initFilters() {
  const bar = $('.filters');
  if (!bar) return;
  bar.addEventListener('click', (e) => {
    const btn = e.target.closest('.filter');
    if (!btn) return;
    $$('.filter', bar).forEach((b) => b.classList.toggle('on', b === btn));
    const f = btn.dataset.filter;
    $$('.grid .scent').forEach((card, i) => {
      const show = f === 'all' || card.dataset.family.includes(f);
      card.classList.toggle('out', !show);
      if (show && !reduceMotion) {
        card.animate(
          [{ opacity: 0, transform: 'translateY(30px)' }, { opacity: 1, transform: 'none' }],
          { duration: 700, delay: i * 60, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'backwards' }
        );
      }
    });
  });
}

/* ---------- Boot ---------- */
renderScents();
initNav();
initCursor();
initMagnetic();
initTilt();
initFilters();
initDust();
initScrollFx();
initLoader().then(initReveals);

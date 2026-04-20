/* ============================================================
   AnyGuru V3 — Main JavaScript
   Pure vanilla JS, zero dependencies
   ============================================================ */

'use strict';

/* ── Utility helpers ────────────────────────────────────── */
const qs  = (sel, ctx = document) => ctx.querySelector(sel);
const qsa = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const on  = (el, ev, fn) => el && el.addEventListener(ev, fn);
const raf = requestAnimationFrame;

/* ══════════════════════════════════════════════════════════
   1. LOADER
══════════════════════════════════════════════════════════ */
function initLoader() {
  const loader  = qs('#loader');
  const counter = qs('#loader-counter');
  const barFill = qs('#loader-bar-fill');
  if (!loader || !counter) return;

  let current = 0;
  const target = 100;
  const duration = 2200;
  const startTime = performance.now();

  // Easing: fast start, slow middle, fast end
  function easeInOutCubic(t) {
    return t < 0.5
      ? 4 * t * t * t
      : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function tick(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = easeInOutCubic(progress);
    current = Math.round(eased * target);

    counter.textContent = current;
    if (barFill) barFill.style.width = current + '%';

    if (progress < 1) {
      raf(tick);
    } else {
      counter.textContent = 100;
      if (barFill) barFill.style.width = '100%';
      // Hold briefly then dismiss
      setTimeout(() => {
        loader.classList.add('loaded');
        document.body.style.overflow = '';
        // Trigger hero animations by marking visible
        setTimeout(() => {
          loader.style.display = 'none';
        }, 900);
      }, 400);
    }
  }

  document.body.style.overflow = 'hidden';
  raf(tick);
}

/* ══════════════════════════════════════════════════════════
   2. CUSTOM CURSOR
══════════════════════════════════════════════════════════ */
function initCursor() {
  const dot  = qs('#cursor-dot');
  const ring = qs('#cursor-ring');
  if (!dot || !ring) return;
  if (window.innerWidth < 600) return;
  if (window.matchMedia('(hover: none)').matches) return;

  document.body.classList.add('custom-cursor-active');

  let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;
  let ringX = mouseX, ringY = mouseY;
  let isVisible = false;

  on(document, 'mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (!isVisible) {
      isVisible = true;
      dot.style.opacity = '1';
      ring.style.opacity = '1';
    }
  });

  on(document, 'mouseleave', () => {
    dot.style.opacity = '0';
    ring.style.opacity = '0';
  });

  function animateCursor() {
    dot.style.left  = mouseX + 'px';
    dot.style.top   = mouseY + 'px';

    // Ring follows with lag
    ringX += (mouseX - ringX) * 0.12;
    ringY += (mouseY - ringY) * 0.12;
    ring.style.left = ringX + 'px';
    ring.style.top  = ringY + 'px';

    raf(animateCursor);
  }

  raf(animateCursor);
}

/* ══════════════════════════════════════════════════════════
   3. MAGNETIC BUTTONS
══════════════════════════════════════════════════════════ */
function initMagnetic() {
  if (window.innerWidth < 900) return;

  qsa('.btn-primary, .btn-outline').forEach(btn => {
    on(btn, 'mousemove', e => {
      const rect = btn.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top  + rect.height / 2;
      const dx = (e.clientX - cx) * 0.25;
      const dy = (e.clientY - cy) * 0.25;
      btn.style.transform = `translate(${dx}px, ${dy}px)`;
    });

    on(btn, 'mouseleave', () => {
      btn.style.transform = '';
    });
  });
}

/* ══════════════════════════════════════════════════════════
   4. NAV SCROLL EFFECT
══════════════════════════════════════════════════════════ */
function initNav() {
  const nav = qs('.nav');
  if (!nav) return;

  function onScroll() {
    nav.classList.toggle('scrolled', window.scrollY > 80);
  }

  on(window, 'scroll', onScroll, { passive: true });
  onScroll();
}

/* ══════════════════════════════════════════════════════════
   5. HAMBURGER MENU
══════════════════════════════════════════════════════════ */
function initMenu() {
  const hamburger = qs('.hamburger');
  const overlay   = qs('.nav-overlay');
  if (!hamburger || !overlay) return;

  let isOpen = false;

  function toggleMenu() {
    isOpen = !isOpen;
    hamburger.classList.toggle('open', isOpen);
    overlay.classList.toggle('open', isOpen);
    document.body.classList.toggle('menu-open', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
  }

  on(hamburger, 'click', toggleMenu);

  // Close on link click
  qsa('.nav-overlay-link', overlay).forEach(link => {
    on(link, 'click', () => {
      if (isOpen) toggleMenu();
    });
  });

  // Close on Escape
  on(document, 'keydown', e => {
    if (e.key === 'Escape' && isOpen) toggleMenu();
  });
}

/* ══════════════════════════════════════════════════════════
   6. INTERSECTION OBSERVER — scroll animations
══════════════════════════════════════════════════════════ */
function initScrollAnimations() {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  qsa('.io-fade-up, .io-stagger, .io-scale, .split-text').forEach(el => {
    io.observe(el);
  });
}

/* ══════════════════════════════════════════════════════════
   7. SPLIT TEXT
══════════════════════════════════════════════════════════ */
function initSplitText() {
  qsa('.split-text').forEach(el => {
    const text = el.textContent;
    const words = text.trim().split(/\s+/);
    el.innerHTML = words.map(word =>
      `<span class="word"><span class="word-inner">${word}</span></span>`
    ).join(' ');
  });
}

/* ══════════════════════════════════════════════════════════
   8. COUNTER ANIMATION
══════════════════════════════════════════════════════════ */
function animateCounter(el, target, duration = 1800, prefix = '', suffix = '') {
  let start = null;
  const isFloat = target % 1 !== 0;

  function easeOut(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function step(timestamp) {
    if (!start) start = timestamp;
    const progress = Math.min((timestamp - start) / duration, 1);
    const eased = easeOut(progress);
    const value = eased * target;
    const display = isFloat
      ? value.toFixed(1)
      : Math.round(value).toLocaleString();
    el.textContent = prefix + display + suffix;
    if (progress < 1) raf(step);
  }

  raf(step);
}

function initCounters() {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const raw    = el.dataset.count;
        const prefix = el.dataset.prefix || '';
        const suffix = el.dataset.suffix || '';
        const target = parseFloat(raw.replace(/,/g, ''));
        animateCounter(el, target, 2000, prefix, suffix);
        io.unobserve(el);
      }
    });
  }, { threshold: 0.4 });

  qsa('[data-count]').forEach(el => io.observe(el));
}

/* ══════════════════════════════════════════════════════════
   9. FAQ ACCORDION
══════════════════════════════════════════════════════════ */
function initFaq() {
  qsa('.faq-question').forEach(btn => {
    on(btn, 'click', () => {
      const item = btn.closest('.faq-item');
      const isOpen = item.classList.contains('open');

      // Close all
      qsa('.faq-item.open').forEach(openItem => {
        openItem.classList.remove('open');
        openItem.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
      });

      // Open clicked if it was closed
      if (!isOpen) {
        item.classList.add('open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });
}

/* ══════════════════════════════════════════════════════════
   10. PRICING TOGGLE
══════════════════════════════════════════════════════════ */
function initPricing() {
  const toggle = qs('#pricing-toggle-input');
  if (!toggle) return;

  const monthlyPrices = qsa('[data-monthly]');
  const annualPrices  = qsa('[data-annual]');
  const monthLabel    = qs('#pricing-monthly-label');
  const annualLabel   = qs('#pricing-annual-label');

  function update() {
    const isAnnual = toggle.checked;

    monthlyPrices.forEach(el => {
      el.style.display = isAnnual ? 'none' : '';
    });
    annualPrices.forEach(el => {
      el.style.display = isAnnual ? '' : 'none';
    });

    if (monthLabel) monthLabel.classList.toggle('active', !isAnnual);
    if (annualLabel) annualLabel.classList.toggle('active', isAnnual);
  }

  on(toggle, 'change', update);
  update();
}

/* ══════════════════════════════════════════════════════════
   11. HERO PARALLAX — floating cards follow mouse
══════════════════════════════════════════════════════════ */
function initHeroParallax() {
  if (window.innerWidth < 900) return;

  const hero   = qs('.hero');
  const floats = qsa('.hero-stat-card, .hero-main-card, .hero-guru-peek');
  if (!hero || !floats.length) return;

  let targetX = 0, targetY = 0;
  let currentX = 0, currentY = 0;

  on(hero, 'mousemove', e => {
    const rect = hero.getBoundingClientRect();
    // Normalize -1 to 1
    targetX = ((e.clientX - rect.left) / rect.width  - 0.5) * 2;
    targetY = ((e.clientY - rect.top)  / rect.height - 0.5) * 2;
  });

  on(hero, 'mouseleave', () => {
    targetX = 0;
    targetY = 0;
  });

  function tick() {
    currentX += (targetX - currentX) * 0.07;
    currentY += (targetY - currentY) * 0.07;

    floats.forEach((el, i) => {
      const depth  = (i + 1) * 6;
      const rotX   = currentY * 3;
      const rotY   = -currentX * 3;
      const tx     = currentX * depth;
      const ty     = currentY * depth;
      // Preserve existing transforms carefully
      const base = el.classList.contains('hero-main-card') ? '' : '';
      el.style.transform = `translate(${tx}px, ${ty}px) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
    });

    raf(tick);
  }

  raf(tick);
}

/* ══════════════════════════════════════════════════════════
   12. HOW IT WORKS — step progress
══════════════════════════════════════════════════════════ */
function initHowItWorks() {
  const steps = qsa('.how-step');
  if (!steps.length) return;

  let activeIndex = 0;

  function setActive(i) {
    steps.forEach((step, idx) => {
      step.classList.toggle('active', idx === i);
    });
    activeIndex = i;
  }

  setActive(0);

  steps.forEach((step, i) => {
    on(step, 'click', () => setActive(i));
  });

  // Auto-advance
  let autoTimer = setInterval(() => {
    activeIndex = (activeIndex + 1) % steps.length;
    setActive(activeIndex);
  }, 4000);

  qsa('.how-steps').forEach(el => {
    on(el, 'mouseenter', () => clearInterval(autoTimer));
    on(el, 'mouseleave', () => {
      autoTimer = setInterval(() => {
        activeIndex = (activeIndex + 1) % steps.length;
        setActive(activeIndex);
      }, 4000);
    });
  });
}

/* ══════════════════════════════════════════════════════════
   13. MARQUEE — pause on hover (already handled in CSS,
       this adds JS drag-to-scroll for desktop)
══════════════════════════════════════════════════════════ */
function initMarqueeDrag() {
  qsa('.guru-strip-track').forEach(track => {
    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;

    on(track.parentElement, 'mousedown', e => {
      isDown = true;
      startX = e.pageX - track.parentElement.offsetLeft;
      scrollLeft = track.parentElement.scrollLeft;
      track.style.animationPlayState = 'paused';
    });

    on(document, 'mouseup', () => {
      isDown = false;
      track.style.animationPlayState = '';
    });

    on(track.parentElement, 'mousemove', e => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - track.parentElement.offsetLeft;
      const walk = (x - startX) * 2;
      track.parentElement.scrollLeft = scrollLeft - walk;
    });
  });
}

/* ══════════════════════════════════════════════════════════
   14. SMOOTH ANCHOR SCROLL
══════════════════════════════════════════════════════════ */
function initSmoothScroll() {
  qsa('a[href^="#"]').forEach(link => {
    on(link, 'click', e => {
      const id = link.getAttribute('href');
      if (id === '#') return;
      const target = qs(id);
      if (!target) return;
      e.preventDefault();
      const offset = 80;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
}

/* ══════════════════════════════════════════════════════════
   15. HERO SCROLL BUTTON text — SVG circular text
══════════════════════════════════════════════════════════ */
function buildScrollBtn() {
  const wrap = qs('.hero-scroll-btn-ring');
  if (!wrap) return;

  const text = 'Scroll for More * Scroll for More * Scroll for More * ';
  const radius = 46;
  const cx = 55;
  const cy = 55;
  const circumference = 2 * Math.PI * radius;
  const charCount = text.length;

  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('viewBox', '0 0 110 110');
  svg.setAttribute('width', '110');
  svg.setAttribute('height', '110');

  const defs = document.createElementNS(ns, 'defs');
  const path = document.createElementNS(ns, 'path');
  path.setAttribute('id', 'scroll-circle');
  path.setAttribute('d',
    `M ${cx},${cy - radius}` +
    ` A ${radius},${radius} 0 1,1 ${cx - 0.01},${cy - radius}`
  );
  defs.appendChild(path);
  svg.appendChild(defs);

  const textEl = document.createElementNS(ns, 'text');
  textEl.setAttribute('font-size', '8');
  textEl.setAttribute('fill', 'rgba(240,237,232,0.6)');
  textEl.setAttribute('font-family', "'Funnel Sans', sans-serif");
  textEl.setAttribute('letter-spacing', '2');

  const textPath = document.createElementNS(ns, 'textPath');
  textPath.setAttribute('href', '#scroll-circle');
  textPath.textContent = text;

  textEl.appendChild(textPath);
  svg.appendChild(textEl);
  wrap.innerHTML = '';
  wrap.appendChild(svg);
}

/* ══════════════════════════════════════════════════════════
   16. STAGGER ANIMATIONS on cards entering viewport
══════════════════════════════════════════════════════════ */
function initCardStagger() {
  const staggerGroups = qsa('[data-stagger]');

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const children = entry.target.children;
      Array.from(children).forEach((child, i) => {
        child.style.transitionDelay = `${i * 0.08}s`;
        child.classList.add('io-fade-up', 'visible');
      });
      io.unobserve(entry.target);
    });
  }, { threshold: 0.05 });

  staggerGroups.forEach(el => io.observe(el));
}

/* ══════════════════════════════════════════════════════════
   17. ACTIVE NAV LINK on scroll
══════════════════════════════════════════════════════════ */
function initActiveNav() {
  const sections = qsa('section[id]');
  const links = qsa('.nav-overlay-link[href^="#"]');
  if (!sections.length || !links.length) return;

  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const id = '#' + entry.target.id;
      links.forEach(link => {
        link.classList.toggle('is-active', link.getAttribute('href') === id);
      });
    });
  }, { threshold: 0.4 });

  sections.forEach(s => io.observe(s));
}

/* ══════════════════════════════════════════════════════════
   18. THEME CARD — visual selection
══════════════════════════════════════════════════════════ */
function initThemeCards() {
  qsa('.theme-card').forEach(card => {
    on(card, 'click', () => {
      qsa('.theme-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
    });
  });
}

/* ══════════════════════════════════════════════════════════
   INIT — run after DOM ready
══════════════════════════════════════════════════════════ */
function init() {
  buildScrollBtn();
  initSplitText();
  initLoader();
  initCursor();
  initMagnetic();
  initNav();
  initMenu();
  initScrollAnimations();
  initCounters();
  initFaq();
  initPricing();
  initHeroParallax();
  initHowItWorks();
  initMarqueeDrag();
  initSmoothScroll();
  initCardStagger();
  initActiveNav();
  initThemeCards();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

/* ══════════════════════════════════════════════════════════
   19. PARALLAX-LITE on scroll images
══════════════════════════════════════════════════════════ */
(function initParallax() {
  const targets = document.querySelectorAll('[data-parallax]');
  if (!targets.length) return;
  function onScroll() {
    targets.forEach(el => {
      const speed = parseFloat(el.dataset.parallax) || 0.15;
      const rect = el.getBoundingClientRect();
      const center = rect.top + rect.height / 2 - window.innerHeight / 2;
      el.style.transform = 'translateY(' + (center * speed) + 'px)';
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

/* ══════════════════════════════════════════════════════════
   20. HOVER REVEAL on guru cards (card tilt)
══════════════════════════════════════════════════════════ */
(function initCardTilt() {
  document.querySelectorAll('.guru-card, .testimonial-card, .stat-block').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = 'perspective(600px) rotateY(' + (x * 6) + 'deg) rotateX(' + (-y * 4) + 'deg) translateY(-4px)';
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
})();

/* ══════════════════════════════════════════════════════════
   21. LINK HOVER slide-up text effect
══════════════════════════════════════════════════════════ */
(function initNavOverlayHover() {
  document.querySelectorAll('.nav-overlay-link').forEach(link => {
    link.addEventListener('mouseenter', () => {
      link.style.paddingLeft = '12px';
    });
    link.addEventListener('mouseleave', () => {
      link.style.paddingLeft = '';
    });
  });
})();

/* ══════════════════════════════════════════════════════════
   22. SERVICE STACK expand on scroll
══════════════════════════════════════════════════════════ */
(function initServiceStack() {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        setTimeout(() => {
          e.target.classList.add('stack-visible');
        }, i * 120);
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('.service-stack-item').forEach(el => io.observe(el));
})();

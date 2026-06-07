/* =====================================================
   script.js — Romantic Website for Shivani by Jiger
   Spring-physics animations, 3D scroll, particles,
   floating hearts, dodging No button, reveal effects
   ===================================================== */

'use strict';

// ──────────────────────────────────────────────────────
// 1. NAVIGATION — active link + scroll style + mobile
// ──────────────────────────────────────────────────────
const navbar    = document.getElementById('navbar');
const navLinks  = document.querySelectorAll('.nav-link');
const menuBtn   = document.getElementById('menuBtn');
const mobileNav = document.getElementById('mobileNav');
const mobileNavClose = document.getElementById('mobileNavClose');
const mobileLinks    = document.querySelectorAll('.mobile-link');

// Scroll: add "scrolled" class + update active link
window.addEventListener('scroll', () => {
  if (window.scrollY > 60) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
  updateActiveNav();
});

function updateActiveNav() {
  const scrollY = window.scrollY + window.innerHeight / 3;
  const pages   = ['home', 'story', 'beauty', 'mine'];
  for (const id of pages) {
    const el = document.getElementById(id);
    if (!el) continue;
    if (scrollY >= el.offsetTop && scrollY < el.offsetTop + el.offsetHeight) {
      navLinks.forEach(l => l.classList.remove('active'));
      const active = document.querySelector(`.nav-link[data-page="${id}"]`);
      if (active) active.classList.add('active');
    }
  }
}

// Mobile nav toggle
menuBtn.addEventListener('click', () => mobileNav.classList.add('open'));
mobileNavClose.addEventListener('click', () => mobileNav.classList.remove('open'));
mobileLinks.forEach(l => l.addEventListener('click', () => mobileNav.classList.remove('open')));


// ──────────────────────────────────────────────────────
// 2. PARTICLE CANVAS — stardust particles on hero
// ──────────────────────────────────────────────────────
const particleCanvas = document.getElementById('particleCanvas');
const pCtx = particleCanvas.getContext('2d');
let particles = [];

function resizeParticleCanvas() {
  particleCanvas.width  = window.innerWidth;
  particleCanvas.height = window.innerHeight;
}
resizeParticleCanvas();
window.addEventListener('resize', resizeParticleCanvas);

class Particle {
  constructor() { this.reset(true); }

  reset(initial = false) {
    this.x = Math.random() * particleCanvas.width;
    this.y = initial ? Math.random() * particleCanvas.height : particleCanvas.height + 10;
    this.size = Math.random() * 2.5 + 0.5;
    this.speedY = -(Math.random() * 0.5 + 0.2);
    this.speedX = (Math.random() - 0.5) * 0.3;
    this.life   = 0;
    this.maxLife = Math.random() * 300 + 200;
    this.hue    = Math.random() > 0.5 ? 20 : 290; // persimmon or plum
    this.saturation = Math.random() * 30 + 70;
    this.brightness = Math.random() * 20 + 70;
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;
    this.life++;
    if (this.life >= this.maxLife || this.y < -10) this.reset();
  }

  draw() {
    const alpha = Math.sin((this.life / this.maxLife) * Math.PI);
    pCtx.globalAlpha = alpha * 0.7;
    pCtx.fillStyle = `hsl(${this.hue}, ${this.saturation}%, ${this.brightness}%)`;
    pCtx.beginPath();
    pCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    pCtx.fill();
  }
}

// Init 120 particles
for (let i = 0; i < 120; i++) particles.push(new Particle());

function animateParticles() {
  pCtx.clearRect(0, 0, particleCanvas.width, particleCanvas.height);
  pCtx.globalAlpha = 1;
  particles.forEach(p => { p.update(); p.draw(); });
  requestAnimationFrame(animateParticles);
}
animateParticles();


// ──────────────────────────────────────────────────────
// 3. 3D SCROLL ANIMATION — hero scene parallax + depth
// ──────────────────────────────────────────────────────
const heroScrollContainer = document.getElementById('heroScrollContainer');
const hero3dScene         = document.getElementById('hero3dScene');
const heroCard            = document.getElementById('heroCard');
const petalLayers         = document.querySelectorAll('.petal-layer');
const floatHearts         = document.querySelectorAll('.float-heart');
const floatStars          = document.querySelectorAll('.float-star');

function updateHeroScroll() {
  if (!heroScrollContainer) return;

  const rect     = heroScrollContainer.getBoundingClientRect();
  const totalH   = heroScrollContainer.offsetHeight - window.innerHeight;
  const scrolled = Math.max(0, -rect.top);
  const progress = Math.min(1, scrolled / totalH); // 0 → 1

  // ─ Scene rotation ─
  const rotX = progress * 25;     // tilt forward
  const rotY = progress * -15;    // slight left turn
  const scale = 1 - progress * 0.25;

  hero3dScene.style.transform = `
    perspective(1200px)
    rotateX(${rotX}deg)
    rotateY(${rotY}deg)
    scale(${scale})
  `;

  // ─ Card Z-depth (float toward viewer) ─
  const cardZ = progress * 80;
  const cardOpacity = Math.max(0, 1 - progress * 1.6);
  heroCard.style.transform = `translateZ(${cardZ}px)`;
  heroCard.style.opacity   = cardOpacity;
  heroCard.style.animationPlayState = progress > 0.05 ? 'paused' : 'running';

  // ─ Petal layer parallax ─
  petalLayers.forEach((layer, i) => {
    const depth   = (i + 1) * 0.15;
    const rotProg = progress * 360 * (i % 2 === 0 ? 1 : -1);
    layer.style.transform = `rotate(${rotProg * depth}deg) scale(${1 + progress * depth})`;
    layer.style.opacity   = (0.12 + progress * 0.15 * depth).toString();
  });

  // ─ Floating elements — spread outward as we scroll ─
  const spread = progress * 80;
  floatHearts.forEach((el, i) => {
    const dir = i % 2 === 0 ? 1 : -1;
    el.style.transform = `translate(${dir * spread}px, ${-progress * 40 * (i + 1)}px) scale(${1 + progress * 0.5})`;
    el.style.opacity   = Math.max(0, 0.6 - progress * 0.8);
  });

  floatStars.forEach((el, i) => {
    const dir = i % 2 === 0 ? -1 : 1;
    el.style.transform = `translate(${dir * spread * 1.3}px, ${progress * 30 * i}px) scale(${1 + progress * 0.3})`;
    el.style.opacity   = Math.max(0, 0.6 - progress * 0.9);
  });
}

window.addEventListener('scroll', updateHeroScroll, { passive: true });
updateHeroScroll();


// ──────────────────────────────────────────────────────
// 4. MOUSE PARALLAX — hero card tilts with cursor
// ──────────────────────────────────────────────────────
const heroSection = document.getElementById('home');

heroSection.addEventListener('mousemove', (e) => {
  const rect   = heroSection.getBoundingClientRect();
  const cx     = rect.width / 2;
  const cy     = rect.height / 2;
  const dx     = (e.clientX - rect.left - cx) / cx;
  const dy     = (e.clientY - rect.top  - cy) / cy;

  const tiltX  = dy * -12;
  const tiltY  = dx * 12;

  heroCard.style.transition = 'transform 0.1s ease-out';
  heroCard.style.transform  = `
    translateZ(0px)
    rotateX(${tiltX}deg)
    rotateY(${tiltY}deg)
  `;
});

heroSection.addEventListener('mouseleave', () => {
  heroCard.style.transition = '';
  heroCard.style.transform  = '';
});


// ──────────────────────────────────────────────────────
// 5. SCROLL REVEAL — intersection observer
// ──────────────────────────────────────────────────────
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: '0px 0px -50px 0px' }
);

document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right')
  .forEach(el => revealObserver.observe(el));


// ──────────────────────────────────────────────────────
// 6. HEART CANVAS — floating hearts background (Page 4)
// ──────────────────────────────────────────────────────
const heartCanvas = document.getElementById('heartCanvas');
const hCtx = heartCanvas.getContext('2d');
let heartParticles = [];
let heartAnimating = false;

function resizeHeartCanvas() {
  heartCanvas.width  = window.innerWidth;
  heartCanvas.height = window.innerHeight;
}
resizeHeartCanvas();

class HeartParticle {
  constructor(x, y, triggered = false) {
    this.x = x ?? Math.random() * heartCanvas.width;
    this.y = y ?? heartCanvas.height + 20;
    this.size      = Math.random() * (triggered ? 35 : 14) + (triggered ? 12 : 6);
    this.speedX    = (Math.random() - 0.5) * (triggered ? 4 : 1.5);
    this.speedY    = -(Math.random() * (triggered ? 4 : 1.5) + (triggered ? 2 : 0.5));
    this.opacity   = 1;
    this.decay     = Math.random() * 0.012 + (triggered ? 0.008 : 0.004);
    this.rotation  = Math.random() * Math.PI * 2;
    this.rotSpeed  = (Math.random() - 0.5) * 0.05;
    this.color     = triggered
      ? `hsl(${Math.random() > 0.5 ? 15 : 310}, 80%, ${60 + Math.random() * 20}%)`
      : `hsl(${Math.random() > 0.5 ? 20 : 290}, 70%, 65%)`;
  }

  update() {
    this.x        += this.speedX;
    this.y        += this.speedY;
    this.opacity  -= this.decay;
    this.rotation += this.rotSpeed;
  }

  draw() {
    hCtx.save();
    hCtx.translate(this.x, this.y);
    hCtx.rotate(this.rotation);
    hCtx.globalAlpha = Math.max(0, this.opacity);
    hCtx.fillStyle   = this.color;
    hCtx.shadowColor = this.color;
    hCtx.shadowBlur  = 8;
    drawHeart(hCtx, 0, 0, this.size);
    hCtx.restore();
  }

  get dead() { return this.opacity <= 0; }
}

function drawHeart(ctx, x, y, size) {
  ctx.beginPath();
  ctx.moveTo(x, y - size * 0.3);
  ctx.bezierCurveTo(
    x,          y - size,
    x + size,   y - size,
    x + size,   y - size * 0.3
  );
  ctx.bezierCurveTo(
    x + size,   y + size * 0.3,
    x,          y + size * 0.8,
    x,          y + size * 0.8
  );
  ctx.bezierCurveTo(
    x,          y + size * 0.8,
    x - size,   y + size * 0.3,
    x - size,   y - size * 0.3
  );
  ctx.bezierCurveTo(
    x - size,   y - size,
    x,          y - size,
    x,          y - size * 0.3
  );
  ctx.fill();
}

function animateHearts() {
  hCtx.clearRect(0, 0, heartCanvas.width, heartCanvas.height);
  heartParticles = heartParticles.filter(h => !h.dead);
  heartParticles.forEach(h => { h.update(); h.draw(); });

  // Ambient hearts (background gentle float)
  if (Math.random() < 0.03) {
    heartParticles.push(new HeartParticle());
  }

  requestAnimationFrame(animateHearts);
}

// Only start heart canvas when page 4 is visible
const mineObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting && !heartAnimating) {
      heartAnimating = true;
      resizeHeartCanvas();
      animateHearts();
    }
  });
}, { threshold: 0.1 });

const minePage = document.getElementById('mine');
if (minePage) mineObserver.observe(minePage);

window.addEventListener('resize', () => {
  resizeHeartCanvas();
  resizeParticleCanvas();
});


// ──────────────────────────────────────────────────────
// 7. YES / NO BUTTONS — interactive proposal
// ──────────────────────────────────────────────────────
const yesBtn         = document.getElementById('yesBtn');
const noBtn          = document.getElementById('noBtn');
const proposalContent= document.getElementById('proposalContent');
const yesResponse    = document.getElementById('yesResponse');
const mineButtons    = document.getElementById('mineButtons');

// Position NO button initially
let noBtnRect = null;
let noInitialised = false;

function initNoBtn() {
  if (noInitialised) return;
  noInitialised = true;
  // Place it in its natural position first
  const rect = mineButtons.getBoundingClientRect();
  noBtn.style.left   = (rect.left + rect.width - 120) + 'px';
  noBtn.style.top    = (rect.top  + rect.height / 2 - 22) + 'px';
}

// Dodge on mousemove — spring away from cursor
let dodgeTimeout;
noBtn.addEventListener('mouseenter', (e) => {
  initNoBtn();
  dodgeNoButton(e.clientX, e.clientY);
});

noBtn.addEventListener('mousemove', (e) => {
  clearTimeout(dodgeTimeout);
  dodgeTimeout = setTimeout(() => dodgeNoButton(e.clientX, e.clientY), 30);
});

function dodgeNoButton(mx, my) {
  const margin = 60;
  const W = window.innerWidth;
  const H = window.innerHeight;
  const bw = noBtn.offsetWidth  + 20;
  const bh = noBtn.offsetHeight + 20;

  // Choose a new random spot away from cursor
  let newX, newY, attempts = 0;
  do {
    newX = margin + Math.random() * (W - bw - margin * 2);
    newY = margin + Math.random() * (H - bh - margin * 2);
    attempts++;
  } while (
    Math.abs(newX - mx) < 150 &&
    Math.abs(newY - my) < 150 &&
    attempts < 20
  );

  noBtn.style.transition = 'left 0.35s cubic-bezier(0.34,1.56,0.64,1), top 0.35s cubic-bezier(0.34,1.56,0.64,1)';
  noBtn.style.left = newX + 'px';
  noBtn.style.top  = newY + 'px';
}

// Touchscreen — shrink "No" button to tiny when touched
noBtn.addEventListener('touchstart', (e) => {
  e.preventDefault();
  noBtn.style.transform = 'scale(0.01)';
  noBtn.style.opacity   = '0';
  setTimeout(() => {
    noBtn.style.display = 'none';
  }, 400);
}, { passive: false });

// YES click — celebration!
yesBtn.addEventListener('click', () => {
  proposalContent.style.display = 'none';
  yesResponse.style.display     = 'block';
  noBtn.style.display           = 'none';

  // Burst 60 hearts across screen
  for (let i = 0; i < 60; i++) {
    setTimeout(() => {
      heartParticles.push(new HeartParticle(
        Math.random() * heartCanvas.width,
        Math.random() * heartCanvas.height * 0.7 + heartCanvas.height * 0.1,
        true
      ));
    }, i * 60);
  }

  // Extra waves
  for (let wave = 0; wave < 3; wave++) {
    setTimeout(() => {
      for (let i = 0; i < 30; i++) {
        heartParticles.push(new HeartParticle(
          Math.random() * heartCanvas.width,
          heartCanvas.height + 10,
          true
        ));
      }
    }, wave * 1200);
  }

  // Ensure heart animation is running
  if (!heartAnimating) {
    heartAnimating = true;
    animateHearts();
  }
});


// ──────────────────────────────────────────────────────
// 8. TIMELINE — staggered entrance for timeline items
// ──────────────────────────────────────────────────────
const timelineItems = document.querySelectorAll('.timeline-item');

const timelineObserver = new IntersectionObserver(
  entries => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        const item = entry.target;
        item.style.transitionDelay = `${i * 0.12}s`;
        item.classList.add('visible');
        timelineObserver.unobserve(item);
      }
    });
  },
  { threshold: 0.2, rootMargin: '0px 0px -60px 0px' }
);

timelineItems.forEach(item => {
  item.classList.add('reveal-left');
  timelineObserver.observe(item);
});


// ──────────────────────────────────────────────────────
// 9. QUOTE CARDS — tilt on hover (mouse parallax)
// ──────────────────────────────────────────────────────
document.querySelectorAll('.quote-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const cx = rect.left + rect.width  / 2;
    const cy = rect.top  + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width  / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);

    card.style.transform = `
      translateY(-8px)
      scale(1.01)
      rotateX(${-dy * 6}deg)
      rotateY(${dx * 6}deg)
    `;
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});


// ──────────────────────────────────────────────────────
// 10. MINE BIG HEART — wiggle on hover
// ──────────────────────────────────────────────────────
const mineBigHeart = document.getElementById('mineBigHeart');
if (mineBigHeart) {
  mineBigHeart.addEventListener('click', () => {
    mineBigHeart.style.transition = 'transform 0.1s ease';
    mineBigHeart.style.transform  = 'scale(1.5)';
    setTimeout(() => {
      mineBigHeart.style.transform = '';
    }, 300);

    // Spawn hearts from the heart
    if (heartAnimating) {
      const rect = mineBigHeart.getBoundingClientRect();
      for (let i = 0; i < 12; i++) {
        heartParticles.push(new HeartParticle(
          rect.left + rect.width / 2 + (Math.random() - 0.5) * 40,
          rect.top  + rect.height / 2,
          true
        ));
      }
    }
  });
}


// ──────────────────────────────────────────────────────
// 11. PAGE SMOOTH TRANSITIONS — fade on section enter
// ──────────────────────────────────────────────────────
const pageSections = document.querySelectorAll('.page');

const pageObserver = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
      }
    });
  },
  { threshold: 0.05 }
);

pageSections.forEach(p => {
  p.style.opacity = '1'; // keep visible — transitions handled by scroll reveal
  pageObserver.observe(p);
});


// ──────────────────────────────────────────────────────
// 12. FOOTER HEARTS — randomized animation delays
// ──────────────────────────────────────────────────────
document.querySelectorAll('.footer-hearts span').forEach((el, i) => {
  el.style.animationDelay = `${i * 0.3}s`;
});


// ──────────────────────────────────────────────────────
// 13. CURSOR TRAIL (desktop only)
// ──────────────────────────────────────────────────────
if (window.matchMedia('(pointer: fine)').matches) {
  const TRAIL_COUNT = 8;
  const trail = [];

  for (let i = 0; i < TRAIL_COUNT; i++) {
    const dot = document.createElement('div');
    dot.style.cssText = `
      position: fixed;
      width: ${4 + i}px;
      height: ${4 + i}px;
      border-radius: 50%;
      background: hsl(${20 + i * 20}, 80%, 65%);
      pointer-events: none;
      z-index: 9999;
      opacity: ${1 - i / TRAIL_COUNT * 0.8};
      transform: translate(-50%, -50%);
      transition: transform 0.05s ease;
      mix-blend-mode: screen;
    `;
    document.body.appendChild(dot);
    trail.push({ el: dot, x: 0, y: 0 });
  }

  let mouseX = 0, mouseY = 0;

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function animateTrail() {
    let px = mouseX, py = mouseY;
    trail.forEach((dot, i) => {
      const dx = px - dot.x;
      const dy = py - dot.y;
      dot.x += dx * (0.4 - i * 0.03);
      dot.y += dy * (0.4 - i * 0.03);
      dot.el.style.left = dot.x + 'px';
      dot.el.style.top  = dot.y + 'px';
      px = dot.x;
      py = dot.y;
    });
    requestAnimationFrame(animateTrail);
  }
  animateTrail();
}

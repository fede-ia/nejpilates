/* ═══════════════════════════════════════
   NEJ PILATES — script.js
   Navbar · Scroll animations · Counter
   Mobile menu · Form · Smooth scroll
════════════════════════════════════════ */

// ─── CONFIGURACIÓN ───────────────────────────────────────────
// Cambiá esta URL cuando configures el endpoint del formulario
// Opción 1 (Formspree):   https://formspree.io/f/TU_FORM_ID
// Opción 2 (Apps Script): https://script.google.com/macros/s/TU_ID/exec
const FORM_ENDPOINT = "https://script.google.com/macros/s/AKfycbxbmDTaOzQZTA_pFpBdDqR1Lr0uKlQ2ouJ9zHFOQ0qLailpT2lEZCuiiuONtp0sBl8iQg/exec";

// ─── NAVBAR SCROLL ───────────────────────────────────────────
const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

// ─── MOBILE MENU ─────────────────────────────────────────────
const navToggle = document.getElementById('navToggle');
const navLinks  = document.getElementById('navLinks');
const overlay   = document.createElement('div');

overlay.style.cssText = `
  position:fixed; inset:0; background:rgba(0,0,0,0.35);
  z-index:1040; opacity:0; pointer-events:none;
  transition:opacity 0.4s ease;
`;
document.body.appendChild(overlay);

function openMenu() {
  navLinks.classList.add('open');
  navToggle.classList.add('open');
  overlay.style.opacity = '1';
  overlay.style.pointerEvents = 'auto';
  document.body.style.overflow = 'hidden';
}

function closeMenu() {
  navLinks.classList.remove('open');
  navToggle.classList.remove('open');
  overlay.style.opacity = '0';
  overlay.style.pointerEvents = 'none';
  document.body.style.overflow = '';
}

navToggle.addEventListener('click', () => {
  navLinks.classList.contains('open') ? closeMenu() : openMenu();
});

overlay.addEventListener('click', closeMenu);

document.querySelectorAll('.nav-links a').forEach(a => {
  a.addEventListener('click', closeMenu);
});

// ─── SMOOTH SCROLL ───────────────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const href = a.getAttribute('href');
    if (href === '#') return;
    const target = document.querySelector(href);
    if (!target) return;
    e.preventDefault();
    const navH   = navbar.offsetHeight;
    const top    = target.getBoundingClientRect().top + window.scrollY - navH - 20;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

// ─── SCROLL ANIMATIONS (Intersection Observer) ───────────────
const animObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const delay = Number(entry.target.dataset.delay ?? 0);
    setTimeout(() => {
      entry.target.classList.add('animated');
    }, delay);
    animObserver.unobserve(entry.target);
  });
}, {
  threshold:  0.12,
  rootMargin: '0px 0px -50px 0px'
});

document.querySelectorAll('[data-animate]').forEach(el => animObserver.observe(el));

// Animar hero en carga (sin esperar scroll)
window.addEventListener('load', () => {
  document.querySelectorAll('.hero [data-animate]').forEach((el, i) => {
    setTimeout(() => el.classList.add('animated'), 180 + i * 220);
  });
});

// ─── COUNTER ANIMATION ───────────────────────────────────────
function runCounter(el) {
  const target   = parseInt(el.dataset.target, 10);
  const duration = 1800;
  const fps      = 60;
  const steps    = duration / (1000 / fps);
  const inc      = target / steps;
  let   current  = 0;

  const tick = () => {
    current = Math.min(current + inc, target);
    el.textContent = Math.floor(current);
    if (current < target) requestAnimationFrame(tick);
    else el.textContent = target;
  };
  requestAnimationFrame(tick);
}

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    runCounter(entry.target);
    counterObserver.unobserve(entry.target);
  });
}, { threshold: 0.6 });

document.querySelectorAll('.counter').forEach(el => counterObserver.observe(el));

// ─── HOVER PARALLAX (sutil en hero) ──────────────────────────
const hero = document.querySelector('.hero');
if (hero) {
  hero.addEventListener('mousemove', e => {
    const { width, height, left, top } = hero.getBoundingClientRect();
    const x = ((e.clientX - left) / width  - 0.5) * 16;
    const y = ((e.clientY - top)  / height - 0.5) * 10;
    const circles = hero.querySelectorAll('.hero-circle');
    circles.forEach((c, i) => {
      const factor = (i + 1) * 0.4;
      c.style.transform = `translate(${x * factor}px, ${y * factor}px)`;
    });
  }, { passive: true });
}

// ─── FORMULARIO ──────────────────────────────────────────────
const form       = document.getElementById('contactForm');
const successDiv = document.getElementById('formSuccess');
const submitBtn  = document.getElementById('submitBtn');
const btnText    = document.getElementById('btnText');
const btnLoader  = document.getElementById('btnLoader');

if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Validación básica
    const nombre = form.nombre.value.trim();
    const email  = form.email.value.trim();
    if (!nombre || !email) {
      shakeField(!nombre ? form.nombre : form.email);
      return;
    }

    // Estado cargando
    btnText.style.display   = 'none';
    btnLoader.style.display = 'inline';
    submitBtn.disabled      = true;

    const formData = new FormData(form);

    try {
      if (FORM_ENDPOINT) {
        // ── Envío real ────────────────────────────────────────
        const res = await fetch(FORM_ENDPOINT, {
          method: 'POST',
          body: formData,
          headers: { 'Accept': 'application/json' }
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        // Si es Google Apps Script, esperar JSON de respuesta
        // const data = await res.json();

      } else {
        // ── Modo demo: simular latencia ───────────────────────
        await new Promise(r => setTimeout(r, 1600));
      }

      // Éxito
      form.style.display          = 'none';
      successDiv.style.display    = 'block';
      successDiv.style.animation  = 'fade-in-up 0.5s ease both';

    } catch (err) {
      console.error('Error al enviar formulario:', err);
      btnText.style.display  = 'inline';
      btnLoader.style.display = 'none';
      submitBtn.disabled      = false;
      showFormError();
    }
  });
}

function shakeField(field) {
  field.style.animation = 'none';
  field.style.borderColor = '#e05c5c';
  field.offsetHeight; // reflow
  field.style.animation = 'shake 0.4s ease';
  field.focus();
  setTimeout(() => { field.style.borderColor = ''; field.style.animation = ''; }, 1200);

  if (!document.getElementById('shakeStyle')) {
    const s = document.createElement('style');
    s.id = 'shakeStyle';
    s.textContent = `
      @keyframes shake {
        0%,100% { transform: translateX(0); }
        20%,60% { transform: translateX(-6px); }
        40%,80% { transform: translateX(6px); }
      }
    `;
    document.head.appendChild(s);
  }
}

function showFormError() {
  let errDiv = document.getElementById('formError');
  if (!errDiv) {
    errDiv = document.createElement('div');
    errDiv.id = 'formError';
    errDiv.style.cssText = `
      margin-top:1rem; padding:0.9rem 1.2rem;
      background:#fff0f0; border:1.5px solid #e05c5c;
      border-radius:2px; font-size:0.83rem; color:#c0392b;
    `;
    errDiv.textContent = 'Ocurrió un error al enviar. Por favor intentá de nuevo o escribinos por WhatsApp.';
    form.appendChild(errDiv);
  }
  errDiv.style.display = 'block';
}

// ─── HIGHLIGHT ACTIVO EN NAV ─────────────────────────────────
const sections = document.querySelectorAll('section[id]');
const navAs    = document.querySelectorAll('.nav-links a[href^="#"]');

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const id = entry.target.id;
    navAs.forEach(a => {
      a.classList.toggle('active', a.getAttribute('href') === `#${id}`);
    });
  });
}, { rootMargin: '-40% 0px -55% 0px' });

sections.forEach(s => sectionObserver.observe(s));

// Agregar estilo para nav link activo
const activeStyle = document.createElement('style');
activeStyle.textContent = `
  .nav-links a.active           { color: var(--purple); }
  .nav-links a.active::after    { width: 100%; }
`;
document.head.appendChild(activeStyle);

// ─── ANIMACIÓN SUTIL EN CARDS ────────────────────────────────
// Añade clase "in-view" a los cards cuando aparecen (para stagger CSS si se quiere)
const cardObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '';
      cardObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll(
  '.clase-card, .beneficio-card, .testimonio-card, .cert-item'
).forEach(el => {
  if (!el.closest('[data-animate]')) cardObserver.observe(el);
});

/* ============================================================
   RAAJ STUDIO — script.js
   ============================================================ */

// --- Navbar scroll behavior ---
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
});

// --- Active nav link on scroll ---
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link:not(.nav-cta)');
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(l => l.classList.remove('active'));
      const link = document.querySelector(`.nav-link[href="#${entry.target.id}"]`);
      if (link) link.classList.add('active');
    }
  });
}, { rootMargin: '-50% 0px -50% 0px' });
sections.forEach(s => observer.observe(s));

// --- Mobile nav toggle ---
const navToggle = document.getElementById('navToggle');
const navLinksEl = document.getElementById('navLinks');
navToggle.addEventListener('click', () => {
  navToggle.classList.toggle('open');
  navLinksEl.classList.toggle('open');
});
navLinksEl.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    navToggle.classList.remove('open');
    navLinksEl.classList.remove('open');
  });
});

// --- Hero Slideshow ---
const slides = document.querySelectorAll('.hero-slide');
const dotsContainer = document.getElementById('heroDots');
let currentSlide = 0;
let slideInterval;

// Build dots
slides.forEach((_, i) => {
  const dot = document.createElement('button');
  dot.className = 'hero-dot' + (i === 0 ? ' active' : '');
  dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
  dot.addEventListener('click', () => goToSlide(i));
  dotsContainer.appendChild(dot);
});

function goToSlide(index) {
  slides[currentSlide].classList.remove('active');
  dotsContainer.children[currentSlide].classList.remove('active');
  currentSlide = (index + slides.length) % slides.length;
  slides[currentSlide].classList.add('active');
  dotsContainer.children[currentSlide].classList.add('active');
}

function nextSlide() { goToSlide(currentSlide + 1); }
function prevSlide() { goToSlide(currentSlide - 1); }

document.getElementById('heroNext').addEventListener('click', () => {
  nextSlide();
  restartInterval();
});
document.getElementById('heroPrev').addEventListener('click', () => {
  prevSlide();
  restartInterval();
});

function restartInterval() {
  clearInterval(slideInterval);
  slideInterval = setInterval(nextSlide, 4500);
}
slideInterval = setInterval(nextSlide, 4500);

// --- Gallery Filter ---
const filterBtns = document.querySelectorAll('.filter-btn');
const galleryItems = document.querySelectorAll('.gallery-item');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter;
    galleryItems.forEach(item => {
      if (filter === 'all' || item.dataset.category === filter) {
        item.classList.remove('hidden');
      } else {
        item.classList.add('hidden');
      }
    });
  });
});

// --- Lightbox ---
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxCaption = document.getElementById('lightboxCaption');
let lightboxIndex = 0;
let visibleItems = [];

function getVisibleItems() {
  return Array.from(galleryItems).filter(item => !item.classList.contains('hidden'));
}

function openLightbox(index) {
  visibleItems = getVisibleItems();
  lightboxIndex = index;
  updateLightboxImage();
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
}

function updateLightboxImage() {
  const item = visibleItems[lightboxIndex];
  const img = item.querySelector('img');
  lightboxImg.src = img.src;
  lightboxImg.alt = img.alt;
  lightboxCaption.textContent = item.querySelector('.gallery-overlay span').textContent;
}

galleryItems.forEach((item) => {
  item.addEventListener('click', () => {
    const visible = getVisibleItems();
    const visibleIndex = visible.indexOf(item);
    openLightbox(visibleIndex);
  });
});

document.getElementById('lightboxClose').addEventListener('click', closeLightbox);
document.getElementById('lightboxPrev').addEventListener('click', () => {
  lightboxIndex = (lightboxIndex - 1 + visibleItems.length) % visibleItems.length;
  updateLightboxImage();
});
document.getElementById('lightboxNext').addEventListener('click', () => {
  lightboxIndex = (lightboxIndex + 1) % visibleItems.length;
  updateLightboxImage();
});

lightbox.addEventListener('click', e => {
  if (e.target === lightbox) closeLightbox();
});

document.addEventListener('keydown', e => {
  if (!lightbox.classList.contains('open')) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft') {
    lightboxIndex = (lightboxIndex - 1 + visibleItems.length) % visibleItems.length;
    updateLightboxImage();
  }
  if (e.key === 'ArrowRight') {
    lightboxIndex = (lightboxIndex + 1) % visibleItems.length;
    updateLightboxImage();
  }
});

// --- Scroll Reveal ---
const revealEls = document.querySelectorAll(
  '.service-card, .gallery-item, .about-grid, .contact-item, .intro-stat, .section-header'
);
revealEls.forEach(el => el.classList.add('reveal'));

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 60);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });
revealEls.forEach(el => revealObserver.observe(el));

// --- Contact Form (Formspree) ---
const form = document.getElementById('contactForm');
form.addEventListener('submit', async e => {
  e.preventDefault();
  const btn = form.querySelector('button[type="submit"]');
  btn.textContent = 'Sending...';
  btn.disabled = true;

  try {
    const response = await fetch(form.action, {
      method: 'POST',
      body: new FormData(form),
      headers: { 'Accept': 'application/json' }
    });

    if (response.ok) {
      btn.textContent = 'Message Sent!';
      form.reset();
      setTimeout(() => {
        btn.textContent = 'Send Message';
        btn.disabled = false;
      }, 3000);
    } else {
      const data = await response.json();
      const errorMsg = data?.errors?.map(e => e.message).join(', ') || 'Something went wrong.';
      btn.textContent = 'Failed — Try Again';
      btn.disabled = false;
      alert(`Could not send message: ${errorMsg}`);
    }
  } catch {
    btn.textContent = 'Failed — Try Again';
    btn.disabled = false;
    alert('Network error. Please email us directly at tarun@raajstudio.com');
  }
});

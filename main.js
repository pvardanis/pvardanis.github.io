// Landing page interactions

// === Grain shader ===
function initGrain() {
  const canvas = document.getElementById('grain');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let animationId;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function renderGrain() {
    const w = canvas.width;
    const h = canvas.height;
    const imageData = ctx.createImageData(w, h);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      const v = Math.random() * 255;
      data[i] = v;
      data[i + 1] = v;
      data[i + 2] = v;
      data[i + 3] = 8; // very low opacity
    }

    ctx.putImageData(imageData, 0, 0);
    animationId = requestAnimationFrame(renderGrain);
  }

  window.addEventListener('resize', resize);
  resize();
  renderGrain();

  // Pause grain when tab is not visible to save CPU
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(animationId);
    } else {
      renderGrain();
    }
  });
}

document.addEventListener('DOMContentLoaded', initGrain);

// === Nav active indicator ===
function initNav() {
  const navLinks = document.querySelectorAll('.nav-link');
  const indicator = document.querySelector('.nav-indicator');
  const sections = document.querySelectorAll('.section');

  if (!navLinks.length || !indicator || !sections.length) return;

  function updateIndicator(activeLink) {
    const linkRect = activeLink.getBoundingClientRect();
    const navRect = activeLink.closest('.sidebar-nav').getBoundingClientRect();
    const top = linkRect.top - navRect.top;
    indicator.style.top = top + 'px';
    indicator.style.height = linkRect.height + 'px';
  }

  function setActiveLink(id) {
    navLinks.forEach(link => {
      const isActive = link.getAttribute('href') === '#' + id;
      link.classList.toggle('active', isActive);
      if (isActive) updateIndicator(link);
    });
  }

  // Observe which section is in view
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActiveLink(entry.target.id);
        }
      });
    },
    { rootMargin: '-20% 0px -60% 0px' }
  );

  sections.forEach(section => observer.observe(section));

  // Click handling — smooth scroll
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = link.getAttribute('href').slice(1);
      const target = document.getElementById(targetId);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // Set initial position
  if (navLinks[0]) {
    updateIndicator(navLinks[0]);
  }
}

document.addEventListener('DOMContentLoaded', initNav);

// === Hamburger menu ===
function initHamburger() {
  const hamburger = document.querySelector('.hamburger');
  const sidebar = document.querySelector('.sidebar');
  const navLinks = document.querySelectorAll('.nav-link');

  if (!hamburger || !sidebar) return;

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    sidebar.classList.toggle('open');
  });

  // Close sidebar when a nav link is clicked (mobile)
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      sidebar.classList.remove('open');
    });
  });
}

document.addEventListener('DOMContentLoaded', initHamburger);

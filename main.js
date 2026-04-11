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

// === Nav active indicator + section visibility ===
function initNav() {
  const navLinks = document.querySelectorAll('.nav-link');
  const indicator = document.querySelector('.nav-indicator');
  const sections = document.querySelectorAll('.section');
  const content = document.querySelector('.content');

  if (!navLinks.length || !indicator || !sections.length || !content) return;

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
    history.replaceState(null, '', '#' + id);
  }

  // Click handling — smooth scroll within content container
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

  // Suppress ALL transitions on load so there's no visible flash
  sections.forEach(s => s.style.transition = 'none');
  indicator.style.transition = 'none';
  navLinks.forEach(link => link.style.transition = 'none');

  // Clear active class before any rendering
  navLinks.forEach(link => link.classList.remove('active'));

  // Restore exact scroll position from previous session, or default to top
  const savedScroll = sessionStorage.getItem('scrollPos');
  if (savedScroll !== null) {
    sections.forEach(s => s.classList.add('visible'));
    content.scrollTop = parseInt(savedScroll, 10);
    // Determine which section is visible at the restored position and activate it
    const scrollTop = content.scrollTop;
    let activeSection = sections[0];
    sections.forEach(s => {
      if (s.offsetTop <= scrollTop + content.clientHeight * 0.5) {
        activeSection = s;
      }
    });
    setActiveLink(activeSection.id);
  } else {
    if (navLinks[0]) {
      updateIndicator(navLinks[0]);
    }
    if (sections[0]) {
      sections[0].classList.add('visible');
    }
  }

  // Defer observer start: double-rAF ensures the restored state is fully
  // painted before the observer fires its initial batch of callbacks
  let observerReady = false;
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      observerReady = true;
      sections.forEach(s => s.style.transition = '');
      indicator.style.transition = '';
      navLinks.forEach(link => link.style.transition = '');
    });
  });

  const visibilityObserver = new IntersectionObserver(
    (entries) => {
      if (!observerReady) return;
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          setActiveLink(entry.target.id);
        }
      });
    },
    {
      root: content,
      threshold: 0.05
    }
  );
  sections.forEach(section => visibilityObserver.observe(section));

  // Persist scroll position on every scroll
  content.addEventListener('scroll', () => {
    sessionStorage.setItem('scrollPos', content.scrollTop);
  });
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



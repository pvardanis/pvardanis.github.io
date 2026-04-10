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
  }

  // Observe sections for visibility (fade in/out) and active nav tracking
  const visibilityObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          setActiveLink(entry.target.id);
        } else {
          entry.target.classList.remove('visible');
        }
      });
    },
    {
      root: content,
      threshold: 0.05
    }
  );

  sections.forEach(section => visibilityObserver.observe(section));

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

  // Set initial state — first section visible
  if (navLinks[0]) {
    updateIndicator(navLinks[0]);
  }
  if (sections[0]) {
    sections[0].classList.add('visible');
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

// === Job tags domino animation ===
function initJobTags() {
  const content = document.querySelector('.content');
  const jobs = document.querySelectorAll('.job');
  if (!content || !jobs.length) return;

  // Set staggered transition-delay on each tag
  jobs.forEach(job => {
    const tags = job.querySelectorAll('.job-tags .tag');
    tags.forEach((tag, i) => {
      tag.style.transitionDelay = (i * 40) + 'ms';
    });
  });

  let activeJob = null;

  // Track which jobs are currently visible and pick the one
  // closest to the top of the viewport as the active one
  const visibleJobs = new Set();

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          visibleJobs.add(entry.target);
        } else {
          visibleJobs.delete(entry.target);
        }
      });

      // Of all visible jobs, pick the one closest to the top
      let closest = null;
      let closestTop = Infinity;
      visibleJobs.forEach(job => {
        const rect = job.getBoundingClientRect();
        const top = Math.abs(rect.top);
        if (top < closestTop) {
          closestTop = top;
          closest = job;
        }
      });

      if (closest && closest !== activeJob) {
        if (activeJob) {
          const prevTags = activeJob.querySelector('.job-tags');
          if (prevTags) prevTags.classList.remove('animate');
        }
        activeJob = closest;
        const newTags = activeJob.querySelector('.job-tags');
        if (newTags) newTags.classList.add('animate');
      }
    },
    { root: content, threshold: 0 }
  );

  jobs.forEach(job => observer.observe(job));

  // Re-evaluate on scroll to catch mid-scroll transitions and fade jobs
  const contentRect = content.getBoundingClientRect();

  function updateJobs() {
    const viewH = contentRect.height;

    // Tag switching
    let closest = null;
    let closestTop = Infinity;
    visibleJobs.forEach(job => {
      const rect = job.getBoundingClientRect();
      const top = Math.abs(rect.top - contentRect.top);
      if (top < closestTop) {
        closestTop = top;
        closest = job;
      }
    });

    if (closest && closest !== activeJob) {
      if (activeJob) {
        const prevTags = activeJob.querySelector('.job-tags');
        if (prevTags) prevTags.classList.remove('animate');
      }
      activeJob = closest;
      const newTags = activeJob.querySelector('.job-tags');
      if (newTags) newTags.classList.add('animate');
    }

    // Job content fade based on position in viewport
    jobs.forEach(job => {
      const rect = job.getBoundingClientRect();
      const jobContent = job.querySelector('.job-content');
      if (!jobContent) return;

      const top = rect.top - contentRect.top;
      const fadeZone = viewH * 0.12;
      let opacity = 1;

      if (top < 0) {
        opacity = Math.max(0.05, 1 + top / fadeZone);
      } else if (top > viewH - fadeZone) {
        opacity = Math.max(0.05, (viewH - top) / fadeZone);
      }

      jobContent.style.opacity = opacity;
    });
  }

  content.addEventListener('scroll', updateJobs, { passive: true });
}

document.addEventListener('DOMContentLoaded', initJobTags);

// === Section scroll fade ===
function initSectionFade() {
  const content = document.querySelector('.content');
  const sections = document.querySelectorAll('.section');
  if (!content || !sections.length) return;

  const contentRect = content.getBoundingClientRect();

  content.addEventListener('scroll', () => {
    const viewH = contentRect.height;
    const fadeZone = viewH * 0.12;

    sections.forEach(section => {
      const rect = section.getBoundingClientRect();
      const top = rect.top - contentRect.top;
      let opacity = 1;

      if (top < 0) {
        opacity = Math.max(0.05, 1 + top / fadeZone);
      } else if (top > viewH - fadeZone) {
        opacity = Math.max(0.05, (viewH - top) / fadeZone);
      }

      section.style.opacity = opacity;
    });
  }, { passive: true });
}

document.addEventListener('DOMContentLoaded', initSectionFade);

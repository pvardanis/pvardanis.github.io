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

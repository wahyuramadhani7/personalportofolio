// =========================================================
// DevEngine v2.4 — Portfolio interactions
// =========================================================

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Mobile nav toggle ---------- */
  const hamburger = document.getElementById('hamburger');
  const mainNav = document.getElementById('mainNav');
  hamburger.addEventListener('click', () => {
    mainNav.classList.toggle('open');
    hamburger.classList.toggle('open');
  });
  mainNav.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => mainNav.classList.remove('open'));
  });

  /* ---------- Active nav link on scroll ---------- */
  const sections = document.querySelectorAll('main > .section');
  const navLinks = document.querySelectorAll('.nav-link');

  const setActive = (id) => {
    navLinks.forEach(link => {
      link.classList.toggle('active', link.dataset.section === id);
    });
  };

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) setActive(entry.target.id);
    });
  }, { rootMargin: '-45% 0px -45% 0px' });

  sections.forEach(s => sectionObserver.observe(s));

  /* ---------- "Next section" arrow button in header ---------- */
  document.getElementById('navArrows').addEventListener('click', () => {
    const sectionList = Array.from(sections);
    const current = sectionList.find(s => {
      const r = s.getBoundingClientRect();
      return r.top > -100;
    }) || sectionList[0];
    const idx = sectionList.indexOf(current);
    const next = sectionList[(idx + 1) % sectionList.length];
    next.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  /* ---------- Scroll reveal ---------- */
  const revealItems = document.querySelectorAll('[data-reveal]');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  revealItems.forEach(el => revealObserver.observe(el));

  /* ---------- Initialize Protocol button (about CTA) ---------- */
  document.getElementById('initProtocol').addEventListener('click', () => {
    document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
  });

  /* ---------- Fetch all repos (placeholder action) ---------- */
  const fetchBtn = document.getElementById('fetchRepos');
  fetchBtn.addEventListener('click', () => {
    fetchBtn.textContent = 'LOADING_REPOS...';
    fetchBtn.disabled = true;
    setTimeout(() => {
      fetchBtn.textContent = 'NO_MORE_REPOS_FOUND';
      setTimeout(() => {
        fetchBtn.innerHTML = 'FETCH_ALL_REPOS <span class="fetch-arrow">↘</span>';
        fetchBtn.disabled = false;
      }, 1800);
    }, 900);
  });

  /* ---------- Radar chart (Academic Index) ---------- */
  drawRadarChart();

  /* ---------- Grid City 3D wireframe ---------- */
  drawGridCity();

});

/**
 * Draws an SVG radar/spider chart for the academic skill index.
 * Axes: CS_THEORY, SYSTEMS, MATH, AI/ML, ARCH
 */
function drawRadarChart() {
  const svg = document.getElementById('radarChart');
  if (!svg) return;

  const cx = 130, cy = 118, maxR = 86;
  const axes = [
    { label: 'CS_THEORY', value: 0.95, angle: -90 },
    { label: 'SYSTEMS',   value: 0.78, angle: -18 },
    { label: 'MATH',      value: 0.7,  angle: 54 },
    { label: 'AI/ML',     value: 0.62, angle: 126 },
    { label: 'ARCH',      value: 0.72, angle: 198 },
  ];

  const toPoint = (angleDeg, r) => {
    const rad = (angleDeg * Math.PI) / 180;
    return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
  };

  const ns = 'http://www.w3.org/2000/svg';
  const frag = document.createDocumentFragment();

  // background rings
  [0.25, 0.5, 0.75, 1].forEach(scale => {
    const points = axes.map(a => toPoint(a.angle, maxR * scale).join(',')).join(' ');
    const poly = document.createElementNS(ns, 'polygon');
    poly.setAttribute('points', points);
    poly.setAttribute('fill', 'none');
    poly.setAttribute('stroke', '#e3e7ea');
    poly.setAttribute('stroke-width', '1');
    frag.appendChild(poly);
  });

  // axis lines + labels
  axes.forEach(a => {
    const [x, y] = toPoint(a.angle, maxR);
    const line = document.createElementNS(ns, 'line');
    line.setAttribute('x1', cx); line.setAttribute('y1', cy);
    line.setAttribute('x2', x); line.setAttribute('y2', y);
    line.setAttribute('stroke', '#e3e7ea');
    line.setAttribute('stroke-width', '1');
    frag.appendChild(line);

    const [lx, ly] = toPoint(a.angle, maxR + 20);
    const text = document.createElementNS(ns, 'text');
    text.setAttribute('x', lx);
    text.setAttribute('y', ly);
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('dominant-baseline', 'middle');
    text.setAttribute('font-family', "'IBM Plex Mono', monospace");
    text.setAttribute('font-size', '9.5');
    text.setAttribute('letter-spacing', '0.04em');
    text.setAttribute('fill', '#5f7078');
    text.textContent = a.label;
    frag.appendChild(text);
  });

  // data polygon
  const dataPoints = axes.map(a => toPoint(a.angle, maxR * a.value).join(',')).join(' ');
  const dataPoly = document.createElementNS(ns, 'polygon');
  dataPoly.setAttribute('points', dataPoints);
  dataPoly.setAttribute('fill', 'rgba(31,122,140,0.14)');
  dataPoly.setAttribute('stroke', '#0e3d44');
  dataPoly.setAttribute('stroke-width', '2');
  dataPoly.setAttribute('stroke-linejoin', 'round');
  frag.appendChild(dataPoly);

  // data vertex dots
  axes.forEach(a => {
    const [x, y] = toPoint(a.angle, maxR * a.value);
    const dot = document.createElementNS(ns, 'circle');
    dot.setAttribute('cx', x);
    dot.setAttribute('cy', y);
    dot.setAttribute('r', '3');
    dot.setAttribute('fill', '#0e3d44');
    frag.appendChild(dot);
  });

  svg.setAttribute('viewBox', '0 0 260 236');
  svg.appendChild(frag);
}

/**
 * Draws an animated isometric wireframe grid to represent
 * the "Grid City OS" project thumbnail.
 */
function drawGridCity() {
  const group = document.querySelector('.grid3d-lines');
  if (!group) return;

  const ns = 'http://www.w3.org/2000/svg';
  const cols = 9, rows = 9;
  const originX = 200, originY = 60;
  const stepX = 22, stepY = 11;

  const project = (i, j) => {
    const x = originX + (i - j) * stepX * 0.86;
    const y = originY + (i + j) * stepY * 0.55;
    return [x, y];
  };

  const frag = document.createDocumentFragment();

  for (let i = 0; i <= cols; i++) {
    let d = '';
    for (let j = 0; j <= rows; j++) {
      const [x, y] = project(i, j);
      d += (j === 0 ? `M${x},${y}` : ` L${x},${y}`);
    }
    const path = document.createElementNS(ns, 'path');
    path.setAttribute('d', d);
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', '#1f7a8c');
    path.setAttribute('stroke-width', '0.6');
    path.setAttribute('opacity', '0.45');
    frag.appendChild(path);
  }
  for (let j = 0; j <= rows; j++) {
    let d = '';
    for (let i = 0; i <= cols; i++) {
      const [x, y] = project(i, j);
      d += (i === 0 ? `M${x},${y}` : ` L${x},${y}`);
    }
    const path = document.createElementNS(ns, 'path');
    path.setAttribute('d', d);
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', '#1f7a8c');
    path.setAttribute('stroke-width', '0.6');
    path.setAttribute('opacity', '0.45');
    frag.appendChild(path);
  }

  // scattered "building" nodes with a soft glow
  const nodeCoords = [[2,2],[3,5],[5,2],[6,6],[4,7],[7,3],[1,6]];
  nodeCoords.forEach(([i, j]) => {
    const [x, y] = project(i, j);
    const dot = document.createElementNS(ns, 'circle');
    dot.setAttribute('cx', x);
    dot.setAttribute('cy', y);
    dot.setAttribute('r', '2.6');
    dot.setAttribute('fill', '#37e7ff');
    dot.setAttribute('opacity', '0.9');
    frag.appendChild(dot);
  });

  group.appendChild(frag);
}
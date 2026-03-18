
const menuToggle = document.getElementById('menuToggle');
const sidebar = document.getElementById('sidebar');
if (menuToggle && sidebar) {
  menuToggle.addEventListener('click', () => sidebar.classList.toggle('open'));
}
const links = Array.from(document.querySelectorAll('.toc-link'));
const sections = links.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    const id = '#' + entry.target.id;
    const link = links.find(a => a.getAttribute('href') === id);
    if (link && entry.isIntersecting) {
      links.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
    }
  });
}, { rootMargin: '-25% 0px -60% 0px', threshold: 0.01 });
sections.forEach(s => observer.observe(s));


// Editorial atmosphere motion
const atmoShells = Array.from(document.querySelectorAll('.section-shell--atmo'));
const clamp = (num, min, max) => Math.min(Math.max(num, min), max);
function updateAtmoMotion(){
  const vh = window.innerHeight || 1;
  atmoShells.forEach(shell => {
    const rect = shell.getBoundingClientRect();
    const center = rect.top + rect.height / 2;
    const progress = clamp((vh / 2 - center) / vh, -1, 1);
    shell.style.setProperty('--scroll-shift', `${progress * 30}px`);
  });
}
window.addEventListener('scroll', updateAtmoMotion, { passive: true });
window.addEventListener('resize', updateAtmoMotion);
updateAtmoMotion();
atmoShells.forEach(shell => {
  shell.addEventListener('mousemove', (event) => {
    const rect = shell.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 22;
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * 18;
    shell.style.setProperty('--mx', `${x}px`);
    shell.style.setProperty('--my', `${y}px`);
  });
  shell.addEventListener('mouseleave', () => {
    shell.style.setProperty('--mx', '0px');
    shell.style.setProperty('--my', '0px');
  });
});


// ===== v26 nav + figure layout refinement =====
document.addEventListener('DOMContentLoaded', () => {
  const body = document.body;
  const topbar = document.querySelector('.topbar');
  const tocLinks = Array.from(document.querySelectorAll('.toc-link'));
  const allSections = Array.from(document.querySelectorAll('.doc-section'));

  // Populate TOC hrefs if missing and keep current text labels
  tocLinks.forEach((link, index) => {
    if (!link.getAttribute('href')) {
      const target = allSections[index];
      if (target) link.setAttribute('href', `#${target.id}`);
    }
  });

  // Button toggles nav drawer for click/touch use
  if (menuToggle && sidebar) {
    menuToggle.addEventListener('click', (event) => {
      event.stopPropagation();
      const open = body.classList.toggle('nav-open');
      sidebar.classList.toggle('open', open);
    });
    document.addEventListener('click', (event) => {
      if (!sidebar.contains(event.target) && !menuToggle.contains(event.target) && body.classList.contains('nav-open')) {
        body.classList.remove('nav-open');
        sidebar.classList.remove('open');
      }
    });
  }

  // Wrap first image-heavy blocks into a cleaner grid on page 2
  const page2 = document.getElementById('page-2-status-quo-overview');
  if (page2) {
    const shell = page2.querySelector('.section-shell');
    const directFigures = Array.from(shell.children).filter(node => node.classList && node.classList.contains('doc-figure'));
    if (directFigures.length >= 5 && !shell.querySelector('.figure-grid--stats')) {
      const grid = document.createElement('div');
      grid.className = 'figure-grid figure-grid--stats';
      directFigures.slice(0,5).forEach(fig => grid.appendChild(fig));
      shell.insertBefore(grid, shell.children[2] || shell.firstChild);
    }
  }

  // Transform interview partner section into paired profile blocks
  const partners = document.getElementById('page-35-introducing-our-interview-partners');
  if (partners) {
    const shell = partners.querySelector('.section-shell');
    const children = Array.from(shell.children);
    let idx = 0;
    let built = false;
    for (let i = 0; i < children.length - 1; i++) {
      const fig = children[i];
      const text = children[i+1];
      if (fig.classList && fig.classList.contains('doc-figure') && text.tagName === 'P' && !fig.closest('.partner-block')) {
        const block = document.createElement('div');
        block.className = 'partner-block' + (idx % 2 ? ' partner-block--reverse' : '');
        const figWrap = document.createElement('div');
        figWrap.className = 'partner-figure';
        const textWrap = document.createElement('div');
        textWrap.className = 'partner-text';
        fig.parentNode.insertBefore(block, fig);
        figWrap.appendChild(fig);
        textWrap.appendChild(text);
        block.append(figWrap, textWrap);
        idx += 1;
        built = true;
      }
    }
  }

  // Tighter active-state observer using sections after hrefs are set
  const updatedLinks = Array.from(document.querySelectorAll('.toc-link[href^="#"]'));
  const observedSections = updatedLinks.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
  if (updatedLinks.length && observedSections.length) {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = '#' + entry.target.id;
          updatedLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === id));
        }
      });
    }, { rootMargin: '-18% 0px -70% 0px', threshold: 0.02 });
    observedSections.forEach(sec => obs.observe(sec));
  }
});

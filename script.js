// Reveal elements as they scroll into view
const fadeEls = document.querySelectorAll('.fade-up');

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
);

fadeEls.forEach((el) => observer.observe(el));

// Embroidery toggle – independent per category
document.querySelectorAll('.emb-toggle').forEach((toggle) => {
  toggle.querySelectorAll('.emb-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const emb      = btn.dataset.emb;
      const catId    = toggle.dataset.category;
      const category = document.getElementById(catId);
      const grid     = category.querySelector('.product-grid');

      // Update button state
      toggle.querySelectorAll('.emb-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      // Cross-fade images via CSS class
      if (emb === 'black') {
        category.classList.add('emb-black-active');
      } else {
        category.classList.remove('emb-black-active');
      }

      // Swap Etsy href
      const hrefKey = emb === 'white' ? 'hrefWhite' : 'hrefBlack';
      category.querySelectorAll('a[data-href-white]').forEach((link) => {
        const newHref = link.dataset[hrefKey];
        if (newHref) link.href = newHref;
      });

      // Cards without a black variant – only Focus/Endure/Try harder hoodies
      const noBlackCards = [...category.querySelectorAll('.product-card')]
        .filter(card => !card.hasAttribute('data-emb-black'));

      if (!grid || noBlackCards.length === 0) return;

      const FADE_MS    = 220; // matches .product-card opacity transition (180ms) + buffer
      const COLLAPSE_MS = 400;

      clearTimeout(grid._t1);
      clearTimeout(grid._t2);

      if (emb === 'black') {
        // 1. Snapshot full grid height before any changes
        const h0 = grid.getBoundingClientRect().height;

        // 2. Fade out cards (visual only – no layout change yet)
        noBlackCards.forEach(card => {
          card.style.display = '';
          card.classList.add('card-hidden');
        });

        // 3. After fade: lock height, remove cards from layout, animate collapse
        grid._t1 = setTimeout(() => {
          // Lock grid at h0 so no jump when display:none fires
          grid.style.transition = 'none';
          grid.style.overflow   = 'hidden';
          grid.style.height     = h0 + 'px';

          noBlackCards.forEach(card => { card.style.display = 'none'; });

          // Temporarily release to measure natural collapsed height, then lock back
          grid.style.height = '';
          const h1 = grid.getBoundingClientRect().height;
          grid.style.height = h0 + 'px';

          requestAnimationFrame(() => {
            grid.style.transition = `height ${COLLAPSE_MS}ms cubic-bezier(0.4, 0, 0.2, 1)`;
            grid.style.height     = h1 + 'px';
          });

          grid._t2 = setTimeout(() => {
            grid.style.height     = '';
            grid.style.transition = '';
            grid.style.overflow   = '';
          }, COLLAPSE_MS + 60);
        }, FADE_MS);

      } else {
        // 1. Snapshot current (collapsed) height
        const h0 = grid.getBoundingClientRect().height;

        // 2. Restore cards to layout but keep invisible for measurement
        noBlackCards.forEach(card => {
          card.style.display = '';
          card.classList.add('card-hidden');
        });

        // 3. Measure expanded height
        const h1 = grid.getBoundingClientRect().height;

        // 4. Lock at h0, then animate to h1 while fading cards in
        grid.style.transition = 'none';
        grid.style.overflow   = 'hidden';
        grid.style.height     = h0 + 'px';

        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            grid.style.transition = `height ${COLLAPSE_MS}ms cubic-bezier(0.4, 0, 0.2, 1)`;
            grid.style.height     = h1 + 'px';
            noBlackCards.forEach(card => card.classList.remove('card-hidden'));
          });
        });

        grid._t2 = setTimeout(() => {
          grid.style.height     = '';
          grid.style.transition = '';
          grid.style.overflow   = '';
        }, COLLAPSE_MS + 60);
      }
    });
  });
});

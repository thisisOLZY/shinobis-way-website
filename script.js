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

      // Cards without a black variant – Focus/Endure/Try harder hoodies only
      const noBlackCards = [...category.querySelectorAll('.product-card')]
        .filter(card => !card.hasAttribute('data-emb-black'));

      if (!grid || noBlackCards.length === 0) return;

      const FADE_MS    = 220;  // card fade-out duration
      const COLLAPSE_MS = 320; // grid height animation duration

      clearTimeout(grid._t1);
      clearTimeout(grid._t2);
      clearTimeout(grid._t3);

      if (emb === 'black') {
        // ── Hiding: fade cards → collapse grid ──────────────────────────
        const h0 = grid.getBoundingClientRect().height;

        noBlackCards.forEach(card => {
          card.style.display = '';
          card.classList.add('card-hidden');
        });

        grid._t1 = setTimeout(() => {
          // Lock height so display:none causes no visible snap
          grid.style.transition = 'none';
          grid.style.overflow   = 'hidden';
          grid.style.height     = h0 + 'px';

          noBlackCards.forEach(card => { card.style.display = 'none'; });

          // Measure natural collapsed height, then animate
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
          }, COLLAPSE_MS + 50);
        }, FADE_MS);

      } else {
        // ── Showing: expand grid first → then fade cards in ─────────────
        // This avoids cards being visible while still clipped by overflow.
        const h0 = grid.getBoundingClientRect().height;

        noBlackCards.forEach(card => {
          card.style.display = '';
          card.classList.add('card-hidden'); // invisible during measurement
        });

        const h1 = grid.getBoundingClientRect().height;

        grid.style.transition = 'none';
        grid.style.overflow   = 'hidden';
        grid.style.height     = h0 + 'px';

        // Animate height to expanded
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            grid.style.transition = `height ${COLLAPSE_MS}ms cubic-bezier(0.4, 0, 0.2, 1)`;
            grid.style.height     = h1 + 'px';
          });
        });

        // Only after height is fully expanded: remove clip and fade in cards
        grid._t2 = setTimeout(() => {
          grid.style.overflow = '';
          noBlackCards.forEach(card => card.classList.remove('card-hidden'));

          // Clean up inline height after card fade completes
          grid._t3 = setTimeout(() => {
            grid.style.height     = '';
            grid.style.transition = '';
          }, 250);
        }, COLLAPSE_MS + 20);
      }
    });
  });
});

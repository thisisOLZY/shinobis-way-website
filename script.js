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
      const emb     = btn.dataset.emb;                              // "white" or "black"
      const catId   = toggle.dataset.category;
      const category = document.getElementById(catId);

      // Update active button state within this toggle only
      toggle.querySelectorAll('.emb-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      // Cross-fade images via CSS class – no src-swapping, no timeouts
      if (emb === 'black') {
        category.classList.add('emb-black-active');
      } else {
        category.classList.remove('emb-black-active');
      }

      // Show/hide cards without a black variant (hoodies only)
      const FADE_MS = 320;
      category.querySelectorAll('.product-card').forEach((card) => {
        const hasBlack = card.hasAttribute('data-emb-black');
        clearTimeout(card._hideTimer);

        if (emb === 'black' && !hasBlack) {
          card.classList.add('card-hidden');
          card._hideTimer = setTimeout(() => { card.style.display = 'none'; }, FADE_MS);
        } else {
          card.style.display = '';
          requestAnimationFrame(() => requestAnimationFrame(() => card.classList.remove('card-hidden')));
        }
      });

      // Swap Etsy listing href
      const hrefKey = emb === 'white' ? 'hrefWhite' : 'hrefBlack';
      category.querySelectorAll('a[data-href-white]').forEach((card) => {
        const newHref = card.dataset[hrefKey];
        if (newHref) card.href = newHref;
      });
    });
  });
});

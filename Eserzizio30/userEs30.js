// user.js — User-only logic: read-only cart view, search, confirm

(function init() {
  const session = requireSession('user');
  if (!session) return;

  // Set role class so buildCard knows NOT to show remove button
  document.body.classList.add('role-user');

  // Show username in header
  const headerUser = document.getElementById('header-username');
  if (headerUser) headerUser.textContent = session.username;

  // Load shared cart (set by admin)
  loadCart();

  // Load reviews async
  loadReviews();

  // Initial render (no remove buttons — role-admin class not set)
  renderCart();
  updateTotal();

  // Poll for cart changes every 10 seconds (so user sees admin updates in real time)
  setInterval(() => {
    const sizeBefore = cart.size;
    cart.clear();
    loadCart();
    if (cart.size !== sizeBefore) {
      loadReviews().then(() => {
        renderCart();
        updateTotal();
      });
    }
  }, 10000);
})();

// admin.js — Admin-only logic: add/remove products, form validation

(function init() {
  const session = requireSession('admin');
  if (!session) return;

  // Set role class for buildCard
  document.body.classList.add('role-admin');

  // Show username in header
  const headerUser = document.getElementById('header-username');
  if (headerUser) headerUser.textContent = session.username;

  // Load persisted cart
  loadCart();

  // Load async reviews from API
  loadReviews();

  // Initial render
  renderCart();
  updateTotal();
})();

// ── Form validation & add ────────────────────────────────────────────────────
async function addProduct() {
  const nome    = document.getElementById('inp-name').value.trim();
  const prezzo  = document.getElementById('inp-price').value.trim();
  const img     = document.getElementById('inp-img').value.trim();

  const alertEl = document.getElementById('form-alert');

  // Validation
  if (!nome) {
    showFormAlert('Inserisci il nome del prodotto.', 'error');
    return;
  }
  if (!prezzo || isNaN(parseFloat(prezzo)) || parseFloat(prezzo) < 0) {
    showFormAlert('Inserisci un prezzo numerico valido.', 'error');
    return;
  }

  // Show loading state
  const btnText    = document.getElementById('btn-add-text');
  const btnSpinner = document.getElementById('btn-add-spinner');
  const btnAdd     = document.getElementById('btn-add');
  btnText.style.display = 'none';
  btnSpinner.style.display = 'inline';
  btnAdd.disabled = true;

  // If reviews not loaded yet, try loading them
  if (reviewsCache.length === 0) {
    await loadReviews();
  }

  // Add to cart
  const prod = addToCart(nome, prezzo, img || '');

  // Reset UI
  btnText.style.display = 'inline';
  btnSpinner.style.display = 'none';
  btnAdd.disabled = false;

  // Clear form
  document.getElementById('inp-name').value  = '';
  document.getElementById('inp-price').value = '';
  document.getElementById('inp-img').value   = '';

  showFormAlert(`"${prod.nome}" aggiunto al carrello!`, 'success');
}

function showFormAlert(msg, type) {
  const el = document.getElementById('form-alert');
  el.textContent = msg;
  el.className = `alert alert-${type}`;
  el.style.display = 'block';
  clearTimeout(el._timer);
  el._timer = setTimeout(() => { el.style.display = 'none'; }, 3500);
}

// ── Enter key on form ────────────────────────────────────────────────────────
document.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    const active = document.activeElement;
    const inForm = ['inp-name','inp-price','inp-img'].includes(active?.id);
    if (inForm) addProduct();
  }
});

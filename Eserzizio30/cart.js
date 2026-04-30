// cart.js — OOP, Map, async reviews, shared cart state

// ══════════════════════════════════════════════════════
// CLASS: Prodotto
// ══════════════════════════════════════════════════════
class Prodotto {
  constructor(id, nome, prezzo, immagine, rating = null) {
    this.id      = id;          // productID dall'API recensioni
    this.nome    = nome;
    this.prezzo  = parseFloat(prezzo);
    this.immagine = immagine;
    this.rating  = rating;
  }

  getPrezzoFormattato() {
    return this.prezzo.toFixed(2) + ' €';
  }

  getRatingStars() {
    if (this.rating === null) return '—';
    const full  = Math.floor(this.rating);
    const half  = (this.rating - full) >= 0.5;
    const empty = 5 - full - (half ? 1 : 0);
    return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(Math.max(0, empty));
  }
}

// ══════════════════════════════════════════════════════
// CART MAP  –  chiave: productID (string), valore: Prodotto
// ══════════════════════════════════════════════════════
const cart = new Map();

// ══════════════════════════════════════════════════════
// RECENSIONI API
// ══════════════════════════════════════════════════════
const API_URL = 'https://69f0b583c1533dbedc9d9957.mockapi.io/review/recensioni';
// reviewsCache: array ordinato di { id, productID, rating, name, createdAt }
// L'API reale ha questa struttura:
// { id:"1", productID:"3491bedef0d929edcb59b79b", rating:3, name:"...", createdAt:"..." }
let reviewsCache = [];

async function loadReviews() {
  try {
    const res = await fetch(API_URL);
    if (!res.ok) throw new Error('Errore API ' + res.status);
    reviewsCache = await res.json();
    // Ordina per id numerico crescente (1,2,3...) — ordine canonico
    reviewsCache.sort((a, b) => parseInt(a.id) - parseInt(b.id));
    // Riassegna i rating ai prodotti già in carrello (nel caso fossero stati caricati prima)
    Array.from(cart.values()).forEach((p, idx) => {
      const review = reviewsCache[idx];
      if (review) {
        p.rating    = parseFloat(review.rating);
        p.reviewName = review.name;
      }
    });
    renderCart();
  } catch (err) {
    console.warn('Impossibile caricare le recensioni:', err.message);
  }
}

/**
 * Restituisce il rating per il prodotto in posizione `index` (0-based)
 * secondo l'ordine dell'API.  Il productID dell'API viene usato come chiave
 * del carrello (Map), esattamente come richiesto dalla consegna.
 */
function getRatingAtIndex(index) {
  if (index < reviewsCache.length) {
    return parseFloat(reviewsCache[index].rating);
  }
  return null;
}

function getReviewNameAtIndex(index) {
  if (index < reviewsCache.length) return reviewsCache[index].name;
  return null;
}

function getNextProductID() {
  // Il productID è quello fornito dall'API alla posizione corrispondente
  const idx = cart.size; // prima di aggiungere il nuovo prodotto
  if (reviewsCache.length > 0 && idx < reviewsCache.length) {
    return String(reviewsCache[idx].productID);
  }
  // Fallback se l'API ha meno recensioni dei prodotti aggiunti
  return 'p_' + Date.now();
}

// ══════════════════════════════════════════════════════
// CART OPERATIONS
// ══════════════════════════════════════════════════════
function addToCart(nome, prezzo, immagine) {
  const idx    = cart.size;           // indice corrente PRIMA di aggiungere
  const id     = getNextProductID();  // usa reviewsCache[idx].productID
  const rating = getRatingAtIndex(idx);
  const prod   = new Prodotto(id, nome, prezzo, immagine, rating);
  cart.set(id, prod);
  // Persist shared cart
  saveCart();
  renderCart();
  updateTotal();
  return prod;
}

function removeFromCart(id) {
  cart.delete(id);
  saveCart();
  renderCart();
  updateTotal();
}

// ══════════════════════════════════════════════════════
// TOTAL CALCULATION
// ══════════════════════════════════════════════════════
function calcTotal() {
  return Array.from(cart.values()).reduce((sum, p) => sum + p.prezzo, 0);
}

function updateTotal() {
  const el = document.getElementById('total-display');
  if (el) el.textContent = calcTotal().toFixed(2) + ' €';

  const countEl = document.getElementById('product-count');
  if (countEl) {
    const n = cart.size;
    countEl.textContent = n + (n === 1 ? ' prodotto' : ' prodotti');
  }
}

// ══════════════════════════════════════════════════════
// RENDER CART
// ══════════════════════════════════════════════════════
let currentSearch = '';

function renderCart(filter = currentSearch) {
  currentSearch = filter;
  const grid     = document.getElementById('products-grid');
  const emptyEl  = document.getElementById('empty-state');
  if (!grid) return;

  // Convert Map → Array, filter by search
  let products = Array.from(cart.values());
  if (filter.trim()) {
    const q = filter.trim().toLowerCase();
    products = products.filter(p => p.nome.toLowerCase().includes(q));
  }

  // Remove existing cards (keep empty-state)
  grid.querySelectorAll('.card').forEach(c => c.remove());

  if (products.length === 0) {
    if (emptyEl) {
      emptyEl.style.display = '';
      emptyEl.querySelector('p').innerHTML = filter.trim()
        ? `Nessun prodotto trovato per "<strong>${escHtml(filter)}</strong>".`
        : 'Nessun prodotto nel carrello.<br/>Aggiungi il primo prodotto qui sopra.';
    }
    return;
  }

  if (emptyEl) emptyEl.style.display = 'none';

  products.forEach(prod => {
    const card = buildCard(prod, true);
    grid.appendChild(card);
  });
}

function buildCard(prod, showRemove = true) {
  const card = document.createElement('div');
  card.className = 'card';
  card.dataset.id = prod.id;

  const imgHtml = prod.immagine
    ? `<img class="card-img" src="${escHtml(prod.immagine)}" alt="${escHtml(prod.nome)}" onerror="this.style.display='none';this.nextElementSibling.style.display='flex';" />
       <div class="card-img-placeholder" style="display:none;">🖼️</div>`
    : `<div class="card-img-placeholder">🖼️</div>`;

  const ratingHtml = prod.rating !== null
    ? `<span class="stars">${prod.getRatingStars()}</span> ${prod.rating}`
    : `<span style="color:var(--text-light)">—</span>`;

  const removeBtn = showRemove
    ? `<button class="btn btn-danger" onclick="removeFromCart('${escHtml(prod.id)}')">Rimuovi</button>`
    : '';

  card.innerHTML = `
    ${imgHtml}
    <div class="card-body">
      <p class="card-name" title="${escHtml(prod.nome)}">${escHtml(prod.nome)}</p>
      <p class="card-price">${prod.getPrezzoFormattato()}</p>
      <div class="card-rating">Rating: ${ratingHtml}</div>
      ${removeBtn}
    </div>
  `;

  return card;
}

// ══════════════════════════════════════════════════════
// SUMMARY (CONFIRM)
// ══════════════════════════════════════════════════════
function confirmCart() {
  if (cart.size === 0) {
    alert('Il carrello è vuoto!');
    return;
  }

  const overlay  = document.getElementById('summary-overlay');
  const list     = document.getElementById('summary-list');
  const totalEl  = document.getElementById('summary-total');

  if (!overlay) return;

  const products = Array.from(cart.values());
  list.innerHTML = products.map(p => `
    <li>
      <span>${escHtml(p.nome)}</span>
      <strong>${p.getPrezzoFormattato()}</strong>
    </li>
  `).join('');

  totalEl.textContent = 'Totale: ' + calcTotal().toFixed(2) + ' €';
  overlay.style.display = 'flex';
}

function closeSummary() {
  const overlay = document.getElementById('summary-overlay');
  if (overlay) overlay.style.display = 'none';
}

function closeSummaryOutside(e) {
  if (e.target === document.getElementById('summary-overlay')) closeSummary();
}

// ══════════════════════════════════════════════════════
// DEBOUNCE
// ══════════════════════════════════════════════════════
function debounce(fn, delay) {
  let timer;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

const debouncedSearch = debounce(function(value) {
  renderCart(value);
}, 350);

// ══════════════════════════════════════════════════════
// SHARED CART PERSISTENCE (localStorage)
// ══════════════════════════════════════════════════════
function saveCart() {
  const data = Array.from(cart.values()).map(p => ({
    id: p.id, nome: p.nome, prezzo: p.prezzo, immagine: p.immagine, rating: p.rating
  }));
  localStorage.setItem('bc_cart', JSON.stringify(data));
}

function loadCart() {
  const raw = localStorage.getItem('bc_cart');
  if (!raw) return;
  try {
    const data = JSON.parse(raw);
    data.forEach(d => {
      const p = new Prodotto(d.id, d.nome, d.prezzo, d.immagine, d.rating);
      cart.set(p.id, p);
    });
  } catch { /* ignore */ }
}

// ══════════════════════════════════════════════════════
// UTILS
// ══════════════════════════════════════════════════════
function escHtml(s) {
  return String(s)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;');
}

// ══════════════════════════════════════════════════════
// SESSION CHECK (shared)
// ══════════════════════════════════════════════════════
function requireSession(expectedRole) {
  const raw = sessionStorage.getItem('bc_session');
  if (!raw) { window.location.href = 'login.html'; return null; }
  const session = JSON.parse(raw);
  if (expectedRole && session.role !== expectedRole) {
    window.location.href = session.role === 'admin' ? 'admin.html' : 'user.html';
    return null;
  }
  return session;
}

function logout() {
  sessionStorage.removeItem('bc_session');
  window.location.href = 'login.html';
}

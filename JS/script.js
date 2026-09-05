// header muda leve opacidade ao rolar (efeito sutil, sem exagero)
const header = document.querySelector("header");
window.addEventListener("scroll", () => {
  if (window.scrollY > 40) {
    header.style.padding = "18px 6%";
  } else {
    header.style.padding = "28px 6%";
  }
});

// menu mobile (hambúrguer)
const menuToggle = document.getElementById("menuToggle");
const mobileNav = document.getElementById("mobileNav");

function closeMobileMenu() {
  menuToggle.classList.remove("open");
  mobileNav.classList.remove("open");
  menuToggle.setAttribute("aria-expanded", "false");
}

function toggleMobileMenu() {
  const isOpen = mobileNav.classList.toggle("open");
  menuToggle.classList.toggle("open", isOpen);
  menuToggle.setAttribute("aria-expanded", String(isOpen));
}

menuToggle.addEventListener("click", toggleMobileMenu);
mobileNav.querySelectorAll(".mobile-nav-link").forEach((link) => {
  link.addEventListener("click", closeMobileMenu);
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeMobileMenu();
});

// reveal on scroll simples
const revealEls = document.querySelectorAll(".card, .craft-item, .swatch");
const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.style.opacity = 1;
        e.target.style.transform = "none";
        io.unobserve(e.target);
      }
    });
  },
  { threshold: 0.15 },
);

revealEls.forEach((el) => {
  el.style.opacity = 0;
  el.style.transform = "translateY(24px)";
  el.style.transition = "opacity 0.6s ease, transform 0.6s ease";
  io.observe(el);
});

// form (placeholder - sem backend ainda)
document.getElementById("joinForm").addEventListener("submit", function (e) {
  e.preventDefault();
  this.querySelector("button").textContent = "Feito ✓";
});

// ---------- MERCADO PAGO (Link de Pagamento) ----------
// Gere um link pra cada produto em: conta Mercado Pago > Cobrar >
// Link de pagamento (ou "Ferramentas de venda" > Links de pagamento).
// Depois é só colar a URL de cada produto aqui, trocando os
// "COLE-O-LINK-AQUI":
const MP_LINKS = {
  "VOID-001": "https://mpago.la/COLE-O-LINK-AQUI-001",
  "VOID-002": "https://mpago.la/COLE-O-LINK-AQUI-002",
  "VOID-003": "https://mpago.la/COLE-O-LINK-AQUI-003",
  "VOID-004": "https://mpago.la/COLE-O-LINK-AQUI-004",
  "VOID-005": "https://mpago.la/COLE-O-LINK-AQUI-005",
  "VOID-006": "https://mpago.la/COLE-O-LINK-AQUI-006",
};

function isLinkConfigured(link) {
  return Boolean(link) && !link.includes("COLE-O-LINK-AQUI");
}

function payItem(id) {
  const link = MP_LINKS[id];
  if (!isLinkConfigured(link)) {
    showToast("Link do Mercado Pago ainda não configurado pra esse produto");
    return;
  }
  window.open(link, "_blank");
}

// ---------- CARRINHO ----------
const CART_KEY = "void_cart";

function loadCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch (e) {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function formatBRL(value) {
  return "R$ " + value.toLocaleString("pt-BR");
}

function addToCart(product) {
  const cart = loadCart();
  const existing = cart.find((item) => item.id === product.id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({
      ...product,
      mpLink: MP_LINKS[product.id] || null,
      qty: 1,
    });
  }
  saveCart(cart);
  renderCart();
  showToast(product.name + " adicionado à sacola");
}

function changeQty(id, delta) {
  let cart = loadCart();
  const item = cart.find((i) => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    cart = cart.filter((i) => i.id !== id);
  }
  saveCart(cart);
  renderCart();
}

function removeFromCart(id) {
  const cart = loadCart().filter((i) => i.id !== id);
  saveCart(cart);
  renderCart();
}

function renderCart() {
  const cart = loadCart();
  const itemsEl = document.getElementById("cartItems");
  const countEl = document.getElementById("cartCount");
  const totalEl = document.getElementById("cartTotal");
  const checkoutBtn = document.getElementById("cartCheckout");

  const totalQty = cart.reduce((sum, i) => sum + i.qty, 0);
  countEl.textContent = totalQty;

  if (cart.length === 0) {
    itemsEl.innerHTML = '<p class="cart-empty">Sua sacola está vazia.</p>';
    checkoutBtn.disabled = true;
  } else {
    checkoutBtn.disabled = false;
    itemsEl.innerHTML = cart
      .map(
        (item) => `
  <div class="cart-item">
    <img src="${item.img}" alt="${item.name}">
    <div>
      <div class="cart-item-name">${item.name}</div>
      <div class="cart-item-code mono">${item.id}</div>
      <div class="cart-item-qty">
        <button class="qty-btn" data-action="dec" data-id="${item.id}">−</button>
        <span class="mono">${item.qty}</span>
        <button class="qty-btn" data-action="inc" data-id="${item.id}">+</button>
      </div>
    </div>
    <div>
      <div class="cart-item-price mono">${formatBRL(item.price * item.qty)}</div>
      <button class="cart-item-pay mono" data-action="pay" data-id="${item.id}">Pagar</button>
      <button class="cart-item-remove" data-action="remove" data-id="${item.id}">Remover</button>
    </div>
  </div>
`,
      )
      .join("");
  }

  const total = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  totalEl.textContent = formatBRL(total);
}

let toastTimer;
function showToast(message) {
  let toast = document.querySelector(".toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.className = "toast";
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
}

function openCart() {
  document.getElementById("cartDrawer").classList.add("open");
  document.getElementById("cartOverlay").classList.add("open");
}

function closeCart() {
  document.getElementById("cartDrawer").classList.remove("open");
  document.getElementById("cartOverlay").classList.remove("open");
}

// liga o botão "+ Adicionar" de cada card do grid
document.querySelectorAll(".card[data-id]").forEach((card) => {
  const btn = card.querySelector(".card-add");
  if (!btn) return;
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    const img = card.querySelector("img");
    addToCart({
      id: card.dataset.id,
      name: card.dataset.name,
      price: Number(card.dataset.price),
      img: img ? img.getAttribute("src") : "",
    });
    btn.classList.add("just-added");
    const original = btn.textContent;
    btn.textContent = "Adicionado ✓";
    setTimeout(() => {
      btn.textContent = original;
      btn.classList.remove("just-added");
    }, 1200);
  });
});

// ações dentro do carrinho (+ / − / remover)
document.getElementById("cartItems").addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-action]");
  if (!btn) return;
  const id = btn.dataset.id;
  if (btn.dataset.action === "inc") changeQty(id, 1);
  if (btn.dataset.action === "dec") changeQty(id, -1);
  if (btn.dataset.action === "remove") removeFromCart(id);
  if (btn.dataset.action === "pay") payItem(id);
});

document.getElementById("cartToggle").addEventListener("click", openCart);
document.getElementById("cartClose").addEventListener("click", closeCart);
document.getElementById("cartOverlay").addEventListener("click", closeCart);

document.getElementById("cartCheckout").addEventListener("click", () => {
  const cart = loadCart();
  if (cart.length === 0) return;

  const semLink = cart.filter((item) => !isLinkConfigured(item.mpLink));
  if (semLink.length > 0) {
    showToast("Alguns produtos ainda não têm link do Mercado Pago");
  }

  // como são links de pagamento individuais (sem backend), cada
  // produto abre em uma aba pra pagamento separado
  cart.forEach((item, i) => {
    if (!isLinkConfigured(item.mpLink)) return;
    setTimeout(() => window.open(item.mpLink, "_blank"), i * 300);
  });
});

renderCart();

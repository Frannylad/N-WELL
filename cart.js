// Nüwell Cart Logic - localStorage based
(function () {
  const CART_KEY = 'nuwell_cart';

  // ---- Core helpers ----
  function getCart() {
    try {
      return JSON.parse(localStorage.getItem(CART_KEY)) || [];
    } catch {
      return [];
    }
  }

  function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    updateCartCount();
    // Dispatch event so other scripts can react
    window.dispatchEvent(new CustomEvent('cartUpdated'));
  }

  function getCartCount() {
    return getCart().reduce((sum, item) => sum + item.quantity, 0);
  }

  function getCartTotal() {
    return getCart().reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  // ---- Public API ----
  window.NuwellCart = {
    getCart,
    getCartCount,
    getCartTotal,

    addItem(id, name, price, quantity = 1) {
      const cart = getCart();
      const existing = cart.find(item => item.id === id);

      if (existing) {
        existing.quantity += quantity;
      } else {
        cart.push({ id, name, price: Number(price), quantity });
      }
      saveCart(cart);
      return cart;
    },

    removeItem(id) {
      const cart = getCart().filter(item => item.id !== id);
      saveCart(cart);
      return cart;
    },

    updateQuantity(id, quantity) {
      const cart = getCart();
      const item = cart.find(i => i.id === id);
      if (item) {
        item.quantity = Math.max(1, Number(quantity));
        saveCart(cart);
      }
      return cart;
    },

    clear() {
      localStorage.removeItem(CART_KEY);
      updateCartCount();
      window.dispatchEvent(new CustomEvent('cartUpdated'));
    }
  };

  // ---- UI helpers ----
  function updateCartCount() {
    const count = getCartCount();
    document.querySelectorAll('.cart-count').forEach(el => {
      el.textContent = count;
      el.style.display = count > 0 ? 'flex' : 'none';
    });
  }

  // Run on every page load
  document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();

    // Attach click handlers to all "Add to Cart" buttons
    document.querySelectorAll('[data-add-to-cart]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const id = btn.dataset.id;
        const name = btn.dataset.name;
        const price = btn.dataset.price;

        if (!id || !name || !price) return;

        NuwellCart.addItem(id, name, price);
        
        // Visual feedback
        const original = btn.textContent;
        btn.textContent = 'Added ✓';
        btn.style.background = '#8A9A82';
        setTimeout(() => {
          btn.textContent = original;
          btn.style.background = '';
        }, 1400);
      });
    });
  });
})();

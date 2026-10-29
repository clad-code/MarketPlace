import { products } from './products.js'
const productsGrid = document.getElementById("productsGrid");
const searchInput = document.getElementById("searchInput");
const productCount = document.getElementById("productCount");
const emptyMessage = document.getElementById("emptyMessage");

const cartCount = document.getElementById("cartCount");
const cartDialog = document.getElementById("cartDialog");
const cartItems = document.getElementById("cartItems");
const cartTotal = document.getElementById("cartTotal");

const sellDialog = document.getElementById("sellDialog");

let selectedCategory = "All";
let cart = [];
let wishlist = new Set();

function formatPrice(price) {
  return "KSh " + price.toLocaleString("en-KE");
}

function renderProducts() {
  const searchTerm = searchInput.value.trim().toLowerCase();

  const filteredProducts = products.filter(product => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm) ||
      product.category.toLowerCase().includes(searchTerm);

    const matchesCategory =
      selectedCategory === "All" ||
      product.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  productsGrid.innerHTML = filteredProducts.map(product => `
    <article class="product-card">
      <div class="product-image">
        <img
          src="${product.image}"
          alt="${product.name}"
          loading="lazy"
          onerror="this.onerror=null;this.src='https://placehold.co/400x300?text=Product'">

        <button
          class="wishlist ${wishlist.has(product.id) ? "liked" : ""}"
          data-wishlist="${product.id}"
          aria-label="Toggle wishlist">
          ${wishlist.has(product.id) ? "♥" : "♡"}
        </button>
      </div>

      <div class="product-info">
        <p class="product-category">${product.category}</p>
        <h3>${product.name}</h3>
        <p class="price">${formatPrice(product.price)}</p>

        <p class="rating">
          ★ ${product.rating}
          <small>(${product.reviews} reviews)</small>
        </p>

        <button class="add-to-cart" data-add="${product.id}">
          🛒 Add to Cart
        </button>
      </div>
    </article>
  `).join("");

  productCount.textContent =
    `${filteredProducts.length} products`;

  emptyMessage.hidden = filteredProducts.length !== 0;
}

// Search products
searchInput.addEventListener("input", renderProducts);

// Filter by category
document.getElementById("categoriesList")
  .addEventListener("click", event => {
    const button = event.target.closest("[data-category]");

    if (!button) return;

    selectedCategory = button.dataset.category;

    document.querySelectorAll(".category").forEach(category => {
      category.classList.toggle(
        "active",
        category === button
      );
    });

    renderProducts();
  });

// Event delegation for product buttons
productsGrid.addEventListener("click", event => {
  const addButton = event.target.closest("[data-add]");
  const wishlistButton = event.target.closest("[data-wishlist]");

  if (addButton) {
    const id = Number(addButton.dataset.add);
    const product = products.find(item => item.id === id);

    if (!product) return;

    const existingItem = cart.find(item => item.id === id);

    if (existingItem) {
      existingItem.quantity++;
    } else {
      cart.push({ ...product, quantity: 1 });
    }

    updateCart();

    addButton.textContent = "✓ Added to Cart";

    setTimeout(() => {
      addButton.textContent = "🛒 Add to Cart";
    }, 700);
  }

  if (wishlistButton) {
    const id = Number(wishlistButton.dataset.wishlist);

    if (wishlist.has(id)) {
      wishlist.delete(id);
    } else {
      wishlist.add(id);
    }

    renderProducts();
  }
});

function updateCart() {
  const totalQuantity = cart.reduce(
    (sum, item) => sum + item.quantity, 0
  );

  cartCount.textContent = totalQuantity;

  cartItems.innerHTML = cart.length
    ? cart.map(item => `
        <div class="cart-item">
          <div>
            <strong>${item.name}</strong>
            <p>${formatPrice(item.price)} × ${item.quantity}</p>
          </div>

          <button
            class="remove-item"
            data-remove="${item.id}">
            Remove
          </button>
        </div>
      `).join("")
    : "<p>Your cart is empty.</p>";

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity, 0
  );

  cartTotal.textContent = formatPrice(total);
}

// Open cart
document.getElementById("cartButton")
  .addEventListener("click", () => {
    cartDialog.showModal();
  });

document.getElementById("closeCart")
  .addEventListener("click", () => {
    cartDialog.close();
  });

// Remove an item from the cart
cartItems.addEventListener("click", event => {
  const button = event.target.closest("[data-remove]");

  if (!button) return;

  const id = Number(button.dataset.remove);

  cart = cart.filter(item => item.id !== id);

  updateCart();
});

// Seller form
document.getElementById("sellButton")
  .addEventListener("click", () => {
    sellDialog.showModal();
  });

document.getElementById("closeSell")
  .addEventListener("click", () => {
    sellDialog.close();
  });

document.getElementById("sellForm")
  .addEventListener("submit", event => {
    event.preventDefault();

    const name = document.getElementById("sellerName")
      .value.trim();

    const price = Number(
      document.getElementById("sellerPrice").value
    );

    const category = document.getElementById("sellerCategory")
      .value;

    const imageInput = document.getElementById("sellerImage")
      .value.trim();

    if (!name || !Number.isFinite(price) || price <= 0) {
      alert("Enter a valid product name and price.");
      return;
    }

    products.unshift({
      id: Date.now(),
      name,
      price,
      category,
      rating: 0,
      reviews: 0,
      image: imageInput ||
        "https://placehold.co/400x300?text=New+Product"
    });

    selectedCategory = "All";

    document.querySelectorAll(".category").forEach(button => {
      button.classList.toggle(
        "active",
        button.dataset.category === "All"
      );
    });

    searchInput.value = "";

    renderProducts();
    sellDialog.close();
    event.target.reset();

    document.getElementById("products")
      .scrollIntoView({ behavior: "smooth" });

    alert("Product added to the current marketplace!");
  });

// Checkout placeholder
document.getElementById("checkoutButton")
  .addEventListener("click",async () => {
    alert('Will be available soon")
      
  });

// Initial page render
renderProducts();
updateCart();

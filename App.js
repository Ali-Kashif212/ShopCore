const appState = {
  products: [],
  selectedProduct: {},
  cart: [],
  currentRetry: {},
};
let cart = JSON.parse(localStorage.getItem("cart"));
if (cart) {
  appState.cart = cart;
}

const quickCaryBtn = document.getElementById("quickAddToCartBtn");
const detailCartBtn = document.getElementById("detailPageCartBtn");
const mainContent = document.getElementById("main-content");
const cartBadge = document.getElementById("cartBadge");
const quickModal = document.getElementById("quick-cart-modal");
const quickModalInstance = new bootstrap.Modal(quickModal);

window.addEventListener("load", router);
window.addEventListener("hashchange", router);

const endpoints = {
  sunglasses: {
    endpoint: "sunglasses",
  },
  shirts: {
    endpoint: "mens-shirts",
  },
  shoes: {
    endpoint: "mens-shoes",
  },
  watches: {
    endpoint: "mens-watches",
  },
};

function router() {
  const hash = window.location.hash;
  let parts = hash.split("/");

  if (parts[1] === "sunglass") {
    loadCategory(endpoints.sunglasses.endpoint);
  } else if (parts[1] === "shoes") {
    loadCategory(endpoints.shoes.endpoint);
  } else if (parts[1] === "watches") {
    loadCategory(endpoints.watches.endpoint);
  } else if (parts[1] === "detail") {
    let id = Number(parts[2]);
    loadDetails(id);
  } else if (parts[1] === "cart") {
    renderCart();
  } else if (parts[1] === "shirts") {
    loadCategory(endpoints.shirts.endpoint);
  } else {
    renderHome();
  }
}

function renderLoading() {
  return ` <span id="loading" class="loadinCont">
         <img
           src="Adobe Express - file.png"
           alt="logo"
           height="30"
           width="100"
           class="loading-img"
         />
       </span>`;
}

function renderServerError() {
  return ` <div class="server-err" id="server-err">
    <img src="images.png" alt="server-err" height="150" width="170" />
    <p>Something went wrong on our side. Please refresh or retry.</p>
    <button id="retry">Retry</button>
  </div>`;
}

function renderNetworkError() {
  return `
  <div class="network-err" id="network-err">
  <img
    src="free-network-error-icon-svg-download-png-2102408.png"
    alt="networkrr"
    height="200"
    width="200"
  />
  <p>Please check your internet connection!</p>
  <button id="retry">Retry</button>
</div> `;
}

function retryReq() {
  if (appState.currentRetry.type === "category") {
    loadCategory(appState.currentRetry.payload);
    return;
  }
  if (appState.currentRetry.type === "detail") {
    loadDetails(appState.currentRetry.payload);
    return;
  }
}

async function loadCategory(endPoints) {
  let type = "category";
  let payload = endPoints;
  appState.currentRetry = { type, payload };
  const url = `https://dummyjson.com/products/category/${endPoints}`;
  try {
    mainContent.innerHTML = renderLoading();
    let res = await fetch(url);
    if (!res.ok) {
      throw new Error("SERVER_ERR");
    }
    let { products } = await res.json();
    appState.products = products;
    renderProducts();
  } catch (error) {
    handlingErr(error);
  }
}

function renderProducts() {
  mainContent.innerHTML = "";
  let listPage = document.createElement("div");
  listPage.classList.add("listing-page");

  let cardHtml = appState.products
    .map((product) => {
      return `
      <div class="product-card">
        <div class="image-container">
          <a href="#/detail/${product.id}">
            <img src="${product.thumbnail}" alt="${product.brand}" />
          </a>
        </div>
        <div class="product-info">
        <a href="#/detail/${product.id}"><h3 class="product-title">${product.title}</h3></a>
          <p class="product-price">$${product.price}</p>
          <button class="add-to-cart quick-cart" data-id="${product.id}">
            Add to Cart
          </button>
        </div>
      </div>
  `;
    })
    .join("");
  listPage.innerHTML = cardHtml;
  mainContent.appendChild(listPage);
  renderCartBadge();
}

async function loadDetails(id) {
  let type = "detail";
  let payload = id;
  appState.currentRetry = { type, payload };

  const url = `https://dummyjson.com/products/${id}`;
  try {
    mainContent.innerHTML = renderLoading();
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error("SERVER_ERR");
    }
    const product = await res.json();
    appState.selectedProduct = product;
    console.log(appState.selectedProduct);
    renderDetailPage();
  } catch (error) {
    handlingErr(error);
  }
}

function addToCart(product, currQuantity, clickedBtn) {
  let existingCartItem = appState.cart.find(
    (cartItem) => cartItem.productId === product.id,
  );

  let existingQty = existingCartItem ? existingCartItem.quantity : 0;

  let finalQty = existingQty + currQuantity;

  if (finalQty > product.stock) {
    showStockExceedFeedback();
    return;
  }

  if (existingCartItem) {
    existingCartItem.quantity = finalQty;
    showSuccessFeedback(clickedBtn);
  } else {
    appState.cart.push({
      productId: product.id,
      product: product,
      quantity: currQuantity,
    });
    showSuccessFeedback(clickedBtn);

    console.log(appState.cart);
  }
  saveCart();
  updateCartUi();
}

function saveCart() {
  localStorage.setItem("cart", JSON.stringify(appState.cart));
}

function showStockExceedFeedback() {
  let stockAlert = document.getElementById("stock-alert");
  let alertMsg = document.getElementById("stock-excd-msg");

  alertMsg.innerHTML = `<i class="bi bi-slash-circle"></i> The quantity you selected is not available`;

  stockAlert.classList.remove("show");
  void stockAlert.offsetWidth;
  stockAlert.classList.add("show");

  setTimeout(() => {
    stockAlert.classList.remove("show");
  }, 2000);
}

function showSuccessFeedback(clickedBtn) {
  let tickMark = `
   <lottie-player
  src="tick-mark-animtion.json"
  speed="1.5"
  autoplay
  class="tick-to-cart"></lottie-player>`;

  let orignalText = clickedBtn.innerHTML;
  clickedBtn.disabled = true;
  clickedBtn.innerHTML = tickMark;

  setTimeout(() => {
    clickedBtn.innerHTML = orignalText;
    clickedBtn.disabled = false;
  }, 1000);
}
function stockPos(stock) {
  if (stock <= 0) {
    return `
    <div class="empty-stock">
     <i class="bi bi-x-lg"></i>
    <span>Sold out</span> </div>`;
  } else if (stock <= 10) {
    return `
    <div class="low-stock">
    <i class="bi bi-exclamation-lg"></i>
    <span>Low stock</span> </div>`;
  } else {
    return `
    <div class="stock">
    <i class="bi bi-check-lg"></i>
    <span>In Stock</span>
    </div>`;
  }
}

function renderDetailPage() {
  let product = appState.selectedProduct;
  let output = `
   <div class="detail-container">
      <div class="detail-layout">
        <div class="main-image-box">
          <img id="main-img" src="${product.images[0]}" height="500" width="500" class="main" />

          <div class="thumbnails">
            <img src="${product.images[0]}" class="thumb" />
            <img src="${product.images[1]}" class="thumb" />
            <img src="${product.images[2]}" class="thumb" />
          </div>
        </div>

        <div class="detail-info">
        
          <p class="detail-brand">${product.brand}</p>
          <h1 class="detail-title">${product.title}</h1>

          <div class="detail-rating">
            <span>${productRating(product.rating)}</span>
            <span class="rating-text">${product.rating} (out of 5)</span>
          </div>

          <p class="detail-price">$${product.price}</p>

          <p class="detail-description">${product.description}</p>

          <div class="size-section">
            <div class="detail-stock">
            ${stockPos(product.stock)}
            </div>
          </div>
          <div class="quantity-section">
            <h3>Quantity</h3>
            <div class="quantity-box">
              <button class="qty-btn" id="minusCart" data-action="decrement">-</button>
              <span class="qty-number">1</span>
              <button class="qty-btn" id="addCart" data-action="increment">+</button>
            </div>
          </div>

          <button class="detail-cart-btn" data-id="${product.id}" id="detailPageCartBtn"> Add to Cart <i class="bi bi-cart"></i></button>
        </div>

      </div>

      <div class="detail-extra">
        <div class="reviews-box">
          <h2>More Info</h2>
          <p>${productRating(product.rating)} ${product.rating} out of 5</p>
          <p><b>Shipping:</b> ${product.shippingInformation}</p>
          <p><b>Warranty:</b> ${product.warrantyInformation}</p>
          <p><b>Return Policy:</b> ${product.returnPolicy}</p>
          <p><b>Stock:</b> ${product.stock} Pieces</p>
        </div>
      </div>

    </div>
 `;
  mainContent.innerHTML = output;
  renderCartBadge();
}

function productRating(ratings) {
  let filled = `<i class="bi bi-star-fill text-success"></i>`;
  let half = `<i class="bi bi-star-half text-success "></i>`;
  let empty = `<i class="bi bi-star text-success"></i>`;
  let ratingArr = [];
  let rate = ratings;
  let full = Math.floor(rate);
  let decimal = rate - full;
  for (let i = 0; i < 5; i++) {
    if (i < full) {
      ratingArr.push(filled);
    } else if (i === full && decimal >= 0.5) {
      ratingArr.push(half);
    } else {
      ratingArr.push(empty);
    }
  }
  let rating = ratingArr
    .map((rating) => {
      return rating;
    })
    .join("");

  return rating;
}

function cartBody() {
  // mainContent.innerHTML = "";
  let cartShell = `
  <div class="cart-page"> 
  <div class="cart">
      <table>
      <thead>
        <tr class="cart-heading">
          <th>Product</th>
          <th>Price</th>
          <th>Quantity</th>
          <th>Total</th>
        </tr>
        </thead>
         <tbody>
          ${cartRows()}
        </tbody>
      </table>
    </div>
    </div>

    <div class="grand-total">
    <h4>Grand Total:</h4>
    <span>$${grandTotal()}</span>
    </div>
  `;
  return cartShell;
}

function cartRows() {
  let cartRows = appState.cart
    .map((cartItem) => {
      let lineTotal = cartItem.product.price * cartItem.quantity;
      return `
  <tr class="cart-items">
  <td class="cart-product">
    <div class="cart-product-content">
      <div class="product-img">
        <a href="#/detail/${cartItem.productId}"><img src="${cartItem.product.images[0]}" alt="Product" /></a>
      </div>

      <div class="info">
        <p>${cartItem.product.title}</p>
        <p>
          <i class="bi bi-trash3-fill" id="trashItem" data-id="${cartItem.productId}"></i>
        </p>
      </div>
    </div>
  </td>

  <td class="cart-price">$${cartItem.product.price}</td>

  <td class="cart-qty">
    <div class="qty-box">
      <button data-id="${cartItem.productId}" data-action="decrement" class="cartPageControl"><i class="bi bi-dash"></i></button>
      <span class="cart-page-qty">${cartItem.quantity}</span>
      <button data-id="${cartItem.productId}" data-action="increment" class="cartPageControl"><i class="bi bi-plus"></i></button>
    </div>
  </td>

  <td class="cart-total">$${lineTotal.toFixed(2)}</td>
</tr>
  `;
    })
    .join("");
  return cartRows;
}

function grandTotal() {
  let total = appState.cart.reduce(getTotal, 0);
  function getTotal(acc, item) {
    return acc + item.product.price * item.quantity;
  }
  return total.toFixed(2);
}

function emptyCartUi() {
  return `
    <div class="emp-cart">
      <i class="bi bi-cart-x"></i>
      <h2>Your cart is empty.</h2>
     <a href="#/sunglass"><button>Back to ShopCore</button></a>
    </div>
  `;
}

function renderCart() {
  if (appState.cart.length === 0) {
    mainContent.innerHTML = emptyCartUi();
  } else {
    mainContent.innerHTML = cartBody();
  }
  renderCartBadge();
}
function renderHome() {
  mainContent.innerHTML = `
    <section class="home-page">
      <section class="home-hero">
        <div class="home-hero-overlay"></div>

        <div class="home-container">
          <div class="home-hero-content">
            <span class="home-badge">Modern essentials for everyday life</span>

            <h1 class="home-title">
              Discover products that look good and work even better.
            </h1>

            <p class="home-subtitle">
              ShopCore brings together fashion, accessories, and lifestyle picks
              in one clean shopping experience designed for speed, simplicity,
              and style.
            </p>

            <div class="home-actions">
              <a href="#/shirts" class="home-btn home-btn-primary">Shop Shirts</a>
              <a href="#/watches" class="home-btn home-btn-secondary">Explore Watches</a>
            </div>
          </div>
        </div>
      </section>

      <section class="home-trust-wrap">
        <div class="home-container">
          <div class="home-trust-grid">
            <div class="home-trust-card">
              <div class="home-trust-icon">🚚</div>
              <div>
                <h3>Fast Delivery</h3>
                <p>Quick shipping on popular picks and daily essentials.</p>
              </div>
            </div>

            <div class="home-trust-card">
              <div class="home-trust-icon">🔒</div>
              <div>
                <h3>Secure Checkout</h3>
                <p>A smoother and safer buying experience from start to finish.</p>
              </div>
            </div>

            <div class="home-trust-card">
              <div class="home-trust-icon">⭐</div>
              <div>
                <h3>Quality Picks</h3>
                <p>Curated categories that feel cleaner and easier to explore.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="home-categories-section">
        <div class="home-container">
          <div class="home-section-head">
            <span class="home-section-label">Shop by category</span>
            <h2>Everything you need, all in one place</h2>
            <p>
              Jump straight into the categories that matter instead of making
              users wander around like lost tourists in a badly planned mall.
            </p>
          </div>

          <div class="home-categories-grid">
            <a href="#/shirts" class="home-category-card">
              <div class="home-category-icon">👕</div>
              <h3>Shirts</h3>
              <p>Clean everyday styles and wardrobe essentials for a modern look.</p>
              <span class="home-category-link">Browse shirts →</span>
            </a>

            <a href="#/shoes" class="home-category-card">
              <div class="home-category-icon">👟</div>
              <h3>Shoes</h3>
              <p>Comfortable, stylish pairs built for regular wear and movement.</p>
              <span class="home-category-link">Shop shoes →</span>
            </a>

            <a href="#/sunglass" class="home-category-card">
              <div class="home-category-icon">🕶️</div>
              <h3>Sunglasses</h3>
              <p>Sharp frames and bold looks that add instant personality.</p>
              <span class="home-category-link">View sunglasses →</span>
            </a>

            <a href="#/watches" class="home-category-card">
              <div class="home-category-icon">⌚</div>
              <h3>Watches</h3>
              <p>Classic and modern timepieces that finish the outfit properly.</p>
              <span class="home-category-link">Explore watches →</span>
            </a>
          </div>
        </div>
      </section>
    </section>
  `;
  renderCartBadge();
}

function handlingErr(err) {
  if (err.message === "SERVER_ERR") {
    mainContent.innerHTML = renderServerError();
  } else {
    mainContent.innerHTML = renderNetworkError();
  }
}

function updateCart(cartProductId, delta) {
  let cartPageItem = appState.cart.find(
    (cartItem) => cartItem.productId === cartProductId,
  );
  let qty = cartPageItem ? cartPageItem.quantity : 0;
  let finalQty = qty + delta;

  if (finalQty > cartPageItem.product.stock) {
    showStockExceedFeedback();
    return;
  }
  if (finalQty < 1) {
    let id = cartProductId;
    removeCartItem(id);
    console.log(cartPageItem);
    return;
  }
  cartPageItem.quantity = finalQty;

  saveCart();
  updateCartUi();
}

function renderCartBadge() {
  let totalQty = appState.cart.reduce(sumQty, 0);

  function sumQty(acc, item) {
    return acc + item.quantity;
  }
  cartBadge.innerText = totalQty;
  if (totalQty < 1) cartBadge.innerText = "";
}

function removeCartItem(id) {
  let updatedCart = appState.cart.filter((item) => item.productId !== id);
  appState.cart = updatedCart;
  saveCart();
  updateCartUi();
}

function updateCartUi() {
  let hash = window.location.hash;
  let parts = hash.split("/");

  if (parts[1] === "cart") {
    renderCart();
  }
  renderCartBadge();
}

function renderQuickCart(id) {
  let product = appState.products.find((product) => product.id === id);
  let parent = document.querySelector("#quick-cart-modal");
  let title = parent.querySelector(".modal-title");
  let price = parent.querySelector(".price");
  let modalCatBtn = parent.querySelector(".cart-btn");
  let qtyVal = parent.querySelector(".qty-value");
  let modalStock = parent.querySelector(".modal-stock");
  qtyVal.innerHTML = "1";
  modalCatBtn.dataset.id = product.id;
  title.innerHTML = product.title;
  price.innerHTML = `$${product.price}`;
  quickModalInstance.show();
  modalStock.innerHTML = stockPos(product.stock);
}
function handleModalAddToCart(currentQty, id, cartBtn) {
  let product = appState.products.find((product) => product.id === id);
  addToCart(product, currentQty, cartBtn);
}

quickModal.addEventListener("click", (e) => {
  let qtyBtn = e.target.closest(".qty-btn");
  let cartBtn = e.target.closest(".cart-btn");

  if (qtyBtn) {
    let parent = qtyBtn.closest(".qty-section");
    let qtyVal = parent.querySelector(".qty-value");
    let current = Number(qtyVal.textContent);
    let desicion = qtyBtn.dataset.action;
    if (desicion === "decrement") {
      if (current <= 1) return;
      current--;
      qtyVal.textContent = current;
    }
    if (desicion === "increment") {
      current++;
      qtyVal.textContent = current;
    }
  }
  if (cartBtn) {
    let id = Number(cartBtn.dataset.id);
    let gParent = cartBtn.closest(".modal-content");
    let qtyVal = gParent.querySelector(".qty-value");
    let current = Number(qtyVal.textContent);
    handleModalAddToCart(current, id, cartBtn);
  }
});

mainContent.addEventListener("click", (e) => {
  let thumbImg = e.target.closest(".thumb");
  let cartControl = e.target.closest(".qty-btn");
  let cartBtn = e.target.closest(".detail-cart-btn");
  let cartPageControl = e.target.closest(".cartPageControl");
  let removeItem = e.target.closest("#trashItem");
  let quickCart = e.target.closest(".quick-cart");
  let retryBtn = e.target.closest("#retry");

  if (thumbImg) {
    let mainImg = document.getElementById("main-img");
    let thumbSrc = thumbImg.src;
    mainImg.src = thumbSrc;
    return;
  }
  if (cartControl) {
    let qtySect = cartControl.closest(".quantity-section");
    let quantity = qtySect.querySelector(".qty-number");
    let current = Number(quantity.textContent);
    let decision = cartControl.dataset.action;
    if (decision === "increment") {
      current++;
      quantity.textContent = current;
      return;
    }
    if (decision === "decrement") {
      if (current <= 1) return;
      current--;
      quantity.textContent = current;
      return;
    }
  }
  if (cartBtn) {
    let comParent = cartBtn.closest(".detail-info");
    let currentQty = comParent.querySelector(".qty-number");
    let product = appState.selectedProduct;
    let qty = Number(currentQty.textContent);
    addToCart(product, qty, cartBtn);
    return;
  }

  if (cartPageControl) {
    let decision = cartPageControl.dataset.action;
    let id = Number(cartPageControl.dataset.id);
    if (decision === "decrement") {
      updateCart(id, -1);
    }
    if (decision === "increment") {
      updateCart(id, +1);
    }
  }
  if (removeItem) {
    let id = Number(removeItem.dataset.id);
    removeCartItem(id);
  }

  if (quickCart) {
    let id = Number(quickCart.dataset.id);
    renderQuickCart(id);
  }

  if (retryBtn) {
    retryReq();
  }
});

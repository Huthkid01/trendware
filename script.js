// 1) Supabase client (top of file)
const SUPABASE_URL = 'https://yxpftrlfkqrvoolzxqsj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl4cGZ0cmxma3Fydm9vbHp4cXNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1MDUwMjAsImV4cCI6MjA4MTA4MTAyMH0.0I87bU6pnpwY7wYZLv0ZEF-MOOeUZkjTKrfjgFIheKY';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 2) Initialize EmailJS with your public key
if (typeof emailjs !== 'undefined') {
  emailjs.init('rgDGB9lGjcUMCZ_RC');
}

// 3) Products will now come from Supabase (start empty)
let products = [];

// 4) Load site settings (hero, about, footer) from Supabase
async function loadSiteSettings() {
  const { data, error } = await supabaseClient
    .from('site_settings')
    .select('*')
    .eq('id', 1)
    .single(); // [web:157][web:160]

  if (error) {
    console.error('Failed to load site settings:', error);
    return;
  }

  // Hero section
  const heroTitle = document.querySelector('.hero-content h2');
  const heroSubtitle = document.querySelector('.hero-content p');
  const heroButton = document.querySelector('.hero-content .btn-primary');

  if (heroTitle) heroTitle.textContent = data.hero_title || '';
  if (heroSubtitle) heroSubtitle.textContent = data.hero_subtitle || '';
  if (heroButton) heroButton.textContent = data.hero_button_text || 'Shop Now';

  // Collections title
  const collectionsTitle = document.querySelector('.filter-section .section-title');
  if (collectionsTitle) collectionsTitle.textContent = data.collections_title || 'Our Collections';

  // About section
  const aboutTitle = document.querySelector('.about-section .section-title');
  const aboutP = document.querySelector('.about-section p');
  if (aboutTitle) aboutTitle.textContent = data.about_title || 'Why Choose Trendware?';
  if (aboutP) aboutP.textContent = data.about_paragraph || '';

  // Footer: first column (Trendware)
  const footerTagline = document.querySelector('.footer-section:nth-child(1) p:nth-child(2)');
  const footerSubtagline = document.querySelector('.footer-section:nth-child(1) p:nth-child(3)');
  if (footerTagline) footerTagline.textContent = data.footer_tagline || 'Premium Fashion & Style';
  if (footerSubtagline) footerSubtagline.textContent = data.footer_subtagline || 'Delivering quality and elegance worldwide';

  // Footer: customer care (third column)
  const footerEmail = document.querySelector('.footer-section:nth-child(3) p:nth-child(2)');
  const footerPhone = document.querySelector('.footer-section:nth-child(3) p:nth-child(3)');
  const footerHours = document.querySelector('.footer-section:nth-child(3) p:nth-child(4)');
  if (footerEmail) footerEmail.textContent = `Email: ${data.footer_contact_email || 'support@trendware.com'}`;
  if (footerPhone) footerPhone.textContent = `Phone: ${data.footer_contact_phone || '+234 123 456 7890'}`;
  if (footerHours) footerHours.textContent = data.footer_opening_hours || 'Mon-Sat: 9AM - 8PM';

  // Footer bottom line
  const footerBottom = document.querySelector('.footer-bottom p');
  if (footerBottom) footerBottom.textContent = data.footer_bottom || '';
}

// 5) Load products from Supabase
async function loadProductsFromSupabase() {
  const { data, error } = await supabaseClient
    .from('products')
    .select('*')
    .order('id', { ascending: true });

  if (error) {
    console.error('Failed to load products:', error);
    return;
  }

  products = data.map(row => ({
    id: row.id,
    name: row.name,
    priceNGN: row.price_ngn,
    priceUSD: row.price_usd || 0,
    priceGBP: row.price_gbp || 0,
    category: row.category,
    imageUrl: row.image_url,
    sizes: row.sizes ? row.sizes.split(',').map(s => s.trim()) : ['One Size']
  }));

  console.log('Products loaded from Supabase:', products.length);
  renderProducts();
}

// ✅ 50+ Currency Symbols
const currencySymbols = {
  NGN: '₦', USD: '$', GBP: '£', EUR: '€', GHS: 'GH₵', KES: 'KSh', ZAR: 'R',
  EGP: 'E£', JPY: '¥', CAD: 'C$', AUD: 'A$', INR: '₹', BRL: 'R$', MXN: 'Mex$',
  CLP: 'CLP', COP: 'COP', ARS: 'ARS', NZD: 'NZ$', AED: 'AED', SAR: 'SAR',
  ILS: '₪', TRY: '₺', MAD: 'MAD', ETB: 'ETB', TZS: 'TSh', UGX: 'USh', RWF: 'RWF',
  CHF: 'CHF', SEK: 'SEK', NOK: 'NOK', DKK: 'DKK', SGD: 'S$', MYR: 'RM',
  PHP: '₱', THB: '฿', IDR: 'Rp', VND: '₫', PLN: 'PLN', CZK: 'CZK'
};

// State Management
let cart = JSON.parse(localStorage.getItem('trendware_cart')) || [];
let currentCurrency = localStorage.getItem('trendware_currency') || 'NGN';
let activeFilter = 'all';
let productSelections = {};

// DOM Elements
const countrySelector = document.getElementById('countrySelector');
const cartBtn = document.getElementById('cartBtn');
const cartCount = document.getElementById('cartCount');
const cartModal = document.getElementById('cartModal');
const closeCart = document.getElementById('closeCart');
const cartItems = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');
const clearCartBtn = document.getElementById('clearCartBtn');
const checkoutBtn = document.getElementById('checkoutBtn');
const checkoutModal = document.getElementById('checkoutModal');
const closeCheckout = document.getElementById('closeCheckout');
const checkoutForm = document.getElementById('checkoutForm');
const successModal = document.getElementById('successModal');
const closeSuccess = document.getElementById('closeSuccess');
const hamburger = document.getElementById('hamburger');
const mainNav = document.getElementById('mainNav');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Initializing Trendware...');
  console.log('Current currency:', currentCurrency);

  loadSiteSettings();
  loadProductsFromSupabase();

  updateCartUI();
  setupEventListeners();
});

// Setup Event Listeners
function setupEventListeners() {
  if (countrySelector) {
    countrySelector.value = currentCurrency;
    countrySelector.addEventListener('change', (e) => {
      currentCurrency = e.target.value;
      localStorage.setItem('trendware_currency', currentCurrency);
      console.log(`💱 Currency changed to: ${currentCurrency} (${currencySymbols[currentCurrency]})`);
      renderProducts();
      if (cartModal?.classList.contains('active')) renderCart();
      if (checkoutModal?.classList.contains('active')) renderCheckoutSummary();
    });
  }

  if (cartBtn && cartModal) {
    cartBtn.addEventListener('click', () => {
      cartModal.classList.add('active');
      renderCart();
    });
  }

  if (closeCart && cartModal) closeCart.addEventListener('click', () => cartModal.classList.remove('active'));

  if (clearCartBtn) {
    clearCartBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to clear your cart?')) {
        cart = [];
        saveCart();
        renderCart();
        updateCartUI();
      }
    });
  }

  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
      }
      if (cartModal) cartModal.classList.remove('active');
      if (checkoutModal) {
        checkoutModal.classList.add('active');
        renderCheckoutSummary();
      }
    });
  }

  if (closeCheckout && checkoutModal) closeCheckout.addEventListener('click', () => checkoutModal.classList.remove('active'));
  if (checkoutForm) checkoutForm.addEventListener('submit', handleCheckout);
  if (closeSuccess && successModal) closeSuccess.addEventListener('click', () => successModal.classList.remove('active'));

  if (hamburger && mainNav) {
    hamburger.addEventListener('click', (e) => {
      e.stopPropagation();
      mainNav.classList.toggle('active');
      hamburger.classList.toggle('active');
    });
  }

  if (mainNav) {
    const navLinks = mainNav.querySelectorAll('a');
    navLinks.forEach(link => link.addEventListener('click', () => {
      mainNav.classList.remove('active');
      if (hamburger) hamburger.classList.remove('active');
    }));
  }

  document.addEventListener('click', (e) => {
    if (mainNav && hamburger && !mainNav.contains(e.target) && !hamburger.contains(e.target)) {
      mainNav.classList.remove('active');
      hamburger.classList.remove('active');
    }
  });

  const filterButtons = document.querySelectorAll('.filter-btn');
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeFilter = btn.dataset.category;
      filterProducts();
    });
  });

  window.addEventListener('click', (e) => {
    if (cartModal && e.target === cartModal) cartModal.classList.remove('active');
    if (checkoutModal && e.target === checkoutModal) checkoutModal.classList.remove('active');
    if (successModal && e.target === successModal) successModal.classList.remove('active');
  });
}

function renderProducts() {
  const clothesContainer = document.getElementById('clothesProducts');
  const shoesContainer = document.getElementById('shoesProducts');
  const accessoriesContainer = document.getElementById('accessoriesProducts');

  if (!clothesContainer || !shoesContainer || !accessoriesContainer) {
    console.error('Product containers not found!');
    return;
  }

  clothesContainer.innerHTML = '';
  shoesContainer.innerHTML = '';
  accessoriesContainer.innerHTML = '';

  products.forEach(product => {
    const productCard = createProductCard(product);
    if (product.category === 'clothes') clothesContainer.appendChild(productCard);
    else if (product.category === 'shoes') shoesContainer.appendChild(productCard);
    else if (product.category === 'accessories') accessoriesContainer.appendChild(productCard);
  });

  filterProducts();
}

function createProductCard(product) {
  const card = document.createElement('div');
  card.className = 'product-card';
  card.dataset.category = product.category;
  card.dataset.productId = product.id;

  const price = getPrice(product);
  const symbol = currencySymbols[currentCurrency] || '₦';
  const currentSelection = productSelections[product.id] || { size: product.sizes[0], quantity: 1 };

  card.innerHTML = `
    <div class="product-image">
      <img src="${product.imageUrl}" alt="${product.name}">
    </div>
    <div class="product-info">
      <div class="product-name">${product.name}</div>
      <div class="product-category">${product.category.toUpperCase()}</div>
      <div class="product-price">${symbol}${price.toLocaleString()}</div>
      
      <div class="size-selector">
        <label>Size:</label>
        <div class="size-options">
          ${product.sizes.map(size => 
            `<button class="size-btn ${size === currentSelection.size ? 'active' : ''}" data-product-id="${product.id}" data-size="${size}">${size}</button>`
          ).join('')}
        </div>
      </div>
      
      <div class="quantity-selector">
        <label>Qty:</label>
        <div class="quantity-controls">
          <button class="qty-minus" data-product-id="${product.id}" data-action="minus">-</button>
          <span class="qty-display">${currentSelection.quantity}</span>
          <button class="qty-plus" data-product-id="${product.id}" data-action="plus">+</button>
        </div>
      </div>
      
      <button class="add-to-cart-btn" data-product-id="${product.id}">Add to Cart</button>
    </div>
  `;

  const sizeBtns = card.querySelectorAll('.size-btn');
  sizeBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const productId = parseInt(btn.dataset.productId);
      const size = btn.dataset.size;
      
      sizeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      productSelections[productId] = { ...productSelections[productId], size };
    });
  });

  const qtyDisplay = card.querySelector('.qty-display');
  const qtyControls = card.querySelectorAll('.qty-minus, .qty-plus');
  qtyControls.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const productId = parseInt(btn.dataset.productId);
      let qty = parseInt(qtyDisplay.textContent) || 1;
      
      if (btn.dataset.action === 'plus') qty = Math.min(qty + 1, 10);
      else if (qty > 1) qty--;
      
      qtyDisplay.textContent = qty;
      productSelections[productId] = { ...productSelections[productId], quantity: qty };
    });
  });

  const addBtn = card.querySelector('.add-to-cart-btn');
  addBtn.addEventListener('click', () => {
    const productId = parseInt(addBtn.dataset.productId);
    const selection = productSelections[productId];
    
    if (!selection?.size) {
      alert('Please select a size first!');
      return;
    }
    
    addToCartWithSelection(productId, selection.size, selection.quantity || 1);
  });

  return card;
}

function getPrice(product) {
  return product[`price${currentCurrency}`] || product.priceNGN || 0;
}

function filterProducts() {
  const categorySections = document.querySelectorAll('.category-section');
  categorySections.forEach(section => {
    section.style.display = (activeFilter === 'all' || section.dataset.category === activeFilter) ? 'block' : 'none';
  });
}

function addToCartWithSelection(productId, size, quantity) {
  const product = products.find(p => p.id === productId);
  if (!product) return;

  const cartItemName = `${product.name} (${size})`;
  const existingItem = cart.find(item => item.id === productId && item.size === size);

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.push({
      id: product.id,
      name: cartItemName,
      size: size,
      priceNGN: product.priceNGN,
      priceUSD: product.priceUSD,
      priceGBP: product.priceGBP,
      category: product.category,
      quantity: quantity
    });
  }

  saveCart();
  updateCartUI();

  document.querySelectorAll(`[data-product-id="${productId}"] .add-to-cart-btn`).forEach(btn => {
    const originalText = btn.textContent;
    btn.textContent = `Added! (${size})`;
    btn.style.background = 'var(--success)';
    setTimeout(() => {
      btn.textContent = originalText;
      btn.style.background = '';
    }, 1500);
  });

  delete productSelections[productId];
  renderProducts();
}

function removeFromCart(productId, size) {
  cart = cart.filter(item => !(item.id === productId && item.size === size));
  saveCart();
  renderCart();
  updateCartUI();
}

function updateQuantity(productId, size, change) {
  const item = cart.find(item => item.id === productId && item.size === size);
  if (item) {
    item.quantity += change;
    if (item.quantity <= 0) {
      removeFromCart(productId, size);
    } else {
      saveCart();
      renderCart();
      updateCartUI();
      if (checkoutModal?.classList.contains('active')) renderCheckoutSummary();
    }
  }
}

function renderCart() {
  if (!cartItems || !cartTotal) return;

  if (cart.length === 0) {
    cartItems.innerHTML = '<div class="empty-cart">Your cart is empty</div>';
    cartTotal.textContent = '';
    return;
  }

  const symbol = currencySymbols[currentCurrency] || '₦';
  let total = 0;

  cartItems.innerHTML = cart.map(item => {
    const price = item[`price${currentCurrency}`] || item.priceNGN || 0;
    const subtotal = price * item.quantity;
    total += subtotal;

    return `
      <div class="cart-item" data-product-id="${item.id}" data-size="${item.size}">
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-size">Size: ${item.size}</div>
          <div class="cart-item-price">${symbol}${price.toLocaleString()} each</div>
        </div>
        <div class="quantity-controls">
          <button class="qty-btn" data-action="decrement" data-id="${item.id}" data-size="${item.size}">-</button>
          <span class="qty-value">${item.quantity}</span>
          <button class="qty-btn" data-action="increment" data-id="${item.id}" data-size="${item.size}">+</button>
        </div>
        <button class="remove-btn" data-action="remove" data-id="${item.id}" data-size="${item.size}">Remove</button>
      </div>
    `;
  }).join('');

  cartTotal.textContent = `${symbol}${total.toLocaleString()}`;

  cartItems.querySelectorAll('.qty-btn, .remove-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const action = btn.dataset.action;
      const productId = parseInt(btn.dataset.id);
      const size = btn.dataset.size;
      
      if (action === 'increment') updateQuantity(productId, size, 1);
      else if (action === 'decrement') updateQuantity(productId, size, -1);
      else if (action === 'remove') {
        if (confirm('Remove this item?')) removeFromCart(productId, size);
      }
    });
  });
}

function renderCheckoutSummary() {
  const checkoutItems = document.getElementById('checkoutItems');
  const checkoutTotal = document.getElementById('checkoutTotal');
  if (!checkoutItems || !checkoutTotal) return;

  const symbol = currencySymbols[currentCurrency] || '₦';
  let total = 0;

  checkoutItems.innerHTML = cart.map(item => {
    const price = item[`price${currentCurrency}`] || item.priceNGN || 0;
    const subtotal = price * item.quantity;
    total += subtotal;
    return `
      <div class="checkout-item">
        <span>${item.name} (Qty: ${item.quantity}) | Size: ${item.size}</span>
        <span>${symbol}${subtotal.toLocaleString()}</span>
      </div>
    `;
  }).join('');

  checkoutTotal.textContent = `${symbol}${total.toLocaleString()}`;
}

function updateCartUI() {
  if (cartCount) cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
}

function saveCart() {
  localStorage.setItem('trendware_cart', JSON.stringify(cart));
}

function handleCheckout(e) {
  e.preventDefault();
  const formData = {
    fullName: document.getElementById('fullName').value,
    email: document.getElementById('email').value,
    phone: document.getElementById('phone').value,
    street: document.getElementById('street').value,
    city: document.getElementById('city').value,
    state: document.getElementById('state').value,
    postalCode: document.getElementById('postalCode').value,
    country: document.getElementById('country').value
  };

  console.log('Check form email (formData.email):', formData.email);

  const symbol = currencySymbols[currentCurrency] || '₦';
  let total = 0;
  cart.forEach(item => {
    const price = item[`price${currentCurrency}`] || item.priceNGN || 0;
    total += price * item.quantity;
  });

  if (typeof FlutterwaveCheckout !== 'undefined') {
    FlutterwaveCheckout({
      public_key: "FLWPUBK_TEST-76ac011fcb3de484d28ef7b1f53f3cd4-X",
      tx_ref: "TW-" + Date.now(),
      amount: total,
      currency: currentCurrency,
      payment_options: "card, banktransfer, ussd",
      customer: { email: formData.email, phone_number: formData.phone, name: formData.fullName },
      customizations: { title: "Trendware", description: "Purchase from Trendware", logo: "images/logo.png" },
      callback: function(data) {
        console.log('🔥 FLW back data:', data);
        
        if (data.status === "successful" || data.status === "completed") {
          console.log('✅ Status is successful/completed, sending emails...');
          sendDualEmailNotifications(formData, data.transaction_id);
          cart = [];
          saveCart();
          updateCartUI();
          if (checkoutModal) checkoutModal.classList.remove('active');
          if (successModal) successModal.classList.add('active');
          if (checkoutForm) checkoutForm.reset();
        } else {
          console.log('❌ Payment status not successful:', data.status);
        }
      },
      onclose: function() { console.log('Payment cancelled'); }
    });
  } else {
    console.log('Demo Mode: Payment gateway not loaded');
    alert('Demo Mode: Simulating successful payment...');
    const demoTxRef = "DEMO-" + Date.now();
    sendDualEmailNotifications(formData, demoTxRef);
    cart = [];
    saveCart();
    updateCartUI();
    if (checkoutModal) checkoutModal.classList.remove('active');
    if (successModal) successModal.classList.add('active');
    if (checkoutForm) checkoutForm.reset();
  }
}

// DUAL EMAIL NOTIFICATIONS (Customer + Owner)
function sendDualEmailNotifications(formData, paymentReference) {
  console.log('💥 sendDualEmailNotifications CALLED!', formData.email, paymentReference);
  const symbol = currencySymbols[currentCurrency] || '₦';
  let total = 0;

  const orderItemsText = cart.map(item => {
    const price = item[`price${currentCurrency}`] || item.priceNGN || 0;
    const subtotal = price * item.quantity;
    total += subtotal;
    return `${item.name} x ${item.quantity} (Size: ${item.size || 'N/A'}) = ${symbol}${subtotal.toLocaleString()}`;
  }).join('\n');

  const shippingAddress = `${formData.street}, ${formData.city}, ${formData.state}, ${formData.postalCode}, ${formData.country}`;

  const customerParams = {
    buyer_name: formData.fullName,
    buyer_email: formData.email,
    buyer_phone: formData.phone,
    shipping_address: shippingAddress,
    order_items: orderItemsText,
    order_total: `${symbol}${total.toLocaleString()}`,
    currency: currentCurrency,
    payment_reference: paymentReference,
    timestamp: new Date().toLocaleString()
  };

  const ownerParams = {
    buyer_name: formData.fullName,
    buyer_email: formData.email,
    buyer_phone: formData.phone,
    shipping_address: shippingAddress,
    order_items: orderItemsText,
    order_total: `${symbol}${total.toLocaleString()}`,
    currency: currentCurrency,
    payment_reference: paymentReference,
    timestamp: new Date().toLocaleString(),
    store_owner: 'odusanyauthman28@gmail.com'
  };

  console.log('📧 Sending DUAL notifications...');
  console.log('Customer:', customerParams.buyer_email);
  console.log('Owner:', ownerParams.store_owner);
  console.log('Total:', customerParams.order_total);

  if (typeof emailjs !== 'undefined' && emailjs.send) {
    emailjs.send('service_zc17nys', 'template_ox6vxpb', customerParams)
      .then(() => console.log('✅ CUSTOMER: Order confirmation sent!'))
      .catch(err => console.error('❌ CUSTOMER email failed:', err));

    emailjs.send('service_zc17nys', 'template_7xrl9pr', ownerParams)
      .then(() => console.log('✅ OWNER: New order alert sent! 🚨'))
      .catch(err => console.error('❌ OWNER email failed:', err));
  } else {
    console.log('⚠️ EmailJS not configured. Order details logged to console.');
    console.log('Customer would receive:', customerParams);
    console.log('Owner would receive:', ownerParams);
  }
}

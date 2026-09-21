// Cart (marketplace) & Interactive UI Enhancements
var cartTotal = 0;
var cartItems = [];

function initMarketplaceCart() {
  var savedTotal = parseInt(sessionStorage.getItem('bizlink_cart_total') || '0', 10);
  var savedItems = sessionStorage.getItem('bizlink_cart_items');
  if (savedTotal) cartTotal = savedTotal;
  if (savedItems) {
    try { cartItems = JSON.parse(savedItems); } catch(e){ cartItems = []; }
  }
  updateCartDisplay();

  var modal = document.getElementById('cart-modal');
  var openBtn = document.getElementById('open-cart-modal');
  var closeBtn = document.getElementById('close-cart-modal');

  if (openBtn && modal) {
    openBtn.addEventListener('click', function() { modal.classList.remove('hidden'); });
  }
  if (closeBtn && modal) {
    closeBtn.addEventListener('click', function() { modal.classList.add('hidden'); });
  }
  if (modal) {
    modal.addEventListener('click', function(e) {
      if (e.target === modal) modal.classList.add('hidden');
    });
  }
}

function adjustItemCart(btn, shopName, itemName, price, delta) {
  var span = btn.parentElement.querySelector('span');
  var qty = parseInt(span.textContent, 10);
  qty += delta;
  if (qty < 0) qty = 0;
  span.textContent = qty;

  var uniqueKey = shopName + ' — ' + itemName;
  var existing = cartItems.find(function(i){ return i.key === uniqueKey; });

  if (qty === 0) {
    cartItems = cartItems.filter(function(i){ return i.key !== uniqueKey; });
  } else {
    if (existing) {
      existing.qty = qty;
    } else {
      cartItems.push({ key: uniqueKey, shop: shopName, item: itemName, price: price, qty: qty });
    }
  }

  // Recalculate total
  cartTotal = cartItems.reduce(function(sum, i){ return sum + (i.price * i.qty); }, 0);
  updateCartDisplay();

  if (delta > 0) {
    showAlert('Added ' + itemName + ' (' + shopName + ') to basket.', 'success');
  } else if (delta < 0 && qty >= 0) {
    showAlert('Updated ' + itemName + ' quantity.', 'info');
  }
}

function updateCartDisplay() {
  var totalEl = document.getElementById('cart-total');
  var modalTotal = document.getElementById('modal-cart-total');
  var countEl = document.getElementById('cart-count');
  if (totalEl) totalEl.textContent = cartTotal;
  if (modalTotal) modalTotal.textContent = 'R ' + cartTotal;

  var totalCount = cartItems.reduce(function(sum, i){ return sum + i.qty; }, 0);
  if (countEl) countEl.textContent = totalCount;

  sessionStorage.setItem('bizlink_cart_total', String(cartTotal));
  sessionStorage.setItem('bizlink_cart_items', JSON.stringify(cartItems));

  var container = document.getElementById('cart-items-container');
  var checkoutBtn = document.getElementById('proceed-checkout-btn');
  if (!container) return;

  if (cartItems.length === 0) {
    container.innerHTML = '<p class="empty-cart-msg" style="color:var(--muted);text-align:center;margin-top:2rem;">Your cart is empty. Add items from local shops above.</p>';
    if (checkoutBtn) checkoutBtn.disabled = true;
  } else {
    container.innerHTML = '';
    if (checkoutBtn) checkoutBtn.disabled = false;
    cartItems.forEach(function(i){
      var div = document.createElement('div');
      div.className = 'cart-item';
      div.innerHTML = '<div><div style="font-weight:600;">' + i.item + '</div><div style="font-size:12px;color:var(--muted);">' + i.shop + ' · R ' + i.price + ' × ' + i.qty + '</div></div>' +
                      '<button type="button" class="remove-btn" onclick="removeCartItem(\'' + i.key.replace(/'/g, "\\'") + '\')">Remove</button>';
      container.appendChild(div);
    });
  }
}

function removeCartItem(key) {
  cartItems = cartItems.filter(function(i){ return i.key !== key; });
  cartTotal = cartItems.reduce(function(sum, i){ return sum + (i.price * i.qty); }, 0);

  // reset card span UI on page if matching
  document.querySelectorAll('.card').forEach(function(card){
    if (card.textContent.indexOf(key.split(' — ')[1]) !== -1) {
      var span = card.querySelector('.qty span');
      if (span) span.textContent = '0';
    }
  });

  updateCartDisplay();
  showAlert('Item removed from basket.', 'info');
}

function proceedToCheckout() {
  if (cartTotal <= 0) {
    showAlert('Please add items to your cart first.', 'info');
    return;
  }
  var checkoutBtn = document.getElementById('proceed-checkout-btn');
  if (checkoutBtn) {
    checkoutBtn.disabled = true;
    checkoutBtn.textContent = 'Processing Order...';
  }
  showAlert('Order placed successfully! Redirecting to tracking...', 'success');
  setTimeout(function() {
    window.location.href = 'customer/checkout.html';
  }, 1200);
}

function showAlert(message, type) {
  type = type || 'success';
  var container = document.getElementById('alert-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'alert-container';
    container.className = 'alert-container';
    document.body.appendChild(container);
  }
  var alertEl = document.createElement('div');
  alertEl.className = 'alert-banner alert-' + type;
  alertEl.textContent = message;
  container.appendChild(alertEl);

  setTimeout(function() {
    alertEl.classList.add('fade-out');
    setTimeout(function() { alertEl.remove(); }, 400);
  }, 3200);
}

function filterCards(){
  var input = document.getElementById('market-search');
  if(!input) return;
  var q = input.value.toLowerCase();
  var cards = document.querySelectorAll('.card');
  var visible = 0;
  cards.forEach(function(card){
    var text = card.textContent.toLowerCase();
    var match = text.indexOf(q) !== -1;
    card.style.display = match ? '' : 'none';
    if(match) visible += 1;
  });
  var empty = document.getElementById('market-empty');
  if(empty) empty.style.display = visible === 0 ? 'block' : 'none';
}

/* ---- Batch → Driver simulation (coordinated) ---- */
var MOCK_DRIVERS = [
  { name: 'Kabelo', vehicle: 'Bakkie', plate: 'GP 482-KLM', eta: '22 min', phone: '082 441 2290' },
  { name: 'Precious', vehicle: 'Toyota Quantum', plate: 'GP 119-TZX', eta: '18 min', phone: '073 882 1044' },
  { name: 'Thabo', vehicle: 'Honda Fit', plate: 'GP 334-NQA', eta: '15 min', phone: '061 203 7781' }
];

function startCountdown(el, startSeconds){
  var secs = startSeconds;
  var timer = setInterval(function(){
    if(secs <= 0){
      clearInterval(timer);
      el.textContent = 'closed';
      onBatchClosed();
      return;
    }
    secs -= 1;
    var m = Math.floor(secs/60), s = secs%60;
    el.textContent = 'closes in ' + (m<10?'0':'')+m + ':' + (s<10?'0':'')+s;
  }, 1000);
}

function onBatchClosed() {
  var banner = document.getElementById('batch-banner');
  var driverBanner = document.getElementById('driver-banner');

  sessionStorage.setItem('bizlink_batch_status', 'notifying');
  sessionStorage.setItem('bizlink_open_job', JSON.stringify({
    id: 'job-' + Date.now(),
    fee: 95,
    shops: 3,
    suppliers: ['Boitumelo Wholesalers', 'Central Distributors'],
    area: 'Soshanguve South',
    km: 14,
    mins: 55,
    createdAt: Date.now()
  }));
  sessionStorage.removeItem('bizlink_driver');

  if(banner){
    banner.className = 'banner notifying';
    banner.innerHTML =
      '<span><b>Batch closed.</b> Notifying nearby drivers…</span>' +
      '<a class="btn-ghost" style="padding:6px 12px;font-size:12px;" href="../driver/index.html">Open driver view</a>';
  }
  if(driverBanner) driverBanner.style.display = 'none';

  document.querySelectorAll('.status-pill.waiting').forEach(function(pill){
    pill.className = 'status-pill collecting';
    pill.textContent = 'Notifying drivers';
  });
  var sub = document.querySelector('.panel-head .sub');
  if(sub) sub.textContent = 'Waiting for a driver to accept…';

  pollForDriverAccept();
}

function pollForDriverAccept(){
  var tries = 0;
  var poll = setInterval(function(){
    tries += 1;
    var status = sessionStorage.getItem('bizlink_batch_status');
    var raw = sessionStorage.getItem('bizlink_driver');
    if(status === 'assigned' && raw){
      clearInterval(poll);
      showDriverAssigned(JSON.parse(raw));
      return;
    }
    if(tries >= 45){
      clearInterval(poll);
      var driver = MOCK_DRIVERS[0];
      sessionStorage.setItem('bizlink_driver', JSON.stringify(driver));
      sessionStorage.setItem('bizlink_batch_status', 'assigned');
      sessionStorage.removeItem('bizlink_open_job');
      showDriverAssigned(driver);
    }
  }, 2000);
}

function showDriverAssigned(driver){
  var banner = document.getElementById('batch-banner');
  var driverBanner = document.getElementById('driver-banner');
  if(banner) banner.style.display = 'none';
  if(driverBanner){
    driverBanner.style.display = 'flex';
    driverBanner.innerHTML =
      '<div class="driver-info">' +
        '<div class="driver-avatar">' + driver.name.charAt(0) + '</div>' +
        '<div>' +
          '<div class="driver-line"><b>Driver assigned — ' + driver.name + '</b></div>' +
          '<div class="driver-meta">' + driver.vehicle + ' · ' + driver.plate + ' · ETA ' + driver.eta + '</div>' +
        '</div>' +
      '</div>' +
      '<a class="btn-ghost" style="padding:8px 14px;font-size:13px;" href="deliveries.html">Track delivery</a>';
  }
  document.querySelectorAll('.status-pill.collecting, .status-pill.waiting').forEach(function(pill){
    if(pill.textContent.indexOf('Delivered') !== -1) return;
    pill.className = 'status-pill collecting';
    pill.textContent = 'Driver assigned';
  });
  var sub = document.querySelector('.panel-head .sub');
  if(sub) sub.textContent = 'Driver ' + driver.name + ' assigned · collecting soon';
}

function closeBatchNow() {
  var cd = document.getElementById('countdown');
  if(cd){
    cd.textContent = 'closed';
    onBatchClosed();
  }
}

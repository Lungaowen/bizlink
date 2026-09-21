// Cart (marketplace)
var cartTotal = 0;
function addToCart(btn, price){
  var span = btn.parentElement.querySelector('span');
  var isMinus = btn.textContent.indexOf('\u2212') !== -1 || btn.textContent.indexOf('-') !== -1 || btn.textContent.trim() === '\u2212';
  var qty = parseInt(span.textContent, 10);
  if(isMinus){
    if(qty === 0) return;
    qty -= 1; cartTotal -= price;
  } else {
    qty += 1; cartTotal += price;
  }
  span.textContent = qty;
  var totalEl = document.getElementById('cart-total');
  if(totalEl) totalEl.textContent = cartTotal;
  sessionStorage.setItem('bizlink_cart_total', String(cartTotal));
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

/* ---- Batch \u2192 Driver simulation (coordinated) ---- */
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

function onBatchClosed(){
  var banner = document.getElementById('batch-banner');
  var driverBanner = document.getElementById('driver-banner');

  // Create an open job for drivers to accept (do NOT auto-assign)
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
      '<span><b>Batch closed.</b> Notifying nearby drivers\u2026</span>' +
      '<a class="btn-ghost" style="padding:6px 12px;font-size:12px;" href="../driver/index.html">Open driver view</a>';
  }
  if(driverBanner) driverBanner.style.display = 'none';

  document.querySelectorAll('.status-pill.waiting').forEach(function(pill){
    pill.className = 'status-pill collecting';
    pill.textContent = 'Notifying drivers';
  });
  var sub = document.querySelector('.panel-head .sub');
  if(sub) sub.textContent = 'Waiting for a driver to accept\u2026';

  // Poll until a driver accepts (or demo fallback after 90s)
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
    // Fallback after ~90s if user never opens driver tab
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
          '<div class="driver-line"><b>Driver assigned \u2014 ' + driver.name + '</b></div>' +
          '<div class="driver-meta">' + driver.vehicle + ' \u00b7 ' + driver.plate + ' \u00b7 ETA ' + driver.eta + '</div>' +
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
  if(sub) sub.textContent = 'Driver ' + driver.name + ' assigned \u00b7 collecting soon';
}

function closeBatchNow(){
  var cd = document.getElementById('countdown');
  if(cd){
    cd.textContent = 'closed';
    onBatchClosed();
  }
}

function submitOrder(e){
  e.preventDefault();
  var form = e.target;
  var product = form.querySelector('[name=product]').value.trim();
  var supplier = form.querySelector('[name=supplier]').value;
  var qty = form.querySelector('[name=qty]').value;
  if(!product || !qty || parseInt(qty, 10) <= 0){
    var err = document.getElementById('order-error');
    if(err){
      err.textContent = 'Enter a product name and a quantity greater than 0.';
      err.style.display = 'block';
    }
    return false;
  }
  // Reset previous batch state so new order can batch again
  if(sessionStorage.getItem('bizlink_batch_status') === 'assigned'){
    sessionStorage.removeItem('bizlink_batch_status');
    sessionStorage.removeItem('bizlink_driver');
  }
  window.location.href = 'orders.html?added=' + encodeURIComponent(product) +
    '&supplier=' + encodeURIComponent(supplier) +
    '&qty=' + encodeURIComponent(qty);
  return false;
}

function showAddedBannerIfNeeded(){
  var params = new URLSearchParams(window.location.search);
  var added = params.get('added');
  if(!added) return;
  var banner = document.getElementById('added-banner');
  if(!banner) return;
  var text = banner.querySelector('.added-text');
  if(text){
    text.textContent =
      added + ' (qty ' + params.get('qty') + ') from ' + params.get('supplier') + ' added to this batch.';
  }
  banner.style.display = 'flex';
}

function restoreDriverStateIfAny(){
  var status = sessionStorage.getItem('bizlink_batch_status');
  var raw = sessionStorage.getItem('bizlink_driver');

  if(status === 'notifying'){
    var banner = document.getElementById('batch-banner');
    if(banner){
      banner.className = 'banner notifying';
      banner.innerHTML =
        '<span><b>Batch closed.</b> Waiting for a driver to accept\u2026</span>' +
        '<a class="btn-ghost" style="padding:6px 12px;font-size:12px;" href="../driver/index.html">Open driver view</a>';
    }
    document.querySelectorAll('.status-pill.waiting').forEach(function(pill){
      pill.className = 'status-pill collecting';
      pill.textContent = 'Notifying drivers';
    });
    pollForDriverAccept();
    return;
  }

  if(status !== 'assigned' || !raw) return;
  showDriverAssigned(JSON.parse(raw));
}

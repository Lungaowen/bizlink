// Cart (marketplace)
var cartTotal = 0;
function addToCart(btn, price){
  var span = btn.parentElement.querySelector('span');
  var isMinus = btn.textContent.indexOf('\u2212') !== -1;
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
}

function filterCards(){
  var q = document.getElementById('market-search').value.toLowerCase();
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

/* ---- Batch \u2192 Driver simulation ---- */
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
  if(banner){
    banner.className = 'banner notifying';
    banner.innerHTML = '<span><b>Batch closed.</b> Notifying nearby drivers\u2026</span>';
  }
  setTimeout(function(){
    var driver = MOCK_DRIVERS[Math.floor(Math.random()*MOCK_DRIVERS.length)];
    sessionStorage.setItem('bizlink_driver', JSON.stringify(driver));
    sessionStorage.setItem('bizlink_batch_status', 'assigned');

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
    document.querySelectorAll('.status-pill.waiting').forEach(function(pill){
      pill.className = 'status-pill collecting';
      pill.textContent = 'Driver assigned';
    });
    var sub = document.querySelector('.panel-head .sub');
    if(sub) sub.textContent = 'Driver ' + driver.name + ' assigned \u00b7 collecting soon';
  }, 2200);
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
    err.textContent = 'Enter a product name and a quantity greater than 0.';
    err.style.display = 'block';
    return false;
  }
  window.location.href = 'orders.html?added=' + encodeURIComponent(product) + '&supplier=' + encodeURIComponent(supplier) + '&qty=' + encodeURIComponent(qty);
  return false;
}

function showAddedBannerIfNeeded(){
  var params = new URLSearchParams(window.location.search);
  var added = params.get('added');
  if(!added) return;
  var banner = document.getElementById('added-banner');
  if(!banner) return;
  banner.querySelector('.added-text').textContent =
    added + ' (qty ' + params.get('qty') + ') from ' + params.get('supplier') + ' added to this batch.';
  banner.style.display = 'flex';
}

function restoreDriverStateIfAny(){
  var status = sessionStorage.getItem('bizlink_batch_status');
  var raw = sessionStorage.getItem('bizlink_driver');
  if(status !== 'assigned' || !raw) return;
  var driver = JSON.parse(raw);
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
  document.querySelectorAll('.status-pill.waiting').forEach(function(pill){
    pill.className = 'status-pill collecting';
    pill.textContent = 'Driver assigned';
  });
}

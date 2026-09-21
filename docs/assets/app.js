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

function startCountdown(el, startSeconds){
  var secs = startSeconds;
  setInterval(function(){
    if(secs <= 0) return;
    secs -= 1;
    var m = Math.floor(secs/60), s = secs%60;
    el.textContent = 'closes in ' + (m<10?'0':'')+m + ':' + (s<10?'0':'')+s;
  }, 1000);
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

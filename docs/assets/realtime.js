// Real-time Mock Backend for BizLink across tabs
(function() {
  // Listen for changes in localStorage across different tabs
  window.addEventListener('storage', function(e) {
    if (!e.newValue) return;

    // 1. SHOP TAB: Listen for New Orders
    if (e.key === 'bizlink_new_order') {
      if (window.location.href.includes('dashboard/orders.html')) {
        var order = JSON.parse(e.newValue);
        showAlert('🚨 NEW ORDER: ' + order.item + ' for R' + order.price, 'info');
        // You could dynamically insert it into the DOM here
        setTimeout(() => location.reload(), 2000); // Quick refresh to show order
      }
    }

    // 2. DRIVER TAB: Listen for Shop marking "Ready for Pickup"
    if (e.key === 'bizlink_ready_pickup') {
      if (window.location.href.includes('driver/index.html') || window.location.href.includes('driver/active.html')) {
        showAlert('📦 NEW BATCH READY: ' + e.newValue + ' is ready for pickup!', 'success');
        setTimeout(() => location.reload(), 2000);
      }
    }

    // 3. CUSTOMER TAB: Listen for Driver Actions
    if (e.key === 'bizlink_driver_status') {
      if (window.location.href.includes('customer/track.html')) {
        var status = e.newValue; // e.g. "On the way"
        showAlert('🚗 Driver Update: ' + status, 'success');

        // Auto-update the UI track step
        var currentStep = document.querySelector('.step.current');
        if(currentStep) {
           currentStep.classList.remove('current');
           currentStep.classList.add('done');
           if(currentStep.nextElementSibling) {
             currentStep.nextElementSibling.classList.add('current');
           }
        }
      }
    }
  });

  // Attach Alert Function
  window.showAlert = function(message, type) {
    type = type || 'success';
    var container = document.getElementById('alert-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'alert-container';
      container.className = 'alert-container';

      // Inject styles if missing
      var style = document.createElement('style');
      style.textContent = `
        .alert-container { position: fixed; bottom: 24px; right: 24px; z-index: 9999; display: flex; flex-direction: column; gap: 10px; }
        .alert-banner { background: #1a202c; color: #fff; padding: 14px 20px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); animation: slideIn 0.3s ease-out forwards; font-size: 0.95rem; font-weight: 500; font-family: sans-serif;}
        .alert-success { background: #2f855a; }
        .alert-info { background: #2b6cb0; }
        .alert-banner.fade-out { opacity: 0; transition: opacity 0.4s ease-out; }
        @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
      `;
      document.head.appendChild(style);
      document.body.appendChild(container);
    }

    var alertEl = document.createElement('div');
    alertEl.className = 'alert-banner alert-' + type;
    alertEl.textContent = message;
    container.appendChild(alertEl);

    if (Notification.permission === 'granted') {
      new Notification("BizLink", { body: message });
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission();
    }

    setTimeout(function() {
      alertEl.classList.add('fade-out');
      setTimeout(function() { alertEl.remove(); }, 400);
    }, 4500);
  }

  // Hook into Checkout globally if present
  setTimeout(() => {
    var checkoutBtn = document.getElementById('proceed-checkout-btn');
    if(checkoutBtn) {
       // override the existing onclick
       var oldClick = checkoutBtn.onclick;
       checkoutBtn.onclick = function(e) {
         // Fire cross tab event
         localStorage.setItem('bizlink_new_order', JSON.stringify({
            time: Date.now(),
            total: sessionStorage.getItem('bizlink_cart_total'),
            item: "Marketplace Order"
         }));
         if(oldClick) oldClick(e);
       }
    }
  }, 1000);
})();

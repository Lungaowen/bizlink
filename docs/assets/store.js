/**
 * BizLink simulation stores (localStorage).
 * Inventory, customer order history, driver trips, delivery schedules.
 */
(function (global) {
  function load(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      if (!raw) return fallback;
      var data = JSON.parse(raw);
      return data != null ? data : fallback;
    } catch (e) {
      return fallback;
    }
  }
  function save(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  }
  function id(prefix) {
    return prefix + '_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 6);
  }

  /* ---- Inventory (business upload) ---- */
  var INV_KEY = 'bizlink_inventory';
  function seedInventory() {
    var list = load(INV_KEY, null);
    if (list && list.length) return list;
    list = [
      { id: id('inv'), name: 'Bread, white loaf', sku: 'BRD-01', qty: 40, price: 25, unit: 'loaf', updatedAt: new Date().toISOString() },
      { id: id('inv'), name: 'Cooking oil, 750ml', sku: 'OIL-75', qty: 18, price: 42, unit: 'bottle', updatedAt: new Date().toISOString() },
      { id: id('inv'), name: 'Maize meal, 10kg', sku: 'MZE-10', qty: 12, price: 89, unit: 'bag', updatedAt: new Date().toISOString() }
    ];
    save(INV_KEY, list);
    return list;
  }
  function listInventory() {
    return seedInventory();
  }
  function addInventory(item) {
    var list = listInventory();
    var row = {
      id: id('inv'),
      name: String(item.name || '').trim(),
      sku: String(item.sku || '').trim() || ('SKU-' + list.length),
      qty: parseInt(item.qty, 10) || 0,
      price: parseFloat(item.price) || 0,
      unit: String(item.unit || 'unit').trim(),
      updatedAt: new Date().toISOString()
    };
    if (!row.name) return { ok: false, error: 'Product name is required.' };
    list.unshift(row);
    save(INV_KEY, list);
    return { ok: true, item: row, list: list };
  }
  function updateInventory(itemId, patch) {
    var list = listInventory();
    var idx = list.findIndex(function (x) { return x.id === itemId; });
    if (idx < 0) return { ok: false, error: 'Item not found.' };
    var row = list[idx];
    if (patch.name != null) row.name = String(patch.name).trim();
    if (patch.sku != null) row.sku = String(patch.sku).trim();
    if (patch.qty != null) row.qty = parseInt(patch.qty, 10) || 0;
    if (patch.price != null) row.price = parseFloat(patch.price) || 0;
    if (patch.unit != null) row.unit = String(patch.unit).trim();
    row.updatedAt = new Date().toISOString();
    list[idx] = row;
    save(INV_KEY, list);
    return { ok: true, item: row, list: list };
  }

  /* ---- Customer historic orders ---- */
  var ORD_KEY = 'bizlink_customer_orders';
  function listCustomerOrders() {
    return load(ORD_KEY, []);
  }
  function addCustomerOrder(order) {
    var list = listCustomerOrders();
    var row = {
      id: id('ord'),
      total: order.total || 0,
      addr: order.addr || '',
      phone: order.phone || '',
      status: order.status || 'placed',
      scheduleSlot: order.scheduleSlot || '',
      placedAt: order.placedAt || Date.now(),
      itemsNote: order.itemsNote || 'Marketplace basket'
    };
    list.unshift(row);
    save(ORD_KEY, list);
    return row;
  }

  /* ---- Driver historic trips ---- */
  var TRIP_KEY = 'bizlink_driver_trips';
  function seedTrips() {
    var list = load(TRIP_KEY, null);
    if (list && list.length) return list;
    list = [
      { id: id('trp'), date: 'Yesterday', title: 'Bread run · Sunrise', fee: 45, status: 'Paid', km: 8 },
      { id: id('trp'), date: '19 Sep', title: 'Oil + rice · 2 shops', fee: 80, status: 'Paid', km: 12 },
      { id: id('trp'), date: '18 Sep', title: 'Consumer delivery · kota', fee: 25, status: 'Paid', km: 3 }
    ];
    save(TRIP_KEY, list);
    return list;
  }
  function listTrips() {
    return seedTrips();
  }
  function addTrip(trip) {
    var list = listTrips();
    var row = {
      id: id('trp'),
      date: trip.date || 'Today',
      title: trip.title || 'Delivery job',
      fee: trip.fee || 0,
      status: trip.status || 'Paid',
      km: trip.km || 0
    };
    list.unshift(row);
    save(TRIP_KEY, list);
    return row;
  }

  /* ---- Schedule delivery (business / customer) ---- */
  var SCH_KEY = 'bizlink_schedules';
  function listSchedules() {
    return load(SCH_KEY, []);
  }
  function addSchedule(s) {
    var list = listSchedules();
    var row = {
      id: id('sch'),
      type: s.type || 'restock', // restock | customer
      slot: s.slot || '',
      date: s.date || '',
      note: s.note || '',
      status: s.status || 'scheduled',
      createdAt: new Date().toISOString()
    };
    if (!row.slot) return { ok: false, error: 'Choose a time slot.' };
    list.unshift(row);
    save(SCH_KEY, list);
    sessionStorage.setItem('bizlink_preferred_slot', row.slot + (row.date ? ' · ' + row.date : ''));
    return { ok: true, schedule: row, list: list };
  }

  global.BizLinkStore = {
    listInventory: listInventory,
    addInventory: addInventory,
    updateInventory: updateInventory,
    listCustomerOrders: listCustomerOrders,
    addCustomerOrder: addCustomerOrder,
    listTrips: listTrips,
    addTrip: addTrip,
    listSchedules: listSchedules,
    addSchedule: addSchedule
  };
})(window);

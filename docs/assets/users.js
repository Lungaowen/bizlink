/**
 * BizLink simulated user store (localStorage).
 * CRUD without Delete — Create, Read, Update only.
 */
(function (global) {
  var KEY = 'bizlink_users';
  var SESSION_USER = 'bizlink_user_id';

  function uid() {
    return 'u_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 8);
  }

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      var list = raw ? JSON.parse(raw) : [];
      return Array.isArray(list) ? list : [];
    } catch (e) {
      return [];
    }
  }

  function save(list) {
    localStorage.setItem(KEY, JSON.stringify(list));
  }

  function publicUser(u) {
    if (!u) return null;
    return {
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone || '',
      role: u.role,
      businessName: u.businessName || '',
      area: u.area || '',
      createdAt: u.createdAt,
      updatedAt: u.updatedAt || u.createdAt
    };
  }

  /** Create — register a new user. Fails if email exists. */
  function create(data) {
    var list = load();
    var email = (data.email || '').trim().toLowerCase();
    if (!email) return { ok: false, error: 'Email is required.' };
    if (!data.name || !String(data.name).trim()) return { ok: false, error: 'Name is required.' };
    if (!data.password || String(data.password).length < 8) {
      return { ok: false, error: 'Password must be at least 8 characters.' };
    }
    if (list.some(function (u) { return u.email === email; })) {
      return { ok: false, error: 'An account with this email already exists.' };
    }
    var role = data.role || 'CUSTOMER';
    var now = new Date().toISOString();
    var user = {
      id: uid(),
      name: String(data.name).trim(),
      email: email,
      phone: (data.phone || '').trim(),
      role: role,
      businessName: role === 'BUSINESS' ? (data.businessName || '').trim() : '',
      area: (data.area || 'Soshanguve South').trim(),
      password: String(data.password), // demo only — never store plain passwords in production
      createdAt: now,
      updatedAt: now
    };
    list.push(user);
    save(list);
    return { ok: true, user: publicUser(user) };
  }

  /** Read — list all users (public fields) or one by id */
  function listAll() {
    return load().map(publicUser);
  }

  function getById(id) {
    var u = load().find(function (x) { return x.id === id; });
    return publicUser(u);
  }

  function getByEmail(email) {
    var e = (email || '').trim().toLowerCase();
    var u = load().find(function (x) { return x.email === e; });
    return u || null;
  }

  /** Update — patch allowed fields; no delete */
  function update(id, patch) {
    var list = load();
    var idx = list.findIndex(function (x) { return x.id === id; });
    if (idx < 0) return { ok: false, error: 'User not found.' };

    var u = list[idx];
    if (patch.name != null) u.name = String(patch.name).trim();
    if (patch.phone != null) u.phone = String(patch.phone).trim();
    if (patch.area != null) u.area = String(patch.area).trim();
    if (patch.businessName != null && u.role === 'BUSINESS') {
      u.businessName = String(patch.businessName).trim();
    }
    if (patch.password != null && String(patch.password).length > 0) {
      if (String(patch.password).length < 8) {
        return { ok: false, error: 'Password must be at least 8 characters.' };
      }
      u.password = String(patch.password);
    }
    // Role change allowed in sim for demo flexibility
    if (patch.role != null && ['CUSTOMER', 'BUSINESS', 'DRIVER'].indexOf(patch.role) !== -1) {
      u.role = patch.role;
      if (u.role !== 'BUSINESS') u.businessName = '';
    }
    u.updatedAt = new Date().toISOString();
    list[idx] = u;
    save(list);

    // Keep session in sync if updating current user
    if (sessionStorage.getItem(SESSION_USER) === id) {
      sessionStorage.setItem('bizlink_role', u.role);
      sessionStorage.setItem('bizlink_user_name', u.name);
    }
    return { ok: true, user: publicUser(u) };
  }

  /** Login against stored users */
  function authenticate(email, password, roleHint) {
    var u = getByEmail(email);
    if (!u) return { ok: false, error: 'No account found for that email. Register first.' };
    if (u.password !== password) return { ok: false, error: 'Incorrect password.' };
    if (roleHint && u.role !== roleHint) {
      return {
        ok: false,
        error: 'This account is registered as ' + u.role + ', not ' + roleHint + '.'
      };
    }
    sessionStorage.setItem(SESSION_USER, u.id);
    sessionStorage.setItem('bizlink_role', u.role);
    sessionStorage.setItem('bizlink_user_name', u.name);
    return { ok: true, user: publicUser(u) };
  }

  function setSession(user) {
    if (!user) return;
    sessionStorage.setItem(SESSION_USER, user.id);
    sessionStorage.setItem('bizlink_role', user.role);
    sessionStorage.setItem('bizlink_user_name', user.name);
  }

  function currentUser() {
    var id = sessionStorage.getItem(SESSION_USER);
    if (!id) return null;
    return getById(id);
  }

  function logout() {
    sessionStorage.removeItem(SESSION_USER);
    sessionStorage.removeItem('bizlink_role');
    sessionStorage.removeItem('bizlink_user_name');
  }

  // Seed a couple of demo users once so login works out of the box
  function seedIfEmpty() {
    if (load().length) return;
    create({
      name: 'Thandi Mokoena',
      email: 'thandi@spaza.demo',
      phone: '082 111 0001',
      role: 'BUSINESS',
      businessName: "Thandi's Spaza",
      area: 'Soshanguve South',
      password: 'demo1234'
    });
    create({
      name: 'Kabelo Dlamini',
      email: 'kabelo@driver.demo',
      phone: '082 441 2290',
      role: 'DRIVER',
      area: 'Soshanguve South',
      password: 'demo1234'
    });
    create({
      name: 'Nomsa Khumalo',
      email: 'nomsa@customer.demo',
      phone: '073 555 0100',
      role: 'CUSTOMER',
      area: 'Soshanguve South',
      password: 'demo1234'
    });
  }

  seedIfEmpty();

  global.BizLinkUsers = {
    create: create,
    list: listAll,
    getById: getById,
    update: update,
    authenticate: authenticate,
    setSession: setSession,
    current: currentUser,
    logout: logout
    // intentionally no delete()
  };
})(window);

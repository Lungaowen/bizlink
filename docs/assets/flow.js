/* BizLink prototype flow coordinator.
 * Keeps the static GitHub Pages demo connected until a real API is wired in.
 */
(function () {
  var ROUTES = {
    CUSTOMER: "../customer/index.html",
    BUSINESS: "../dashboard/orders.html",
    DRIVER: "../driver/index.html"
  };

  function routeFor(role) {
    return ROUTES[role] || "../index.html";
  }

  function saveSession(role, name) {
    sessionStorage.setItem("bizlink_role", role);
    if (name) sessionStorage.setItem("bizlink_user_name", name);
  }

  function goToRole(role) {
    saveSession(role);
    window.location.href = routeFor(role);
  }

  window.BizLinkFlow = {
    routeFor: routeFor,
    saveSession: saveSession,
    goToRole: goToRole,
    getRole: function () {
      return sessionStorage.getItem("bizlink_role");
    }
  };

  document.addEventListener("DOMContentLoaded", function () {
    var role = sessionStorage.getItem("bizlink_role");
    var name = sessionStorage.getItem("bizlink_user_name");

    document.querySelectorAll("[data-bizlink-role]").forEach(function (el) {
      if (role && el.dataset.bizlinkRole === role) {
        el.style.display = "";
      } else if (el.dataset.bizlinkRole) {
        el.style.display = "none";
      }
    });

    var userLabels = document.querySelectorAll("[data-bizlink-user]");
    userLabels.forEach(function (el) {
      el.textContent = name || role || "Guest";
    });
  });
})();

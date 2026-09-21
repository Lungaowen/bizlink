document.addEventListener("DOMContentLoaded", function () {
  var registerForm = document.querySelector("#register-form");
  var loginForm = document.querySelector("#login-form");

  function roleRoute(role) {
    var routes = {
      CUSTOMER: "../customer/index.html",
      BUSINESS: "../dashboard/orders.html",
      DRIVER: "../driver/index.html"
    };
    return routes[role] || "../index.html";
  }

  function saveAccount(role, name) {
    sessionStorage.setItem("bizlink_role", role);
    if (name) sessionStorage.setItem("bizlink_user_name", name);
  }

  if (registerForm) {
    var roleInputs = registerForm.querySelectorAll('input[name="role"]');
    var businessField = document.querySelector("#business-name-field");

    function syncRoleFields() {
      var role = registerForm.querySelector('input[name="role"]:checked')?.value;
      var businessInput = businessField?.querySelector("input");
      var isBusiness = role === "BUSINESS";
      if (businessField) businessField.hidden = !isBusiness;
      if (businessInput) businessInput.required = isBusiness;
    }

    roleInputs.forEach(function (input) {
      input.addEventListener("change", syncRoleFields);
    });
    syncRoleFields();

    registerForm.addEventListener("submit", function (event) {
      event.preventDefault();

      var password = registerForm.elements.password.value;
      var confirmation = registerForm.elements.passwordConfirmation.value;
      var message = document.querySelector("#auth-message");

      if (password !== confirmation) {
        message.textContent = "Passwords do not match.";
        message.className = "auth-message error";
        return;
      }

      var role = registerForm.querySelector('input[name="role"]:checked').value;
      var name = registerForm.elements.name.value.trim();

      saveAccount(role, name);
      message.textContent = "Account created. Opening your BizLink workspace…";
      message.className = "auth-message success";

      setTimeout(function () {
        window.location.href = roleRoute(role);
      }, 500);
    });
  }

  if (loginForm) {
    loginForm.addEventListener("submit", function (event) {
      event.preventDefault();

      var role = loginForm.elements.role.value;
      var email = loginForm.elements.email.value.trim();
      var message = document.querySelector("#auth-message");

      if (!email) return;

      saveAccount(role, email.split("@")[0]);
      message.textContent = "Signed in as " + role.toLowerCase() + ". Opening your workspace…";
      message.className = "auth-message success";

      setTimeout(function () {
        window.location.href = roleRoute(role);
      }, 500);
    });
  }
});

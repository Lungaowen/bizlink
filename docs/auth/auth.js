document.addEventListener("DOMContentLoaded", function () {
  var registerForm = document.querySelector("#register-form");
  var loginForm = document.querySelector("#login-form");
  var Users = window.BizLinkUsers;

  function roleRoute(role) {
    var routes = {
      CUSTOMER: "../customer/index.html",
      BUSINESS: "../dashboard/orders.html",
      DRIVER: "../driver/index.html"
    };
    return routes[role] || "../index.html";
  }

  if (registerForm) {
    var roleInputs = registerForm.querySelectorAll('input[name="role"]');
    var businessField = document.querySelector("#business-name-field");

    function syncRoleFields() {
      var role = registerForm.querySelector('input[name="role"]:checked');
      role = role ? role.value : "CUSTOMER";
      var businessInput = businessField ? businessField.querySelector("input") : null;
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
      var message = document.querySelector("#auth-message");
      var password = registerForm.elements.password.value;
      var confirmation = registerForm.elements.passwordConfirmation.value;

      if (password !== confirmation) {
        message.textContent = "Passwords do not match.";
        message.className = "auth-message error";
        return;
      }

      var roleEl = registerForm.querySelector('input[name="role"]:checked');
      var role = roleEl ? roleEl.value : "CUSTOMER";
      var result = Users.create({
        name: registerForm.elements.name.value,
        email: registerForm.elements.email.value,
        phone: registerForm.elements.phone.value,
        role: role,
        businessName: registerForm.elements.businessName
          ? registerForm.elements.businessName.value
          : "",
        password: password
      });

      if (!result.ok) {
        message.textContent = result.error;
        message.className = "auth-message error";
        return;
      }

      Users.setSession(result.user);
      message.textContent = "Account created. Opening your BizLink workspace…";
      message.className = "auth-message success";
      setTimeout(function () {
        window.location.href = roleRoute(result.user.role);
      }, 500);
    });
  }

  if (loginForm) {
    loginForm.addEventListener("submit", function (event) {
      event.preventDefault();
      var message = document.querySelector("#auth-message");
      var role = loginForm.elements.role.value;
      var email = loginForm.elements.email.value.trim();
      var password = loginForm.elements.password.value;

      var result = Users.authenticate(email, password, role);
      if (!result.ok) {
        message.textContent = result.error;
        message.className = "auth-message error";
        return;
      }

      message.textContent = "Signed in as " + result.user.role.toLowerCase() + ". Opening workspace…";
      message.className = "auth-message success";
      setTimeout(function () {
        window.location.href = roleRoute(result.user.role);
      }, 500);
    });
  }
});

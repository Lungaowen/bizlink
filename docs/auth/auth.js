document.addEventListener("DOMContentLoaded", () => {
  const registerForm = document.querySelector("#register-form");
  const loginForm = document.querySelector("#login-form");

  if (registerForm) {
    const roleInputs = registerForm.querySelectorAll('input[name="role"]');
    const businessField = document.querySelector("#business-name-field");

    const syncRoleFields = () => {
      const role = registerForm.querySelector('input[name="role"]:checked')?.value;
      const businessInput = businessField?.querySelector("input");
      const isBusiness = role === "BUSINESS";

      if (businessField) businessField.hidden = !isBusiness;
      if (businessInput) businessInput.required = isBusiness;
    };

    roleInputs.forEach(input => input.addEventListener("change", syncRoleFields));
    syncRoleFields();

    registerForm.addEventListener("submit", event => {
      event.preventDefault();
      const password = registerForm.elements.password.value;
      const confirmation = registerForm.elements.passwordConfirmation.value;
      const message = document.querySelector("#auth-message");

      if (password !== confirmation) {
        message.textContent = "Passwords do not match.";
        message.className = "auth-message error";
        return;
      }

      message.textContent = "Account form is ready for API registration.";
      message.className = "auth-message success";
    });
  }

  if (loginForm) {
    loginForm.addEventListener("submit", event => {
      event.preventDefault();
      const role = loginForm.elements.role.value;
      const message = document.querySelector("#auth-message");
      message.textContent = `Sign-in form ready for the ${role.toLowerCase()} authentication API.`;
      message.className = "auth-message success";
    });
  }
});
// --- Dropdown Usuário ---
const userMenu = document.querySelector(".user-menu");
const userIcon = document.querySelector(".user-icon");
userIcon.addEventListener("click", () => {
  userMenu.classList.toggle("active");
});

// Máscara para número de contato (99 99999-9999)
const phoneInput = document.getElementById("phone");
phoneInput.addEventListener("input", () => {
  let value = phoneInput.value.replace(/\D/g, ""); // Remove tudo que não é número

  if (value.length > 11) value = value.slice(0, 11);

  if (value.length > 2 && value.length <= 7) {
    value = value.replace(/(\d{2})(\d{0,5})/, "$1 $2");
  } else if (value.length > 7) {
    value = value.replace(/(\d{2})(\d{5})(\d{0,4})/, "$1 $2-$3");
  }

  phoneInput.value = value;
});

// Verificação de senha no envio
const form = document.getElementById("register-form");
form.addEventListener("submit", (e) => {
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirm-password").value;

  if (password !== confirmPassword) {
    e.preventDefault(); // Impede envio
    alert("⚠️ As senhas não coincidem. Por favor, digite novamente.");
  }
});

// Toggle de mostrar/ocultar senha (👁️ / ❌)
document.querySelectorAll(".toggle-password").forEach(btn => {
  btn.addEventListener("click", () => {
    const targetId = btn.getAttribute("data-target");
    const input = document.getElementById(targetId);

    if (input.type === "password") {
      input.type = "text";
      btn.textContent = "❌"; // muda ícone
    } else {
      input.type = "password";
      btn.textContent = "👁️";
    }
  });
});

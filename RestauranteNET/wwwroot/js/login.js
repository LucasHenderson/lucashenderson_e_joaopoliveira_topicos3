// Toggle de mostrar/ocultar senha no login
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

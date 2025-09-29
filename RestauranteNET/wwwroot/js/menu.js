// --- Dropdown Usuário ---
const userMenu = document.querySelector(".user-menu");
const userIcon = document.querySelector(".user-icon");
userIcon.addEventListener("click", () => {
  userMenu.classList.toggle("active");
});

// --- Controle de Quantidade ---
document.querySelectorAll(".food-item").forEach(item => {
  const decreaseBtn = item.querySelector(".decrease");
  const increaseBtn = item.querySelector(".increase");
  const quantityEl = item.querySelector(".quantity");
  let quantity = 0;

  decreaseBtn.addEventListener("click", () => {
    if (quantity > 0) {
      quantity--;
      quantityEl.textContent = quantity;
      updateTotal();
    }
  });

  increaseBtn.addEventListener("click", () => {
    if (quantity < 10) { // 🔹 limite de 10 unidades
      quantity++;
      quantityEl.textContent = quantity;
      updateTotal();
    } else {
      alert("⚠️ Limite máximo de 10 unidades por item.");
    }
  });
});

// --- Opções de Serviço ---
let serviceType = null;
const serviceBtns = document.querySelectorAll(".service-btn");
const reservationDiv = document.querySelector(".reservation");
const reservaMsg = document.querySelector(".reserva-msg");
const reservationBtns = document.querySelectorAll(".reservation-btn");
const reservations = {19:0, 20:0, 21:0, 22:0}; // controle máx 5 reservas
let selectedReservation = null;

serviceBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    serviceType = btn.dataset.type;

    // Marca botão ativo
    serviceBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    reservationDiv.classList.add("hidden");
    reservaMsg.textContent = "";
    selectedReservation = null;

    if (serviceType === "reserva") {
      reservationDiv.classList.remove("hidden");
    }

    updateTotal();
  });
});

// --- Atualização do Total ---
function updateTotal() {
  let total = 0;

  document.querySelectorAll(".food-item").forEach(item => {
    const quantity = parseInt(item.querySelector(".quantity").textContent);
    if (quantity > 0) {
      let price = parseFloat(item.dataset.price);
      if (item.dataset.discount) {
        const discount = parseInt(item.dataset.discount);
        price = price - (price * discount / 100);
      }
      total += price * quantity;
    }
  });

  // Taxas de serviço
  if (serviceType === "proprio") total += 15;
  if (serviceType === "parceiro") total += 5;
  if (serviceType === "reserva") total += 10;

  document.getElementById("total").textContent = total.toFixed(2).replace(".", ",");
}

// --- Reservas ---
reservationBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    const time = btn.dataset.time;

    // Desmarca todos os botões
    reservationBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    if (reservations[time] >= 5) {
      reservaMsg.textContent = "❌ Horário esgotado.";
      reservaMsg.style.color = "red";
      btn.classList.remove("active");
      selectedReservation = null;
    } else {
      reservations[time]++;
      selectedReservation = time;
      reservaMsg.textContent = `✅ Reserva confirmada para ${time}:00`;
      reservaMsg.style.color = "lightgreen";
      updateTotal();
    }
  });
});

// --- Confirmar Pedido ---
document.querySelector(".confirm-btn").addEventListener("click", () => {
  // Verifica se tem ao menos 1 comida
  let totalItens = 0;
  document.querySelectorAll(".food-item .quantity").forEach(el => {
    totalItens += parseInt(el.textContent);
  });

  if (totalItens === 0) {
    alert("⚠️ Selecione ao menos 1 comida para confirmar o pedido.");
    return;
  }

  // Verifica se escolheu opção de entrega/reserva
  if (!serviceType) {
    alert("⚠️ Selecione uma opção de entrega ou reserva.");
    return;
  }

  // Se for reserva, precisa ter horário selecionado
  if (serviceType === "reserva" && !selectedReservation) {
    alert("⚠️ Escolha um horário para a reserva.");
    return;
  }

  alert("✅ Pedido confirmado! Obrigado por escolher o Restaurant .NET 🍽️");
});

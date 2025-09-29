// --- Dropdown Usuário ---
const userMenu = document.querySelector(".user-menu");
const userIcon = document.querySelector(".user-icon");
userIcon.addEventListener("click", () => {
  userMenu.classList.toggle("active");
});

// --- Mock de pedidos (simulação) ---
const pedidos = {
  proprio: [
    { id: 1, itens: [{ nome: "Pizza Marguerita", qtd: 3, preco: 48 }], endereco: "Rua das Flores, 123", total: 144, data: new Date(), confirmado: false, cancelado: false },
    { id: 2, itens: [{ nome: "Lasanha", qtd: 2, preco: 35 }], endereco: "Rua A", total: 70, data: new Date(), confirmado: true, cancelado: false },
    { id: 3, itens: [{ nome: "Hambúrguer", qtd: 1, preco: 25 }], endereco: "Rua B", total: 25, data: new Date(), confirmado: false, cancelado: false },
    { id: 4, itens: [{ nome: "Salada Caesar", qtd: 2, preco: 20 }], endereco: "Rua C", total: 40, data: new Date(), confirmado: true, cancelado: false },
  ],
  parceiro: [
    { id: 5, itens: [{ nome: "Filé ao Molho Madeira", qtd: 2, preco: 38.4 }], endereco: "Av. Central, 456", total: 76.8, data: new Date(), confirmado: true, cancelado: false },
    { id: 6, itens: [{ nome: "Strogonoff", qtd: 1, preco: 30 }], endereco: "Av. X", total: 30, data: new Date(), confirmado: false, cancelado: false },
  ],
  reservas: [
    { id: 7, itens: [{ nome: "Pizza Calabresa", qtd: 1, preco: 35 }], endereco: "Presencial", total: 45, horario: "20:00", data: new Date(), confirmado: false, cancelado: false },
    { id: 8, itens: [{ nome: "Risoto de Camarão", qtd: 1, preco: 55 }], endereco: "Presencial", total: 65, horario: "21:00", data: new Date(), confirmado: true, cancelado: false },
  ]
};

// --- Controle de página por lista ---
const state = {
  proprio: 1,
  parceiro: 1,
  reservas: 1,
};
const itemsPerPage = 3;

// --- Renderização geral ---
function renderPedidos() {
  renderLista("delivery-proprio", pedidos.proprio, "pagination-proprio", state.proprio);
  renderLista("delivery-parceiro", pedidos.parceiro, "pagination-parceiro", state.parceiro);
  renderLista("reservas", pedidos.reservas, "pagination-reservas", state.reservas, true);
}

function renderLista(containerId, lista, paginationId, currentPage, isReserva = false) {
  const container = document.getElementById(containerId);
  const paginationContainer = document.getElementById(paginationId);
  container.innerHTML = "";
  paginationContainer.innerHTML = "";

  // Paginação
  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const pageItems = lista.slice(start, end);
  const totalPages = Math.ceil(lista.length / itemsPerPage);

  // Render itens
  pageItems.forEach(pedido => {
    const li = document.createElement("li");
    li.classList.add("order-item");

    let itensHTML = pedido.itens
      .map(i => `${i.nome} (${i.qtd}): R$${i.preco.toFixed(2)} un`)
      .join(", ");

    // Status do pedido
    let statusText = "⏳ Aguardando Confirmação";
    if (pedido.confirmado) statusText = "✅ Confirmado";
    else if (pedido.cancelado) statusText = "❌ Cancelado";

    li.innerHTML = `
      <div class="order-header">${itensHTML}</div>
      <div class="order-details">Endereço: ${pedido.endereco}</div>
      <div class="order-details">Total: R$${pedido.total.toFixed(2)}</div>
      <div class="order-details">Data: ${pedido.data.toLocaleDateString()} - ${pedido.data.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
      ${isReserva ? `<div class="order-details">Horário Reserva: ${pedido.horario}</div>` : ""}
      <div class="order-status">Status: ${statusText}</div>
    `;

    // Botão de cancelar só aparece se não foi confirmado nem cancelado
    if (!pedido.confirmado && !pedido.cancelado) {
      const cancelBtn = document.createElement("button");
      cancelBtn.classList.add("cancel-btn");
      cancelBtn.textContent = "Cancelar";
      cancelBtn.addEventListener("click", () => {
        pedido.cancelado = true;
        renderPedidos();
      });
      li.appendChild(cancelBtn);
    }

    container.appendChild(li);
  });

  // Render paginação
  if (totalPages > 1) {
    const prevBtn = document.createElement("button");
    prevBtn.textContent = "Anterior";
    prevBtn.disabled = currentPage === 1;
    prevBtn.addEventListener("click", () => {
      state[getKeyFromId(containerId)]--;
      renderPedidos();
    });

    const nextBtn = document.createElement("button");
    nextBtn.textContent = "Próximo";
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.addEventListener("click", () => {
      state[getKeyFromId(containerId)]++;
      renderPedidos();
    });

    paginationContainer.appendChild(prevBtn);
    paginationContainer.appendChild(nextBtn);
  }
}

// --- Helpers ---
function getKeyFromId(id) {
  if (id === "delivery-proprio") return "proprio";
  if (id === "delivery-parceiro") return "parceiro";
  if (id === "reservas") return "reservas";
}

// --- Inicializar ---
renderPedidos();

// --- Dropdown Usuário ---
const userMenu = document.querySelector(".user-menu");
const userIcon = document.querySelector(".user-icon");
userIcon.addEventListener("click", () => {
  userMenu.classList.toggle("active");
});

// --- Mock de pedidos ---
let pedidos = {
  proprio: [
    { id: 1, cliente: "Lucas", comidas: [{ nome: "Pizza", qtd: 2 }, { nome: "Lasanha", qtd: 3 }], endereco: "Rua A", total: 144, data: new Date("2025-09-20T19:30:00"), status: "pending" },
    { id: 2, cliente: "Ana", comidas: [{ nome: "Hambúrguer", qtd: 1 }], endereco: "Rua B", total: 30, data: new Date("2025-09-21T12:00:00"), status: "confirmed" }
  ],
  parceiro: [
    { id: 3, cliente: "João", comidas: [{ nome: "Filé", qtd: 2 }], endereco: "Av. Central", total: 80, data: new Date("2025-09-21T13:00:00"), status: "confirmed" }
  ],
  reservas: [
    { id: 4, cliente: "Maria", comidas: [{ nome: "Pizza", qtd: 1 }], endereco: "Presencial", total: 45, data: new Date("2025-09-21T19:00:00"), horario: "19h-20h", status: "pending" },
    { id: 5, cliente: "Carlos", comidas: [{ nome: "Risoto", qtd: 2 }], endereco: "Presencial", total: 90, data: new Date("2025-09-21T20:00:00"), horario: "20h-21h", status: "confirmed" },
    { id: 6, cliente: "Fernanda", comidas: [{ nome: "Salada", qtd: 3 }], endereco: "Presencial", total: 60, data: new Date("2025-09-22T19:00:00"), horario: "19h-20h", status: "canceled" },
    { id: 7, cliente: "Pedro", comidas: [{ nome: "Pizza", qtd: 1 }], endereco: "Presencial", total: 45, data: new Date("2025-09-22T21:00:00"), horario: "21h-22h", status: "pending" },
    { id: 8, cliente: "Juliana", comidas: [{ nome: "Lasanha", qtd: 1 }], endereco: "Presencial", total: 35, data: new Date("2025-09-22T19:30:00"), horario: "19h-20h", status: "confirmed" },
    { id: 9, cliente: "Bruno", comidas: [{ nome: "Filé", qtd: 2 }], endereco: "Presencial", total: 80, data: new Date("2025-09-23T20:00:00"), horario: "20h-21h", status: "pending" },
    { id: 10, cliente: "Camila", comidas: [{ nome: "Pizza", qtd: 2 }], endereco: "Presencial", total: 90, data: new Date("2025-09-23T21:00:00"), horario: "21h-22h", status: "confirmed" }
  ]
};

// --- Mock de ranking ---
let rankingSem = [
  { nome: "Pizza", qtd: 30, img: "../imgs/pizza-marguerita.jpg" },
  { nome: "Lasanha", qtd: 20, img: "../imgs/lasanha.jpg" }
];
let rankingCom = [
  { nome: "Risoto", qtd: 15, img: "../imgs/risoto.jpg" },
  { nome: "Salada", qtd: 10, img: "../imgs/salada.jpg" }
];

// --- Controle de paginação ---
const state = { proprio: 1, parceiro: 1, reservas: 1, sem: 1, com: 1 };
const itemsPerPage = 5;

// --- Função de renderização geral ---
function renderPedidos() {
  renderLista("list-proprio", pedidos.proprio, "pagination-proprio", "total-proprio", state.proprio, document.getElementById("filter-proprio").value);
  renderLista("list-parceiro", pedidos.parceiro, "pagination-parceiro", "total-parceiro", state.parceiro, document.getElementById("filter-parceiro").value);
  renderLista("list-reservas", pedidos.reservas, "pagination-reservas", "total-reservas", state.reservas, document.getElementById("filter-reservas").value, true);
  renderRanking("ranking-sem", rankingSem, "pagination-sem", state.sem);
  renderRanking("ranking-com", rankingCom, "pagination-com", state.com);
}

// --- Renderiza listas de pedidos ---
function renderLista(listId, lista, paginationId, totalId, currentPage, filterDate, isReserva = false) {
  const container = document.getElementById(listId);
  const pagination = document.getElementById(paginationId);
  container.innerHTML = "";
  pagination.innerHTML = "";

  // Filtro de data
  let filtrada = lista;
  if (filterDate) {
    filtrada = lista.filter(p => {
      const d = p.data.toISOString().split("T")[0];
      return d === filterDate;
    });
  }

  const totalPages = Math.ceil(filtrada.length / itemsPerPage);
  if (currentPage > totalPages) currentPage = totalPages || 1;
  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const pageItems = filtrada.slice(start, end);

  // Faturamento
  let faturado = filtrada
    .filter(p => p.status === "confirmed")
    .reduce((acc, p) => acc + p.total, 0);
  document.getElementById(totalId).textContent = `Total Faturado: R$${faturado.toFixed(2)}`;

  // Renderiza pedidos
  pageItems.forEach(pedido => {
    const li = document.createElement("li");
    li.classList.add("order-item");

    const comidasHTML = pedido.comidas.map(c => `${c.qtd} - ${c.nome}`).join(", ");

    li.innerHTML = `
      <div class="order-header">${pedido.cliente}</div>
      <div class="order-details">Comidas: ${comidasHTML}</div>
      <div class="order-details">Endereço: ${pedido.endereco}</div>
      <div class="order-details">Data: ${pedido.data.toLocaleDateString()} - ${pedido.data.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
      ${isReserva ? `<div class="order-details">Horário: ${pedido.horario}</div>` : ""}
      <div class="order-details">Valor Total: R$${pedido.total.toFixed(2)}</div>
      <div class="order-details">Status: ${pedido.status === "confirmed" ? "✔ Confirmado" : pedido.status === "canceled" ? "❌ Cancelado" : "🕒 Aguardando Confirmação"}</div>
    `;

    if (pedido.status === "pending") {
      const actions = document.createElement("div");
      actions.classList.add("order-actions");

      const confirmBtn = document.createElement("button");
      confirmBtn.textContent = "Confirmar";
      confirmBtn.classList.add("confirm-btn");
      confirmBtn.addEventListener("click", () => {
        pedido.status = "confirmed";
        renderPedidos();
      });

      const cancelBtn = document.createElement("button");
      cancelBtn.textContent = "Cancelar";
      cancelBtn.classList.add("cancel-btn");
      cancelBtn.addEventListener("click", () => {
        pedido.status = "canceled";
        renderPedidos();
      });

      actions.appendChild(confirmBtn);
      actions.appendChild(cancelBtn);
      li.appendChild(actions);
    }

    container.appendChild(li);
  });

  // Paginação
  if (totalPages > 1) {
    const prev = document.createElement("button");
    prev.textContent = "Anterior";
    prev.disabled = currentPage === 1;
    prev.addEventListener("click", () => {
      state[getKeyFromId(listId)]--;
      renderPedidos();
    });

    const next = document.createElement("button");
    next.textContent = "Próximo";
    next.disabled = currentPage === totalPages;
    next.addEventListener("click", () => {
      state[getKeyFromId(listId)]++;
      renderPedidos();
    });

    pagination.appendChild(prev);
    pagination.appendChild(next);
  }
}

// --- Render ranking ---
function renderRanking(listId, lista, paginationId, currentPage) {
  const container = document.getElementById(listId);
  const pagination = document.getElementById(paginationId);
  container.innerHTML = "";
  pagination.innerHTML = "";

  const totalPages = Math.ceil(lista.length / itemsPerPage);
  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const pageItems = lista.slice(start, end);

  pageItems.forEach((item, index) => {
    const li = document.createElement("li");
    li.classList.add("order-item");

    li.innerHTML = `
      <div class="order-header">#${start + index + 1} - ${item.nome}</div>
      <img src="${item.img}" alt="${item.nome}" style="width:60px;height:60px;border-radius:8px;object-fit:cover;">
      <div class="order-details">Total Vendido: ${item.qtd}</div>
    `;

    container.appendChild(li);
  });

  if (totalPages > 1) {
    const prev = document.createElement("button");
    prev.textContent = "Anterior";
    prev.disabled = currentPage === 1;
    prev.addEventListener("click", () => {
      state[getKeyFromId(listId)]--;
      renderPedidos();
    });

    const next = document.createElement("button");
    next.textContent = "Próximo";
    next.disabled = currentPage === totalPages;
    next.addEventListener("click", () => {
      state[getKeyFromId(listId)]++;
      renderPedidos();
    });

    pagination.appendChild(prev);
    pagination.appendChild(next);
  }
}

// Helpers
function getKeyFromId(id) {
  if (id.includes("proprio")) return "proprio";
  if (id.includes("parceiro")) return "parceiro";
  if (id.includes("reservas")) return "reservas";
  if (id.includes("sem")) return "sem";
  if (id.includes("com")) return "com";
}

// --- Eventos de filtro ---
document.getElementById("filter-proprio").addEventListener("change", () => {
  state.proprio = 1;
  renderPedidos();
});
document.getElementById("filter-parceiro").addEventListener("change", () => {
  state.parceiro = 1;
  renderPedidos();
});
document.getElementById("filter-reservas").addEventListener("change", () => {
  state.reservas = 1;
  renderPedidos();
});

// --- Inicialização ---
renderPedidos();

const userMenu = document.querySelector(".user-menu");
const userIcon = document.querySelector(".user-icon");
if (userIcon) {
    userIcon.addEventListener("click", () => {
        userMenu.classList.toggle("active");
    });
}

let pedidos = { proprio: [], parceiro: [], reserva: [] };
const state = { proprio: 1, parceiro: 1, reserva: 1 };
const itemsPerPage = 5;

// Carregar pedidos do banco de dados
async function loadPedidos() {
    try {
        const response = await fetch('/api/pedidos/all');
        if (response.ok) {
            const todosPedidos = await response.json();

            // Separar por tipo
            pedidos.proprio = todosPedidos.filter(p => p.tipo.toLowerCase() === 'proprio');
            pedidos.parceiro = todosPedidos.filter(p => p.tipo.toLowerCase() === 'parceiro');
            pedidos.reserva = todosPedidos.filter(p => p.tipo.toLowerCase() === 'reserva');

            console.log('Pedidos carregados:', {
                proprio: pedidos.proprio.length,
                parceiro: pedidos.parceiro.length,
                reserva: pedidos.reserva.length
            });

            renderPedidos();
        } else {
            console.error('Erro ao carregar pedidos:', response.status);
            alert('Erro ao carregar pedidos. Verifique se você está logado como administrador.');
        }
    } catch (error) {
        console.error('Erro ao carregar pedidos:', error);
        alert('Erro ao conectar com o servidor.');
    }
}

function renderPedidos() {
    renderLista("list-proprio", pedidos.proprio, "pagination-proprio", "total-proprio", state.proprio, document.getElementById("filter-proprio").value);
    renderLista("list-parceiro", pedidos.parceiro, "pagination-parceiro", "total-parceiro", state.parceiro, document.getElementById("filter-parceiro").value);
    renderLista("list-reservas", pedidos.reserva, "pagination-reservas", "total-reservas", state.reserva, document.getElementById("filter-reservas").value, true);
}

function renderLista(listId, lista, paginationId, totalId, currentPage, filterDate, isReserva = false) {
    const container = document.getElementById(listId);
    const pagination = document.getElementById(paginationId);
    container.innerHTML = "";
    pagination.innerHTML = "";

    // Filtro de data
    let filtrada = lista;
    if (filterDate) {
        filtrada = lista.filter(p => {
            const d = new Date(p.data).toISOString().split("T")[0];
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
    document.getElementById(totalId).textContent = `Total Faturado: R$ ${faturado.toFixed(2)}`;

    // Se não houver pedidos
    if (pageItems.length === 0) {
        container.innerHTML = '<p style="color:#888;padding:1rem;">Nenhum pedido encontrado.</p>';
        return;
    }

    // Renderizar pedidos
    pageItems.forEach(pedido => {
        const li = document.createElement("li");
        li.classList.add("order-item");

        const comidasHTML = pedido.itens.map(i => `${i.quantidade} - ${i.comida.nome}`).join(", ");
        const dataFormatada = new Date(pedido.data).toLocaleString('pt-BR');

        li.innerHTML = `
            <div class="order-header">${pedido.cliente.nomeCompleto}</div>
            <div class="order-details">Comidas: ${comidasHTML}</div>
            <div class="order-details">Endereço: ${pedido.enderecoEntrega || 'N/A'}</div>
            <div class="order-details">Data: ${dataFormatada}</div>
            ${isReserva && pedido.horario ? `<div class="order-details">Horário: ${pedido.horario}:00</div>` : ""}
            <div class="order-details">Valor Total: R$ ${pedido.total.toFixed(2)}</div>
            <div class="order-details">Status: ${getStatusText(pedido.status)}</div>
        `;

        if (pedido.status === "pending") {
            const actions = document.createElement("div");
            actions.classList.add("order-actions");

            const confirmBtn = document.createElement("button");
            confirmBtn.textContent = "Confirmar";
            confirmBtn.classList.add("confirm-btn");
            confirmBtn.addEventListener("click", () => updateStatus(pedido.id, "confirmed"));

            const cancelBtn = document.createElement("button");
            cancelBtn.textContent = "Cancelar";
            cancelBtn.classList.add("cancel-btn");
            cancelBtn.addEventListener("click", () => updateStatus(pedido.id, "canceled"));

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

async function updateStatus(pedidoId, novoStatus) {
    try {
        const response = await fetch(`/api/pedidos/${pedidoId}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(novoStatus)
        });

        if (response.ok) {
            alert(`Pedido ${novoStatus === 'confirmed' ? 'confirmado' : 'cancelado'} com sucesso!`);
            await loadPedidos(); // Recarregar
        } else {
            alert('Erro ao atualizar status do pedido.');
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao atualizar status.');
    }
}

function getStatusText(status) {
    switch (status.toLowerCase()) {
        case 'confirmed': return '✅ Confirmado';
        case 'canceled': return '❌ Cancelado';
        case 'pending': return '⏳ Aguardando Confirmação';
        default: return status;
    }
}

function getKeyFromId(id) {
    if (id.includes("proprio")) return "proprio";
    if (id.includes("parceiro")) return "parceiro";
    if (id.includes("reservas")) return "reserva";
}

// Eventos de filtro
document.getElementById("filter-proprio").addEventListener("change", () => {
    state.proprio = 1;
    renderPedidos();
});
document.getElementById("filter-parceiro").addEventListener("change", () => {
    state.parceiro = 1;
    renderPedidos();
});
document.getElementById("filter-reservas").addEventListener("change", () => {
    state.reserva = 1;
    renderPedidos();
});

// Inicializar
loadPedidos();
const userIcon = document.querySelector(".user-icon");
const userMenu = document.querySelector(".user-menu");

if (userIcon && userMenu) {
    userIcon.addEventListener("click", () => {
        userMenu.classList.toggle("active");
    });
}

const chefList = document.getElementById("chef-list");
const menuList = document.getElementById("menu-list");
const totalEl = document.getElementById("total");
const confirmBtn = document.getElementById("confirm-order");

let carrinho = {};
let serviceType = null;
let selectedReservation = null;
let todasComidas = [];

// PAGINAÇÃO
let currentPageChef = 1;
let currentPageMenu = 1;
const itemsPerPage = 6; // 6 itens por página

async function loadComidas() {
    try {
        const response = await fetch('/api/comidas');
        if (!response.ok) {
            console.error('Erro ao carregar comidas');
            return;
        }

        todasComidas = await response.json();
        const comidasChef = todasComidas.filter(c => c.chef);
        const comidasNormais = todasComidas.filter(c => !c.chef);

        renderComidas(chefList, comidasChef, true, currentPageChef);
        renderComidas(menuList, comidasNormais, false, currentPageMenu);
    } catch (error) {
        console.error('Erro:', error);
    }
}

function renderComidas(container, comidas, isChef, currentPage = 1) {
    const paginationId = isChef ? 'chef-pagination' : 'menu-pagination';
    let paginationContainer = document.getElementById(paginationId);

    // Criar container de paginação se não existir
    if (!paginationContainer) {
        paginationContainer = document.createElement('div');
        paginationContainer.id = paginationId;
        paginationContainer.className = 'pagination';
        container.parentElement.appendChild(paginationContainer);
    }

    container.innerHTML = '';
    paginationContainer.innerHTML = '';

    // Calcular paginação
    const totalPages = Math.ceil(comidas.length / itemsPerPage);
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const comidasPagina = comidas.slice(start, end);

    comidasPagina.forEach(comida => {
        const div = document.createElement('div');
        div.classList.add('food-item');
        if (isChef) div.classList.add('chef');

        const preco = isChef ? comida.preco * 0.8 : comida.preco;
        const precoOriginal = isChef ? `<span class="discount">R$ ${comida.preco.toFixed(2)}</span>` : '';

        div.innerHTML = `
            <img src="${comida.imgUrl || '/imgs/img-null.png'}" alt="${comida.nome}">
            <h3>${comida.nome}</h3>
            <p>${comida.descricao}</p>
            <div class="price">
                ${precoOriginal}
                R$ ${preco.toFixed(2)}
            </div>
            <div class="quantity-control">
                <button class="decrease" data-id="${comida.id}">-</button>
                <span class="quantity" data-id="${comida.id}">0</span>
                <button class="increase" data-id="${comida.id}" data-preco="${preco}" data-preco-original="${comida.preco}" data-chef="${isChef}">+</button>
            </div>
        `;

        const increaseBtn = div.querySelector('.increase');
        const decreaseBtn = div.querySelector('.decrease');

        increaseBtn.addEventListener('click', () => {
            const id = parseInt(increaseBtn.dataset.id);
            const precoAtual = parseFloat(increaseBtn.dataset.preco);
            const precoOrig = parseFloat(increaseBtn.dataset.precoOriginal);
            const ehChef = increaseBtn.dataset.chef === 'true';

            if (!carrinho[id]) {
                carrinho[id] = {
                    quantidade: 0,
                    preco: precoAtual,
                    precoOriginal: precoOrig,
                    isChef: ehChef
                };
            }

            if (carrinho[id].quantidade < 10) {
                carrinho[id].quantidade++;
                updateQuantity(id);
                updateTotal();
            } else {
                alert('⚠️ Limite máximo de 10 unidades por item.');
            }
        });

        decreaseBtn.addEventListener('click', () => {
            const id = parseInt(decreaseBtn.dataset.id);
            if (carrinho[id] && carrinho[id].quantidade > 0) {
                carrinho[id].quantidade--;
                updateQuantity(id);
                updateTotal();
            }
        });

        container.appendChild(div);
    });

    // Renderizar botões de paginação
    if (totalPages > 1) {
        const prevBtn = document.createElement('button');
        prevBtn.textContent = '← Anterior';
        prevBtn.className = 'pagination-btn';
        prevBtn.disabled = currentPage === 1;
        prevBtn.addEventListener('click', () => {
            if (isChef) {
                currentPageChef--;
                renderComidas(container, comidas, isChef, currentPageChef);
            } else {
                currentPageMenu--;
                renderComidas(container, comidas, isChef, currentPageMenu);
            }
            window.scrollTo({ top: container.offsetTop - 100, behavior: 'smooth' });
        });

        const pageInfo = document.createElement('span');
        pageInfo.className = 'page-info';
        pageInfo.textContent = `Página ${currentPage} de ${totalPages}`;

        const nextBtn = document.createElement('button');
        nextBtn.textContent = 'Próximo →';
        nextBtn.className = 'pagination-btn';
        nextBtn.disabled = currentPage === totalPages;
        nextBtn.addEventListener('click', () => {
            if (isChef) {
                currentPageChef++;
                renderComidas(container, comidas, isChef, currentPageChef);
            } else {
                currentPageMenu++;
                renderComidas(container, comidas, isChef, currentPageMenu);
            }
            window.scrollTo({ top: container.offsetTop - 100, behavior: 'smooth' });
        });

        paginationContainer.appendChild(prevBtn);
        paginationContainer.appendChild(pageInfo);
        paginationContainer.appendChild(nextBtn);
    }
}

function updateQuantity(id) {
    const quantityEls = document.querySelectorAll(`.quantity[data-id="${id}"]`);
    quantityEls.forEach(el => {
        el.textContent = carrinho[id]?.quantidade || 0;
    });
}

function updateTotal() {
    let subtotal = 0;
    let descontoTotal = 0;

    Object.entries(carrinho).forEach(([id, item]) => {
        if (item.quantidade > 0) {
            subtotal += item.preco * item.quantidade;
            if (item.isChef) {
                descontoTotal += (item.precoOriginal - item.preco) * item.quantidade;
            }
        }
    });

    let taxa = 0;
    if (serviceType === 'proprio') taxa = 15;
    if (serviceType === 'parceiro') taxa = 5;
    if (serviceType === 'reserva') taxa = 10;

    const total = subtotal + taxa;

    const summarySection = document.querySelector('.order-summary');
    summarySection.innerHTML = `
        <h2>Resumo do Pedido</h2>
        <div style="text-align:left; max-width:400px; margin:0 auto 1.5rem;">
            <div style="display:flex; justify-content:space-between; margin-bottom:0.5rem;">
                <span>Subtotal:</span>
                <span>R$ ${(subtotal + descontoTotal).toFixed(2)}</span>
            </div>
            ${descontoTotal > 0 ? `
            <div style="display:flex; justify-content:space-between; margin-bottom:0.5rem; color:#71100f;">
                <span>Desconto (Chef):</span>
                <span>- R$ ${descontoTotal.toFixed(2)}</span>
            </div>
            ` : ''}
            ${taxa > 0 ? `
            <div style="display:flex; justify-content:space-between; margin-bottom:0.5rem;">
                <span>Taxa de serviço:</span>
                <span>R$ ${taxa.toFixed(2)}</span>
            </div>
            ` : ''}
            ${serviceType === 'reserva' && selectedReservation ? `
            <div style="display:flex; justify-content:space-between; margin-bottom:0.5rem;">
                <span>Horário da reserva:</span>
                <span>${selectedReservation}:00</span>
            </div>
            ` : ''}
            <hr style="border:1px solid #444; margin:0.5rem 0;">
            <div style="display:flex; justify-content:space-between; font-size:1.3rem; font-weight:bold; color:#71100f;">
                <span>Total:</span>
                <span>R$ ${total.toFixed(2)}</span>
            </div>
        </div>
        <button id="confirm-order" class="confirm-btn">Confirmar Pedido</button>
    `;

    document.getElementById('confirm-order').addEventListener('click', confirmarPedido);
}

const serviceBtns = document.querySelectorAll('.service-btn');
serviceBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        serviceType = btn.dataset.type;

        serviceBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const reservationDiv = document.getElementById('reservation-times');
        if (serviceType === 'reserva' && reservationDiv) {
            reservationDiv.classList.remove('hidden');
        } else if (reservationDiv) {
            reservationDiv.classList.add('hidden');
            selectedReservation = null; // Resetar horário quando não for reserva
            const reservaMsg = document.querySelector('.reserva-msg');
            if (reservaMsg) {
                reservaMsg.textContent = '';
            }
        }

        updateTotal();
    });
});

const reservationBtns = document.querySelectorAll('.reservation-btn');
const reservaMsg = document.querySelector('.reserva-msg');

reservationBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const time = btn.dataset.time;

        reservationBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        selectedReservation = time;

        if (reservaMsg) {
            reservaMsg.textContent = `✅ Horário selecionado: ${time}:00`;
            reservaMsg.style.color = 'lightgreen';
        }

        updateTotal(); // Atualizar o resumo para mostrar o horário
    });
});

function confirmarPedido() {
    const totalItens = Object.values(carrinho).reduce((sum, item) => sum + item.quantidade, 0);

    if (totalItens === 0) {
        alert('⚠️ Selecione ao menos 1 item para confirmar o pedido.');
        return;
    }

    if (!serviceType) {
        alert('⚠️ Selecione uma opção de entrega ou reserva.');
        return;
    }

    if (serviceType === 'reserva' && !selectedReservation) {
        alert('⚠️ Escolha um horário para a reserva.');
        return;
    }

    const itens = Object.entries(carrinho)
        .filter(([id, item]) => item.quantidade > 0)
        .map(([id, item]) => ({
            comidaId: parseInt(id),
            quantidade: item.quantidade,
            precoUnitario: item.preco
        }));

    const subtotal = Object.entries(carrinho).reduce((sum, [id, item]) => {
        return sum + (item.preco * item.quantidade);
    }, 0);

    const taxa = serviceType === 'proprio' ? 15 : serviceType === 'parceiro' ? 5 : 10;
    const total = subtotal + taxa;

    const pedido = {
        tipo: serviceType,
        total: total,
        itens: itens,
        horario: serviceType === 'reserva' ? selectedReservation : null // Incluir horário apenas para reservas
    };

    console.log('===== DEBUG PEDIDO ENVIADO =====');
    console.log('Tipo:', pedido.tipo);
    console.log('Horario:', pedido.horario);
    console.log('Total:', pedido.total);
    console.log('Itens:', pedido.itens);
    console.log('============================');

    fetch('/api/pedidos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pedido)
    })
        .then(response => {
            if (response.ok) {
                alert('✅ Pedido confirmado com sucesso!');
                location.reload();
            } else {
                response.json().then(data => {
                    console.error('Erro do servidor:', data);
                    alert('❌ Erro ao confirmar pedido: ' + (data.error || 'Tente novamente.'));
                });
            }
        })
        .catch(error => {
            console.error('Erro:', error);
            alert('❌ Erro ao confirmar pedido.');
        });
}

loadComidas();
const userMenu = document.querySelector(".user-menu");
const userIcon = document.querySelector(".user-icon");
if (userIcon) {
    userIcon.addEventListener("click", () => {
        userMenu.classList.toggle("active");
    });
}

let comidas = [];
const foodList = document.getElementById("food-list");
const addFoodBtn = document.getElementById("add-food-btn");
const paginationEl = document.getElementById("pagination");
const addFoodModal = document.getElementById("add-food-modal");
const addFoodForm = document.getElementById("add-food-form");
const cancelAddFoodBtn = document.getElementById("cancel-add-food");

let currentPage = 1;
const itemsPerPage = 6;

// Máscara de preço
function formatPrice(value) {
    // Remove tudo exceto números
    value = value.replace(/\D/g, '');

    // Converte para número e divide por 100 para ter centavos
    value = (parseInt(value) || 0) / 100;

    // Formata com 2 casas decimais
    return value.toFixed(2).replace('.', ',');
}

function parsePrice(formattedValue) {
    // Converte de "12,50" para 12.50
    return parseFloat(formattedValue.replace(',', '.')) || 0;
}

function applyPriceMask(input) {
    input.addEventListener('input', (e) => {
        e.target.value = formatPrice(e.target.value);
    });

    input.addEventListener('keypress', (e) => {
        // Permite apenas números
        if (e.key < '0' || e.key > '9') {
            e.preventDefault();
        }
    });
}

async function loadComidas() {
    try {
        const response = await fetch('/api/comidas');
        if (response.ok) {
            comidas = await response.json();
            renderComidas();
        } else {
            alert('Erro ao carregar comidas. Tente novamente.');
        }
    } catch (error) {
        console.error('Erro ao carregar comidas:', error);
        alert('Erro ao carregar comidas. Tente novamente.');
    }
}

async function saveComida(comida) {
    try {
        if (!comida.nome || comida.preco <= 0) {
            throw new Error('Nome e preço são obrigatórios.');
        }

        const url = comida.id ? `/api/comidas/${comida.id}` : '/api/comidas';
        const method = comida.id ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: comida.id || 0,
                nome: comida.nome,
                descricao: comida.descricao,
                preco: comida.preco,
                chef: comida.chef,
                imgUrl: comida.imgUrl || '/imgs/img-null.png'
            })
        });

        if (response.ok) {
            const savedComida = await response.json();
            if (!comida.id) {
                comidas.push(savedComida);
            } else {
                const index = comidas.findIndex(c => c.id === comida.id);
                if (index !== -1) {
                    comidas[index] = savedComida;
                }
            }
            renderComidas();
            return savedComida;
        } else {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Erro ao salvar comida.');
        }
    } catch (error) {
        console.error('Erro ao salvar comida:', error);
        throw error;
    }
}

async function deleteComida(id) {
    try {
        const response = await fetch(`/api/comidas/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            comidas = comidas.filter(c => c.id !== id);
            renderComidas();
            alert('Comida deletada com sucesso!');
        } else {
            throw new Error('Erro ao deletar comida.');
        }
    } catch (error) {
        console.error('Erro ao deletar comida:', error);
        alert('Erro ao deletar comida: ' + error.message);
    }
}

function renderComidas() {
    foodList.innerHTML = "";
    const totalPages = Math.ceil(comidas.length / itemsPerPage);
    if (currentPage > totalPages) currentPage = totalPages || 1;
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const pageItems = comidas.slice(start, end);

    pageItems.forEach(comida => {
        const li = document.createElement("li");
        li.classList.add("food-item");
        if (comida.isNew) {
            li.classList.add("new");
            setTimeout(() => delete comida.isNew, 2000);
        }

        li.innerHTML = `
            <img src="${comida.imgUrl || '/imgs/img-null.png'}" alt="${comida.nome}" title="Clique para alterar imagem">
            <div class="food-details">
                <input type="text" value="${comida.nome}" placeholder="Nome da comida" data-field="nome">
                <textarea rows="2" placeholder="Descrição da comida" data-field="descricao">${comida.descricao || ''}</textarea>
                <div class="price-input-wrapper">
                    <span class="currency">R$</span>
                    <input type="text" value="${comida.preco.toFixed(2).replace('.', ',')}" data-field="preco" placeholder="0,00">
                </div>
            </div>
            <div class="food-actions">
                <button class="save-btn" title="Salvar alterações">💾</button>
                <button class="delete-btn" title="Deletar comida">🗑</button>
                <button class="chef-btn ${comida.chef ? "active" : ""}" title="Marcar como recomendação do chef">👨‍🍳</button>
            </div>
        `;

        const nomeInput = li.querySelector('[data-field="nome"]');
        const descInput = li.querySelector('[data-field="descricao"]');
        const precoInput = li.querySelector('[data-field="preco"]');

        // Aplicar máscara de preço
        applyPriceMask(precoInput);

        nomeInput.addEventListener("input", e => comida.nome = e.target.value);
        descInput.addEventListener("input", e => comida.descricao = e.target.value);
        precoInput.addEventListener("input", e => {
            comida.preco = parsePrice(e.target.value);
        });

        const saveBtn = li.querySelector(".save-btn");
        saveBtn.addEventListener("click", async () => {
            if (!comida.nome.trim()) {
                alert('O nome da comida é obrigatório!');
                return;
            }
            if (comida.preco <= 0) {
                alert('O preço deve ser maior que zero!');
                return;
            }
            try {
                await saveComida(comida);
                alert('Comida salva com sucesso!');
            } catch (error) {
                alert('Erro ao salvar comida: ' + error.message);
            }
        });

        const deleteBtn = li.querySelector(".delete-btn");
        deleteBtn.addEventListener("click", async () => {
            if (confirm(`Deseja realmente deletar "${comida.nome}"?`)) {
                await deleteComida(comida.id);
            }
        });

        const chefBtn = li.querySelector(".chef-btn");
        chefBtn.addEventListener("click", async () => {
            comida.chef = !comida.chef;
            chefBtn.classList.toggle("active");
            try {
                await saveComida(comida);
                alert('Status de Chef atualizado!');
            } catch (error) {
                alert('Erro ao atualizar status de Chef: ' + error.message);
            }
        });

        const imgEl = li.querySelector("img");
        imgEl.addEventListener("click", () => {
            const fileInput = document.createElement("input");
            fileInput.type = "file";
            fileInput.accept = "image/png,image/jpeg,image/jpg";
            fileInput.onchange = async e => {
                const file = e.target.files[0];
                if (file) {
                    try {
                        const formData = new FormData();
                        formData.append("file", file);
                        const response = await fetch('/api/comidas/upload', {
                            method: 'POST',
                            body: formData
                        });
                        if (response.ok) {
                            const data = await response.json();
                            comida.imgUrl = data.url;
                            imgEl.src = data.url;
                            await saveComida(comida);
                            alert('Imagem atualizada com sucesso!');
                        } else {
                            throw new Error('Erro ao fazer upload da imagem.');
                        }
                    } catch (error) {
                        console.error('Erro ao fazer upload da imagem:', error);
                        alert('Erro ao fazer upload da imagem: ' + error.message);
                    }
                }
            };
            fileInput.click();
        });

        foodList.appendChild(li);
    });

    // Paginação
    paginationEl.innerHTML = "";
    if (totalPages > 1) {
        const prevBtn = document.createElement("button");
        prevBtn.textContent = "← Anterior";
        prevBtn.disabled = currentPage === 1;
        prevBtn.addEventListener("click", () => {
            currentPage--;
            renderComidas();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        const pageInfo = document.createElement("span");
        pageInfo.textContent = `Página ${currentPage} de ${totalPages}`;
        pageInfo.style.color = "#f5f5f5";
        pageInfo.style.padding = "0 1rem";

        const nextBtn = document.createElement("button");
        nextBtn.textContent = "Próximo →";
        nextBtn.disabled = currentPage === totalPages;
        nextBtn.addEventListener("click", () => {
            currentPage++;
            renderComidas();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        paginationEl.appendChild(prevBtn);
        paginationEl.appendChild(pageInfo);
        paginationEl.appendChild(nextBtn);
    }
}

addFoodBtn.addEventListener("click", () => {
    addFoodModal.style.display = 'flex';
});

cancelAddFoodBtn.addEventListener("click", () => {
    addFoodModal.style.display = 'none';
    addFoodForm.reset();
});

const modalPriceInput = document.getElementById("food-price");
applyPriceMask(modalPriceInput);

addFoodForm.addEventListener("submit", async e => {
    e.preventDefault();
    const name = document.getElementById("food-name").value.trim();
    const description = document.getElementById("food-description").value.trim();
    const priceValue = parsePrice(modalPriceInput.value);
    const chef = document.getElementById("food-chef").checked;
    const file = document.getElementById("food-image").files[0];

    if (!name) {
        alert('O nome da comida é obrigatório!');
        return;
    }

    if (priceValue <= 0) {
        alert('O preço deve ser maior que zero!');
        return;
    }

    try {
        let imgUrl = '/imgs/img-null.png';
        if (file) {
            const formData = new FormData();
            formData.append("file", file);
            const response = await fetch('/api/comidas/upload', {
                method: 'POST',
                body: formData
            });
            if (response.ok) {
                const data = await response.json();
                imgUrl = data.url;
            } else {
                throw new Error('Erro ao fazer upload da imagem.');
            }
        }

        const novaComida = {
            id: 0,
            nome: name,
            descricao: description,
            preco: priceValue,
            chef: chef,
            imgUrl: imgUrl,
            isNew: true
        };

        await saveComida(novaComida);
        addFoodModal.style.display = 'none';
        addFoodForm.reset();
        alert('Comida adicionada com sucesso!');
    } catch (error) {
        alert('Erro ao adicionar comida: ' + error.message);
    }
});

loadComidas();
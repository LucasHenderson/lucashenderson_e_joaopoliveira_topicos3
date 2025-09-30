// --- Dropdown Usuário ---
const userMenu = document.querySelector(".user-menu");
const userIcon = document.querySelector(".user-icon");
if (userIcon) {
    userIcon.addEventListener("click", () => {
        userMenu.classList.toggle("active");
    });
}

// --- Lista de comidas ---
let comidas = [];

const foodList = document.getElementById("food-list");
const addFoodBtn = document.getElementById("add-food-btn");
const paginationEl = document.getElementById("pagination");

// --- Paginação ---
let currentPage = 1;
const itemsPerPage = 5;

// --- Carregar comidas do backend ---
async function loadComidas() {
    try {
        const response = await fetch('/api/comidas');
        if (response.ok) {
            comidas = await response.json();
            renderComidas();
        }
    } catch (error) {
        console.error('Erro ao carregar comidas:', error);
    }
}

// --- Salvar comida no backend ---
async function saveComida(comida) {
    try {
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
                imgUrl: comida.imgUrl
            })
        });

        if (response.ok) {
            return await response.json();
        }
    } catch (error) {
        console.error('Erro ao salvar comida:', error);
    }
}

// --- Deletar comida ---
async function deleteComida(id) {
    try {
        const response = await fetch(`/api/comidas/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            comidas = comidas.filter(c => c.id !== id);
            renderComidas();
        }
    } catch (error) {
        console.error('Erro ao deletar comida:', error);
    }
}

// --- Renderizar lista ---
function renderComidas() {
    foodList.innerHTML = "";

    // Cálculo de paginação
    const totalPages = Math.ceil(comidas.length / itemsPerPage);
    if (currentPage > totalPages) currentPage = totalPages || 1;
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const pageItems = comidas.slice(start, end);

    // Renderizar comidas da página atual
    pageItems.forEach(comida => {
        const li = document.createElement("li");
        li.classList.add("food-item");

        li.innerHTML = `
      <img src="${comida.imgUrl || '/imgs/img-null.png'}" alt="${comida.nome}">
      <div class="food-details">
        <input type="text" value="${comida.nome}" placeholder="Nome da comida" data-field="nome">
        <textarea rows="2" placeholder="Descrição da comida" data-field="descricao">${comida.descricao}</textarea>
        <input type="number" step="0.01" min="0" value="${comida.preco}" data-field="preco">
      </div>
      <div class="food-actions">
        <button class="save-btn">💾</button>
        <button class="delete-btn">🗑</button>
        <button class="chef-btn ${comida.chef ? "active" : ""}">👨‍🍳</button>
      </div>
    `;

        // Botão salvar
        const saveBtn = li.querySelector(".save-btn");
        saveBtn.addEventListener("click", async () => {
            await saveComida(comida);
            alert('Comida salva com sucesso!');
        });

        // Botão deletar
        const deleteBtn = li.querySelector(".delete-btn");
        deleteBtn.addEventListener("click", async () => {
            if (confirm('Deseja realmente deletar esta comida?')) {
                await deleteComida(comida.id);
            }
        });

        // Botão chef
        const chefBtn = li.querySelector(".chef-btn");
        chefBtn.addEventListener("click", async () => {
            comida.chef = !comida.chef;
            chefBtn.classList.toggle("active");
            await saveComida(comida);
        });

        // Atualizar valores localmente
        const nomeInput = li.querySelector('[data-field="nome"]');
        const descInput = li.querySelector('[data-field="descricao"]');
        const precoInput = li.querySelector('[data-field="preco"]');

        nomeInput.addEventListener("input", e => comida.nome = e.target.value);
        descInput.addEventListener("input", e => comida.descricao = e.target.value);
        precoInput.addEventListener("input", e => {
            let val = parseFloat(e.target.value);
            if (isNaN(val) || val < 0) {
                e.target.value = 0;
                comida.preco = 0;
            } else {
                comida.preco = val;
            }
        });

        // Clique na imagem para trocar (base64 para simplificar)
        const imgEl = li.querySelector("img");
        imgEl.addEventListener("click", () => {
            const fileInput = document.createElement("input");
            fileInput.type = "file";
            fileInput.accept = "image/png, image/jpeg, image/jpg";
            fileInput.onchange = e => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = () => {
                        comida.imgUrl = reader.result;
                        imgEl.src = reader.result;
                    };
                    reader.readAsDataURL(file);
                }
            };
            fileInput.click();
        });

        foodList.appendChild(li);
    });

    // Renderizar paginação
    paginationEl.innerHTML = "";
    if (totalPages > 1) {
        const prevBtn = document.createElement("button");
        prevBtn.textContent = "Anterior";
        prevBtn.disabled = currentPage === 1;
        prevBtn.addEventListener("click", () => {
            currentPage--;
            renderComidas();
        });

        const nextBtn = document.createElement("button");
        nextBtn.textContent = "Próximo";
        nextBtn.disabled = currentPage === totalPages;
        nextBtn.addEventListener("click", () => {
            currentPage++;
            renderComidas();
        });

        paginationEl.appendChild(prevBtn);
        paginationEl.appendChild(nextBtn);
    }
}

// --- Adicionar nova comida ---
addFoodBtn.addEventListener("click", () => {
    const nova = {
        id: 0, // 0 indica que é nova
        imgUrl: "/imgs/img-null.png",
        nome: "",
        descricao: "",
        preco: 0,
        chef: false
    };
    comidas.push(nova);
    renderComidas();
});

// --- Inicializa carregando do backend ---
loadComidas();
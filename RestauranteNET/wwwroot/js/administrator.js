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
const addFoodError = document.getElementById("add-food-error");

let currentPage = 1;
const itemsPerPage = 5;

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
            delete comida.isNew; // Remove flag após renderizar
        }

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

        const saveBtn = li.querySelector(".save-btn");
        saveBtn.addEventListener("click", async () => {
            try {
                await saveComida(comida);
                alert('Comida salva com sucesso!');
            } catch (error) {
                alert('Erro ao salvar comida: ' + error.message);
            }
        });

        const deleteBtn = li.querySelector(".delete-btn");
        deleteBtn.addEventListener("click", async () => {
            if (confirm('Deseja realmente deletar esta comida?')) {
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

addFoodBtn.addEventListener("click", () => {
    addFoodModal.style.display = 'flex';
});

cancelAddFoodBtn.addEventListener("click", () => {
    addFoodModal.style.display = 'none';
    addFoodForm.reset();
    addFoodError.style.display = 'none';
});

addFoodForm.addEventListener("submit", async e => {
    e.preventDefault();
    const name = document.getElementById("food-name").value.trim();
    const description = document.getElementById("food-description").value.trim();
    const price = parseFloat(document.getElementById("food-price").value);
    const chef = document.getElementById("food-chef").checked;
    const file = document.getElementById("food-image").files[0];

    try {
        if (!name || price <= 0) {
            addFoodError.textContent = 'Nome e preço são obrigatórios.';
            addFoodError.style.display = 'block';
            return;
        }

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
            preco: price,
            chef: chef,
            imgUrl: imgUrl,
            isNew: true
        };

        await saveComida(novaComida);
        addFoodModal.style.display = 'none';
        addFoodForm.reset();
        addFoodError.style.display = 'none';
        alert('Comida adicionada com sucesso!');
    } catch (error) {
        addFoodError.textContent = 'Erro ao adicionar comida: ' + error.message;
        addFoodError.style.display = 'block';
    }
});

loadComidas();
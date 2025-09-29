// --- Dropdown Usuário ---
const userMenu = document.querySelector(".user-menu");
const userIcon = document.querySelector(".user-icon");
userIcon.addEventListener("click", () => {
  userMenu.classList.toggle("active");
});

// --- Lista de comidas (mock inicial) ---
let comidas = [
  {
    id: 1,
    img: "../imgs/pizza-marguerita.jpg",
    nome: "Pizza Marguerita",
    descricao: "Pizza com molho de tomate, mussarela e manjericão fresco.",
    preco: 48.0,
    chef: false
  },
  {
    id: 2,
    img: "../imgs/lasanha.jpg",
    nome: "Lasanha Bolonhesa",
    descricao: "Camadas de massa fresca com molho bolonhesa e queijo.",
    preco: 35.0,
    chef: true
  }
];

const foodList = document.getElementById("food-list");
const addFoodBtn = document.getElementById("add-food-btn");
const paginationEl = document.getElementById("pagination");

// --- Paginação ---
let currentPage = 1;
const itemsPerPage = 5;

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
      <img src="${comida.img || '../imgs/img-null.png'}" alt="${comida.nome}">
      <div class="food-details">
        <input type="text" value="${comida.nome}" placeholder="Nome da comida">
        <textarea rows="2" placeholder="Descrição da comida">${comida.descricao}</textarea>
        <input type="number" step="0.01" min="0" value="${comida.preco}">
      </div>
      <div class="food-actions">
        <button class="delete-btn">🗑</button>
        <button class="chef-btn ${comida.chef ? "active" : ""}">👨‍🍳</button>
      </div>
    `;

    // Eventos
    const deleteBtn = li.querySelector(".delete-btn");
    deleteBtn.addEventListener("click", () => {
      comidas = comidas.filter(c => c.id !== comida.id);
      renderComidas();
    });

    const chefBtn = li.querySelector(".chef-btn");
    chefBtn.addEventListener("click", () => {
      comida.chef = !comida.chef;
      renderComidas();
    });

    // Atualizar valores
    const [nomeInput, descInput, precoInput] = li.querySelectorAll(".food-details input, .food-details textarea");
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

    // Clique na imagem para trocar
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
            comida.img = reader.result;
            renderComidas();
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
    id: Date.now(),
    img: "../imgs/img-null.png",
    nome: "",
    descricao: "",
    preco: 0,
    chef: false
  };
  comidas.push(nova);
  renderComidas();
});

// --- Inicializa ---
renderComidas();

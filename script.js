// URLs e Limites
const POKEAPI_BASE_URL = 'https://pokeapi.co/api/v2/pokemon';
const POKEAPI_TYPE_URL = 'https://pokeapi.co/api/v2/type/';
const CATALOG_FETCH_LIMIT = 900; 
const POKEMONS_PER_PAGE = 18; 

// Variáveis de Estado Global (Cache e Paginação)
let allPokemonData = []; 
let currentFilteredList = []; 
let currentPage = 1;

// Seletores do DOM
const cardsContainer = document.getElementById('cards-container');
const modalOverlay = document.getElementById('modal-overlay');
const closeModalButton = document.getElementById('close-modal');
const modalContent = document.getElementById('modal-content');
const searchInput = document.getElementById('search-input');
const typeFilter = document.getElementById('type-filter');
const resetFilterButton = document.getElementById('reset-filter');


// ----------------------------------------------------
// LÓGICA DO MOTOR DE BUSCA E PAGINAÇÃO
// ----------------------------------------------------

/**
 * Cria e injeta o HTML dos controles de paginação.
 */
function createPaginationControls() {
    // Remove qualquer controle antigo
    document.querySelector('.pagination-controls')?.remove(); 

    const controls = document.createElement('section');
    controls.classList.add('pagination-controls');
    controls.id = 'pagination-controls-injected';

    controls.innerHTML = `
        <button id="prev-page-injected" disabled>&laquo; Anterior</button>
        <span id="page-info-injected">Página 1 de 1</span>
        <button id="next-page-injected" disabled>Próximo &raquo;</button>
    `;

    // Injeta os controles após o container de cards
    cardsContainer.parentNode.insertBefore(controls, cardsContainer.nextSibling);

    // Anexa os event listeners aos novos botões
    document.getElementById('prev-page-injected').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderCurrentPage();
        }
    });

    document.getElementById('next-page-injected').addEventListener('click', () => {
        const totalPages = Math.ceil(currentFilteredList.length / POKEMONS_PER_PAGE);
        if (currentPage < totalPages) {
            currentPage++;
            renderCurrentPage();
        }
    });
}


/**
 * Aplica os filtros, reseta a página para 1 e inicia a renderização.
 */
function applyFilters() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    const selectedType = typeFilter.value;

    let filteredList = allPokemonData;

    // 1. Filtragem por Tipo
    if (selectedType !== 'all') {
        filteredList = filteredList.filter(pokemon => {
            return pokemon.types.some(t => t.type.name === selectedType);
        });
    }

    // 2. Filtragem por Busca (Nome ou Habilidade)
    if (searchTerm) {
        filteredList = filteredList.filter(pokemon => {
            const matchesName = pokemon.name.toLowerCase().includes(searchTerm);
            const matchesAbility = pokemon.abilities.some(a => 
                a.ability.name.toLowerCase().includes(searchTerm)
            );
            return matchesName || matchesAbility;
        });
    }
    
    currentFilteredList = filteredList;
    currentPage = 1;
    renderCurrentPage();
}

/**
 * Renderiza apenas os Pokémons da página atual.
 */
function renderCurrentPage() {
    if (currentFilteredList.length === 0) {
        cardsContainer.innerHTML = '<p>Nenhum Pokémon encontrado com os filtros selecionados.</p>';
        updatePaginationControls(0, 0);
        return;
    }

    const totalItems = currentFilteredList.length;
    const totalPages = Math.ceil(totalItems / POKEMONS_PER_PAGE);

    const startIndex = (currentPage - 1) * POKEMONS_PER_PAGE;
    const endIndex = Math.min(startIndex + POKEMONS_PER_PAGE, totalItems);

    const pokemonSubset = currentFilteredList.slice(startIndex, endIndex);

    // Renderiza os Cards
    cardsContainer.innerHTML = ''; 
    pokemonSubset.forEach(pokemon => {
        const card = createPokemonCard(pokemon);
        cardsContainer.appendChild(card);
    });

    // Atualiza os controles de Paginação
    updatePaginationControls(totalPages, totalItems);
}

/**
 * Atualiza o estado dos botões de navegação e o texto de informação.
 */
function updatePaginationControls(totalPages, totalItems) {
    // Busca os elementos injetados
    const pageInfoSpan = document.getElementById('page-info-injected');
    const prevPageButton = document.getElementById('prev-page-injected');
    const nextPageButton = document.getElementById('next-page-injected');
    const controlsPanel = document.getElementById('pagination-controls-injected');


    if (!pageInfoSpan) return; // Se a paginação não foi injetada ainda

    pageInfoSpan.textContent = `Página ${currentPage} de ${totalPages}`;

    prevPageButton.disabled = currentPage === 1;
    nextPageButton.disabled = currentPage === totalPages || totalPages === 0;

    // Mostra/esconde o painel de paginação
    controlsPanel.style.display = totalItems > POKEMONS_PER_PAGE || totalItems === 0 ? 'flex' : 'none';

    // Garante que a barra de rolagem volte ao topo da página ao mudar
    window.scrollTo({ top: 0, behavior: 'smooth' });
}


// ----------------------------------------------------
// FUNÇÕES DE REQUISIÇÃO (FETCH)
// ----------------------------------------------------

async function fetchAndPopulateTypes() {
    try {
        const response = await fetch(POKEAPI_TYPE_URL);
        const data = await response.json();
        
        data.results.forEach(type => {
            if (type.name !== 'unknown' && type.name !== 'shadow') {
                const option = document.createElement('option');
                option.value = type.name;
                option.textContent = type.name.charAt(0).toUpperCase() + type.name.slice(1);
                typeFilter.appendChild(option);
            }
        });
    } catch (error) {
        console.error("Falha ao carregar Tipos:", error);
    }
}

async function fetchTypeDetails(typeUrl) {
    const response = await fetch(typeUrl);
    if (!response.ok) {
        console.error(`Falha ao buscar detalhes do tipo: ${typeUrl}`);
        return {};
    }
    return response.json();
}

async function getFullPokemonDetails(pokemon) {
    const typeUrls = pokemon.types.map(t => t.type.url);
    const typePromises = typeUrls.map(url => fetchTypeDetails(url));
    const typeDetails = await Promise.all(typePromises);

    return {
        ...pokemon,
        typeDetails: typeDetails 
    };
}

async function fetchFullCatalog() {
    cardsContainer.innerHTML = '<p>Carregando catálogo completo (Isso pode levar alguns segundos)...</p>'; 

    try {
        const listResponse = await fetch(`${POKEAPI_BASE_URL}?limit=${CATALOG_FETCH_LIMIT}`);
        const listData = await listResponse.json();
        
        const detailPromises = listData.results.map(pokemon => 
            fetch(pokemon.url).then(res => res.json())
        );

        const allDetails = await Promise.all(detailPromises);
        allPokemonData = allDetails; 
        
        // Cria os controles de paginação e aplica os filtros
        createPaginationControls(); 
        applyFilters(); 

    } catch (error) {
        console.error("Falha geral ao carregar Pokémons:", error);
        cardsContainer.innerHTML = '<p class="error-message">Erro ao carregar catálogo da API. Verifique sua conexão.</p>';
    }
}

// ----------------------------------------------------
// FUNÇÕES DE DOM MANIPULATION (Criação de Card e Modal)
// ----------------------------------------------------

function createPokemonCard(pokemon) {
    const card = document.createElement('div');
    card.classList.add('pokemon-card');

    const cardHeader = document.createElement('div');
    cardHeader.classList.add('card-header');
    
    const name = document.createElement('h2');
    name.textContent = pokemon.name; 

    const favoriteIcon = document.createElement('span');
    favoriteIcon.classList.add('favorite-icon');
    favoriteIcon.innerHTML = '&#x2764;'; 
    
    cardHeader.appendChild(name);
    cardHeader.appendChild(favoriteIcon);


    const imageContainer = document.createElement('div');
    imageContainer.classList.add('card-image-container');
    
    const image = document.createElement('img');
    image.classList.add('pokemon-image');
    image.src = pokemon.sprites.front_default; 
    image.alt = `Imagem de ${pokemon.name}`;
    
    imageContainer.appendChild(image);


    const cardDetails = document.createElement('div');
    cardDetails.classList.add('card-details');

    const number = document.createElement('p');
    number.innerHTML = `<strong>Nº:</strong> ${pokemon.id}`;
    cardDetails.appendChild(number);
    
    const typeLabel = document.createElement('p');
    typeLabel.innerHTML = `<strong>Tipo:</strong>`;
    
    const typeElement = document.createElement('span');
    typeElement.textContent = pokemon.types[0].type.name;
    typeElement.classList.add('pokemon-type');
    
    cardDetails.appendChild(typeLabel);
    cardDetails.appendChild(typeElement);

    
    card.appendChild(cardHeader);
    card.appendChild(imageContainer);
    card.appendChild(cardDetails);

    card.addEventListener('click', () => openDetailsModal(pokemon));

    return card;
}

async function openDetailsModal(pokemon) {
    modalOverlay.classList.add('active');
    modalContent.innerHTML = '<h2>Carregando Mais Informações...</h2>'; 

    try {
        const fullDetails = await getFullPokemonDetails(pokemon);
        renderModalContent(fullDetails);

    } catch (error) {
        console.error("Erro ao carregar detalhes completos:", error);
        modalContent.innerHTML = '<h2>Erro</h2><p>Não foi possível carregar informações adicionais.</p>';
    }
}

function renderModalContent(details) {
    
    const abilities = details.abilities.map(a => ({ name: a.ability.name }));

    const weaknesses = {}; 

    details.typeDetails.forEach(typeData => {
        typeData.damage_relations.double_damage_from.forEach(relation => {
            weaknesses[relation.name] = true; 
        });
    });

    const weaknessList = Object.keys(weaknesses);

    let htmlContent = `
        <div class="modal-header">
            <h1 style="text-transform: capitalize; color: var(--primary-color);">${details.name} (Nº ${details.id})</h1>
            <img src="${details.sprites.front_default}" alt="Imagem de ${details.name}" style="width: 150px; margin: 10px auto; display: block;">
        </div>
        
        <h3>Habilidades</h3>
        <ul class="ability-list">
            ${abilities.map(a => `<li class="ability-item">${a.name}</li>`).join('')}
        </ul>

        <h3>Fraquezas (Dano Dobrado de)</h3>
        <div class="type-damage-list">
            ${weaknessList.length > 0 
                ? weaknessList.map(w => `<li>${w}</li>`).join('')
                : '<p>Nenhuma fraqueza específica.</p>'}
        </div>
    `;


    modalContent.innerHTML = htmlContent;
}


// ----------------------------------------------------
// MANIPULADORES DE EVENTOS GLOBAIS
// ----------------------------------------------------

// Eventos do Motor de Busca
searchInput.addEventListener('input', applyFilters);
typeFilter.addEventListener('change', applyFilters);
resetFilterButton.addEventListener('click', () => {
    searchInput.value = '';
    typeFilter.value = 'all';
    applyFilters();
});


// Eventos do Modal
closeModalButton.addEventListener('click', () => {
    modalOverlay.classList.remove('active');
});

modalOverlay.addEventListener('click', (event) => {
    if (event.target === modalOverlay) {
        modalOverlay.classList.remove('active');
    }
});


// ----------------------------------------------------
// INÍCIO DA APLICAÇÃO
// ----------------------------------------------------

fetchAndPopulateTypes();
fetchFullCatalog();
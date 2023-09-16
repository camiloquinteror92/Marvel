const publicKey = '13db0f1a13bf1c9c4caf5014fd793f0b';
const privateKey = 'c07afa0dc7891be4bca212b2c29248d1704d6bf9';
const charactersContainer = document.getElementById('charactersContainer');
const characterModal = document.getElementById('characterModal');
const characterImage = document.getElementById('characterImage');
const characterDescription = document.getElementById('characterDescription');

function generateMD5(value) {
    return CryptoJS.MD5(value).toString();
}

let currentPage = 1;
const itemsPerPage = 20;

function getMarvelCharacters(page = 1) {
    const offset = (page - 1) * itemsPerPage;
    const timestamp = new Date().getTime();
    const hash = generateMD5(timestamp + privateKey + publicKey);
    const url = `https://gateway.marvel.com/v1/public/characters?ts=${timestamp}&apikey=${publicKey}&hash=${hash}&limit=${itemsPerPage}&offset=${offset}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            displayCharacters(data.data.results);
            generatePagination(currentPage, Math.ceil(data.data.total / itemsPerPage));
        });
}

function generatePagination(currentPage, totalPages) {
    const paginationContainer = document.querySelector('.pagination');
    paginationContainer.innerHTML = ''; // Limpiar la paginación anterior

    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);

    let pages = [];

    if (currentPage <= 4) {
        pages = Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1);
        if (totalPages > 5) {
            pages.push('...');
            pages.push(totalPages);
        }
    } else if (currentPage >= totalPages - 3) {
        pages.push(1);
        pages.push('...');
        pages = pages.concat(Array.from({ length: 5 }, (_, i) => totalPages - 4 + i));
    } else {
        pages.push(1);
        pages.push('...');
        pages = pages.concat(Array.from({ length: 3 }, (_, i) => currentPage - 1 + i));
        pages.push('...');
        pages.push(totalPages);
    }

    pages.forEach(page => {
        const pageButton = document.createElement('button');
        if (page === '...') {
            pageButton.textContent = page;
            pageButton.classList.add('ellipsis');
        } else {
            pageButton.textContent = page;
            pageButton.addEventListener('click', () => {
                getMarvelCharacters(page);
            });
            if (page === currentPage) {
                pageButton.classList.add('active');
            }
        }
        paginationContainer.appendChild(pageButton);
    });
}

function displayCharacters(characters) {
    charactersContainer.innerHTML = '';
    characters.forEach(character => {
        const characterCard = document.createElement('div');
        characterCard.className = 'character-card';
        characterCard.innerHTML = `
            <img src="${character.thumbnail.path}/standard_medium.${character.thumbnail.extension}" alt="${character.name}">
            <p>${character.name}</p>
        `;
        characterCard.addEventListener('click', () => displayCharacterDetails(character));
        charactersContainer.appendChild(characterCard);
    });
}

function displayCharacterDetails(character) {
    characterImage.src = `${character.thumbnail.path}/portrait_xlarge.${character.thumbnail.extension}`;
    characterDescription.textContent = character.description || 'Descripción no disponible';

    // Limpiar contenedores previos
    const oldSeriesContainer = document.querySelector('.series-container');
    const oldComicsContainer = document.querySelector('.comics-container');
    if (oldSeriesContainer) oldSeriesContainer.remove();
    if (oldComicsContainer) oldComicsContainer.remove();

    // Crear contenedores para series y cómics
    const seriesContainer = document.createElement('div');
    seriesContainer.className = 'series-container';
    const comicsContainer = document.createElement('div');
    comicsContainer.className = 'comics-container';

    // Solicitar imágenes de series
    character.series.items.forEach(series => {
        fetchSeriesOrComicImage(series.resourceURI, seriesContainer, 'series-image');
    });

    // Solicitar imágenes de cómics
    character.comics.items.forEach(comic => {
        fetchSeriesOrComicImage(comic.resourceURI, comicsContainer, 'comic-image');
    });

    characterModal.appendChild(seriesContainer);
    characterModal.appendChild(comicsContainer);

    characterModal.style.display = 'flex'; // Mostrar el modal
}

function fetchSeriesOrComicImage(uri, container, className) {
    const timestamp = new Date().getTime();
    const hash = generateMD5(timestamp + privateKey + publicKey);
    const url = `${uri}?ts=${timestamp}&apikey=${publicKey}&hash=${hash}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            const item = data.data.results[0];
            const image = document.createElement('img');
            image.src = `${item.thumbnail.path}/portrait_xlarge.${item.thumbnail.extension}`;
            image.alt = item.title || item.name;
            image.className = className;
            container.appendChild(image);
        });
}

function closeModal() {
    characterModal.style.display = 'none'; // Oculta el modal
}

function searchCharacter() {
    const searchTerm = document.getElementById('searchInput').value;
    const timestamp = new Date().getTime();
    const hash = generateMD5(timestamp + privateKey + publicKey);
    const url = `https://gateway.marvel.com/v1/public/characters?nameStartsWith=${searchTerm}&ts=${timestamp}&apikey=${publicKey}&hash=${hash}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            displayCharacters(data.data.results);
        });
}

getMarvelCharacters();

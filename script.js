const PUBLIC_KEY = '13db0f1a13bf1c9c4caf5014fd793f0b';
const PRIVATE_KEY = 'c07afa0dc7891be4bca212b2c29248d1704d6bf9';
let currentPage = 1;
const limit = 20;

function generateMD5(value) {
    // Utiliza una biblioteca como CryptoJS para generar el MD5
    return CryptoJS.MD5(value).toString();
}

function getMarvelCharacters(page = 1) {
    const offset = (page - 1) * limit;
    const ts = new Date().getTime();
    const hash = generateMD5(ts + PRIVATE_KEY + PUBLIC_KEY);
    const apiUrl = `https://gateway.marvel.com/v1/public/characters?apikey=${PUBLIC_KEY}&ts=${ts}&hash=${hash}&limit=${limit}&offset=${offset}`;

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            displayCharacters(data.data.results);
            document.getElementById('currentPage').textContent = currentPage;
        })
        .catch(error => {
            console.error("Error al obtener los personajes de Marvel:", error);
        });
}

function displayCharacters(characters) {
    const charactersDiv = document.getElementById('characters');
    charactersDiv.innerHTML = '';
    characters.forEach(character => {
        const characterDiv = document.createElement('div');
        characterDiv.className = 'character';
        characterDiv.dataset.id = character.id;
        characterDiv.innerHTML = `
            <img src="${character.thumbnail.path}.${character.thumbnail.extension}" alt="${character.name}">
            <span>${character.name}</span>
        `;
        charactersDiv.appendChild(characterDiv);
    });
}

function changePage(direction) {
    currentPage += direction;
    getMarvelCharacters(currentPage);
}

function displayCharacterDetails(characterId) {
    const ts = new Date().getTime();
    const hash = generateMD5(ts + PRIVATE_KEY + PUBLIC_KEY);
    const apiUrl = `https://gateway.marvel.com/v1/public/characters/${characterId}?apikey=${PUBLIC_KEY}&ts=${ts}&hash=${hash}`;

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            const character = data.data.results[0];
            const modalContent = `
                <h2>${character.name}</h2>
                <img src="${character.thumbnail.path}.${character.thumbnail.extension}" alt="${character.name}">
                <p>${character.description || 'Descripción no disponible'}</p>
            `;
            document.getElementById('characterDetails').innerHTML = modalContent;
            document.getElementById('characterModal').style.display = 'block';
        })
        .catch(error => {
            console.error("Error al obtener detalles del personaje:", error);
        });
}

function closeModal() {
    document.getElementById('characterModal').style.display = 'none';
}

document.getElementById('characters').addEventListener('click', function(event) {
    if (event.target.closest('.character')) {
        const characterId = event.target.closest('.character').dataset.id;
        displayCharacterDetails(characterId);
    }
});

getMarvelCharacters();

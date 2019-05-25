// Usamos la API de https://www.themoviedb.org/ -> https://www.themoviedb.org/documentation/api
// Ejemplo: https://api.themoviedb.org/3/movie/550?api_key=22e540d93b35f018eaca6bb68784d866
// Axios es un cliente HTTP basado en (promises) que funciona tanto en el navegador como en un entorno node.js.
// Axios es una librería de JavaScript construida con el objetivo de gestionar la programación asíncrona con promesas.
// https://github.com/axios/axios CDN <script src="https://unpkg.com/axios/dist/axios.min.js"></script>
// Para ver objetos http://jsonviewer.stack.hu/

const API_URL = "https://api.themoviedb.org/3/";
const API_POP_URL = "movie/popular";
const API_CATEG_URL = "genre/movie/list";
const API_KEY = "?api_key=22e540d93b35f018eaca6bb68784d866";
const IMG_PATH = 'http://image.tmdb.org/t/p/w185';

axiosRequest();
let Films = [];
let Favorites = localStorage.getItem("Favorites") !== null ? JSON.parse(localStorage.getItem("Favorites")) : [];
let ToSee = localStorage.getItem("ToSee") !== null ? JSON.parse(localStorage.getItem("ToSee")) : [];
let shownFilms = 8;
let currentPage = 1;
let modTosee = false; // true cuando se muestra lista de Películas para ver, muestra botón quitar en vez de votos

window.addEventListener('load', load);

function load() {
    numToSee();
    btnSearch.addEventListener('click', searchFilms);
    inputSearch.addEventListener('keydown', searchEnter);
    btnPgForw.addEventListener('click', pageForward);
    btnPgBack.addEventListener('click', pageBack);
    btnToSee.addEventListener('click', filmsToSee);
}

// función asíncrona
async function axiosRequest() {
    // manejador de errores try y catch
    try {
        // await Promise.all lanza varias promesas al mismo tiempo
        // El tiempo de espera es lo que tarda en resolverse la promesa más lenta
        // Devuelve el resultado de las promesas
        let responses = await Promise.all ([
            // axios es una librería de promesas.
            // Realiza la petición http al servidor y devuelve una promesa
            axios.get(API_URL + API_POP_URL + API_KEY),
            axios.get(API_URL + API_CATEG_URL + API_KEY)
        ]);
        Films = responses[0].data.results;
        let genres = responses[1].data.genres;
        // el nombre de los géneros está aparte de data.results el cual sólo contiene los ids
        // data.genres cotiene la lista con el nmbre de los géneros y su id de género
        Films = Films.map((film) => {
            // arrGenres cogerá de data.genres el nombre del género e id que coincidan con la lista de id de género de cada película
            let arrGenres = film['genre_ids'].map((id) => {
                return genres.find((genre) => genre.id === id);
            });
            // film.genres = arrGenres;
            // film['poster_path'] = IMG_PATH + film['poster.path'];
            // film.stars = Math.round(film['vote_average'] / 2);
            // film['backdrop'] = IMG_PATH_BACKDROP + film['backdrop_path'];
            // return film;
            // El return que viene a continuación es lo mismo que lo que hay comentado aquí
            return {
                ...film,
                genres: arrGenres,
                // 'poster_path': IMG_PATH + film['poster_path'],
                // stars: Math.round(film['vote_average'] / 2),
                // 'backdrop': IMG_PATH_BACKDROP + film['backdrop_path']
            };
        });
        if (document.readyState === "complete") {
            showFilms(Films);}
        else {
            window.addEventListener('load', showFilms);}
    }
    catch (error) {
        console.log('Ha habido un problema:', error.message, error);
    }
}

function showFilms(films) {
    let showDiv = document.getElementById("showFilms");
    let strFilm = "", stars, imgStars, imgDelete;
    films.slice(0, shownFilms).forEach ((film) => {
        let {poster_path, title, id, vote_average} = film;
        stars = Math.round(vote_average / 2);
        imgStars = "<img src='img/star.png' alt='star'>".repeat(stars) + "<img src='img/star2.png' alt='star'>".repeat(5 - stars);
        imgDelete = `<input type='image' src='img/delete.png' alt='quitar' title='Quitar' class='delToSee' id=d${id}>`;
        strFilm += `<div class='film'>
                    <a href='detail.html?id=${id}' ${!modTosee ? "class='draggable'" : ""}>
                        <img src=${IMG_PATH + poster_path} id=p${id} alt='poster ${title}'>
                        <div class='title'>${title}</div>
                    </a>
                    <div class='favVote'>
                        <span class='vote'>${modTosee ? imgDelete : imgStars}</span>
                        <span><input type='image' ${favoriteSrcNtitle(id, 1)} alt='Favorito' id=${id} class='favorit'></span>
                    </div></div>`
    });
    showDiv.innerHTML = strFilm;
    numPage.innerText = currentPage;
    totalPages.innerText = parseInt(Films.length / shownFilms) + (Films.length % shownFilms > 0 ? 1 : 0);
    if (Films.length > shownFilms) {
        btnPgForw.style.display = "block";}
    else {
        btnPgForw.style.display = "none";}
    // Escuchadores para corazón Favoritos (Me gusta)
    for (let elem of document.getElementsByClassName('favorit')) {
        elem.addEventListener('click', favorite);
    }
    // Escuchadores para arrastrar-soltar
    if (!modTosee) {   // si no se muestra el listado de Películas para ver
        for (let elem of document.getElementsByClassName('draggable')) {
            elem.addEventListener('dragstart', dragStart);
            elem.addEventListener('dragend', dragEnd);
        }
        dragDrop.addEventListener('dragover', dragOver);
        dragDrop.addEventListener('dragleave', dragLeave);
        dragDrop.addEventListener('drop', drop);
    }
    else {
        // escuchadoes para el botón quitar Peli para ver
        for (let elem of document.getElementsByClassName('delToSee')) {
            elem.addEventListener('click', delToSee);
        }
        // se quitar los escuchadores de arrastrar-soltar
        dragDrop.removeEventListener('dragover', dragOver);
        dragDrop.removeEventListener('dragleave', dragLeave);
        dragDrop.removeEventListener('drop', drop);
    }
}

function searchFilms() {
    // Para una búsqueda de películas sobre el array películas: 
    //      let textInput = inputSearch.value.toLowerCase();
    //      FilmsFound = Films.filter(f => f.title.toLowerCase().includes(textInput));
    let textInput = inputSearch.value;
    let apiPSearchUrl = API_URL + "search/movie" + API_KEY + "&query=" + textInput;
    axiosRequest(apiPSearchUrl);
    currentPage = 1;
    btnPgBack.style.display = "none";
    modTosee = false;
    dragHere.style.display = "block";
}

function searchEnter(event) {
    console.log(event.key);
    if (event.key === "Enter") {
        // event.preventDefault();
        searchFilms();
    }
}

function pageForward() {
    let posEnd = currentPage * shownFilms;
    let arrPage = Films.slice(posEnd);
    let lengPage = arrPage.length;
    currentPage += 1;
    showFilms(arrPage.slice(0, shownFilms));  // si length < shownFilms cogerá length
    if (lengPage < shownFilms + 1) {
        btnPgForw.style.display = "none";
    }
    btnPgBack.style.display = "block";
}

function pageBack() {
    let posIni = (currentPage - 1) * shownFilms - shownFilms;
    let arrPage = Films.slice(posIni, posIni + shownFilms);
    currentPage -= 1;
    showFilms(arrPage);
    if (posIni == 0) {
        btnPgBack.style.display = "none";
    }
    btnPgForw.style.display = "block";
}

function dragStart(event) {
    let movie = event.currentTarget;
    movie.classList.add('dragging');
    dragDrop.style.outline = "3px solid #80EE80";
}

function dragEnd(event) {
    let movie = event.currentTarget;
    movie.classList.remove('dragging');
    dragDrop.style.outline = "none";
}

function dragOver(event) {
    dragDrop.style.outline = "4px solid #80EE80";
    event.preventDefault();
}

function dragLeave() {
    dragDrop.style.outline = "3px solid #80EE80";
}

function drop(event) {
    event.preventDefault();
    //event.stopPropagation();
    let dragging = document.querySelector('.dragging').toString();
    let id = dragging.slice(dragging.indexOf('=') + 1);
    let pos = ToSee.indexOf(id);
    if (pos === -1) {
        ToSee.push(id);
        localStorage.setItem("ToSee", JSON.stringify(ToSee));
        msgToSee('¡Película añadida!');
        transformScale('scale(1.8)');
        setTimeout(() => {
            transformScale('scale(1)');
        }, 800);
    }
    else {
        msgToSee('¡Ya la tenías en la lista!');
    }
    numToSee();
}

function transformScale (scale) {
    document.getElementById("imgEye").style.transform = scale;
}

function numToSee() {
    document.getElementById('numToSee').innerText = ToSee.length.toString();
}

function msgToSee(msg) {
    let divMsg = document.getElementById('dragHere');
    let msgIni = divMsg.innerText;
    divMsg.innerText = msg;
    divMsg.style.animation = "move linear 2000ms 4";
    setTimeout(() => {
        divMsg.style.animation = "none";
        divMsg.innerText = msgIni;
    }, 4 * 1000);
}

async function filmsToSee() {
    if (ToSee) {                  // if (ToSee.length > 0)
        Films = [];
        try {
            let responses = await Promise.all(ToSee.map(id => axios.get(API_URL + "movie/" + id + API_KEY)));
            Films = responses.map(film => film.data);
            modTosee = true;
            showFilms(Films);
            dragHere.style.display = "none";
        }
        catch (error) {
            console.log('Ha habido un problema:', error.message);
        }
    }
    else {
        msgToSee('No tienes películas');
    }
}

function delToSee (event) {
    let id = event.target.id;
    document.getElementById(id).style.opacity = "0.3";
    document.getElementById(id).title = "";
    id = id.slice(1);
    document.getElementById('p' + id).style.opacity = "0.4";
    let pos = ToSee.indexOf(id);
    ToSee.splice(pos, 1);
    localStorage.setItem("ToSee", JSON.stringify(ToSee));
    msgToSee('¡Película borrada!');
    transformScale('scale(1.8)');
    setTimeout(() => {
        transformScale('scale(1)');
    }, 800);
    numToSee();
}
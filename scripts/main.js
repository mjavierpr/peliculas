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
let Films = [];
let Favorites = localStorage.getItem("Favorites") !== null ? JSON.parse(localStorage.getItem("Favorites")) : [];
let ToSee = localStorage.getItem("ToSee") !== null ? JSON.parse(localStorage.getItem("ToSee")) : [];

let shownFilms = 8;
let currentPage = 1;
window.addEventListener('load', load);

function load() {
    axiosRequest();
    numToSee();
    btnSearch.addEventListener('click', searchFilms);
    inputSearch.addEventListener('keydown', searchEnter);
    btnPgForw.addEventListener('click', PageForward);
    btnPgBack.addEventListener('click', PageBack);
    btnToSee.addEventListener('click', PageBack);
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
                'poster_path': IMG_PATH + film['poster_path'],
                stars: Math.round(film['vote_average'] / 2),
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
    let strFilm = "";
    let imgStar1 = "<img src='img/star.png' alt='star'>";
    let imgStar2 = "<img src='img/star2.png' alt='star'>";
    films.slice(0, shownFilms).forEach ((film) => {
        let {poster_path, title, stars, id} = film;
        strFilm += `<div class='film'>
                    <a href='detail.html?id=${id}' class='draggable'>
                        <img class='poster' src=${poster_path} id=p${id} alt='poster ${title}'>
                        <div class='title'>${title}</div>
                    </a>
                    <div class='favVote'>
                        <span class='vote'>${imgStar1.repeat(stars)}${imgStar2.repeat(5 - stars)}</span>
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
}

function searchFilms() {
    // Para una búsqueda de películas sobre el array películas:
    // let textInput = inputSearch.value.toLowerCase();
    // FilmsFound = Films.filter(f => f.title.toLowerCase().includes(textInput));
    let textInput = inputSearch.value;
    let apiPSearchUrl = API_URL + "search/movie" + API_KEY + "&query=" + textInput;
    axiosRequest(apiPSearchUrl);
    currentPage = 1;
    btnPgBack.style.display = "none";
}

function searchEnter(event) {
    console.log(event.key);
    if (event.key === "Enter") {
        // event.preventDefault();
        searchFilms();
    }
}

function PageForward() {
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

function PageBack() {
    let posIni = (currentPage - 1) * shownFilms - shownFilms;
    let arrPage = Films.slice(posIni, posIni + shownFilms);
    currentPage -= 1;
    showFilms(arrPage);
    if (posIni == 0) {
        btnPgBack.style.display = "none";
    }
    btnPgForw.style.display = "block";
}

function favorite (event) {
    let id = event.target.id;
    let pos = Favorites.indexOf(id);
    pos > -1 ? Favorites.splice(pos, 1) : Favorites.push(id);
    localStorage.setItem("Favorites", JSON.stringify(Favorites));
    document.getElementById(id).src = favoriteSrcNtitle(id);
}

function favoriteSrcNtitle(id) {
    let src = "src=img/";
    let img = "favorite2.png";
    let title = " title="
    let titMsg = "'Me gusta'"; 
    if (Favorites.includes(id.toString())) {
        img = "favorite.png";
        titMsg = "'Ya no me gusta'";
    }
    return src + img + title + titMsg;
}

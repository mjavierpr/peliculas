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
const IMG_PATH_BACKDROP = "http://image.tmdb.org/t/p/w1280";
var Films = [];

let totalColumns = 4;
let totalRows = 2;
let currentPage = 1;
window.addEventListener('load', load);

function load() {
    axios.get(API_URL + API_POP_URL + API_KEY).then((response) => {
        Films = response.data.results;
        axios.get(API_URL + API_CATEG_URL + API_KEY).then((resp) => {
            let genres = resp.data.genres;
            Films = Films.map((film) => {
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
                    'backdrop': IMG_PATH_BACKDROP + film['backdrop_path']
                };
            });
            fillFilms(Films);
            console.log('ojete 0:', Films);
        }).catch((error) => {
            console.log('Ha habido un problema:', error.message);
        });
    });
    btnSearch.addEventListener('click', searchFilms);
    btnPgForw.addEventListener('click', PageForward);
    btnPgBack.addEventListener('click', PageBack);
}

function fillFilms(films, columns = totalColumns, rows = totalRows) {
    let showFilm = document.getElementById("showFilms");
    let strFilm = "", row, column, numFilm = 0;
    for (row = 1; row < rows + 1; row++) {
        strFilm += "<div class='rowFilms'>";
        for (column = numFilm; column < Math.min(films.length, columns * row); column++) {
            let {poster_path, title, release_date, vote_average} = films[column];
            strFilm += "<div class='film'><img src=" + poster_path + " alt='poster " + title + "'>" +
                        "<div class='title'>" + title + "</div>" +
                        "<div class='yearVote'><span>" + release_date.slice(0, 4) + "</span>" +
                        "<span class='vote'>" + vote_average + "</span></div></div>";
        }
        strFilm += "</div>";
        numFilm = column;
    }
    showFilm.innerHTML = strFilm;
}

function searchFilms() {
    let textInput = document.getElementById("inputSearch").value.toLowerCase();
    let arrFound = Films.filter(f => f.title.toLowerCase().includes(textInput));
    //let lengSearched = arrFound.length;
    let columns = lengPage < totalColumns ? lengPage : totalColumns;
    let rows = lengPage > totalColumns ? totalRows : 1;
    fillFilms(arrFound, columns, rows);
}

function PageForward() {
    let posEnd = currentPage * totalRows * totalColumns;
    console.log('ojete 1:', Films);
    let arrPage = Films.slice(posEnd);
    console.log('ojete 2:', arrPage);
    let lengPage = arrPage.length;
    let columns = lengPage < totalColumns ? lengPage : totalColumns;
    let rows = lengPage > totalColumns ? totalRows : 1;
    fillFilms(arrPage, columns, rows);
    if (lengPage < totalColumns * totalRows + 1) {
        btnPgForw.style.display = "none";
    }
    btnPgBack.style.display = "block";
    currentPage += 1;
}

function PageBack() {
    let posIni = (currentPage - 1) * totalRows * totalColumns - totalRows * totalColumns;
    let arrPage = Films.slice(posIni, posIni + 8);
    fillFilms(arrPage);
    if (posIni == 0) {
        btnPgBack.style.display = "none";
    }
    btnPgForw.style.display = "block";
    currentPage -= 1;
}
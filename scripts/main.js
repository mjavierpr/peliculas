import arr_films from './films.js';
const POSTER_PATH_INI = 'http://image.tmdb.org/t/p/w185/';
let totalColumns = 4;
let totalRows = 3;
let currentPage = 1;
window.addEventListener('load', fillFilms(arr_films));
btnSearch.addEventListener('click', searchFilms);
btnPgForw.addEventListener('click', PageForward);
btnPgBack.addEventListener('click', PageBack);

function fillFilms(films, columns = totalColumns, rows = totalRows) {
    let showFilm = document.getElementById("showFilms");
    let filmString = "", row, column, numFilm = 0;
    for (row = 1; row < rows + 1; row++) {
        filmString += `<div class="rowFilms">`;
        for (column = numFilm; column < Math.min(films.length, columns * row); column++) {
            let {poster_path, title, release_date, vote_average} = films[column];
            filmString += `<div class="film"><img src=${POSTER_PATH_INI}${poster_path} alt="poster ${title}">`;
            filmString += `<div class="title">${title}</div>`;
            filmString += `<div class="yearVote"><span>${release_date.slice(0, 4)}</span>`;
            filmString += `<span class="vote">${vote_average}</span></div></div>`;
        }
        filmString += `</div>`;
        numFilm = column;
    }
    showFilm.innerHTML = filmString;
}

function searchFilms() {
    let textInput = document.getElementById("inputSearch").value.toLowerCase();
    let arrSearched = arr_films.filter(f => f.title.toLowerCase().includes(textInput));
    let lengSearched = arrSearched.length;
    let columns = lengPage < totalColumns ? lengPage : totalColumns;
    let rows = lengPage > totalColumns ? totalRows : 1;
    console.log(textInput, lengSearched, columns, rows);
    fillFilms(arrSearched, columns, rows);
}

function PageForward() {
    let posEnd = currentPage * totalRows * totalColumns;
    let arrPage = arr_films.slice(posEnd);
    let lengPage = arrPage.length;
    let columns = lengPage < totalColumns ? lengPage : totalColumns;
    let rows = lengPage > totalColumns ? totalRows : 1;
    fillFilms(arrPage, columns, rows);
    if (lengPage < totalColumns * totalRows + 1) {
        document.getElementById("btnPgForw").style.display = "none";
    }
    document.getElementById("btnPgBack").style.display = "block";
    currentPage += 1;
}

function PageBack() {
    let posIni = (currentPage - 1) * totalRows * totalColumns - totalRows * totalColumns;
    let arrPage = arr_films.slice(posIni, posIni + 8);
    fillFilms(arrPage);
    if (posIni == 0) {
        document.getElementById("btnPgBack").style.display = "none";
    }
    document.getElementById("btnPgForw").style.display = "block";
    currentPage -= 1;
}
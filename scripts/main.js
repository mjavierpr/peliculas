import films from './films.js';

let poster_path = 'http://image.tmdb.org/t/p/w185/';
window.addEventListener('load', fillFilms);

function fillFilms() {
    let showFilm = document.getElementById("showFilms");
    showFilm.innerHTML = "";
    let numberFilms = 8, film = {}, filmString;
    for (let i = 0; i < numberFilms; i++) {
        film = films[i];
        filmString = "";

        filmString += `<div class="film"><div><img src=${poster_path}${film.poster_path} alt="poster film"></div>`;
        filmString += `<div class="title">${film.title}</div>`;
        filmString += `<div class="yearVote"><span>${(film.release_date).slice(0, 4)}</span>`;
        filmString += `<span class="vote">${film.vote_average}</span></div></div>`;

        showFilm.innerHTML += filmString;
    }
}
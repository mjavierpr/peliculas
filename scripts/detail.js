const API_URL = "https://api.themoviedb.org/3/";
const API_CATEG_URL = "genre/movie/list";
const API_KEY = "?api_key=22e540d93b35f018eaca6bb68784d866";
const IMG_PATH = 'http://image.tmdb.org/t/p/w185';
const IMG_PATH_BACKDROP = "http://image.tmdb.org/t/p/w1280";
let Img_Backdrop = "";

let url = new URL(window.location.href);
const ID_FILM = url.searchParams.get('id');

let apiFilm = API_URL + "movie/" + ID_FILM + API_KEY;
let film = [];
axios.get(apiFilm).then((response) => {
    film = response.data;
    // film.stars = Math.round(film['vote_average'] / 2);
    // film['backdrop'] = IMG_PATH_BACKDROP + film['backdrop_path'];
    if (document.readyState === "complete") {
        showFilm();}
    else {
        window.addEventListener('load', showFilm);}
}).catch((error) => {
    console.log('Ha habido un problema:', error.message);
});

function showFilm() {
    let showDiv = document.getElementById("showDetail");
    let {backdrop_path, title, genres, production_countries, production_companies, release_date, vote_average,
         vote_count, original_title, overview, popularity, homepage, poster_path} = film;
    let numStars = Math.round(vote_average);
    let imgStar1 = "<img src='img/star.png'>";
    let imgStar2 = "<img src='img/star2.png'>";
    Img_Backdrop = IMG_PATH_BACKDROP + backdrop_path;
    let strFilm = `<div class='title'>${title}</div><div class='hr'></div>
            <div class='film'>
                <div class="poster">
                    <div>
                        <img src=${IMG_PATH + poster_path} alt='poster ${title}'>
                        <div></div>
                    </div>
                </div>
                <div class='bloq1'>
                    <div>
                        <div>Nota:</div>
                        <div class='stars'><span>${vote_average}</span>&nbsp;&nbsp;&nbsp; ${imgStar1.repeat(numStars)}${imgStar2.repeat(10 - numStars)}</div>
                    </div>
                    <div>
                        <div>Votos:</div>
                        <div>${vote_count}</div>
                    </div>
                    <div>
                        <div>Popularidad:</div>
                        <div>${parseInt(popularity)}</div>
                    </div>                    
                    <div>
                        <div>Título original:</div>
                        <div>${original_title}</div>
                    </div>
                    <div>
                        <div>Año:</div>
                        <div>${release_date.slice(0, 4)}</div>
                    </div>
                    <div>
                        <div>Género:</div>
                        <div>${subElems(genres)}</div>
                    </div>
                    <div>
                        <div>País:</div>
                        <div>${subElems(production_countries)}</div>
                    </div>
                    <div>
                        <div>Producción:</div>
                        <div>${subElems(production_companies)}</div>
                    </div>
                </div>
                <div class='bloq2'>
                    <div>
                        <div>Sinopsis:</div>
                        <div>${overview})</div>
                    </div>
                    <div>
                        <div>Página oficial:</div>
                        <div><a href=${homepage}>Aquí</a></div>
                    </div>
                    <div>
                        <div></div>
                        <img id="backdrop" src=${IMG_PATH_BACKDROP + backdrop_path} alt='fondo ${title}'>
                    </div>
                </div>
            </div>`
    showDiv.innerHTML = strFilm;
    backdrop.addEventListener('click', bigImg);
}

function subElems(elem) {
    let arrMap = elem.map((e) => e.name);
    return arrMap.join(", ");
}

function bigImg() {
    let bigDiv = document.getElementById('bigImg');
    bigDiv.innerHTML = `<img src=${Img_Backdrop} alt="fondo imagen">`;
    bigDiv.addEventListener('click', removBigImg);
    backdrop.style.display = "none";
}

function removBigImg() {
    let bigDiv = document.getElementById('bigImg');
    backdrop.style.display = "block";
    bigDiv.innerHTML = "";
}
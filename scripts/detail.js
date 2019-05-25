const API_URL = "https://api.themoviedb.org/3/";
const API_CATEG_URL = "genre/movie/list";
const API_KEY = "?api_key=22e540d93b35f018eaca6bb68784d866";
const IMG_PATH = 'http://image.tmdb.org/t/p/w185';
const IMG_PATH_BACKDROP = "http://image.tmdb.org/t/p/w1280";

let url = new URL(window.location.href);
const ID_FILM = url.searchParams.get('id');

axiosRequest();
let Favorites = localStorage.getItem("Favorites") !== null ? JSON.parse(localStorage.getItem("Favorites")) : [];
let film = [];
let Img_Backdrop = "";

async function axiosRequest() {
    try {
        let response = await axios.get(API_URL + "movie/" + ID_FILM + API_KEY);
        film = response.data;
        if (document.readyState === "complete") {
            showFilm();}
        else {
            window.addEventListener('load', showFilm);}
    }
    catch (error) {
        console.log('Ha habido un problema:', error.message);
    }
}

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
                        <div><input class='favorit' type='image' ${favoriteSrcNtitle(ID_FILM, 1)} alt='Favorito' id=${ID_FILM}></div>
                    </div>
                </div>
                <div class='bloq1'>
                    <div>
                        <div>Nota:</div>
                        <div>${vote_average}</span>&nbsp;&nbsp;&nbsp; ${imgStar1.repeat(numStars)}${imgStar2.repeat(10 - numStars)}</div>
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
                </div>
            </div>`
    showDiv.innerHTML = strFilm;
    backdrop.src = IMG_PATH_BACKDROP + backdrop_path;
    backdrop.alt = "fondo " + title;
    backdrop.addEventListener('click', bigImg);
    document.getElementById(ID_FILM).addEventListener('click', favorite);
    showMap.style.backgroundImage = `url(${IMG_PATH + backdrop_path})`;
    mapBoxInit();
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
    showMap.style.display = "none";
}

function removBigImg() {
    let bigDiv = document.getElementById('bigImg');
    backdrop.style.display = "block";
    showMap.style.display = "flex";
    bigDiv.innerHTML = "";
}

let longi = -3.6883;
let lati = 40.4531;
let watchId;

function mapBoxInit() {
    mapboxgl.accessToken = 'pk.eyJ1IjoicmFtYm92aWkiLCJhIjoiY2p3MzlnZHkxMGdlbjQ5bzZ2NmZzbTllciJ9.iw5wKuuvBK4IbznvoFRh8Q';
    new mapboxgl.Map({
        container: 'mapBox',
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [longi, lati],
        zoom: 10
    });
    if ("geolocation" in navigator) {
        watchId = navigator.geolocation.watchPosition(newPos);
    }
    else {
        mapMsg.innerText = "No tienes la geolocalización activada.";
    }
}

function newPos (pos) {
    long = pos.coords.longitude;
    lat = pos.coords.latitude;
    if (long !== longi && lat !== lati) {
        navigator.geolocation.clearWatch(watchId);
        nearCinema(long, lat);
    }
}

async function nearCinema(long, lat) {
    let response = await axios.get('https://geoip-db.com/json/geoip.php');
    let city = response.data.state;
    let coordCinemas = [
        ['Marte', []],
        ['Alicante', [[-0.4736475, 38.3549512], [-0.4882439, 38.3463443]]],
        ['Valencia', [[-0.3566837, 39.4536315]]]];
    let arrDif = coordCinemas.filter((elem) => elem[0] == city)
        .map((elem) => elem[1]
            .map((e) => Math.abs(Math.abs(long) - Math.abs(e[0]) + Math.abs(lat) - Math.abs(e[1])))
        );
    arrDif = arrDif[0];
    let posCity = coordCinemas.map((elem) => elem[0]).indexOf(city);
    let posCoords = arrDif.indexOf(arrDif.reduce((prev, actu) => prev < actu ? prev : actu));
    let longit = coordCinemas[posCity][1][posCoords][0];
    let latit = coordCinemas[posCity][1][posCoords][1];
    let map = new mapboxgl.Map({
        container: 'mapBox',
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [longit, latit],
        zoom: 17
    });
    let elem = document.createElement('div');
    elem.className = 'marker';
    new mapboxgl.Marker(elem)
        .setLngLat({lng: longit, lat: latit})
        .addTo(map);
    mapMsg.innerText = "Este es tu cine más cercano";
}
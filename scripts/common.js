function favorite (event) {
    let id = event.target.id;
    let pos = Favorites.indexOf(id);
    pos > -1 ? Favorites.splice(pos, 1) : Favorites.push(id);
    localStorage.setItem("Favorites", JSON.stringify(Favorites));
    favoriteSrcNtitle(id, 2);
}

function favoriteSrcNtitle(id, ctrl) {
    let img = "favorite2.png";
    let titMsg = "Me gusta"; 
    if (Favorites.includes(id.toString())) {
        img = "favorite.png";
        titMsg = "Ya no me gusta";
    }
    if (ctrl == 1) {
        // Relleno de inicio
        return "src=img/" + img + " title='" + titMsg + "'";
    }
    else {
        // Pulsación de corazón
        document.getElementById(id).src = "img/" + img;
        document.getElementById(id).title = titMsg;
    }
}
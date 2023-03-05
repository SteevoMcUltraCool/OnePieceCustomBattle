let DON = {
    playBu: document.getElementById("play"),
    buildDeckBu: document.getElementById("buildDeck"),
    createCardBu: document.getElementById("createCard")
}
  DON.playBu.onclick= function(){
    window.location.replace("../html/play.html")
};DON.buildDeckBu.onclick= function(){
    window.location.replace("../html/deck.html")
};DON.createCardBu.onclick= function(){
    window.location.replace("../html/card.html")
}
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const error = Number(urlParams.get('error'))
console.log(urlParams)
console.log(error)
switch (Number(error)) {
    case 1: 
        console.log("Your most recent game was closed")
        break
    case 400:
        console.log("Could not find a recent game you were in.")
        break
}
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
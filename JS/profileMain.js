let DON = {
    logoutButton: document.getElementById("logoutButton"),
    revealHashBu: document.getElementById("revealHashBu"),
    hashGoesHere: document.getElementById("hashGoesHere"),
    username: document.getElementById("username"),
    decks: document.getElementById("decks")
}

DON.logoutButton.onclick = function(){
    localStorage.removeItem("hash")
    window.location.replace("../index.html")
}
import { UserLogInbyPH } from "./fauna.js";
let hash = localStorage.getItem('hash'), user = false
if (hash){
    user = await UserLogInbyPH(hash)
}

let hashShow
DON.revealHashBu.onclick = function(){
    hashShow = !hashShow
    DON.hashGoesHere.innerHTML = (hashShow && hash) || "DO NOT SHARE YOUR HASH"
}
DON.username.innerHTML = "Welcome, " + user.username
let decks = user.decks
function displayDecks(){
    DON.decks.innerHTML = "<div class='fixedTop'>Decks:</div>"
    decks.forEach(deck => {
        DON.decks.insertAdjacentHTML("beforeEnd",`<div class="normalDeck"> //needs styling
            <h4>${deck.name}</h4>
            <p>${deck.dataText}</p>
            <div class="showIMGcard" style="background-image:url('LEADER.IMAGE')"></div> //fix
        </div>`)
    })
    DON.decks.innerHTML = DON.decks.innerHTML + "<div class='fixedBottom' id='addDeck'>+</div>"
}

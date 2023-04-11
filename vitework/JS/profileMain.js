let DON = {
    logoutButton: document.getElementById("logoutButton"),
    revealHashBu: document.getElementById("revealHashBu"),
    hashGoesHere: document.getElementById("hashGoesHere"),
    username: document.getElementById("username"),
    decks: document.getElementById("decks"),
    playmats: document.getElementById("customPlaymats")

}
import { UserLogInbyPH } from "./fauna.js";
async function doStuff() {

DON.logoutButton.onclick = function(){
    localStorage.removeItem("hash")
    window.location.replace("../index.html")
}
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
function displayDecks(){
    let decks = user.decks
    DON.decks.innerHTML = "<div class='fixedTop'>Decks:</div>"
    decks.forEach(deck => {
        DON.decks.insertAdjacentHTML("beforeEnd",`<div class="normalDeck"> //needs styling
            <h4 id="bigH_">${deck.name}</h4>
            <p id="bigP_">${deck.dataText}</p>
            <div class="showIMGcard" style="background-image:url('LEADER.IMAGE')"></div> //fix
        </div>`)
    })
    DON.decks.innerHTML = DON.decks.innerHTML + "<button class='fixedBottom' id='addDeck'>+</button>"
}
function displayPlaymats(){
    let playmats = user.customPlaymats
    DON.playmats.innerHTML = "<div class='fixedTop'>Playmats:</div>"
    playmats.forEach(mat => {
        DON.decks.insertAdjacentHTML("beforeEnd",`<div class="normalDeck"> //needs styling
            <h4>${mat.name}</h4>
            <p>${mat.imgString}</p>
            <div class="showIMGmat" style="background-image:url('mat.imgString')"></div> //fix
        </div>`)
    })
    DON.playmats.innerHTML = DON.playmats.innerHTML + "<button class='fixedBottom' id='addPlaymat'>+</button>"
}
displayDecks()
displayPlaymats()
}
doStuff()
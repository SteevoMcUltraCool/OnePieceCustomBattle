const DON = {
    cardArea: document.getElementById("cardArea"),
    reloadBu: document.getElementById("reload"),
    searchButton: document.getElementById("searchButton"),
    searchText: document.getElementById("searchText")
}
import { GetAllCards, UploadCard } from "./fauna.js"
async function load(search){
    let cards = await GetAllCards()
    DON.cardArea.innerHTML = ""
    Object.keys(cards).filter(key=> {
        console.log(search)
        return cards[key].name.toLowerCase().includes((search||"").toLowerCase())
    }).forEach(key => {
        let newCardDiv = document.createElement("div")
        newCardDiv.style.backgroundImage = `url('${cards[key].img}')`
        let hidden = document.createElement("div")
        hidden.className= "hidden"
        newCardDiv.onmouseenter= function() {
            hidden.beingShown = true
            hidden.style.opacity = "100%"
        }
        newCardDiv.onmouseleave= function() {
            hidden.beingShown = false
            hidden.style.opacity = "0%"
        }

        newCardDiv.appendChild(hidden)
        DON.cardArea.insertAdjacentElement("afterbegin",newCardDiv)
    });
}

load()

DON.reloadBu.onclick = function(){load()}
DON.searchText.oninput = function(){load(searchText.value)}

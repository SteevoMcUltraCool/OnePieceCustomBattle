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
        DON.cardArea.insertAdjacentHTML("afterbegin",
        `<div style="background-image:url('${cards[key].img}')">
        </div>`)
    });
}

load()

DON.reloadBu.onclick = function(){load()}
DON.searchText.oninput = function(){load(searchText.value)}

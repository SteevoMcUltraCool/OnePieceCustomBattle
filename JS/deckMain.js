const DON = {
    cardArea: document.getElementById("cardArea"),
    reloadBu: document.getElementById("reload")
}
import { GetAllCards, UploadCard } from "./fauna.js"
async function load(){
    let cards = await GetAllCards()
    DON.cardArea.innerHTML = ""
    Object.keys(cards).forEach(key => {
        DON.cardArea.insertAdjacentHTML("afterbegin",
        `<div style="background-image:url('${cards[key].img}')">
        </div>`)
    });
}

load()

DON.reloadBu.onclick = load
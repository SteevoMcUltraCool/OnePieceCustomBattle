const DON = {
    cardArea: document.getElementById("cardArea"),
    reloadBu: document.getElementById("reload"),
    searchButton: document.getElementById("searchButton"),
    searchText: document.getElementById("searchText"),
    deckArea: document.getElementById("deckArea"),
    leaderArea: document.getElementById("leaderArea"),
    importDeckBu: document.getElementById("importDeck"),
    deckTextImport: document.getElementById("deckString")
}
import { GetAllCards, UploadCard } from "./fauna.js"
import { dkB } from "./deckBuildingModule.js"
let deck = []
let led = []
let cards 
async function load(search){
    cards = await GetAllCards()
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
        let inspectBu = document.createElement("button")
        inspectBu.className = "inspect"
        inspectBu.innerHTML = "Inspect"
        let leaderBu = document.createElement("button")
        leaderBu.className = "setLeader"
        leaderBu.innerHTML = "Leader"
        let addDeckBu = document.createElement("button")
        addDeckBu.className = "addToDeck"
        addDeckBu.innerHTML = "Add To Deck"
        hidden.appendChild(addDeckBu)
        hidden.appendChild(inspectBu)
        hidden.appendChild(leaderBu)
        newCardDiv.appendChild(hidden)
        DON.cardArea.insertAdjacentElement("afterbegin",newCardDiv)
    });
}

load()
async function deckLoad(str){
    if (str) {
        deck = dkB.stringToArray(str)
        led = deck.leaderArray
        deck = deck.deckArray
        console.log(led)
    }
    DON.deckArea.innerHTML = `               <span id="leaderArea"></span>    `
    DON.leaderArea = document.getElementById("leaderArea")
    led.forEach(minicard => {
        let id = minicard.id
        let count = minicard.count
        let newCard = document.createElement("div")
        newCard.style.backgroundImage = `url('${cards[id].img}')`
        let counter = document.createElement("div")
        counter.className = "count"
        counter.innerHTML = count
        newCard.appendChild(counter)
        DON.leaderArea.insertAdjacentElement("beforeend",newCard)
    })
    deck.forEach(minicard => {
        let id = minicard.id
        let count = minicard.count
        let newCard = document.createElement("div")
        newCard.style.backgroundImage = `url('${cards[id].img}')`
        let counter = document.createElement("div")
        counter.className = "count"
        counter.innerHTML = count
        newCard.appendChild(counter)
        DON.deckArea.insertAdjacentElement("beforeend",newCard)
    })
}
DON.importDeckBu.onclick= function(){
    deckLoad(DON.deckTextImport.value)
}
DON.reloadBu.onclick = function(){load()}
DON.searchText.oninput = function(){load(searchText.value)}

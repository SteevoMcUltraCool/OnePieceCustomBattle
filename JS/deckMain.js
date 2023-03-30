const DON = {
    cardArea: document.getElementById("cardArea"),
    reloadBu: document.getElementById("reload"),
    searchButton: document.getElementById("searchButton"),
    searchText: document.getElementById("searchText"),
    deckArea: document.getElementById("deckArea"),
    leaderArea: document.getElementById("leaderArea"),
    importDeckBu: document.getElementById("importDeck"),
    deckTextImport: document.getElementById("deckString"),
    exportDeckBu: document.getElementById("exportDeck"),
    cardsInLeaderLabel:document.getElementById("cardsInLeaderArea"),
    cardsInDeckLabel: document.getElementById("cardsInDeckArea"),
    exportDECKresultsLabel: document.getElementById("exportDECKresults"),
    inspect: document.getElementById("inspect"),
    card: document.getElementById("card"),
    stats: document.getElementById("stats"),
    close: document.getElementById("close")
}
import { GetAllCards, UploadCard } from "./fauna.js"
import { dkB } from "./deckBuildingModule.js"
let deck = []
let led = []
let cards 
let cardsInDeck
let cardsInLed 
function displayCardsCount(){
    DON.cardsInLeaderLabel.innerHTML = "Leader Area: " + cardsInLed + " cards"
    DON.cardsInDeckLabel.innerHTML = "Main Deck: " + cardsInDeck + " cards"
    if (cardsInLed==1){
        DON.cardsInLeaderLabel.style.backgroundColor = "green"
    }else if (cardsInLed>=1){
        DON.cardsInLeaderLabel.style.backgroundColor="red"
    }else {DON.cardsInLeaderLabel.style.backgroundColor = "transparent"}
    if (cardsInDeck==50){
        DON.cardsInDeckLabel.style.backgroundColor="green"
    }else if (cardsInDeck>=50){
        DON.cardsInDeckLabel.style.backgroundColor="red"
    }else {DON.cardsInDeckLabel.style.backgroundColor = "transparent"}
}
async function load(search){
    if (!search){
        cards = await GetAllCards()
    }
    DON.cardArea.innerHTML = ""
    Object.keys(cards).filter(key=> {
        return cards[key].name.toLowerCase().includes((search||"").toLowerCase())
    }).forEach(key => {
        let newCardDiv = document.createElement("div")
        newCardDiv.style.backgroundImage = `url('${cards[key].img}')`
        let hidden = document.createElement("div")
        hidden.className= "hidden"
        newCardDiv.id = cards[key].idBase10
        console.log(newCardDiv.id)
        newCardDiv.onmouseenter= function() {
            hidden.beingShown = true
            hidden.style.opacity = "100%"
        }
        newCardDiv.onmouseleave= function() {
            hidden.beingShown = false
            hidden.style.opacity = "0%"
        }
        newCardDiv.ontouchend = function() {
            hidden.beingShown = !hidden.beingShown
            hidden.style.opacity = (hidden.beingShown &&"100%") || "0%";
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
        addDeckBu.onclick = function() {
            if ((deck.filter(part=>part.id == newCardDiv.id)).length<1 &&hidden.beingShown){
            deck.push({id:newCardDiv.id, count:4})
            deckLoad()
            }
        }
        leaderBu.onclick = function() {
            if ((led.filter(part=>part.id == newCardDiv.id)).length<1&&hidden.beingShown){
                led.push({id:newCardDiv.id, count:1})
                deckLoad()
            }
        }
        inspectBu.onclick = function() {
            DON.inspect.style.opacity = 1
            DON.close.style.opacity = 1
            DON.inspect.style.pointerEvents = "all"
            DON.stats.innerHTML = ``
            DON.card.style.backgroundImage = `url("${cards[key].img}")`
            let sprat = Object.keys(cards[key])
            sprat.forEach(_key =>{
                DON.stats.insertAdjacentHTML("beforeend",`<p>${_key}: ${cards[key][_key]}</p>`)
            })
        }
        hidden.appendChild(addDeckBu)
        hidden.appendChild(inspectBu)
        hidden.appendChild(leaderBu)
        newCardDiv.appendChild(hidden)
        DON.cardArea.insertAdjacentElement("afterbegin",newCardDiv)
    });
}
DON.close.style.opacity = 0

DON.close.onclick = function(){
    DON.inspect.style.opacity = 0
    DON.close.style.opacity = 0
    DON.inspect.style.pointerEvents = "none"

}
load()
function deckLoad(str){
    cardsInDeck = 0
    cardsInLed = 0
    if (str) {
        deck = dkB.stringToArray(str)
        led = deck.leaderArray
        deck = deck.deckArray
        console.log(led)
    }
    DON.deckArea.innerHTML = `               <span id="leaderArea"></span>    `
    DON.leaderArea = document.getElementById("leaderArea")
    console.log(led, deck)
    led.forEach(minicard => {
        let id = minicard.id
        let count = minicard.count
        let newCard = document.createElement("div")
        newCard.style.backgroundImage = `url('${cards[id].img}')`
        let counter = document.createElement("div")
        counter.className = "count"
        counter.innerHTML = count
        let plus = document.createElement("button")
        plus.className="plus"
        plus.innerHTML = "+"
        newCard.appendChild(plus)
        let minus = document.createElement("button")
        minus.className="minus"
        minus.innerHTML = "-"

        if (count>=1){
            plus.style.backgroundColor = "red"
        }
        if (count<=1){
            minus.style.backgroundColor = "red"
        }
        plus.onclick=function(){
            let lilAR = led.filter(minicard=>minicard.id == id)
            if (lilAR[0]){
                lilAR[0].count = lilAR[0].count + 1
                if (lilAR[0].count < 1){plus.style.backgroundColor="white"}else{plus.style.backgroundColor="red"}
                if (lilAR[0].count > 1){minus.style.backgroundColor="white"}
                count +=1
                cardsInLed += 1
                counter.innerHTML = count
                displayCardsCount()
            } 
        }
        minus.onclick=function(){
            let lilAR = led.filter(minicard=>minicard.id == id)
            if (lilAR[0]){
                lilAR[0].count = lilAR[0].count - 1
                if (lilAR[0].count < 1){plus.style.backgroundColor="white"}
                if (lilAR[0].count > 1){minus.style.backgroundColor="white"}else{minus.style.backgroundColor="red"}
                count -=1
                counter.innerHTML = count
                cardsInLed -= 1

                if (count==0){
                    led = led.filter(minicard=> minicard!=lilAR[0])
                    deckLoad()
                }
                displayCardsCount()
            }             
        }
        newCard.appendChild(minus)
        newCard.appendChild(counter)
        DON.leaderArea.insertAdjacentElement("beforeend",newCard)
        cardsInLed +=count
    })
    deck.forEach(minicard => {
        let id = minicard.id
        let count = minicard.count
        let newCard = document.createElement("div")
        newCard.style.backgroundImage = `url('${cards[id].img}')`
        let counter = document.createElement("div")
        counter.className = "count"
        counter.innerHTML = count
        let plus = document.createElement("button")
        plus.className="plus"
        plus.innerHTML = "+"
        newCard.appendChild(plus)
        let minus = document.createElement("button")
        minus.className="minus"
        minus.innerHTML = "-"
        let remove = document.createElement("button")
        remove.className="remove"
        remove.innerHTML = "X"
        remove.onclick = function(){
            let lilAR = deck.filter(minicard=>minicard.id == id)
            deck = deck.filter(minicard=> minicard!=lilAR[0])
            cardsInDeck -= lilAR[0].count
            deckLoad()
        }
        if (count>=4){
            plus.style.backgroundColor = "red"
        }
        if (count<=1){
            minus.style.backgroundColor = "red"
        }
        plus.onclick=function(){
            let lilAR = deck.filter(minicard=>minicard.id == id)
            if (lilAR[0]){
                lilAR[0].count = lilAR[0].count + 1
                if (lilAR[0].count < 4){plus.style.backgroundColor="white"}else{plus.style.backgroundColor="red"}
                if (lilAR[0].count > 1){minus.style.backgroundColor="white"}
                count +=1
                cardsInDeck +=1
                counter.innerHTML = count
                displayCardsCount()
            } 
        }
        minus.onclick=function(){
            let lilAR = deck.filter(minicard=>minicard.id == id)
            if (lilAR[0]){
                lilAR[0].count = lilAR[0].count - 1
                if (lilAR[0].count < 4){plus.style.backgroundColor="white"}
                if (lilAR[0].count > 1){minus.style.backgroundColor="white"}else{minus.style.backgroundColor="red"}
                count -=1
                cardsInDeck -= 1
                counter.innerHTML = count
                if (count==0){
                    deck = deck.filter(minicard=> minicard!=lilAR[0])
                    deckLoad()
                }
                displayCardsCount()
            }             
        }
        newCard.appendChild(remove)
        newCard.appendChild(minus)
        newCard.appendChild(counter)
        DON.deckArea.insertAdjacentElement("beforeend",newCard)
        cardsInDeck+=count
    })
    displayCardsCount()
}
DON.importDeckBu.onclick= function(){
    deckLoad(DON.deckTextImport.value)
}
DON.exportDeckBu.onclick= async function(){
    let str = dkB.arrayToString(led,deck)
    if (str.length >=4){
    DON.deckTextImport.value = str
    navigator.clipboard.writeText(str)
    DON.exportDECKresultsLabel.innerHTML = "<br> <br>Success! Deck dataText copied to clipboard!<br>"
    DON.exportDECKresultsLabel.style.backgroundColor = "aquamarine"
    setTimeout(function(){DON.exportDECKresultsLabel.innerHTML=""}, 7000)
    }else {
        DON.exportDECKresultsLabel.innerHTML = "<br> <br>Failed! make sure to add some cards! <br>"
        DON.exportDECKresultsLabel.style.backgroundColor = "#E44"
        setTimeout(function(){DON.exportDECKresultsLabel.innerHTML=""}, 7000)     
    }
}
DON.reloadBu.onclick = function(){load()}
DON.searchText.oninput = function(){load(searchText.value)}

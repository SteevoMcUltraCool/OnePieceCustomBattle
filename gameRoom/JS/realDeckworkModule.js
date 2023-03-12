
let dWM = {

}
let allCards
dWM.sleeve = "https://media.discordapp.net/attachments/1075611996038381660/1082705638351712326/sleeve.png"
dWM.donSleeve ="https://media.discordapp.net/attachments/1075611996038381660/1082707407731433512/donsleeve.png"
dWM.expandArray = function(basicArray,shuffle,cards,face){
    allCards =allCards || cards
    let deck = []
    basicArray.forEach(part=>{
        let x = 1
        let card = allCards[part.id]
        do {
            deck.push({
                name: card.name,
                id: part.id,
                imgString: card.img,
                faceUp: {1:face||false, 2:face||false},
                rested:false,
                attachedDON: 0,
                uniqueGameId: `C${x}I${part.id}`
            })
            x+=1
        }while(x<=part.count)
    })
    return (shuffle && dWM.shuffleDeck(deck)) || deck
}
dWM.shuffleDeck=function(deck){
    let newDeck = []
    deck.forEach(card =>{
        card.faceUp = {}
        newDeck.splice(Math.floor(Math.random()*(newDeck.length+1)),0,card)
    })
    return newDeck
}
dWM.sendCardTo = function(PLP,tgt, place, spot, newSpot, faceUp) {
    let card = PLP[place][spot || 0]
    card.faceUp = faceUp || card.faceUp
    console.log(card.faceUp)
    PLP[tgt].splice(newSpot||0,0,card)
    PLP[place].splice(spot||0,1)
    return PLP
}
dWM.shiftCardTo = function(PLP, place, spot, newSpot, faceUp) {
    let card = PLP[place][spot]
    console.log(card.name)
    card.faceUp = faceUp || card.faceUp
    PLP[place].splice(spot,1)
    PLP[place].splice(newSpot,0,card)
    return PLP   
}
dWM.openSearch = function(deck,p){
    let searchBar = document.createElement("div")
    searchBar.className = "search"
    searchBar.divCards = []
    let faceUp=true
    deck.forEach(card=>{
        let good = card.faceUp[p]
        console.log(p, good)
        if (good){
            faceUp = true
            let newCard = document.createElement("div")
            newCard.uniqueGameId = card.uniqueGameId
            newCard.className = "pcard"
            newCard.style.backgroundImage = `url('${card.imgString}')`
            searchBar.divCards.push(newCard)
            searchBar.appendChild(newCard)
        }else{
            if(faceUp){
                console.log("struggling...")
                let newCard = document.createElement("div")
                newCard.uniqueGameId = card.uniqueGameId
                newCard.style.backgroundImage = `url('${dWM.sleeve}')`
                newCard.className = "pcard"
                searchBar.divCards.push(newCard)
                faceUp = false
                searchBar.appendChild(newCard)
            }
        }
    })
    return searchBar
}

export let DWM = dWM

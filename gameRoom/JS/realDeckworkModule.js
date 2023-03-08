
let dWM = {

}
let allCards
dWM.sleeve = "https://media.discordapp.net/attachments/1075611996038381660/1082705638351712326/sleeve.png"
dWM.donSleeve ="https://media.discordapp.net/attachments/1075611996038381660/1082707407731433512/donsleeve.png"
dWM.expandArray = function(basicArray,shuffle,cards){
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
                faceUp: {1:false, 2:false},
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
    PLP[place].push(null)
    return PLP
}


export let DWM = dWM


let dWM = {

}
let allCards
dWM.sleeve = "https://media.discordapp.net/attachments/1082104049878437948/1082145417074061382/cardback.png"
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
                x: 0,
                y: 0,
                imgString: card.img,
                faceUp: {1:false, 2:false},
                rested:false,
                attachedDON: 0,
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


export let DWM = dWM

let deckB = {}
deckB.arrayToString = function(leaderArray, deckArray) {
    let str = ""
    leaderArray.forEach(miniCard => {
        str = str+ `L${miniCard.count}I${miniCard.id}`
    });
    deckArray.forEach(miniCard => {
        str = str+ `C${miniCard.count}I${miniCard.id}`
    });
    return str
}
deckB.stringToArray = function(deckString) {
    let newObj = {
        deckArray: [],
        leaderArray: [],
    }
    let leaders = deckString.split("L")
    let x = leaders.length
    let characters = leaders[x-1].split("C")
    leaders[x-1] = characters[0]
    characters.shift();leaders.shift()
    leaders.forEach(str => {
        let stuff = str.split("I")
        newObj.leaderArray.push({count:stuff[0], id:stuff[1]})
    })
    characters.forEach(str => {
        let stuff = str.split("I")
        newObj.deckArray.push({count:stuff[0], id:stuff[1]})
    })
    return newObj
}

export let dkB = deckB 
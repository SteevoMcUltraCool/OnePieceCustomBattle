import {GetGamesWithXPlayers, CreateGame} from "./fauna.js"
let DON = {
       gameSlots: document.getElementById("gameSlots"),
       createGameBu: document.getElementById("createGameButton"),
       gameNameText: document.getElementById("gameNameText")
}
async function load(){
    let openGames = await GetGamesWithXPlayers(1)
    DON.gameSlots.innerHTML = ""
    openGames.forEach(game=>{
     let newGameDiv = document.createElement("div")   
     let title = document.createElement("h4")
     title.innerHTML = game.gameName + `&nbsp&nbsp<i><span class='smaller'>(${game.player1.name})</span></i>`
     let playerDisplay = document.createElement("label")
     playerDisplay.innerHTML = '<i>Waiting for player... 1/2</i>'
     let joinButton = document.createElement("button")
     joinButton.onclick = function(){
        window.location.replace("../gameRoom/index.html?gameID="+game.gameID)   
     }
     joinButton.innerHTML = "Join Game"
     newGameDiv.appendChild(title)
     newGameDiv.appendChild(playerDisplay)
     newGameDiv.appendChild(joinButton)
     DON.gameSlots.appendChild(newGameDiv)
    })
}
load()
setInterval(load, 3000)
DON.createGameBu.onclick = async function(){
    let gameBig
    if (gameNameText.value=="" || gameNameText.value==" " ){gameBig = await CreateGame()} else {gameBig= await CreateGame(gameNameText.value)}
    if (gameBig){
        gameNameText.value = ""
        window.location.replace("../gameRoom/index.html?gameID="+gameBig.data.lastGameId+"&player=1")
    }
}
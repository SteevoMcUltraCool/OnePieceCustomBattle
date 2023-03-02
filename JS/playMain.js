import {GetGamesWithXPlayers} from "./fauna.js"
let DON = {
       gameSlots: document.getElementById("gameSlots"),
       
}
async function load(){
    let openGames = await GetGamesWithXPlayers(1)
    openGames.forEach(game=>{
     let newGameDiv = document.createElement("div")   
    })
}
load()

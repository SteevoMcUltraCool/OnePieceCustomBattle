import {GetGamesWithXPlayers} from "./fauna.js"

async function load(){
    let openGames = GetGamesWithXPlayers(1)
    let closedGames = GetGamesWithXPlayers(0)
    let fullGames = GetGamesWithXPlayers(2)
    console.log(openGames,closedGames,fullGames)
}

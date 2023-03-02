import {GetGamesWithXPlayers} from "./fauna.js"

async function load(){
    let openGames = await GetGamesWithXPlayers(1)
    let closedGames = await GetGamesWithXPlayers(0)
    let fullGames = await GetGamesWithXPlayers(2)
    console.log(openGames,closedGames,fullGames)
}

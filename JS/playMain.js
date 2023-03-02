import {GetGamesWithXPlayers} from "./fauna.js"

async function load(){
    let openGames = GetGamesWithXPlayers(1)
    let closedGames = GetGamesWithXPlayers(0)
}
import {dkB} from "../../JS/deckBuildingModule.js";
import { GetAllCards, GetGameWithXId, GetGamesWithXPlayers, UploadCard} from "../../JS/fauna.js";
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const gameID = Number(urlParams.get('gameID'))
let thisGame = await GetGameWithXId(gameID)
if (thisGame.players >= 2){
    
}
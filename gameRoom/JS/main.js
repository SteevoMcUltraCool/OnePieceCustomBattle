import {dkB} from "../../JS/deckBuildingModule.js";
import { GetAllCards, GetGameWithXId, GetGamesWithXPlayers, UploadCard, RequestToJoinGame} from "../../JS/fauna.js";
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const gameID = Number(urlParams.get('gameID'))
const player = Number(urlParams.get('player'))
let thisGame = await GetGameWithXId(gameID)
if (!getCookie("player") || getCookie("game")!=thisGame.gameID){
    console.log("hmm...")
    if (player=="1"){
        setCookie("player","1",0.76)
        setCookie("game",thisGame.gameID,0.76)
    }else{
        let attempt = await RequestToJoinGame(thisGame.id)
        if (attempt.good){
            setCookie("player","2",0.76)
            setCookie("game",thisGame.gameID,0.76)        
        }else {
            window.location.replace("../../index.html?error="+attempt.details)
        }
    }
}
console.log(thisGame)
console.log("player="+getCookie("player"), "game="+getCookie("game"))

function setCookie(cname, cvalue, exdays) {
    const d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    let expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}
function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for(let i = 0; i <ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return false;
}

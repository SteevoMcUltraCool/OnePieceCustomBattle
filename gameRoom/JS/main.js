import {dkB} from "../../JS/deckBuildingModule.js";
import { DWM } from "./realDeckworkModule.js";
import { GetAllCards, GetGameWithXId, GetGamesWithXPlayers, UploadCard, RequestToJoinGame, AddChatToLog, UpdateData} from "../../JS/fauna.js";
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
let Cards = await GetAllCards()
let DON = {
    gameLog: document.getElementById("gameLog"),
    messageInput:document.getElementById("message"),
    sendButton:document.getElementById("sendButton"),
    topPlayerArea: {
        self:  document.getElementById("topPlayerArea"),
        lifeTrash:document.getElementById("tLifeTrash"),
        hand: document.getElementById("tHand"),
        donMain: document.getElementById("tDonMain"),
        leaderStage: document.getElementById("tLeaderStage"),
        characterArea: document.getElementById("tCharacterArea"),
        DONN: document.getElementById("tDONN")
    },
    bottomPlayerArea: {
        self:  document.getElementById("bottomPlayerArea"),
        lifeTrash:document.getElementById("bLifeTrash"),
        hand: document.getElementById("bHand"),
        donMain: document.getElementById("bDonMain"),
        leaderStage: document.getElementById("bLeaderStage"),
        characterArea: document.getElementById("bCharacterArea"),
        DONN: document.getElementById("bDONN")
    },
    cardDisplay: document.getElementById("cardDisplay"),
    cardNameDisplay: document.getElementById("cardDisplayHeader")
}
let gameID = Number(urlParams.get('gameID'))
let player = Number(urlParams.get('player'))
let localChatLog = []
let thisGame
if (gameID){    
    thisGame = await GetGameWithXId(gameID)
}else if (getCookie("game")){
    gameID = Number(getCookie("game"))
    thisGame = await GetGameWithXId(gameID)
    if (!thisGame){
        window.location.replace("../../index.html?error="+"1")
    }
}else{
    window.location.replace("../../index.html?error="+"400")
}

function promptInitiatePlayer(){
    console.log("prompting initiation")
    let popOutBox = document.createElement("div")
    popOutBox.id = "popOutBox"
    popOutBox.style.zIndex = 4
    popOutBox.innerHTML = "Name: "
    popOutBox.nameInput = document.createElement("input")
    popOutBox.appendChild(popOutBox.nameInput)
    popOutBox.insertAdjacentHTML("beforeend", `
    <br> Paste Deck: `)
    popOutBox.deckInput = document.createElement("input")
    popOutBox.appendChild(popOutBox.deckInput)
    document.body.insertAdjacentElement("afterbegin",popOutBox)
    popOutBox.readyButton = document.createElement("button")
    popOutBox.readyButton.innerHTML = "Ready!"
    popOutBox.insertAdjacentHTML("beforeend","<br>")
    popOutBox.appendChild(popOutBox.readyButton)
    popOutBox.readyButton.onclick = async function(){
        await initialize(popOutBox.nameInput.value, popOutBox.deckInput.value)
        popOutBox.remove()
    }

}
async function initialize(name,deck){
    let AR = {}
    let deckk = dkB.stringToArray(deck)
    let charDeck = DWM.expandArray(deckk.deckArray,true,Cards)
    let leadDeck = DWM.expandArray(deckk.leaderArray,false,Cards)
    AR[`player${player}`] = {
        name: name.length>1&&name || "Anonymous",
        initiated: true,
        gameParts: {
            mainDeck: charDeck,
            leaderArea: leadDeck,
            donDeck: [10],
        }
    }
    await UpdateData(thisGame.id, AR)
    await AddChatToLog(thisGame.id, thisGame.chatLog, AR[`player${player}`].name + " is ready to play!", "Server")
}

if (!getCookie("player") || getCookie("game")!=thisGame.gameID){
    console.log("hmm...")
    if (player=="1"){
        setCookie("player","1",0.76)
        setCookie("game",thisGame.gameID,0.76)
        promptInitiatePlayer()
        AddChatToLog(thisGame.id, thisGame.chatLog, "A player has joined the game!", "Server")
    }else{
        let attempt = await RequestToJoinGame(thisGame.id)
        if (attempt.good){
            setCookie("player","2",0.76)
            setCookie("game",thisGame.gameID,0.76)       
            promptInitiatePlayer() 
            AddChatToLog(thisGame.id, thisGame.chatLog, "A player has joined the game!", "Server")
        }else {
            window.location.replace("../../index.html?error="+"1")
        }
    }
}
player = getCookie("player")
let PlayerOBJ = thisGame["player"+player]
console.log(thisGame,PlayerOBJ)
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

setInterval(async function(){
    if (thisGame){
        let newthisGame = await GetGameWithXId(gameID)
        if (thisGame.chatLog.length != newthisGame.chatLog.length){
            thisGame = newthisGame
            PlayerOBJ = thisGame["player"+player]
            console.log(thisGame.chatLog, PlayerOBJ)
            loadBoard()
        }
    }
},92)
function updateChatLog(){
    let latestGotChat = localChatLog.length
    let newChat =  thisGame.chatLog.slice(latestGotChat)
    let check = DON.gameLog.scrollTop - DON.gameLog.scrollHeight
    console.log(check)
    newChat.forEach(chat =>{
        localChatLog.push(chat)
        DON.gameLog.insertAdjacentHTML("beforeend", `
        <div><h4>${chat.sender}</h4><p>${chat.text}</p></div>`)
        if (PlayerOBJ) {
           if (chat.sender == PlayerOBJ.name){
            check = 0
           }
        }
    })
    if (Math.abs(check) < 300){
        DON.gameLog.scrollTop = DON.gameLog.scrollHeight;
    }
}
loadBoard(true)

function localSendMessage(){
        let message = DON.messageInput.value
        if (message && message != "" && message != " " && message != "  "){
            AddChatToLog(thisGame.id, thisGame.chatLog, message, PlayerOBJ.name)
            DON.messageInput.value = ""
        }
}
DON.sendButton.onclick = localSendMessage
window.addEventListener("keypress", function(event){
    if (event.key.toLowerCase() == "enter"){
        localSendMessage()
    }
})

function createButtons(arrayOfNames){
    let buttons = document.createElement("div")
    buttons.className = "buttons"
    arrayOfNames.forEach(name=>{
        let newButton = document.createElement("div")
        newButton.IsA = "Button"
        newButton.innerHTML = name
        buttons[name] = newButton
        buttons.appendChild(newButton)
    })
    return buttons
}
function loadBoard(first){
    updateChatLog()
    console.log(player, thisGame["player"+player])
   let bottomPlayerP = thisGame["player"+player].gameParts
   let topPlayer = thisGame["player"+Math.ceil((player+0.9)%2)]
   //donMain
   if (first){
   DON.bottomPlayerArea.donMain.innerHTML = ""
   DON.bottomPlayerArea.donMain.innerHTML = `
    <div class="DON" id="d1">
    <div class="count" >
        <p><span class="donIMG">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span><span id="mCount"></span></p>
    </div>
    </div>
    <div class="main" id="m1">
    <div class="count">
        <p><span class="mainIMG">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span><span id="dcount"></span></p>
    </div>
    </div>
`    
    DON.mainmain = document.getElementById("m1")
    DON.mCount = document.getElementById("mCount")
    DON.mainmain.IsA = "Card"
    DON.mainmain.Name = "Main Deck"
    DON.mainmain.Type = "MD"
    DON.mainmain.buttons = createButtons(["Draw", "Flip Top","More"])
    DON.mainmain.appendChild(main.buttons)
    DON.mainmain.buttons.Draw.execute = mainDeckDrawFrom
    DON.dondon = document.getElementById("d1")
    DON.dondon.IsA = "Card"
    DON.dondon.Name = "DON!! Deck"
    DON.dondon.buttons = createButtons(["Draw","Draw x2", "More"])
    DON.dondon.appendChild(don.buttons)
    DON.dondon.Type = "DDN"
    }
    if (mCount >=1) DON.mainmain.style.backgroundImage = `url('${DWM.sleeve}')`
    let mCount = bottomPlayerP.mainDeck.length
    let dCount = bottomPlayerP.donDeck[0]
    if (dCount >=1) DON.dondon.style.backgroundImage = `url('${DWM.donSleeve}')`
    DON.mCount.innerHTML = mCount
    DON.dCount.innerHTML = dCount
    //lifeTrash
    DON.bottomPlayerArea.lifeTrash.innerHTML = ""
    let lCount = bottomPlayerP.life.length
    let tCount = bottomPlayerP.trash.length
    DON.bottomPlayerArea.lifeTrash.innerHTML = `
    <div class="life" id="l1">
    <div class="count">
        <p><span class="heartIMG">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>${lCount}</p>
    </div>
</div>
<div class="trash" id="t1">
    <div class="count">
        <p><span class="trashIMG">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>${tCount}</p>
    </div>
</div>
 `
     let life = document.getElementById("l1")
     if (lCount >=1) life.style.backgroundImage = `url('${DWM.sleeve}')`
     life.IsA = "Card"
     let trash = document.getElementById("t1")
     if (lCount >=1) trash.style.backgroundImage = `url('${bottomPlayerP.trash[0].imgString}')`
     trash.IsA = "Card"
    //hand 
    DON.bottomPlayerArea.hand.innerHTML = ""
    let hCount = bottomPlayerP.hand.length
    bottomPlayerP.hand.forEach(card =>{
        let divCard = document.createElement("div")
        if (card.faceUp[player]) {divCard.style.backgroundImage = `url('${card.imgString}')`}
        else {divCard.style.backgroundImage= `url(${DWM.sleeve})`}
        divCard.IsA = "Card"
        DON.bottomPlayerArea.hand.appendChild(divCard)
    })
}


let focusCard

function focus(card){
    card.buttons.style.opacity = "1"
    DON.cardNameDisplay.innerHTML = card.Name
    DON.cardDisplay.style.backgroundImage = card.style.backgroundImage
}
function unfocus(card){
    card.buttons.style.opacity = "0"

}
window.addEventListener("mousemove", (event)=>{
    let allSelected = document.elementsFromPoint(event.pageX, event.pageY) 
    let oldFocus = focusCard || oldFocus || m1
    focusCard = allSelected.filter(thing => thing.IsA == "Card")[0] || focusCard
    if (oldFocus != focusCard){
        unfocus(oldFocus)
        focus(focusCard)
    }
})
window.addEventListener("click", (event)=>{
    let allSelected = document.elementsFromPoint(event.pageX, event.pageY) 
    let button = allSelected.filter(thing => thing.IsA == "Button")[0]
    if (button) {button.execute()}
    else{}  
})

async function mainDeckDrawFrom(spot){
    let f = {}
    f[player] = true
    console.log(f)
    DWM.sendCardTo(PlayerOBJ.gameParts,"hand","mainDeck",spot,0, f)
    let AR = {}; AR[`player${player}`] = {
        gameParts: {
            mainDeck: PlayerOBJ.gameParts.mainDeck,
            hand: PlayerOBJ.gameParts.hand
        }
    }
    await UpdateData(thisGame.id, AR)
    AddChatToLog(thisGame.id,localChatLog,`${PlayerOBJ.name} drew a card.`, "Server")
}

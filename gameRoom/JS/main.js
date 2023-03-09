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
    cardNameDisplay: document.getElementById("cardDisplayHeader"),
    donCount: document.getElementById("donCount"),
    sideDon: document.getElementById("sideDon"),
    upDon: document.getElementById("upDon"),
    sideDonCount: document.getElementById("sideDonCount"),
    upDonCount: document.getElementById("upDonCount"),
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
    let leadDeck = DWM.expandArray(deckk.leaderArray,false,Cards,true)
    AR[`player${player}`] = {
        name: name.length>1&&name || "Anonymous",
        initiated: true,
        gameParts: {
            mainDeck: charDeck,
            leaderArea: leadDeck,
            donDeck: [10],
            donArea: [0,0,0]
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
        console.log(thisGame.chatLog.length, newthisGame.chatLog.length)
        if (localChatLog.length != newthisGame.chatLog.length){
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
    console.log(latestGotChat,  newChat, thisGame.chatLog, localChatLog)
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
    if (Math.abs(check) < 650){
        DON.gameLog.scrollTop = DON.gameLog.scrollHeight;
    }
}

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
   try{
   updateChatLog()
   let bottomPlayerP = thisGame["player"+player].gameParts
   let topPlayer = thisGame["player"+Math.ceil((player+0.9)%2)]
   //donMain
   let dCount = bottomPlayerP.donDeck[0]
   if (first){
   DON.bottomPlayerArea.donMain.innerHTML = ""
   DON.bottomPlayerArea.donMain.innerHTML = `
    <div class="DON" id="d1">
    <div class="count" >
        <p><span class="donIMG">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span><span id="dCount"></span></p>
    </div>
    </div>
    <div class="main" id="m1">
    <div class="count">
        <p><span class="mainIMG">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span><span id="mCount"></span></p>
    </div>
    </div>
`    
    DON.mainmain = document.getElementById("m1")
    DON.mCount = document.getElementById("mCount")
    DON.mainmain.IsA = "Card"
    DON.mainmain.Name = "Main Deck"
    DON.mainmain.Type = "MD"
    DON.mainmain.buttons = createButtons(["Draw", "Flip Top","More"])
    DON.mainmain.appendChild(DON.mainmain.buttons)
    DON.mainmain.buttons.Draw.execute = mainDeckDrawFrom
    DON.dondon = document.getElementById("d1")
    DON.dCount = document.getElementById("dCount")
    DON.dondon.IsA = "Card"
    DON.dondon.Name = "DON!! Deck"
    DON.dondon.buttons = createButtons(["Draw","Draw x2", "More"])
    DON.dondon.buttons.Draw.execute = async function(){
        drawDonCard(dCount,bottomPlayerP,1)
    }
    DON.dondon.buttons["Draw x2"].execute = async function(){
        drawDonCard(dCount,bottomPlayerP,2)
    }
    DON.dondon.appendChild(DON.dondon.buttons)
    DON.dondon.Type = "DDN"
    }
    let mCount = bottomPlayerP.mainDeck.length
    if (mCount >=1) {DON.mainmain.style.backgroundImage = `url('${DWM.sleeve}')`}
    else{DON.mainmain.style.backgroundImage = "none"}
    if (dCount >=1) {DON.dondon.style.backgroundImage = `url('${DWM.donSleeve}')`}
    else{DON.dondon.style.backgroundImage = "none"}
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
     if (tCount >=1) trash.style.backgroundImage = `url('${bottomPlayerP.trash[0].imgString}')`
     trash.IsA = "Card"
     trash.Name = "Trash"
     trash.Type ="Trash"
    //hand 
    DON.bottomPlayerArea.hand.innerHTML = ""
    let hCount = bottomPlayerP.hand.length
    bottomPlayerP.hand.forEach(card =>{
        let divCard = document.createElement("div")
        if (card.faceUp[player]) {divCard.style.backgroundImage = `url('${card.imgString}')`}
        else {divCard.style.backgroundImage= `url(${DWM.sleeve})`}
        divCard.IsA = "Card"
        divCard.Type = "Hand"
        divCard.Name = ""
        divCard.buttons = createButtons(["Play","Trash","More"])
        divCard.appendChild(divCard.buttons)
        divCard.buttons.Play.execute = function(){
                playFromHand(card.uniqueGameId)
        }
        divCard.buttons.Trash.execute = function(){
            trashFromPH("hand",card.uniqueGameId)
        }
        DON.bottomPlayerArea.hand.appendChild(divCard)
    })
    //charArea
    DON.bottomPlayerArea.characterArea.innerHTML = `<div class="count">
    <p><span class="handIMG">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>${hCount}</p>
</div>`
    bottomPlayerP.playArea.forEach(card =>{
        let divCard = document.createElement("div")
        divCard.className = "CCard"
        if (card.rested) {divCard.className = "CCard rested"}
        if (card.faceUp[player]) {divCard.style.backgroundImage = `url('${card.imgString}')`}
        else {divCard.style.backgroundImage= `url(${DWM.sleeve})`}
        divCard.IsA = "Card"
        divCard.Type = "InPlay"
        divCard.Name = ""
        divCard.buttons = createButtons(["Rest","Trash","More"])
        divCard.appendChild(divCard.buttons)
        divCard.buttons.Rest.execute = async function(){
            rest(divCard,card,true,bottomPlayerP)
        }
        divCard.buttons.Trash.execute = async function(){
            trashFromPH("playArea",card.uniqueGameId)
        }
        DON.bottomPlayerArea.characterArea.insertAdjacentElement("afterbegin",divCard)       
    })
    //leaderArea 
    DON.bottomPlayerArea.leaderStage.innerHTML = ""
    bottomPlayerP.leaderArea.forEach(card =>{
        let divCard = document.createElement("div")
        divCard.className = "LCard"
        if (card.rested){ divCard.className = "LCard rested"}
        if (card.faceUp[player]) {divCard.style.backgroundImage = `url('${card.imgString}')`}
        else {divCard.style.backgroundImage= `url(${DWM.sleeve})`}
        divCard.IsA = "Card"
        divCard.Type = "InLeader"
        divCard.Name = ""
        divCard.buttons = createButtons(["Rest","Shake","More"])
        divCard.appendChild(divCard.buttons)
        divCard.buttons.Rest.execute = async function(){
                rest(divCard,card,false,bottomPlayerP)
        }
        DON.bottomPlayerArea.leaderStage.appendChild(divCard)       
    })   
    //donArea 
    DON.donCount.innerHTML = 10 - dCount
    DON.upDonCount.innerHTML = bottomPlayerP.donArea[0] ||0
    DON.sideDonCount.innerHTML = bottomPlayerP.donArea[1] ||0
    if (bottomPlayerP.donArea[0]>=1){DON.upDon.style.backgroundImage = `url(../../../images/DONface.png)`}else{DON.upDon.style.backgroundImage= "none"}
   }catch(er){
        console.log("error")
        setTimeout(function(){loadBoard(true)},125)
   }
  }
async function rest(divCard,card,C,bottomPlayerP){
    let cN = divCard.className, un=""
    if (cN.includes("rested")){
        card.rested = false
        un = "un"
    }else {
        card.rested = true
    }
    let AR
    if (C){
        AR = {}; AR[`player${player}`] = {gameParts:{characterArea:[]}}
        console.log(bottomPlayerP)
        AR[`player${player}`].gameParts.playArea = bottomPlayerP.playArea
    }else{
        AR = {}; AR[`player${player}`] = {gameParts:{leaderArea:[]}}
        AR[`player${player}`].gameParts.leaderArea = bottomPlayerP.leaderArea
    }
    console.log(AR)
    await UpdateData(thisGame.id, AR)
    await AddChatToLog(thisGame.id,thisGame.chatLog,`${PlayerOBJ.name} ${un}rested ${card.name}.`, "Server")   
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
    let oldFocus = focusCard || DON.mainmain
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
    await AddChatToLog(thisGame.id,thisGame.chatLog,`${PlayerOBJ.name} drew a card.`, "Server")
}

async function playFromHand(uniqueGameId){
    let f = {1: true, 2: true}
    let spot = PlayerOBJ.gameParts.hand.findIndex(c => c.uniqueGameId==uniqueGameId)
    let name = PlayerOBJ.gameParts.hand[spot].name
    DWM.sendCardTo(PlayerOBJ.gameParts,"playArea","hand",spot,0, f)
    let AR = {}; AR[`player${player}`] = {
        gameParts: {
            playArea: PlayerOBJ.gameParts.playArea,
            hand: PlayerOBJ.gameParts.hand
        }
    }
    await UpdateData(thisGame.id, AR)
    await AddChatToLog(thisGame.id,thisGame.chatLog,`${PlayerOBJ.name} played ${name}.`, "Server")
}
async function trashFromPH(place,uniqueGameId){
    let f = {1: true, 2: true}
    let spot = PlayerOBJ.gameParts[place].findIndex(c => c.uniqueGameId==uniqueGameId)
    let name = PlayerOBJ.gameParts[place][spot].name
    DWM.sendCardTo(PlayerOBJ.gameParts,"trash",place,spot,0, f)
    let AR = {}; AR[`player${player}`] = {
        gameParts: {
            playArea: PlayerOBJ.gameParts.playArea,
            hand: PlayerOBJ.gameParts.hand,
            trash : PlayerOBJ.gameParts.trash
        }
    }
    await UpdateData(thisGame.id, AR)
    await AddChatToLog(thisGame.id,thisGame.chatLog,`${PlayerOBJ.name} trashed ${name} from ${place}.`, "Server")
}
async function drawDonCard(dCount,bottomPlayerP,count) {
    console.log(bottomPlayerP)
    console.log(bottomPlayerP.donDeck[0],count)
    if (bottomPlayerP.donDeck[0]>=count){
        bottomPlayerP.donDeck[0] -= count
        bottomPlayerP.donArea[0] +=count
        let AR = {}; AR[`player${player}`] = {
            gameParts: {
                donDeck: bottomPlayerP.donDeck,
                donArea: bottomPlayerP.donArea,
            }
        }
        await UpdateData(thisGame.id, AR)
        await AddChatToLog(thisGame.id,thisGame.chatLog,`${PlayerOBJ.name} drew +${count} DON!!`,"Server")
    }
}

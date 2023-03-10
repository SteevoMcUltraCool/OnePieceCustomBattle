import {dkB} from "../../JS/deckBuildingModule.js";
import { DWM } from "./realDeckworkModule.js";
import { GetAllCards, GetGameWithXId, GetGamesWithXPlayers, UploadCard, RequestToJoinGame, AddChatToLog, UpdateData} from "../../JS/fauna.js";
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
let Cards = await GetAllCards();
let  targeting = {
    active:false,
    reason: false,
    strength: 0,
}
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
    donAreaControls: {
        unrestAll: document.getElementById("unrestAll"),
        restNum: document.getElementById("restNum"),
        rest: document.getElementById("rest"),
        unrestNum: document.getElementById("unrestNum"),
        unrest: document.getElementById("unrest"),
        attachNum:document.getElementById("attachNum"),
        attach: document.getElementById("attach"),
        returnNum:document.getElementById("returnNum"),
        return:document.getElementById("return"), 
        unattachNum: document.getElementById("unattachNum"),
        unattach: document.getElementById("unattach")
    },
    tdonCount: document.getElementById("tdonCount"),
    tsideDon: document.getElementById("tsideDon"),
    tupDon: document.getElementById("tupDon"),
    tsideDonCount: document.getElementById("tsideDonCount"),
    tupDonCount: document.getElementById("tupDonCount"),
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
        if (localChatLog.length != newthisGame.chatLog.length){
            thisGame = newthisGame
            PlayerOBJ = thisGame["player"+player]
            console.log(thisGame.chatLog, PlayerOBJ)
            loadBoard()
        }
    }
},104)
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
        newButton.style.zIndex = "10"
        buttons[name] = newButton
        buttons.appendChild(newButton)
    })
    return buttons
}
function loadBoard(first){
   try{
   updateChatLog()
   let bottomPlayerP = thisGame["player"+player].gameParts
   let newPlayer = 2
   if (player==2){newPlayer=1}
   let topPlayerP = thisGame["player"+newPlayer].gameParts
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
     life.Name = "Life"
     life.Type ="Life"
     life.buttons = createButtons(["Peep 1","Draw","More"])
     let trash = document.getElementById("t1")
     if (tCount >=1) trash.style.backgroundImage = `url('${bottomPlayerP.trash[0].imgString}')`
     trash.IsA = "Card"
     trash.Name = "Trash"
     trash.Type ="Trash"
     trash.buttons = createButtons(["Search","More"])
     life.appendChild(life.buttons)
     trash.append(trash.buttons)
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
        divCard.uniqueGameId = card.uniqueGameId
        divCard.buttons = createButtons(["Rest","Trash","More"])
        divCard.appendChild(divCard.buttons)
        divCard.buttons.Rest.execute = async function(){
            rest(divCard,card,true,bottomPlayerP)
        }
        divCard.buttons.Trash.execute = async function(){
            trashFromPH("playArea",card.uniqueGameId)
        }
        loadDON(card,divCard)
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
        divCard.uniqueGameId = card.uniqueGameId
        divCard.buttons = createButtons(["Rest","Shake","More"])
        divCard.appendChild(divCard.buttons)
        divCard.buttons.Rest.execute = async function(){
                rest(divCard,card,false,bottomPlayerP)
        }
        loadDON(card,divCard)
        DON.bottomPlayerArea.leaderStage.appendChild(divCard)       
    })   
    //donArea 
    DON.donCount.innerHTML = 10 - dCount
    DON.upDonCount.innerHTML = bottomPlayerP.donArea[0] ||0
    DON.sideDonCount.innerHTML = bottomPlayerP.donArea[1] ||0
    if (bottomPlayerP.donArea[0]>=1){DON.upDon.style.backgroundImage = `url(../../../images/DONface.png)`}else{DON.upDon.style.backgroundImage= "none"}
    if (bottomPlayerP.donArea[1]>=1){DON.sideDon.style.backgroundImage = `url(../../../images/DONface.png)`}else{DON.sideDon.style.backgroundImage= "none"}
    //opponent board
    if (topPlayerP) {
    if (first){
   DON.topPlayerArea.donMain.innerHTML = ""
   DON.topPlayerArea.donMain.innerHTML = `
    <div class="DON" id="td1">
    <div class="count" >
        <p><span class="donIMG">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span><span id="tdCount"></span></p>
    </div>
    </div>
    <div class="main" id="tm1">
    <div class="count">
        <p><span class="mainIMG">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span><span id="tmCount"></span></p>
    </div>
    </div>
`    
    DON.tmainmain = document.getElementById("tm1")
    DON.tmCount = document.getElementById("tmCount")
    DON.tmainmain.IsA = "Card"
    DON.tmainmain.Name = "Opponent Deck"
    DON.tmainmain.Type = "OD"
    DON.tmainmain.buttons = createButtons(["More"])
    DON.tmainmain.appendChild(DON.tmainmain.buttons)
    DON.tdondon = document.getElementById("td1")
    DON.tdCount = document.getElementById("tdCount")
    DON.tdondon.IsA = "Card"
    DON.tdondon.Name = "Opponent DON"
    DON.tdondon.buttons = createButtons(["More"])
    DON.tdondon.appendChild(DON.tdondon.buttons)
    DON.tdondon.Type = "ODON"
    }
    let tmCount = topPlayerP.mainDeck.length
    let tdCount = topPlayerP.donDeck[0]
    if (tmCount >=1) {DON.tmainmain.style.backgroundImage = `url('${DWM.sleeve}')`}
    else{DON.tmainmain.style.backgroundImage = "none"}
    if (tdCount >=1) {DON.tdondon.style.backgroundImage = `url('${DWM.donSleeve}')`}
    else{DON.dondon.style.backgroundImage = "none"}
    DON.tmCount.innerHTML = tmCount
    DON.tdCount.innerHTML = tdCount 
         //lifeTrash
    DON.topPlayerArea.lifeTrash.innerHTML = ""
    let tlCount = topPlayerP.life.length
    let ttCount = topPlayerP.trash.length
    DON.topPlayerArea.lifeTrash.innerHTML = `
    <div class="life" id="tl1">
    <div class="count">
        <p><span class="heartIMG">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>${tlCount}</p>
    </div>
</div>
<div class="trash" id="tt1">
    <div class="count">
        <p><span class="trashIMG">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>${ttCount}</p>
    </div>
</div>
 `
     let tlife = document.getElementById("tl1")
     if (tlCount >=1) tlife.style.backgroundImage = `url('${DWM.sleeve}')`
     tlife.IsA = "Card"
     tlife.Name = "Life"
     tlife.Type ="Life"
     tlife.buttons = createButtons(["More"])
     let ttrash = document.getElementById("tt1")
     if (ttCount >=1) ttrash.style.backgroundImage = `url('${topPlayerP.trash[0].imgString}')`
     ttrash.IsA = "Card"
     ttrash.Name = "Trash"
     ttrash.Type ="Trash"
     ttrash.buttons = createButtons(["Search","More"])
     tlife.appendChild(tlife.buttons)
     ttrash.append(ttrash.buttons)
    }
       //hand 
    DON.topPlayerArea.hand.innerHTML = ""
    let thCount = topPlayerP.hand.length
    topPlayerP.hand.forEach(card =>{
        let divCard = document.createElement("div")
        if (card.faceUp[player]) {divCard.style.backgroundImage = `url('${card.imgString}')`}
        else {divCard.style.backgroundImage= `url(${DWM.sleeve})`}
        divCard.IsA = "Card"
        divCard.Type = "Opponent Hand"
        divCard.Name = ""
        divCard.buttons = createButtons(["Target","More"])
        divCard.appendChild(divCard.buttons)
        DON.topPlayerArea.hand.appendChild(divCard)
    })
       //charArea
    DON.topPlayerArea.characterArea.innerHTML = `<div class="count" style="top:0px; bottom:unset;">
    <p><span class="handIMG">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>${thCount}</p>
</div>`
    topPlayerP.playArea.forEach(card =>{
        let divCard = document.createElement("div")
        divCard.className = "CCard"
        if (card.rested) {divCard.className = "CCard rested"}
        if (card.faceUp[player]) {divCard.style.backgroundImage = `url('${card.imgString}')`}
        else {divCard.style.backgroundImage= `url(${DWM.sleeve})`}
        divCard.IsA = "Card"
        divCard.Type = "Opponent Play"
        divCard.Name = ""
        divCard.uniqueGameId = card.uniqueGameId
        divCard.buttons = createButtons(["Target","More"])
        divCard.appendChild(divCard.buttons)
        loadDON(card,divCard)
        DON.topPlayerArea.characterArea.insertAdjacentElement("afterbegin",divCard)       
    })
    //leaderArea
    DON.topPlayerArea.leaderStage.innerHTML = ""
    topPlayerP.leaderArea.forEach(card =>{
        let divCard = document.createElement("div")
        divCard.className = "LCard"
        if (card.rested){ divCard.className = "LCard rested"}
        if (card.faceUp[player]) {divCard.style.backgroundImage = `url('${card.imgString}')`}
        else {divCard.style.backgroundImage= `url(${DWM.sleeve})`}
        divCard.IsA = "Card"
        divCard.Type = "OP Leader"
        divCard.Name = ""
        divCard.uniqueGameId = card.uniqueGameId
        divCard.buttons = createButtons(["Target","More"])
        divCard.appendChild(divCard.buttons)
        loadDON(card,divCard)
        DON.topPlayerArea.leaderStage.appendChild(divCard)       
    })   
     //donArea 
    DON.tdonCount.innerHTML = 10 - topPlayerP.donDeck[0]
    DON.tupDonCount.innerHTML = topPlayerP.donArea[0] ||0
    DON.tsideDonCount.innerHTML = topPlayerP.donArea[1] ||0
    if (topPlayerP.donArea[0]>=1){DON.tupDon.style.backgroundImage = `url(../../../images/DONface.png)`}else{DON.tupDon.style.backgroundImage= "none"}
    if (topPlayerP.donArea[1]>=1){DON.tsideDon.style.backgroundImage = `url(../../../images/DONface.png)`}else{DON.tsideDon.style.backgroundImage= "none"}

   }catch(er){
        console.log(er)
        setTimeout(function(){loadBoard(true)},225)
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

function loadDON(card,divCard){
    if (card.attachedDON >=1){
        let lilDON = document.createElement("div")
        lilDON.className ="DONCard"
        lilDON.innerHTML = ` <div class="count" >
        <p><span class="donIMG">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>${card.attachedDON}</p>
        </div>`
        lilDON.style.backgroundImage = `url("../../../images/DONface.png")`
        divCard.appendChild(lilDON)
    }
}
let focusCard

function focus(card,op){
    card.buttons.style.opacity = op||"1"
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
        if (oldFocus != focusCard ){
            if (oldFocus){
            unfocus(oldFocus)
            }
            focus(focusCard, targeting.active && "0" || "1")
        }
})
window.addEventListener("click", (event)=>{
    if (!targeting.active){
        let allSelected = document.elementsFromPoint(event.pageX, event.pageY) 
        let button = allSelected.filter(thing => thing.IsA == "Button")[0]
        if (button) {button.execute()}
    }else{
        if (targeting.reason =="attachingDON"){
            let allSelected = document.elementsFromPoint(event.pageX, event.pageY) 
            let divCard = allSelected.filter(thing => thing.IsA == "Card")[0]
            if (divCard) attachDonTo(divCard)
        }else if (targeting.reason =="unDON"){
            console.log("recieved")
            let allSelected = document.elementsFromPoint(event.pageX, event.pageY) 
            let divCard = allSelected.filter(thing => thing.IsA == "Card")[0]
            if (divCard) unDonFrom(divCard)
        }
    }
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
    let card = PlayerOBJ.gameParts[place][spot]
    let name = card.name
    PlayerOBJ.gameParts.donArea[1] += card.attachedDON
    card.attachedDON = 0
    DWM.sendCardTo(PlayerOBJ.gameParts,"trash",place,spot,0, f)
    let AR = {}; AR[`player${player}`] = {
        gameParts: {
            playArea: PlayerOBJ.gameParts.playArea,
            hand: PlayerOBJ.gameParts.hand,
            trash : PlayerOBJ.gameParts.trash,
            donArea: PlayerOBJ.gameParts.donArea
        }
    }
    await UpdateData(thisGame.id, AR)
    await AddChatToLog(thisGame.id,thisGame.chatLog,`${PlayerOBJ.name} trashed ${name} from ${place}.`, "Server")
}
async function drawDonCard(dCount,bottomPlayerP,count) {
    bottomPlayerP = thisGame["player"+player].gameParts
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
// DON Area
DON.donAreaControls.rest.onclick = async function(){
 let count = Number(DON.donAreaControls.restNum.value)
 console.log(count)
 let bottomPlayerP = thisGame["player"+player].gameParts
 if (count && count >=1 && count <=bottomPlayerP.donArea[0]){
   bottomPlayerP.donArea[0] = bottomPlayerP.donArea[0]- count
   bottomPlayerP.donArea[1] = bottomPlayerP.donArea[1] + count
    let AR = {}; AR[`player${player}`] = {
 gameParts: {
   donArea: bottomPlayerP.donArea,
   }
 }
 await UpdateData(thisGame.id, AR)
 await AddChatToLog(thisGame.id,thisGame.chatLog,`${PlayerOBJ.name} rested ${count} DON!!`,"Server")
 }
 
}
 DON.donAreaControls.unrest.onclick = async function(){
    let count = Number(DON.donAreaControls.unrestNum.value)
    let bottomPlayerP = thisGame["player"+player].gameParts
    if (count && count >=1 && count <=bottomPlayerP.donArea[1]){
      bottomPlayerP.donArea[1] = bottomPlayerP.donArea[1] - count
      bottomPlayerP.donArea[0] = bottomPlayerP.donArea[0] + count
       let AR = {}; AR[`player${player}`] = {
    gameParts: {
      donArea: bottomPlayerP.donArea,
      }
    }
     await UpdateData(thisGame.id, AR)
    await AddChatToLog(thisGame.id,thisGame.chatLog,`${PlayerOBJ.name} unrested ${count} DON!!`,"Server")
    }
}

DON.donAreaControls.return.onclick = async function(){
    let count = Number(DON.donAreaControls.returnNum.value)
    let bottomPlayerP = thisGame["player"+player].gameParts
    if (count && count >=1 && count <=bottomPlayerP.donArea[1]){
      bottomPlayerP.donArea[1] = bottomPlayerP.donArea[1] - count
      bottomPlayerP.donDeck[0] = bottomPlayerP.donDeck[0] + count
       let AR = {}; AR[`player${player}`] = {
    gameParts: {
      donArea: bottomPlayerP.donArea,
      donDeck: bottomPlayerP.donDeck
      }
    }
     await UpdateData(thisGame.id, AR)
    await AddChatToLog(thisGame.id,thisGame.chatLog,`${PlayerOBJ.name} returned -${count} DON!!`,"Server")
    }
}
DON.donAreaControls.unrestAll.onclick = async function(){
    let count = Number(DON.donAreaControls.returnNum.value)
    let bottomPlayerP = thisGame["player"+player].gameParts
    bottomPlayerP.donArea[0]= 10 - bottomPlayerP.donDeck[0]
    bottomPlayerP.donArea[1]=0
    bottomPlayerP.playArea.forEach(card=> card.attachedDON = 0)
    bottomPlayerP.leaderArea.forEach(card=> card.attachedDON = 0)
    let AR = {}; AR[`player${player}`] = {
    gameParts: {
      donArea: bottomPlayerP.donArea,
      donDeck: bottomPlayerP.donDeck,
      playArea: bottomPlayerP.playArea,
      leaderArea: bottomPlayerP.leaderArea
      }
    }
    await UpdateData(thisGame.id, AR)
    await AddChatToLog(thisGame.id,thisGame.chatLog,`${PlayerOBJ.name} unrested ${count} DON!!`,"Server")
}

DON.donAreaControls.attach.onclick = async function(){
    if (!targeting.active){
        targeting.active = true
        targeting.reason = "attachingDON"
        DON.donAreaControls.attach.style.backgroundColor = "#E33"
    }else if(targeting.reason=="attachingDON"){
        targeting.active = false
        DON.donAreaControls.attach.style.backgroundColor = "#DDD"
    }
}
DON.donAreaControls.unattach.onclick = async function(){
    if (!targeting.active){
        targeting.active = true
        targeting.reason = "unDON"
        DON.donAreaControls.unattach.style.backgroundColor = "#E33"
    }else if(targeting.reason=="unDON"){
        targeting.active = false
        DON.donAreaControls.unattach.style.backgroundColor = "#DDD"
    }
}
async function attachDonTo(divCard){
    let card = PlayerOBJ.gameParts.playArea.find(card => card.uniqueGameId == divCard.uniqueGameId) ||PlayerOBJ.gameParts.leaderArea.find(card => card.uniqueGameId == divCard.uniqueGameId)
    let count = Number(DON.donAreaControls.attachNum.value)
    if (PlayerOBJ.gameParts.donArea[0]>= count) {
        card.attachedDON += count
        PlayerOBJ.gameParts.donArea[0] -= count
        console.log(card)
        let AR = {}; AR[`player${player}`] = {
            gameParts: {
            playArea: PlayerOBJ.gameParts.playArea,
            leaderArea: PlayerOBJ.gameParts.leaderArea,
            donArea: PlayerOBJ.gameParts.donArea
            }
            }
            await UpdateData(thisGame.id, AR)
            await AddChatToLog(thisGame.id,thisGame.chatLog,`${PlayerOBJ.name} attached ${count} DON!! to ${card.name}`,"Server")
    }
}
async function unDonFrom(divCard){
    let card = PlayerOBJ.gameParts.playArea.find(card => card.uniqueGameId == divCard.uniqueGameId) ||PlayerOBJ.gameParts.leaderArea.find(card => card.uniqueGameId == divCard.uniqueGameId)
    let count = Number(DON.donAreaControls.unattachNum.value)
    console.log(card,count)
    if (card.attachedDON>= count) {
        card.attachedDON -= count
        PlayerOBJ.gameParts.donArea[0] += count
        let AR = {}; AR[`player${player}`] = {
            gameParts: {
            playArea: PlayerOBJ.gameParts.playArea,
            leaderArea: PlayerOBJ.gameParts.leaderArea,
            donArea: PlayerOBJ.gameParts.donArea
            }
            }
            await UpdateData(thisGame.id, AR)
            await AddChatToLog(thisGame.id,thisGame.chatLog,`${PlayerOBJ.name} unattached ${count} DON!! from ${card.name}`,"Server")
    }
}


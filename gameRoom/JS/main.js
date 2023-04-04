import {dkB} from "../../JS/deckBuildingModule.js";
import { DWM } from "./realDeckworkModule.js";
import { GetAllCards, GetGameWithXId, GetGamesWithXPlayers, UploadCard, RequestToJoinGame, AddChatToLog, UpdateData,GetChatLogLength} from "../../JS/fauna.js";
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
let Cards = await GetAllCards();

let  targeting = {
    active:false,
    reason: false,
    strength: 0,
}
let superFocus ={

}
let oldSuperFocus = {
    uniqueGameId: "",
    owner: "",
    location: "",
}
let speep
let reordering
let deb = false
let DON = {
    gameLog: document.getElementById("gameLog"),
    gameLogMain:document.getElementById("gameLogMain"),
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
    rez: document.getElementById("rez"),
    gameOptions: document.getElementById("gameOptions"),
    gameButtons: document.getElementById("gameButtons"),
    UAC: document.getElementById("UAC"),
    MH: document.getElementById("MH"),
    RD: document.getElementById("RD"),
    ET: document.getElementById("ET"),
    cardOptions: document.getElementById("cardOptions")
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
    window.location.replace("../../index.html?error="+"404")
}

function getPeep(divCard,card){
    if(!card || !divCard){return false}
    if (card.faceUp[1] != card.faceUp[2]){
        let peep = document.createElement("div")
        peep.className = "peepin"
        peep.innerHTML = `<span class="eyeIMG">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span>`
        divCard.appendChild(peep)
        return peep
    }
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
        target: {
            owner: false,
            uniqueGameId: false,
            color: "#000"
        },
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
function catchOSF(owner,area,divCard,card){
    if (owner==oldSuperFocus.owner && area == oldSuperFocus.area && divCard.uniqueGameId == oldSuperFocus.uniqueGameId){
        setSuperFocus(divCard,card)
        return true
    }
    return false
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
let opPlayer = (player==1 &&2) || 1
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
        let newThisGame = await GetGameWithXId(gameID)
        if (localChatLog.length != newThisGame.chatLog.length){
            thisGame = newThisGame
            PlayerOBJ = thisGame["player"+player]
            console.log(thisGame.chatLog, PlayerOBJ)
            loadBoard()
        }
    }
},118)
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
function interpertTargetDataThisPlayer(divCard,p,np,num2){
    if (p.target && p.target.owner == player){
        if (p.target.uniqueGameId == divCard.uniqueGameId) {
            divCard.style.border = `1vh solid  ${p.target.color}`
        }
    }
    if (np && np.target && np.target.owner == player){
        if (np.target.uniqueGameId == divCard.uniqueGameId) {
            divCard.style.border.style = `1vh solid  ${np.target.color}`
        }
    }

}
function interpertTargetDataOtherPlayer(divCard,p,np,num2){
    if (p.target && p.target.owner == num2){
        if (p.target.uniqueGameId == divCard.uniqueGameId) {
            divCard.style.border = `1vh solid  ${p.target.color}`
        }
    }
    if (np && np.target && np.target.owner == num2){
        if (np.target.uniqueGameId == divCard.uniqueGameId) {
            divCard.style.border = `1vh solid  ${np.target.color}`
        }
    }

}
function loadBoard(first){
   try{
   updateChatLog()
   let bottomPlayerP = thisGame["player"+player].gameParts
   if (!PlayerOBJ.initiated){ promptInitiatePlayer() }
   let newPlayer = 2
   if (player==2){newPlayer=1}
   let topPlayerP = thisGame["player"+newPlayer]
   if (topPlayerP) topPlayerP = topPlayerP.gameParts
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
    console.log(DON.mainmain)
    console.log("cool")
    DON.mainmain.buttons.More.execute = function(){
        setSuperFocus(DON.mainmain,bottomPlayerP.mainDeck)
    }
    DON.mainmain.buttons["Flip Top"].execute = async function(){
        PlayerOBJ.gameParts.mainDeck[0].faceUp = {1:!PlayerOBJ.gameParts.mainDeck[0].faceUp[player], 2:!PlayerOBJ.gameParts.mainDeck[0].faceUp[player]}
        let AR = {}; AR[`player${player}`] = {
            gameParts: {
                mainDeck: PlayerOBJ.gameParts.mainDeck,
            }
        }
        await UpdateData(thisGame.id, AR)
        await AddChatToLog(thisGame.id,thisGame.chatLog,`${PlayerOBJ.name} flipped the top card of their main deck.`, "Server")
    }
       console.log(DON.mainmain)
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
    if (mCount >=1) {
        DON.mainmain.style.backgroundImage = `url('${DWM.sleeve}')`
        if (bottomPlayerP.mainDeck[0].faceUp[`${player}`]){
            DON.mainmain.style.backgroundImage = `url('${bottomPlayerP.mainDeck[0].imgString}')`
        }
    }
    else{DON.mainmain.style.backgroundImage = "none"}
    if (dCount >=1) {DON.dondon.style.backgroundImage = `url('${DWM.donSleeve}')`}
    else{DON.dondon.style.backgroundImage = "none"}
    DON.mCount.innerHTML = mCount
    DON.dCount.innerHTML = dCount
    if (speep){speep.remove()}
    speep = getPeep(DON.mainmain, bottomPlayerP.mainDeck[0])
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
     if (lCount >=1) {
        life.style.backgroundImage = `url('${DWM.sleeve}')`
        if (bottomPlayerP.life[0].faceUp[`${player}`]){
            life.style.backgroundImage = `url('${bottomPlayerP.life[0].imgString}')`
        }
    }
    getPeep(life, bottomPlayerP.life[0])
     life.IsA = "Card"
     life.Name = "Life"
     life.Type ="Life"
     life.buttons = createButtons(["Peep 1","Draw","More"])
     life.buttons["Peep 1"].execute = async function(){
        PlayerOBJ.gameParts.life[0].faceUp[player] = true
        let AR = {}; AR[`player${player}`] = {gameParts: {life: PlayerOBJ.gameParts.life}}
        await UpdateData(thisGame.id, AR)
        await AddChatToLog(thisGame.id,thisGame.chatLog,`${PlayerOBJ.name} peeped the top card of his life.`, "Server")
  
     }
     let trash = document.getElementById("t1")
     if (tCount >=1) trash.style.backgroundImage = `url('${bottomPlayerP.trash[0].imgString}')`
     trash.IsA = "Card"
     trash.Name = "Trash"
     trash.Type ="Trash"
     trash.buttons = createButtons(["Search","More"])
     trash.buttons.Search.execute = searchTrash
     life.appendChild(life.buttons)
     life.buttons.Draw.execute = drawFromLife
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
        divCard.uniqueGameId = card.uniqueGameId
        interpertTargetDataThisPlayer(divCard,PlayerOBJ,thisGame[`player${newPlayer}`],newPlayer)
        divCard.buttons = createButtons(["Play","Trash","More"])
        divCard.appendChild(divCard.buttons)
        divCard.buttons.Play.execute = function(){
                playFromHand(card.uniqueGameId)
        }
        divCard.buttons.Trash.execute = function(){
            trashFromPH("hand",card.uniqueGameId)
        }
        divCard.buttons.More.execute = function(){
            setSuperFocus(divCard,card)
        }
        catchOSF(player,"hand",divCard,card)
        DON.bottomPlayerArea.hand.appendChild(divCard)
        getPeep(divCard,card)
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
        interpertTargetDataThisPlayer(divCard,PlayerOBJ,thisGame[`player${newPlayer}`],newPlayer)
        divCard.buttons = createButtons(["Rest","Trash","More"])
        divCard.appendChild(divCard.buttons)
        divCard.buttons.More.execute = async function(){
                setSuperFocus(divCard,card)
        }
        divCard.buttons.Rest.execute = async function(){
            rest(divCard,card,true,bottomPlayerP)
        }
        divCard.buttons.Trash.execute = async function(){
            trashFromPH("playArea",card.uniqueGameId)
        }
        loadDON(card,divCard)
        getPeep(divCard,card)
        catchOSF(player,"playArea",divCard,card)
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
        interpertTargetDataThisPlayer(divCard,PlayerOBJ,thisGame[`player${newPlayer}`],newPlayer)
        divCard.buttons = createButtons(["Rest","Highlight","More"])
        divCard.appendChild(divCard.buttons)
        divCard.buttons.Highlight.execute =  function(){ f_target(card,player, "#FC0")}
        divCard.buttons.Rest.execute = async function(){
                rest(divCard,card,false,bottomPlayerP)
        }
        loadDON(card,divCard)
        getPeep(divCard,card)
        catchOSF(player,"InLeader",divCard,card)
        DON.bottomPlayerArea.leaderStage.appendChild(divCard)       
    })   
    //donArea 
    DON.donCount.innerHTML = 10 - dCount
    DON.upDonCount.innerHTML = bottomPlayerP.donArea[0] ||0
    DON.sideDonCount.innerHTML = bottomPlayerP.donArea[1] ||0
    if (bottomPlayerP.donArea[0]>=1){DON.upDon.style.backgroundImage = `url(../../../images/DONface.png)`}else{DON.upDon.style.backgroundImage= "none"}
    if (bottomPlayerP.donArea[1]>=1){DON.sideDon.style.backgroundImage = `url(../../../images/DONface.png)`}else{DON.sideDon.style.backgroundImage= "none"}
    //opponent board
      console.log(topPlayerP)
    if (topPlayerP && thisGame["player"+newPlayer].initiated) {
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
    let tmCount = topPlayerP.mainDeck.length
    let tdCount = topPlayerP.donDeck[0]
    if (tmCount >=1) {DON.tmainmain.style.backgroundImage = `url('${DWM.sleeve}')`}else{DON.t}
    if (topPlayerP.mainDeck[0].faceUp[`${player}`]){
        DON.tmainmain.style.backgroundImage = `url('${topPlayerP.mainDeck[0].imgString}')`
    }
    if (tdCount >=1) {DON.tdondon.style.backgroundImage = `url('${DWM.donSleeve}')`}
    else{DON.tdondon.style.backgroundImage = "none"}
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
     ttrash.buttons.Search.execute =  searchOpponentTrash
     tlife.appendChild(tlife.buttons)
     ttrash.append(ttrash.buttons)
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
        divCard.uniqueGameId = card.uniqueGameId
        interpertTargetDataOtherPlayer(divCard,PlayerOBJ,thisGame[`player${newPlayer}`],newPlayer)
        divCard.buttons = createButtons(["Target","More"])
        divCard.buttons.Target.execute =  function(){ f_target(card,newPlayer)}
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
        interpertTargetDataOtherPlayer(divCard,PlayerOBJ,thisGame[`player${newPlayer}`],newPlayer)

        divCard.buttons = createButtons(["Target","More"])
        divCard.buttons.Target.execute = function(){f_target(card,newPlayer)}
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
        interpertTargetDataOtherPlayer(divCard,PlayerOBJ,thisGame[`player${newPlayer}`],newPlayer)
        divCard.buttons = createButtons(["Target","More"])
        divCard.buttons.Target.execute = function(){f_target(card,newPlayer)}
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
}
   }catch(er){
        console.log(er)
        setTimeout(function(){loadBoard(true)},225)
   }
  }
  async function f_target(card,newPlayer,color){
    if (deb) return false
    deb = true
    if (PlayerOBJ.target.owner == newPlayer && PlayerOBJ.target.uniqueGameId == card.uniqueGameId){
        if (PlayerOBJ.target.owner){
            f_target(false,false,false)
        }
        deb=false
        return false
    }
    PlayerOBJ.target = {
        owner: newPlayer,
        uniqueGameId: card.uniqueGameId,
        color: color || "#E11"
    }
    let AR = {}; AR[`player${player}`] = {
        target: PlayerOBJ.target
    }
    await UpdateData(thisGame.id, AR)
    await AddChatToLog(thisGame.id,thisGame.chatLog,`${PlayerOBJ.name} targeted a card.`)
    deb = false
}
async function rest(divCard,card,C,bottomPlayerP){
    if(deb){return false}
    deb = true
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
    deb = false  
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
        if (!superFocus.divCard){
            if (oldFocus != focusCard ){
                if (oldFocus){
                unfocus(oldFocus)
                }
                focus(focusCard, targeting.active && "0" || "1")
            }
        }else {
            if (oldFocus != focusCard ){
                if (oldFocus){
                unfocus(oldFocus)
                }
                focusCard.buttons.style.opacity = "1"
            }          
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
async function drawFromLife(spot,count,face,destination){    
    if(deb){return false}
    count = count|| 1
    deb =true
        let f = face || {}
        if (!face) f[player] = true 
        console.log(f)
        let x = 0
        do {
            DWM.sendCardTo(PlayerOBJ.gameParts,destination||"hand","life",spot,0, f)
            x +=1
        }while(x<count)
        let AR = {}; AR[`player${player}`] = {
            gameParts: {
                life: PlayerOBJ.gameParts.life,
            }
        }
        AR[`player${player}`]["gameParts"][destination||"hand"] = PlayerOBJ.gameParts[destination||"hand"]
        await UpdateData(thisGame.id, AR)
        await AddChatToLog(thisGame.id,thisGame.chatLog,`${PlayerOBJ.name} drew ${count} card from life.`, "Server")
        deb=false
    }
async function mainDeckDrawFrom(spot,count,face,destination){    
if(deb){return false}
count = count|| 1
deb =true
    let f = face || {}
    if (!destination){
        destination = "hand"
    }
    console.log("destination")
    if (destination=="hand"){
        f[player] = true
    }
    let x = 0
    do {
        DWM.sendCardTo(PlayerOBJ.gameParts,destination,"mainDeck",spot,0, f)
        x +=1
    }while(x<count)
    let AR = {}; AR[`player${player}`] = {
        gameParts: {
            mainDeck: PlayerOBJ.gameParts.mainDeck,
        }
    }
    AR[`player${player}`]["gameParts"][destination||"hand"] = PlayerOBJ.gameParts[destination||"hand"]
    await UpdateData(thisGame.id, AR)
    await AddChatToLog(thisGame.id,thisGame.chatLog,`${PlayerOBJ.name} drew ${count} card to ${destination||"hand"}.`, "Server")
    deb=false
}

async function playFromHand(uniqueGameId){
    if(deb){return false}
    deb =true
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
    deb=false
}
async function trashFromPH(place,uniqueGameId){
    if(deb){return false}
    deb =true
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
    deb = false
}
async function drawDonCard(dCount,bottomPlayerP,count) {
    if(deb){return false}
    deb =true
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
    deb = false
}
// DON Area
DON.donAreaControls.rest.onclick = async function(){
    if(deb){return false}
    deb =true
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
 deb = false
}
 DON.donAreaControls.unrest.onclick = async function(){
    if(deb){return false}
    deb =true
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
    deb =false
}

DON.donAreaControls.return.onclick = async function(){
    if(deb){return false}
    deb =true
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
    deb = false
}
DON.donAreaControls.unrestAll.onclick = async function(){
    if(deb){return false}
    deb =true
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
    await AddChatToLog(thisGame.id,thisGame.chatLog,`${PlayerOBJ.name} set all DON!! cards as active`,"Server")
    deb = false
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
    if(deb){return false}
    deb =true
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
    deb = false
}
async function unDonFrom(divCard){
    if(deb){return false}
    deb =true
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
    deb =false
}

let rez = false
DON.rez.onclick = function(){
    rez = !rez
    if (rez){
        DON.gameOptions.style.height = "calc(75vh - 24px)"
        DON.gameLogMain.style.top = "75vh"
        DON.gameLogMain.style.height = "calc(25vh - 30px)"
        DON.gameLog.style.height = "calc(25vh - 30px)"
        DON.gameButtons.style.minWidth = "10%"
        DON.cardDisplay.style.maxWidth = "90%"
        DON.gameOptions.style.width = "calc(100vw - 126vh) "
    }else{
        DON.gameOptions.style.height = "calc(49vh - 24px)"
        DON.gameLogMain.style.top = "50vh"
        DON.gameLogMain.style.height = "48vh"
        DON.gameLog.style.height = "48vh"
        DON.gameButtons.style.minWidth = "30%"
        DON.cardDisplay.style.maxWidth = "70%"       
    }
}


async function unrestAllGuys(){
    console.log(deb)
    if (deb) return false
    deb = true
    let GP = PlayerOBJ.gameParts
    let GPC = PlayerOBJ.gameParts.playArea
    let GPL = PlayerOBJ.gameParts.leaderArea
    console.log(GPC)
    GPC.forEach(card=>{card.rested=false})
    GPL.forEach(card=>{card.rested=false})
    let AR
    AR = {}; AR[`player${player}`] = {gameParts:{characterArea:[], leaderArea:[]}}
    AR[`player${player}`].gameParts.playArea = GP.playArea
    AR[`player${player}`].gameParts.leaderArea = GP.leaderArea
    await UpdateData(thisGame.id, AR)
    await AddChatToLog(thisGame.id,thisGame.chatLog,`${PlayerOBJ.name} unrested their board.`, "Server")   
    deb = false
}
async function mulligan(){
    if (deb) return false
    deb = true
    let GP = PlayerOBJ.gameParts
    let GPH = PlayerOBJ.gameParts.hand
    let GPD = PlayerOBJ.gameParts.mainDeck
    let x = GPH.length
    if (x>=1){
        do {
            console.log(GP, GPH)
            DWM.sendCardTo(GP,"mainDeck","hand",0,0, {1:false, 2:false})
        }while (GPH.length>=1)
        PlayerOBJ.gameParts.mainDeck = DWM.shuffleDeck(PlayerOBJ.gameParts.mainDeck); 
        PlayerOBJ.gameParts.mainDeck = DWM.shuffleDeck(PlayerOBJ.gameParts.mainDeck);
        GPD = PlayerOBJ.gameParts.mainDeck
        do {
            let f = {}
            f[player] = true
            DWM.sendCardTo(GP,"hand","mainDeck",0,0, f)
        }while (GPH.length<x)
        let AR
        AR = {}; AR[`player${player}`] = {gameParts:{}}
        AR[`player${player}`].gameParts.hand = GPH
        AR[`player${player}`].gameParts.mainDeck = GPD
        await UpdateData(thisGame.id, AR)
        await AddChatToLog(thisGame.id,thisGame.chatLog,`${PlayerOBJ.name} mulliganed ${x} cards in hand!`, "Server")   
    }

    deb = false
}
async function diceRoll(){
    if (deb) return false
    deb = true
    let d1 = Math.floor(Math.random()*6) + 1
    let d2 = Math.floor(Math.random()*6) + 1
    await AddChatToLog(thisGame.id,thisGame.chatLog,`${PlayerOBJ.name} rolled a ${d1+d2}.`, "Server")   
    deb = false
}
DON.UAC.addEventListener("click",unrestAllGuys)
DON.MH.addEventListener("click",mulligan)
DON.RD.addEventListener("click",diceRoll)
DON.ET.addEventListener("click",async function(){
    await AddChatToLog(thisGame.id,thisGame.chatLog,`${PlayerOBJ.name} ended their turn`, "Server")   
})
function unsetSuperFocus(setOld, owner, area, id){
    if (setOld){
        oldSuperFocus = {
            owner:owner,
            area:area,
            id:id
        }
    }
    if (!superFocus.divCard){return false}
    superFocus.divCard.style.boxShadow = "none"
    DON.cardOptions.innerHTML = ``
    superFocus = {}
    if (focusCard){
        focus(focusCard)
    }
}
function setSuperFocus(divCard,card){
    if (superFocus.divCard){
    unsetSuperFocus()
    }
    divCard.style.boxShadow = "0px 0px 5px red"
    if (divCard.Type == "MD"){
        DON.cardOptions.innerHTML = `
            <p>Reveal To: <input type="checkbox" id="auto" checked>Auto &nbsp;&nbsp;<input type="checkbox" id="you">You &nbsp;&nbsp;<input type="checkbox" id="opponent">Opponent &nbsp;&nbsp;</p>
            <h3>Count: <input type="number" id="CNN" value="1" class="long" >&nbsp;&nbsp;</h3>
        `
        DON.cardOptions.buttons = createButtons(["Draw to hand", "Draw to life","Reorder", "Shuffle","Draw to play area", "Draw to trash", "Finished"])
        let interpertCheckedData = function(){
            let auto = document.getElementById("auto").checked
            if (auto) return false
            let f = {}
            let you = document.getElementById("you").checked
            if (you) f[player] = true
            let op = document.getElementById("opponent").checked
            let opp = player==1 && 2 || 1
            if (op) f[opp] = true
            return f
        }
        DON.cardOptions.buttons["Draw to hand"].execute = async function(){
            let count = Number(document.getElementById("CNN").value) || 1
            mainDeckDrawFrom(0,count,interpertCheckedData())
        }
        DON.cardOptions.buttons["Draw to life"].execute = async function(){
            let count = Number(document.getElementById("CNN").value) || 1
            mainDeckDrawFrom(0,count,interpertCheckedData(),"life")
        }
        DON.cardOptions.buttons["Reorder"].execute = async function(){
            let count = Number(document.getElementById("CNN").value) || 1
            reorderMain(count)
        }
        DON.cardOptions.buttons["Shuffle"].execute = async function(){
            if (deb){return false}
            deb = true
            PlayerOBJ.gameParts.mainDeck.forEach(card=> card.faceUp = {})
            PlayerOBJ.gameParts.mainDeck = DWM.shuffleDeck(PlayerOBJ.gameParts.mainDeck)
            PlayerOBJ.gameParts.mainDeck = DWM.shuffleDeck(PlayerOBJ.gameParts.mainDeck)
            PlayerOBJ.gameParts.mainDeck = DWM.shuffleDeck(PlayerOBJ.gameParts.mainDeck)
            PlayerOBJ.gameParts.mainDeck = DWM.shuffleDeck(PlayerOBJ.gameParts.mainDeck)
            PlayerOBJ.gameParts.mainDeck = DWM.shuffleDeck(PlayerOBJ.gameParts.mainDeck)
            let AR = {}; AR[`player${player}`] = {
                gameParts: {
                    mainDeck: PlayerOBJ.gameParts.mainDeck,
                }
            }
                        await UpdateData(thisGame.id, AR)
            await AddChatToLog(thisGame.id,thisGame.chatLog,`${PlayerOBJ.name} shuffled their main deck.`, "Server")    
            deb = false
        }
        DON.cardOptions.buttons.Finished.execute = unsetSuperFocus
        DON.cardOptions.appendChild(DON.cardOptions.buttons)
    }else if (divCard.Type == "InPlay"){
        DON.cardOptions.innerHTML = `
        <p>Reveal To: <input type="checkbox" id="auto" checked>Auto &nbsp;&nbsp;<input type="checkbox" id="you">You &nbsp;&nbsp;<input type="checkbox" id="opponent">Opponent &nbsp;&nbsp;</p>
        <h3>Top?: <input type="checkbox" id="CNN" checked>&nbsp;&nbsp;</h3>
    `
        DON.cardOptions.buttons = createButtons(["Send to Main Deck","Send to Hand","Send to Life","Flip Card", "Highlight Blue"])
        DON.cardOptions.appendChild(DON.cardOptions.buttons)
        let interpertCheckedData = function(){
            let auto = document.getElementById("auto").checked
            if (auto) return false
            let f = {}
            let you = document.getElementById("you").checked
            if (you) f[player] = true
            let op = document.getElementById("opponent").checked
            let opp = player==1 && 2 || 1
            if (op) f[opp] = true
            return f
        }
        let spot = PlayerOBJ.gameParts.playArea.findIndex(c => c.uniqueGameId==divCard.uniqueGameId)
        let card = PlayerOBJ.gameParts.playArea[spot]
        DON.cardOptions.buttons["Send to Main Deck"].execute = async function(){
            if (deb){return false}
            deb = true
            let top = document.getElementById("CNN").checked
            let newSpot =  PlayerOBJ.gameParts.mainDeck.length
            if(top){newSpot=0}
            DWM.sendCardTo(PlayerOBJ.gameParts,"mainDeck","playArea",spot,newSpot,interpertCheckedData())
            PlayerOBJ.gameParts.donArea[1] +=card.attachedDON 
            card.attachedDON = 0
            let AR = {}; AR[`player${player}`] = {gameParts: {mainDeck: PlayerOBJ.gameParts.mainDeck,playArea: PlayerOBJ.gameParts.playArea,donArea: PlayerOBJ.gameParts.donArea}}
            await UpdateData(thisGame.id, AR)
            await AddChatToLog(thisGame.id,thisGame.chatLog,`${PlayerOBJ.name} sent ${card.name} from Play Area to the ${(top &&"top")||"bottom"} of their main deck.`, "Server")
            unsetSuperFocus()
            deb = false
        }
        DON.cardOptions.buttons["Send to Hand"].execute = async function(){
            if (deb){return false}
            deb = true
            let top = document.getElementById("CNN").checked
            let newSpot =  PlayerOBJ.gameParts.hand.length
            if(top){newSpot=0}
            DWM.sendCardTo(PlayerOBJ.gameParts,"hand","playArea",spot,newSpot,interpertCheckedData())
            PlayerOBJ.gameParts.donArea[1] +=card.attachedDON 
            card.attachedDON = 0
            let AR = {}; AR[`player${player}`] = {gameParts: {hand: PlayerOBJ.gameParts.hand,playArea: PlayerOBJ.gameParts.playArea,donArea: PlayerOBJ.gameParts.donArea}}
            await UpdateData(thisGame.id, AR)
            await AddChatToLog(thisGame.id,thisGame.chatLog,`${PlayerOBJ.name} sent ${card.name} from Play Area to their hand.`, "Server")
            unsetSuperFocus()
            deb = false
        }
        DON.cardOptions.buttons["Send to Life"].execute = async function(){
            if (deb){return false}
            deb = true
            let top = document.getElementById("CNN").checked
            let newSpot =  PlayerOBJ.gameParts.life.length
            if(top){newSpot=0}
            DWM.sendCardTo(PlayerOBJ.gameParts,"life","playArea",spot,newSpot,interpertCheckedData())
            PlayerOBJ.gameParts.donArea[1] +=card.attachedDON 
            card.attachedDON = 0
            let AR = {}; AR[`player${player}`] = {gameParts: {life: PlayerOBJ.gameParts.life,playArea: PlayerOBJ.gameParts.playArea,donArea: PlayerOBJ.gameParts.donArea}}
            await UpdateData(thisGame.id, AR)
            await AddChatToLog(thisGame.id,thisGame.chatLog,`${PlayerOBJ.name} sent ${card.name} from Play Area to their life. ( ${(top &&"top")||"bottom"})`, "Server")
            unsetSuperFocus()
            deb = false
        }
        DON.cardOptions.buttons["Flip Card"].execute = async function (){
            if (deb){return false}
            deb = true    
            let f = interpertCheckedData()
            card.faceUp = f
            if (!f) {
               if (card.faceUp[player]) {card.faceUp = {}}else{card.faceUp={1:true,2:true}}
            }  
             let AR = {}; AR[`player${player}`] = {gameParts: {playArea: PlayerOBJ.gameParts.playArea}}         
            await UpdateData(thisGame.id, AR)
            await AddChatToLog(thisGame.id,thisGame.chatLog,`${PlayerOBJ.name} flipped ${card.name}.`, "Server")
            unsetSuperFocus()
            deb = false
        }
        DON.cardOptions.buttons["Highlight Blue"].execute = function(){
            if (PlayerOBJ.target.owner == player && PlayerOBJ.target.uniqueGameId == card.uniqueGameId){
                f_target(false, false, false)
            } else {            f_target(card,player,"#3CF")        }

        }
    }else if(divCard.Type == "Hand") {
        DON.cardOptions.innerHTML = `
        <p>Reveal To: <input type="checkbox" id="auto" checked>Auto &nbsp;&nbsp;<input type="checkbox" id="you">You &nbsp;&nbsp;<input type="checkbox" id="opponent">Opponent &nbsp;&nbsp;</p>
        <h3>Top?: <input type="checkbox" id="CNN" checked>&nbsp;&nbsp;</h3>
    `
        DON.cardOptions.buttons = createButtons(["Send to Main Deck","Send to Life","Send to Play","Flip Card", "Highlight Blue"])    
        DON.cardOptions.appendChild(DON.cardOptions.buttons)
        let interpertCheckedData = function(){
            let auto = document.getElementById("auto").checked
            if (auto) return false
            let f = {}
            let you = document.getElementById("you").checked
            if (you) f[player] = true
            let op = document.getElementById("opponent").checked
            let opp = player==1 && 2 || 1
            if (op) f[opp] = true
            return f
        }
        let spot = PlayerOBJ.gameParts.hand.findIndex(c => c.uniqueGameId==divCard.uniqueGameId)
        let card = PlayerOBJ.gameParts.hand[spot]
        DON.cardOptions.buttons["Send to Main Deck"].execute = async function(){
            if (deb){return false}
            deb = true
            let top = document.getElementById("CNN").checked
            let newSpot =  PlayerOBJ.gameParts.mainDeck.length
            if(top){newSpot=0}
            DWM.sendCardTo(PlayerOBJ.gameParts,"mainDeck","hand",spot,newSpot,interpertCheckedData())
            PlayerOBJ.gameParts.donArea[1] +=card.attachedDON 
            card.attachedDON = 0
            let AR = {}; AR[`player${player}`] = {gameParts: {mainDeck: PlayerOBJ.gameParts.mainDeck,hand: PlayerOBJ.gameParts.hand,donArea: PlayerOBJ.gameParts.donArea}}
            await UpdateData(thisGame.id, AR)
            await AddChatToLog(thisGame.id,thisGame.chatLog,`${PlayerOBJ.name} sent ${card.name} from their hand to the ${(top &&"top")||"bottom"} of their main deck.`, "Server")
  
            unsetSuperFocus()
            deb = false
        }
        DON.cardOptions.buttons["Send to Life"].execute = async function(){
            if (deb){return false}
            deb = true
            let top = document.getElementById("CNN").checked
            let newSpot =  PlayerOBJ.gameParts.life.length
            if(top){newSpot=0}
            DWM.sendCardTo(PlayerOBJ.gameParts,"life","hand",spot,newSpot,interpertCheckedData())
            PlayerOBJ.gameParts.donArea[1] +=card.attachedDON 
            card.attachedDON = 0
            let AR = {}; AR[`player${player}`] = {gameParts: {hand: PlayerOBJ.gameParts.hand,life: PlayerOBJ.gameParts.life,donArea: PlayerOBJ.gameParts.donArea}}
            await UpdateData(thisGame.id, AR)
            await AddChatToLog(thisGame.id,thisGame.chatLog,`${PlayerOBJ.name} sent ${card.name} from their hand to their life.`, "Server")
            unsetSuperFocus()
            deb = false
        }
        DON.cardOptions.buttons["Send to Play"].execute = async function(){
            if (deb){return false}
            deb = true
            let top = document.getElementById("CNN").checked
            let newSpot =  PlayerOBJ.gameParts.playArea.length
            if(top){newSpot=0}
            DWM.sendCardTo(PlayerOBJ.gameParts,"playArea","hand",spot,newSpot,interpertCheckedData()|| {1:true,2:true})
            PlayerOBJ.gameParts.donArea[1] +=card.attachedDON 
            card.attachedDON = 0
            let AR = {}; AR[`player${player}`] = {gameParts: {hand: PlayerOBJ.gameParts.hand,playArea: PlayerOBJ.gameParts.playArea,donArea: PlayerOBJ.gameParts.donArea}}
            await UpdateData(thisGame.id, AR)
            await AddChatToLog(thisGame.id,thisGame.chatLog,`${PlayerOBJ.name} sent ${card.name} from their hand to their play Area.`, "Server")
            unsetSuperFocus()
            deb = false
        }
        DON.cardOptions.buttons["Flip Card"].execute = async function (){
            if (deb){return false}
            deb = true    
            let f = interpertCheckedData()
            card.faceUp = f
            if (!f) {
               if (card.faceUp[player]) {card.faceUp = {}}else{card.faceUp={1:true,2:true}}
            }  
             let AR = {}; AR[`player${player}`] = {gameParts: {hand: PlayerOBJ.gameParts.hand}}         
            await UpdateData(thisGame.id, AR)
            await AddChatToLog(thisGame.id,thisGame.chatLog,`${PlayerOBJ.name} flipped ${card.name} (in hand).`, "Server")
            unsetSuperFocus()
            deb = false
        }  
        DON.cardOptions.buttons["Highlight Blue"].execute = function(){
    f_target(card,player,"#3CF")       

        } 
    }
    superFocus = {card:card, divCard:divCard}
}

window.addEventListener('contextmenu', (event) => {
    event.preventDefault()
    unsetSuperFocus()
    if (targeting.active) {targeting.active = false}
    DON.donAreaControls.attach.style.backgroundColor = "#DDD"
    DON.donAreaControls.unattach.style.backgroundColor = "#DDD"

  })

  async function reorderMain(count){
    if (deb){return false}
    count = Math.min(PlayerOBJ.gameParts.mainDeck.length,count)
    deb = true
    let x = 0
    do {
        PlayerOBJ.gameParts.mainDeck[x].faceUp[player] = true
        x+=1
    }while (x<count)
    let newSearch = DWM.openSearch(PlayerOBJ.gameParts.mainDeck, player)
    let moves = []
    newSearch.divCards.forEach(divCard=>{
        divCard.buttons = createButtons(["Top","Bottom"])
        divCard.appendChild(divCard.buttons)
        divCard.IsA = "Card"
        divCard.Type = "shh"
        divCard.status = "Top"
        divCard.buttons.Top.execute = function() {
            let spot = PlayerOBJ.gameParts.mainDeck.findIndex(c => c.uniqueGameId==divCard.uniqueGameId)
        let card = PlayerOBJ.gameParts.mainDeck[spot]
            moves.push(`  #${spot + 1} to top`)
            newSearch.insertAdjacentElement("afterbegin",divCard)
            DWM.shiftCardTo(PlayerOBJ.gameParts,"mainDeck",spot,0)
            console.log(PlayerOBJ.gameParts.mainDeck)
        }
        divCard.buttons.Bottom.execute = function() {
            let spot = PlayerOBJ.gameParts.mainDeck.findIndex(c => c.uniqueGameId==divCard.uniqueGameId)
        let card = PlayerOBJ.gameParts.mainDeck[spot]
        moves.push(`  #${spot + 1} to bottom`)
            newSearch.insertAdjacentElement("beforeend",divCard)
            DWM.shiftCardTo(PlayerOBJ.gameParts,"mainDeck",spot,PlayerOBJ.gameParts.mainDeck.length)
            console.log(PlayerOBJ.gameParts.mainDeck)

        }
    })
    let closeBu = document.createElement("button")
    closeBu.innerHTML = "Save and Close"
    closeBu.onclick = async function(){
        let x = 0
        PlayerOBJ.gameParts.mainDeck.forEach(card=>{
            if (x>=count)card.faceUp = {}
            x+=1
        }
        )
        let AR = {}; AR[`player${player}`] = {
            gameParts: {
                mainDeck: PlayerOBJ.gameParts.mainDeck,
            }
        }
        
        newSearch.remove()
        await UpdateData(thisGame.id, AR)
        await AddChatToLog(thisGame.id,thisGame.chatLog,`${PlayerOBJ.name} peeked the top ${count} cards. He moved: ${moves.toString()}`, "Server")
        deb=false
    }
    newSearch.appendChild(closeBu)
    document.body.insertAdjacentElement("afterbegin",newSearch)
  }
  async function searchTrash(){
    if (deb){return false}
    deb = true
    let newSearch = DWM.openSearch(PlayerOBJ.gameParts.trash, player)
    let num = 0, names = []
    newSearch.divCards.forEach(divCard=>{
        divCard.buttons = createButtons(["Hand (up)", "Top Deck"])
        divCard.appendChild(divCard.buttons)
        divCard.IsA = "Card"
        divCard.Type = "shh"
        divCard.status = "Top"
        divCard.buttons["Hand (up)"].execute = function() {
            let spot = PlayerOBJ.gameParts.trash.findIndex(c => c.uniqueGameId==divCard.uniqueGameId)
            DON.bottomPlayerArea.hand.insertAdjacentElement("afterbegin",divCard)
            DWM.sendCardTo(PlayerOBJ.gameParts,"hand","trash",spot,0,{1:true,2:true})
            num +=1
        }
        divCard.buttons["Top Deck"].execute = function() {
            let spot = PlayerOBJ.gameParts.trash.findIndex(c => c.uniqueGameId==divCard.uniqueGameId)
            let card = PlayerOBJ.gameParts.trash[spot]
            divCard.remove()
            DWM.sendCardTo(PlayerOBJ.gameParts,"mainDeck","trash",spot,0,{1:true,2:true})
            names.push(card.name)
        }
    })

    let closeBu = document.createElement("button")
    closeBu.innerHTML = "Save and Close"
    closeBu.onclick = async function(){
        let x = 0
        let AR = {}; AR[`player${player}`] = {
            gameParts: {
                trash: PlayerOBJ.gameParts.trash,
                hand: PlayerOBJ.gameParts.hand,
                mainDeck: PlayerOBJ.gameParts.mainDeck
            }
        }
   
        newSearch.remove()
        await UpdateData(thisGame.id, AR)
        await AddChatToLog(thisGame.id,thisGame.chatLog,`${PlayerOBJ.name} moved ${num} cards from their trash to their hand (revealed), and [${names.toString()}] to main deck top.`, "Server")
        deb=false
    }
    newSearch.appendChild(closeBu)
    document.body.insertAdjacentElement("afterbegin",newSearch)
  }

  async function searchOpponentTrash(){
    if (deb){return false}
    deb = true
    let OPPOBJ = thisGame[`player${opPlayer}`]
    let newSearch = DWM.openSearch(OPPOBJ.gameParts.trash, player)
    let closeBu = document.createElement("button")
    closeBu.innerHTML = "Close"
    newSearch.divCards.forEach(divCard=>{
        divCard.buttons = createButtons([])
        divCard.appendChild(divCard.buttons)
        divCard.IsA = "Card"
        divCard.Type = "shh"
    }) 
    closeBu.style.backgroundColor = "#E65"
    closeBu.onclick = async function(){        
        newSearch.remove()
        deb = false
    }
    newSearch.appendChild(closeBu)
    document.body.insertAdjacentElement("afterbegin",newSearch)
  }
document.getElementById("STT").onclick = async function(){
    await unrestAllGuys()
    await DON.donAreaControls.unrestAll.onclick()
    await drawDonCard(dCount,PlayerOBJ.gameParts,2)
    await mainDeckDrawFrom(0,1)
}

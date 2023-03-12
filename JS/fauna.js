
const faunadb = window.faunadb
const q = faunadb.query
const secret = "fnAE91_9J0AAUytuSXc_AT-79VLF3usA3D3jPMS-"
var mg, domain, port, scheme
let endpoint = 'https://db.fauna.com/'
    scheme = 'https'
    domain = 'db.fauna.com'
    port =  443
    const client = new faunadb.Client({
        secret: secret,
        domain: domain,
        port: port,
        scheme: scheme,
})
async function getAllCards(){
    return (await client.query( q.Get( q.Ref( q.Collection("Cards"),"357784667303182419")) )).data 

}    
async function uploadCard(name,img,text,cards,color,creator){
    console.log("uploading")
    name = name || ""
    img = img || ""
    if (name.length <3) return {good:false, details:"Name must be at least three characters"}
    if (img.length <5) return {good:false, details: "Image link must be at least 5 characters"}
    if (color.length <3) return {good:false, details: "Color must be at least three characters"}
    if (creator.length <3) return {good:false, details: "Creator must be at least three characters"}
    if (text.length <1) text= null
    try {
        let oldData = cards
        console.log("data")
        let keys = Object.keys(oldData)
        console.log(keys)
        let newPart = {
            id: "CC01-" + String(keys.length),
            idBase10: keys.length,
            name: name,
            img: img,
            text: text,
            color: color,
            creator: creator,
        }
        console.log(newPart)
        oldData[String(keys.length)] = newPart
        console.log(oldData)
        let newData = (await client.query(  q.Replace( q.Ref( q.Collection("Cards"),"357784667303182419"),{ "ref": q.Ref(q.Collection("Cards"), "357784667303182419"),
        "ts": 1677549564230000,"data":oldData}) )).data
        console.log(newData)
        if (Object.keys(newData).length > keys.length) return {good:true, details: "Card has been successfully uploaded"}
        return {good:false,details:"Unknown Error"}
    }catch(error){
        return {good:false, details: error}
    }
}
async function getGamesWithXPlayers(x){
    let newStuff = (await client.query( q.Map(
        q.Paginate(
          q.Match(q.Index("gamesByPlayers"), x||0)
        ),
        q.Lambda(
          "game",
          q.Get(q.Var("game"))
        )
      )
    )).data
    console.log(newStuff)
    newStuff = newStuff.map(game => {
        game.data.ref = game.ref
        return game.data
    })
    console.log(newStuff)
    return newStuff
}
async function getGameWithXId(x){
    let newStuff = (await client.query( q.Map(
        q.Paginate(
          q.Match(q.Index("gamesById"), x||0)
        ),
        q.Lambda(
          "game",
          q.Get(q.Var("game"))
        )
      )
    )).data
    newStuff = newStuff.map(game => {
        game.data.id = game.ref.id || "chubb"
        return game.data
    })
    return newStuff[0]
}
async function updateData(refID,changes){
    await client.query(q.Update(q.Ref(q.Collection("Games"),refID), {data:changes}))
}
async function addChatToLog(refID, oldLog, chat,origin) {
  oldLog.push({text:chat, sender:origin})
  return updateData(refID, {chatLog:oldLog})
}
async function requestToJoinGame(refID){
  return (await client.query(
    await q.Call("addPlayerToGame", refID)
  ))
}
async function createGame(name) {
  console.log(await client.query(q.Select("lastGameId",
          q.Select("data",
          q.Get(q.Ref(q.Collection("Games"),"358110001113333847"))
          ))))
  let newGame = await client.query(q.Do(
    q.Create(
      q.Collection("Games"),
      { data: {
        players: 1,
        gameID: await q.Add(await q.Select("lastGameId",
          q.Select("data",
          q.Get(q.Ref(q.Collection("Games"),"358110001113333847"))
          )),1
        ),
        gameName: name || "OPTCC Game",
        chatLog: [],
        player1: {
          name: "Anonymous",
          playerID: 1,
          deckString: "No Deck Loaded...",
          initiated: false,
          gameParts: {
            mainDeck: [],
            playArea: [],
            donDeck: [],
            donArea: [],
            hand: [],
            trash: [],
            leaderArea: [],
            stageArea: [],
            life: [],
          }
        }
      } }
    ),
    q.Update(q.Ref(q.Collection("Games"),"358110001113333847"),{data: 
                                                                {lastGameId: await q.Add(await q.Select("lastGameId",
          q.Select("data",
          q.Get(q.Ref(q.Collection("Games"),"358110001113333847"))
          )),1
        )}})
  ))
  return newGame
}
async function getChatLogLength(id){
  return Number(await client.query(q.Call("getChatLogLength",id)))
}
export let GetAllCards = getAllCards, UploadCard = uploadCard, GetGamesWithXPlayers = getGamesWithXPlayers, GetGameWithXId = getGameWithXId, CreateGame = createGame,
RequestToJoinGame=requestToJoinGame, AddChatToLog = addChatToLog, UpdateData = updateData, GetChatLogLength = getChatLogLength

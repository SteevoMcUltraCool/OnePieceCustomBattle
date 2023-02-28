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
async function uploadCard(name,img,text,cards){
    console.log("uploading")
    name = name || ""
    img = img || ""
    if (name.length <3) return {good:false, details:"Name must be at least three characters"}
    if (img.length <5) return {good:false, details: "Image link must be at least 5 characters"}
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
export let GetAllCards = getAllCards, UploadCard = uploadCard
let DON = {
 cardNameInput: document.getElementById("cardName"), 
 cardImageLinkInput: document.getElementById("cardImageLink"), 
 cardTextInput: document.getElementById("cardText"), 
 cardColorInput: document.getElementById("cardColor"),
 cardCreatorInput:document.getElementById("cardCreator"),
 submitCardBu: document.getElementById("submitCard"),
 
 results: document.getElementById("results"),
}
import { GetAllCards, UploadCard } from "./fauna.js"
  

DON.submitCardBu.onclick = async function(){
    console.log(await GetAllCards())
    let results = await UploadCard(DON.cardNameInput.value, DON.cardImageLinkInput.value, DON.cardTextInput.value, await GetAllCards(), DON.cardColorInput.value, DON.cardCreatorInput.value)
    if (results.good) {
        DON.cardNameInput.value = ""
        DON.cardImageLinkInput.value = ""
        DON.cardTextInput.value = ""
        DON.results.innerHTML = "Card Successfully Uploaded! Hooray!"
        DON.results.style.backgroundColor = "rgb(150,250,200)"
    }else {
        DON.results.innerHTML = `There was an issue uploading the card!\n${results.details}`
        console.log(results)
        DON.results.style.backgroundColor = "rgb(250,100,50)"      
    }
}

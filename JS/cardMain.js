let DON = {
 cardNameInput: document.getElementById("cardName"), 
 cardImageLinkInput: document.getElementById("cardImageLink"), 
 cardTextInput: document.getElementById("cardText"), 
 submitCardBu: document.getElementById("submitCard")
}
import { GetAllCards, UploadCard } from "./fauna.js"

  

DON.submitCardBu.onclick = async function(){
    console.log(await GetAllCards())
    let results = await UploadCard(DON.cardNameInput.value, DON.cardImageLinkInput.value, DON.cardNameInput.value, await GetAllCards())
    if (results.good) {
        DON.cardNameInput.value = ""
        DON.cardImageLinkInput.value = ""
        DON.cardTextInput.value = ""
    }
}

let DON = {
    playBu: document.getElementById("play"),
    buildDeckBu: document.getElementById("buildDeck"),
    createCardBu: document.getElementById("createCard")
}
  DON.playBu.onclick= function(){
    window.location.replace("../html/play.html")
};DON.buildDeckBu.onclick= function(){
    window.location.replace("../html/deck.html")
};DON.createCardBu.onclick= function(){
    window.location.replace("../html/card.html")
}
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const error = Number(urlParams.get('error'))
console.log(urlParams)
console.log(error)
switch (Number(error)) {
    case 1: 
        console.log("Your most recent game was closed")
        break
    case 404:
        console.log("Could not find a recent game you were in.")
        break
}
let anim
document.getElementById("fatLuffy").onclick =function(){
    let sound = document.getElementById("boing")
    anim = true
    let x = 0
    let main = setInterval(function(){
        x -= (2 + Math.random())

        document.getElementById("fatLuffy").style.transform = `scale(${1.05 + Math.sin(x)/4})`
    },200)
    setTimeout(function(){
        clearInterval(main)
        anim = false
        document.getElementById("fatLuffy").style.transform = "scale(1)"
    },1000)
    sound.play()
}

document.getElementById("fatLuffy").onmouseenter =function(){
    document.getElementById("fatLuffy").style.transform = "scale(1.05)"
}
document.getElementById("fatLuffy").onmouseleave =function(){
    if (!anim){
        document.getElementById("fatLuffy").style.transform = "scale(1)"
    }
}

import { UserLogInbyPH } from "./fauna.js";
async function doStuff(){
let hash = localStorage.getItem('hash'), user = false
if (hash){
    user = await UserLogInbyPH(hash)
}
let p = document.createElement("p")
p.id = "userP"
if (user){
    p.innerHTML = `You are currently logged in as <a href="../html/profile.html">${user.username}</a>`
}else {
    p.innerHTML = `You are not logged in. <a href="../html/loginPage.html">Log in/Sign up</a>`
}

document.body.appendChild(p)
}
doStuff()

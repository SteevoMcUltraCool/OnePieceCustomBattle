let DON = {
    logoutButton: document.getElementById("logoutButton"),
    revealHashBu: document.getElementById("revealHashBu"),
    hashGoesHere: document.getElementById("hashGoesHere"),
    username: document.getElementById("username")
}

DON.logoutButton.onclick = function(){
    localStorage.removeItem("hash")
    window.location.replace("../index.html")
}
import { UserLogInbyPH } from "./fauna.js";
let hash = localStorage.getItem('hash'), user = false
if (hash){
    user = await UserLogInbyPH(hash)
}

let hashShow
DON.revealHashBu.onclick = function(){
    hashShow = !hashShow
    DON.hashGoesHere.innerHTML = (hashShow && hash) || "DO NOT SHARE YOUR HASH"
}
DON.username.innerHTML = "Welcome, " + user.username
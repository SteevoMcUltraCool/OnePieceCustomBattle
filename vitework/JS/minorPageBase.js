let DON = {
    backBu: document.getElementById("back"),

}
DON.backBu.onclick = function(){
    window.location.replace("../index.html")   
}
import { UserLogInbyPH } from "./fauna.js";
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
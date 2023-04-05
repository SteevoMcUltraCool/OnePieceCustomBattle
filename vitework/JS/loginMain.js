let DON = {
    hideShowbuttons: document.querySelectorAll(".pwShowToggle"),
    loginUser: document.getElementById("loginUser"),
    signupUser: document.getElementById("signupUser"),
    loginPass: document.getElementById("loginPass"),
    signupPass: document.getElementById("signupPass"),
    loginHash: document.getElementById("loginHash"),
    loginBu: document.getElementById("loginBu"),
    signupBu: document.getElementById("signupBu")
}
import { UserSignUp, UserLogInbyPH, UserLoginByUP } from "./fauna.js"
DON.hideShowbuttons.forEach(button => {
    button.onclick = function(){
        if (DON[button.value].type == "password"){
            DON[button.value].type = ""
        }else{DON[button.value].type = "password"}
    }
})
let deb = false

DON.loginBu.onclick = async function(){
    if (deb) return false
    deb = true
    if (DON.loginUser.value && DON.loginUser.value.length >= 1){
        let user = await UserLoginByUP(DON.loginUser.value, DON.loginPass.value)
        if (user){
          localStorage.setItem("hash",user.personalizedHash)
        window.location.replace("../index.html")   
        return true
        }
    }
    let user = await UserLogInbyPH(DON.loginHash.value)
    deb=false
    if (user){
    await localStorage.setItem("hash",user.personalizedHash)
    window.location.replace("../index.html")   
    return true
    }
    return false
}

DON.signupBu.onclick = async function(){
    if (deb) return false
    deb = true
    if ((DON.signupUser.value && DON.signupUser.value.length >= 1) && (DON.signupPass.value && DON.signupPass.value.length >= 1)){
        let user = await UserSignUp(DON.signupUser.value, DON.signupPass.value)
        deb=false
        if (user){
         localStorage.setItem("hash",user.personalizedHash)
        window.location.replace("../index.html")   
        return true
        }
    }
    deb = false
    return false
}
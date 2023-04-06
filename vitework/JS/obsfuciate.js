import { shift } from "./shift.js"
import { alphabet } from "./alphabet.js"
let d = {}
d.soupa = "jsLJLfTFogLLAIhTQT1GFX3adg6By1jRgbgzg3qL"
d.obsfuciate = function(str){
    let sTT = str.split("")
    let newStr = ""
    sTT.forEach(s =>{
        let upper = s != s.toLowerCase()
        s = s.toLowerCase()
        let spot = alphabet[0].findIndex(s1 => s1 == s)
        if (spot>=0){
            spot += shift
            if (spot >= alphabet[0].length){
                spot -= alphabet[0].length
            }
            let newS = alphabet[0][spot]
            if (upper){
                newS =  newS.toUpperCase()
            }
            newStr = newStr + newS
        }else {
            let upper = s != s.toLowerCase()
            s = s.toLowerCase()
            let spot = alphabet[1].findIndex(s1 => s1 == s)
            if (spot>=0){
                spot += shift
                if (spot >= alphabet[1].length){
                    spot -= alphabet[1].length
                }
                let newS = alphabet[1][spot]
                if (upper){
                    newS =  newS.toUpperCase()
                }
                newStr = newStr + newS
            } else{
                newStr = newStr + newS 
            } 
    }
})
    return newStr
}
d.unObsfuciate = function(str){
    let sTT = str.split("")
    let newStr = ""
    sTT.forEach(s =>{
        let upper = s != s.toLowerCase()
        s = s.toLowerCase()
        let spot = alphabet[0].findIndex(s1 => s1 == s)
        if (spot>=0){
            spot -= shift
            if (spot <0){
                spot += alphabet[0].length
            }
            let newS = alphabet[0][spot]
            if (upper){
                newS =  newS.toUpperCase()
            }
            newStr = newStr + newS
        }else {
            let upper = s != s.toLowerCase()
            s = s.toLowerCase()
            let spot = alphabet[1].findIndex(s1 => s1 == s)
            if (spot>=0){
                spot -= shift
                if (spot <0){
                    spot += alphabet[1].length
                }
                let newS = alphabet[1][spot]
                if (upper){
                    newS =  newS.toUpperCase()
                }
                newStr = newStr + newS
            } else{
                newStr = newStr + newS 
            } 
    }
    })
    return newStr
}

export let OBS = d
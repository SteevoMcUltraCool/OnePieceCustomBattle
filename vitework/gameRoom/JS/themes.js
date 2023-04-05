let dRoot = document.documentElement
let parent = document.getElementById("themeBTNS")
let themes = {
    "Night":{
        "--bgGradient": "linear-gradient(#080808,#102)",
        "--buttonGradient": "linear-gradient(90deg,#204,#204)",
        "--textColor": "#EEE",
        "--borderColor": "#AAA",
        "--shadowColor": "#333"
    },
    "Day":{
        "--bgGradient": "linear-gradient(#DDF,#BDF)",
        "--buttonGradient": "linear-gradient(90deg,#FDB,#FDB)",
        "--textColor": "#020202",
        "--borderColor": "#040404",
        "--shadowColor": "#FFC"
    },
}
let themeNames = Object.keys(themes)

function changeThemeTo(theme){
    let prop = Object.keys(theme)
    prop.forEach(prop =>{
        let val = theme[prop]
        dRoot.style.setProperty(prop,val)
    })
}
themeNames.forEach(name=>{
    let theme = themes[name]
    let bu = document.createElement("button")
    bu.innerHTML = name
    bu.onclick = function(){changeThemeTo(theme)}
    parent.appendChild(bu)
})
changeThemeTo(themes.Night)

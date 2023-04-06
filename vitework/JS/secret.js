import { OBS } from "./obsfuciate.js";
function SECRET(){
    return OBS.unObsfuciate(OBS.soupa)
}

export let APIKEY = SECRET
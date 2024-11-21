import { browser } from "$app/environment"
import { writable } from "svelte/store"
import { getQueryParam } from "./util.svelte"
import { notification } from "./notification"
import { site } from "../state/site.svelte"
import { testConnectionStatus } from "../connection/connection.svelte.js"

export function onLoad() {
    if (!browser) return

    setWindowFunctions()
    loadValidationDisabled()
    loadEruda()
}


let erudaLoaded = false
async function loadEruda() {
    if (erudaLoaded) return
    erudaLoaded = true

    const param = getQueryParam("eruda")
    if (param === "true") {
        console.log("Loading eruda.");

        if (!browser) return
        try {
            const script = document.createElement('script')
            script.src="https://cdn.jsdelivr.net/npm/eruda"
            document.body.append(script)
            script.onload = () => { 
                console.log("Initializing eruda...")
                //@ts-ignore
                eruda.init()
                notification("Eruda loaded.")
            }
        } catch (e) {
            console.log(`FAILED TO LOAD ERUDA:\n${e}`)
            testConnectionStatus()
        }
    }
}


async function loadValidationDisabled() {
    const param = getQueryParam("validationDisabled")
    if (param === "true") {
        disableValidation()
    }
}


function disableValidation() {
    console.log("[ALERT] Validation disabled")
    notification("All input validation disabled.")
    site.validationDisabled = true
}
function enableValidation() {
    console.log("[ALERT] Validation enabled")
    notification("All input validation enabled.")
    site.validationDisabled = false
}


let windowFunctionsSet = false
async function setWindowFunctions() {
    if (windowFunctionsSet) return
    windowFunctionsSet = true

    //@ts-ignore
    window.loadEruda = () => { loadEruda() }

    //@ts-ignore
    window.disableValidation = () => { disableValidation() }
    //@ts-ignore
    window.enableValidation = () => { enableValidation() }
}
import { site } from "../state/site.svelte.js"
import { onConditionMet } from "../util/util.svelte.js"
import {refreshAfterReconnection} from "$lib/code/connection/reconnect.svelte"


let pingCount = $state(0)
let pinging = false
export function testConnectionStatus() {
    if (pinging) return
    pinging = true
    
    try {
        async function runPing() {
            const pingSuccessful = await pingRequest()
            if (pingSuccessful) {
                clearInterval(intervalId)
                pinging = false

                site.isOnline = true
                pingCount = 0
                
                console.log(`Back online.`)
                await refreshAfterReconnection()
            } else {
                pingCount++
                site.isOnline = false
            }
        }

        runPing()
        const intervalId = setInterval(runPing, 3000)
    } finally {

    }
}

export function getConnectionPingCount() {
    return pingCount
}


export function onInternetConnection(callback: () => any) {
    return onConditionMet(() => site.isOnline, callback)
}


async function pingRequest(): Promise<boolean> {
    try {
        console.log(`Pinging server...`)
        const response = await fetch(`/api/v1/ping`, { method: "GET", credentials: "same-origin" })
        if (response.status === 502) throw "502"
        return true
    } catch (e) {
        console.log(`Server unavailable.`)
        return false
    }
}
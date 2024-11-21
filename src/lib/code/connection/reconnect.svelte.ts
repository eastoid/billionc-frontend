import {site} from "$lib/code/state/site.svelte";
import {notification} from "$lib/code/util/notification"
import {pr} from "$lib/code/util/util.svelte"


let lastRefreshed: number | null = null
let refreshing = false
export async function refreshAfterReconnection() {
    if (refreshing) return pr(`Already refreshing after reconnection`)
    refreshing = true

    if (site.lastOffline && site.lastOffline === lastRefreshed) return pr(`This disconnection was already refreshed.`)
    lastRefreshed = site.lastOffline

    try {
        console.log("Refreshing state after reconnection")

    } finally {
        refreshing = false
    }
}
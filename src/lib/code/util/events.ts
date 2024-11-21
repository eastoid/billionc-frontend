import { browser } from "$app/environment";
import { site } from "../state/site.svelte";
import { testConnectionStatus } from "../connection/connection.svelte.js";


let createdOnlineHandler = false
export function createOnlineEventHandler(): Function {
    if (!browser) return ()=>{}
    if (createdOnlineHandler) return ()=>{}

    function handleOnline() { testConnectionStatus() }
    function handleOffline() { testConnectionStatus() }

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)
    createdOnlineHandler = true

    return () => {
        window.removeEventListener("online", handleOnline)
        window.removeEventListener("offline", handleOffline)
        createdOnlineHandler = false
    }
}
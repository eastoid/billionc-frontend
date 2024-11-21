import {unixNow} from "$lib/code/util/text"


export const site = (() => {
    let isLoading: boolean = $state(true)
    let location: "boxes" | "site" | null = $state(null)

    let isMobile: boolean = $state(false)
    let isFirefox: boolean = $state(false)

    let isOnline = $state(true)
    let lastOffline: number | null = null

    let lightMode: boolean = $state(false)

    let breakpoint: Breakpoint = $state('default')

    return {
        // Is Loading
        get isLoading(): typeof isLoading {
            return isLoading
        },
        set isLoading(v: typeof isLoading) {
            isLoading = v
        },
        
        // Site location
        get location(): typeof location {
            return location
        },
        set location(v: typeof location) {
            location = v
        },

        get lightMode(): typeof lightMode {
            return lightMode
        },
        set lightMode(v: typeof lightMode) {
            lightMode = v
        },


        // Is mobile
        get isMobile(): typeof isMobile {
            return isMobile
        },
        set isMobile(v: typeof isMobile) {
            isMobile = v
        },

        // Is firefox
        get isFirefox(): typeof isFirefox {
            return isFirefox
        },
        set isFirefox(v: typeof isFirefox) {
            isFirefox = v
        },

        // Is app online
        get isOnline(): typeof isOnline {
            return isOnline
        },
        set isOnline(v: typeof isOnline) {
            if (v != isOnline) console.log(`[i] App is ${v ? "online" : "offline"}.`)
            if (!v) {
                lastOffline = unixNow()
            }
            isOnline = v
        },

        get lastOffline(): typeof lastOffline {
            return lastOffline
        },
        set lastOffline(v: typeof lastOffline) {
            lastOffline = v
        },

        get breakpoint(): typeof breakpoint {
            return breakpoint
        },
        set breakpoint(v: typeof breakpoint) {
            breakpoint = v
        },

        wipeAllState() {
            isLoading = true
            isMobile = false
        },
    }
})()
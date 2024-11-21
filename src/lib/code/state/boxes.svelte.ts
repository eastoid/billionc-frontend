import {unixNow} from "$lib/code/util/text"


export const boxes = (() => {
    let rsocketConnected: boolean = $state(false)
    let rsocketSessionId: number | null = $state(null)
    let rsocketReconnecting: boolean = $state(false)

    let test: string | null = $state("Init test.")

    let bits: { [key: number]: boolean } = $state({})
    let subscribedChunks: number[] = $state([])

    let clickCount: number | null = $state(null)
    let checkedCount: number | null = $state(null)

    return {
        get rsocket() {
            return {
                get sessionId() {
                    return rsocketSessionId
                },
                set sessionId(v: typeof rsocketSessionId) {
                    rsocketSessionId = v
                },

                get isReconnecting() {
                    return rsocketReconnecting
                },
                set isReconnecting(v: typeof rsocketReconnecting) {
                    rsocketReconnecting = v
                },

                get isConnected() {
                    return rsocketConnected
                },
                set isConnected(v: typeof rsocketConnected) {
                    rsocketConnected = v
                },
            }
        },

        get test() {
            return test
        },
        set test(v: typeof test) {
            test = v
        },

        get clickCount() {
            return clickCount
        },
        set clickCount(v: typeof clickCount) {
            clickCount = v
        },

        get checkedCount() {
            return checkedCount
        },
        set checkedCount(v: typeof checkedCount) {
            checkedCount = v
        },

        get bits() { return bits },
        setBits(v: typeof bits) {
            bits = v
        },
        setChunk(index: number, data: (1 | 0)[]) {
            const start = index * 200
            for (let i = 0; i < 200; i++) {
                const boxIndex = start + i
                bits[boxIndex] = data[i] ? true : false
            }
        },
        setBit(index: number, data: boolean) {
            bits[index] = data
        },
        removeRange(index: number, range: number) {
            for (let i = index; i < (index + range); i++) {
                delete bits[i]
            }
        },

        get subscribedChunks() { return subscribedChunks },
        set subscribedChunks(v: typeof subscribedChunks) { subscribedChunks =v },

        wipeAllState() {
        },
    }
})()
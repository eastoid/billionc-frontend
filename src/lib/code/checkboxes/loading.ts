import {boxes} from "$lib/code/state/boxes.svelte"
import {rsocket_send_requestResponse} from "$lib/code/connection/rsocket/rsocket"
import {delay, parseJsonOrNull} from "$lib/code/util/util.svelte"


export async function boxes_loadChunk(chunk: number): Promise<boolean> {
    if (!boxes.rsocket.isConnected) return false

    return rsocket_send_requestResponse(`${chunk}`, `gas`, {
        onNext(response: string, isComplete: boolean): any {
            if (response.startsWith("[")) {
                const json = parseJsonOrNull(response)
                boxes.setChunk(chunk, json)
                boxes.subscribedChunks.push(chunk)
            } else {
                console.log(`Failed to get box chunk ${chunk} - invalid json: ${response}`)
                return false
            }
            return true
        },
        onError(e: any) {
            console.log(`Failed to get box chunk ${chunk} - onError:`, e)
            return false
        }
    })
}


export async function boxes_unsubscribeChunk(chunk: number): Promise<boolean> {
    if (!boxes.rsocket.isConnected) return false
    if (!boxes.subscribedChunks.includes(chunk)) return false

    return rsocket_send_requestResponse(`${chunk}`, `unsub`, {
        onNext(response: string, isComplete: boolean): any {
            if (response === "ok") {
                const index = boxes.subscribedChunks.indexOf(chunk)
                boxes.subscribedChunks.splice(index, 1)
            }
            return true
        },
        onError(e: any) {
            console.log(`Failed to unsubscribe from box chunk ${chunk} - onError:`, e)
            return false
        }
    })
}
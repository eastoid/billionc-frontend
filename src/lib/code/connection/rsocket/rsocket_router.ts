import { notification } from "$lib/code/util/notification";
import {chunkIndexOf} from "$lib/code/checkboxes/util"
import {boxes} from "$lib/code/state/boxes.svelte"
import {parseBool, parseJsonOrNull} from "$lib/code/util/util.svelte"


async function handler_sessionId(msg: string) {

}

async function handler_mod(msg: string) {
    const split = msg.split(";")
    if (split.length !== 2) return console.log(`Invalid mod message`)

    const index= parseInt(split[0])
    const state = parseBool(split[1])
    if (state == null) return

    const chunk = chunkIndexOf(index)
    const chunkSubscribed = boxes.subscribedChunks.includes(chunk)

    if (chunkSubscribed) {
        boxes.setBit(index, state)
        if (boxes.clickCount != null) boxes.clickCount += 1
        if (boxes.checkedCount) state ? boxes.checkedCount += 1 : boxes.checkedCount -= 1
    }
}

async function handle_metadata(msg: string) {
    const json = parseJsonOrNull(msg)
    if (json == null || json.clickCount == null || json.checkCount == null) {
        console.log(`Server sent invalid json for metadata:`, msg)

        boxes.checkedCount = null
        boxes.clickCount = null
        return
    }

    const clickCount = parseInt(json.clickCount)
    const checkCount = parseInt(json.checkCount)

    if (clickCount == null || checkCount == null) {
        console.log(`Invalid metadata recieved - click count or checked count is invalid number:`, msg)
        boxes.clickCount = null
        boxes.checkedCount = null
    }

    boxes.clickCount = clickCount
    boxes.checkedCount = checkCount
}


// ROUTER
const handlers: { [key: string]: (msg: string) => Promise<void> } = {
    "sessionid": handler_sessionId,
    "mod": handler_mod,
    "metadata": handle_metadata,
}

export async function rsocket_handleMessage(message: string, route: string): Promise<boolean> {
    const handler = handlers[route]
    if (handler) {
        await handler(message)
        return true
    } else {
        console.log(`Got invalid route from subscription: ${route}\nNo handler found.`)
        notification(`Failed to process server message: Invalid route`, "boxes")
        return false
    }
}
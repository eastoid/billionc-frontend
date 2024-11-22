import {rsocket_send_requestResponse} from "$lib/code/connection/rsocket/rsocket"
import {boxes} from "$lib/code/state/boxes.svelte"
import {notification} from "$lib/code/util/notification"
import {parseJsonOrNull} from "$lib/code/util/util.svelte"


export async function updateCheckbox(index: number, value: boolean): Promise<boolean> {
    return rsocket_send_requestResponse(`${index};${value}`, "set", {
        onNext(response: string, isComplete: boolean): any {
            if (response === "ratelimit") {
                console.log(`Checkbox ratelimited.`)
                return false
            } else if (response !== "ok") {
                notification(response)
                console.log(`Failed to set checkbox:`, response)
                return false
            }
            boxes.bits[index] = value
            if (boxes.clickCount != null) boxes.clickCount += 1
            if (boxes.checkedCount) value ? boxes.checkedCount += 1 : boxes.checkedCount -= 1
            return true
        },
        onError(e: any) {
            console.log(`Failed to set bit: ${index} to ${value}:`, e)
            notification(`An error occurred when saving checkbox.`)
            return false
        }
    })
}


export async function loadMetadata(ops: { userCount?: boolean }): Promise<boolean> {
    console.log(`Loading metadata.`)

    const body = new FormData()
    if (ops.userCount) body.append("userCount", "true")

    const response = await fetch(`/api/v1/checkbox/metadata`, { method: "POST", body: body })
    const text = await response.text()

    if (response.status === 200) {
        const json = parseJsonOrNull(text)

        if (json == null || json.clickCount == null || json.checkedCount == null || ops.userCount && json.userCount == null) {
            boxes.clickCount = null
            boxes.checkedCount = null
            boxes.userCount = null
            console.log(`Failed to get metadata - invalid text: `, text)
            return false
        }

        const clickCount = parseInt(json.clickCount)
        const checkedCount = parseInt(json.checkedCount)

        boxes.clickCount = clickCount
        boxes.checkedCount = checkedCount

        if (ops.userCount) {
            const userCount = parseInt(json.userCount)
            boxes.userCount = userCount
        }

        return true
    } else {
        boxes.clickCount = null
        boxes.checkedCount = null
        console.log(`Failed to get metadata ${status}:`, text)
        return false
    }
}
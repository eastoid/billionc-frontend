import { toast } from "$lib/component/util/toast/toast-stores";
import { site } from "../state/site.svelte";
import type {boxes} from "$lib/code/state/boxes.svelte"



export function notification(text: string, forLocation: typeof site.location = null) {
    if (!forLocation || forLocation === site.location) toast.push(text, { pausable: true })
}
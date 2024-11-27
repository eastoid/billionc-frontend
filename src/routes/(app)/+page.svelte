<script lang="ts">
    import { onDestroy, onMount } from "svelte";
    import {site} from "$lib/code/state/site.svelte"
    import {rsocket_connect, rsocket_disconnect, rsocket_send_requestResponse} from "$lib/code/connection/rsocket/rsocket"
    import {boxes} from "$lib/code/state/boxes.svelte"
    import Checkboxes from "$lib/component/app/Checkboxes.svelte"

    onMount(() => {
        site.location = "boxes"
        
        rsocket_connect({})
        return () => {
            rsocket_disconnect()
        }
    })

    onDestroy(() => {
    })
    
</script>


<div class="w-full h-full flex flex-col">
    {#if !boxes.limitedSession}
        <Checkboxes></Checkboxes>
    {:else}
        <p class="text-xl m-auto">Sorry, you have too many sessions open.</p>
    {/if}
</div>
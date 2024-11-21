<script lang="ts">
    
    import {onMount} from "svelte"
    import {fetchWrap, messageOrNull, parseJsonOrNull} from "$lib/code/util/util.svelte"
    import {notification} from "$lib/code/util/notification"

    let authenticated = $state(false)
    
    onMount(() => {
        checkAuthentication()
    })
    
    async function checkAuthentication() {
        await fetchWrap({
            path: "/api/v1/admin/auth",
            body: new FormData(),
            on200: (text) => {
                authenticated = true
            },
            onNon200: (text, status) => {
                authenticated = false
            },
            onException: (e) => {
                console.log(e)
                authenticated = false
            }
        })
    }
    
    let block_persist = $state(false)
    async function submit_persistData() {
        if (block_persist) return
        block_persist = true
        
        await fetchWrap({
            path: "/api/v1/admin/persist",
            body: new FormData(),
            on200: (text) => {
                notification(`Persisted data.`)
            },
            onNon200: (text, status) => {
                const json = parseJsonOrNull(text)
                const message = messageOrNull(json)
                console.log(status, text)
                
                if (message) {
                    notification(message)
                } else {
                    notification(`${status} - no error message`)
                }
            },
            onException: e => {
                console.log(e)
                notification(e)
            }
        })
        
        block_persist = false
    }
    
</script>

{#if authenticated === true}
    <div class="size-full flex flex-col items-center justify-center gap-8">
        <a href="/" class="underline">Go to checkboxes</a>
        <h1 class="text-xl">Billionc admin</h1>
        <button on:click={submit_persistData} disabled={block_persist} class="outline-input-button">Persist data</button>
    </div>
{:else}
    <p>404</p>
    <p>:p</p>
{/if}
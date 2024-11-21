<script lang="ts">

    import {fetchWrap, messageOrNull, parseJsonOrNull} from "$lib/code/util/util.svelte"
    import {notification} from "$lib/code/util/notification"
    import {goto} from "$app/navigation"

    let block = $state(false)
    let passwordInput = $state("")
    let totpInput = $state("")
    
    async function submit() {
        if (block) return
        block = true
        
        try {
            const body = new FormData()
            body.append("password", passwordInput)
            body.append("totp", totpInput)
            
            await fetchWrap({
                path: "/api/v1/admin/login",
                body: body,
                on200: (text) => {
                    goto("/admin")
                },
                onNon200: (text, status) => {
                    const json = parseJsonOrNull(text)
                    const msg = messageOrNull(json)
                    
                    if (msg) { notification(msg) } else { notification(`Failed. No error message. (${status})`) }
                    console.log(status, text)
                },
                onException: (e) => {
                    notification(`Local exception: \n${e}`)
                    console.log(e)
                }
            })
        } finally {
            block = false
        }
    }
    
</script>


<div class="size-full flex flex-col items-center justify-center gap-8">
    <h1 class="text-3xl">Admin Login</h1>
    
    <form on:submit|preventDefault={submit} class="flex flex-col gap-5 size-fit">
        <input bind:value={passwordInput} class="outline-input-field" type="password" minlength="8" maxlength="256" required title="password" placeholder="password">
        <input bind:value={totpInput} class="outline-input-field" type="text" minlength="6" maxlength="6" required title="totp" placeholder="totp">
        <button disabled={block} title="submit" type="submit" class="outline-input-button">Login</button>
    </form>
    
    <a href="/" class="hover:underline focus-underline">Go to homepage</a>
</div>
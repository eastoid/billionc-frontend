<script lang="ts">
    import { onMount } from "svelte";
    import "../app.css"
    import {site} from "$lib/code/state/site.svelte"
    import {getBreakpoint} from "$lib/code/util/ui"
    import {debounceFunction} from "$lib/code/util/util.svelte"
    import {PlausibleAnalytics} from "@accuser/svelte-plausible-analytics"

    onMount(() => {
        calculateBreakpoint()
    })

    let { children } = $props()
    
    $effect(() => {
        const lightMode = site.lightMode
        console.log(`Toggled: ${lightMode ? 'light' : 'dark'} mode`)
        const html = document.documentElement
        if (lightMode) {
            html.setAttribute("data-mode", "light")
        } else {
            html.setAttribute("data-mode", "dark")
        }
    })

    const debouncedOnResize = debounceFunction(calculateBreakpoint, 100, 400)
    function calculateBreakpoint() {
        const width = window.innerWidth
        const breakpoint = getBreakpoint(width)
        site.breakpoint = breakpoint
    }
    
</script>

<svelte:window on:resize={debouncedOnResize}></svelte:window>

<PlausibleAnalytics
        apiHost="https://plausible.phonescausebraincancer.org"
        compat={false}
></PlausibleAnalytics>

<div id="layout-root" class="contents">
    {@render children()}
</div>
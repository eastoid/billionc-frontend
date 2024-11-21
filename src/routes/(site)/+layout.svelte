<script lang="ts">
    import { dev } from '$app/environment';
    import { site } from '$lib/code/state/site.svelte';
    import { onLoad } from '$lib/code/util/onload';
    import Footer from '$lib/component/site/Footer.svelte';
    import MobileNavBar from '$lib/component/site/MobileNavBar.svelte';
    import NavBar from '$lib/component/site/NavBar.svelte';
    import SvelteToast from '$lib/component/util/toast/SvelteToast.svelte';
    import { onMount } from 'svelte';
    
    let { children } = $props()

    const options = {
        duration: 5000,
    }

    onMount(async () => {
        site.location = "site"
        onLoad()
    })


</script>

<div id="layout-site" class="contents">
    <div class="w-full min-h-full flex flex-col gap-[7rem] pb-0 sm:pb-[4.5rem]">
        <nav class="fixed z-10 top-0 left-0 pointer-events-none w-screen h-[100svh] shrink-0 sm:hidden">
            <div class="w-[60.5rem] max-w-full px-2 pointer-events-auto mx-auto h-[4.875rem] mt-[1.5rem]">
                <NavBar></NavBar>
            </div>
        </nav>

        <div class="flex flex-col gap-[5rem] sm:gap-[3rem] pt-[11rem] sm:pt-[8rem] overflow-y-auto flex-grow">
            <noscript class="flex items-center justify-center gap-1 rounded px-6 py-5 bg-black size-fit mx-auto shrink-0 sm:-mt-[6rem]">
                <span class="text-orange-400 text-[2rem] select-none">⚙️</span>
                <p>Debounce requires javascript enabled for basic functionality.</p>
            </noscript>

            <main id="page-slot" class="min-h-fit w-full flex-grow flex flex-col">
                {@render children()}
            </main>

            <footer class="w-[60.5rem] max-w-full mx-auto px-2 xs:px-6 h-fit flex justify-center shrink-0 mt-auto">
                <Footer />
            </footer>
        </div>

        <nav class="hidden sm:block fixed w-full h-[4.5rem] left-0 bottom-0">
            <MobileNavBar></MobileNavBar>
        </nav>
    </div>


    <SvelteToast {options} />


    {#if dev}
        <div class="fixed left-0 top-0 h-full flex flex-col justify-center pointer-events-none">
            <div class="size-fit bg-white text-black flex flex-col gap-4 font-bold p-2 px-3">
                <p class="hidden 2xs:block">2xs</p>
                <p class="hidden xs:block 2xs:hidden">xs</p>
                <p class="hidden sm:block xs:hidden">sm</p>
                <p class="hidden md:block sm:hidden">md</p>
                <p class="hidden lg:block md:hidden">lg</p>
                <p class="hidden 2lg:block lg:hidden">2lg</p>
                <p class="hidden xl:block 2lg:hidden">xl</p>

                <p class="xl:hidden 2xl:hidden">-</p>

                <p class="hidden 2xl:block 3xl:hidden">2xl</p>
                <p class="hidden 3xl:block 2xl:hidden">3xl</p>
            </div>
        </div>
    {/if}
</div>
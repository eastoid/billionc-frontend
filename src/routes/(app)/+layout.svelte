<svelte:head>
    <Head_Noindex />
</svelte:head>

<script lang="ts">
	import Head_Noindex from './../../lib/component/site/head/Head_Noindex.svelte'
    import {onDestroy, onMount, type Snippet} from "svelte"
    import SvelteToast from "../../lib/component/util/toast/SvelteToast.svelte"
    import {dev} from "$app/environment"

    let { children }: { children: Snippet<[]> } = $props()

    let mounted = $state(false)
    
    onMount(() => {

        return () => {
        }
    })

    onDestroy(async () => {
    })

    const toastOptions = {
        duration: 5000,
    }

</script>

<div id="layout-app" class="contents">
    <nav>
    </nav>

    <main id="page-slot" class="w-full h-full flex flex-col">
        {@render children()}
    </main>
    
    
    <SvelteToast options={toastOptions} />

    {#if dev}
        <div class="fixed left-0 top-0 h-full flex flex-col justify-center pointer-events-none z-30">
            <div class="size-fit bg-white text-black flex flex-col gap-4 font-bold p-2 px-3 mt-[30vh]">
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
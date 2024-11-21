<script lang="ts">
	import { fade } from 'svelte/transition';
    import { page } from "$app/stores";
    import { goto } from '$app/navigation';
    import { site } from '$lib/code/state/site.svelte';


    let navOpen = false
    function toggle() {
        navOpen = !navOpen
    }

    function disable() {
        navOpen = false
    }

    const links = [
        { name: "Technical", href: "/technical" },
        { name: "Register", href: "/register" },
        { name: "Login", href: "/login" },
        { name: "FAQ", href: "/faq" },
        { name: "Home", href: "/home" },
    ]

    async function openPage(href: string) {
        await goto(href)
        disable()
    }

</script>


<div class="size-full bg-neutral-950 flex items-center justify-between relative border-t border-neutral-800">
    <div aria-hidden="true" on:click={disable} class="shrink-0 pl-6 flex">
        <a title="Go to homepage" href="/home" class="text-neutral-300 font-medium text-xl hover:text-orange-400">Debounce 2.0</a>
    </div>

    <div aria-hidden="true" on:click={disable} class="w-full h-full"></div>

    <div class="h-full aspect-square text-4xl select-none shrink-0 flex items-center gap-4">
        {#if !site.isOnline}
            <p class="text-base text-neutral-400">Offline</p>
        {/if}
        <a title="Open navigation menu" href="/sitemap" on:click|preventDefault={toggle} class="h-full aspect-square inline-block">
            {#if !navOpen}
                <button class="size-full">
                    ☰
                </button>
            {:else}
                <button class="size-full pointer-events-none" disabled={navOpen}>
                    ✕
                </button>
            {/if}
        </a>
    </div>

    <!-- Navigation pop up menu -->
    {#if navOpen}
        <div class="absolute right-0 bottom-0 pointer-events-none w-full h-[100svh] flex items-end justify-end pb-[4.5rem]">
            <div aria-hidden="true" transition:fade={{ duration: 0, delay: 0 }} class="absolute z-10 size-full pointer-events-auto opacity-0" on:click={disable} on:scroll={disable} on:keydown={disable} on:wheel|passive={disable} on:pointerdown={disable}></div>

            <div transition:fade={{ duration: 35, delay: 0 }} class="z-20 w-fit h-fit bg-neutral-950 text-[1.125rem] px-9 py-8 flex flex-col gap-4 items-end rounded-tl-lg pointer-events-auto">
                <div class="size-fit rounded-tl-lg flex flex-col gap-4 items-end">
                    {#each links as link}
                        <a title="Go to {link.name}" on:click|preventDefault={() => { openPage(link.href) }} href={link.href} class="{$page.url.pathname === link.href ? 'text-orange-400 pointer-events-none underline' : 'hover:text-orange-400'} outline-none select-none w-full text-end" draggable="false">{link.name}</a>
                    {/each}
                </div>
            </div>
        </div>
    {/if}
</div>
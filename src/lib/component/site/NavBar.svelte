<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
    import { site } from '$lib/code/state/site.svelte';

    const hrefs = [
        { href: "/home", name: "Home" },
        { href: "/faq", name: "FAQ" },
        { href: "/technical", name: "Technical" },
        { href: "/register", name: "Register" },
        { href: "/login", name: "Login" },
    ]

</script>

<style>
    :global(.nav-button) {
        @apply overflow-hidden text-lg disabled:underline disabled:pointer-events-none disabled:text-orange-400 hover:underline;
    }
</style>

<div class="w-full overflow-hidden flex items-center justify-between rounded-lg bg-neutral-950 select-none border border-neutral-800 h-full">
    <div class="w-fit h-full py-6 pl-6 flex gap-6 items-center">
        <a title="Go to homepage" href="/home" class="contents">
            <img src="/icons/icon-plain.svg" alt="logo" class="aspect-square h-full" draggable="false">
        </a>
        {#if !site.isOnline}
            <p class="text-neutral-400">Offline</p>
        {/if}
    </div>

    <div class="flex items-center gap-8 py-6 pr-10">
        {#each hrefs as link}
            {@const isCurrent = $page.url.pathname === link.href}
            <button on:click={() => { goto(link.href) }} class="nav-button" disabled={isCurrent} tabindex="-1">
                <a title="Go to {link.name} page" on:click|preventDefault|stopPropagation={() => { goto(link.href) }} href={link.href} class="text-lg w-full focus-underline focus-visible:text-orange-400" tabindex={isCurrent ? -1 : 0} aria-disabled={isCurrent}>
                    {link.name}
                </a>
            </button>
        {/each}
    </div>
</div>
<script lang="ts">
    import { page } from "$app/stores";

    const links = [
        { name: "Technical", href: "/technical" },
        { name: "Privacy policy", href: "/privacy" },
        { name: "Terms of service", href: "/terms" },
    ]

</script>


<div class="max-w-full w-[33.125rem] flex items-center py-3 border-t border-neutral-700">
    <div class="text-neutral-500 flex items-center justify-between sm:justify-center w-full text-sm select-none">
        <div class="sm:hidden">
            <a title="Go to homepage" class="hover:text-orange-400 focus-visible:text-orange-400 focus-underline" href="/home">Debounce 2.0</a>
        </div>
        <div class="flex items-center xs:justify-evenly gap-8 xs:gap-0 xs:w-full">
            {#each links as link}
                <button tabindex="-1" class="hover:text-neutral-300 disabled:pointer-events-none size-fit disabled:underline disabled:text-orange-400" disabled={$page.url.pathname === link.href}>
                    <a title="Go to {link.name} page" class="focus-visible:text-neutral-100 focus-underline" href={link.href}>{link.name}</a>
                </button>
            {/each}
        </div>
    </div>
</div>
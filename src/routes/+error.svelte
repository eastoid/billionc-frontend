<script lang="ts">
	import { page } from '$app/stores';
    import { onMount } from 'svelte';
    const status = $page.status
</script>

<div class="w-full h-full flex flex-col gap-4 items-center justify-center">
    <h1>
        {#if status === 404}
            This page does not exist
        {:else if status === 500}
            A server error has occurred.
        {/if}
    </h1>
    <p class="text-xl">{status}</p>
    <a class="underline" href="/home">Go to homepage</a>
</div>

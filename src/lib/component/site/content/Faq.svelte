<script lang="ts">
    import { getRandomString } from '$lib/code/crypto/util';
    import { createEventDispatcher, onMount } from 'svelte';
    import type { Writable } from 'svelte/store';
	import { slide } from 'svelte/transition';

    export let isFirst: boolean = false
    export let isLast: boolean = false
    export let question: string
    export let index: number
    export let currentIndex: Writable<null | number>

    let isOpen = false
    const id = `faq-${index}`
    const answerId = `${id}-answer`
    const questionId = `${id}-question`

    const dispatch = createEventDispatcher()

    function toggle() {
        isOpen = !isOpen
        if (isOpen) dispatch("toggle", index)
    }

    onMount(() => {
        const uns = currentIndex.subscribe(newIndex => {
            if (index !== newIndex && isOpen) toggle()
        })

        return () => {
            uns()
        }
    })
</script>


<button aria-expanded={isOpen} aria-controls={answerId} on:click={toggle} class="w-full {isFirst ? "rounded-t-lg" : ""} {isLast ? "rounded-b-lg" : ""} bg-[#101010] flex flex-col px-8 py-6 gap-6 cursor-pointer text-start">
    <div class="w-full flex justify-between items-center">
        <p id={questionId} class="text-[1.1rem] duration-75 {isOpen ? "text-orange-300" : ""}">{question}</p>
        <div class="text-[1.5rem] leading-none fill-neutral-500 duration-75 select-none {isOpen ? "rotate-90" : ""}">
            <div class="h-[1.5rem]">
                <svg class="h-full aspect-square">
                    <use href="#triangle-icon"></use>
                </svg>
            </div>
        </div>
    </div>

    <noscript id={answerId} role="region" aria-labelledby={questionId} class="w-full text-neutral-300">
        <slot></slot>
    </noscript>

    {#if isOpen}
        <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
        <div on:click|stopPropagation class="w-full cursor-auto text-neutral-300 text-base text-balance" transition:slide={{duration: 75}} id={answerId} role="region" aria-labelledby={questionId}>
            <slot></slot>
        </div>
    {/if}
</button>
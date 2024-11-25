<script lang="ts">
    import {onMount, type SvelteComponentTyped} from "svelte"
    import {boxesThatFit, remToPx} from "$lib/code/checkboxes"
    import {debounceFunction, onConditionMet, onElementVisible, rap, usePrint} from "$lib/code/util/util.svelte"
    import CustomVList from "$lib/component/util/virtua/CustomVList.svelte"
    import {boxes_loadChunk, boxes_unsubscribeChunk} from "$lib/code/checkboxes/loading"
    import {boxes} from "$lib/code/state/boxes.svelte"
    import {loadMetadata, updateCheckbox} from "$lib/code/checkboxes/actions"
    import {CHUNK_SIZE, chunkIndexOf} from "$lib/code/checkboxes/util"

    const CHUNK_COUNT = 5_000_000
    const BOX_COUNT = 1_000_000_000
    const ROWS_PER = 5
    const FIXED_PER_ROW = 86

    let vListElement: InstanceType<typeof CustomVList> & SvelteComponentTyped<any>
    let activelyScrolling = $state(false)
    
    let fixedWidth: boolean = $state(false)
    
    let rowSize: number | null = $state(null)
    let perRow: number | null = $derived(fixedWidth ? FIXED_PER_ROW : rowSize)
    let rowCount: number | null = $derived.by(() => {
        if (!perRow) return null
        return Math.ceil(BOX_COUNT / perRow!)
    })
    let rowCountArray: any[] | null = $derived.by(() =>{
        if (!rowCount) return null
        let array: any[] = []
        array.length = Math.ceil(rowCount / ROWS_PER)
        return array
    })
    const boxWidth = 1.25
    const padding = 0.125
    const gap = 0.125
    const rowHeight = 1.375
    let listRendered = $state(false)
    let rowHeightPx: number | null = $state(null)

    const visibleRows = new Set<number>()
    const pendingChunkLoad = new Set<number>()
    const pendingChunkUnsub = new Set<number>()

    let searchPending = $state(false)
    let indexInput: number | undefined = $state()
    let searchedIndex = $derived(indexInput != null ? indexInput - 1 : null)
    let searchedRowIndex = $derived(searchedIndex != null && perRow != null ? Math.ceil(searchedIndex / perRow) : null)

    onMount(() => {
        calculateNumbers()
        onConditionMet(() => boxes.rsocket.isConnected, () => {
            boxes_loadChunk(0)
            loadMetadata({userCount: true})
        })
    })
    
    function calculateNumbers() {
        const width = window.innerWidth
        // Account for scrollbar
        const actualWidth = width - 10

        rowSize = boxesThatFit(boxWidth, padding, gap, actualWidth)
        rowHeightPx = remToPx(rowHeight)
    }
    
    $effect(() => {
        if (rowCount && perRow && rowHeightPx) {
            console.log(`Checkboxes: 1000000000\nRows: ${rowCount}\nPer row: ${perRow}\nRow px: ${rowHeightPx}`)
        }
    })

    const debouncedResize = debounceFunction(onResize, 200, 1000)
    function onResize() {
        calculateNumbers()
    }


    function onVisibleRow(_: HTMLElement, rowIndex: number) {
        if (!perRow) return
        if (!boxes.rsocket.isConnected) {
            console.log(`onVisibleRow: RSocket is not connected.`)
            onConditionMet(() => boxes.rsocket.isConnected, () => {  onVisibleRow(_, rowIndex) })
            return
        }

        visibleRows.add(rowIndex)
        if (rowIndex === searchedRowIndex) {
            console.log(`Moved to searched row index.`)
            searchPending = false
        }

        const box = Math.max(rowIndex - 1, 0) * perRow
        const chunk = chunkIndexOf(box)
        
        const timeout = setTimeout(() => { processVisibleRow(chunk) }, 100)

        return {
            destroy() {
                if (perRow) {
                    boxes.removeRange(rowIndex * perRow, perRow)
                } else {
                    boxes.setBits({})
                }
                if (!pendingChunkUnsub.has(chunk)) {
                    pendingChunkUnsub.add(chunk)
                    boxes_unsubscribeChunk(chunk).catch((e) => console.log(e)).then(() => {
                        pendingChunkUnsub.delete(chunk)
                    })
                }
                visibleRows.delete(rowIndex)
                clearTimeout(timeout)
            }
        }
    }

    async function processVisibleRow(chunk: number) {
        if (!perRow || !rowCount || !vListElement) return console.log(`Failed to process visible row. Something is null.`)

        if (pendingChunkLoad.has(chunk)) return
        pendingChunkLoad.add(chunk)

        try {
            await boxes_loadChunk(chunk)
        } finally {
            pendingChunkLoad.delete(chunk)
        }
    }

    function submit_goToIndex() {
        searchPending = true
        setTimeout(() => {
            if (searchPending) {
                console.log(`Virtua index search timeout (10 seconds).`)
                searchPending = false
            }
        }, 10000)
    }

    function onSearchOverlayVisible() {
        if (indexInput == null || searchedIndex == null || perRow == null || searchedRowIndex == null) {
            console.log(`Something is null - ${indexInput}, ${searchedIndex}, ${perRow}, ${searchedRowIndex}`)
            searchPending = false
            return
        }
        if (visibleRows.has(searchedRowIndex)) {
            searchPending = false
            return console.log(`Row is already visible`)
        }

        if (vListElement) {
            const virtuaIndex = Math.max((searchedRowIndex / ROWS_PER) - 2, 0)
            console.log(`Going to checkbox: ${searchedIndex}. Row ${searchedRowIndex}.\n(Scrolling to row ${virtuaIndex})`)

            // Add 10 rows because Virtua scrolls wrong
            vListElement.scrollToIndex(virtuaIndex)
        }
    }

    async function handleCheckboxClick(index: number) {
        const data = boxes.bits[index]
        if (data == null) return

        const newState = !data
        const result = await updateCheckbox(index, newState)

        if (!result) {
            const updatedData = boxes.bits[index]
            if (updatedData != null) {
                boxes.setBit(index, data)
            }
        }
    }
    
    function onHeaderVisible() {
        console.log(`List rendered.`)
        listRendered = true
    }
    
</script>

<svelte:window on:resize={debouncedResize}></svelte:window>

<!-- Vlist item -->
{#snippet row(rowIndex)}
    {@const realIndex = rowIndex + 1}
    {@const _perRow = perRow ?? 0}
    <div use:onVisibleRow={rowIndex}
         class="r"
         class:fr={fixedWidth}
         class:thousand={(realIndex) % 250 === 0}
         title={`Row ${realIndex}`}>
        {#key perRow}
            {#each { length: _perRow } as _, i}
                {@const boxIndex = (rowIndex * _perRow) + i}
                {#if boxIndex < BOX_COUNT}
                    <input on:click={() => { handleCheckboxClick(boxIndex) }}
                           disabled={boxes.bits[boxIndex] == null}
                           bind:checked={boxes.bits[boxIndex]}
                           type="checkbox"
                           class:box-searched={boxIndex === searchedIndex}
                           class=""
                           title={`${boxIndex + 1}`}
                    />
                    <!-- class:box-millionth={(realIndex) % 1_000_000 === 0} -->
                {/if}
            {/each}
        {/key}
    </div>
{/snippet}

{#if rowCount != null && perRow != null && rowHeightPx && rowCountArray && boxes.rsocket.isConnected}
    <div class="fixed flex pointer-events-none w-full h-[100svh] items-end justify-end z-10 top-0 left-0 pr-[10px] text-left">
        <form class="relative w-fit flex items-center bg-neutral-200 dark:bg-neutral-800 border-t border-x border-neutral-500 dark:border-neutral-700 px-1 py-1 rounded-t-md pointer-events-auto gap-x-1 h-[2rem]" on:submit={submit_goToIndex}>
            <div title="Enable fixed width for checkboxes" class="flex gap-1 px-1 select-none">
                <input type="checkbox" bind:checked={fixedWidth}>
                <p>fixed</p>
            </div>
            
            {#if searchPending}
                <div use:onElementVisible={onSearchOverlayVisible} class="absolute top-0 left-0 bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center border-t border-x border-neutral-500 dark:border-neutral-700 size-full">
                    <p>Searching...</p>
                </div>
            {/if}
            
            <input required readonly={searchPending} bind:value={indexInput} max="1000000000" min="1" title="Enter checkbox number to navigate to" type="number" class="w-[13ch] h-full px-[0.5ch] bg-neutral-900 focus-outline-500" placeholder="12345">
            <button type="submit" class="hover:underline hover:text-blue-500">Go</button>
        </form>
    </div>
    
        <CustomVList bind:activelyScrolling={activelyScrolling} {onHeaderVisible} bind:this={vListElement} data={rowCountArray} style={``} getKey={(_, i) => i} classes={"scrollbar-10 scrollbar-stable box-border checkbox-styles"} overscan={1} itemSize={1}>
            {#snippet children(_, _index)}
                {#if listRendered && !searchPending}
                    {@const baseIndex = _index * 5}
                    {@render row(baseIndex)}
                    {@render row(baseIndex + 1)}
                    {@render row(baseIndex + 2)}
                    {@render row(baseIndex + 3)}
                    {@render row(baseIndex + 4)}
                {:else}
                    <div class="p"></div>
                {/if}
            {/snippet}
        </CustomVList>
{:else}
    <div class="w-full flex flex-col items-center justify-center h-[100svh] gap-8">
        <div class="flex flex-col items-center">
            <h1 class="text-3xl">One billion checkboxes</h1>
            <p class="text-xl">Loading... This takes a few seconds</p>
        </div>
        <img src="/tomjerry.gif" class="w-auto h-[5rem] max-w-full">
        <!-- <p class="text-lg"></p> -->
    </div>
{/if}


<style>
    /* Containers */
    /* Row container */
    :global(.r) {
        @apply w-full flex gap-[0.125rem] py-[0.0625rem] justify-center h-[1.375rem];
    }
    :global(.fr) {
        width: fit-content !important;
        @apply mx-auto;
    }
    
    :global(.p) {
        height: calc(1.375rem * 5);
    }
    /* Thousandth row */
    :global(.thousand) {
        @apply bg-neutral-400;
    }
    /* Thousandth row dark */
    :global(.thousand:where([data-mode="dark"], [data-mode="dark"] *)) {
        @apply bg-neutral-700;
    }

    /* Outlines */
    :global(.box-searched) {
        @apply outline outline-2 outline-red-500 rounded-[4px];
    }
    :global(.box-millionth) {
        @apply outline outline-2 outline-yellow-700 rounded-[4px];
    }

    /* Checkbox styles */
    :global(.checkbox-styles input[type="checkbox"]) {
        -webkit-appearance: none;
        -moz-appearance: none;
        -o-appearance: none;
        appearance: none;
        box-shadow: none;

        /* Light mode */
        @apply shrink-0 size-5 bg-neutral-200 rounded-[4px] border border-neutral-300;
    }

    :global(.checkbox-styles input[type="checkbox"]:where([data-mode="dark"], [data-mode="dark"] *)) {
        /* Dark mode */
        /*border-color: #212121;*/
        @apply bg-neutral-900 border-0;
    }

    :global(.checkbox-styles input[type="checkbox"]:checked) {
        @apply bg-blue-500 relative;

        &::after {
            @apply content-['✓'] text-[1.2rem] leading-none text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2;
        }
    }

    /* Search field */
    input[type="number"] {
        -moz-appearance: textfield;
    }
    input[type="number"]::-webkit-outer-spin-button,
    input[type="number"]::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
    }
</style>
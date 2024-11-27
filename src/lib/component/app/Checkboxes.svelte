<script lang="ts">
    import {onMount, type SvelteComponentTyped} from "svelte"
    import {boxesThatFit, remToPx} from "$lib/code/checkboxes"
    import {debounceFunction, getOrDefault, onConditionMet, onElementVisible, printFunc, rap, usePrint} from "$lib/code/util/util.svelte"
    import CustomVList from "$lib/component/util/virtua/CustomVList.svelte"
    import {boxes_loadChunk, boxes_unsubscribeChunk} from "$lib/code/checkboxes/loading"
    import {boxes} from "$lib/code/state/boxes.svelte"
    import {loadMetadata, updateCheckbox} from "$lib/code/checkboxes/actions"
    import {CHUNK_SIZE, chunkIndexOf} from "$lib/code/checkboxes/util"
    import {site} from "$lib/code/state/site.svelte"

    const CHUNK_COUNT = 5_000_000
    const BOX_COUNT = 1_000_000_000
    const ROWS_PER = 5
    const FIXED_PER_ROW = 86

    let vListElement: InstanceType<typeof CustomVList> & SvelteComponentTyped<any>
    let activelyScrolling = $state(false)
    let virtuaScrolling = $state(false)
    
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
    $effect(() => { if (!virtuaScrolling) { searchPending = false } })

    let renderRows = $derived(listRendered && (virtuaScrolling && activelyScrolling || !virtuaScrolling) && !searchPending)
    // $inspect(activelyScrolling)
    // $inspect(renderRows)
    // $effect(() => { console.log(`[${renderRows}]    ${listRendered}  (${virtuaScrolling} && ${activelyScrolling} || ${!virtuaScrolling})  ${!searchPending}`) })
    
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

        const box = Math.min(Math.max(rowIndex - 1, 0) * perRow, 999_999_999) // First checkbox index for row
        const chunk = chunkIndexOf(box) // Chunk index
        
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
        if (indexInput == null || searchedIndex == null || perRow == null || searchedRowIndex == null) {
            console.log(`Something is null - ${indexInput}, ${searchedIndex}, ${perRow}, ${searchedRowIndex}`)
            searchPending = false
            return
        }
        if (visibleRows.has(searchedRowIndex)) {
            return console.log(`Row is already visible`)
        }

        searchPending = true
        if (vListElement) {
            const virtuaIndex = Math.ceil(Math.max((searchedRowIndex / ROWS_PER) - 2, 0))
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
                {/if}
            {/each}
        {/key}
    </div>
{/snippet}

{#if rowCount != null && perRow != null && rowHeightPx && rowCountArray && boxes.rsocket.isConnected}
    <!-- FLOATING ITEM -->
    <div class="fixed flex pointer-events-none w-full h-[100svh] items-end justify-end z-10 top-0 left-0 pr-[10px] text-left">
        <form class="relative w-fit flex items-center bg-neutral-200 dark:bg-neutral-800 border-t border-x border-neutral-500 dark:border-neutral-700 px-1 py-1 rounded-t-md pointer-events-auto gap-x-1 h-[2rem]" on:submit={submit_goToIndex}>
            <div title="Enable fixed width for checkboxes" class="flex gap-1 px-1 select-none">
                <input type="checkbox" bind:checked={fixedWidth}>
                <p>fixed</p>
            </div>
            
            <input required readonly={searchPending} bind:value={indexInput} max="1000000000" min="1" title="Enter checkbox number to navigate to" type="number" class="w-[13ch] h-full px-[0.5ch] bg-neutral-900 focus-outline-500" placeholder="12345">
            <button type="submit" class="hover:underline hover:text-blue-500">Go</button>
        </form>
    </div>
    
    <!-- HEADER -->
    <div class="w-full h-[2rem] shrink-0 px-2 py-1 flex items-center justify-between">
        <div class="flex justify-center sm:justify-start gap-6">
            <p title="Global click count: {getOrDefault(boxes.clickCount, 'Unknown')}" class="size-fit">{boxes.clickCount} <span class="hidden sm:inline">☛</span><span class="sm:hidden">clicks</span></p>
            <p title="Global boxes checked: {getOrDefault(boxes.checkedCount, 'Unknown')}" class="size-fit">{boxes.checkedCount} <span class="hidden sm:inline">✓</span><span class="sm:hidden">checked</span></p>
            <p title="Online users: {getOrDefault(boxes.userCount, 'Unknown')}" class="size-fit">{boxes.userCount} <span class="hidden sm:inline">웃</span><span class="sm:hidden">{boxes.userCount === 1 ? 'person' : 'people'}</span></p>
        </div>
        <div class="flex w-fit">
            <button title="Enable {site.lightMode ? 'dark' : 'light'} mode" on:click={() => { site.lightMode = !site.lightMode }} class="px-2 rounded bg-neutral-800 text-neutral-100"><span class="sm:hidden">Toggle</span> {site.lightMode ? 'dark' : 'light'} theme</button>
        </div>
    </div>
    
    <!-- CHECKBOXES -->
    <div class="w-full flex-grow">
        <CustomVList onscroll={()=>{ virtuaScrolling = true }} onscrollend={()=>{ virtuaScrolling = false }} bind:activelyScrolling={activelyScrolling} {onHeaderVisible} bind:this={vListElement} data={rowCountArray} style={``} getKey={(_, i) => i} classes={"scrollbar-10 scrollbar-stable box-border checkbox-styles"} overscan={2} itemSize={1}>
            {#snippet children(_, _index)}
                {#if renderRows}
                    {@const baseIndex = _index * 5}
                    <div class="c">
                        {@render row(baseIndex)}
                        {@render row(baseIndex + 1)}
                        {@render row(baseIndex + 2)}
                        {@render row(baseIndex + 3)}
                        {@render row(baseIndex + 4)}
                    </div>
                {:else}
                    <div class="p"></div>
                {/if}
            {/snippet}
        </CustomVList>
    </div>
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
        @apply w-full flex gap-x-[0.125rem] py-[0.0625rem] justify-center h-[1.375rem];
    }
    :global(.fr) {
        width: fit-content !important;
        @apply mx-auto;
    }
    
    :global(.p) {
        height: calc(1.375rem * 5);
    }

    :global(.c) {
        height: calc(1.375rem * 5);
        @apply w-full flex flex-col;
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